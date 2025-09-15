// 地图相关路由
export default [
  // ==================== 百度地图 ====================
  {
    path: "/bmap",
    name: "bmap",
    component: () => import(/* webpackChunkName: "bmap" */ "@/pages/bmap/index.vue"),
    children: [
      {
        path: "check",
        component: () => import(/* webpackChunkName: "bmap" */ "@/pages/bmap/index.vue"),
      },
      {
        path: "editor/:no",
        component: () => import(/* webpackChunkName: "bmap" */ "@/pages/bmap/index.vue"),
      },
      {
        path: "view/:no",
        component: () => import(/* webpackChunkName: "bmap" */ "@/pages/bmap/index.vue"),
      },
    ],
  },
];