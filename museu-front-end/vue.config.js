module.exports = {
  chainWebpack(config) {
    config.plugin('copy').tap(([options]) => {
      options.patterns[0].globOptions.ignore.push('**/index.html');
      return [options];
    });
  },
  devServer: {
    port: 9090,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
};
