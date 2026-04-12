import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ThemeProvider from "./theme/ThemeProvider";
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
  if (!user) return <Login />;
  return (
    <BrowserRouter>
      <ThemeProvider>
        <div style={{ padding: "1rem 2rem", maxWidth: 1100, margin: "0 auto" }}>
          <Navbar />
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />

            <Route path="/profiles" element={<Profiles />} />
            <Route path="/profiles/:id" element={<ProfileDetail />} />

            <Route path="/records" element={<RecordsList />} />
            <Route path="/upload" element={<UploadForm />} />

            <Route path="/appointments" element={<Appointments />} />

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
