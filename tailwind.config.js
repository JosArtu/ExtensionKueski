/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./popup.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
      colors: {
        kueski: {
          50: "#eef0fe",
          100: "#e0e3fd",
          200: "#c3c7fb",
          300: "#9da3f7",
          400: "#7379f0",
          500: "#4648e8",
          600: "#3a3cd4",
          700: "#3133b3",
          800: "#2a2c91",
          900: "#252774",
        },
      },
      boxShadow: {
        popup: "0 8px 32px rgba(70, 72, 232, 0.14)",
        card: "0 4px 20px rgba(70, 72, 232, 0.08)",
      },
    },
  },
  plugins: [],
};
