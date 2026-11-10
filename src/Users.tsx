import { useEffect, useState, type JSX } from "react";
import { searchUsers, type Page, type User } from "./api";
import styles from "./Users.module.css";
import { useDebouncedValue } from "./useDebouncedValue";

type UseUsersOptions = {
    query: string;
};

type UseUsersState =
    | { status: "loading" }
    | { status: "success"; empty: boolean; users: Page<User> }
    | { status: "error"; error: Error | null };

type UseUsersResult = UseUsersState & {
    refetch: () => void;
};

const useUsers = ({ query }: UseUsersOptions): UseUsersResult => {
    const [state, setState] = useState<UseUsersState>({
        status: "loading",
    });

    const [triggerCount, setTriggerCount] = useState(0);

    useEffect(() => {
        const controller = new AbortController();
        setState({ status: "loading" });

        searchUsers(query, { signal: controller.signal })
            .then((result) => {
                setState({
                    status: "success",
                    empty: result.items.length === 0,
                    users: result,
                });
            })
            .catch((e: unknown) => {
                if (e instanceof DOMException && e.name === "AbortError") return;
                setState({ status: "error", error: e as Error });
            });

        return () => {
            controller.abort();
        };
    }, [query, triggerCount]);

    return {
        ...state,
        refetch: () => {
            setState((prev) => ({
                status: "loading",
                users: prev.status === "success" || prev.status === "loading" ? prev.users : undefined,
            }));
            setTriggerCount((c) => c + 1);
        },
    };
};

export function Users(): JSX.Element {
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
            <p>Debounced value: {debouncedValue}</p>
            {data.status === "error" && (
                <>
                    <p>Error: {data.error?.message}</p>
                    <button onClick={data.refetch}>Retry</button>
                </>
            )}
            {data.status === "loading" && <p>Loading...</p>}
            {data?.status === "success" && (
                <ul className={styles.usersList}>
                    {data.users.items.length === 0 && <li>No users found.</li>}
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
