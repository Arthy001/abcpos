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
        primary: {
          DEFAULT: "#FE9F43", // Dreams POS signature warm orange
          hover: "#E88B32",
          50: "#FFF8F2",
          100: "#FEEDDC",
          500: "#FE9F43",
          600: "#E88B32",
        },
        secondary: {
          DEFAULT: "#0E1422",
          light: "#F8F9FA",
        },
        sidebar: {
          bg: "#FFFFFF",
          text: "#5B6670",
          activeBg: "#FFF8F2",
          activeText: "#FE9F43",
        },
      },
    },
  },
  plugins: [],
};
export default config;
