/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        bg: "rgb(var(--bg))",
        surface: "rgb(var(--surface))",
        border: "rgb(var(--border))",
        accent: "rgb(var(--accent))",

        text: {
          primary: "rgb(var(--text-primary))",
          secondary: "rgb(var(--text-secondary))",
          muted: "rgb(var(--text-muted))",
          invert: "rgb(var(--text-invert))",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "14px",
      },
    },
  },
  plugins: [],
};
