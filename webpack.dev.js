import path from "node:path";
import { merge } from "webpack-merge";
import common from "./webpack.common.js";

export default merge(common, {
  mode: "development",
  output: {
    filename: "main.js",
    path: path.resolve(import.meta.dirname, "dist"),
    clean: true,
  },

  devtool: "eval-source-map",
  devServer: {
    static: "./dist",
    watchFiles: ["./src/template.html"],
    hot: true,
    open: true,
  },
});