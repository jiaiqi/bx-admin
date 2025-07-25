<template>
  <!-- 自定义底图的地图容器 - 支持建筑物视图和普通视图 -->
  <div class="map-view-container">
    <!-- 建筑物视图的树形数据 -->
    <BuildingTreeView
      v-if="isBuildingView && buildingTree && buildingTree.length"
      :building-tree="buildingTree"
      :floor-info="floorInfo"
      :expanded-nodes="expandedBuildingNodes"
      :building-info="buildingInfo"
      :get-tree-item-label="getTreeItemLabel"
      @toggle-expand="toggleExpand"
      @select="handleBuildingTreeDataClick"
      @back="switchToNormalView"
    />

    <!-- 普通视图的侧边栏树形数据 -->
    <NormalTreeView
      v-else-if="!isBuildingView && treeData && treeData.length"
      :tree-data="treeData"
      :selected-tree-data="selectedTreeData"
      :expanded-nodes="expandedNodes"
      :is-collapsed="isCollapsed"
      :left="left"
      :get-tree-item-label="getTreeItemLabel"
      :set-children-func="setChildren"
      @toggle-expand="toggleExpand"
      @select="handleTreeDataClick"
      @toggle-collapsed="toggleCollapsed"
    />

    <!-- 自定义底图-地图视图区域 -->
    <zoom-drag-container :show-tips="true">
      <div
        class="map-view base-image"
        :class="{
          'building-view': isBuildingView,
          'custom-map': !isBuildingView,
        }"
        :style="{
          backgroundImage: `url(${baseImage})`,
        }"
      >
        <!-- 建筑物视图内容 -->
        <template v-if="isBuildingView">
          <!-- building-view 的标记点内容可以在这里添加 -->
        </template>

        <!-- 普通视图的标记点内容 -->
        <template v-else>
          <!-- 标签类型的标记点 -->
          <LabelMarkers
            v-if="mapJson && mapJson.map_type === '标签' && markerList.length"
            :markers="markerList"
            :map-json="mapJson"
            :label-style="setLabelStyle"
            :label-active-style="setLabelActiveStyle"
            :selected-tree-data="selectedTreeData"
            :get-item-position="getItemPosition"
            :is-active="isActive"
            @click="handleMarkerClick"
          />

          <!-- 图标类型的标记点 -->
          <IconMarkers
            v-else-if="markerList.length"
            :markers="markerList"
            :card-unit-json="cardUnitJson"
            :get-item-position="getItemPosition"
            :get-item-icon="getItemIcon"
            @click="handleMarkerClick"
          />
        </template>
      </div>
    </zoom-drag-container>

    <!-- 多来源标记物组件 -->
    <multi-source-markers
      :map-json="mapJson"
      v-if="mapJson && mapJson.map_option && mapJson.map_option.includes('多来源标记物')"
      :marker-list.sync="markerList"
    />

    <!-- 弹窗组件 -->
    <PopoverComponent
      v-if="!isBuildingView"
      :active-marker="activeMarker"
      :popover-position="popoverPosition"
      :page-item="pageItem"
      :card-unit-json="cardUnitJson"
      @close="hidePopover"
      @drill-down="handleDrillDown"
    />
  </div>
</template>

<script setup>
/**
 * 重构后的自定义底图组件
 * 使用组合式函数来分离关注点，提高代码的可维护性
 */

import { onMounted, onUnmounted, watch } from "vue";

// 组合式函数导入
import { useMapConfig } from './composables/useMapConfig.js'
import { usePopover } from './composables/usePopover.js'
import { useTreeData } from './composables/useTreeData.js'
import { useMarkers } from './composables/useMarkers.js'
import { useBuildingView } from './composables/useBuildingView.js'
import { useSidebar } from './composables/useSidebar.js'

// 子组件导入
import BuildingTreeView from './components/BuildingTreeView.vue'
import NormalTreeView from './components/NormalTreeView.vue'
import LabelMarkers from './components/LabelMarkers.vue'
import IconMarkers from './components/IconMarkers.vue'
import PopoverComponent from './components/PopoverComponent.vue'

// 其他组件导入
import ZoomDragContainer from "@/components/common/ZoomDragContainer.vue"
import MultiSourceMarkers from "./MultiSourceMarkers.vue"

/**
 * 组件 Props 定义
 */
const props = defineProps({
  pageItem: Object,
  treeReq: Object,
})

/**
 * 组件事件发射器
 */
const emit = defineEmits(["select"])

// 使用组合式函数
const { mapJson, cardUnitJson, createBaseImageComputed } = useMapConfig(props)

const {
  activeMarker,
  popoverPosition,
  currentMarkerElement,
  showPopover,
  hidePopover,
  togglePopover,
  cleanup: cleanupPopover
} = usePopover()

const {
  treeData,
  selectedTreeData,
  expandedNodes,
  buildingTree,
  floorInfo,
  expandedBuildingNodes,
  setTreeReq,
  setChildren,
  getTreeItemLabel,
  toggleExpand,
  handleTreeDataClick,
  handleBuildingTreeDataClick,
  initMapTreeData,
  getBuildingTree
} = useTreeData(props, mapJson, emit)

const {
  markerList,
  setLabelStyle,
  setLabelActiveStyle,
  getItemIcon,
  getItemPosition,
  isActive,
  initCustomMap
} = useMarkers(props, mapJson)

const {
  isBuildingView,
  buildingInfo,
  switchToBuildingView,
  shouldSwitchToBuildingView,
  switchToNormalView
} = useBuildingView(mapJson, getBuildingTree)

const {
  isCollapsed,
  left,
  toggleCollapsed
} = useSidebar()

// 创建底图计算属性
const baseImage = createBaseImageComputed(selectedTreeData, buildingInfo, floorInfo, treeData)

/**
 * 统一的标记点点击处理函数
 */
async function handleMarkerClick(marker, event) {
  // 检查是否应该切换到建筑物视图
  if (shouldSwitchToBuildingView(marker)) {
    switchToBuildingView(marker, buildingTree, floorInfo)
    return
  }
  
  // 处理弹窗显示
  if (cardUnitJson.value && marker) {
    const element = event?.currentTarget
    await togglePopover(marker, element)
  }
}

/**
 * 处理下钻操作
 */
function handleDrillDown(marker) {
  // 发射select事件，让父组件处理下钻逻辑
  emit('select', marker)
}

/**
 * 监听选中树形数据的变化
 */
watch(
  () => selectedTreeData.value,
  (newVal) => {
    if (
      newVal.children?.length &&
      mapJson.value?.x_col &&
      mapJson.value?.y_col
    ) {
      markerList.value = newVal.children.filter(
        (item) => item[mapJson.value?.x_col] && item[mapJson.value?.y_col]
      )
    }
  }
)

/**
 * 组件挂载生命周期钩子
 */
onMounted(() => {
  if (setTreeReq.value) {
    initMapTreeData()
  } else {
    initCustomMap().then((res) => {
      markerList.value = res
    })
  }
})

/**
 * 组件卸载生命周期钩子
 */
onUnmounted(() => {
  cleanupPopover()
})
</script>

<style lang="scss" scoped>
.map-view-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
  outline: none;
  user-select: none;
  scrollbar-width: none;
}

.map-view {
  width: 100%;
  height: 100%;
  position: relative;
}

.base-image {
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;
}

.building-view {
  display: grid;
  grid-template-columns: 150px 1fr;
  grid-template-rows: 1fr;
}

.custom-map {
  background-color: rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  position: relative;
  width: 100%;
  height: 100%;
}
</style>