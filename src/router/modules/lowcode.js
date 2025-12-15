// 低代码相关路由
import { getEnv } from '@/common/http'
const oldLowCodePages = [{
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
  }]

const lowCodePages = [
  // ==================== 低代码相关 ====================
  // 最新低代码页面
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

let env = getEnv()

if(env === 'yanxue2'){
  // 研学用到老版低代码页面
  lowCodePages.push(...oldLowCodePages)
}

export default [...lowCodePages]