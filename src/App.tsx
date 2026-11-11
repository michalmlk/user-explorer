import { createBrowserRouter, Navigate, RouterProvider } from "react-router";
import { Users } from "./Users";
import { User } from "./User";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

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
    const queryClient = new QueryClient();

    return (
        <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
        </QueryClientProvider>
    );
}

export default App;
