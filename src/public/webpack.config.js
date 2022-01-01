import path from 'path';
import {fileURLToPath} from 'url';
import HtmlWebpackPlugin from 'html-webpack-plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
    mode: process.env.NODE_ENV || "development",
    entry: {
        app: path.resolve(__dirname, './app'),
        admin: path.resolve(__dirname, './admin')
    },
    cache: {
        type: 'filesystem',
        allowCollectingMemory: true,
        cacheDirectory: path.resolve(__dirname, '../../.build_cache'),
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        filename: '[name]/bundle.js',
        path: path.resolve(__dirname, '../../dist/public'),
    },
    plugins: [new HtmlWebpackPlugin({
        title: "Scoring App",
        filename: '[name]/index.html',
        template: path.resolve(__dirname, 'index.html'),
        inject: false
    })],
};