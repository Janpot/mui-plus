module.exports = {
  siteStartCmd: 'yarn start',
  siteOrigin: 'http://localhost:3000',
  startUrl: '/',
  outputPath: './site-search.json',
  rules: [
    {
      hierarchy: [
        { selector: '.outline-lvl0-active' },
        { selector: 'article h1' },
        { selector: 'article h2' },
        { selector: 'article h3' },
        { selector: 'article h4' },
        { selector: 'article h5' },
        { selector: 'article h6' },
      ],
      text: { selector: 'article p' },
    },
  ],
};
