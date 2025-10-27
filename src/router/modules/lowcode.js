// 低代码相关路由
export default [
  // ==================== 低代码相关 ====================
  {
    path: "/lowcode/editor/:pageNo",
    name: "lowcode-editor",
    meta: {
      isEditor: true,
    },
    component: () => import(/* webpackChunkName: "lowcode" */ "@/pages/lowcode/index.vue"),
  },
  {
    path: "/edit/:pageNo",
    name: "lowcode-editor1",
    meta: {
      isEditor: true,
    },
    component: () => import(/* webpackChunkName: "lowcode" */ "@/pages/lowcode/index.vue"),
  },
    {
    path: "/:pageNo",
    name: "lowcode-view1",
    meta: {
      isEditor: false,
      isView: true,
    },
    component: () => import(/* webpackChunkName: "lowcode" */ "@/pages/lowcode/view.vue"),
  },
  {
    path: "/lowcode/view/:pageNo",
    name: "lowcode-view",
    meta: {
      isEditor: false,
      isView: true,
    },
    component: () => import(/* webpackChunkName: "lowcode" */ "@/pages/lowcode/view.vue"),
  },
  {
    path: "/site/:pageNo",
    name: "website",
    component: () => import(/* webpackChunkName: "lowcode" */ "@/pages/lowcode/view.vue"),
    meta: {
      isEditor: false,
      isView: true,
    }
  },
  {
    path: "/site/:pageNo/:anchorName",
    name: "websiteWithAnchor",
    component: () => import(/* webpackChunkName: "lowcode" */ "@/pages/lowcode/view.vue"),
    meta: {
      isEditor: false,
      isView: true,
    }
  },
  {
    path: "/card-cell-editor/:cardNo",
    name: "cardCellEditor",
    component: () => import(/* webpackChunkName: "lowcode" */ "@/pages/lowcode/card-cell-editor/card-cell-editor.vue"),
    meta: {
      isEditor: false,
      isView: true,
    }
  },
  {
    path: '/map-editor/:mapNo',
    name: 'MapEditor',
    component: () => import(/* webpackChunkName: "lowcode" */ '@/pages/lowcode/map-editor/index.vue'),
    meta: {
      title: '地图标记点编辑器',
    }
  },
  // ==================== 移动端编辑器 ====================
  {
    path: "/app/edit/:pageNo",
    name: "app-edit",
    component: () => import(/* webpackChunkName: "mobile-app" */ "@/pages/low-app/app-home.vue"),
  },
  {
    path: "/app/preview/:pageNo",
    name: "app-preview",
    component: () => import(/* webpackChunkName: "mobile-app" */ "@/pages/low-app/app-preview/preview-page.vue"),
  },

  {
    path: "/get-page-address",
    component: () => import(/* webpackChunkName: "lowcode" */ "@/pages/lowcode/get-page-address/get-page-address.vue"),
  },
];