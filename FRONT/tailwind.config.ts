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
        "gray-bg": "#f9fafb",
        "gray-bg-light": "#76797e",
        "gray-txt": "#9ca3af",
        "black": "#2b373d",
        "black-btn": "#171a25",
        "black-hover": "#111827",
        "brand-blue": "#3b82f6",
        "white": "#fffdf9"
      }
    },
  },
  plugins: [],
};
export default config;
