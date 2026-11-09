import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        luxury: {
          50: "#FAF8F5",
          100: "#F5F0E8",
          200: "#EBE0D2",
          300: "#DECDB8",
          400: "#CDB598",
          500: "#B89B77", // Signature Warm Gold / Beige
          600: "#9E7E5B",
          700: "#7F6244",
          800: "#5F4934",
          900: "#36281C",
        },
        charcoal: {
          50: "#F6F6F6",
          100: "#E7E7E7",
          200: "#D1D1D1",
          300: "#B0B0B0",
          400: "#888888",
          500: "#6D6D6D",
          600: "#5D5D5D",
          700: "#4F4F4F",
          800: "#2B2826", // Deep Editorial Charcoal
          900: "#1C1917", // Rich Midnight Charcoal
          950: "#12100E",
        },
        champagne: {
          light: "#FAF5EE",
          DEFAULT: "#EDE3D2",
          dark: "#CDBBA7",
          gold: "#C5A880",
        },
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Playfair Display", "Cinzel", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Plus Jakarta Sans", "Inter", "sans-serif"],
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "50%": { transform: "translateY(-8px) rotate(0.4deg)" },
        },
        "float-reverse": {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "50%": { transform: "translateY(8px) rotate(-0.4deg)" },
        },
        "pulse-slow": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "float-reverse": "float-reverse 7s ease-in-out infinite",
        "pulse-slow": "pulse-slow 4s ease-in-out infinite",
      },
      boxShadow: {
        luxury: "0 20px 40px -15px rgba(28, 25, 23, 0.07)",
        "luxury-hover": "0 30px 60px -12px rgba(28, 25, 23, 0.12)",
        glow: "0 0 25px rgba(197, 168, 128, 0.25)",
      },
    },
  },
  plugins: [],
};

export default config;

