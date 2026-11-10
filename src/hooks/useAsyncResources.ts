import { useEffect, useRef, useState } from "react";

type AsyncOptions = { signal: AbortSignal };

type UseAsyncResourceParams<A extends unknown[], T> = {
    fetchFn: (...args: [...A, AsyncOptions]) => Promise<T>;
    args: A;
    resourceKey: string | readonly string[] | unknown[];
};

type UseAsyncResourcesState<T> =
    | { status: "loading" }
    | { status: "success"; empty: boolean; data: T }
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

    const argsRef = useRef(args);
    const fetchFnRef = useRef(fetchFn);
    useEffect(() => {
        fetchFnRef.current = fetchFn;
        argsRef.current = args;
    });

    useEffect(() => {
        const controller = new AbortController();

        fetchFnRef
            .current(...argsRef.current, { signal: controller.signal })
            .then((data) => {
                setSettled({
                    key,
                    state: {
                        status: "success",
                        empty: !data || (Array.isArray(data) && data.length === 0),
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
