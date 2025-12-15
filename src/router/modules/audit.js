// 稽核相关路由
export default [
  // ==================== 稽核相关 ====================
  {
    path: "/audit",
    component: () => import(/* webpackChunkName: "audit" */ "@/pages/audit/index.vue"),
    children: [
      {
        path: "flow-detail/:passid",
        component: () => import(/* webpackChunkName: "audit" */ "@/pages/audit/flow-detail.vue"),
      },
      {
        path: "flow-detail/:passid/:entime/:extime",
        component: () => import(/* webpackChunkName: "audit" */ "@/pages/audit/flow-detail.vue"),
      },
    ],
  },

  // ==================== 工单管理 ====================
  {
    path: "/order",
    component: () => import(/* webpackChunkName: "order" */ "@/pages/audit/workdistribution/order-home.vue"),
    children: [
      {
        path: "orderform",
        name: "orderform",
        component: () => import(/* webpackChunkName: "order" */ "@/pages/audit/workdistribution/workFlow/order-form.vue"),
      },
      {
        path: "entrance",
        name: "entrance",
        component: () => import(/* webpackChunkName: "order" */ "@/pages/audit/workdistribution/entrance/entrance-information.vue"),
      },
      {
        path: "basemap",
        name: "basemap",
        component: () => import(/* webpackChunkName: "order" */ "@/pages/audit/workdistribution/map/BaseMap.vue"),
      },
    ],
  },
  {
    path: "/quick",
    name: "quick",
    component: () => import(/* webpackChunkName: "order" */ "@/pages/audit/workdistribution/quickBilling/quick-billing.vue"),
  },
];