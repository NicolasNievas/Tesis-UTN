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
        "gray-bg": "rgb(249 250 251)",
        "gray-bg-light": "rgb(118 121 126)",
        "gray-txt": "rgb(156 163 175)",
        "black": "rgb(43 55 61)",
        "black-btn": "rgb(23 26 37)",
        "black-hover": "rgb(17 24 39)",
        "blue": "rgb(59 130 246)",
        "white": "rgb(255 253 249)"
      }
    },
  },
  plugins: [],
};
export default config;
