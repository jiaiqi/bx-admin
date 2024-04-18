<script setup>
import {onMounted} from "vue";

function LoadScript(src) {
  const BMap_URL = src
  if (!src) {
    return
  }
  return new Promise((resolve, reject) => {
    // 如果已加载直接返回
    if (typeof BMap !== "undefined") {
      resolve(BMap);
      return true;
    }
    // // 百度地图异步加载回调处理
    // window.onBMapCallback = function () {
    //   console.log("百度地图脚本初始化成功...");
    //   resolve(BMap);
    // };
    // 插入script脚本
    let scriptNode = document.createElement("script");
    scriptNode.setAttribute("type", "text/javascript");
    scriptNode.setAttribute("src", BMap_URL);
    // 引入成功
    scriptNode.onload = function () {
      console.log('js资源已加载成功了')
    }
    // 引入失败
    scriptNode.onerror = function () {
      console.log('js资源加载失败了')
    }
    document.body.appendChild(scriptNode);
  });
}

const init = () => {
  const AK = 'FC190506b9b4fa8b366db9f78cb5e93e';
  const bMapSrc = `${location.protocol}//api.map.baidu.com/api?v=2.0&ak=${AK}&s=1&callback=onBMapCallback`
  const bMapGLSrc = `${location.protocol}//api.map.baidu.com/api?type=webgl&v=2.0&ak=${AK}`
  LoadScript(bMapSrc)
}
init()

</script>

<template>
  <router-view></router-view>
</template>

<style scoped>

</style>