/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-fraunces)", "Georgia", "serif"],
        body: ["var(--font-plus-jakarta)", "sans-serif"],
      },
      colors: {
        cream: {
          50:  "#fdfaf4",
          100: "#f9f2e3",
          200: "#f2e4c4",
          300: "#e8cea0",
        },
        terra: {
          400: "#c4714a",
          500: "#b05a35",
          600: "#8f4527",
        },
        forest: {
          700: "#2d4a3e",
          800: "#1e3329",
          900: "#121f19",
        },
        stone: {
          warm: "#6b5f52",
        },
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        card: "0 2px 16px 0 rgba(30,51,41,0.08), 0 1px 4px 0 rgba(30,51,41,0.06)",
        "card-hover": "0 8px 32px 0 rgba(30,51,41,0.14), 0 2px 8px 0 rgba(30,51,41,0.08)",
      },
    },
  },
  plugins: [],
};
