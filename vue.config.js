const webpack = require("webpack");
const CompressionWebpackPlugin = require("compression-webpack-plugin");
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const { getPublicPath, getOutputDir, getAssetsDir } = require("./src/common/config.js");

// Node 侧从 CommonJS 模块读取公共路径和输出配置
const publicPath = getPublicPath();
const outputDir = getOutputDir();
const assetsDir = getAssetsDir();

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

    // 仅为业务代码生成 SourceMap（生产 + 显式开启 ENABLE_SOURCE_MAP 时）
    if (process.env.NODE_ENV === 'production' && process.env.ENABLE_SOURCE_MAP === 'true') {
      // 禁用默认 devtool，由插件精细化接管
      config.devtool(false);
      config
        .plugin('sourcemap-devtool')
        .use(webpack.SourceMapDevToolPlugin, [{
          filename: 'sourcemaps/[name].[contenthash:8].js.map',
          // 等价于 cheap-module-source-map：只生成行映射，不含列信息，且保留模块路径
          module: true,
          columns: false,
          // 排除第三方与特大包，仅为业务代码生成 map
          exclude: [
            /node_modules/,
            /chunk-vendors.*\.js$/,
            /vendors.*\.js$/,
            /video~.*\.js$/
          ]
        }]);
    }

    // 统一非 JS 资源的输出路径到 assets 下的子目录
    // 图片资源
    config.module
      .rule('images')
      .use('url-loader')
      .tap(options => {
        options.name = 'assets/img/[name].[hash:8].[ext]';
        return options;
      });

    // 字体资源
    config.module
      .rule('fonts')
      .use('url-loader')
      .tap(options => {
        options.name = 'assets/fonts/[name].[hash:8].[ext]';
        return options;
      });

    // 媒体资源（音视频等）
    config.module
      .rule('media')
      .use('url-loader')
      .tap(options => {
        options.name = 'assets/media/[name].[hash:8].[ext]';
        return options;
      });

    // 统一 CSS 输出到 assets/css
    if (config.plugins.has('extract-css')) {
      config.plugin('extract-css').tap(args => {
        args[0].filename = 'assets/css/[name].[contenthash:8].css';
        args[0].chunkFilename = 'assets/css/[name].[contenthash:8].css';
        return args;
      });
    }
  },

  // 由插件精细化控制 sourcemap，默认关闭全局生产 SourceMap
  productionSourceMap: false,
  // 显式关闭 CSS SourceMap（CSS 生成 map 耗时大）
  css: {
    sourceMap: false
  },
  transpileDependencies: ["simple-mind-map", "@svgdotjs", "json-editor-vue"],
  // publicPath: process.env.VUE_APP_TARGET === 'wj' ? './' : "/vpages/",
  publicPath: publicPath,
  outputDir: outputDir,
  // 将所有构建资源统一置于 outputDir 下的 assets 目录
  assetsDir: assetsDir,

  configureWebpack: {

    // 优化解析
    resolve: {
      alias: { '@': require('path').resolve(__dirname, 'src') },
      extensions: ['.js', '.vue', '.json']
    },

    // 统一 JS 输出到 assets/js，区分开发与生产环境的文件名
    output: process.env.NODE_ENV === 'production' ? {
      // 生产环境使用 [hash]，避免 webpack4 对 [contenthash]/[chunkhash] 的限制
      filename: 'assets/js/[name].[hash:8].js',
      chunkFilename: 'assets/js/[name].[hash:8].js'
    } : {
      // 开发环境（启用 HMR）不能使用 contenthash/chunkhash
      filename: 'assets/js/[name].js',
      chunkFilename: 'assets/js/[name].js'
    },

    // 生产环境优化配置
    optimization: process.env.NODE_ENV === 'production' ? {
      usedExports: true, // 开启tree shaking
      sideEffects: true, // 开启副作用分析
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
          parallel: true, // 启用多核并行压缩,提升压缩速度
          terserOptions: {
            compress: {
              drop_console: true, // 移除console
              drop_debugger: true, // 移除debugger
              pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'] // 移除特定函数
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
      "/bxmap": {
        target: "http://192.168.0.151",
        changeOrigin: true,
        ws: true
      },
    },
  },
};
