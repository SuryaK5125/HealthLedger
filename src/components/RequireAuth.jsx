import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Every protected route goes through here instead of repeating its own
// ternary, so there is exactly one place that decides what "not logged in"
// means for the UI.
export default function RequireAuth({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
