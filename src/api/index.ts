import { faker, type SexType } from "@faker-js/faker";

export type User = {
    id: string;
    name: string;
    email: string;
    company: string;
    active: boolean;
};

export type Page<T> = {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
};

export class ApiError extends Error {
    public readonly status: number;

    constructor(status: number, statusText: string) {
        super(`${status} ${statusText}`);
        this.name = "ApiError";
        this.status = status;
    }
}

/** FNV-1a — deterministyczny PRNG w [0, 1). Te same wejścia = te same wyniki. */
function hash(s: string): number {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) {
        h ^= s.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return (h >>> 0) / 0xffffffff;
}

const DB: User[] = Array.from({ length: 5000 }, (_, i) => {
    const sex = faker.person.sex() as SexType;
    const firstName = faker.person.firstName(sex);
    const lastName = faker.person.lastName(sex);

    return {
        id: faker.string.nanoid(),
        name: `${firstName} ${lastName}`,
        email: faker.internet.email({ firstName, lastName }),
        company: faker.company.name(),
        active: hash(`user-${i}`) > 0.3,
    };
});

const MIN_LATENCY = 120;
const MAX_LATENCY = 1500;
const FAILURE_RATE = 0.25;

let requestSeq = 0;

function latencyFor(key: string): number {
    const subject = key.split(":")[1] ?? ""; // "search:anna:1:20" → "anna"
    const base = MAX_LATENCY - Math.min(subject.length, 8) * 150;
    return Math.max(MIN_LATENCY, base + hash(key) * 200);
}

function abortError(): DOMException {
    return new DOMException("Aborted", "AbortError");
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
    return new Promise((resolve, reject) => {
        if (signal?.aborted) {
            reject(abortError());
            return;
        }
        const id = setTimeout(resolve, ms);
        signal?.addEventListener(
            "abort",
            () => {
                clearTimeout(id);
                reject(abortError());
            },
            { once: true },
        );
    });
}

async function respond<T>(key: string, produce: () => T, signal?: AbortSignal): Promise<T> {
    await sleep(latencyFor(key), signal);
    if (hash(`fail-${key}-${requestSeq++}`) < FAILURE_RATE) {
        throw new ApiError(500, "Internal Server Error");
    }
    return produce();
}

export function searchUsers(
    query: string,
    opts: { page?: number; pageSize?: number; signal?: AbortSignal } = {},
): Promise<Page<User>> {
    const { page = 1, pageSize = 20, signal } = opts;
    const q = query.trim().toLowerCase();

    return respond(
        `search:${q}:${page}:${pageSize}`,
        () => {
            const all = q ? DB.filter((u) => u.name.toLowerCase().includes(q) || u.email.includes(q)) : DB;
            const start = (page - 1) * pageSize;
            return {
                items: all.slice(start, start + pageSize).map((u) => ({ ...u })),
                total: all.length,
                page,
                pageSize,
                totalPages: Math.ceil(all.length / pageSize),
            };
        },
        signal,
    );
}

export function getUser(id: string, opts: { signal?: AbortSignal } = {}): Promise<User> {
    return respond(
        `user:${id}`,
        () => {
            const found = DB.find((u) => u.id === id);
            if (!found) throw new ApiError(404, "Not Found");
            return { ...found };
        },
        opts.signal,
    );
}

export function updateUser(
    id: string,
    patch: Partial<Pick<User, "name" | "company" | "active">>,
    opts: { signal?: AbortSignal } = {},
): Promise<User> {
    return respond(
        `update:${id}:${JSON.stringify(patch)}`,
        () => {
            const i = DB.findIndex((u) => u.id === id);
            if (i === -1) throw new ApiError(404, "Not Found");
            DB[i] = { ...DB[i], ...patch };
            return { ...DB[i] };
        },
        opts.signal,
    );
}
