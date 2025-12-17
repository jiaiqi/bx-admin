// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from "vue";
import App from "./App.vue";
import router from "./router/index.js";
import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
// 自定义theme.css
import "../theme/scss/common-theme.scss";
import VueInit from "@/components/common/vue_init";
import VueUtil from "@/components/common/vue_util";
import store from "./store";
import bxPlugin from "./plugin/bx-plugin.js";
// 更新检查
import updateChecker from "./common/updateChecker";

import Fragment from "vue-fragment";
Vue.use(Fragment.Plugin);

// 注册 clickoutside 指令
import clickoutside from '@/directives/clickoutside.js'
Vue.directive('clickoutside', clickoutside)

// import upperFirst from "lodash/upperFirst";
// import camelCase from "lodash/camelCase";
// const requireComponent = require.context(
//   // 其组件目录的相对路径
//   "./components/globalComponent",
//   // 是否查询其子目录
//   true,
//   // 匹配基础组件文件名的正则表达式
//   /Lc[A-Z]\w+\.(vue|js)$/
// );

// requireComponent.keys().forEach((fileName) => {
//   // 获取组件配置
//   const componentConfig = requireComponent(fileName);
//   // 获取组件的 PascalCase 命名
//   const componentName = upperFirst(
//     camelCase(
//       // 获取和目录深度无关的文件名
//       fileName
//         .split("/")
//         .pop()
//         .replace(/\.\w+$/, "")
//     )
//   );
//   // 全局注册组件
//   Vue.component(
//     componentName,
//     // 如果这个组件选项是通过 `export default` 导出的，
//     // 那么就会优先使用 `.default`，
//     // 否则回退到使用模块的根。
//     componentConfig.default || componentConfig
//   );
// });



Vue.config.productionTip = false;

// ==================== 路由栈全局方法 ====================
// 添加全局路由栈操作方法
Vue.prototype.$routeStack = {
  // 返回上一个路由
  goBack() {
    return store.dispatch('routeStack/goBack', router);
  },
  
  // 前进到下一个路由
  goForward() {
    return store.dispatch('routeStack/goForward', router);
  },
  
  // 跳转到指定索引的路由
  goToIndex(index) {
    return store.dispatch('routeStack/goToIndex', { index, router });
  },
  
  // 获取路由栈
  getStack() {
    return store.getters['routeStack/routeStack'];
  },
  
  // 获取栈大小
  getStackSize() {
    return store.getters['routeStack/stackSize'];
  },
  
  // 是否可以返回
  canGoBack() {
    return store.getters['routeStack/canGoBack'];
  },
  
  // 是否可以前进
  canGoForward() {
    return store.getters['routeStack/canGoForward'];
  },
  
  // 获取上一个路由
  getPreviousRoute() {
    return store.getters['routeStack/previousRoute'];
  },
  
  // 获取下一个路由
  getNextRoute() {
    return store.getters['routeStack/nextRoute'];
  },
  
  // 获取当前路由
  getCurrentRoute() {
    return store.getters['routeStack/currentRoute'];
  },
  
  // 清空路由栈
  clearStack() {
    return store.dispatch('routeStack/clearStack');
  },
  
  // 移除指定路由
  removeRoute(index) {
    return store.dispatch('routeStack/removeRoute', index);
  },
  
  // 启用/禁用路由栈管理
  setEnabled(enabled) {
    return store.dispatch('routeStack/setEnabled', enabled);
  },
  
  // 设置最大栈大小
  setMaxSize(size) {
    return store.dispatch('routeStack/setMaxSize', size);
  },
  
  // 智能返回（优先使用栈内路由，否则使用浏览器返回）
  smartGoBack() {
    if (this.canGoBack()) {
      return this.goBack();
    } else {
      return router.go(-1);
    }
  }
};

// 添加全局路由栈事件总线
Vue.prototype.$routeStackBus = new Vue();

// 监听路由栈变化并发送事件
store.watch(
  (state) => state.routeStack.stack,
  (newStack, oldStack) => {
    Vue.prototype.$routeStackBus.$emit('stack-changed', {
      newStack,
      oldStack,
      size: newStack.length
    });
  },
  { deep: true }
);

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

// ==================== 更新检查 ====================
// 仅在生产环境中启用更新检查
if (process.env.NODE_ENV === 'production') {
  // 应用启动时检查更新
  setTimeout(async () => {
    const updateInfo = await updateChecker.checkUpdate();
    updateChecker.showUpdateNotification(updateInfo);
  }, 1000);

  // 定期检查更新（每10分钟）
  setInterval(async () => {
    const updateInfo = await updateChecker.checkUpdate();
    updateChecker.showUpdateNotification(updateInfo);
  }, 10 * 60 * 1000);
}
