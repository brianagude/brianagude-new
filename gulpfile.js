// Gulp.js configuration
// https://www.sitepoint.com/introduction-gulp-js/

// need to add browsersync & del & type

// development mode?
const devBuild = (process.env.NODE_ENV !== 'production');

const
  // folders
  src = 'src/',
  build = 'dist/'

  // modules
  gulp = require('gulp'),
  browserSync = require('browser-sync').create(),
  del = require('del'),

  // html & img
  noop = require('gulp-noop'),
  newer = require('gulp-newer'),
  imagemin = require('gulp-imagemin'),
  htmlclean = require('gulp-htmlclean'),

  // js
  concat = require('gulp-concat'),
  deporder = require('gulp-deporder'),
  terser = require('gulp-terser'),
  stripdebug = devBuild ? null : require('gulp-strip-debug'),
  sourcemaps = devBuild ? require('gulp-sourcemaps') : null,

  // css
  sass = require('gulp-sass'),
  postcss = require('gulp-postcss'),
  assets = require('postcss-assets'),
  autoprefixer = require('autoprefixer'),
  mqpacker = require('css-mqpacker'),
  cssnano = require('cssnano');

  // image processing
  function images() {
    const out = build + 'images/';

    return gulp.src(src + 'images/**')
      .pipe(newer(out))
      .pipe(imagemin({ optimizationLevel: 5 }))
      .pipe(gulp.dest(out))
      .pipe(browserSync.stream());
  }

  // font processing
  function html() {
    return gulp.src(src + 'fonts/')
      .pipe(gulp.dest(build));
  }

  // HTML processing
  function html() {
    return gulp.src(src + '/*.html')
      .pipe(newer(build))
      .pipe(devBuild ? noop() : htmlclean())
      .pipe(gulp.dest(build))
      .pipe(browserSync.stream());
  }

  // js processing
  function js() {
    return gulp.src(src + 'js/**')
      .pipe(sourcemaps ? sourcemaps.init() : noop())
      .pipe(deporder())
      .pipe(concat('main.js'))
      .pipe(stripdebug ? stripdebug() : noop())
      .pipe(terser())
      .pipe(sourcemaps ? sourcemaps.write() : noop())
      .pipe(gulp.dest(build + 'js/'))
      .pipe(browserSync.stream());
  }

  // CSS processing
  function css() {
    return gulp.src(src + 'css/main.scss')
      .pipe(sourcemaps ? sourcemaps.init() : noop())
      .pipe(sass({
        outputStyle: 'nested',
        imagePath: '/images/',
        precision: 3,
        errLogToConsole: true
      }).on('error', sass.logError))
      .pipe(postcss([
        assets({ loadPaths: ['images/'] }),
        autoprefixer({ browsers: ['last 2 versions', '> 2%'] }),
        mqpacker,
        cssnano
      ]))
      .pipe(sourcemaps ? sourcemaps.write() : noop())
      .pipe(gulp.dest(build + 'css/'))
      .pipe(browserSync.stream());
  }

  // watch for file changes
  function watch(done) {
    browserSync.init({
      server: {
        baseDir: build
      }
    });

    // image changes
    gulp.watch(src + 'images/**', images).on("change", browserSync.reload);

    // html changes
    gulp.watch(src + '/*.html', html).on("change", browserSync.reload);

    // css changes
    gulp.watch(src + 'css/**', css).on("change", browserSync.reload);

    // js changes
    gulp.watch(src + 'js/**', js).on("change", browserSync.reload);

    done();
  }
;

exports.html = gulp.series(images, html);
exports.js = js;
exports.css = gulp.series(images, css);
exports.watch = watch;
exports.build = gulp.parallel(exports.html, exports.css, exports.js);

exports.default = gulp.series(exports.build, exports.watch);