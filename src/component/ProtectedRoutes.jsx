import { Navigate } from "react-router-dom";

function ProtectedRoutes({ children }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/auth/login" replace />;
  }

  return children;
}

export default ProtectedRoutes;