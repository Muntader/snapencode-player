const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    // ... (mode, entry, output, module, resolve sections are all fine) ...
    mode: 'development',
    entry: './src/index.tsx',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js',
        clean: true,
    },

    // ==========================================================
    // START: Apply the fix here
    // ==========================================================
    devServer: {
        static: {
            directory: path.join(__dirname, 'dist'),
            // FIX: Explicitly disable the directory listing feature
            // that causes the conflict.
            serveIndex: false,
        },
        // BEST PRACTICE: Add this for Single Page Applications.
        // It redirects all 404s to /index.html, allowing React Router to work.
        historyApiFallback: true,
        compress: true,
        port: 9000,
    },
    // ==========================================================
    // END: Fix applied
    // ==========================================================

    module: {
        rules: [
            {
                test: /\.(ts|tsx|js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                },
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader', 'postcss-loader'],
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js', '.jsx'],
        alias: {
            '@': path.resolve(__dirname, 'src/'),
        }
    },
    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: 'public',
                    to: '.',
                },
            ],
        }),
        new HtmlWebpackPlugin({
            template: './src/index.html',
        }),
    ],
};
