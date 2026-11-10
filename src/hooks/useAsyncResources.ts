import { useEffect, useEffectEvent, useState } from "react";

type AsyncOptions = { signal: AbortSignal };

type UseAsyncResourceParams<A extends unknown[], T> = {
    fetchFn: (...args: [...A, AsyncOptions]) => Promise<T>;
    args: A;
    resourceKey: unknown[];
};

type UseAsyncResourcesState<T> =
    | { status: "loading" }
    | { status: "success"; data: T }
    | { status: "error"; error: Error };

export type UseAsyncResourcesResult<T> = UseAsyncResourcesState<T> & {
    refetch: () => void;
};

export const useAsyncResources = <A extends unknown[], T>({
    fetchFn,
    args,
    resourceKey,
}: UseAsyncResourceParams<A, T>): UseAsyncResourcesResult<T> => {
    const [settled, setSettled] = useState<{
        key: string;
        state: Exclude<UseAsyncResourcesState<T>, { status: "loading" }>;
    } | null>(null);

    const [triggerCount, setTriggerCount] = useState(0);

    const key = JSON.stringify([triggerCount, resourceKey]);

    const run = useEffectEvent((signal: AbortSignal) => fetchFn(...args, { signal }));

    useEffect(() => {
        const controller = new AbortController();

        run(controller.signal)
            .then((data) => {
                setSettled({
                    key,
                    state: {
                        status: "success",
                        data,
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
    }, [key]);

    const state: UseAsyncResourcesState<T> = settled && settled.key === key ? settled.state : { status: "loading" };

    return {
        ...state,
        refetch: () => setTriggerCount((c) => c + 1),
    };
};
