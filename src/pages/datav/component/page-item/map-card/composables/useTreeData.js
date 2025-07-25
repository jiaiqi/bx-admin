/**
 * 树形数据相关的组合式函数
 * 负责处理树形数据的获取、展开/折叠、选择等逻辑
 */
import { ref, computed, set } from 'vue'
import { $selectList } from '@/common/http'
import cloneDeep from 'lodash/cloneDeep'

export function useTreeData(props, mapJson, emit) {
  // 树形数据相关状态
  const treeData = ref([])
  const selectedTreeData = ref({})
  const expandedNodes = ref({})

  // 建筑物视图相关状态
  const buildingTree = ref([])
  const floorInfo = ref(null)
  const expandedBuildingNodes = ref({})

  /**
   * 树形数据请求配置
   */
  const setTreeReq = computed(() => {
    let result = false
    if (props.treeReq?.serviceName) {
      result = props.treeReq
    } else if (mapJson.value?.map_tree_req_json?.serviceName) {
      result = mapJson.value?.map_tree_req_json
    }
    return result
  })

  /**
   * 获取子数据
   */
  async function getChildrenData(parent_no) {
    const req = cloneDeep(props.treeReq || mapJson.value?.map_tree_req_json)
    if (!req || !parent_no) return []

    if (!req.condition) {
      req.condition = []
    }
    
    let condition = req.condition.filter((item) => item.colName !== "parent_no")
    req.condition = [
      ...condition,
      {
        colName: "parent_no",
        ruleType: "eq",
        value: parent_no,
      },
    ]
    
    const url = `/${req.mapp}/select/${req.serviceName}`
    const res = await $selectList(url, req)
    
    if (res.ok) {
      return res.data
    }
    return []
  }

  /**
   * 设置子节点数据
   */
  async function setChildren(item) {
    const noCol = mapJson.value?.["map_filter_val_field"]
    if (item.is_leaf !== "是" && !item.children?.length) {
      const children = await getChildrenData(item[noCol])
      set(item, "children", children)
    }
    return item
  }

  /**
   * 获取树形数据项的显示标签
   */
  function getTreeItemLabel(item) {
    if (item?.[mapJson.value?.map_filter_label_field]) {
      return item[mapJson.value?.map_filter_label_field]
    }
    return item?.area_name || item?.name || ""
  }

  /**
   * 切换节点展开/折叠状态
   */
  async function toggleExpand(item) {
    if (!item || !item.id) return
    
    await setChildren(item)
    set(expandedNodes.value, item.id, !expandedNodes.value[item.id])
  }

  /**
   * 树形数据项点击处理
   */
  async function handleTreeDataClick(item) {
    await setChildren(item)
    selectedTreeData.value = item
    emit("select", item)
    
    if (item?.id) {
      set(expandedNodes.value, item.id, !expandedNodes.value[item.id])
    }
  }

  /**
   * 建筑物树形数据项点击处理
   */
  async function handleBuildingTreeDataClick(item) {
    await setChildren(item)
    floorInfo.value = item
    
    if (item?.id) {
      set(expandedBuildingNodes.value, item.id, !expandedBuildingNodes.value[item.id])
    }
    emit("select", item)
  }

  /**
   * 初始化地图树形数据
   */
  async function initMapTreeData() {
    const req = setTreeReq.value
    if (!req) {
      console.log("没有配置请求")
      return
    }

    const url = `/${req.mapp}/select/${req.serviceName}`
    const res = await $selectList(url, req)

    if (res.ok) {
      if (res.data.length) {
        await setChildren(res.data[0])
        selectedTreeData.value = res.data[0]
      }
      treeData.value = res.data
    }
  }

  /**
   * 获取建筑物树形数据
   */
  function getBuildingTree(marker) {
    let list = marker?.children || []
    let res = []

    for (let i = 0; i < list.length; i++) {
      const item = list[i]
      if (item?.[mapJson.value?.building_view_col]) {
        res.push(item)
      }
    }

    return res
  }

  return {
    // 状态
    treeData,
    selectedTreeData,
    expandedNodes,
    buildingTree,
    floorInfo,
    expandedBuildingNodes,
    setTreeReq,
    
    // 方法
    getChildrenData,
    setChildren,
    getTreeItemLabel,
    toggleExpand,
    handleTreeDataClick,
    handleBuildingTreeDataClick,
    initMapTreeData,
    getBuildingTree
  }
}