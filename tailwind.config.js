/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0B0E14",
        panel: "#12151F",
        panel2: "#171B27",
        border: "#232838",
        ink: "#EDEFF5",
        "ink-soft": "#8B92A5",
        "ink-faint": "#5A6178",
        violet: { DEFAULT: "#8B5CF6", soft: "rgba(139,92,246,0.15)" },
        cyan: "#22D3EE",
        grow: { DEFAULT: "#3DDC97", soft: "rgba(61,220,151,0.12)" },
        flag: { DEFAULT: "#F0B75C", soft: "rgba(240,183,92,0.12)" },
      },
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderRadius: { card: "14px" },
    },
  },
  plugins: [],
};
