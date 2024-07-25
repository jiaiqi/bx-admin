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
import vueAxiosInit from "@/components/common/vueAxiosInit";
import store from "./store";
import bxPlugin from "./plugin/bx-plugin.js";
import Fragment from "vue-fragment";
Vue.use(Fragment.Plugin);

import { BootstrapVue, BootstrapVueIcons } from "bootstrap-vue";
Vue.use(BootstrapVue);
Vue.use(BootstrapVueIcons);


// 生产环境重写console.log达到去除log的目的
function rewirteLog() {
  console.log = (function (log) {
    return process.env.NODE_ENV == "production" ? function () {} : log;
  })(console.log);
}
rewirteLog();


import Viewer from "v-viewer";
import "viewerjs/dist/viewer.css";
import echarts from "echarts";
import More from "./components/ll/more.vue";
import SmallButtonTag from "./components/ll/smallButtonTag.vue";
import filterColumn from "./components/globalComponent/filter-column.vue";
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

Vue.component("more", More);
Vue.component("filterColumn", filterColumn);
Vue.component("small-button-tag", SmallButtonTag);
Vue.prototype.$echarts = echarts;
Vue.component("recursionTree", {
  functional: true,
  injections: true,
  render: function (h, context) {
    // 完全透传任何 attribute、事件监听器、子节点等。

    let { config = [] } = context.data.attrs;

    //     <component v-if="!!inputPropsObject" v-bind:is="componentType"
    //     v-bind="inputPropsObject"
    // >
    // </component>

    let domArray = config.map((item, index) => {
      if (item instanceof Object) {
        return (
          <component config={item} key={item.key} is={item.type}></component>
        );
      } else {
        return <template>{item}</template>;
      }
    });
    return <template>{domArray}</template>;
  },
});

import "bootstrap/dist/css/bootstrap.min.css";
// import $ from 'jquery'
// window.$=$;
// window.jQuery=$;
// console.log(window.jQuery,"==window.jQuery==")

// console.log("呵呵===")
// import 'bootstrap';

Vue.config.productionTip = false;
Vue.use(Viewer);
Viewer.setDefaults({
  Options: {
    inline: true,
    button: true,
    navbar: true,
    title: true,
    toolbar: true,
    tooltip: true,
    movable: true,
    zoomable: true,
    rotatable: true,
    scalable: true,
    transition: true,
    fullscreen: true,
    keyboard: true,
    url: "data-source",
  },
});

Vue.use(bxPlugin);
VueInit();
VueUtil();
vueAxiosInit();
Vue.use(ElementUI);
// Vue.use(VueResource);

window.app = new Vue({
  el: "#app",
  store,
  router,
  render: (h) => h(App),
});
