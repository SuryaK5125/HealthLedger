import { NavLink } from "react-router-dom";
import { useTheme } from "../theme/ThemeProvider";
import { useAuth } from "../context/AuthContext";

// --- Icons (inline SVGs) ---
const FullMoonIcon = ({ size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" />
  </svg>
);

const SunIcon = ({ size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="4" />
    <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="12" y1="1" x2="12" y2="4" />
      <line x1="12" y1="20" x2="12" y2="23" />
      <line x1="1" y1="12" x2="4" y2="12" />
      <line x1="20" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="4.22" x2="6.34" y2="6.34" />
      <line x1="17.66" y1="17.66" x2="19.78" y2="19.78" />
      <line x1="4.22" y1="19.78" x2="6.34" y2="17.66" />
      <line x1="17.66" y1="6.34" x2="19.78" y2="4.22" />
    </g>
  </svg>
);

const linkStyle = ({ isActive }) => ({
  padding: "0.55rem 0.9rem",
  borderRadius: 10,
  textDecoration: "none",
  fontWeight: 600,
  background: isActive ? "var(--accent)" : "transparent",
  color: isActive ? "var(--accentText)" : "var(--text)",
  marginRight: "0.4rem",
  whiteSpace: "nowrap",
});

export default function Navbar() {
  const { theme, toggle } = useTheme();
  const { logout } = useAuth();

  const handleSignOut = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Failed to sign out.");
    }
  };

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        backdropFilter: "saturate(180%) blur(6px)",
        marginBottom: "0.75rem",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.6rem",
          padding: "0.5rem 0",
        }}
      >
        <div style={{ fontSize: 20, fontWeight: 800, marginRight: 8 }}>
          HealthVault
        </div>

        <nav style={{ display: "flex", alignItems: "center", overflowX: "auto" }}>
          <NavLink to="/dashboard" style={linkStyle}>Dashboard</NavLink>
          <NavLink to="/profiles" style={linkStyle}>Profiles</NavLink>
          <NavLink to="/records" style={linkStyle}>Records</NavLink>
          <NavLink to="/appointments" style={linkStyle}>Appointments</NavLink>
          <NavLink to="/upload" style={linkStyle}>Upload</NavLink>
        </nav>

        <div style={{ flex: 1 }} />

        <button
          onClick={toggle}
          title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
          aria-label="Toggle theme"
          style={{
            display: "grid",
            placeItems: "center",
            padding: "0.45rem 0.7rem",
            borderRadius: 10,
            border: "1px solid var(--border)",
            background: "var(--card)",
            color: "var(--text)",
            marginRight: 8,
            cursor: "pointer",
          }}
        >
          {theme === "light" ? <FullMoonIcon /> : <SunIcon />}
        </button>

        <button
          onClick={handleSignOut}
          style={{
            padding: "0.45rem 0.8rem",
            borderRadius: 10,
            border: "1px solid var(--border)",
            background: "var(--card)",
            color: "var(--text)",
            cursor: "pointer",
          }}
        >
          Sign Out
        </button>
      </div>
      <hr style={{ border: 0, borderTop: "1px solid var(--border)", margin: 0 }} />
    </header>
  );
}