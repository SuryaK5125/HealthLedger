import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login, enterDemo } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDemo = () => {
    enterDemo();
    navigate("/dashboard");
  };

  return (
    <div
      style={{
        minHeight: "70vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="card"
        style={{
          display: "grid",
          gap: "var(--space-3)",
          width: 340,
          padding: "var(--space-5)",
        }}
      >
        <div>
          <div style={{ fontWeight: 800, color: "var(--accentText)", fontSize: "var(--font-size-lg)" }}>HealthLedger</div>
          <h2 style={{ margin: "var(--space-1) 0 0", fontSize: "var(--font-size-xl)" }}>Log In</h2>
          <p className="muted" style={{ fontSize: "var(--font-size-sm)", marginTop: "var(--space-1)" }}>
            Welcome back. Enter your details to continue.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            style={{
              background: "var(--dangerSurface)",
              color: "var(--danger)",
              borderRadius: "var(--radius-sm)",
              padding: "var(--space-2) var(--space-3)",
              fontSize: "var(--font-size-sm)",
            }}
          >
            {error}
          </div>
        )}

        <div style={{ display: "grid", gap: "var(--space-1)" }}>
          <label htmlFor="login-email">Email</label>
          <input
            id="login-email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div style={{ display: "grid", gap: "var(--space-1)" }}>
          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: "var(--space-1)" }}>
          {loading ? "Logging in…" : "Log In"}
        </button>

        <button
          type="button"
          onClick={handleViewDemo}
          style={{
            padding: "10px 20px",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--border)",
            background: "var(--card)",
            color: "var(--text)",
          }}
        >
          View Demo
        </button>
        <p className="muted" style={{ fontSize: "var(--font-size-xs)", textAlign: "center", marginTop: "calc(-1 * var(--space-2))" }}>
          Explore a read-only sample workspace — no account required.
        </p>

        <div className="muted" style={{ fontSize: "var(--font-size-sm)", textAlign: "center" }}>
          No account? <Link to="/signup">Sign up</Link>
        </div>
      </form>
    </div>
  );
}
