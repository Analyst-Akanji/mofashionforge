/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        linen: "#F3EDE4",
        cardwhite: "#FAF7F2",
        umber: "#2E2A22",
        taupe: "#A89078",
        sage: "#8B8F6B",
        terracotta: "#C97B68",
        "terracotta-dark": "#B3614F",
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        body: ["'General Sans'", "Inter", "sans-serif"],
      },
      letterSpacing: {
        wider2: "0.12em",
      },
    },
  },
  plugins: [],
};
