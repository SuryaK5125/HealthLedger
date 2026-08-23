import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axiosInstance";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const DEMO_STORAGE_KEY = "demoMode";

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(
    () => sessionStorage.getItem(DEMO_STORAGE_KEY) === "true"
  );

  // On first load, a token may already be in storage from a previous
  // session. It's re-verified against the server rather than trusted as-is,
  // so a token that has since expired or been revoked doesn't leave the app
  // thinking the user is still signed in. Demo mode never reaches this path
  // at all — it has no token, so /auth/me is never called for a demo
  // visitor.
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    api
      .get("/auth/me")
      .then((res) => setUser(res.data.user))
      .catch(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));
    exitDemo();
    setUser(res.data.user);
  };

  const signup = async (email, password, name) => {
    const res = await api.post("/auth/signup", { email, password, name });
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));
    exitDemo();
    setUser(res.data.user);
  };

  // JWTs are stateless — there is nothing to invalidate on the server, so
  // "logging out" just means the client stops holding a usable token.
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  // Demo mode is pure frontend state: no token is issued, no request is
  // ever sent, and no identity exists that could accidentally be attached
  // to a real API call. It's a flag that tells pages to render the static
  // sample dataset instead of fetching from the API. Persisting it in
  // sessionStorage (not localStorage) means a refresh keeps the visitor in
  // demo mode, but closing the tab clears it — appropriate for a
  // throwaway, no-account exploration session.
  const enterDemo = () => {
    sessionStorage.setItem(DEMO_STORAGE_KEY, "true");
    setIsDemo(true);
  };

  const exitDemo = () => {
    sessionStorage.removeItem(DEMO_STORAGE_KEY);
    setIsDemo(false);
  };

  return (
    <AuthContext.Provider
      value={{ user, login, signup, logout, loading, isDemo, enterDemo, exitDemo }}
    >
      {children}
    </AuthContext.Provider>
  );
}
