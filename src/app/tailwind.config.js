/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0c0c0c",
        surface: "#101011",
        line: "rgba(255,255,255,.06)",
        accent: "#C49044"   // <— ЕДИНЫЙ АКЦЕНТ
      },
      borderRadius: {
        xl: "14px",
        "2xl": "20px",
        "3xl": "28px",
      },
      boxShadow: {
        card: "0 20px 60px rgba(0,0,0,.55)",
        insetHair: "inset 0 1px 0 rgba(255,255,255,.04)",
      }
    },
  },
  plugins: [],
};
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0c0c0c",
        ink: "#e9ecef",
        mut: "#9aa3af",
        line: "rgba(255,255,255,.08)",
        accent: "#c49044",
      },
      boxShadow: {
        soft: "0 12px 40px rgba(0,0,0,.35)",
      },
      borderRadius: {
        xl2: "16px",
      },
    },
  },
  plugins: [],
};
