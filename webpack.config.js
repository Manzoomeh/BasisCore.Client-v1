const path = require("path");
const CircularDependencyPlugin = require("circular-dependency-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");

module.exports = {
  entry: {
    basiscore: "./src/index.ts",
    "basiscore.min": "./src/index.ts",
  },
  devtool: "source-map",
  output: {
    filename: "[name].js",
  },

  // output: {
  //   filename: "basiscore.min.js",
  //   //library: "$bc",
  //   // library: {
  //   //   name: "$bc",
  //   //   type: "var",
  //   // },
  // },
  devServer: {
    static: path.resolve(__dirname, "wwwroot"),
  },
  optimization: {
    minimize: true,
    minimizer: [
      new UglifyJsPlugin({
        include: /\.min\.js$/,
      }),
    ],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: ["ts-loader"],
        exclude: /\.d\.ts$/,
      },
      {
        test: /\.d\.ts$/,
        use: ["ignore-loader"],
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".d.ts", ".tsx", ".js", ".jsx", ".css"],
  },
  plugins: [
    //   new CircularDependencyPlugin({
    //     // `onStart` is called before the cycle detection starts
    //     onStart({ compilation }) {
    //       console.log("start detecting webpack modules cycles");
    //     },
    //     // `onDetected` is called for each module that is cyclical
    //     onDetected({ module: webpackModuleRecord, paths, compilation }) {
    //       // `paths` will be an Array of the relative module paths that make up the cycle
    //       // `module` will be the module record generated by webpack that caused the cycle
    //       compilation.errors.push(new Error(paths.join(" -> ")));
    //     },
    //     // `onEnd` is called before the cycle detection ends
    //     onEnd({ compilation }) {
    //       console.log("end detecting webpack modules cycles");
    //     },
    //   }),
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(
            __dirname,
            "node_modules/alasql/dist/alasql.min.js"
          ),
        },
      ],
    }),
  ],
};
