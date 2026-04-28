import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";

import Dashboard from "./pages/Dashboard";
import Profiles from "./pages/Profiles";
import ProfileDetail from "./pages/ProfileDetail";
import Appointments from "./pages/Appointments";

import UploadForm from "./components/UploadForm";
import RecordsList from "./components/RecordsList";

import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";

function App() {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  return (
    <BrowserRouter>
      <div style={{ padding: "1rem 2rem", maxWidth: 1100, margin: "0 auto" }}>
        
        {/* Always show Navbar (even in demo mode) */}
        <Navbar />

        {/* Optional demo banner */}
        {!user && (
          <div style={{ textAlign: "center", fontSize: "12px", color: "#666", marginBottom: "10px" }}>
            Demo mode — login not required
          </div>
        )}

        <Routes>
          {/* Home → go straight to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Public pages (demo accessible) */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profiles" element={<Profiles />} />
          <Route path="/profiles/:id" element={<ProfileDetail />} />

          {/* Protected pages */}
          <Route
            path="/upload"
            element={user ? <UploadForm /> : <Navigate to="/dashboard" />}
          />

          <Route
            path="/records"
            element={user ? <RecordsList /> : <Navigate to="/dashboard" />}
          />

          <Route
            path="/appointments"
            element={user ? <Appointments /> : <Navigate to="/dashboard" />}
          />

          {/* Login page (optional access) */}
          <Route path="/login" element={<Login />} />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
