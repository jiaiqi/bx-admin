/**
 * 地图配置相关的组合式函数
 * 负责处理地图配置、底图选择等逻辑
 */
import { computed } from 'vue'
import { getImagePath } from '@/common/http.js'

export function useMapConfig(props) {
  /**
   * 地图配置计算属性
   */
  const mapJson = computed(() => {
    return props.pageItem.map_json || {}
  })

  /**
   * 卡片单元配置
   */
  const cardUnitJson = computed(() => mapJson.value.tips_card_unit_json)

  /**
   * 递归查找具有底图的父级节点
   */
  function findParentWithBaseImage(data, list) {
    if (!data?.parent_no || !list?.length) return null
    const valCol = mapJson.value?.map_filter_val_field
    if (!valCol) return null

    for (const item of list) {
      if (item[valCol] && item[valCol] === data.parent_no) {
        return item
      }
      if (item.children?.length) {
        const found = findParentWithBaseImage(data, item.children)
        if (found) return found
      }
    }
    return null
  }

  /**
   * 底图计算属性
   */
  function createBaseImageComputed(selectedTreeData, buildingInfo, floorInfo, treeData) {
    return computed(() => {
      const baseImageCol = mapJson.value.map_base_col
      if (!baseImageCol) {
        if (floorInfo.value?.[baseImageCol]) {
          return getImagePath(floorInfo.value[baseImageCol])
        }
        return getImagePath(mapJson.value.base_image)
      }

      // 楼视图优先
      if (buildingInfo.value?.[baseImageCol]) {
        return getImagePath(buildingInfo.value[baseImageCol])
      }

      // 检查当前选中项是否为叶子节点
      if (selectedTreeData.value?.is_leaf !== "是") {
        if (selectedTreeData.value?.[baseImageCol]) {
          return getImagePath(selectedTreeData.value[baseImageCol])
        }
      }

      // 递归查找父级节点的底图
      let parent = findParentWithBaseImage(selectedTreeData.value, treeData.value)
      while (parent) {
        if (parent[baseImageCol]) {
          return getImagePath(parent[baseImageCol])
        }
        parent = findParentWithBaseImage(parent, treeData.value)
      }

      return getImagePath(mapJson.value.base_image)
    })
  }

  return {
    mapJson,
    cardUnitJson,
    createBaseImageComputed,
    findParentWithBaseImage
  }
}