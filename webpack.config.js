const path = require('path')

const HtmlWebpackPlugin = require("html-webpack-plugin")
const MiniCssExtractPlugin = require("mini-css-extract-plugin")

module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'main.js',
        // publicPath: '/assets/',
        path: path.join(__dirname, 'build')
    },
    module: {
        rules: [
            {
                test: /\.less$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    'less-loader'
                ]
            },
            {
                //处理图片资源
                test: /\.(jpg|png|gif|jpeg|svg)$/,

                //------使用webpack5内置的type
                type: "asset",
                parser: {
                    dataUrlCondition: {
                        maxSize: 8 * 1024  //data转成url的条件，也就是转成bas64的条件,maxSize相当于limit
                    }
                },
                generator: {
                    //geneator中是个对象，配置下filename，和output中设置assetModuleFilename一样，将资源打包至imgs文件夹
                    filename: "imgs/[name].[hash:6][ext]"  //[name]指原来的名字，[hash:6]取哈希的前六位，[ext]指原来的扩展名
                }
            },
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html'
        }),
        new MiniCssExtractPlugin({
            filename: 'style/dist.css'
        })
    ],
    mode: "development",
    // mode: "production",
    devServer: {
        // contentBase: path.join(__dirname, 'build'),
        compress: true,
        port: 8080,
        open: true,
        liveReload: true
    }
}