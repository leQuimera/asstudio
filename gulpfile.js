'use strict';

var gulp = require('gulp'); // Подключение gulp
var sass = require('gulp-sass'); // Подключение сборки sass
var postcss = require('gulp-postcss'); //Парсер и база для других модулей css-файла
var autoprefixer = require('autoprefixer'); // Автопрефиксер
var rename = require('gulp-rename'); // Переименование файлов
var del = require('del'); // Удаление файлов
var cssnano = require('cssnano'); // Минификатор
var posthtml = require("gulp-posthtml"); // Парсер и база для других модулей html
var htmlmin = require('gulp-htmlmin'); // Минификация html
var imagemin = require('gulp-imagemin'); // Минификация графики
var svgstore = require("gulp-svgstore"); //Создание SVG-спрайта
var plumber = require('gulp-plumber'); // Отлов ошибок
var run = require('run-sequence');
var server = require('browser-sync').create(); // Создание локального сервера

// Очистка папки
gulp.task('clean', function() {
  return del('build');
});

// Сборка css
gulp.task('style', function() {
  var processors = [
    autoprefixer({
      browsers: ['last 2 versions']
    }),
    cssnano()
  ];
  return gulp.src('source/sass/style.scss')
    .pipe(plumber())
    .pipe(sass())
    .pipe(postcss(processors))
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('build/css/'))
    .pipe(server.stream());
});

// Создание SVG-спрайта
gulp.task('sprite', function() {
  return gulp.src('source/img/svg/sprite/*.svg')
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename('sprite.svg'))
    .pipe(gulp.dest('img'));
});

// Минификация и копирование графики
gulp.task('imgmin', function() {
  return gulp.src(['source/img/**/*.{png,jpg,svg}', '!source/img/svg/sprite/*.*'])
    .pipe(imagemin([
      imagemin.optipng({
        optimizationLevel: 3
      }),
      imagemin.jpegtran({
        progressive: true
      }),
      imagemin.svgo()
    ]))
    .pipe(gulp.dest('build/img'))
});

// Сборка html файлов и копирование
gulp.task('html', function() {
  return gulp.src('source/*.html')
    .pipe(posthtml([
    ]))
    .pipe(htmlmin({
      collapseWhitespace: true
    }))
    .pipe(gulp.dest('build'))
    .pipe(server.stream());
});

// Копирование остальных исходных фалов в чистовик
gulp.task('copy', function() {
  return gulp.src([
      'source/fonts/**/*.{woff,woff2,ttf}',
      'source/js/lib/*.js',
      'source/sass/**/*.css'
    ], {
      base: 'source'
    })
    .pipe(gulp.dest('build'));
});

gulp.task('refresh', function (done) {
  server.reload();
  done();
});

gulp.task('build', gulp.series('clean', 'style', 'sprite', 'imgmin', 'html', 'copy'));

// Запуск сервера
gulp.task('serve', function() {
  server.init({
    server: 'build/',
    notify: false,
    open: true,
    cors: true,
    ui: false
  });
  gulp.watch('source/sass/**/*.{scss,sass}', gulp.series('style'));
  gulp.watch('source/**/*.html', gulp.series('html', 'refresh'));
});

gulp.task('start', gulp.series('build', 'serve'));
