/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg:      '#0a0a0f',
        surface: '#111118',
        panel:   '#16161f',
        border:  '#1e1e2e',
        gold:    '#c9a84c',
        cyan:    '#4ecdc4',
        rose:    '#e05c7a',
        success: '#52d992',
      },
      fontFamily: {
        mono: ['IBM Plex Mono', 'monospace'],
        sans: ['IBM Plex Sans', 'sans-serif'],
      }
    },
  },
  plugins: [],
}