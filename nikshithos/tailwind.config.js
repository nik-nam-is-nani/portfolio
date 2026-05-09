/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    container: { center: true, padding: '1rem' },
    extend: {
      colors: {
        primary: { DEFAULT: 'var(--primary)', foreground: 'var(--primary-foreground)' },
        accent: { DEFAULT: 'var(--accent)', foreground: 'var(--accent-foreground)' },
        accent2: { DEFAULT: 'var(--accent2)', foreground: 'var(--accent2-foreground)' },
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        secondary: { DEFAULT: 'var(--secondary)', foreground: 'var(--secondary-foreground)' },
        muted: { DEFAULT: 'var(--muted)', foreground: 'var(--muted-foreground)' },
        card: { DEFAULT: 'var(--card)', foreground: 'var(--card-foreground)' },
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
      },
      borderRadius: {
        DEFAULT: 'var(--radius)',
        sm: 'calc(var(--radius) + 2px)',
        md: 'calc(var(--radius) + 4px)',
        lg: 'calc(var(--radius) + 8px)',
      },
      fontFamily: {
        sans: ['var(--font-outfit)', 'Outfit', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'JetBrains Mono', 'monospace'],
        display: ['var(--font-orbitron)', 'Orbitron', 'sans-serif'],
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};