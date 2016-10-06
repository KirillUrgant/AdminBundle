var settings = require('./settings'),
    gulp = require('gulp'),
    sourcemaps = require('gulp-sourcemaps'),
    csso = require('gulp-csso'),
    concat = require('gulp-concat'),
    imagemin = require('gulp-imagemin'),
    sass = require('gulp-sass'),
    gulpif = require('gulp-if'),
    process = require('process'),
    clean = require('gulp-clean'),
    autoprefixer = require('gulp-autoprefixer'),
    livereload = require('gulp-livereload'),
    webpack = require('webpack-stream');

gulp.task('wysiwyg', function () {
    return gulp.src(settings.paths.wysiwyg)
        .pipe(gulp.dest(settings.dst.wysiwyg));
});

gulp.task('fonts', function () {
    return gulp.src(settings.paths.fonts)
        .pipe(gulp.dest(settings.dst.fonts));
});

gulp.task('js', function () {
    return gulp.src(settings.paths.js)
        .pipe(webpack(require('./webpack.config.js')))
        .pipe(gulp.dest(settings.dst.js))
        .pipe(gulpif(process.argv.indexOf('watch') != -1, livereload()));
});

gulp.task('images', function () {
    return gulp.src(settings.paths.images)
        .pipe(imagemin({
            optimizationLevel: 7,
            progressive: true,
            interlaced: true
        }))
        .pipe(gulp.dest(settings.dst.images));
});

gulp.task('reload', function () {
    gulp.src(settings.paths.web)
        .pipe(livereload());
});

gulp.task('css', ['fonts'], function () {
    return gulp.src(settings.paths.css)
        .pipe(sass(settings.sassOpts))
        .pipe(autoprefixer({
            browsers: ['last 4 versions'],
            cascade: false
        }))
        .pipe(csso({
            restructure: false,
            sourceMap: true
        }))
        .pipe(concat('bundle.css'))
        .pipe(gulp.dest(settings.dst.css))
        .pipe(gulpif(process.argv.indexOf('watch') != -1, livereload()));
});

gulp.task('watch', function () {
    livereload.listen();

    gulp.watch(settings.paths.wysiwyg, ['wysiwyg']);
    gulp.watch(settings.paths.js, ['js']);
    gulp.watch(settings.paths.images, ['images']);
    gulp.watch(settings.paths.fonts, ['fonts']);
    gulp.watch(settings.paths.css, ['css']);
});

gulp.task('clean', function () {
    return gulp.src(['dist/*'], {
        read: false
    }).pipe(clean());
});

gulp.task('build', ['clean'], function () {
    return gulp.start('css', 'images', 'js', 'fonts', 'wysiwyg');
});

gulp.task('default', function () {
    return gulp.start('build');
});