import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Every protected route goes through here instead of repeating its own
// ternary, so there is exactly one place that decides what "not logged in"
// means for the UI. A demo visitor counts as authorized to view these
// routes even though they hold no token and no user object — the pages
// themselves are responsible for rendering sample data instead of fetching
// when isDemo is true.
export default function RequireAuth({ children }) {
  const { user, loading, isDemo } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }
  if (!user && !isDemo) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
