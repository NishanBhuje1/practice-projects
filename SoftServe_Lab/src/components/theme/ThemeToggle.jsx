import { useTheme } from "./ThemeProvider.jsx";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="
        inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition
        border border-[rgb(var(--border))] text-[rgb(var(--text))]
        bg-transparent hover:bg-[rgb(var(--card))]
        dark:border-[rgb(var(--border))] dark:text-[rgb(var(--text))] dark:hover:bg-[rgb(var(--card))]
      "
      aria-label="Toggle theme"
      title="Toggle theme"
    >
      {theme === "light" ? "Dark" : "Light"}
    </button>
  );
}
