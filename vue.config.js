const webpack = require("webpack");
const CompressionWebpackPlugin = require('compression-webpack-plugin')
const productionGzipExtensions = ['js', 'css']

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
    "lodash": "_",
    "moment": "moment",
    // "element-ui":"ELEMENT"
  };
}

module.exports = {
  transpileDependencies: ['simple-mind-map'], // 思维导图
  publicPath: process.env.NODE_ENV === 'production' ? '/vpages/' : './',
  // lintOnSave: false,//在线excel添加
  configureWebpack: { 
    // externals: process.env.NODE_ENV === 'production' ? getProdExternals() : {},
    externals: process.env.NODE_ENV === 'production' ? getProdExternals() : {},


    plugins: process.env.NODE_ENV !== 'development' ? 
      //// 配置compression-webpack-plugin压缩 对超过10kb的文件gzip压缩
      [new CompressionWebpackPlugin({
        algorithm: 'gzip',
        test: new RegExp('\\.(' + productionGzipExtensions.join('|') + ')$'),
        threshold: 10240,
        minRatio: 0.8
      }),
      // Ignore all locale files of moment.js
      new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)]
      :
      [ new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)]

  },
  devServer: {
    port: 8080, // 端口号
    // host: "192.168.0.133",
    https: false, // https:{type:Boolean}
    open: true, //配置自动启动浏览器
    proxy:{
      '/baiduApi':{
        target:'http://192.168.0.151/bxmap', // 目标接口域名
        changeOrigin:true,  //是否跨域
        ws: true, // 是否代理websockets
        pathRewrite:{
          '^/baiduApi':''   //请求的时候使用这个api就可以
        }
      }
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
  }
}
