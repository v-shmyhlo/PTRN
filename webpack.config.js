const path = require('path');

module.exports = {
    entry: {
      ptrn: path.join(__dirname, 'lib', 'ptrn'),
    },
    output: {
      path: path.join(__dirname, 'dist'),
      filename: '[name].js'
    },
    module: {
      loaders: [
        {
          test: /\.js$/,
          loader: 'babel',
          include: path.join(__dirname, 'lib'),
          query: {
            presets: ['es2015', 'stage-0'],
            plugins: ['transform-runtime']
          }
        }
      ]
    }
};
