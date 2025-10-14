const webpack = require("webpack");
const CompressionWebpackPlugin = require("compression-webpack-plugin");
const productionGzipExtensions = ["js", "css"];
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

function getProdExternals() {
  return {
    lodash: "_",
    moment: "moment",
  };
}



module.exports = {
  chainWebpack: (config) => {
    // Babel配置优化
    config.module
      .rule('js')
      .use('babel-loader')
      .tap(options => {
        return {
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
            // 生产环境移除console和debugger
            // process.env.NODE_ENV === 'production' && [
            //   'transform-remove-console',
            //   {
            //     exclude: ['error', 'warn'] // 保留error和warn
            //   }
            // ],
            // 移除debugger语句
            process.env.NODE_ENV === 'production' && 'transform-remove-debugger'
          ].filter(Boolean)
        };
      });

    // 生产环境优化
    if (process.env.NODE_ENV === "production") {
      // 启用代码压缩
      config.optimization.minimize(true);

      // 添加BundleAnalyzerPlugin - 只在需要分析时启用
      // config
      //   .plugin('bundle-analyzer')
      //   .use(BundleAnalyzerPlugin, [{
      //     analyzerMode: 'static',
      //     openAnalyzer: false,
      //     reportFilename: 'bundle-report.html',
      //     generateStatsFile: true,
      //     statsFilename: 'bundle-stats.json'
      //   }]);
    }

    // 开发环境优化
    if (process.env.NODE_ENV === "development") {
      // 开发环境启用热更新
      config.plugins.delete('preload');
      config.plugins.delete('prefetch');
    }

    // 生产环境优化preload和prefetch策略 - 解决首次加载过慢问题
    if (process.env.NODE_ENV === "production") {
      // 完全禁用preload，避免首次加载过多资源
      config.plugins.delete('preload');

      // 避免预取大型库文件，减少不必要的网络请求
      config.plugin('prefetch').tap(options => {
        options[0].fileBlacklist = options[0].fileBlacklist || [];
        options[0].fileBlacklist.push(
          /\.map$/, // 排除sourcemap
          /vendor/, // 排除vendor包
          /editor-vendor/, // 排除编辑器相关
          /echarts-vendor/, // 排除图表库
          /other-vendor/, // 排除其他大型库
          /bootstrap-vendor/, // 排除bootstrap
          /utils-vendor/, // 排除工具库
          /element-ui/, // 排除element-ui
          /vue-vendor/, // 排除vue相关
          /\.(woff|woff2|ttf|eot)$/, // 排除字体文件
          /bcmap/, // 排除百度地图
          /test\./, // 排除测试文件
          /demo\./, // 排除演示文件
          /example\./ // 排除示例文件
        );
        return options;
      });
    }
  },

  productionSourceMap: process.env.ENABLE_SOURCE_MAP === 'true', // 生产环境生成不生成sourceMap
  transpileDependencies: ["simple-mind-map", "@svgdotjs", "json-editor-vue"],
  // publicPath: process.env.VUE_APP_TARGET === 'wj' ? './' : "/vpages/",
  publicPath: './',
  outputDir: "vpages",

  configureWebpack: {
    // 性能优化
    performance: {
      hints: process.env.NODE_ENV === 'production' ? 'warning' : false,
      maxEntrypointSize: 1024000, // 提高入口文件大小限制到1MB
      maxAssetSize: 1024000 // 提高资源文件大小限制到1MB
    },

    // 优化解析
    resolve: {
      alias: {
        '@': require('path').resolve(__dirname, 'src')
      },
      extensions: ['.js', '.vue', '.json']
    },

    // 生产环境优化配置
    optimization: process.env.NODE_ENV === 'production' ? {
      usedExports: true, // 开启tree shaking
      sideEffects: true, // 开启副作用分析
      splitChunks: {
        chunks: "all",
        minSize: 100 * 1000, // 提高最小chunk大小到100KB，减少过度分割
        maxSize: 500 * 1000, // 降低最大chunk大小到500KB，避免单个包过大
        minChunks: 3, // 提高至少被3个chunk引用才分离
        maxAsyncRequests: 10, // 大幅减少异步请求数量
        maxInitialRequests: 8, // 大幅减少初始请求数量
        automaticNameDelimiter: "~",
        name: true,
        cacheGroups: {
          //Ui库强制分包,分包策略优先级最高
          'element-ui': {
            test: /[\\/]node_modules[\\/]element-ui[\\/]/,
            name: 'element-ui',
            priority: 40,
            chunks: 'all',
            enforce: false
          },

          //Vue主包不会强制分离
          'vue-vendor': {
            test: /[\\/]node_modules[\\/](vue|vue-router|vuex)[\\/]/,
            name: 'vue-vendor',
            priority: 35,
            chunks: 'all',
            enforce: false
          },

          // 编辑器分包 -按需只对异步chunk分离
          'editor-vendor': {
            test: /[\\/]node_modules[\\/](@wangeditor|tinymce|codemirror|ace-builds|simple-mind-map|@tiptap)[\\/]/,
            name: 'editor-vendor',
            priority: 30,
            chunks: 'async',
            enforce: false
          },

          // Echarts 分包按需，异步chunk分离
          'echarts-vendor': {
            test: /[\\/]node_modules[\\/]echarts[\\/]/,
            name: 'echarts-vendor',
            priority: 25,
            chunks: 'async',
            enforce: false
          },

          // 工具库分包
          'utils-vendor': {
            test: /[\\/]node_modules[\\/](lodash|moment|dayjs|axios|jquery)[\\/]/,
            name: 'utils-vendor',
            priority: 20,
            chunks: 'all',
            enforce: false
          },

          // 其他大型库分包，按需，只对异步chunk分离
          'other-vendor': {
            test: /[\\/]node_modules[\\/](@antv|xlsx|jspdf|html2canvas|ezuikit-js|vue-easytable)[\\/]/,
            name: 'other-vendor',
            priority: 15,
            chunks: 'async',
            enforce: false
          },

          // Bootstrap分包，按需，只对异步chunk分离
          'bootstrap-vendor': {
            test: /[\\/]node_modules[\\/](bootstrap|bootstrap-vue|bootstrap-icons)[\\/]/,
            name: 'bootstrap-vendor',
            priority: 15,
            chunks: 'async',
            enforce: false
          },

          //其他第三方分包，最后处理
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            priority: -10,
            chunks: 'all'
          }
        }
      },
      minimizer: [
        new (require('terser-webpack-plugin'))({
          parallel: true, // 启用多核并行压缩,提升压缩速度
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
          test: new RegExp("\\.(" + productionGzipExtensions.join("|") + ")$"),
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
        // new BundleAnalyzerPlugin({
        //   analyzerMode: 'static',
        //   openAnalyzer: false,
        //   reportFilename: 'bundle-report.html',
        //   generateStatsFile: true,
        //   statsFilename: 'bundle-stats.json'
        // })
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
