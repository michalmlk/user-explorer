import { useParams } from "react-router";
import { useAsyncResources } from "./hooks/useAsyncResources";
import { getUser } from "./api";

export function User() {
    const { id } = useParams<{ id: string }>();

    if (!id) return null;

    return <UserDetails id={id} />;
}

function UserDetails({ id }: { id: string }) {
    const data = useAsyncResources({
        fetchFn: getUser,
        args: [id],
        resourceKey: ["user", id],
    });

    switch (data.status) {
        case "loading":
            return <div>Loading...</div>;
        case "error":
            return (
                <div>
                    Error: {data.error.message}
                    <button onClick={data.refetch}>Retry</button>
                </div>
            );

        case "success":
            if (!data.data) {
                return <div>User not found.</div>;
            } else {
                return (
                    <div>
                        <h1>{data.data.name}</h1>
                        <p>Email: {data.data.email}</p>
                    </div>
                );
            }
    }
}
