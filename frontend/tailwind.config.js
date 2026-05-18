/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#07070f",
        secondary: "#00a7a7",
        "primary-light": "rgba(4, 85, 191, 0.14)",
        "text-primary": "#2c3e50",
        "text-secondary": "#7a8fa3",
        "bg-light": "#f8fafc",
        "bg-dark": "#f0f4f9",
        "border-color": "#e0e7f1",
      },
      backgroundColor: {
        primary: "#07070f",
        "primary-light": "rgba(4, 85, 191, 0.14)",
        light: "#f8fafc",
        dark: "#f0f4f9",
      },
      textColor: {
        primary: "#2c3e50",
        secondary: "#7a8fa3",
      },
      borderColor: {
        light: "#e0e7f1",
      },
      fontFamily: {
        sans: ["Sora", "system-ui", "sans-serif"],
      },
      animation: {
        rise: "rise 500ms ease",
        "slow-spin": "slow-spin 8s linear infinite",
      },
      keyframes: {
        rise: {
          "0%": {
            opacity: "0",
            transform: "translateY(8px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        "slow-spin": {
          from: {
            transform: "rotate(0deg)",
          },
          to: {
            transform: "rotate(360deg)",
          },
        },
      },
    },
  },
  plugins: [],
};
