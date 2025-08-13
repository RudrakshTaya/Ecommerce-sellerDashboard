import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./customer/**/*.{ts,tsx}", "./index.html"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Handmade crafts palette
        craft: {
          50: "#fdf8f3",
          100: "#f9eee0",
          200: "#f0d5b8",
          300: "#e7bc8f",
          400: "#dd9658",
          500: "#d27b3a",
          600: "#c46030",
          700: "#a3482a",
          800: "#843b28",
          900: "#6f4331",
        },
        earth: {
          50: "#f7f5f3",
          100: "#ede8e3",
          200: "#ddd2c8",
          300: "#c7b5a5",
          400: "#a48b6f",
          500: "#8f7054",
          600: "#7a5e48",
          700: "#655040",
          800: "#534238",
          900: "#453a32",
        },
        warm: {
          50: "#fdf6f0",
          100: "#f9e8d5",
          200: "#f2cea7",
          300: "#e8aa72",
          400: "#dd7d3f",
          500: "#d15d1f",
          600: "#c24315",
          700: "#a13214",
          800: "#842817",
          900: "#6d2115",
        },
        sage: {
          50: "#f5f7f0",
          100: "#e7ecdd",
          200: "#d1d9bf",
          300: "#b3c197",
          400: "#93a56f",
          500: "#758852",
          600: "#5a6940",
          700: "#475235",
          800: "#3b432d",
          900: "#343a28",
        },
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
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
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
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in",
        "slide-up": "slideUp 0.3s ease-out",
        "bounce-subtle": "bounceSubtle 0.6s ease-in-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        bounceSubtle: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
