import tailwindcss from "@tailwindcss/vite";

export default {
    content: [
      "./index.html",
      "./src/**/*.{js,jsx,ts,tsx}"
    ],
    theme: {
      extend: {},
    },
    plugins: [
    tailwindcss(),
    reactRouter(),
    tsconfigPaths(),
    ],
  };
  