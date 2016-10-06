var webpack = require('webpack'),
    path = require('path'),
    version = require('./version');

var settings = {
    DEBUG: process.env.NODE_ENV !== 'production'
};

module.exports = {
    watch: false,
    cache: settings.DEBUG,
    debug: settings.DEBUG,
    devtool: settings.DEBUG ? 'eval' : 'source-map',
    node: {
        fs: "empty"
    },
    entry: {
        bundle: './js/index'
    },
    output: {
        path: path.resolve(__dirname, '..', 'dist', version, 'js'),
        filename: 'bundle.js',
        publicPath: 'http://localhost:8080/static_admin/dist/' + version + '/js/'
    },
    plugins: [
        new webpack.ProvidePlugin({
            'window.$': 'jquery',
            'window.jQuery': 'jquery'
        }),
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': settings.DEBUG ? '"development"' : '"production"'
            }
        }),
        new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /ru/),
        // this is a alternative. See pre.js
        //new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
        new webpack.NoErrorsPlugin(),
        //new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.optimize.DedupePlugin(),
        // new webpack.optimize.UglifyJsPlugin({
        //     dropDebugger: true,
        //     dropConsole: true,
        //     sourceMap: false,
        //     output: {
        //         comments: false
        //     },
        //     compressor: {
        //         warnings: false
        //     }
        // })
    ],
    resolve: {
        modulesDirectories: [
            'node_modules',
            'src'
        ],
        extensions: ['', '.js', '.jsx']
    },
    //sassLoader: {
    //    includePaths: [
    //        path.resolve(__dirname, '/vendor/foundation/scss/'),
    //        path.resolve(__dirname, '/vendor/mindy-sass/mindy/')
    //    ]
    //},
    module: {
        loaders: [
            {
                test: /\.css$/,
                loader: "style-loader!css-loader"
            },
            {
                test: /\.scss$/,
                loaders: ["style", "css", "sass"]
            },
            {
                test: /\.jsx$/,
                loader: 'react-hot',
                exclude: /node_modules/
            },
            {
                test: /\.jsx$/,
                loader: 'babel',
                query: {
                    cacheDirectory: true,
                    presets: ['es2015', 'stage-0', 'react'],
                    plugins: ['add-module-exports']
                },
                exclude: /node_modules/
            },
            {
                test: /\.js$/,
                loader: 'babel',
                query: {
                    cacheDirectory: true,
                    presets: ['es2015', 'stage-0', 'react'],
                    plugins: ['add-module-exports']
                },
                exclude: /node_modules/
            }
        ]
    }
};