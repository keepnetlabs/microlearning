// Keep authored color functions (e.g., rgba) by disabling cssnano colormin
module.exports = {
  webpack: {
    configure: (config, { env }) => {
      if (
        env === 'production' &&
        config.optimization &&
        Array.isArray(config.optimization.minimizer)
      ) {
        const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
        config.optimization.minimizer = config.optimization.minimizer.map((min) => {
          const isCssMin = min && min.constructor && min.constructor.name === 'CssMinimizerPlugin';
          if (!isCssMin) return min;
          return new CssMinimizerPlugin({
            parallel: true,
            minimizerOptions: { preset: ['default', { colormin: false }] },
          });
        });
      }
      return config;
    },
  },
};


