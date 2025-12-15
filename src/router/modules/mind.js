// 思维导图相关路由
export default [
  // ==================== 思维导图 ====================
  {
    path: "/mind",
    name: "mind",
    component: () => import(/* webpackChunkName: "mind" */ "@/pages/mind/index.vue"),
    children: [
      {
        path: "editor",
        component: () => import(/* webpackChunkName: "mind" */ "@/pages/mind/index.vue"),
      },
      {
        path: "editor/:no",
        component: () => import(/* webpackChunkName: "mind" */ "@/pages/mind/index.vue"),
      },
      {
        path: "editor/:mindbizNo/:rootNo",
        component: () => import(/* webpackChunkName: "mind" */ "@/pages/mind/index.vue"),
      },
      {
        path: "bizEditor/:mindbizNo/:rootNo",
        component: () => import(/* webpackChunkName: "mind" */ "@/pages/mind/index.vue"),
      },
      {
        path: "view/:no",
        component: () => import(/* webpackChunkName: "mind" */ "@/pages/mind/index.vue"),
      },
    ],
  },
];