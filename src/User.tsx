import { useParams } from "react-router";
import { getUser, type Page, type User } from "./api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { userKeys } from "./services/userKeys";
import { useUpdateUser } from "./services/useUpdateUser";
import { useMemo } from "react";

export function User() {
    const { id } = useParams<{ id: string }>();

    if (!id) return null;

    return <UserDetails id={id} />;
}

function UserDetails({ id }: { id: string }) {
    const queryClient = useQueryClient();
    const updateUserMutation = useUpdateUser();

    const seed = useMemo(() => {
        for (const [key, page] of queryClient.getQueriesData<Page<User>>({ queryKey: userKeys.lists() })) {
            const hit = page?.items.find((u) => u.id === id);
            if (hit) return { hit, updatedAt: queryClient.getQueryState(key)?.dataUpdatedAt };
        }
    }, [id, queryClient]);

    const { refetch, data, error, status } = useQuery({
        queryKey: userKeys.detail(id),
        queryFn: () => getUser(id),
        initialData: () => seed?.hit,
        initialDataUpdatedAt: () => seed?.updatedAt,
    });

    switch (status) {
        case "pending":
            return <div>Loading...</div>;
        case "error":
            return (
                <div>
                    Error: {error.message}
                    <button onClick={() => refetch()}>Retry</button>
                </div>
            );

        case "success":
            return (
                <div>
                    <h1>{data.name}</h1>
                    <p>Email: {data.email}</p>
                    <input
                        aria-label={`Active user: ${data.name}`}
                        type="checkbox"
                        checked={data.active}
                        onChange={(e) => updateUserMutation.mutate({ id, patch: { active: e.target.checked } })}
                    />
                </div>
            );
    }
}
