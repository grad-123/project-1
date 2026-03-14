import { Navigate } from "react-router-dom";

function ProtectedAdmin({ children }) {
  const role = JSON.parse(localStorage.getItem("role"));

  const isAdmin = Array.isArray(role)
    ? role.includes("Admin")
    : role === "Admin";

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedAdmin;
