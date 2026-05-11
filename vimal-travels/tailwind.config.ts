// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary — Deep Violet
        primary: {
          50:  "#F5F3FF",
          100: "#EDE9FE",
          200: "#DDD6FE",
          300: "#C4B5FD",
          400: "#A78BFA",
          500: "#8B5CF6",
          600: "#7C3AED",
          700: "#6D28D9",
          800: "#5B21B6",
          900: "#4C1D95",
        },
        // Accent — Rose / Coral
        rose: {
          400: "#FB7185",
          500: "#F43F5E",
          600: "#E11D48",
          700: "#BE123C",
        },
        // Gold — Amber (prices, highlights)
        gold: {
          300: "#FCD34D",
          400: "#FBBF24",
          500: "#F59E0B",
          600: "#D97706",
        },
        // Cyan — Info accent
        cyan: {
          400: "#22D3EE",
          500: "#06B6D4",
          600: "#0891B2",
        },
        // Dark navy
        navy: {
          DEFAULT: "#0B2545",
          50:  "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0",
          600: "#1E3A5F",
          700: "#172D4A",
          800: "#0F1F35",
          900: "#0A1628",
          950: "#060D1A",
        },
        // Keep orange for any legacy references
        orange: {
          50:  "#FFF7ED",
          100: "#FFEDD5",
          400: "#FB923C",
          500: "#F97316",
          600: "#EA580C",
        },
      },
      fontFamily: {
        display: ["var(--font-playfair)", "Georgia", "serif"],
        body:    ["var(--font-dm-sans)", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-up":  "fadeUp 0.6s ease forwards",
        "fade-in":  "fadeIn 0.5s ease forwards",
        "float":    "float 3s ease-in-out infinite",
        "gradient": "gradientShift 6s ease infinite",
      },
      keyframes: {
        fadeUp:        { from: { opacity: "0", transform: "translateY(24px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        fadeIn:        { from: { opacity: "0" }, to: { opacity: "1" } },
        float:         { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-8px)" } },
        gradientShift: { "0%,100%": { backgroundPosition: "0% 50%" }, "50%": { backgroundPosition: "100% 50%" } },
      },
    },
  },
  plugins: [],
};

export default config;
