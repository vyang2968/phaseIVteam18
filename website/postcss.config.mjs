const config = {
  content: [
    './src/pages/**/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
export default config;