import Vue from "vue";
import VueRouter from "vue-router";
import TabList from "@/components/common/tab-list2";
import { lowCodeRoutes } from "@/pages/lowcode/routes.js";
import { BookingPages } from "@/pages/meetingRoomBooking/bookingRoutes.js";

// ==================== 通用组件懒加载 ====================
const SimpleAdd = () =>
  import(/* webpackChunkName: "common-crud" */ "@/components/common/simple-add");
const Add = () =>
  import(/* webpackChunkName: "common-crud" */ "@/components/common/add");
const Update = () =>
  import(/* webpackChunkName: "common-crud" */ "@/components/common/update");
const SimpleFilter = () =>
  import(/* webpackChunkName: "common-crud" */ "@/components/common/simple-filter");
const SimpleUpdate = () =>
  import(/* webpackChunkName: "common-crud" */ "@/components/common/simple-update");
const list = () =>
  import(/* webpackChunkName: "common-crud" */ "@/components/common/list");
const detail = () =>
  import(/* webpackChunkName: "common-crud" */ "@/components/common/detail");
const detailPlus = () =>
  import(/* webpackChunkName: "common-crud" */ "@/components/common/detail-plus");
const editgrid = () =>
  import(/* webpackChunkName: "common-crud" */ "@/components/common/edit-grid");
const stat = () =>
  import(/* webpackChunkName: "common-crud" */ "@/components/common/stat");
const treelevel = () =>
  import(/* webpackChunkName: "common-crud" */ "@/components/common/treelevel");
const CustomPage = () =>
  import(/* webpackChunkName: "common-crud" */ "@/components/common/custom-page");
const permission = () =>
  import(/* webpackChunkName: "common-crud" */ "@/components/common/permission");
const upgrade = () =>
  import(/* webpackChunkName: "common-crud" */ "@/components/common/upgrade");
const reportList = () =>
  import(/* webpackChunkName: "common-crud" */ "@/components/common/report-list");
const inlineEditList = () =>
  import(/* webpackChunkName: "common-crud" */ "@/components/common/inline-edit-list.vue");

// ==================== 流程相关组件 ====================
const listproc = () =>
  import(/* webpackChunkName: "flow" */ "@/components/common/listproc");
const listallproc = () =>
  import(/* webpackChunkName: "flow" */ "@/components/common/listallproc");
const procdetail = () =>
  import(/* webpackChunkName: "flow" */ "@/components/common/procdetail");
const procdetail_v2 = () =>
  import(/* webpackChunkName: "flow" */ "@/components/common/procdetail_v2");

// ==================== 页面组件懒加载 ====================
const Index = () =>
  import(/* webpackChunkName: "home" */ "@/pages/index");
const ChatPage = () =>
  import(/* webpackChunkName: "chat" */ "@/pages/chat/index");
const waybill = () =>
  import(/* webpackChunkName: "waybill" */ "@/pages/waybill.vue");
const inForm = () =>
  import(/* webpackChunkName: "inform" */ "@/pages/inform.vue");
const encryptColumnCfgList = () =>
  import(/* webpackChunkName: "encrypt" */ "@/pages/encrypt-column-cfg-list");
const test_field = () =>
  import(/* webpackChunkName: "test" */ "@/components/test/test_field");

// ==================== 模板相关组件 ====================
const templateConfig = () =>
  import(/* webpackChunkName: "template" */ "@/pages/template/config");
const erConfig = () =>
  import(/* webpackChunkName: "template" */ "@/pages/template/er-config");
const printPage = () =>
  import(/* webpackChunkName: "template" */ "@/pages/template/print-page");

// ==================== 统计图表组件 ====================
const ConfStatChart = () =>
  import(/* webpackChunkName: "chart" */ "@/pages/conf-stat-chart");
const ShowStatChart = () =>
  import(/* webpackChunkName: "chart" */ "@/pages/show-stat-chart");

// ==================== UI组件 ====================
const explain = () =>
  import(/* webpackChunkName: "ui" */ "@/components/ui/rich-text-view");
const wxmsg = () =>
  import(/* webpackChunkName: "wxmsg" */ "@/components/develop/wxmsg");

// ==================== VXHR个人信息页面 ====================
const PersonalInfo = () =>
  import(/* webpackChunkName: "vxhr" */ "@/vxhr/personal-info");
const PersonalInfoUpdate = () =>
  import(/* webpackChunkName: "vxhr" */ "@/vxhr/personal-info-update");
const PersonalUpdate = () =>
  import(/* webpackChunkName: "vxhr" */ "@/vxhr/personal-update");


// ==================== 路由配置 ====================
let routes = [
  // ==================== 流程和工作站 ====================
  {
    path: "/flow-station",
    name: "FlowStation",
    component: () => import(/* webpackChunkName: "flow" */ "@/pages/flowStation/flow-station.vue"),
  },

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

  // ==================== 专家和健康相关 ====================
  {
    path: "/expert-register",
    name: "expert-register",
    component: () => import(/* webpackChunkName: "health" */ "@/pages/health/register.vue"),
  },
  
  // ==================== 仪表板 ====================
  {
    path: "/dashboard",
    name: "dashboard",
    component: () => import(/* webpackChunkName: "dashboard" */ "@/pages/dashboard/index.vue"),
  },

  // ==================== 通用CRUD操作 ====================
  {
    path: "/simple-add/:service_name",
    name: "simple-add",
    component: SimpleAdd,
  },
  {
    path: "/add/:service_name",
    name: "add",
    component: Add,
  },
  {
    path: "/update/:service_name/:id",
    name: "update",
    component: Update,
  },
  {
    path: "/simple-update/:service_name/:id",
    name: "simple-update",
    component: SimpleUpdate,
  },
  {
    path: "/simple-filter/:service_name",
    name: "simple-filter",
    component: SimpleFilter,
  },
  {
    path: "/list/:service_name",
    name: "list",
    component: TabList,
    meta: {
      compName: "list",
    },
  },
  {
    path: "/list/tree/:service_name",
    name: "treeList",
    component: TabList,
    meta: {
      isTree: true,
    },
  },
  {
    path: "/list/:service_name/:card_no",
    name: "cardlist",
    component: list,
    meta: {
      compName: "list",
    },
  },

  // ==================== 权限和系统管理 ====================
  {
    path: "/permission/:role_no",
    name: "permission",
    component: permission,
  },
  {
    path: "/upgrade",
    name: "upgrade",
    component: upgrade,
  },
  // ==================== 详情和查看页面 ====================
  {
    path: "/detail/:service_name/:id",
    name: "detail",
    component: detail,
  },
  {
    path: "/detail/:service_name/:condcol/:condvalue",
    name: "detail1",
    component: detail,
  },
  {
    path: "/detailPlus/:service_name/:id",
    name: "detailPlus",
    component: detailPlus,
  },
  {
    path: "/cardDetail/:service_name/:id",
    name: "cardDetail",
    component: detail,
  },
  {
    path: "/cardDetail/:service_name/:condcol/:condvalue",
    name: "cardDetail1",
    component: detail,
  },

  // ==================== 流程相关路由 ====================
  {
    path: "/listproc/:service_name",
    name: "listproc",
    component: listproc,
  },
  {
    path: "/v2/listproc/:service_name",
    name: "listproc_v2",
    component: listproc,
  },
  {
    path: "/listallproc/:service_name",
    name: "listallproc",
    component: listallproc,
  },
  {
    path: "/v2/listallproc/:service_name",
    name: "listallproc_v2",
    component: listallproc,
  },
  {
    path: "/startproc/:service_name",
    name: "startproc",
    component: procdetail,
  },
  {
    path: "/v2/startproc/:service_name",
    name: "startproc_v2",
    component: procdetail_v2,
  },
  {
    path: "/procdetail/:proc_instance_no",
    name: "procdetail",
    component: procdetail,
  },
  {
    path: "/v2/procdetail/:proc_instance_no",
    name: "procdetail_v2",
    component: procdetail_v2,
  },

  // ==================== 统计和图表 ====================
  {
    path: "/stat/:service_name",
    name: "stat",
    component: stat,
  },
  {
    path: "/conf-stat-chart/:chartid",
    name: "confstatchart",
    component: ConfStatChart,
  },
  {
    path: "/show-stat-chart/:chartid",
    name: "showstatchart",
    component: ShowStatChart,
  },

  // ==================== 工具和辅助功能 ====================
  {
    path: "/treegrid/:service_name",
    name: "treegrid",
    component: TabList,
  },
  {
    path: "/treelevel/:service_name",
    name: "treelevel",
    component: treelevel,
  },
  {
    path: "/editgrid/:service_name",
    name: "editgrid",
    component: editgrid,
  },
  {
    path: "/custom-page/:page_no",
    name: "custompage",
    component: CustomPage,
  },
  {
    path: "/reportList",
    name: "reportList",
    component: reportList,
    meta: {
      compName: "reportList",
    },
  },
  {
    path: "/explain",
    name: "explain",
    component: explain,
    meta: {
      compName: "explain",
    },
  },

  // ==================== PDF预览 ====================
  {
    path: "/viewpdf",
    name: "viewpdf",
    component: () => import(/* webpackChunkName: "pdf" */ "@/components/common/view-pdf")
    // component: resolve => require(['@/components/common/view-pdf'],resolve),
  },

  // ==================== 聊天和通讯 ====================
  {
    path: "/chat",
    name: "chat",
    component: ChatPage,
    meta: {
      title: "延安研学智能客服",
      compName: "chat",
    },
  },
  {
    path: "/wxmsg",
    name: "wxmsg",
    component: wxmsg,
    meta: {
      compName: "wxmsg",
    },
  },

  // ==================== 个人信息管理 ====================
  {
    path: "/vxhr/personal-info",
    name: "personalInfo",
    component: PersonalInfo,
  },
  {
    path: "/vxhr/personal-info-update",
    name: "personalInfoUpdate",
    component: PersonalInfoUpdate,
  },
  {
    path: "/vxhr/personal-update",
    name: "personalUpdate",
    component: PersonalUpdate,
  },

  // ==================== 视频和媒体 ====================
  {
    path: "/video",
    name: "video",
    component: () => import(/* webpackChunkName: "video" */ "@/pages/video/index.vue"),
  },

  // ==================== 加密和安全 ====================
  {
    path: "/encrypt-column-cfg-list",
    name: "encryptColumnCfgList",
    component: encryptColumnCfgList,
  },

  // ==================== 测试功能 ====================
  {
    path: "/test_field",
    name: "test_field",
    component: test_field,
  },
  // ==================== 运单打印 ====================
  {
    path: "/waybill/:type",
    name: "waybill",
    component: waybill,
  },

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

  // ==================== 视频监控 ====================
  {
    path: "/dhvideo",
    name: "dhvideo",
    component: () => import(/* webpackChunkName: "video" */ "@/pages/dahua-video/video-home.vue"),
  },

  // ==================== 移动端应用 ====================
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

  // ==================== 权限管理 ====================
  {
    path: "/authority",
    name: "authority",
    component: () => import(/* webpackChunkName: "authority" */ "@/pages/authority.vue"),
  },
  {
    path: "/authority/:type/:role_no",
    name: "authority2",
    component: () => import(/* webpackChunkName: "authority" */ "@/pages/authority.vue"),
  },

  // ==================== 健康管理 ====================
  {
    path: "/comment-open-edit",
    name: "treeEdit",
    component: () => import(/* webpackChunkName: "health" */ "@/pages/health/treeEdit.vue"),
  },

  // ==================== 图片预览 ====================
  {
    path: "/preview/img",
    name: "imagePreview",
    component: () => import(/* webpackChunkName: "preview" */ "@/pages/common/preview/img.vue"),
  }
];

// ==================== 主路由配置 ====================
routes.push({
  path: "/",
  name: "index",
  component: Index,
  meta: {
    compName: "wxmsg",
  },
  children: [
    // ==================== 模板配置 ====================
    {
      path: "/template-config",
      name: "template-config",
      component: templateConfig,
    },
    {
      path: "/er-config",
      name: "er-config",
      component: erConfig,
    },
    {
      path: "/print-page",
      component: printPage,
    },

    // ==================== 通用功能 ====================
    {
      path: "/inline-edit-list/:serviceName",
      component: inlineEditList,
    },
    {
      path: "/inform",
      component: inForm,
    },
    {
      path: "/platform",
      component: () => import(/* webpackChunkName: "platform" */ "@/pages/platform/index.vue"),
    },

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
  ],
});

// ==================== 人大相关页面 ====================
routes.push(
  {
    path: "/home",
    name: "renda-home",
    component: () => import(/* webpackChunkName: "renda" */ "@/pages/renda/home.vue"),
  },
  {
    path: "/report",
    name: "renda-report",
    component: () => import(/* webpackChunkName: "renda" */ "@/pages/renda/report.vue"),
  }
);

// ==================== 专家详情 ====================
routes.push({
  path: "/expert-detail/:id",
  name: "ExpertDetail",
  component: () => import(/* webpackChunkName: "expert" */ "@/pages/expert/detail.vue"),
});

// ==================== 登录页面 ====================
routes.push({
  path: "/login",
  name: "Login",
  component: () => import(/* webpackChunkName: "login" */ "@/pages/login/login.vue"),
});

// ==================== 外部模块路由 ====================
// 园区预约页面
routes.push(...BookingPages);

// 低代码相关路由
routes.push(...lowCodeRoutes);

Vue.use(VueRouter);
const router = new VueRouter({
  routes,
});

router.onError((error) => {
  const pattern = /Loading chunk (\d)+ failed/g;
  const isChunkLoadFailed = error.message.match(pattern);
  const targetPath = router.history.pending.fullPath;
  if (isChunkLoadFailed) {
    router.replace(targetPath);
  }
});

export default router;
