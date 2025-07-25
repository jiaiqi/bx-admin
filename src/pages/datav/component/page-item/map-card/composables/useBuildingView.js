/**
 * 建筑物视图相关的组合式函数
 * 负责处理建筑物视图的切换、状态管理等逻辑
 */
import { ref } from 'vue'

export function useBuildingView(mapJson, getBuildingTree) {
  // 建筑物视图相关状态
  const isBuildingView = ref(false)
  const buildingInfo = ref({})

  /**
   * 切换到建筑物视图
   */
  function switchToBuildingView(marker, buildingTree, floorInfo) {
    isBuildingView.value = true
    buildingInfo.value = marker
    buildingTree.value = getBuildingTree(marker)
    
    // 默认选中第一个楼层
    if (buildingTree.value?.length) {
      floorInfo.value = buildingTree.value[0]
    }
  }

  /**
   * 检查是否应该切换到建筑物视图
   */
  function shouldSwitchToBuildingView(marker) {
    if (mapJson.value?.building_view_val && mapJson.value.building_view_col) {
      const val = marker[mapJson.value?.building_view_col]
      return val && mapJson.value?.building_view_val?.includes(val)
    }
    return false
  }

  /**
   * 切换回普通视图
   */
  function switchToNormalView() {
    isBuildingView.value = false
    buildingInfo.value = {}
  }

  return {
    // 状态
    isBuildingView,
    buildingInfo,
    
    // 方法
    switchToBuildingView,
    shouldSwitchToBuildingView,
    switchToNormalView
  }
}