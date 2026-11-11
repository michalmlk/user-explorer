import { createBrowserRouter, Navigate, RouterProvider } from "react-router";
import { Users } from "./Users";
import { User } from "./User";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ApiError } from "./api";

const router = createBrowserRouter([
    { path: "/", element: <Navigate to="/clients" replace /> },
    {
        path: "/clients",
        element: <Users />,
        children: [
            {
                path: "/clients/:id",
                element: <User />,
            },
        ],
    },
]);

function App() {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: (_, error) => error instanceof ApiError && error.status === 500,
            },
        },
    });

    return (
        <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
        </QueryClientProvider>
    );
}

export default App;
