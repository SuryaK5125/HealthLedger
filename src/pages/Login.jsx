import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login , loading } = useAuth();

  return (
    <div style={{
      height: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center"
    }}>
      <button onClick={login} style={{
        padding: "12px 20px",
        fontSize: "16px",
        borderRadius: "10px"
      }}>
        Continue with Google
      </button>
    </div>
  );
}