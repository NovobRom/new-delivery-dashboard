/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class', // Enable class-based dark mode
    theme: {
        extend: {
            colors: {
                brand: {
                    red: '#DA291C',       // Alizarin Crimson
                    maroon: '#850001',    // Maroon
                    periwinkle: '#BDD6E6',// Periwinkle Gray
                    dark: '#0f172a',      // Slate 900 (Background)
                    card: '#1e293b',      // Slate 800 (Card)
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
