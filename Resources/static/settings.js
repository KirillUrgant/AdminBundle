var settings = {
    minifyOpts: {
        keepSpecialComments: false,
        aggressiveMerging: true,
        advanced: true,
        compatibility: 'ie8'
    },
    imagesOpts: {
        optimizationLevel: 7,
        progressive: true,
        interlaced: true
    },
    sassOpts: {
        outputStyle: 'expanded',
        indentWidth: 4,
        includePaths: [
            './bower_components/mindy-sass'
        ]
    },
    dst: {
        js: '../public/js',
        css: '../public/css',
        images: '../public/images',
        wysiwyg: '../public/ueditor107',
        fonts: '../public/fonts'
    },
    paths: {
        js: './js/**/*{.js,.jsx}',
        wysiwyg: 'bower_components/ueditor107/dist/**/*',
        web: '../index.html',
        fonts: [
            'fonts/lato/fonts/*{.eot,.otf,.woff,.woff2,.ttf,.svg}',
            'fonts/semantic-ui/fonts/*{.eot,.otf,.woff,.woff2,.ttf,.svg}'
        ],
        images: 'images/**/*{.jpg,.jpeg,.png}',
        css: [
            'scss/**/*.scss',
            'fonts/**/*.css'
        ]
    }
};

module.exports = settings;
