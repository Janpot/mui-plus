const withNextra = require('nextra')(
  './src/createNextraTheme',
  './theme.config.js'
);
module.exports = withNextra({
  future: { webpack5: true },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Note: we provide webpack above so you should not `require` it
    // Perform customizations to webpack config
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

    // Important: return the modified config
    return config;
  },
});
