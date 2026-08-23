// Presentational only — every page passes its own title/subtitle/actions;
// no data fetching or state lives here.
export default function PageHeader({ title, subtitle, actions }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        flexWrap: "wrap",
        gap: "var(--space-3)",
        marginBottom: "var(--space-5)",
      }}
    >
      <div>
        <h2 style={{ fontSize: "var(--font-size-2xl)", margin: 0 }}>{title}</h2>
        {subtitle && (
          <p className="muted" style={{ marginTop: "var(--space-1)", fontSize: "var(--font-size-sm)" }}>
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div style={{ display: "flex", gap: "var(--space-2)" }}>{actions}</div>}
    </div>
  );
}
