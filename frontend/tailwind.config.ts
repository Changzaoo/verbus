import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Verbus — litoral tropical: petróleo do mar (marca) + coral do pôr do sol (acento) + ouro tropical
        brand: {
          DEFAULT: '#0E7C86',
          dark: '#075A62',
          light: '#3FA9B2',
        },
        accent: {
          DEFAULT: '#FF6B5E',
          dark: '#E24A3D',
          light: '#FF9A8F',
        },
        gold: {
          DEFAULT: '#FFB22E',
          dark: '#E8950F',
          light: '#FFCB6B',
        },
        lang: {
          english: '#1CB0F6',
          mandarin: '#FF4B4B',
          spanish: '#FF9600',
          japanese: '#CE82FF',
          german: '#2B70C9',
        },
        correct: '#58CC02',
        wrong: '#FF4B4B',
        warning: '#FFC800',
        xp: '#FF9600',
        gems: '#00C4FF',
        hearts: '#FF4B4B',
        streak: '#FF9600',
        // Tokens semânticos resolvidos por variáveis CSS (suportam dark/terminal)
        surface: 'rgb(var(--surface) / <alpha-value>)',
        canvas: 'rgb(var(--bg) / <alpha-value>)',
        edge: 'rgb(var(--border) / <alpha-value>)',
        ink: 'rgb(var(--text) / <alpha-value>)',
        muted: 'rgb(var(--text-muted) / <alpha-value>)',
      },
      fontFamily: {
        ui: ['Inter', 'system-ui', 'sans-serif'],
        code: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
        display: ['Fraunces', 'Georgia', 'serif'],
      },
      borderRadius: {
        xl2: '1rem',
      },
      boxShadow: {
        btn: '0 4px 0 0 rgba(0,0,0,0.18)',
        'btn-sm': '0 2px 0 0 rgba(0,0,0,0.18)',
        card: '0 2px 0 0 rgb(var(--border)), 0 0 0 2px rgb(var(--border))',
      },
      keyframes: {
        pop: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '60%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shake: {
          '0%,100%': { transform: 'translateX(0)' },
          '20%,60%': { transform: 'translateX(-8px)' },
          '40%,80%': { transform: 'translateX(8px)' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'flame': {
          '0%,100%': { transform: 'scale(1) rotate(-2deg)' },
          '50%': { transform: 'scale(1.08) rotate(2deg)' },
        },
      },
      animation: {
        pop: 'pop 0.3s ease-out',
        shake: 'shake 0.4s ease-in-out',
        float: 'float 3s ease-in-out infinite',
        flame: 'flame 0.8s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
