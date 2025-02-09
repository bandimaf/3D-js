import gulp from "gulp";
import del from "del";
import include from "gulp-file-include";
import formatHtml from "gulp-format-html";
import less from "gulp-less";
import plumber from "gulp-plumber";
import postcss from "gulp-postcss";
import autoprefixer from "autoprefixer";
import sortMediaQueries from "postcss-sort-media-queries";
import minify from "gulp-csso";
import rename from "gulp-rename";
import terser from "gulp-terser";
import svgmin from "gulp-svgmin";
import svgstore from "gulp-svgstore";
import server from "browser-sync";

const resources = {
  html: "src/html/**/*.html",
  jsDev: "src/scripts/dev/**/*.js",
  less: "src/styles/**/*.less",
  svgSprite: "src/assets/svg-sprite/*.svg",
  models: "src/assets/models/*.{gltf,glb}",
};

function clean() {
  return del("dist");
}
function includeHtml() {
  return gulp
    .src("src/html/*.html")
    .pipe(plumber())
    .pipe(
      include({
        prefix: "@@",
        basepath: "@file"
      })
    )
    .pipe(formatHtml())
    .pipe(gulp.dest("dist"));
}
function style() {
  return gulp
    .src("src/styles/styles.less")
    .pipe(plumber())
    .pipe(less())
    .pipe(
      postcss([
        autoprefixer({ overrideBrowserslist: ["last 4 version"] }),
        sortMediaQueries({
          sort: "desktop-first"
        })
      ])
    )
    .pipe(gulp.dest("dist/styles"))
    .pipe(minify())
    .pipe(rename("styles.min.css"))
    .pipe(gulp.dest("dist/styles"));
}
function js() {
  return gulp
    .src("src/scripts/dev/*.js")
    .pipe(plumber())
    .pipe(
      include({
        prefix: "//@@",
        basepath: "@file"
      })
    )
    .pipe(gulp.dest("dist/scripts"))
    .pipe(terser())
    .pipe(
      rename(function (path) {
        path.basename += ".min";
      })
    )
    .pipe(gulp.dest("dist/scripts"));
}

function models() {
  return gulp.src('src/assets/models/**/*.glb', { encoding: false })
    .pipe(gulp.dest('dist/assets/models'));
}

function svgSprite() {
  return gulp
    .src(resources.svgSprite)
    .pipe(
      svgmin({
        js2svg: {
          pretty: true
        }
      })
    )
    .pipe(
      svgstore({
        inlineSvg: true
      })
    )
    .pipe(rename("symbols.svg"))
    .pipe(gulp.dest("dist/assets/icons"));
}
const build = gulp.series(
  clean,
  includeHtml,
  style,
  js,
  models,
  svgSprite
);
function reloadServer(done) {
  server.reload();
  done();
}
function serve() {
  server.init({
    server: "dist"
  });
  gulp.watch(resources.html, gulp.series(includeHtml, reloadServer));
  gulp.watch(resources.less, gulp.series(style, reloadServer));
  gulp.watch(resources.jsDev, gulp.series(js, reloadServer));
  gulp.watch(resources.svgSprite, gulp.series(svgSprite, reloadServer));
  gulp.watch(resources.models, gulp.series(models, reloadServer));
}
const start = gulp.series(build, serve);
export {
  clean,
  includeHtml,
  style,
  js,
  models,
  svgSprite,
  build,
  serve,
  start
}; 