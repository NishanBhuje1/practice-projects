/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Dark (default)
        bg: "rgb(5, 19, 25)",
        surface: "rgb(12, 28, 36)",
        border: "rgb(51, 64, 71)",
        accent: "rgb(188, 200, 208)",
        text: {
          primary: "rgb(188, 200, 208)",
          secondary: "rgb(142, 155, 162)",
          muted: "rgb(97, 110, 117)",
          invert: "rgb(5, 19, 25)",
        },

        // Light mode palette
        light: {
          bg: "rgb(250, 251, 252)",
          surface: "rgb(255, 255, 255)",
          border: "rgb(226, 232, 240)",
          accent: "rgb(15, 23, 42)",
          text: {
            primary: "rgb(15, 23, 42)",
            secondary: "rgb(71, 85, 105)",
            muted: "rgb(100, 116, 139)",
            invert: "rgb(250, 251, 252)",
          },
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
