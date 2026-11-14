import { useState } from "react";
import { searchUsers } from "./api";
import styles from "./Users.module.css";
import { useDebouncedValue } from "./useDebouncedValue";
import { Link, Outlet } from "react-router";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { userKeys } from "./services/userKeys";
import { useUpadateUser } from "./services/useUpdateUser";

type PageButtonProps = {
    onNext: () => void;
    onPrev: () => void;
};

const PageButtons = ({ onNext, onPrev }: PageButtonProps) => {
    return (
        <>
            <button className={styles.pageButton} onClick={onPrev}>
                PREV
            </button>
            <button className={styles.pageButton} onClick={onNext}>
                NEXT
            </button>
        </>
    );
};

export function Users() {
    const [inputValue, setInputValue] = useState<string>("");
    const [page, setPage] = useState(1);

    const debouncedValue = useDebouncedValue({ value: inputValue });

    const updateUserMutation = useUpadateUser();

    const { data, isLoading, isError, isSuccess, refetch, error } = useQuery({
        queryKey: userKeys.list(debouncedValue, page),
        queryFn: ({ signal }) => searchUsers(debouncedValue, { signal, page }),
        staleTime: 3_000,
        placeholderData: keepPreviousData,
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
                        onChange={(e) => {
                            setInputValue(e.target.value);
                            setPage(1);
                        }}
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
                        <>
                            <div className={styles.pagesSelector}>
                                <PageButtons
                                    onNext={() => {
                                        setPage((prev) => (prev >= data.totalPages ? prev : prev + 1));
                                    }}
                                    onPrev={() => setPage((prev) => (prev <= 1 ? prev : prev - 1))}
                                />
                            </div>
                            <ul className={styles.usersList}>
                                {data.items.map((user) => (
                                    <li key={user.id} className={styles.userItem}>
                                        <Link to={`/clients/${user.id}`}>
                                            <p className={styles.userName}>{user.name}</p>
                                            <p className={styles.userEmail}>({user.email})</p>
                                        </Link>
                                        <input
                                            type="checkbox"
                                            checked={user.active}
                                            onChange={(e) => {
                                                updateUserMutation.mutate({
                                                    id: user.id,
                                                    patch: {
                                                        active: e.target.checked,
                                                    },
                                                });
                                            }}
                                        />
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                </div>
            </div>
            <div className={styles.userDetails}>
                <Outlet />
            </div>
        </div>
    );
}
