// tailwind.config.js
module.exports = {
  content: ["./*.html", "./*.js"],
  darkMode: "media",
  theme: {
    extend: {
      colors: {
        // Jouw kleurenpalet
        purple: {
          // Zacht paars voor overlay
          50: "#f8f8ff", // Nog lichter paars (bijna wit)
          100: "#e6e6fa", // Zeer licht paars (lavender blush)
          DEFAULT: "#d3d0f4ff", // Standaard paars
        },
        indigo: {
          // Voor indigo/donkerpaars
          DEFAULT: "#514ca3ff", // Standaard indigo
          brand: "#514ca3ff",
          dark: "#353268ff", // Donkerpaars
        },
        blue: {
          // Voor lichtblauw
          light: "#bfd8feff", // Lichtblauw
          DEFAULT: "#00E5FF", // Standaard blauw
          brand: "#00E5FF", // standaard blauw
          dark: "#80d2f8ff", // Donkerblauw
        },
        red: {
          // Voor donker Chinees rood
          dark: "#a30000ff", // Donker Chinees rood
          light: "#fecaca", // Roze (als lichte tint van rood)
        },
        sand: {
          // Voor zand (vison)
          light: "#e9e2e2ff", // Zandkleur
          DEFAULT: "#81796fff", // Vison (bruin-grijs)
          brand: "#bfafafff",
          dark: "#a28989ff",
        },
        gray: {
          // Voor lichtgrijs-tinten
          light: "#e4e7edff", // Zeer lichtgrijs
          DEFAULT: "#e7e5ebff", // Lichtgrijs
          brand: "#d2cddcff",
          dark: "#736d7aff", // Donkergrijs (voor tekst, als basis zwart)
        },
        black: "#000000", // Alle tekst zwart
      },
      fontFamily: {
        nunito: ["Nunito", "sans-serif"], // Zodat we 'font-nunito' kunnen gebruiken
      },

      fontSize: {
        "custom-label": [
          "0.9rem",
          {
            lineHeight: "1.5rem",
          },
        ],
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
