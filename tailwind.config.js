const generateFontSize = () => {
  const result = {};
  for (let i = 10; i < 32; i++) {
    result[i] = `${i}px`;
  }
  return result;
};
const generateSpace = () => {
  const result = {};
  for (let i = 0; i < 8; i++) {
    result[i] = `${i * 5}px`;
  }
  return result;
};

module.exports = {
  content: ['./public/**/*.html', './src/**/*.{js,jsx,ts,tsx,vue}'],
  darkMode: 'class', // or 'media' or 'class'
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {},
    fontWeight: {
      1: 100,
      2: 200,
      3: 300,
      4: 400,
      5: 500,
      6: 600,
      7: 700,
      8: 800,
      9: 900,
    },
    fontSize: {
      ...generateFontSize(),
    },
    spacing: {
      ...generateSpace(),
    },
  },
  variants: {},
  plugins: [],
};
