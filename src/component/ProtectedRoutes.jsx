import { Navigate } from "react-router-dom";

function ProtectedRoutes({ children }) {
  const token = localStorage.getItem("token");
  const role = JSON.parse(localStorage.getItem("role"));

  if (!token) {
    return <Navigate to="/" replace />;
  }

  const isUser = Array.isArray(role)
    ? role.includes("User")
    : role === "User";

  if (!isUser) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoutes;