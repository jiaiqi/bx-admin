// 权限管理相关路由
export default [
  // ==================== 权限管理 ====================
  {
    path: "/authority",
    name: "authority",
    component: () => import(/* webpackChunkName: "authority" */ "@/pages/authority.vue"),
  },
  {
    path: "/authority/:type/:role_no",
    name: "authority2",
    component: () => import(/* webpackChunkName: "authority" */ "@/pages/authority.vue"),
  },

  // ==================== 权限和系统管理 ====================
  {
    path: "/permission/:role_no",
    name: "permission",
    component: () => import(/* webpackChunkName: "common-crud" */ "@/components/common/permission"),
  },
  {
    path: "/upgrade",
    name: "upgrade",
    component: () => import(/* webpackChunkName: "common-crud" */ "@/components/common/upgrade"),
  },
];