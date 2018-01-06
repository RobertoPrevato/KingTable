module.exports = config => {
  config.set({

    basePath: "./",

    singleRun: false,

    frameworks: ["jasmine", "browserify", "intl-shim"],

    preprocessors: {
      "code/scripts/*.js": ["browserify"],
      "code/tests/*.spec.js": ["browserify"],
      "code/scripts/**/*.js": ["browserify"],
      "code/tests/**/*.spec.js": ["browserify"]
    },

    browsers: ["ChromeDebugging"],

    reporters: ["progress", "coverage"],

    autoWatch: true,

    customLaunchers: {
      ChromeDebugging: {
        base: 'Chrome',
        flags: [ '--remote-debugging-port=9333' ]
      }
    },

    browserify: {
      debug: true,
      extensions: [".js"],
      transform: [
        "babelify"
      ]
    },

    urlRoot: "/__karma__/",

    files: [
      "node_modules/babel-polyfill/dist/polyfill.js",
      "node_modules/intl/locale-data/jsonp/en-GB.js",
      "code/scripts/*.js",
      "code/tests/*.spec.js",
      "code/tests/**/*.spec.js",
      "code/scripts/**/*.js",
      "code/styles/dataentry.css",
      "tests/tests.css"
    ],

    exclude: []

  });
};
