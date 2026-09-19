export default {
  mode: "jit",
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [
    function ({ addUtilities, addBase }) {
      addBase({
        "*::-webkit-scrollbar": { width: "6px", height: "6px" },
        "*::-webkit-scrollbar-track": { "background-color": "transparent" },
        "*::-webkit-scrollbar-thumb": {
          "background-color": "rgba(0, 0, 0, 0.2)",
          "border-radius": "3px",
        },
        "*::-webkit-scrollbar-thumb:hover": { "background-color": "rgba(0, 0, 0, 0.3)" },
        "*": { "scrollbar-color": "rgba(0, 0, 0, 0.2) transparent" },
      });
      addUtilities({
        ".center-absolute": {
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        },
        ".scrollbar-hide": {
          "scrollbar-width": "none",
          "-ms-overflow-style": "none",
          "&::-webkit-scrollbar": { display: "none" },
        },
      });
    },
  ],
};
