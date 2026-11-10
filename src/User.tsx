import { useParams } from "react-router";
import { useAsyncResources } from "./hooks/useAsyncResources";
import { getUser } from "./api";

export function User() {
    const { id } = useParams<{ id: string }>();

    const data = useAsyncResources({
        fetchFn: getUser,
        args: [id!],
        resourceKey: ["user", id],
    });

    if (data.status === "loading") {
        return <div>Loading...</div>;
    }

    if (data.status === "error") {
        return (
            <div>
                Error: {data.error?.message}
                <button onClick={data.refetch}>Retry</button>
            </div>
        );
    }

    if (data.status === "success" && data.empty) {
        return <div>User not found.</div>;
    }

    if (data.status === "success" && !data.empty) {
        return (
            <div>
                <h1>{data.data.name}</h1>
                <p>Email: {data.data.email}</p>
            </div>
        );
    }
}
