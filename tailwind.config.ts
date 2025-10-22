import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      backgroundImage: {
        "primary-gradient": "var(--primary-gradient)",
      },
      borderRadius: {
        card: "var(--radius-card)",
        button: "var(--radius-button)",
        input: "var(--radius-input)",
        badge: "var(--radius-badge)",
        xl: "var(--radius-card)",
        lg: "calc(var(--radius-card) - 4px)",
        md: "calc(var(--radius-card) - 6px)",
        sm: "calc(var(--radius-card) - 8px)",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
      },
      fontFamily: {
        sans: ["var(--font-plus-jakarta)", ...fontFamily.sans],
      },
      fontSize: {
        h1: [
          "32px",
          { lineHeight: "40px", letterSpacing: "-0.01em", fontWeight: "700" },
        ],
        h2: [
          "24px",
          { lineHeight: "32px", letterSpacing: "-0.01em", fontWeight: "600" },
        ],
        h3: [
          "18px",
          { lineHeight: "24px", letterSpacing: "-0.005em", fontWeight: "600" },
        ],
        body: [
          "16px",
          { lineHeight: "24px", letterSpacing: "0", fontWeight: "400" },
        ],
        small: [
          "14px",
          { lineHeight: "20px", letterSpacing: "0", fontWeight: "400" },
        ],
        tiny: [
          "12px",
          {
            lineHeight: "16px",
            letterSpacing: "0.05em",
            fontWeight: "500",
            textTransform: "uppercase",
          },
        ],
      },
      transitionDuration: {
        fast: "var(--duration-fast)",
        normal: "var(--duration-normal)",
        slow: "var(--duration-slow)",
      },
      transitionTimingFunction: {
        in: "var(--ease-in)",
        out: "var(--ease-out)",
        "in-out": "var(--ease-in-out)",
      },
      keyframes: {
        "slide-in-from-bottom": {
          "0%": { transform: "translateY(12px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "slide-in-from-top": {
          "0%": { transform: "translateY(-12px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-4px)" },
          "50%": { transform: "translateX(4px)" },
          "75%": { transform: "translateX(-2px)" },
        },
        "typing-dot": {
          "0%, 80%, 100%": { transform: "scale(0.6)", opacity: "0.4" },
          "40%": { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        "slide-in-from-bottom":
          "slide-in-from-bottom var(--duration-fast) var(--ease-out) both",
        "slide-in-from-top":
          "slide-in-from-top var(--duration-fast) var(--ease-out) both",
        "fade-in": "fade-in var(--duration-fast) var(--ease-out) both",
        shake: "shake var(--duration-normal) var(--ease-in-out) both",
        "typing-dot": "typing-dot 0.9s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
