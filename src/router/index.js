import Vue from "vue";
import VueRouter from "vue-router";
import TabList from "@/components/common/tab-list2";

// 导入路由模块
import auditRoutes from "./modules/audit"; // 稽核项目相关路由
import healthRoutes from "./modules/health";
import paymentRoutes from "./modules/payment";
import formRoutes from "./modules/form";
import lowcodeRoutes from "./modules/lowcode";
import bookingRoutes from "./modules/booking";
import authorityRoutes from "./modules/authority";
import mediaRoutes from "./modules/media";
import toolsRoutes from "./modules/tools";
import businessRoutes from "./modules/business";
import xixiangRoutes from "./modules/xixiang";
import mindRoutes from "./modules/mind";
import mapRoutes from "./modules/map";

// ==================== 通用CRUD路由配置 ====================
const publicCrudRoutes = [
  // ==================== 通用CRUD操作 ====================
  {
    path: "/simple-add/:service_name",
    name: "simple-add",
    component: () => import(/* webpackChunkName: "common-crud" */ "@/components/common/simple-add"),
  },
  {
    path: "/add/:service_name",
    name: "add",
    component: () => import(/* webpackChunkName: "common-crud" */ "@/components/common/add"),
  },
  {
    path: "/update/:service_name/:id",
    name: "update",
    component: () => import(/* webpackChunkName: "common-crud" */ "@/components/common/update"),
  },
  {
    path: "/simple-update/:service_name/:id",
    name: "simple-update",
    component: () => import(/* webpackChunkName: "common-crud" */ "@/components/common/simple-update"),
  },
  {
    path: "/simple-filter/:service_name",
    name: "simple-filter",
    component: () => import(/* webpackChunkName: "common-crud" */ "@/components/common/simple-filter"),
  },
  {
    path: "/list/:service_name",
    name: "list",
    component: TabList,
    meta: {
      compName: "list",
    },
  },
  {
    path: "/list/tree/:service_name",
    name: "treeList",
    component: TabList,
    meta: {
      isTree: true,
    },
  },
  {
    path: "/list/:service_name/:card_no",
    name: "cardlist",
    component: () => import(/* webpackChunkName: "common-crud" */ "@/components/common/list"),
    meta: {
      compName: "list",
    },
  },

  // ==================== 详情和查看页面 ====================
  {
    path: "/detail/:service_name/:id",
    name: "detail",
    component: () => import(/* webpackChunkName: "common-crud" */ "@/components/common/detail"),
  },
  {
    path: "/detail/:service_name/:condcol/:condvalue",
    name: "detail1",
    component: () => import(/* webpackChunkName: "common-crud" */ "@/components/common/detail"),
  },
  {
    path: "/detailPlus/:service_name/:id",
    name: "detailPlus",
    component: () => import(/* webpackChunkName: "common-crud" */ "@/components/common/detail-plus"),
  },
  {
    path: "/cardDetail/:service_name/:id",
    name: "cardDetail",
    component: () => import(/* webpackChunkName: "common-crud" */ "@/components/common/detail"),
  },
  {
    path: "/cardDetail/:service_name/:condcol/:condvalue",
    name: "cardDetail1",
    component: () => import(/* webpackChunkName: "common-crud" */ "@/components/common/detail"),
  },

  // ==================== 流程相关路由 ====================
  {
    path: "/listproc/:service_name",
    name: "listproc",
    component: () => import(/* webpackChunkName: "flow" */ "@/components/common/listproc"),
  },
  {
    path: "/v2/listproc/:service_name",
    name: "listproc_v2",
    component: () => import(/* webpackChunkName: "flow" */ "@/components/common/listproc"),
  },
  {
    path: "/listallproc/:service_name",
    name: "listallproc",
    component: () => import(/* webpackChunkName: "flow" */ "@/components/common/listallproc"),
  },
  {
    path: "/v2/listallproc/:service_name",
    name: "listallproc_v2",
    component: () => import(/* webpackChunkName: "flow" */ "@/components/common/listallproc"),
  },
  {
    path: "/startproc/:service_name",
    name: "startproc",
    component: () => import(/* webpackChunkName: "flow" */ "@/components/common/procdetail"),
  },
  {
    path: "/v2/startproc/:service_name",
    name: "startproc_v2",
    component: () => import(/* webpackChunkName: "flow" */ "@/components/common/procdetail_v2"),
  },
  {
    path: "/procdetail/:proc_instance_no",
    name: "procdetail",
    component: () => import(/* webpackChunkName: "flow" */ "@/components/common/procdetail"),
  },
  {
    path: "/v2/procdetail/:proc_instance_no",
    name: "procdetail_v2",
    component: () => import(/* webpackChunkName: "flow" */ "@/components/common/procdetail_v2"),
  },

  // ==================== 统计和图表 ====================
  {
    path: "/stat/:service_name",
    name: "stat",
    component: () => import(/* webpackChunkName: "common-crud" */ "@/components/common/stat"),
  },
  {
    path: "/conf-stat-chart/:chartid",
    name: "confstatchart",
    component: () => import(/* webpackChunkName: "chart" */ "@/pages/conf-stat-chart"),
  },
  {
    path: "/show-stat-chart/:chartid",
    name: "showstatchart",
    component: () => import(/* webpackChunkName: "chart" */ "@/pages/show-stat-chart"),
  },
  {
    path: "/treegrid/:service_name",
    name: "treegrid",
    component: TabList,
  },
  {
    path: "/treelevel/:service_name",
    name: "treelevel",
    component: () => import(/* webpackChunkName: "common-crud" */ "@/components/common/treelevel"),
  },
  {
    path: "/editgrid/:service_name",
    name: "editgrid",
    component: () => import(/* webpackChunkName: "common-crud" */ "@/components/common/edit-grid"),
  },
  {
    path: "/custom-page/:page_no",
    name: "custompage",
    component: () => import(/* webpackChunkName: "common-crud" */ "@/components/common/custom-page"),
  },
  {
    path: "/reportList",
    name: "reportList",
    component: () => import(/* webpackChunkName: "common-crud" */ "@/components/common/report-list"),
    meta: {
      compName: "reportList",
    },
  },
  {
    path: "/explain",
    name: "explain",
    component: () => import(/* webpackChunkName: "ui" */ "@/components/ui/rich-text-view"),
    meta: {
      compName: "explain",
    },
  },
  // ==================== 个人信息管理 ====================
  {
    path: "/vxhr/personal-info",
    name: "personalInfo",
    component: () => import(/* webpackChunkName: "vxhr" */ "@/vxhr/personal-info"),
  },
  {
    path: "/vxhr/personal-info-update",
    name: "personalInfoUpdate",
    component: () => import(/* webpackChunkName: "vxhr" */ "@/vxhr/personal-info-update"),
  },
  {
    path: "/vxhr/personal-update",
    name: "personalUpdate",
    component: () => import(/* webpackChunkName: "vxhr" */ "@/vxhr/personal-update"),
  },
];
const routes = [{
  path: "/",
  name: "index",
  component: () => import(/* webpackChunkName: "home" */ "@/pages/index"),
},
...publicCrudRoutes,
// ==================== 西乡项目子路由 ====================
...xixiangRoutes,

// ==================== 思维导图子路由 ====================
...mindRoutes,

// ==================== 百度地图子路由 ====================
...mapRoutes,
]
// ==================== 合并所有模块路由 ====================
routes.push(...auditRoutes);
routes.push(...healthRoutes);
routes.push(...paymentRoutes);
routes.push(...formRoutes);
routes.push(...toolsRoutes);
routes.push(...bookingRoutes);
routes.push(...authorityRoutes);
routes.push(...mediaRoutes);
routes.push(...businessRoutes);

routes.push(
  ...[
    // ==================== 模板配置 ====================
    {
      path: "/template-config",
      name: "template-config",
      component: () => import(/* webpackChunkName: "template" */ "@/pages/template/config"),
    },
    {
      path: "/er-config",
      name: "er-config",
      component: () => import(/* webpackChunkName: "template" */ "@/pages/template/er-config"),
    },
    {
      path: "/print-page",
      component: () => import(/* webpackChunkName: "template" */ "@/pages/template/print-page"),
    },

    // ==================== 通用功能 ====================
    {
      path: "/inline-edit-list/:serviceName",
      component: () => import(/* webpackChunkName: "common-crud" */ "@/components/common/inline-edit-list.vue"),
    },
    {
      path: "/inform",
      component: () => import(/* webpackChunkName: "inform" */ "@/pages/inform.vue"),
    },
    {
      path: "/platform",
      component: () => import(/* webpackChunkName: "platform" */ "@/pages/platform/index.vue"),
    },
  ]
);

// 低代码相关
routes.push(...lowcodeRoutes);

router.push(
  {
    path: "/:pageNo",
    name: "lowcode-view1",
    meta: {
      isEditor: false,
      isView: true,
    },
    component: () => import(/* webpackChunkName: "lowcode" */ "@/pages/lowcode/view.vue"),
  }
)

Vue.use(VueRouter);
const router = new VueRouter({
  routes,
});

// 路由栈管理 - 需要在创建 store 后导入
let store = null;

// 延迟导入 store，避免循环依赖
const getStore = () => {
  if (!store) {
    store = require('@/store').default;
  }
  return store;
};

// 路由守卫 - 集成路由栈管理
router.beforeEach((to, from, next) => {
  try {
    const store = getStore();

    // 只有在路由栈启用时才记录路由
    if (store.getters['routeStack/isEnabled']) {
      // 推入新路由到栈
      store.dispatch('routeStack/pushRoute', to);
    }
  } catch (error) {
    console.warn('路由栈管理出错:', error);
  }

  next();
});

// 路由后置守卫 - 可用于额外的路由栈处理
router.afterEach((to, from) => {
  try {
    const store = getStore();

    // 这里可以添加路由切换后的额外处理逻辑
    // 例如：记录路由访问统计、更新面包屑等
    console.log('路由切换完成:', {
      from: from.fullPath,
      to: to.fullPath,
      stackSize: store.getters['routeStack/stackSize']
    });
  } catch (error) {
    console.warn('路由后置处理出错:', error);
  }
});

router.onError((error) => {
  const pattern = /Loading chunk (\d)+ failed/g;
  const isChunkLoadFailed = error.message.match(pattern);
  const targetPath = router.history.pending.fullPath;
  if (isChunkLoadFailed) {
    router.replace(targetPath);
  }
});

export default router;
