'use strict';

var gulp = require('gulp');
var concat = require('gulp-concat');
var clean = require('gulp-clean');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var csso = require('gulp-csso');
var uglify = require('gulp-uglify');
var browserSync = require('browser-sync').create();
var data = require('gulp-data');
var path = require('path');
var fs = require('fs');

var publicFolder = "../public";

var dst = {
    js: publicFolder+'/js',
    css: publicFolder+'/css',
    images: publicFolder+'/images',
    fonts: publicFolder+'/fonts'
};

var paths = {
    js: [
        'bower_components/jquery/dist/jquery.min.js',
        'bower_components/foundation/js/foundation.min.js',
        'src/js/**/*.js'
    ],
    images: [
        'src/images/**/*'
    ],
    fonts: [
        'src/fonts/ubuntu/fonts/*',
        'bower_components/font-awesome/fonts/*'
    ],
    sass: 'src/scss/**/*.scss',
    css: [
        'src/fonts/ubuntu/css/stylesheet.css',
        'bower_components/font-awesome/css/font-awesome.css'
    ],
    views: '../templates/**/*'
};

gulp.task('js', function () {
    return gulp.src(paths.js)
        .pipe(concat('bundle.js'))
        //.pipe(uglify())
        .pipe(gulp.dest(dst.js))
        .pipe(browserSync.stream());
});

gulp.task('images', function () {
    return gulp.src(paths.images)
        .pipe(gulp.dest(dst.images))
        .pipe(browserSync.stream());
});

gulp.task('fonts', function () {
    return gulp.src(paths.fonts)
        .pipe(gulp.dest(dst.fonts));
});

gulp.task('sass', function () {
    return gulp.src(paths.sass)
        .pipe(sass(({
            includePaths: ['bower_components/foundation/scss']
        })).on('error', sass.logError))
        .pipe(gulp.dest(dst.css+'/compiled-sass'));
});

gulp.task('css', ['sass'], function () {
    var temp = paths.css;
    temp.push(dst.css+'/compiled-sass/*.css');

    return gulp.src(temp)
        .pipe(autoprefixer())
        .pipe(csso())
        .pipe(concat('bundle.css'))
        .pipe(gulp.dest(dst.css))
        .pipe(browserSync.stream());
});

gulp.task('watch', ['default'], function() {
    browserSync.init({
        proxy: "localhost:3000"
    });

    gulp.watch(paths.js, ['js']).on('change', browserSync.reload);
    gulp.watch(paths.images, ['images']).on('change', browserSync.reload);
    gulp.watch(paths.sass, ['css']);
    gulp.watch(paths.fonts, ['fonts']);
    gulp.watch(paths.views).on('change', browserSync.reload);
});

gulp.task('clean', function() {
    return gulp.src([publicFolder])
        .pipe(clean({force: true}));
});

gulp.task('default', ['clean'], function() {
    return gulp.start('js', 'css', 'images', 'fonts');
});
