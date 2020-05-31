const rules = require('./webpack.rules')

rules.push({
  test: /\.css$/,
  use: [{ loader: 'style-loader' }, { loader: 'css-loader' }]
})

rules.push({
  test: /\.(js|jsx)$/,
  exclude: /node_modules/,
  use: ['babel-loader']
})

module.exports = {
  // Put your normal webpack config below here
  module: {
    rules
  },
  resolve: {
    extensions: ['*', '.js', '.jsx']
  },
  devServer: {
    hot: true
  }
}
