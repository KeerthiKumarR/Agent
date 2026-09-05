/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#09090b",
        surface: "#121214",
        "surface-elevated": "#18181b",
        "surface-card": "#141417",
        border: "#27272a",
        "border-focus": "#52525b",
        primary: {
          DEFAULT: "#ffffff",
          hover: "#e4e4e7",
          light: "#fafafa",
          subtle: "rgba(255, 255, 255, 0.08)",
        },
        accent: {
          cyan: "#38bdf8",
          emerald: "#10b981",
          amber: "#f59e0b",
          rose: "#ef4444",
          purple: "#a1a1aa",
        },
        text: {
          primary: "#fafafa",
          secondary: "#a1a1aa",
          muted: "#71717a",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      animation: {
        "pulse-subtle": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
};
