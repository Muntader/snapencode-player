/** @type {import('tailwindcss').Config} */
const { fontFamily } = require('tailwindcss/defaultTheme');
/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/**/*.{js,ts,jsx,tsx}', // Make sure this path is correct for your library
    ],
    theme: {
        extend: {
            colors: {
                // This rule tells Tailwind to look for the --theme-primary variable.
                primary: 'rgb(var(--color-primary), <alpha-value>)',
            },
            fontFamily: {
                sans: ['var(--theme-font)'],
            }
        }
    },
    plugins: [],
}
