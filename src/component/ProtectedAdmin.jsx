import { Navigate } from "react-router-dom";

function ProtectedAdmin({ children }) {
 const storedRole = localStorage.getItem("role");
const role = storedRole ? JSON.parse(storedRole) : null;

  const isAdmin = Array.isArray(role)
    ? role.includes("Admin")
    : role === "Admin";

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedAdmin;
