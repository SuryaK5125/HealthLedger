import { Link } from "react-router-dom";

// A single dashboard summary tile: label, big value, optional link. Purely
// presentational — the caller supplies already-computed data.
export default function StatCard({ label, value, to, linkLabel }) {
  return (
    <div
      className="card"
      style={{
        padding: "var(--space-4)",
        display: "grid",
        gap: "var(--space-1)",
      }}
    >
      <div className="muted" style={{ fontSize: "var(--font-size-sm)", fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: "var(--font-size-2xl)", fontWeight: 700 }}>{value}</div>
      {to && (
        <Link to={to} style={{ fontSize: "var(--font-size-sm)" }}>
          {linkLabel} →
        </Link>
      )}
    </div>
  );
}
