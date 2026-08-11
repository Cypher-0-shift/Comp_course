/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
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
        // ── SRM / Stitch Institutional Design Tokens ─────────────────────
        srm: {
          primary:           "#001941",
          "primary-dim":     "#0b2e63",
          "primary-fixed":   "#d8e2ff",
          "primary-fixed-dim": "#aec6ff",
          "on-primary":      "#ffffff",
          "on-primary-fixed-variant": "#29467b",
          "soft-blue":       "#e8f0fe",
          "soft-blue-text":  "#1e40af",
          "cream":           "#faf7f2",
          "cream-text":      "#57534e",
          "cool-grey":       "#f1f5f9",
          "grey-text":       "#475569",
          surface:           "#fcf9f8",
          "surface-low":     "#f6f3f2",
          "surface-container": "#f0eded",
          "surface-high":    "#eae7e7",
          "surface-white":   "#ffffff",
          "on-surface":      "#1c1b1b",
          "on-surface-muted": "#44474f",
          outline:           "#747781",
          "outline-variant": "#c4c6d1",
          error:             "#ba1a1a",
          "error-container": "#ffdad6",
          "on-error-container": "#93000a",
        },
      },
      fontFamily: {
        sans: ["'SF Pro'", "-apple-system", "BlinkMacSystemFont", "'SF Pro Text'", "'SF Pro Display'", "'Plus Jakarta Sans'", "system-ui", "sans-serif"],
        display: ["'SF Pro Display'", "-apple-system", "BlinkMacSystemFont", "'SF Pro'", "'Plus Jakarta Sans'", "sans-serif"],
        body: ["'SF Pro'", "-apple-system", "BlinkMacSystemFont", "'SF Pro Text'", "'Plus Jakarta Sans'", "sans-serif"],
        meta: ["'SF Pro Text'", "-apple-system", "BlinkMacSystemFont", "'SF Pro'", "sans-serif"],
        mono: ["'SF Mono'", "ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "'Liberation Mono'", "'Courier New'", "monospace"],
        rounded: ["'SF Pro Rounded'", "-apple-system", "BlinkMacSystemFont", "system-ui", "sans-serif"],
        jakarta: ["'Plus Jakarta Sans'", "sans-serif"],
        outfit: ["Outfit", "sans-serif"],
        inter: ["Inter", "sans-serif"],
      },
      spacing: {
        "sidebar-width": "280px",
        "sidebar-collapsed": "80px",
        "topbar-height": "64px",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
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
  plugins: [],
}