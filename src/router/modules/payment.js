// 支付相关路由
export default [
  // ==================== 支付相关 ====================
  {
    path: "/payment",
    name: "payment",
    component: () => import(/* webpackChunkName: "payment" */ "@/components/common/payment/payIndex.vue"),
  },
  {
    path: "/prepaid-fee",
    name: "prepaid",
    component: () => import(/* webpackChunkName: "payment" */ "@/components/common/payment/prepaid-fees.vue"),
  },
  {
    path: "/pay-month",
    name: "payMonth",
    component: () => import(/* webpackChunkName: "payment" */ "@/components/common/payment/pay-month.vue"),
  },
];