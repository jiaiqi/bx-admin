export const lowCodeRoutes = [
  {
    path: "/lowcode/editor/:pageNo",
    name: "lowcode-editor",
    meta: {
      isEditor: true,
    },
    component: () => import(/* webpackChunkName: "lowcode" */ "@/pages/lowcode/index.vue"),
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
    component: () =>
      import(/* webpackChunkName: "lowcode" */ "@/pages/lowcode/view.vue"),
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
    component: () => import(/* webpackChunkName: "lowcode" */'@/pages/lowcode/map-editor/index.vue'),
    meta: {
      title: '地图标记点编辑器',
    }
  },
  {
    path: '/get-page-address',
    name: 'GetPageAddress',
    component: () => import(/* webpackChunkName: "lowcode" */ '@/pages/lowcode/get-page-address/get-page-address.vue'),
    meta: {
      title: '页面地址获取工具',
    }
  }
]