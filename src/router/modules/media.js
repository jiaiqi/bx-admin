// 媒体相关路由
export default [
  // ==================== 视频和媒体 ====================
  {
    path: "/video",
    name: "video",
    component: () => import(/* webpackChunkName: "video" */ "@/pages/video/index.vue"),
  },

  // ==================== 聊天和通讯 ====================
  {
    path: "/chat",
    name: "chat",
    component: () => import(/* webpackChunkName: "chat" */ "@/pages/chat/index"),
    meta: {
      title: "延安研学智能客服",
      compName: "chat",
    },
  },
  {
    path: "/wxmsg",
    name: "wxmsg",
    component: () => import(/* webpackChunkName: "wxmsg" */ "@/components/develop/wxmsg"),
    meta: {
      compName: "wxmsg",
    },
  },
];