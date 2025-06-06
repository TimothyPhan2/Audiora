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
        // New color palette
        lapis_lazuli: {
          DEFAULT: '#05668d',
          100: '#011219',
          200: '#022533',
          300: '#03374c',
          400: '#044a66',
          500: '#05668d',
          600: '#0784b5',
          700: '#09a2dd',
          800: '#2bb8ef',
          900: '#6ed0f4',
        },
        teal: {
          DEFAULT: '#028090',
          100: '#01191c',
          200: '#013238',
          300: '#024b54',
          400: '#026470',
          500: '#028090',
          600: '#03a6bb',
          700: '#04cce6',
          800: '#26e0f7',
          900: '#71ebfa',
        },
        persian_green: {
          DEFAULT: '#00a896',
          100: '#00211e',
          200: '#00423c',
          300: '#006359',
          400: '#008477',
          500: '#00a896',
          600: '#00d6c1',
          700: '#0bfce3',
          800: '#42fde9',
          900: '#85fef1',
        },
        mint: {
          DEFAULT: '#02c39a',
          100: '#01271f',
          200: '#014e3e',
          300: '#02745c',
          400: '#029b7b',
          500: '#02c39a',
          600: '#03f5c3',
          700: '#35f7d1',
          800: '#6cf9de',
          900: '#a3fbeb',
        },
        cream: {
          DEFAULT: '#f0f3bd',
          100: '#e1e67b',
          200: '#e5e98a',
          300: '#e8ec99',
          400: '#ecefa8',
          500: '#f0f3bd',
          600: '#f3f5c7',
          700: '#f6f8d1',
          800: '#f9fadb',
          900: '#fcfde5',
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