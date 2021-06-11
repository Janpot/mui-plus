const withNextra = require('nextra')(
  'nextra-theme-mui-docs',
  './theme.config.js'
);
module.exports = withNextra({
  webpack5: true,
  webpack: (config) => {
    config.module.rules = [
      {
        oneOf: [
          {
            resourceQuery: /raw/,
            type: 'asset/source',
          },
          {
            rules: config.module.rules,
          },
        ],
      },
    ];

    return config;
  },
});
