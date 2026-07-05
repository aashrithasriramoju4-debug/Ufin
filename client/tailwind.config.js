module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Background colors
        background: {
          DEFAULT: '#0b0f19', // deep dark
          light: '#ffffff',
        },
        // Surface colors
        surface: {
          DEFAULT: '#111827', // dark gray cards
          light: '#f8fafc',
        },
        // Primary colors
        primary: {
          DEFAULT: '#6366f1', // indigo
          light: '#4f46e5',
        },
        // Secondary colors
        secondary: {
          DEFAULT: '#22c55e', // green
          light: '#16a34a',
        },
        // Accent colors
        accent: {
          DEFAULT: '#06b6d4', // cyan
          light: '#0891b2',
        },
        // Text colors
        text: {
          primary: {
            DEFAULT: '#e5e7eb', // light gray
            light: '#111827', // dark
          },
          secondary: {
            DEFAULT: '#9ca3af', // muted gray
            light: '#6b7280', // darker muted
          },
        },
        // Border colors
        border: {
          DEFAULT: '#1f2937', // dark border
          light: '#e5e7eb', // light border
        },
        // Glass effect
        glass: {
          DEFAULT: 'rgba(255, 255, 255, 0.05)',
          light: 'rgba(0, 0, 0, 0.05)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Geist', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
        lg: '16px',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 3s ease-in-out infinite',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'stagger': 'stagger 0.1s ease-out',
        'gradient-x': 'gradient-x 3s ease infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        stagger: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(99, 102, 241, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(99, 102, 241, 0.8)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        'gradient-x': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: []
};
