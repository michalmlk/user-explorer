import { createBrowserRouter, RouterProvider } from "react-router";
import { Users } from "./Users";
import { User } from "./User";

const router = createBrowserRouter([
    {
        path: "/",
        element: <></>,
    },
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
    return <RouterProvider router={router} />;
}

export default App;
