import webpack from "webpack";
import path from "path";
import fs from "fs";
import TerserPlugin from 'terser-webpack-plugin';

const config: webpack.Configuration = {
  entry: "./src/userscript-main.ts",
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          output: {
            comments: /(\s@|UserScript==)/i,
          },
        }
      })
    ]
  },
  module: {
    rules: [{
      test: /\.ts$/,
      exclude: /node_modules/,
      use: {
        loader: "ts-loader",
        options: {
          transpileOnly: true
        }
      }
    }]
  },
  output: {
    path: path.resolve(__dirname, "out"),
    filename: "HanoiCollab_v2.user.js"
  },
  resolve: {
    modules: [
      "node_modules",
      "src"
    ],
    extensions: [".ts", ".js"],
  },
  plugins: [
    new webpack.BannerPlugin({
      banner: fs.readFileSync(path.resolve(__dirname, "src/userscript-main.ts"), "utf-8").replace(/(==\/UserScript==)[\s\S]+$/, "$1"),
      entryOnly: true,
      raw: true
    })
  ]
};

export default config;
