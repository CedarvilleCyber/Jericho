"use client";

import { useTheme } from "@/lib/use-theme";
import { IconMoon, IconSun } from "@tabler/icons-react";

export default function ColorSchemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      className="btn btn-ghost btn-square"
      aria-label="Toggle color scheme"
    >
      {theme === "business" ? <IconSun size={20} /> : <IconMoon size={20} />}
    </button>
  );
}
