import type { Config } from "tailwindcss";

const token = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: { DEFAULT: "1rem", sm: "1.5rem" }, screens: { "2xl": "1200px" } },
    extend: {
      fontFamily: {
        sans: ['"Manrope Variable"', "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
      },
      colors: {
        bg: token("bg"),
        surface: { DEFAULT: token("surface"), 2: token("surface-2") },
        ink: { DEFAULT: token("ink"), 2: token("ink-2"), 3: token("ink-3") },
        line: { DEFAULT: token("line"), strong: token("line-strong") },
        brand: { DEFAULT: token("brand"), ink: token("brand-ink"), soft: token("brand-soft"), hover: token("brand-hover") },
        deal: { DEFAULT: token("deal"), ink: token("deal-ink") },
        warn: { DEFAULT: token("warn"), soft: token("warn-soft") },
        danger: { DEFAULT: token("danger"), soft: token("danger-soft") },
      },
      borderRadius: { card: "16px", control: "10px" },
      boxShadow: {
        card: "0 1px 0 rgb(var(--shadow) / 0.04), 0 1px 3px rgb(var(--shadow) / 0.06)",
        pop: "0 12px 32px -8px rgb(var(--shadow) / 0.22), 0 2px 6px rgb(var(--shadow) / 0.08)",
      },
      keyframes: {
        shimmer: { "100%": { transform: "translateX(100%)" } },
        "fade-up": { from: { opacity: "0", transform: "translateY(4px)" }, to: { opacity: "1", transform: "none" } },
      },
      animation: {
        shimmer: "shimmer 1.4s infinite",
        "fade-up": "fade-up 160ms ease-out",
      },
    },
  },
  plugins: [],
};
export default config;
