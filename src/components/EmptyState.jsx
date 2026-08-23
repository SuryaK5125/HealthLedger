// A deliberately designed "nothing here yet" state, used anywhere a list can
// be empty, so an empty list reads as an intentional state rather than an
// unstyled leftover <p>.
export default function EmptyState({ title, message }) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "var(--space-6) var(--space-4)",
        color: "var(--muted)",
        border: "1px dashed var(--border)",
        borderRadius: "var(--radius)",
      }}
    >
      <div style={{ fontWeight: 700, color: "var(--text)", marginBottom: "var(--space-1)" }}>{title}</div>
      {message && <div style={{ fontSize: "var(--font-size-sm)" }}>{message}</div>}
    </div>
  );
}
