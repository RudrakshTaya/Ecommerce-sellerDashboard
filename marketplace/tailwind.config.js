/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Warm artisanal color palette
        craft: {
          50: '#fdf8f3',
          100: '#faf0e4',
          200: '#f4dfc8',
          300: '#ecc8a0',
          400: '#e3ab76',
          500: '#dd9658',
          600: '#cf7f4c',
          700: '#ac6441',
          800: '#8a523a',
          900: '#6f4331',
        },
        earth: {
          50: '#f7f5f3',
          100: '#ede8e3',
          200: '#ddd4c9',
          300: '#c7b9a7',
          400: '#b29e85',
          500: '#a48b6f',
          600: '#977c63',
          700: '#7e6653',
          800: '#665547',
          900: '#53453a',
        },
        warm: {
          50: '#fdf7f0',
          100: '#fbeee1',
          200: '#f6dbc2',
          300: '#f0c299',
          400: '#e8a46e',
          500: '#e2944d',
          600: '#d47d42',
          700: '#b16538',
          800: '#8d5232',
          900: '#72442a',
        },
        sage: {
          50: '#f6f7f4',
          100: '#e9ebe4',
          200: '#d4d8cb',
          300: '#b8c0a8',
          400: '#9ba685',
          500: '#828e6a',
          600: '#687252',
          700: '#535c43',
          800: '#454b38',
          900: '#3a3f30',
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        serif: ['Playfair Display', 'ui-serif', 'Georgia'],
        handwritten: ['Dancing Script', 'cursive'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'warm': '0 4px 20px -2px rgba(221, 150, 88, 0.25)',
        'craft': '0 4px 20px -2px rgba(172, 100, 65, 0.25)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
