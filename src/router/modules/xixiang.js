// 西乡项目相关路由
export default [
  // ==================== 西乡劳动项目 ====================
  {
    path: "/booking",
    component: () => import(/* webpackChunkName: "xixiang" */ "@/pages/xx/booking.vue"),
  },
  {
    path: "/timetable",
    component: () => import(/* webpackChunkName: "xixiang" */ "@/pages/xx/timetable.vue"),
  },
  {
    path: "/evaluate",
    component: () => import(/* webpackChunkName: "xixiang" */ "@/pages/xx/evaluateList.vue"),
  },
  {
    path: "/evaluate/:class_record_no",
    component: () => import(/* webpackChunkName: "xixiang" */ "@/pages/xx/evaluateList.vue"),
  },
  {
    path: "/qrcodeprint",
    component: () => import(/* webpackChunkName: "xixiang" */ "@/pages/xx/qrcodePrint.vue"),
  },

  // ==================== 学生档案 ====================
  {
    path: "/studentfiles/:serviceName/:id",
    name: "studentfiles",
    component: () => import(/* webpackChunkName: "student" */ "@/pages/studentfiles/studentfiles.vue"),
  },
  {
    path: "/pdfReview/:serviceName/:id",
    name: "pdfReview",
    component: () => import(/* webpackChunkName: "student" */ "@/pages/studentfiles/pdfReview.vue"),
  },
];