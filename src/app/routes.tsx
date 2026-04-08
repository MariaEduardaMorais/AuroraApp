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
    Component: Splash,
  },
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/register",
    Component: Register,
  },
  {
    path: "/receitas",
    Component: RecipeBook,
  },
  {
    path: "/app",
    Component: AuthGuard,
    children: [
      {
        path: "",
        Component: Layout,
        children: [
          { index: true, Component: Home },
          { path: "chat", Component: Chat },
          { path: "info", Component: Info },
          { path: "contacts", Component: Contacts },
        ],
      },
    ],
  },
  {
    path: "*",
    Component: () => <Navigate to="/" replace />,
  }
]);
