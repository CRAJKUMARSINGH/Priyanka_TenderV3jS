module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        // add other shadcn/ui colours here if you need them
      },
    },
  },
  plugins: [],
};