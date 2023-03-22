const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    bundle: ['./app/app.js']
  },
  output: {
    path: __dirname + '/public',
    filename: 'app.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules(?!\/lezer-feel)/,
        use: {
          loader: 'babel-loader',
          options: {
            plugins: ['@babel/plugin-transform-react-jsx','@babel/plugin-proposal-nullish-coalescing-operator', '@babel/plugin-proposal-optional-chaining' ]
          }
        }
      },
      {
        oneOf: [
          {
            test: /\.css$/,
            use: [
              { loader: 'style-loader' },
              { loader: 'css-loader' }
            ]
          },
          {
            test: /\.bpmn$/,
            use: 'raw-loader',
          },
          {
            exclude: /\.(js|html|json)$/,
            loader: 'file-loader',
            options: {
              name: 'static/media/[name].[hash:8].[ext]',
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new CopyWebpackPlugin([
      { from: 'assets/**', to: 'vendor/bpmn-js', context: 'node_modules/bpmn-js/dist/' },
      { from: 'node_modules/bpmn-js-properties-panel/dist/assets', to: 'vendor/bpmn-js-properties-panel/assets' },
      { from: 'node_modules/bpmn-js-token-simulation/assets', to: 'vendor/bpmn-js-token-simulation/assets' },
      { from: 'index.html', context: 'app/' },
      { from: 'imgs/**', context: 'app/' }
    ])
  ],
  mode: 'development',
  devtool: 'source-map'
};