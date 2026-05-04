import { createBrowserRouter, Navigate } from "react-router";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { Chat } from "./pages/Chat";
import { Info } from "./pages/Info";
import { Contacts } from "./pages/Contacts";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Splash } from "./pages/Splash";
import { AuthGuard } from "./components/AuthGuard";
import { RecipeBook } from "./pages/RecipeBook";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Splash />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/receitas",
    element: <RecipeBook />,
  },

  // 🔥 PROTEGIDO
  {
    path: "/app",
    element: <AuthGuard />,
    children: [
      {
        element: <Layout />, // 🔥 SEM path aqui
        children: [
          { index: true, element: <Home /> },
          { path: "chat", element: <Chat /> },
          { path: "info", element: <Info /> },
          { path: "contacts", element: <Contacts /> },
        ],
      },
    ],
  },

  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);