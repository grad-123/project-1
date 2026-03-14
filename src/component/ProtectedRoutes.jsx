import { Navigate } from "react-router-dom";

function ProtectedRoutes({ children }) {
  const token = localStorage.getItem("token");
  const storedRole = localStorage.getItem("role");

  let role = [];
  try {
    const parsed = JSON.parse(storedRole);
    role = Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    role = storedRole ? storedRole.split(",") : [];
  }

  const isStudent = role.includes("Student");

  if (!token || !isStudent) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoutes;