module.exports = {
  siteStartCmd: 'npm start',
  siteOrigin: 'http://localhost:3000',
  siteReadyProbe: '/',
  outputPath: './site-search.json',
  selectors: {
    lvl0: 'title',
    lvl1: 'article h1',
    lvl2: 'article h2',
    lvl3: 'article h3',
    lvl4: 'article h4',
    lvl5: 'article h5',
    lvl6: 'article h6',
    text: 'article p',
  },
};
