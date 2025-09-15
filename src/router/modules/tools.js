// 工具类相关路由
export default [
  // ==================== PDF预览 ====================
  {
    path: "/viewpdf",
    name: "viewpdf",
    component: () => import(/* webpackChunkName: "pdf" */ "@/components/common/view-pdf")
  },

  // ==================== 图片预览 ====================
  {
    path: "/preview/img",
    name: "imagePreview",
    component: () => import(/* webpackChunkName: "preview" */ "@/pages/common/preview/img.vue"),
  },

  // ==================== 加密和安全 ====================
  {
    path: "/encrypt-column-cfg-list",
    name: "encryptColumnCfgList",
    component: () => import(/* webpackChunkName: "encrypt" */ "@/pages/encrypt-column-cfg-list"),
  },

  // ==================== 测试功能 ====================
  {
    path: "/test_field",
    name: "test_field",
    component: () => import(/* webpackChunkName: "test" */ "@/components/test/test_field"),
  },

  // ==================== 运单打印 ====================
  {
    path: "/waybill/:type",
    name: "waybill",
    component: () => import(/* webpackChunkName: "waybill" */ "@/pages/waybill.vue"),
  },
];