import { Navigate } from "react-router-dom";

function ProtectedAdmin({ children }) {
  const role = localStorage.getItem("role");

  if (!role || role.toLowerCase() !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedAdmin;