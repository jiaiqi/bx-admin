// 业务页面相关路由
export default [
  // ==================== 流程和工作站 ====================
  {
    path: "/flow-station",
    name: "FlowStation",
    component: () => import(/* webpackChunkName: "flow" */ "@/pages/flowStation/flow-station.vue"),
  },

  // ==================== 仪表板 ====================
  {
    path: "/dashboard",
    name: "dashboard",
    component: () => import(/* webpackChunkName: "dashboard" */ "@/pages/dashboard/index.vue"),
  },

  // ==================== 人大相关页面 ====================
  {
    path: "/home",
    name: "renda-home",
    component: () => import(/* webpackChunkName: "renda" */ "@/pages/renda/home.vue"),
  },
  {
    path: "/report",
    name: "renda-report",
    component: () => import(/* webpackChunkName: "renda" */ "@/pages/renda/report.vue"),
  },

  // ==================== 专家详情 ====================
  {
    path: "/expert-detail/:id",
    name: "ExpertDetail",
    component: () => import(/* webpackChunkName: "expert" */ "@/pages/expert/detail.vue"),
  },

  // ==================== 登录页面 ====================
  {
    path: "/login",
    name: "Login",
    component: () => import(/* webpackChunkName: "login" */ "@/pages/login/login.vue"),
  },
];