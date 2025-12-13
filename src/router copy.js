import Vue from 'vue'
import Router from 'vue-router'
// pages
// import SimpleAdd from '@/components/common/simple-add'
// // import viewpdf from '@/components/common/viewpdf'
// import Add from '@/components/common/add'
// import Update from '@/components/common/update'
// import SimpleFilter from '@/components/common/simple-filter'
// import SimpleUpdate from '@/components/common/simple-update'
// import list from '@/components/common/list'
// import TabList from '@/components/common/tab-list2'
// import listproc from '@/components/common/listproc'
// import listallproc from '@/components/common/listallproc'
// import detail from '@/components/common/detail'
// import detailPlus from '@/components/common/detail-plus'
// import treegrid from '@/components/common/treegrid'
// import procdetail from '@/components/common/procdetail'
// import procdetail_v2 from '@/components/common/procdetail_v2'
// import editgrid from '@/components/common/edit-grid'
// import encryptColumnCfgList from '@/pages/encrypt-column-cfg-list'
// import stat from '@/components/common/stat'
// import ConfStatChart from '@/pages/conf-stat-chart'
// import ShowStatChart from '@/pages/show-stat-chart'
// import treelevel from '@/components/common/treelevel'
// import CustomPage from '@/components/common/custom-page'
// import permission from '@/components/common/permission'
// import upgrade from '@/components/common/upgrade'
// import reportList from '@/components/common/report-list'
// import explain from '@/components/ui/rich-text-view'

// // vxhr pages
// import PersonalInfo from '@/vxhr/personal-info'
// import PersonalInfoUpdate from '@/vxhr/personal-info-update'
// import PersonalUpdate from '@/vxhr/personal-update'

// import test_field from '@/components/test/test_field'



import SimpleAdd from '@/components/common/simple-add'
const viewpdf = ()=>import("@/components/common/viewpdf")
import Add from '@/components/common/add'
import Update from '@/components/common/update'
import SimpleFilter from '@/components/common/simple-filter'
import SimpleUpdate from '@/components/common/simple-update'
import list from '@/components/common/list'
import TabList from '@/components/common/tab-list2'
import listproc from '@/components/common/listproc'
import listallproc from '@/components/common/listallproc'
import detail from '@/components/common/detail'
import detailPlus from '@/components/common/detail-plus'
import treegrid from '@/components/common/treegrid'
import procdetail from '@/components/common/procdetail'
import procdetail_v2 from '@/components/common/procdetail_v2'
import editgrid from '@/components/common/edit-grid'
import encryptColumnCfgList from '@/pages/encrypt-column-cfg-list'
import stat from '@/components/common/stat'
import ConfStatChart from '@/pages/conf-stat-chart'
import ShowStatChart from '@/pages/show-stat-chart'
import treelevel from '@/components/common/treelevel'
import CustomPage from '@/components/common/custom-page'
import permission from '@/components/common/permission'
import upgrade from '@/components/common/upgrade'
import reportList from '@/components/common/report-list'
import explain from '@/components/ui/rich-text-view'

import wxmsg from '@/components/develop/wxmsg'



// vxhr pages
import PersonalInfo from '@/vxhr/personal-info'
import PersonalInfoUpdate from '@/vxhr/personal-info-update'
import PersonalUpdate from '@/vxhr/personal-update'

import test_field from '@/components/test/test_field'

import Index from '@/pages/index'

import templateConfig from '@/pages/template/config'
import erConfig from '@/pages/template/er-config'
import printPage from '@/pages/template/print-page'

import inlineEditList from '@/components/common/inline-edit-list.vue'
import waybill from '@/pages/waybill.vue'

import inForm from '@/pages/inform.vue'


// pages
Vue.use(Router);
let routes=[
  {
    path: '/register',
    name:'register',
    component: ()=>import('@/pages/common/register/register.vue')
  },
  {
    path: '/simple-add/:service_name',
    name: 'simple-add',
    component: SimpleAdd
  },
  {
    path: '/permission/:role_no',
    name: 'permission',
    component: permission
  },
  {
    path: '/upgrade',
    name: 'upgrade',
    component: upgrade
  },
  {
    path: '/add/:service_name',
    name: 'add',
    component: Add
  },
  {
    path: '/update/:service_name/:id',
    name: 'update',
    component: Update
  },
  {
    path: '/simple-filter/:service_name',
    name: 'simple-filter',
    component: SimpleFilter
  },
  {
    path: '/simple-update/:service_name/:id',
    name: 'simple-update',
    component: SimpleUpdate
  },
  {
    path: '/list/:service_name',
    name: 'list',
    component: TabList,
    meta:{
      compName:'list'
    }
  },
  {
    path: '/list/:service_name/:card_no',
    name: 'cardlist',
    component: list,
    meta:{
      compName:'list'
    }
  },
  {
    path: '/reportList',
    name: 'reportList',
    component: reportList,
    meta:{
      compName:'reportList'
    }
  },
  {
    path: '/explain',
    name: 'explain',
    component: explain,
    meta:{
      compName:'explain'
    }
  },
  {
    path: '/stat/:service_name',
    name: 'stat',
    component: stat
  },
  {
    path: '/listallproc/:service_name',
    name: 'listallproc',
    component: listallproc
  },
  {
    path: '/v2/listallproc/:service_name',
    name: 'listallproc_v2',
    component: listallproc
  },

  {
    path: '/listproc/:service_name',
    name: 'listproc',
    component: listproc
  },
  {
    path: '/v2/listproc/:service_name',
    name: 'listproc_v2',
    component: listproc
  },
  {
    path: '/detail/:service_name/:id',
    name: 'detail',
    component: detail
  },
  {
    path: '/detail/:service_name/:condcol/:condvalue',
    name: 'detail1',
    component: detail
  },
  {
    path: '/detailPlus/:service_name/:id',
    name: 'detailPlus',
    component: detailPlus
  },
  {
    path: '/cardDetail/:service_name/:id',
    name: 'cardDetail',
    component: detail
  },
  {
    path: '/cardDetail/:service_name/:condcol/:condvalue',
    name: 'cardDetail1',
    component: detail
  },
  {
    path: '/test_field',
    name: 'test_field',
    component: test_field
  },
  {
    path: '/treegrid/:service_name',
    name: 'treegrid',
    component: TabList
  },
  {
    path: '/startproc/:service_name',
    name: 'startproc',
    component: procdetail
  },
  {
    path: '/v2/startproc/:service_name',
    name: 'startproc_v2',
    component: procdetail_v2
  },
  {
    path: '/v2/procdetail/:proc_instance_no',
    name: 'procdetail_v2',
    component: procdetail_v2
  },
  {
    path: '/procdetail/:proc_instance_no',
    name: 'procdetail',
    component: procdetail
  },
  {
    path: '/encrypt-column-cfg-list',
    name: 'encryptColumnCfgList',
    component: encryptColumnCfgList
  },
  {
    path: '/editgrid/:service_name',
    name: 'editgrid',
    component: editgrid
  },
  {
    path: '/conf-stat-chart/:chartid',
    name: 'confstatchart',
    component: ConfStatChart,
  },

  {
    path: '/show-stat-chart/:chartid',
    name: 'showstatchart',
    component: ShowStatChart,
  },
  {
    path: '/viewpdf',
    name: 'viewpdf',
    component: resolve => require(['@/components/common/view-pdf'],resolve) ,
  }, // 预览可以预览发票信息，万象使用
  // {
  //   path: '/viewpdf',
  //   name: 'viewpdf',
  //   component: resolve => require(['@/components/common/viewpdf'],resolve) ,
  // },  // 预览带有标题但发票内容部分无法解码

  {
    path: '/treelevel/:service_name',
    name: 'treelevel',
    component: treelevel,
  },
  {
    path: '/custom-page/:page_no',
    name: 'custompage',
    component: CustomPage,
  },
  // {
  //   path: '/excelEditView',
  //   name: 'excelEditView',
  //   component: excelEditView,
  // },
  {
    path: '/vxhr/personal-info',
    name: 'personalInfo',
    component: PersonalInfo,
  },
  {
    path: '/vxhr/personal-info-update',
    name: 'personalInfoUpdate',
    component: PersonalInfoUpdate,
  },
  {
    path: '/vxhr/personal-update',
    name: 'personalUpdate',
    component: PersonalUpdate,
  },
  {
    path: '/wxmsg',
    name: 'wxmsg',
    component: wxmsg,
    meta:{
      compName:'wxmsg'
    }
  },
  { // 摄像头视频播放页
    path:'/video',
    name:'video',
    component:()=>import('@/pages/video/index.vue')
  },
  { // 运单打印
    path:'/waybill/:type',
    name:'waybill',
    component: waybill
  }
    ,
    {
        path: "/audit",
        component: () => import('@/pages/audit/index.vue'),

        children: [
            {
                // 嫌疑车辆流水详情
                path: 'flow-detail/:passid',
                component: () => import('@/pages/audit/flow-detail.vue')
            },
            {
                // 嫌疑车辆流水详情
                path: 'flow-detail/:passid/:entime/:extime',
                component: () => import('@/pages/audit/flow-detail.vue')
            }
        ]
    }
];

routes.push( {
  path: '/',
  name: 'index',
  component: Index,
  meta:{
    compName:'wxmsg'
  },
  children:[



  {
    path: '/template-config',
    name: 'template-config',
    component: templateConfig
  },
  {
    path: '/er-config',
    name: 'er-config',
    component: erConfig
  },
  {
    path: '/print-page',
    component: printPage
  },
  {
    path: '/inline-edit-list/:serviceName',
    component: inlineEditList
  },
  {
    path: '/inform',
    component: inForm
  },
  {
    path:'/platform',
    component:()=>import('@/pages/platform/index.vue')
  },
  // 西乡劳动项目
  {
    path:'/booking',
    component:()=>import('@/pages/xx/booking.vue')
  },
  {//西乡 课表
    path:'/timetable',
    component:()=>import('@/pages/xx/timetable.vue')
  },
  {//西乡 评价列表
    path:'/evaluate',
    component:()=>import('@/pages/xx/evaluateList.vue')
  }, {//西乡 评价列表
    path:'/evaluate/:class_record_no',
    component:()=>import('@/pages/xx/evaluateList.vue')
  }, {//西乡 荣誉墙
    path:'/qrcodeprint',
    component:()=>import('@/pages/xx/qrcodePrint.vue')
  }
  // storeMonitor
  //大屏拖拽页面
, {
    path:'/grid-editor',
    component:()=>import('@/pages/datav/grid-layout/index.vue')
  },
  {
    // 网格布局 - 新
    path:'/lowcode-grid',
    component:()=>import('@/pages/datav/grid-layout/editor-next.vue'),
    children:[
      {
        //可视化编辑页面 新布局
        path:'editor',
        name:"gridEditorAdd",
        component:()=>import('@/pages/datav/grid-layout/editor-next.vue')
      },
      {
        //可视化编辑页面(update) 新布局
        path:'editor/:no',
        name:"gridEditorUpdate",
        component:()=>import('@/pages/datav/grid-layout/editor-next.vue')
      },
      {
        //可视化编辑页面(update) 新布局
        path:'view/:no',
        name:'gridViewDetail',
        component:()=>import('@/pages/datav/grid-layout/editor-next.vue')
      }
    ]
  },
  // 网格布局
  {
    path:'/gridview',
    component:()=>import('@/pages/datav/grid-layout/index.vue'),
    children:[
      {
        //可视化编辑页面
        path:'editor',
        name:'gridEditor',
        component:()=>import('@/pages/datav/grid-layout/index.vue')
      },
      {
        //可视化编辑页面(update)
        path:'editor/:no',
        name:'gridEditor2',
        component:()=>import('@/pages/datav/grid-layout/index.vue')
      },
      {
        // 预览页面
        path:'view/:no',
        name:'gridview',
        component:()=>import('@/pages/datav/grid-layout/index.vue')
      }
    ]
  },
  // 图层布局
  {
    path: '/layer',
    name: 'layerview',
    component: () => import('@/pages/datav/layer-layout/index.vue'),
    //子路由
    children:[
      {
        path:'editor/:no',
        //也不使用懒加载，先在文件头部提前引入
        component:()=> import('@/pages/datav/layer-layout/index.vue')
      },
      {
        path:'editor',
        //也不使用懒加载，先在文件头部提前引入
        component:()=> import('@/pages/datav/layer-layout/index.vue')
      },
      {
        path:'view/:no',
        //@是定位 src 文件夹
        component:()=> import('@/pages/datav/layer-layout/index.vue')
      },
    ]
  },
  // 学生档案  西乡特有页面
  {
    path:'/studentfiles/:serviceName/:id',
    name:'studentfiles',
    component:()=>import(/* webpackChunkName: "echarts-vendor" */ '@/pages/studentfiles/studentfiles.vue')
  },
  // 学生档案  西乡特有页面
  {
    path:'/pdfReview/:serviceName/:id',
    name:'pdfReview',
    component:()=>import('@/pages/studentfiles/pdfReview.vue')
  },
  // 思维导图demo
  {
    path: '/mind',
    name: 'mind',
    component: () => import('@/pages/mind/index.vue'),
    //子路由
    children:[
      {
        path:'editor',
        //新增
        component:()=> import('@/pages/mind/index.vue')
      },
      {
        path:'editor/:no',
        //修改
        component:()=> import('@/pages/mind/index.vue')
      },
      {
        path:'editor/:mindbizNo/:rootNo',
        // 脑图业务中直接打开
        component:()=> import('@/pages/mind/index.vue')
      },,
      {
        path:'bizEditor/:mindbizNo/:rootNo',
        // 脑图业务中直接打开
        component:()=> import('@/pages/mind/index.vue')
      },


      {
        path:'view/:no',
        //只读
        component:()=> import('@/pages/mind/index.vue')
      },
    ]
  },
  // JS API 百度地图，依赖 index.html 百度库
  {
    path: '/bmap',
    name: 'bmap',
    component: () => import('@/pages/bmap/index.vue'),
    //子路由
    //子路由
    children:[
      {
        path:'check',
        //新增
        component:()=> import('@/pages/bmap/index.vue')
      },
      {
        path:'editor/:no',
        //修改
        component:()=> import('@/pages/bmap/index.vue')
      },
      {
        path:'view/:no',
        //只读
        component:()=> import('@/pages/bmap/index.vue')
      },
    ]
  }
]

});
export default new Router({
  routes
})




