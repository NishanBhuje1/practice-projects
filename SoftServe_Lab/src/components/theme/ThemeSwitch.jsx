import { useTheme } from "./ThemeProvider.jsx";

export default function ThemeSwitch() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="
        relative inline-flex items-center justify-center
        h-10 w-10 rounded-full
        text-white/60 hover:text-white hover:bg-white/10
        dark:text-white/60 dark:hover:text-white dark:hover:bg-white/10
        transition-all duration-200
        active:scale-95
      "
      aria-label="Toggle theme"
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      <div className="relative h-5 w-5">
        {isDark ? (
          // Sun Icon (Show in Dark Mode to switch to Light)
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-orange-400"
          >
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2" />
            <path d="M12 20v2" />
            <path d="M4.93 4.93l1.41 1.41" />
            <path d="M17.66 17.66l1.41 1.41" />
            <path d="M2 12h2" />
            <path d="M20 12h2" />
            <path d="M6.34 17.66l-1.41 1.41" />
            <path d="M19.07 4.93l-1.41 1.41" />
          </svg>
        ) : (
          // Moon Icon (Show in Light Mode to switch to Dark)
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-slate-700"
          >
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
          </svg>
        )}
      </div>
    </button>
  );
}
