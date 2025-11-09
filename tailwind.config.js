import defaultTheme from 'tailwindcss/defaultTheme';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Space Grotesk"', ...defaultTheme.fontFamily.sans],
      },
      boxShadow: {
        aurora: '0 40px 80px -40px rgba(56, 189, 248, 0.35)',
      },
      colors: {
        gallery: {
          midnight: '#020617',
          indigo: '#4338ca',
        },
      },
    },
  },
  plugins: [],
};
