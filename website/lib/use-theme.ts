"use client";

import { useEffect, useState } from "react";

type Theme = "corporate" | "business";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>("corporate");

  useEffect(() => {
    const stored = localStorage.getItem("theme") as Theme | null;
    if (stored === "corporate" || stored === "business") {
      setTheme(stored);
      document.documentElement.setAttribute("data-theme", stored);
    } else {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      const initial: Theme = prefersDark ? "business" : "corporate";
      setTheme(initial);
      document.documentElement.setAttribute("data-theme", initial);
    }
  }, []);

  function toggleTheme() {
    const next: Theme = theme === "corporate" ? "business" : "corporate";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.setAttribute("data-theme", next);
  }

  return { theme, toggleTheme };
}
