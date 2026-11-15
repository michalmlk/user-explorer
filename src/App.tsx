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

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: (failureCount, error) => error instanceof ApiError && error.status === 500 && failureCount < 3,
        },
    },
});

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
        </QueryClientProvider>
    );
}

export default App;
