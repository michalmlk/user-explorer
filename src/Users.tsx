import { useEffect, useState } from "react";
import { searchUsers, type Page, type User } from "./api";
import styles from "./Users.module.css";
import { useDebouncedValue } from "./useDebouncedValue";

type UseUsersOptions = {
    query: string;
};

type UseUsersState =
    | { status: "loading" }
    | { status: "success"; empty: boolean; users: Page<User> }
    | { status: "error"; error: Error };

type UseUsersResult = UseUsersState & {
    refetch: () => void;
};

const useUsers = ({ query }: UseUsersOptions): UseUsersResult => {
    const [settled, setSettled] = useState<{
        key: string;
        state: Exclude<UseUsersState, { status: "loading" }>;
    } | null>(null);

    const [triggerCount, setTriggerCount] = useState(0);

    const key = `${triggerCount}:${query}`;

    useEffect(() => {
        const controller = new AbortController();

        searchUsers(query, { signal: controller.signal })
            .then((result) => {
                setSettled({
                    key,
                    state: {
                        status: "success",
                        empty: result.items.length === 0,
                        users: result,
                    },
                });
            })
            .catch((e: unknown) => {
                if (e instanceof DOMException && e.name === "AbortError") return;
                setSettled({ key, state: { status: "error", error: e as Error } });
            });

        return () => {
            controller.abort();
        };
    }, [query, key]);

    const state: UseUsersState = settled && settled.key === key ? settled.state : { status: "loading" };

    return {
        ...state,
        refetch: () => setTriggerCount((c) => c + 1),
    };
};

export function Users() {
    const [inputValue, setInputValue] = useState<string>("");

    const debouncedValue = useDebouncedValue({ value: inputValue });

    const data = useUsers({ query: debouncedValue });

    return (
        <div className={styles.usersContainer}>
            <h1>Users</h1>
            <div className={styles.userSearchContainer}>
                <label htmlFor="user-search">Search users:</label>
                <input
                    className={styles.userInput}
                    type="text"
                    value={inputValue}
                    id="user-search"
                    onChange={(e) => setInputValue(e.target.value)}
                />
            </div>
            {data.status === "error" && (
                <>
                    <p>Error: {data.error?.message}</p>
                    <button onClick={data.refetch}>Retry</button>
                </>
            )}
            {data.status === "loading" && <p>Loading...</p>}
            {data?.status === "success" && data?.empty && <p>No users found.</p>}
            {data?.status === "success" && !data?.empty && (
                <ul className={styles.usersList}>
                    {data.users.items.map((user) => (
                        <li className={styles.userItem} key={user.id}>
                            {user.name} ({user.email})
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
