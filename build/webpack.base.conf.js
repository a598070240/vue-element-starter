'use strict'

const {join, resolve} = require('path')
const webpack = require('webpack')
const glob = require('glob')

const ExtractTextPlugin = require('extract-text-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const {VueLoaderPlugin} = require('vue-loader');
const WebpackCdnPlugin = require('webpack-cdn-plugin');

const extractCSS = new ExtractTextPlugin({
    filename: 'assets/css/[name].css',
    allChunks: true
})
const extractLESS = new ExtractTextPlugin({
    filename: 'assets/css/[name].css',
    allChunks: true
})
const extractSASS = new ExtractTextPlugin({
    filename: 'assets/css/[name].css',
    allChunks: true
})
const vueLoader = new VueLoaderPlugin()
const webpackCDN = new WebpackCdnPlugin({
    modules: {
        'element': [
            {name: 'vue', var: 'Vue', path: 'dist/vue.min.js'},
            {name: 'element-ui', var: '"element-ui"', path: 'lib/index.js'}
        ]
    },
    //prodUrl: '//cdn.bootcss.com/:name/:version/:path',
    publicPath: '/node_modules'
})
const entries = {}
const chunks = []
const htmlWebpackPluginArray = []
glob.sync('./src/pages/**/app.js').forEach(path => {
    const chunk = path.split('./src/pages/')[1].split('/app.js')[0]
    entries[chunk] = path
    chunks.push(chunk)

    const filename = chunk + '.html'
    const htmlConf = {
        cdnModule: 'element',
        filename: filename,
        template: path.replace(/.js/g, '.html'),
        inject: 'body',
        favicon: './src/assets/img/logo.png',
        hash: true,
        chunks: ['commons', chunk]
    }
    htmlWebpackPluginArray.push(new HtmlWebpackPlugin(htmlConf))
})

const styleLoaderOptions = {
    loader: 'style-loader',
    options: {
        sourceMap: true
    }
}
const cssOptions = [
    {
        loader: 'css-loader',
        options: {sourceMap: true}
    }
]
const lessOptions = [...cssOptions, {
    loader: 'less-loader',
    options: {
        sourceMap: true
    }
}]
const sassOptions = [...cssOptions, {
    loader: 'sass-loader',
    options: {
        sourceMap: true
    }
}]
const postOptions = [...cssOptions, {
    loader: 'postcss-loader',
    options: {
        sourceMap: true
    }
}]
const config = {
    entry: entries,
    output: {
        path: resolve(__dirname, '../dist'),
        filename: 'assets/js/[name].js',
        publicPath: '/'
    },
    resolve: {
        extensions: ['.vue', '.js', '.json'],
        alias: {
            assets: join(__dirname, '../src/assets'),
            components: join(__dirname, '../src/components'),
            pages: join(__dirname, '../src/pages'),
        }
    },
    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader'
            },
            {
                test: /\.js$/,
                use: 'babel-loader',
                exclude: /node_modules/
            },
            {
                test: /\.css$/,
                use: ['css-hot-loader'].concat(ExtractTextPlugin.extract({
                    use: cssOptions,
                    fallback: styleLoaderOptions
                }))
            },
            {
                test: /\.less$/,
                use: ['css-hot-loader'].concat(ExtractTextPlugin.extract({
                    use: lessOptions,
                    fallback: styleLoaderOptions
                }))
            },
            {
                test: /\.scss$/,
                use: ['css-hot-loader'].concat(ExtractTextPlugin.extract({
                    use: sassOptions,
                    fallback: styleLoaderOptions
                }))
            },
            {
                test: /\.postcss/,
                use: ['css-hot-loader'].concat(ExtractTextPlugin.extract({
                    use: postOptions,
                    fallback: styleLoaderOptions
                }))
            },
            {
                test: /\.html$/,
                use: [{
                    loader: 'html-loader',
                    options: {
                        root: resolve(__dirname, 'src'),
                        attrs: ['img:src', 'link:href']
                    }
                }]
            },
            {
                test: /\.(png|jpg|jpeg|gif|eot|ttf|woff|woff2|svg|svgz)(\?.+)?$/,
                exclude: /favicon\.png$/,
                use: [{
                    loader: 'url-loader',
                    options: {
                        limit: 10000,
                        name: 'assets/img/[name].[hash:7].[ext]'
                    }
                }]
            }
        ]
    },
    optimization: {
        splitChunks: {
            cacheGroups: {
                commons: {
                    chunks: 'initial',
                    minChunks: 3,
                    name: 'commons',
                    enforce: true
                }
            }
        }
    },
    externals: {
        'vue': 'Vue',
        'element-ui': 'element-ui'
    },
    performance: {
        hints: false
    },
    plugins: [
        new webpack.optimize.ModuleConcatenationPlugin(),
        vueLoader,
        extractLESS,
        extractSASS,
        extractCSS
    ]
}
config.plugins = [...config.plugins, ...htmlWebpackPluginArray, webpackCDN]
module.exports = config
