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

rules.push({
  test: /\.(png|jpe?g|gif|svg)$/i,
  use: [
    {
      loader: 'file-loader'
    }
  ]
})

module.exports = {
  // Put your normal webpack config below here
  module: {
    rules
  },
  devtool: 'eval-source-map',
  resolve: {
    extensions: ['*', '.js', '.jsx']
  },
  devServer: {
    hot: true
  }
}
