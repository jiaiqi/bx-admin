/**
 * 地图编辑器路由配置示例
 * 
 * 使用方法：
 * 1. 将以下路由配置添加到你的路由文件中
 * 2. 根据项目结构调整 component 路径
 * 3. 根据需要修改 meta 信息
 */

export const mapEditorRoute = {
  path: '/map-editor/:mapNo',
  name: 'MapEditor',
  component: () => import('@/pages/map-editor/index.vue'),
  meta: {
    title: '地图标记点编辑器',
    icon: 'el-icon-edit-outline',
    // 如果需要权限控制，可以添加以下配置
    // requireAuth: true,
    // roles: ['admin', 'editor']
  }
}

// 如果使用 Vue Router 3.x，可以这样添加路由：
/*
import router from '@/router'

router.addRoute(mapEditorRoute)
*/

// 或者在路由配置文件中直接添加：
/*
const routes = [
  // ... 其他路由
  mapEditorRoute
]
*/