/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // optional custom colors
      },
      backgroundImage: {
        'gradient-glass': 'linear-gradient(to right, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [

  ],
}
