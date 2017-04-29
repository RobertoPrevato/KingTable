const config = require("../config");
const path = require("path");
const gulp = require("gulp");
const Server = require("karma").Server;

gulp.task("unit", () => {
  new Server({
    configFile: path.resolve(__dirname, "../..", config.test.karma),
    singleRun: true
  }).start();
});

gulp.task("watch-unit", () => {
  new Server({
    configFile: path.resolve(__dirname, "../..", config.test.karma),
    singleRun: false
  }).start();
});