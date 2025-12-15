const webpack = require("webpack");
const CompressionWebpackPlugin = require("compression-webpack-plugin");
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  chainWebpack: (config) => {
    // Babel配置优化
    config.module
      .rule('js')
      .use('babel-loader')
      .tap(options => ({
        ...options,
        presets: [
          ['@babel/preset-env', { 
            useBuiltIns: 'entry', 
            corejs: 3,
            targets: {
              browsers: ['> 1%', 'last 2 versions', 'not ie <= 8']
            }
          }]
        ],
        plugins: [
          "@babel/plugin-transform-optional-chaining", // 可选链 ?.
          "@babel/plugin-transform-nullish-coalescing-operator", // 空值合并 ??
          process.env.NODE_ENV === 'production' && 'transform-remove-debugger' // 移除debugger语句
        ].filter(Boolean)
      }));
    config.plugins.delete('preload');
    config.plugins.delete('prefetch');
    if (process.env.NODE_ENV === "production") {
      config.optimization.minimize(true); // 启用代码压缩
    }
  },
  productionSourceMap: process.env.ENABLE_SOURCE_MAP === 'true', // 生产环境生成不生成sourceMap
  transpileDependencies: ["simple-mind-map", "@svgdotjs", "json-editor-vue"],
  publicPath: process.env.VUE_APP_TARGET === 'wj' ? './' : "/vpages/",
  outputDir: "vpages",
  configureWebpack: {
    resolve: {
      alias: { '@': require('path').resolve(__dirname, 'src') },
      extensions: ['.js', '.vue', '.json']
    },
    optimization: process.env.NODE_ENV === 'production' ? {
      splitChunks: {
        chunks: "all",
        minSize: 1000 * 1000, // 提高最小chunk大小，减少过度分割
        maxSize: 5000 * 1000, // 提高最大chunk大小
        name: false, // 关闭自动命名组合，避免 app~*.js
        cacheGroups: {
          //Ui库强制分包,分包策略优先级最高
          'element-ui': {
            test: /[\\/]node_modules[\\/]element-ui[\\/]/,
            name: 'element-ui',
            priority: 40,
            chunks: 'all',
            enforce: true
          },
          // 关闭默认 common 拆分，避免自动生成 app~*.js
          default: false,
          defaultVendors: false
        }
      },
      minimizer: [
        new (require('terser-webpack-plugin'))({
          terserOptions: {
            compress: {
              // drop_console: true, // 移除console
              // drop_debugger: true, // 移除debugger
              // pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'] // 移除特定函数
            },
            mangle: {
              safari10: true //Safari 10
            }
          },
          extractComments: false //忽略注释
        })
      ]
    } : {},

    plugins: process.env.NODE_ENV !== "development"
      ? [
          // Gzip压缩配置优化
          new CompressionWebpackPlugin({
            algorithm: "gzip",
            test: new RegExp("\\.(" + ["js", "css"].join("|") + ")$"),
            threshold: 8192, //最低8k
            minRatio: 0.8,
            deleteOriginalAssets: false//不再保留源文件
          }),
          
          //ig moment.js的locale文件
          new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
          
          //igElementUI的locale文件
          new webpack.IgnorePlugin(/^\.\/locale$/, /element-ui$/),
          
          //环境变量
          new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
          }),
          
          //模块ID
          new webpack.HashedModuleIdsPlugin(),
          
          // 添加BundleAnalyzerPlugin用于分析 - 只在需要分析时启用
          new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            openAnalyzer: false,
            reportFilename: 'bundle-report.html',
            generateStatsFile: true,
            statsFilename: 'bundle-stats.json'
          })
        ]
      : [
          new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
          new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
          })
        ]
  },

  devServer: {
    port: 8080,
    https: false,
    open: false,
    hot: true, // 启用热更新
    compress: true, // 启用gzip压缩
    overlay: {
      errors: true,
      warnings: false
    },
    proxy: {
      "/baiduApi": {
        target: "https://api.map.baidu.com",
        changeOrigin: true,
        ws: true,
        pathRewrite: {
          "^/baiduApi": "",
        },
      },
    },
  },
};
