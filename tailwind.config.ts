// tailwind.config.js
/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#050609",
        surface: "#101118",
        line: "rgba(255,255,255,0.06)",
        accent: "var(--accent)",
      },
    },
  },
  plugins: [],
};

export default config;
