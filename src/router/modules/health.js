// 健康管理相关路由
export default [
  // ==================== 专家和健康相关 ====================
  {
    path: "/expert-register",
    name: "expert-register",
    component: () => import(/* webpackChunkName: "health" */ "@/pages/health/register.vue"),
  },
  {
    path: "/health-test",
    name: "health-test",
    component: () => import(/* webpackChunkName: "health" */ "@/pages/health/index.vue"),
  },

  // ==================== 健康管理 ====================
  {
    path: "/comment-open-edit",
    name: "treeEdit",
    component: () => import(/* webpackChunkName: "health" */ "@/pages/health/treeEdit.vue"),
  },
];