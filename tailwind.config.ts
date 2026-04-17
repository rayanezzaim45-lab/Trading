import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#0a0e1a",
          panel: "#0f1422",
          elevated: "#151b2c",
          hover: "#1a2236",
        },
        bd: {
          DEFAULT: "#1f2940",
          strong: "#2a3654",
        },
        fg: {
          DEFAULT: "#e6ebf5",
          muted: "#8a93a6",
          subtle: "#5a6378",
        },
        up: {
          DEFAULT: "#10b981",
          bg: "rgba(16, 185, 129, 0.12)",
        },
        down: {
          DEFAULT: "#ef4444",
          bg: "rgba(239, 68, 68, 0.12)",
        },
        accent: {
          DEFAULT: "#3b82f6",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "Menlo", "monospace"],
      },
      animation: {
        "flash-up": "flashUp 250ms ease-out",
        "flash-down": "flashDown 250ms ease-out",
      },
      keyframes: {
        flashUp: {
          "0%": { backgroundColor: "rgba(16, 185, 129, 0.35)" },
          "100%": { backgroundColor: "transparent" },
        },
        flashDown: {
          "0%": { backgroundColor: "rgba(239, 68, 68, 0.35)" },
          "100%": { backgroundColor: "transparent" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
