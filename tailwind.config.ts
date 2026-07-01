import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'space-deep': '#080816',
        'electric-blue': '#3264FF',
        'starlight': '#FFFFFF',
        'surface-card': '#121224',
        'surface-container': '#1e2020',
        'surface-container-low': '#1a1c1c',
        'surface-bright': '#37393a',
        'on-surface': '#e2e2e2',
        'on-surface-variant': '#c3c5d8',
        'cv-outline': '#8d90a1',
        'outline-variant': '#434655',
        'cv-primary': '#b7c4ff',
        'cv-error': '#ffb4ab',
        'neon-green': '#4ade80',
      },
      fontFamily: {
        sans: ['var(--font-hanken)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
