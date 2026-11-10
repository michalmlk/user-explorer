import { useEffect, useState, type JSX } from "react";
import { searchUsers, type Page, type User } from "./api";
import styles from "./Users.module.css";
import { useDebouncedValue } from "./useDebouncedValue";

type UseUsersOptions = {
    query: string;
};

type UseUsersResult = {
    loading: boolean;
    error: Error | null;
    empty: boolean;
    users?: Page<User>;
    success: boolean;
    refetch: () => void;
};

const useUsers = ({ query }: UseUsersOptions): UseUsersResult => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [empty, setEmpty] = useState(false);
    const [users, setUsers] = useState<Page<User>>();
    const [success, setSuccess] = useState(false);
    const [triggerCount, setTriggerCount] = useState(0);

    useEffect(() => {
        searchUsers(query)
            .then((result) => {
                setLoading(false);
                setEmpty(result.items.length === 0);
                setUsers(result);
                setSuccess(true);
            })
            .catch((error) => {
                setError(error);
                setSuccess(false);
                console.error("Error fetching users:", error);
            })
            .finally(() => {
                setLoading(false);
            });

        return () => {
            setLoading(true);
            setError(null);
            setEmpty(false);
            setUsers(undefined);
            setSuccess(false);
            setTriggerCount(0);
        };
    }, [query, triggerCount]);

    return {
        loading,
        error,
        empty,
        users,
        success,
        refetch: () => setTriggerCount((c) => c + 1),
    };
};

export function Users(): JSX.Element {
    const [inputValue, setInputValue] = useState<string>("");

    const debouncedValue = useDebouncedValue({ value: inputValue });

    const { users, loading, error, empty, refetch } = useUsers({ query: debouncedValue });
    const shouldDisplayUsersList = !loading && !error && !empty;

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
            {error && (
                <>
                    <p>Error: {error.message}</p>
                    <button onClick={refetch}>Retry</button>
                </>
            )}
            {loading && <p>Loading...</p>}
            {shouldDisplayUsersList && (
                <ul className={styles.usersList}>
                    {empty && <li>No users found.</li>}
                    {users?.items.map((user) => (
                        <li className={styles.userItem} key={user.id}>
                            {user.name} ({user.email})
                        </li>
                    )) || null}
                </ul>
            )}
        </div>
    );
}
