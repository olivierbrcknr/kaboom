// next.config.js

module.exports =
  {
    onDemandEntries: {
      websocketPort: 3000,
    },
    trailingSlash: true,
      exportPathMap: function() {
      return {
        '/': { page: '/' },
      };
    },
    webpack(config, options) {

      config.node = {
       fs: "empty"
      }

      config.module.rules.push({
        test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 100000,
            name: '[name].[ext]',
            esModule: false,
          },
        }
      })

      config.module.rules.push({
        test: /\.(mp4)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]'
            }
          }
        ]
      })

      config.module.rules.push({
        test: /\.md$/,
        use: 'raw-loader'
      })

      return config
    },
  };
