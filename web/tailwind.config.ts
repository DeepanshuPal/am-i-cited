import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#000000",
          900: "#0a0a0a",
          850: "#101010",
          800: "#161616",
          700: "#1f1f1f",
          600: "#2a2a2a",
          500: "#3d3d3d",
        },
        mist: {
          100: "#ededed",
          300: "#c4c4c4",
          500: "#8a8a8a",
          600: "#666666",
        },
        accent: {
          DEFAULT: "#5e6ad2",
          bright: "#7c86e8",
        },
        good: "#3fb68b",
        bad: "#f0645c",
        warn: "#e8b931",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      letterSpacing: { micro: "0.14em" },
    },
  },
  plugins: [],
};
export default config;
