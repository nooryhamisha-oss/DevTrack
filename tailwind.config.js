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
      keyframes: {
        scanSweep: {
          "0%": { transform: "translateY(-110%)", opacity: "0" },
          "10%": { opacity: "1" },
          "90%": { opacity: "1" },
          "100%": { transform: "translateY(110%)", opacity: "0" },
        },
        floatY: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "scan-sweep": "scanSweep 3.5s ease-in-out infinite",
        "float-slow": "floatY 5s ease-in-out infinite",
        "float-slower": "floatY 7s ease-in-out infinite",
        "fade-in-up": "fadeInUp 0.5s ease-out both",
      },
    },
  },
  plugins: [],
};
