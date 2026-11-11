import { useState } from "react";
import { searchUsers } from "./api";
import styles from "./Users.module.css";
import { useDebouncedValue } from "./useDebouncedValue";
import { Link, Outlet } from "react-router";
import { useQuery } from "@tanstack/react-query";

export function Users() {
    const [inputValue, setInputValue] = useState<string>("");

    const debouncedValue = useDebouncedValue({ value: inputValue });

    const { data, isLoading, isError, isSuccess, refetch, error } = useQuery({
        queryKey: ["users", debouncedValue],
        queryFn: () => searchUsers(debouncedValue),
    });

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
                    {isError && data && (
                        <>
                            <p>Error: {error.message}</p>
                            <button onClick={() => refetch()}>Retry</button>
                        </>
                    )}
                    {isLoading && <p>Loading...</p>}
                    {isSuccess && data && data.items.length === 0 && <p>No users found.</p>}
                    {isSuccess && (
                        <ul className={styles.usersList}>
                            {data.items.map((user) => (
                                <li key={user.id}>
                                    <Link className={styles.userItem} to={`/clients/${user.id}`}>
                                        {user.name} ({user.email})
                                    </Link>
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
