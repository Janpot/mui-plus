const withNextra = require('nextra')(
  'nextra-theme-mui-docs',
  './theme.config.js'
);
module.exports = withNextra({
  webpack5: true,
  productionBrowserSourceMaps: true,
  experimental: {
    externalDir: true,
  },
  webpack: (config) => {
    config.module.rules = [
      {
        oneOf: [
          {
            resourceQuery: /raw/,
            type: 'asset/source',
          },
          {
            resourceQuery: /localFile/,
            type: 'asset/resource',
            generator: {
              publicPath: './',
            },
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
