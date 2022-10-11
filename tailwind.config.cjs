const defaultTheme = require('tailwindcss/defaultTheme');

const fontTitle = ['"Nunito Sans"', ...defaultTheme.fontFamily.sans];
const fontBody = ['Roboto', ...defaultTheme.fontFamily.sans];
const customTypographyCSS = (theme) => ({
  css: [
    {
      a: {
        color: '#0000EE',
      },
      p: {
        fontFamily: `${theme('fontFamily.body')}`,
      },
      h3: {
        fontFamily: `${theme('fontFamily.title')}`,
        fontSize: theme('fontSize.2xl')[0],
        fontWeight: theme('fontWeight.bold'),
      },
    },
  ],
});

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      fontFamily: {
        title: fontTitle,
        body: fontBody,
      },
      screens: {
        mm: '300px',
      },
      typography: (theme) => ({
        DEFAULT: customTypographyCSS(theme),
        lg: customTypographyCSS(theme),
      }),
    },
  },
  plugins: [require('@tailwindcss/typography'), require('@tailwindcss/forms')],
};
