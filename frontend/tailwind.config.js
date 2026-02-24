/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'saffron': '#ff9933', /* Indian flag saffron */
        'green': {
          DEFAULT: '#138808', /* Indian flag green */
          500: '#16a34a', /* Lighter green for focus ring */
          600: '#15803d', /* Darker green for hover */
        },
        'navy-blue': '#000080', /* Indian flag navy blue */
        'text-primary': '#ffffff', /* White text for dark theme */
        'text-secondary': '#d1d5db', /* Light gray for secondary text */
        'error-red': '#e63946', /* Softer red for errors */
        'background-gray': '#040b13', /* Dark background */
        'card-bg': '#040b13', /* Dark for cards */
      },
    },
  },
  plugins: [],
}