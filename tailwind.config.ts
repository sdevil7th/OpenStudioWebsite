import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
        "3xl": "1760px",
        "4xl": "2400px",
      },
    },
    extend: {
      screens: {
        "3xl": "2560px",
        "4xl": "3840px",
      },
      fontFamily: {
        display: ["Orbitron", "sans-serif"],
        headline: ["Space Grotesk", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
        body: ["Inter", "sans-serif"],
        sans: ["Inter", "sans-serif"],
      },
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
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        neon: {
          cyan: "hsl(var(--neon-cyan))",
          blue: "hsl(var(--neon-blue))",
          purple: "hsl(var(--neon-purple))",
          pink: "hsl(var(--neon-pink))",
        },
        signal: {
          lavender: "hsl(var(--signal-lavender))",
          emerald: "hsl(var(--signal-emerald))",
          amber: "hsl(var(--signal-amber))",
          frost: "hsl(var(--signal-frost))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-14px)" },
        },
        "glow-drift": {
          "0%, 100%": { transform: "translate3d(0, 0, 0) scale(1)" },
          "50%": { transform: "translate3d(0, -18px, 0) scale(1.04)" },
        },
        "pulse-border": {
          "0%, 100%": { boxShadow: "0 0 0 1px hsl(var(--primary) / 0.2)" },
          "50%": { boxShadow: "0 0 0 1px hsl(var(--primary) / 0.45), 0 0 40px hsl(var(--primary) / 0.16)" },
        },
        "signal-drift": {
          "0%, 100%": { transform: "translate3d(0, 0, 0)" },
          "50%": { transform: "translate3d(0, -12px, 0)" },
        },
        "meter-rise": {
          "0%, 100%": { transform: "scaleY(0.45)" },
          "50%": { transform: "scaleY(1)" },
        },
        waveform: {
          "0%, 100%": { transform: "translateX(0%) translateY(0px)" },
          "50%": { transform: "translateX(-3%) translateY(-6px)" },
        },
        "rotate-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
      },
      animation: {
        float: "float 8s ease-in-out infinite",
        "glow-drift": "glow-drift 12s ease-in-out infinite",
        "pulse-border": "pulse-border 3s ease-in-out infinite",
        "signal-drift": "signal-drift 9s ease-in-out infinite",
        "meter-rise": "meter-rise 1.6s ease-in-out infinite",
        waveform: "waveform 8s ease-in-out infinite",
        "rotate-slow": "rotate-slow 18s linear infinite",
      },
      backgroundImage: {
        "neon-radial":
          "radial-gradient(circle at top, hsl(var(--primary) / 0.24), transparent 35%), radial-gradient(circle at 80% 20%, hsl(var(--secondary) / 0.2), transparent 30%), radial-gradient(circle at 20% 80%, hsl(var(--accent) / 0.18), transparent 35%)",
        grid:
          "linear-gradient(to right, hsl(var(--border) / 0.18) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--border) / 0.18) 1px, transparent 1px)",
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
