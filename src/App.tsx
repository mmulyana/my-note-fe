import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ProtectedRoute from "@/components/common/protected-route";
import RegisterPage from "@/pages/register-page";
import AppLayout from "@/components/layouts/app-layout";
import TrashPage from "@/pages/trash-page";
import TodosPage from "@/pages/todos-page";
import LoginPage from "@/pages/login-page";
import HomePage from "@/pages/home-page";
import LabelPage from "@/pages/label-page";
import NotePage from "@/pages/note-page";
import FolderPage from "./pages/folder-page";
import ArchivePage from "./pages/archive-page";

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
          { path: "label/:name", element: <LabelPage /> },
          { path: "folder/:id", element: <FolderPage /> },
          { path: "note/:id", element: <NotePage /> },
          { path: "todos", element: <TodosPage /> },
          { path: "trash", element: <TrashPage /> },
          { path: "archive", element: <ArchivePage /> },
        ],
      },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
