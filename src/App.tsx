import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ProtectedRoute from "@/components/common/protected-route";
import RegisterPage from "@/pages/register-page";
import AppLayout from "@/components/layouts/app-layout";
import TrashPage from "@/pages/trash-page";
import TodosPage from "@/pages/todos-page";
import LoginPage from "@/pages/login-page";
import HomePage from "@/pages/home-page";
import CategoryPage from "@/pages/category-page";
import FolderPage from "./pages/folder-page";

const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: <AppLayout />,
        children: [
          { index: true, element: <HomePage /> },
          { path: "category/:name", element: <CategoryPage /> },
          { path: "folder/:name", element: <FolderPage /> },
          { path: "todos", element: <TodosPage /> },
          { path: "trash", element: <TrashPage /> },
        ],
      },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
