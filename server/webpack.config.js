const path = require('path');
const analyzer = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const plugins = [];
const useAnalyzer = process.env.use_analyzer === 'true';
if (useAnalyzer) {
  plugins.push(new analyzer());
}

module.exports = {
  entry: './bin/www', // 单入口
  mode: 'production',
  output: {
    filename: 'wj-admin.js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'commonjs2',
  },
  target: 'node', // 这是最关键的
  plugins,
};
