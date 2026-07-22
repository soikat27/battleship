import path from "node:path";
import { merge } from "webpack-merge";
import common from "./webpack.common.js";

export default merge(common, {
  mode: "production",
  output: {
    filename: "main.[contenthash].js",
    path: path.resolve(import.meta.dirname, "dist"),
    clean: true,
    assetModuleFilename: "assets/[hash][ext][query]",
  },

  devtool: false,

  optimization: {
    minimize: true,
  },
});