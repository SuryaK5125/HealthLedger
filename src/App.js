import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";

// pages
import Dashboard from "./pages/Dashboard";
import Profiles from "./pages/Profiles";
import ProfileDetail from "./pages/ProfileDetail";
import Appointments from "./pages/Appointments";

// components you already have
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
        
        {/* Show navbar only if logged in */}
        {user && <Navbar />}

        <Routes>
          {/* Home route */}
          <Route
            path="/"
            element={
              user ? <Navigate to="/dashboard" /> : <Login />
            }
          />

          {/* Dashboard visible to all */}
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/profiles" element={<Profiles />} />

          {/* Protected routes */}
          <Route
            path="/upload"
            element={user ? <UploadForm /> : <Navigate to="/" />}
          />

          <Route
            path="/records"
            element={user ? <RecordsList /> : <Navigate to="/" />}
          />

          <Route
            path="/appointments"
            element={user ? <Appointments /> : <Navigate to="/" />}
          />

          {/* Explicit login route */}
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
export default App;
