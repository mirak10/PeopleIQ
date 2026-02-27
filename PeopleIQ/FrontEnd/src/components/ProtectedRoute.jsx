import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) return <Navigate to="/login" />;

  if (roles && !roles.includes(user.role)) {
    const allowed = roles.map(r => r.toString().toLowerCase());
    const current = (user.role || "").toString().toLowerCase();
    if (!allowed.includes(current)) return <Navigate to="/unauthorized" />;
  }

  return children;
}