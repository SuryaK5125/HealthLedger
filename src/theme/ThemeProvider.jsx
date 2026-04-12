// src/theme/ThemeProvider.jsx
import { createContext, useContext, useEffect, useState } from "react";

const ThemeCtx = createContext({ theme: "light", toggle: () => {} });
export const useTheme = () => useContext(ThemeCtx);

export default function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");

  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggle = () => setTheme(t => (t === "light" ? "dark" : "light"));

  return <ThemeCtx.Provider value={{ theme, toggle }}>{children}</ThemeCtx.Provider>;
}
