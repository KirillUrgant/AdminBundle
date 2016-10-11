'use strict';

var gulp = require('gulp');
var concat = require('gulp-concat');
var clean = require('gulp-clean');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var csso = require('gulp-csso');
var uglify = require('gulp-uglify');
var browserSync = require('browser-sync').create();
var nunjucks = require('gulp-nunjucks');
var data = require('gulp-data');
var path = require('path');
var fs = require('fs');

var dst = {
    js: 'dist/js',
    css: 'dist/css',
    images: 'dist/images',
    fonts: 'dist/fonts',
    views: '../compiled_templates'
};

var paths = {
    js: [
        'bower_components/jquery/dist/jquery.min.js',
        'bower_components/foundation/js/foundation.min.js',
        'src/js/app.js'
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
    views: '../templates/**/*.html',
    data_views: '../templates/**/*.json'
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
        .pipe(gulp.dest('./dist/css/compiled-sass'));
});

gulp.task('css', ['sass'], function () {
    var temp = paths.css;
    temp.push('./dist/css/compiled-sass/*.css');

    return gulp.src(temp)
        .pipe(autoprefixer())
        .pipe(csso())
        .pipe(concat('bundle.css'))
        .pipe(gulp.dest('./dist/css'))
        .pipe(browserSync.stream());
});

gulp.task('views', function () {
    return gulp.src(paths.views)
        .pipe(data(function (file) {
            var dataPath = path.dirname(file.path) + '/' + path.basename(file.path) + '.json';
            if (fs.existsSync(dataPath)) {
                delete require.cache[require.resolve(dataPath)];
                return require(dataPath);
            } else {
                return {};
            }
        }))
        .pipe(data(function (file) {
            var tpl = '../templates/global.json';
            delete require.cache[require.resolve(tpl)];
            return require(tpl);
        }))
        .pipe(nunjucks.compile())
        .pipe(gulp.dest(dst.views))
        .pipe(browserSync.stream());
});

gulp.task('serve', ['default'], function() {
    browserSync.init({
        server: {
            baseDir: "../",
            index: "compiled_templates/index.html"
        }
    });

    gulp.watch(paths.js, ['js']).on('change', browserSync.reload);
    gulp.watch(paths.images, ['images']).on('change', browserSync.reload);
    gulp.watch(paths.sass, ['css']);
    gulp.watch(paths.fonts, ['fonts']);
    gulp.watch([paths.views, paths.data_views], ['views']).on('change', browserSync.reload);
});

gulp.task('clean', function() {
    return gulp.src(['dist'])
        .pipe(clean());
});

gulp.task('default', ['clean'], function() {
    return gulp.start('js', 'css', 'images', 'fonts', 'views');
});
