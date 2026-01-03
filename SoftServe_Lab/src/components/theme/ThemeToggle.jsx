import { useTheme } from "./ThemeProvider.jsx";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="
        inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition
        border
        dark:border-border dark:text-text-primary dark:hover:border-accent
        light:border-light-border light:text-light-text-primary light:hover:border-light-accent
      "
      aria-label="Toggle theme"
      title="Toggle theme"
    >
      {theme === "light" ? "Dark" : "Light"}
    </button>
  );
}
