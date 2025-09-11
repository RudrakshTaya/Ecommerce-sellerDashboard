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
        // Brand palette: navy/charcoal/stone with subtle gold & teal accents
        craft: {
          50: "#f5f7fb",
          100: "#eef4fb",
          200: "#d8e6f7",
          300: "#b7d3f0",
          400: "#84afdf",
          500: "#234d76",
          600: "#1d4163",
          700: "#17324b",
          800: "#0f2435",
          900: "#0a1824",
        },
        earth: {
          50: "#fbfbfc",
          100: "#f5f6f7",
          200: "#e9ebee",
          300: "#d6d9de",
          400: "#bfc5cc",
          500: "#9aa3ab",
          600: "#7c858b",
          700: "#5f686d",
          800: "#454b4e",
          900: "#2e3335",
        },
        warm: {
          50: "#fbf8f5",
          100: "#f6f1ec",
          200: "#efe6d9",
          300: "#e6d3ba",
          400: "#d8bd8f",
          500: "#b9924e",
          600: "#a07e3f",
          700: "#7b5f31",
          800: "#574427",
          900: "#3e2f1f",
        },
        sage: {
          50: "#f7f9f7",
          100: "#eef5ee",
          200: "#dfebe0",
          300: "#cde0c8",
          400: "#b5c9a6",
          500: "#8fa776",
          600: "#728a60",
          700: "#556a49",
          800: "#3d4f36",
          900: "#2b3b27",
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
