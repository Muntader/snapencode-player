// webpack.esm.config.js - ES Modules build
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

module.exports = (env, argv) => {
    const isProduction = argv.mode === 'production';

    return {
        mode: isProduction ? 'production' : 'development',

        entry: './src/index.ts',

        experiments: {
            outputModule: true, // Enable ES module output
        },

        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: isProduction
                ? 'react-snapencode-player.esm.min.js'
                : 'react-snapencode-player.esm.js',
            clean: false, // Don't clean, we might have other builds

            // ES Module configuration
            library: {
                type: 'module', // Output as ES module
            },
            environment: {
                module: true, // Support ES modules
                dynamicImport: true,
            },
        },

        devtool: isProduction ? 'source-map' : 'eval-source-map',

        module: {
            rules: [
                {
                    test: /\.(ts|tsx|js|jsx)$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: [
                                ['@babel/preset-env', {
                                    targets: "> 0.25%, not dead",
                                    modules: false // Keep ES modules
                                }],
                                ['@babel/preset-react', {
                                    runtime: 'automatic'
                                }],
                                '@babel/preset-typescript'
                            ],
                            plugins: [
                                '@babel/plugin-proposal-class-properties'
                            ]
                        }
                    },
                },

                {
                    test: /\.css$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        'css-loader',
                        'postcss-loader'
                    ],
                },

                {
                    test: /\.(png|jpe?g|gif|svg|ico)$/,
                    type: 'asset/resource',
                    generator: {
                        filename: 'assets/[name][ext]'
                    }
                }
            ],
        },

        resolve: {
            extensions: ['.tsx', '.ts', '.jsx', '.js'],
            alias: {
                '@': path.resolve(__dirname, 'src'),
            }
        },

        plugins: [
            new MiniCssExtractPlugin({
                filename: isProduction
                    ? 'react-snapencode-player.esm.min.css'
                    : 'react-snapencode-player.esm.css'
            })
        ],

        optimization: {
            minimize: isProduction,
            minimizer: [
                new TerserPlugin({
                    terserOptions: {
                        compress: {
                            drop_console: isProduction
                        },
                        format: {
                            comments: false
                        }
                    }
                }),
                new CssMinimizerPlugin()
            ],
            splitChunks: false,
        },

        // External dependencies
        externals: {
            react: 'react',
            'react-dom': 'react-dom'
        },

        performance: {
            hints: false
        }
    };
};
