/**
 * 侧边栏相关的组合式函数
 * 负责处理侧边栏的折叠/展开状态管理
 */
import { ref, computed } from 'vue'

export function useSidebar() {
  // 侧边栏状态
  const isCollapsed = ref(false)

  // 配置常量
  const CONFIG = {
    UI: {
      SIDEBAR_WIDTH: 230,
      SIDEBAR_MARGIN: 15,
    }
  }

  /**
   * 计算左侧面板位置
   */
  const left = computed(() =>
    isCollapsed.value ? -CONFIG.UI.SIDEBAR_WIDTH : CONFIG.UI.SIDEBAR_MARGIN
  )

  /**
   * 切换侧边栏折叠状态
   */
  function toggleCollapsed() {
    isCollapsed.value = !isCollapsed.value
  }

  return {
    // 状态
    isCollapsed,
    left,
    
    // 方法
    toggleCollapsed
  }
}