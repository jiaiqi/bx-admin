// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from "vue";
import App from "./App.vue";
import router from "./router.js";
import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
// 自定义theme.css
import "../theme/scss/common-theme.scss";
import VueInit from "@/components/common/vue_init";
import VueUtil from "@/components/common/vue_util";
import store from "./store";
import bxPlugin from "./plugin/bx-plugin.js";

import Fragment from "vue-fragment";
Vue.use(Fragment.Plugin);

// 注册 clickoutside 指令
import clickoutside from '@/directives/clickoutside.js'
Vue.directive('clickoutside', clickoutside)

import upperFirst from "lodash/upperFirst";
import camelCase from "lodash/camelCase";
const requireComponent = require.context(
  // 其组件目录的相对路径
  "./components/globalComponent",
  // 是否查询其子目录
  true,
  // 匹配基础组件文件名的正则表达式
  /Lc[A-Z]\w+\.(vue|js)$/
);

requireComponent.keys().forEach((fileName) => {
  // 获取组件配置
  const componentConfig = requireComponent(fileName);
  // 获取组件的 PascalCase 命名
  const componentName = upperFirst(
    camelCase(
      // 获取和目录深度无关的文件名
      fileName
        .split("/")
        .pop()
        .replace(/\.\w+$/, "")
    )
  );
  // 全局注册组件
  Vue.component(
    componentName,
    // 如果这个组件选项是通过 `export default` 导出的，
    // 那么就会优先使用 `.default`，
    // 否则回退到使用模块的根。
    componentConfig.default || componentConfig
  );
});



Vue.config.productionTip = false;


Vue.use(bxPlugin);
VueInit();
VueUtil();
Vue.use(ElementUI);

window.app = new Vue({
  el: "#app",
  store,
  router,
  render: (h) => h(App),
});
