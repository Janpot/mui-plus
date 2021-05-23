const withNextra = require('nextra')(
  'nextra-theme-mui-docs',
  './theme.config.js'
);
module.exports = withNextra({
  future: { webpack5: true },
  webpack: (config) => {
    config.module.rules = [
      {
        resourceQuery: /raw/,
        type: 'asset/source',
      },
      {
        resourceQuery: /^(?!\?raw$).*/,
        rules: config.module.rules,
      },
    ];

    return config;
  },
});
