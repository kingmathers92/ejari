import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        terracotta: {
          DEFAULT: "#C4522A",
          light: "#E87A50",
          pale: "#FAECE7",
        },
        ink: {
          DEFAULT: "#1C1A14",
          muted: "#6B6860",
        },
        sand: {
          DEFAULT: "#F5EFE0",
          light: "#FDFAF4",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;