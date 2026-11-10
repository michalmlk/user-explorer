import { useState } from "react";
import { searchUsers, type Page, type User } from "./api";
import styles from "./Users.module.css";
import { useDebouncedValue } from "./useDebouncedValue";
import { useAsyncResources, type UseAsyncResourcesResult } from "./hooks/useAsyncResources";
import { Outlet, useNavigate } from "react-router";

type UseUsersOptions = {
    query: string;
};

const useUsers = ({ query }: UseUsersOptions): UseAsyncResourcesResult<Page<User>> => {
    const resource = useAsyncResources({
        fetchFn: searchUsers,
        args: [query],
        resourceKey: ["users", query],
    });

    return resource;
};

export function Users() {
    const [inputValue, setInputValue] = useState<string>("");

    const debouncedValue = useDebouncedValue({ value: inputValue });

    const data = useUsers({ query: debouncedValue });

    const navigate = useNavigate();

    return (
        <div className={styles.usersContainer}>
            <div className={styles.usersArea}>
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
                <div className={styles.usersListArea}>
                    {data.status === "error" && (
                        <>
                            <p>Error: {data.error?.message}</p>
                            <button onClick={data.refetch}>Retry</button>
                        </>
                    )}
                    {data.status === "loading" && <p>Loading...</p>}
                    {data.status === "success" && data.empty && <p>No users found.</p>}
                    {data.status === "success" && !data.empty && (
                        <ul className={styles.usersList}>
                            {data.data.items.map((user) => (
                                <li
                                    className={styles.userItem}
                                    key={user.id}
                                    onClick={() => navigate(`/clients/${user.id}`)}
                                >
                                    {user.name} ({user.email})
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
            <div className={styles.userDetails}>
                <Outlet />
            </div>
        </div>
    );
}
