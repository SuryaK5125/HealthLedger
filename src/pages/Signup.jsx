import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signup(email, password, name);
      navigate("/dashboard");
    } catch (err) {
      // express-validator returns { message, details: [{field, message}] } on 400
      const details = err.response?.data?.details;
      const message = details?.[0]?.message || err.response?.data?.message || "Signup failed";
      setError(message);
    } finally {
      setLoading(false);
    }
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
          <div style={{ fontWeight: 800, color: "var(--accentText)", fontSize: "var(--font-size-lg)" }}>HealthVault</div>
          <h2 style={{ margin: "var(--space-1) 0 0", fontSize: "var(--font-size-xl)" }}>Create Account</h2>
          <p className="muted" style={{ fontSize: "var(--font-size-sm)", marginTop: "var(--space-1)" }}>
            Set up a family health record in a minute.
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
          <label htmlFor="signup-name">Full name</label>
          <input
            id="signup-name"
            placeholder="Jane Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div style={{ display: "grid", gap: "var(--space-1)" }}>
          <label htmlFor="signup-email">Email</label>
          <input
            id="signup-email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div style={{ display: "grid", gap: "var(--space-1)" }}>
          <label htmlFor="signup-password">Password</label>
          <input
            id="signup-password"
            type="password"
            placeholder="Min. 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
        </div>

        <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: "var(--space-1)" }}>
          {loading ? "Creating account…" : "Sign Up"}
        </button>

        <div className="muted" style={{ fontSize: "var(--font-size-sm)", textAlign: "center" }}>
          Already have an account? <Link to="/login">Log in</Link>
        </div>
      </form>
    </div>
  );
}
