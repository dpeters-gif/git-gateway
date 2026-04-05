import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
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
      fontFamily: {
        sans: ['"DM Sans"', "system-ui", "-apple-system", "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
      colors: {
        // shadcn semantic tokens
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: {
          DEFAULT: "hsl(var(--background))",
          surface: "hsl(var(--background-surface))",
          subtle: "hsl(var(--background-subtle))",
        },
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          hover: "hsl(var(--primary-hover))",
          light: "hsl(var(--primary-light))",
          surface: "hsl(var(--primary-surface))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
          hover: "hsl(var(--secondary-hover))",
          light: "hsl(var(--secondary-light))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
          hover: "hsl(var(--accent-hover))",
          light: "hsl(var(--accent-light))",
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
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },

        // Gamification colors
        xp: {
          DEFAULT: "hsl(var(--xp))",
          light: "hsl(var(--xp-light))",
        },
        streak: {
          DEFAULT: "hsl(var(--streak))",
          light: "hsl(var(--streak-light))",
        },
        "level-up": {
          DEFAULT: "hsl(var(--level-up))",
          light: "hsl(var(--level-up-light))",
        },
        challenge: {
          DEFAULT: "hsl(var(--challenge))",
          light: "hsl(var(--challenge-light))",
        },
        gold: "hsl(var(--gold))",
        drop: "hsl(var(--drop))",
        "boss-hp": "hsl(var(--boss-hp))",
        "streak-freeze": "hsl(var(--streak-freeze))",

        // Semantic
        success: {
          DEFAULT: "hsl(var(--success))",
          light: "hsl(var(--success-light))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          light: "hsl(var(--warning-light))",
        },
        error: {
          DEFAULT: "hsl(var(--error))",
          light: "hsl(var(--error-light))",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          light: "hsl(var(--info-light))",
        },

        // Time block colors
        "block-school": "hsl(var(--block-school))",
        "block-school-border": "hsl(var(--block-school-border))",
        "block-work": "hsl(var(--block-work))",
        "block-work-border": "hsl(var(--block-work-border))",
        "block-nap": "hsl(var(--block-nap))",
        "block-nap-border": "hsl(var(--block-nap-border))",
        "block-unavailable": "hsl(var(--block-unavailable))",
        "block-unavailable-border": "hsl(var(--block-unavailable-border))",

        // Priority accents
        "priority-high": "hsl(var(--priority-high))",
        "priority-normal": "hsl(var(--priority-normal))",
        "priority-low": "hsl(var(--priority-low))",

        // Child UI
        child: {
          bg: "hsl(var(--child-bg))",
          surface: "hsl(var(--child-surface))",
          accent: "hsl(var(--child-accent))",
          "accent-hover": "hsl(var(--child-accent-hover))",
        },

        // Leaderboard
        "leaderboard-1st": "hsl(var(--leaderboard-1st))",
        "leaderboard-2nd": "hsl(var(--leaderboard-2nd))",
        "leaderboard-3rd": "hsl(var(--leaderboard-3rd))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "20px",
      },
      boxShadow: {
        sm: "0 1px 3px rgba(45,50,41,0.06)",
        md: "0 4px 12px rgba(45,50,41,0.08)",
        lg: "0 8px 24px rgba(45,50,41,0.12)",
        xl: "0 20px 40px rgba(45,50,41,0.15)",
        "glow-xp": "0 0 20px rgba(255,176,32,0.3)",
        "glow-streak": "0 0 16px rgba(255,107,53,0.25)",
        "glow-levelup": "0 0 30px rgba(124,77,255,0.3)",
      },
      fontSize: {
        xs: ["0.8125rem", { lineHeight: "1.35" }],    /* 13px — minimum */
        sm: ["0.8125rem", { lineHeight: "1.35" }],     /* 13px secondary/meta */
        base: ["0.9375rem", { lineHeight: "1.5" }],    /* 15px body */
        md: ["1.0625rem", { lineHeight: "1.35" }],     /* 17px card titles / section headings */
        lg: ["1.25rem", { lineHeight: "1.35" }],       /* 20px */
        xl: ["1.5rem", { lineHeight: "1.2" }],         /* 24px page titles */
        "2xl": ["2rem", { lineHeight: "1.0" }],        /* 32px achievement numbers */
        display: ["2.5rem", { lineHeight: "1.2" }],
      },
      spacing: {
        "app-bar": "56px",
        "bottom-nav": "64px",
        fab: "56px",
        sidebar: "240px",
        "sidebar-collapsed": "72px",
        "content-max": "960px",
        "form-max": "640px",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
