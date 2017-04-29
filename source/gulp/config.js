const WWWROOT = "../httpdocs/";
const JS_DEST = WWWROOT + "scripts/";
const CSS_DEST = WWWROOT + "styles/";
const IMG_DEST = WWWROOT + "images/";
const FONTS_DEST = WWWROOT + "styles/fonts/";

const year = new Date().getFullYear();
const VERSION = "2.0.0"
const LICENSE = `
/**
 * KingTable ${VERSION}
 * https://github.com/RobertoPrevato/KingTable
 *
 * Copyright ${year}, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */
`.replace(/^\s+/m, "")

module.exports = {

  // root folder to less source code
  lessRoot: "./code/styles/**/*.less",

  distFolder: "../dist/",

  license: LICENSE,
  version: VERSION,

  lessToCss: [
    {
      src: "./code/styles/kingtable/kingtable.less",
      dest: CSS_DEST
    },
    {
      src: "./code/styles/examples.less",
      dest: CSS_DEST,
      nodist: true
    }
  ],
  
  esToJs: [
    {
      entry: "./code/scripts/tables/kingtable.js",
      destfolder: JS_DEST,
      filename: "kingtable"
    }
  ],

  toBeCopied: [
    {
      src: "code/favicon.ico",
      dest: WWWROOT
    },
    {
      src: "code/kingtable.svg",
      dest: WWWROOT
    },
    {
      src: "code/*.png",
      dest: WWWROOT
    },
    {
      src: "dummydata/*.js",
      dest: JS_DEST
    },
    {
      src: "code/styles/openicon/fonts/*",
      dest: FONTS_DEST
    },
    {
      src: "code/images/*",
      dest: IMG_DEST
    },
    {
      src: "code/scripts/libs/**/*.js",
      dest: JS_DEST + "libs/"
    }
  ],

  test: {
    karma: "karma.conf.js"
  }
};
