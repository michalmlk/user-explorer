import { useParams } from "react-router";
import { getUser } from "./api";
import { useQuery } from "@tanstack/react-query";

export function User() {
    const { id } = useParams<{ id: string }>();

    if (!id) return null;

    return <UserDetails id={id} />;
}

function UserDetails({ id }: { id: string }) {
    const { data, status, error, refetch } = useQuery({
        queryFn: () => getUser(id),
        queryKey: ["user", id],
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
                </div>
            );
    }
}
