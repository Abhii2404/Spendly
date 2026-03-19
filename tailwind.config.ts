import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--brand-background)",
        surface: "var(--brand-surface)",
        primary: "var(--brand-primary)",
        secondary: "var(--brand-secondary)",
        expense: "var(--brand-expense)",
        warning: "var(--brand-warning)",
        muted: "var(--brand-muted)",
      },
    },
  },
  plugins: [],
};
export default config;
