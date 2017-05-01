const gulp = require("gulp");
const source = require("vinyl-source-stream"); // Used to stream bundle for further handling
const buffer = require("vinyl-buffer");
const babelify = require("babelify");
const browserify = require("browserify");
const watchify = require("watchify");
const gutil = require("gulp-util");
const cssmin = require("gulp-cssmin");
const less = require("gulp-less");
const uglify = require("gulp-uglify");
const header = require("gulp-header");

const config = require("../config");
const _error_ = "error"

// Build without watch:
gulp.task("js-build", () => {
  config.esToJs.forEach(o => {
    var filename = o.filename + ".js";
    browserify(o.entry, { debug: true })
      .transform(babelify, { 
        sourceMaps: true 
      })
      .bundle()
      .on(_error_, err => console.log(err))
      .pipe(source(filename))
      .pipe(gulp.dest(o.destfolder));
  });
});

gulp.task("dist", () => {
  config.esToJs.forEach(o => {
    var filename = o.filename + ".js";
    browserify(o.entry, { debug: false })
      .transform(babelify, { 
        sourceMaps: false 
      })
      .bundle()
      .on(_error_, err => console.log(err))
      .pipe(source(filename))
      .pipe(buffer())
      .pipe(uglify())
      .pipe(header(config.license, {
          version: config.version,
          build: (new Date()).toUTCString()
      }))
      .pipe(gulp.dest(config.distFolder));
  });
  var allLess = config.lessToCss.concat(config.lessToCssExtras);
  allLess.forEach(o => {
    if (o.nodist) return;
    var source = o.src, dest = o.dest;
    gulp.src(source) // path to your files
      .pipe(less().on(_error_, err => console.log(err)))
      .pipe(cssmin().on(_error_, err => console.log(err))) // always minify CSS, remove temptation of editing css directly
      .pipe(gulp.dest(config.cssDistFolder));
  });
});

// Build for distribution (with uglify)
gulp.task("js-min", () => {
  //NB: the following lines are working examples of source mapping generation and js minification
  //they are commented on purpose, to keep the build process fast during development
  config.esToJs.forEach(o => {
    var filename = o.filename + ".min.js";
    browserify(o.entry, { debug: false })
      .transform(babelify, { 
        sourceMaps: false 
      })
      .bundle()
      .on(_error_, err => console.log(err))
      .pipe(source(filename))
      .pipe(buffer())
      .pipe(uglify())
      .pipe(gulp.dest(o.destfolder));
  });
});

gulp.task("css-min", () => {
  config.lessToCss.forEach(o => {
    var source = o.src, dest = o.dest;
    gulp.src(source) // path to your files
      .pipe(less().on(_error_, err => console.log(err)))
      .pipe(cssmin().on(_error_, err => console.log(err))) // always minify CSS, remove temptation of editing css directly
      .pipe(gulp.dest(dest));
  });
});

// Copies static files to the output folder
gulp.task("copy-static", () => {
  config.toBeCopied.forEach(o => {
    gulp.src([o.src])
        .pipe(gulp.dest(o.dest));
  });
});

// watches less files for changes; compiles the files upon change
gulp.task("watch-less", () => {
  gulp.watch(config.lessRoot, ["css-build"]);
});

// Build using watchify, and watch
gulp.task("watch-es", watch => {
  if (watch === undefined) watch = true;

  config.esToJs.forEach(o => {
    var filename = o.filename + ".built.js";

    var bundler = browserify(o.entry, {
      debug: true,              // gives us sourcemapping
      cache: {},                // required for watchify
      packageCache: {},         // required for watchify
      fullPaths: true           // required for watchify
    });
    bundler.transform(babelify, {});

    if (watch) {
      bundler = watchify(bundler);
    }

    function rebundle() {
      var stream = bundler.bundle();
      stream.on(_error_, err => console.log(err));
      stream = stream.pipe(source(filename));
      return stream.pipe(gulp.dest(o.destfolder));
    }

    bundler.on("update", () => {
      console.log(`[*] Rebuilding ${o.destfolder}${filename}`);
      rebundle();
    });
    return rebundle();
  });
});

gulp.task("dev-init", ["js-build", "css-min", "copy-static"]);

gulp.task("env-init", ["js-dist", "css-min", "copy-static"]);
