import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: "12px"
      }}
    >
      <button
        onClick={login}
        style={{
          padding: "12px 20px",
          fontSize: "16px",
          borderRadius: "10px"
        }}
      >
        Continue with Google
      </button>

      <button
        onClick={() => window.location.href = "/dashboard"}
        style={{
          padding: "10px 16px",
          borderRadius: "8px",
          border: "1px solid #ccc",
          background: "#fff",
          cursor: "pointer"
        }}
      >
        Continue without login
      </button>

      <p style={{ fontSize: "12px", color: "#666" }}>
        Demo mode — no login required
      </p>
    </div>
  );
}
