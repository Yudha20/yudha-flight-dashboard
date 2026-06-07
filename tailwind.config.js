/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(240 5.9% 90%)",
        background: "hsl(0 0% 100%)",
        foreground: "hsl(240 10% 3.9%)",
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'shimmer': 'shimmer 3s infinite linear',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%) translateY(-100%) rotate(-45deg)' },
          '100%': { transform: 'translateX(200%) translateY(200%) rotate(-45deg)' },
        }
      }
    },
  },
  plugins: [],
}
