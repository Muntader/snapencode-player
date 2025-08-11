// webpack.dev.config.js - Development server build
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'development',

    // Entry point is our example app
    entry: './example/index.tsx',

    output: {
        path: path.resolve(__dirname, 'dist-dev'), // Output to a separate dev-dist folder
        filename: 'bundle.js',
        publicPath: '/',
    },

    devtool: 'eval-source-map',

    devServer: {
        static: path.join(__dirname, 'dist-dev'),
        compress: true,
        port: 9000,
        hot: true, // Enable Hot Module Replacement
        open: true, // Open browser automatically
    },

    module: {
        // We can re-use the same rules from your library config
        rules: [
            {
                test: /\.(ts|tsx|js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            '@babel/preset-env',
                            ['@babel/preset-react', { runtime: 'automatic' }],
                            '@babel/preset-typescript',
                        ],
                        plugins: ['@babel/plugin-proposal-class-properties'],
                    },
                },
            },
            {
                test: /\.css$/,
                // We don't need to extract CSS for dev server, makes HMR faster
                use: ['style-loader', 'css-loader', 'postcss-loader'],
            },
            {
                test: /\.(png|jpe?g|gif|svg|ico)$/,
                type: 'asset/resource',
            },
        ],
    },

    resolve: {
        extensions: ['.tsx', '.ts', '.jsx', '.js'],
        alias: {
            '@': path.resolve(__dirname, 'src'),
        },
    },

    plugins: [
        // This plugin generates an HTML file and injects the bundle
        new HtmlWebpackPlugin({
            template: './example/index.html',
        }),
    ],

    // IMPORTANT: No externals here. We want to bundle React for our example page.
    // IMPORTANT: No optimization/minimization needed for dev server.
};
