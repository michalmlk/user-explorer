import { useParams } from "react-router";
import { getUser, type Page, type User } from "./api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { userKeys } from "./services/userKeys";
import { useUpadateUser } from "./services/useUpdateUser";

export function User() {
    const { id } = useParams<{ id: string }>();

    if (!id) return null;

    return <UserDetails id={id} />;
}

function UserDetails({ id }: { id: string }) {
    const queryClient = useQueryClient();
    const updateUserMutation = useUpadateUser();
    const { refetch, data, error, status } = useQuery({
        queryKey: userKeys.detail(id),
        queryFn: () => getUser(id),
        initialData: () => {
            for (const [, page] of queryClient.getQueriesData<Page<User>>({ queryKey: userKeys.lists() })) {
                const hit = page?.items.find((u) => u.id === id);
                if (hit) return hit;
            }
        },
        initialDataUpdatedAt: () => queryClient.getQueryState(userKeys.lists())?.dataUpdatedAt,
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
                        type="checkbox"
                        checked={data.active}
                        onChange={(e) => updateUserMutation.mutate({ id, patch: { active: e.target.checked } })}
                    />
                </div>
            );
    }
}
