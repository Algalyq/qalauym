/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#093FB4",
        secondary: "#ED3500",
        background: "#FFFCFB",
        accent: "#FFD8D8",
      },
    },
  },
  plugins: [],
  // Enable JIT mode
  mode: 'jit'
}
