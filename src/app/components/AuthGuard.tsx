import React from "react";
import { Navigate, Outlet, useLocation } from "react-router";

export function AuthGuard() {
  const isAuth = localStorage.getItem("aurora_auth") === "true";
  const location = useLocation();

  if (!isAuth) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
