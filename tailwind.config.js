export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      keyframes: {
        fadeIn: { "0%": { opacity: 0 }, "100%": { opacity: 1 } },
        slideUp: {
          "0%": { opacity: 0, transform: "translateY(20px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        lightboxFade: {
          "0%": { opacity: 0, transform: "scale(0.95)" },
          "100%": { opacity: 1, transform: "scale(1)" },
        },
      },
      animation: {
        "fade-in": "fadeIn 1.2s ease-in-out",
        "slide-up": "slideUp 1.2s ease-in-out",
        "lightbox-fade": "lightboxFade 0.3s ease-in-out",
      },
    },
  },
  plugins: [],
};
