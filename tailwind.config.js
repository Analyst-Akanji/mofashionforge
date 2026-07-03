/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        black:        "#0F0F0F",
        ivory:        "#FAF8F3",
        "ivory-dark": "#F0EDE6",
        olive:        "#3B4A3E",
        "olive-dark": "#2A3830",
        gold:         "#B8973A",
        "gold-dark":  "#9A7D2E",
        charcoal:     "#1A1A1A",
        muted:        "#6B6B6B",
      },
      fontFamily: {
        display: ["'Cormorant Garamond'", "Georgia", "serif"],
        body:    ["'Inter'", "sans-serif"],
      },
      letterSpacing: {
        wider2: "0.12em",
      },
    },
  },
  plugins: [],
};
