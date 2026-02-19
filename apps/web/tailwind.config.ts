import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: 'var(--brand)',
          light: 'var(--brand-light)',
          dark: 'var(--brand-dark)',
        },
        surface: {
          DEFAULT: 'var(--surface)',
          secondary: 'var(--surface-secondary)',
          tertiary: 'var(--surface-tertiary)',
          elevated: 'var(--surface-elevated)',
        },
        content: {
          DEFAULT: 'var(--content)',
          secondary: 'var(--content-secondary)',
          tertiary: 'var(--content-tertiary)',
          inverse: 'var(--content-inverse)',
        },
        edge: {
          DEFAULT: 'var(--edge)',
          light: 'var(--edge-light)',
        },
      },
    },
  },
  plugins: [],
};
export default config;
