/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        farlx: {
          bg: "#031513",
          bg2: "#061C19",
          bg3: "#08231F",
          primary: "#19D979",
          primary2: "#22C55E",
          secondary: "#0E8F5A",
          accent: "#7CFFB2",
          text: "#F4FFF9",
          muted: "#8FA8A0",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
}