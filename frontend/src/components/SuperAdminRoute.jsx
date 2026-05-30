// src/components/SuperAdminRoute.jsx
import { Navigate } from "react-router-dom";

export function SuperAdminRoute({ children }) {
  const role = localStorage.getItem("role");

  if (role !== "super_admin") {
    return <Navigate to="/ocean-dashboard" replace />;
  }

  return children;
}