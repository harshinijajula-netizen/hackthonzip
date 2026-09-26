/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0A0E17",
          900: "#0E1424",
          800: "#141B2E",
          700: "#1C2540",
        },
        accent: {
          cyan: "#3ED0C9",
          purple: "#8B7EF7",
        },
      },
      fontFamily: {
        display: ["'Sora'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 40px rgba(62, 208, 201, 0.15)",
      },
    },
  },
  plugins: [],
};
