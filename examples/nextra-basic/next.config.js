const withNextra = require('nextra')(
  'nextra-theme-mui-docs',
  './theme.config.js'
);
module.exports = withNextra({
  webpack5: true,
});
