/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        tomato: {
          50: "#FFF1F0",
          100: "#FFE0DD",
          200: "#FFC4BF",
          300: "#FF9B93",
          400: "#FF6B60",
          500: "#FF5A4F",
          600: "#ED3E33",
          700: "#C62E25",
          800: "#A32720",
          900: "#86241E",
        },
        ink: {
          900: "#141417",
          800: "#1A1A1E",
          700: "#242429",
          600: "#2E2E35",
          500: "#3A3A42",
          400: "#52525B",
          300: "#8A8A93",
          200: "#B4B4BB",
          100: "#DADADF",
        },
        mint: {
          400: "#4ADE80",
          500: "#22C55E",
        },
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"SF Mono"', 'Menlo', 'monospace'],
      },
      animation: {
        "pulse-ring": "pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fade-in 0.4s ease-out",
        "slide-up": "slide-up 0.3s ease-out",
      },
      keyframes: {
        "pulse-ring": {
          "0%, 100%": { transform: "scale(1)", opacity: "0.6" },
          "50%": { transform: "scale(1.05)", opacity: "0.3" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
