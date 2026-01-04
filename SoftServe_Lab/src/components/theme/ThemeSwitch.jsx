import { motion } from "framer-motion";
import { useTheme } from "./ThemeProvider.jsx";

export default function ThemeSwitch() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="
        relative w-14 h-8 rounded-full
        bg-white/20 backdrop-blur
        border border-white/20
        transition
      "
      aria-label="Toggle theme"
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="
          absolute top-1 left-1
          w-6 h-6 rounded-full
          bg-white
          shadow
        "
        style={{
          transform: isDark ? "translateX(24px)" : "translateX(0px)",
        }}
      />
    </button>
  );
}
