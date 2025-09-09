module.exports = {
  i18n: {
    defaultLocale: 'fr',
    locales: ['fr', 'en', 'sr'],
    localeDetection: true,
  },
  reloadOnPrerender: process.env.NODE_ENV === 'development',
  fallbackLng: 'fr',
  debug: process.env.NODE_ENV === 'development',
};
