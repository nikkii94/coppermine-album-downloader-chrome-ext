const   webpack                     = require("webpack"),
        path                        = require("path"),
        env                         = require("./utils/env"),
        CleanWebpackPlugin          = require("clean-webpack-plugin"),
        CopyWebpackPlugin           = require("copy-webpack-plugin"),
        HtmlWebpackPlugin           = require("html-webpack-plugin"),
        ExtractTextWebpackPlugin    = require("extract-text-webpack-plugin"),
        OptimizeCSSAssets           = require('optimize-css-assets-webpack-plugin');


const extractPlugin = new ExtractTextWebpackPlugin({
    filename: '[name].css'
});

const options = {
    entry: {
        popup: path.join(__dirname, "src", "js", "popup.js"),
        background: path.join(__dirname, "src", "js", "background.js"),
        content: path.join(__dirname, "src", "js", "content.js"),
    },
    output: {
        path: path.resolve(__dirname, "build"),
        filename: "[name].js",
        publicPath: "/"
    },
  node: {
      fs: "empty",
      net: "empty",
      tls: "empty",
  },
  module: {
    rules: [
        {
            test: /\.js$/,
            include: /src/,
            exclude: /node_modules/,
            use: {
                loader: "babel-loader",
                options: {
                    presets: ['env']
                }
            }
        },
        {
            test: /\.scss$/,
            include: [path.resolve(__dirname, '', 'src', 'scss')],
            use: extractPlugin.extract({
                use: [
                    {
                        loader: 'css-loader',
                        options: {
                            sourceMap: true
                        }
                    },
                    {
                        loader: 'sass-loader',
                        options: {
                            sourceMap: true
                        }
                    }
                ],
                fallback: 'style-loader'
            })
        },
        {
            test: /\.css$/,
            use: extractPlugin.extract({
                use: ['css-loader']
            })
        },
        {
            test: /\.(jpg|png|gif|svg)$/,
            use: [
                {
                    loader: 'file-loader',
                    options: {
                        name: '[name].[ext]',
                        outputPath: ''

                    }
                }
            ]
        },
        {
            test: /\.html$/,
            loader: "html-loader",
            exclude: /node_modules/
        }
    ]
  },
  resolve: {
      extensions: ['.js', '.scss', '.css',  '.gif', '.svg'], // Automatically resolve certain extensions
      alias: { // Create aliases
          '@': path.resolve('src'),
          styles: path.resolve(__dirname, 'src/scss')
      }
  },
  plugins: [
      new CleanWebpackPlugin(["build"]),
      extractPlugin,
      new HtmlWebpackPlugin(),
        new webpack.DefinePlugin({
          "process.env.NODE_ENV": JSON.stringify(env.NODE_ENV)
        }),
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            'window.jQuery': 'jquery',
        }),
        new CopyWebpackPlugin([{
          from: "src/manifest.json",
          transform: function (content, path) {
            // generates the manifest file using the package.json informations
            return Buffer.from(JSON.stringify({
              description: process.env.npm_package_description,
              version: process.env.npm_package_version,
              ...JSON.parse(content.toString())
            }))
          }
        }]),
        new HtmlWebpackPlugin({
          template: path.join(__dirname, "src", "popup.html"),
          filename: "popup.html",
          chunks: ["popup"]
        })
      ]
};

if (env.NODE_ENV === "development") {
  //options.devtool = "cheap-module-eval-source-map";
}
if (process.env.NODE_ENV === 'production') {
    module.exports.plugins.push(
        new webpack.optimize.UglifyJsPlugin({
            output: {
                "ascii_only": true
            }
        }),
        new OptimizeCSSAssets()
    );
}


module.exports = options;
