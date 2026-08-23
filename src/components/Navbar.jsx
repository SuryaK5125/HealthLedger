import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const linkStyle = ({ isActive }) => ({
  padding: "0.5rem 0.85rem",
  borderRadius: "var(--radius-sm)",
  textDecoration: "none",
  fontWeight: 600,
  fontSize: "var(--font-size-sm)",
  background: isActive ? "var(--accent)" : "transparent",
  color: isActive ? "var(--accentText)" : "var(--muted)",
  marginRight: "0.25rem",
  whiteSpace: "nowrap",
  transition: "background 0.15s ease, color 0.15s ease",
});

const secondaryButtonStyle = {
  padding: "0.45rem 0.9rem",
  borderRadius: "var(--radius-sm)",
  border: "1px solid var(--border)",
  background: "var(--card)",
  color: "var(--text)",
  fontSize: "var(--font-size-sm)",
};

export default function Navbar() {
  const { user, logout, isDemo, exitDemo } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Failed to sign out.");
    }
  };

  const handleExitDemo = () => {
    exitDemo();
    navigate("/login");
  };

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        background: "var(--bg)",
        backdropFilter: "saturate(180%) blur(6px)",
        marginBottom: "var(--space-5)",
        marginLeft: "calc(-1 * var(--space-6))",
        marginRight: "calc(-1 * var(--space-6))",
        paddingLeft: "var(--space-6)",
        paddingRight: "var(--space-6)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-2)",
          padding: "var(--space-3) 0",
        }}
      >
        <div style={{ fontSize: "var(--font-size-lg)", fontWeight: 800, marginRight: "var(--space-3)", color: "var(--accentText)" }}>
          HealthLedger
        </div>

        <nav style={{ display: "flex", alignItems: "center", overflowX: "auto", gap: 2 }} aria-label="Main navigation">
          <NavLink to="/dashboard" style={linkStyle}>Dashboard</NavLink>
          <NavLink to="/profiles" style={linkStyle}>Profiles</NavLink>
          <NavLink to="/records" style={linkStyle}>Records</NavLink>
          <NavLink to="/appointments" style={linkStyle}>Appointments</NavLink>
          <NavLink to="/upload" style={linkStyle}>Upload</NavLink>
        </nav>

        <div style={{ flex: 1 }} />

        {isDemo && (
          <span
            className="badge"
            title="You're viewing sample data in a read-only workspace."
            style={{ marginRight: "var(--space-2)" }}
          >
            Demo Mode · Sample data only
          </span>
        )}

        {!isDemo && user?.name && (
          <span className="muted" style={{ fontSize: "var(--font-size-sm)", marginRight: "var(--space-2)" }}>
            {user.name}
          </span>
        )}

        {isDemo ? (
          <>
            <button onClick={() => navigate("/login")} style={{ ...secondaryButtonStyle, marginRight: "var(--space-2)" }}>
              Sign In
            </button>
            <button onClick={handleExitDemo} style={secondaryButtonStyle}>
              Exit Demo
            </button>
          </>
        ) : (
          <button onClick={handleSignOut} style={secondaryButtonStyle}>
            Sign Out
          </button>
        )}
      </div>
      <div style={{ borderTop: "1px solid var(--border)" }} />
    </header>
  );
}
