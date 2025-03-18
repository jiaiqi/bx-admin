const webpack = require("webpack");
const CompressionWebpackPlugin = require("compression-webpack-plugin");
const productionGzipExtensions = ["js", "css"];

function getProdExternals() {
  // for lib target
  // return {
  //   lodash: "lodash",
  //   moment: "moment",
  // };

  // for app target
  return {
    // "vue":"Vue",
    // "vue-router":"VueRouter",
    // "vuex":"Vuex",
    lodash: "_",
    moment: "moment",
    // "element-ui":"ELEMENT"
  };
}

module.exports = {
  chainWebpack: (config) => {
    config.module
      .rule('js')
      .use('babel-loader')
      .tap(options => {
        return {
          ...options,
          presets: [
            ['@babel/preset-env', { useBuiltIns: 'entry', corejs: 3 }]
          ],
          plugins: [
            "@babel/plugin-transform-optional-chaining", // 可选链 ?.
            "@babel/plugin-transform-nullish-coalescing-operator" // 空值合并 ??
          ]
        };
      });
    if (process.env.NODE_ENV === "production") {
      // 只在生产环境中应用此配置
      // 生产环境 删除懒加载模块的 prefetch preload，降低带宽压力
      // 移除 prefetch 插件
      config.plugins.delete("prefetch");
      // 移除 preload 插件
      config.plugins.delete("preload");
      // 生产环境 压缩代码
      config.optimization.splitChunks = {
        chunks: "all", // 对所有类型的chunk（同步和异步）进行分割
        minSize: 10 * 1000, // 最小尺寸，这里设置为10KB（10000字节），默认是30000字节
        maxSize: 500 * 1000, // 添加这个配置来确保超过500KB的chunk会被分割
        minChunks: 1, // 被至少多少个chunk共享的模块才会被提取
        maxAsyncRequests: 20, // 最大异步请求数量
        maxInitialRequests: 20, // 入口点处的最大并行请求数量
        automaticNameDelimiter: "~", // 文件名连接符
        name: true, // 根据模块的路径自动生成名称
        cacheGroups: {
          // 缓存组配置，可以根据不同的条件定制拆分规则
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            priority: -10, // 优先级
            filename: "vendors.js", // 提取出的chunk命名
          },
          default: {
            minChunks: 2, // 默认情况下，被至少两个chunk共享的模块才会被提取
            priority: -20,
            reuseExistingChunk: true, // 如果已存在对应的chunk，则复用而不是新建
          },
        },
      };
      config.optimization.minimize(true);
    }
  },
  productionSourceMap: true, // 生产环境是否生成 sourceMap 文件
  transpileDependencies: ["simple-mind-map","@svgdotjs"], // 思维导图
  // publicPath: process.env.NODE_ENV === 'production' ? '/vpages/' : './',
  publicPath: "/vpages/",
  outputDir: "vpages",
  // lintOnSave: false,//在线excel添加
  configureWebpack: {
    // externals:  getProdExternals(),
    // externals: process.env.NODE_ENV === "production" ? getProdExternals() : {},
    plugins:
      process.env.NODE_ENV !== "development"
        ? //// 配置compression-webpack-plugin压缩 对超过10kb的文件gzip压缩
        [
          new CompressionWebpackPlugin({
            algorithm: "gzip",
            test: new RegExp(
              "\\.(" + productionGzipExtensions.join("|") + ")$"
            ),
            threshold: 10240,
            minRatio: 0.8,
          }),
          // Ignore all locale files of moment.js
          new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
        ]
        : [new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)],
  },
  devServer: {
    port: 8080, // 端口号
    // host: "192.168.0.133",
    https: false, // https:{type:Boolean}
    open: false, //配置自动启动浏览器
    proxy: {
      "/baiduApi": {
        target: "https://api.map.baidu.com", // 目标接口域名
        // target:'http://192.168.0.151/bxmap', // 目标接口域名
        changeOrigin: true, //是否跨域
        ws: true, // 是否代理websockets
        pathRewrite: {
          "^/baiduApi": "", //请求的时候使用这个api就可以
        },
      },
    },
    // proxy: 'http://localhost:4000' // 配置跨域处理,只有一个代理
    // proxy: {
    //   "/api": {
    //   target: "<url>",
    //     ws: true,
    //     changeOrigin: true
    //   },
    //   "/foo": {
    //     target: "<other_url>"
    //   }
    // } // 配置多个代理
  },
};
