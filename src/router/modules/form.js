// 表单相关路由
export default [
  // ==================== 注册和表单 ====================
  {
    path: "/register",
    name: "register",
    component: () => import(/* webpackChunkName: "register" */ "@/pages/common/register/register.vue"),
  },
  {
    path: "/step/:step_no",
    name: "stepForm",
    component: () => import(/* webpackChunkName: "form" */ "@/components/common/step/form.vue"),
  },
  {
    path: "/frameForm",
    name: "frameForm",
    component: () => import(/* webpackChunkName: "form" */ "@/pages/common/inner/form.vue"),
  },
];