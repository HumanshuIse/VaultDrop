/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    fontFamily: {
      sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3b82f6', // blue-500
          dark: '#2563eb',    // blue-600
          light: '#60a5fa',   // blue-400
        },
        background: {
          light: '#f8fafc',   // slate-50
          dark: '#181c24',    // custom dark
        },
        accent: {
          DEFAULT: '#818cf8', // indigo-400
        },
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.18)',
      },
      borderRadius: {
        'xl': '1.25rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
}
