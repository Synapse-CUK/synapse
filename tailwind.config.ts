import type { Config } from "tailwindcss";

/**
 * Synapse design tokens.
 *
 * Palette taken from the Christ University website: deep navy #0b1f3a,
 * royal blue #0c4d8b and amber-gold #d98600 / #ddae68. Every colour is a CSS
 * variable (see app/globals.css) so the palette lives in one place.
 *
 * Radius rule: surfaces (cards, panels, modals) use rounded-2xl, controls
 * (buttons, inputs, selects) use rounded-xl, chips and badges are fully round,
 * and controls nested inside a control group use rounded-lg.
 */
const token = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: token("canvas"),
        surface: token("surface"),
        sunken: token("sunken"),
        line: { DEFAULT: token("line"), strong: token("line-strong") },
        ink: token("ink"),
        body: token("body"),
        muted: token("muted"),
        band: { DEFAULT: token("band"), ink: token("band-ink") },
        navy: { DEFAULT: token("navy"), tint: token("navy-tint") },
        royal: { DEFAULT: token("royal"), tint: token("royal-tint") },
        gold: {
          DEFAULT: token("gold"),
          soft: token("gold-soft"),
          ink: token("gold-ink"),
          tint: token("gold-tint"),
        },
        primary: {
          DEFAULT: token("primary"),
          hover: token("primary-hover"),
          ink: token("on-primary"),
        },
        accent: { DEFAULT: token("accent"), ink: token("on-accent") },
        success: { DEFAULT: token("success"), tint: token("success-tint"), ink: token("on-success") },
        danger: { DEFAULT: token("danger"), tint: token("danger-tint") },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        soft: "0 1px 2px rgb(var(--shadow) / 0.05), 0 6px 20px -8px rgb(var(--shadow) / 0.12)",
        lift: "0 2px 6px rgb(var(--shadow) / 0.06), 0 22px 48px -18px rgb(var(--shadow) / 0.28)",
        modal: "0 24px 80px -12px rgb(var(--shadow) / 0.45)",
      },
      keyframes: {
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "modal-in": {
          from: { opacity: "0", transform: "translateY(12px) scale(0.98)" },
          to: { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        shimmer: { from: { transform: "translateX(-100%)" }, to: { transform: "translateX(100%)" } },
      },
      animation: {
        "fade-in": "fade-in 200ms ease-out both",
        "modal-in": "modal-in 260ms cubic-bezier(0.16, 1, 0.3, 1) both",
        shimmer: "shimmer 1.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
