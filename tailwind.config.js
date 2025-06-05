/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        // Custom color palette
        charcoal: {
          DEFAULT: '#264653',
          100: '#080e11',
          200: '#0f1c22',
          300: '#172b32',
          400: '#1f3943',
          500: '#264653',
          600: '#3f7489',
          700: '#609db6',
          800: '#95bece',
          900: '#cadee7',
        },
        persian: {
          DEFAULT: '#2a9d8f',
          100: '#081f1d',
          200: '#113f39',
          300: '#195e56',
          400: '#217e73',
          500: '#2a9d8f',
          600: '#3acbba',
          700: '#6cd8cb',
          800: '#9de5dc',
          900: '#cef2ee',
        },
        saffron: {
          DEFAULT: '#e9c46a',
          100: '#3b2c09',
          200: '#755912',
          300: '#b0851a',
          400: '#e0ad2e',
          500: '#e9c46a',
          600: '#edd086',
          700: '#f1dca4',
          800: '#f6e7c3',
          900: '#faf3e1',
        },
        sandy: {
          DEFAULT: '#f4a261',
          100: '#401f04',
          200: '#803e09',
          300: '#c05e0d',
          400: '#f07e22',
          500: '#f4a261',
          600: '#f6b681',
          700: '#f8c8a1',
          800: '#fbdac0',
          900: '#fdede0',
        },
        sienna: {
          DEFAULT: '#e76f51',
          100: '#371107',
          200: '#6e220f',
          300: '#a43316',
          400: '#db441e',
          500: '#e76f51',
          600: '#ec8b73',
          700: '#f1a896',
          800: '#f5c5b9',
          900: '#fae2dc',
        },
        chart: {
          1: 'hsl(var(--chart-1))',
          2: 'hsl(var(--chart-2))',
          3: 'hsl(var(--chart-3))',
          4: 'hsl(var(--chart-4))',
          5: 'hsl(var(--chart-5))',
        },
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        fadeInUp: {
          from: { 
            opacity: '0',
            transform: 'translateY(20px)'
          },
          to: { 
            opacity: '1',
            transform: 'translateY(0)'
          },
        },
        slideUp: {
          from: { transform: 'translateY(20px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        pulse: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fadeIn 0.8s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.8s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse': 'pulse 2s ease-in-out infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};