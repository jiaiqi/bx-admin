<template>
  <div
    class="map-zoom-container"
    :class="{
      'ctrl-pressed': isCtrlPressed,
      'space-pressed': isSpacePressed && !isDragging,
      dragging: isDragging,
    }"
    @wheel="handleWheel"
    @mousedown="handleMouseDown"
    @mouseleave="handleMouseUp"
    @click="tapMarker()"
    tabindex="0"
    v-if="
      mapJson && mapJson.map_base_supplier === '自定义底图' && isBuildingView
    "
  >
    <div
      class="building-tree-data map-tree-data"
      v-if="isBuildingView && buildingTree && buildingTree.length"
    >
      <div class="tree-data-item" v-for="item in buildingTree" :key="item.id">
        <div
          class="tree-data-item-name"
          :class="{
            active:
              (floorInfo && item.id && floorInfo.id === item.id) ||
              (floorInfo.path && floorInfo.path.startsWith(item.path)),
          }"
          @click="tapBuildingTreeData(item)"
        >
          <i
            class="tree-data-item-name-icon el-icon-caret-right"
            :class="{ expanded: expandedBuildingNodes[item.id] }"
            @click.stop="toggleExpand(item)"
            v-if="item.children && item.children.length"
          ></i>
          <span class="tree-data-item-name-text">
            {{ getTreeItemLabel(item) }}
          </span>
        </div>
        <transition name="tree-expand">
          <div
            class="tree-data-item-child"
            v-show="expandedBuildingNodes[item.id]"
          >
            <tree-data-item
              v-for="child in item.children"
              :key="child.id"
              :item="child"
              :selected="floorInfo"
              :level="1"
              @select="tapBuildingTreeData"
            />
          </div>
        </transition>
      </div>
    </div>
    <div
      class="map-view building-view"
      :class="{ 'no-transition': isDragging }"
      :style="{
        backgroundImage: `url(${baseImage})`,
        backgroundSize: '100% 100%',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        transform: `translate(${mapPosition.x}px, ${mapPosition.y}px) scale(${zoomScale})`,
        transformOrigin: 'center center',
      }"
    >
      <!-- building-view 的标记点内容可以在这里添加 -->
    </div>
    
    <!-- 一键恢复按钮 -->
    <div 
      class="map-reset-btn" 
      v-show="!isInitialView"
      @click="resetMapView" 
      title="恢复初始视图"
    >
      <Icon icon="material-symbols:refresh" class="reset-icon"></Icon>
    </div>
  </div>

  <div
    class="map-zoom-container"
    :class="{
      'ctrl-pressed': isCtrlPressed,
      'space-pressed': isSpacePressed && !isDragging,
      dragging: isDragging,
    }"
    @wheel="handleWheel"
    @mousedown="handleMouseDown"
    @mouseleave="handleMouseUp"
    @click="tapMarker()"
    tabindex="0"
    v-else-if="mapJson && mapJson.map_base_supplier === '自定义底图'"
  >
    <div
      class="map-left"
      :style="{
        '--left': left + 'px',
      }"
      :class="{ collapsed: isCollapsed }"
    >
      <div class="map-tree-data" v-if="treeData.length">
        <div class="tree-data-item" v-for="item in treeData" :key="item.id">
          <div
            class="tree-data-item-name"
            :class="{
              active:
                (selectedTreeData &&
                  item.id &&
                  selectedTreeData.id === item.id) ||
                (selectedTreeData.path &&
                  selectedTreeData.path.startsWith(item.path)),
            }"
            @click="tapTreeData(item)"
          >
            <i
              class="tree-data-item-name-icon el-icon-caret-right"
              :class="{ expanded: expandedNodes[item.id] }"
              @click.stop="toggleExpand(item)"
            ></i>
            <span class="tree-data-item-name-text">
              {{ getTreeItemLabel(item) }}
            </span>
          </div>
          <transition name="tree-expand">
            <div class="tree-data-item-child" v-show="expandedNodes[item.id]">
              <tree-data-item
                v-for="child in item.children"
                :key="child.id"
                :item="child"
                :selected="selectedTreeData"
                :level="1"
                @select="tapTreeData"
              />
            </div>
          </transition>
        </div>
      </div>
      <div
        class="collapsed-icon"
        @click="changeCollapsed"
        v-if="treeData.length"
        :title="isCollapsed ? '展开' : '收起'"
      >
        <Icon icon="material-symbols:arrow-menu-close" class="icon"></Icon>
      </div>
    </div>
    <div
      class="map-view custom-map"
      :class="{ 'no-transition': isDragging }"
      :style="{
        backgroundImage: `url(${baseImage})`,
        backgroundSize: '100% 100%',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        transform: `translate(${mapPosition.x}px, ${mapPosition.y}px) scale(${zoomScale})`,
        transformOrigin: 'center center',
      }"
    >
      <template
        v-if="mapJson && mapJson.map_type === '标签' && markerList.length"
      >
        <div
          class="map-marker"
          :class="{ 'is-active': isActive(marker) }"
          :style="[
            {
              ...setLabelStyle,
              ...(isActive(marker) ? setLabelActiveStyle : {}),
            },
            getItemPosition(marker),
          ]"
          v-for="marker in markerList"
          :key="marker.id"
          @click="clickMarker(marker)"
        >
          <div class="map-marker-content">
            {{ marker[mapJson.col_label] || "" }}
          </div>
        </div>
      </template>
      <template v-else-if="markerList.length">
        <div
          class="map-marker"
          :style="getItemPosition(item)"
          @click.stop="tapMarker(item, $event)"
          :class="{ 'cursor-pointer': !!cardUnitJson }"
          v-for="item in markerList"
          :key="item.id"
        >
          <img
            :src="getItemIcon(item)"
            class="marker-icon"
            v-if="getItemIcon(item)"
          />
        </div>
      </template>
    
    </div>
    
    <!-- 一键恢复按钮 -->
     <div 
       class="map-reset-btn" 
       v-show="!isInitialView"
       @click="resetMapView" 
       title="恢复初始视图"
     >
       <Icon icon="material-symbols:refresh" class="reset-icon"></Icon>
     </div>
    
      <Teleport to="body">
        <div
          class="popover-content-to-body"
          :style="{
            left: popoverPosition.x + 'px',
            top: popoverPosition.y + 'px',
          }"
        >
          <transition name="popover-fade">
            <div
              class="popover-content"
              :class="{ show: activeMarker && activeMarker.id }"
            >
              <template v-if="activeMarker && activeMarker.id">
                <div class="bottom-arrow"></div>
                <card-group-cell
                  :page-item="pageItem"
                  :cellsLayout="[cardUnitJson]"
                  :cell-data="[activeMarker]"
                  :key="activeMarker.id"
                ></card-group-cell>
              </template>
            </div>
          </transition>
        </div>
      </Teleport>
  </div>

  <div class="map-view" v-else>
    <!-- 定义地图显示容器 -->
    <div :id="mapId" class="map-container"></div>

    <div class="map-legend">
      <div
        v-for="item in iconJson"
        :key="item.legend_label"
        class="legend-wrap"
      >
        <img :src="getImagePath(item.icon)" class="legend-icon" />
        <span class="legend-text">{{ item.legend_label || "" }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  onMounted,
  onUnmounted,
  ref,
  nextTick,
  computed,
  watch,
  set,
} from "vue";

import { getImagePath } from "../../common/http";
import {
  initMapData,
  generateMapID,
  initMap,
} from "../../common/functions/mapUtils.js";
import { $selectList } from "@/common/http";
import cardGroupCell from "./card-group-cell/card-group-cell.vue";
import TreeDataItem from "./TreeDataItem.vue";
import { formatStyleData } from "../../common";
import { Icon } from "@iconify/vue2";
import Teleport from "vue2-teleport";

const props = defineProps({
  pageItem: Object,
  treeReq: Object,
});

const isCollapsed = ref(false);
const left = computed(() => (isCollapsed.value ? -230 : 15));
const changeCollapsed = () => {
  isCollapsed.value = !isCollapsed.value;
};

// 缩放相关
const zoomScale = ref(1);
const minZoom = 0.5;
const maxZoom = 3;
const zoomStep = 0.1;

// 拖拽相关
const isDragging = ref(false);
const dragStart = ref({ x: 0, y: 0 });
const mapPosition = ref({ x: 0, y: 0 });
const isSpacePressed = ref(false);

// Ctrl键状态
const isCtrlPressed = ref(false);

// 处理鼠标滚轮事件
const handleWheel = (event) => {
  // 只有按住Ctrl键时才进行缩放
  if (event.ctrlKey) {
    event.preventDefault();

    // 缩放时隐藏popover
    if (activeMarker.value?.id) {
      activeMarker.value = null;
      currentMarkerElement.value = null;
      removeEventListeners();
    }

    const delta = event.deltaY > 0 ? -zoomStep : zoomStep;
    const newScale = zoomScale.value + delta;

    // 限制缩放范围
    if (newScale >= minZoom && newScale <= maxZoom) {
      zoomScale.value = newScale;
    }
  }
};

// 处理鼠标按下事件
const handleMouseDown = (event) => {
  if (isSpacePressed.value) {
    event.preventDefault();
    isDragging.value = true;
    
    // 拖拽时隐藏popover
    if (activeMarker.value?.id) {
      activeMarker.value = null;
      currentMarkerElement.value = null;
      removeEventListeners();
    }
    
    dragStart.value = {
      x: event.clientX - mapPosition.value.x,
      y: event.clientY - mapPosition.value.y,
    };
    updateCursor();
  }
};

// 拖拽性能优化
let animationFrameId = null;

// 处理鼠标移动事件
const handleMouseMove = (event) => {
  if (isDragging.value && isSpacePressed.value) {
    event.preventDefault();

    // 使用requestAnimationFrame优化性能
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }

    animationFrameId = requestAnimationFrame(() => {
      mapPosition.value = {
        x: event.clientX - dragStart.value.x,
        y: event.clientY - dragStart.value.y,
      };
    });
  }
};

// 处理鼠标松开事件
const handleMouseUp = () => {
  if (isDragging.value) {
    isDragging.value = false;
    updateCursor();
  }
};

// 处理键盘按下事件
const handleKeyDown = (event) => {
  if (event.code === "Space") {
    event.preventDefault(); // 阻止空格键的默认滚动行为
    if (!isSpacePressed.value) {
      isSpacePressed.value = true;
      updateCursor();
    }
  } else if (event.code === "ControlLeft" || event.code === "ControlRight") {
    if (!isCtrlPressed.value) {
      isCtrlPressed.value = true;
      updateCursor();
    }
  }
};

// 处理键盘松开事件
const handleKeyUp = (event) => {
  if (event.code === "Space") {
    event.preventDefault(); // 阻止空格键的默认滚动行为
    isSpacePressed.value = false;
    updateCursor();
    if (isDragging.value) {
      isDragging.value = false;
    }
  } else if (event.code === "ControlLeft" || event.code === "ControlRight") {
    isCtrlPressed.value = false;
    updateCursor();
  }
};

// 更新光标样式（现在主要通过CSS类控制，这里作为备用）
const updateCursor = () => {
  // 光标样式现在主要通过CSS类控制
  // 这里保留函数以防需要额外的光标控制逻辑
};

// 判断是否为初始视图状态
const isInitialView = computed(() => {
  return zoomScale.value === 1 && mapPosition.value.x === 0 && mapPosition.value.y === 0;
});

// 一键恢复地图到初始状态
const resetMapView = () => {
  zoomScale.value = 1;
  mapPosition.value = { x: 0, y: 0 };
  
  // 如果有活动的popover，也一并隐藏
  if (activeMarker.value?.id) {
    activeMarker.value = null;
    currentMarkerElement.value = null;
    removeEventListeners();
  }
};
function isActive(marker) {
  if (selectedTreeData.value && marker?.id) {
    return selectedTreeData.value?.id === marker.id;
  }
  return false;
}
const mapJson = computed(() => {
  return props.pageItem.map_json || {};
});
const mapBaseSupplier = computed(() => {
  return mapJson.value.map_base_supplier || "";
});

function findParentWithBaseImage(data, list) {
  if (!data?.parent_no || !list?.length) return null;
  const valCol = mapJson.value?.map_filter_val_field;
  if (!valCol) return null;
  for (const item of list) {
    if (item[valCol] && item[valCol] === data.parent_no) {
      return item;
    }
    if (item.children?.length) {
      const found = findParentWithBaseImage(data, item.children);
      if (found) return found;
    }
  }
  return null;
}
const baseImage = computed(() => {
  if (mapBaseSupplier.value !== "自定义底图") {
    return "";
  }

  const baseImageCol = mapJson.value.map_base_col;
  if (!baseImageCol) {
    if (floorInfo.value?.[baseImageCol]) {
      return getImagePath(floorInfo.value[baseImageCol]);
    }
    return getImagePath(mapJson.value.base_image);
  }

  // 楼视图
  if (buildingInfo.value?.[baseImageCol]) {
    return getImagePath(buildingInfo.value[baseImageCol]);
  }

  // 检查当前选中项是否为叶子节点(没有子节点)
  if (selectedTreeData.value?.is_leaf !== "是") {
    // 检查当前选中项
    if (selectedTreeData.value?.[baseImageCol]) {
      return getImagePath(selectedTreeData.value[baseImageCol]);
    }
  }

  // 递归查找父级
  let parent = findParentWithBaseImage(selectedTreeData.value, treeData.value);
  while (parent) {
    if (parent[baseImageCol]) {
      return getImagePath(parent[baseImageCol]);
    }
    parent = findParentWithBaseImage(parent, treeData.value);
  }

  // 如果都没有找到，使用默认底图
  return getImagePath(mapJson.value.base_image);
});

const mapInstance = ref(null); // 地图实例
const mapId = ref(""); // 地图编号
const iconJson = ref([]); //地图图例
const markerInfo = ref({});

const markerList = ref([]);
const activeMarker = ref({});
const popoverPosition = ref({ x: 0, y: 0 });
const cardUnitJson = computed(() => mapJson.value.tips_card_unit_json);
const currentMarkerElement = ref(null);

// const title = ref("");
// const longitude = ref("");
// const latitude = ref("");
// const scale = ref(18); //地图缩放级别
function initTencentMap() {
  var script = document.createElement("script");
  script.type = "text/javascript";
  script.src =
    "https://map.qq.com/api/gljs?v=1.exp&key=G3VBZ-CKMKB-4CFUZ-JZLSE-676K6-J4FWP";
  document.head.appendChild(script);
  mapId.value = generateMapID(props.pageItem?.com_no, "map-container");
  setTimeout(() => {
    nextTick(() => {
      mapInstance.value = initMap(mapId.value, props.pageItem);
      initMapData(mapInstance.value, props.pageItem).then((markerData) => {
        markerInfo.value = markerData;
        if (markerData.iconJson) {
          iconJson.value = markerData.iconJson;
        }
        // if(markerData?.center&&markerData?.markers){
        // }
      });
    });
  }, 1000);
}

async function initCustomMap() {
  console.log("自定义底图");
  let list = [];
  if (
    props.pageItem.srv_req_type === "请求数据" &&
    props.pageItem.srv_req_json
  ) {
    const reqJson = props.pageItem.srv_req_json;
    const req = props.pageItem.srv_req_json;
    const url = `/${reqJson.mapp}/select/${reqJson.serviceName}`;
    const res = await $selectList(url, req);
    if (res.ok) {
      list = res.data;
    }
  } else if (props.pageItem.srv_req_type === "模拟数据") {
    list = props.pageItem.mock_data_json;
  }
  return list;
}

function getItemIcon(item = {}) {
  if (mapJson.value?.marker_icon_col && item[mapJson.value?.marker_icon_col]) {
    return getImagePath(item[mapJson.value?.marker_icon_col]);
  } else if (mapJson.value?.icon_default) {
    return getImagePath(mapJson.value?.icon_default);
  }
  return "";
}

function getItemPosition(item = {}) {
  let post = {
    left: 0,
    top: 0,
  };
  if (mapJson.value?.x_col && item[mapJson.value?.x_col]) {
    post.left = item[mapJson.value?.x_col] + "%";
  }
  if (mapJson.value?.y_col && item[mapJson.value?.y_col]) {
    post.top = item[mapJson.value?.y_col] + "%";
  }
  return post;
}
const setLabelStyle = computed(() => {
  if (
    mapJson.value?.map_type === "标签" &&
    mapJson.value?.col_label_style_json
  ) {
    return formatStyleData(mapJson.value?.col_label_style_json);
  }
});

const setLabelActiveStyle = computed(() => {
  if (
    mapJson.value?.map_type === "标签" &&
    mapJson.value?.label_active_style_json
  ) {
    return formatStyleData(mapJson.value?.label_active_style_json);
  }
});

function calculatePopoverPosition(element) {
  if (!element) return;
  
  // 由于popover使用position: fixed定位（相对于视口），
  // 我们需要获取元素相对于视口的准确位置
  const elementRect = element.getBoundingClientRect();
  
  // 计算popover的位置（相对于视口）
  // popover的transform是translate(-50%, -100%)，所以需要考虑这个偏移
  popoverPosition.value = {
    x: elementRect.left + elementRect.width / 2,
    y: elementRect.top - 10,
  };
}

// 注意：现在缩放和拖拽时直接隐藏popover，不再需要重新计算位置

function tapMarker(item, event) {
  if (item?.id && item?.id === activeMarker.value?.id) {
    activeMarker.value = null;
    currentMarkerElement.value = null;
    removeEventListeners();
  } else {
    activeMarker.value = item;
    // 记录点击位置和元素引用
    if (event) {
      console.log(event.currentTarget);
      const ele = event.currentTarget;
      currentMarkerElement.value = ele;
      calculatePopoverPosition(ele);
      addEventListeners();
    }
  }
}

function handleResize() {
  if (currentMarkerElement.value && activeMarker.value?.id) {
    calculatePopoverPosition(currentMarkerElement.value);
  }
}

function handleScroll() {
  if (currentMarkerElement.value && activeMarker.value?.id) {
    calculatePopoverPosition(currentMarkerElement.value);
  }
}

function addEventListeners() {
  window.addEventListener("resize", handleResize);
  window.addEventListener("scroll", handleScroll, true);
}

function removeEventListeners() {
  window.removeEventListener("resize", handleResize);
  window.removeEventListener("scroll", handleScroll, true);
}
const treeData = ref([]);
const selectedTreeData = ref({});
const expandedNodes = ref({});

function toggleExpand(item) {
  console.log("toggleExpand", item);
  if (!item || !item.id) return;

  set(expandedNodes.value, item.id, !expandedNodes.value[item.id]);
  console.log("expandedNodes", expandedNodes.value);
}

function getTreeItemLabel(item) {
  if (item?.[mapJson.value?.map_filter_label_field]) {
    return item[mapJson.value?.map_filter_label_field];
  }
  return item?.area_name || item?.name || "";
}

watch(
  () => selectedTreeData.value,
  (newVal) => {
    console.log(newVal);
    if (
      newVal.children?.length &&
      mapJson.value?.x_col &&
      mapJson.value?.y_col
    ) {
      markerList.value = newVal.children.filter(
        (item) => item[mapJson.value?.x_col] && item[mapJson.value?.y_col]
      );
    }
  }
);

// 注意：缩放和拖拽时会自动隐藏popover，无需监听位置变化
const emit = defineEmits(["select"]);
function tapTreeData(item) {
  selectedTreeData.value = item;
  emit("select", item);
  if (item?.id) {
    set(expandedNodes.value, item.id, !expandedNodes.value[item.id]);
  }
}

async function initMapTreeData() {
  const req = props.treeReq || mapJson.value?.map_tree_req_json;
  if (!req) {
    console.log("没有配置请求");

    return;
  }
  req.treeData = true;
  const url = `/${req.mapp}/select/${req.serviceName}`;
  const res = await $selectList(url, req);
  if (res.ok) {
    treeData.value = res.data;
    if (res.data.length) {
      selectedTreeData.value = res.data[0];
    }
  }
}
const isBuildingView = ref(false);
const buildingInfo = ref({});
const buildingTree = ref([]);
const floorInfo = ref(null);
const expandedBuildingNodes = ref({});

function tapBuildingTreeData(item) {
  floorInfo.value = item;
  if (item?.id) {
    set(
      expandedBuildingNodes.value,
      item.id,
      !expandedBuildingNodes.value[item.id]
    );
  }
  emit("select", item);
}
function clickMarker(marker) {
  if (mapJson.value?.building_view_val && mapJson.value.building_view_col) {
    const val = marker[mapJson.value?.building_view_col];
    if (val && mapJson.value?.building_view_val?.includes(val)) {
      switchToBuildingView(marker);
    }
  }
}
function switchToBuildingView(marker) {
  isBuildingView.value = true;
  buildingInfo.value = marker;
  buildingTree.value = getBuildingTree(marker);
  if (buildingTree.value?.length) {
    floorInfo.value = buildingTree.value[0];
  }
}
function getBuildingTree(marker) {
  let list = marker?.children || [];
  let res = [];
  for (let i = 0; i < list.length; i++) {
    const item = list[i];
    if (item?.[mapJson.value?.building_view_col]) {
      res.push(item);
    }
  }
  return res;
}
function getBuildingMakers() {}
function switchToMarkerView() {
  isBuildingView.value = false;
  buildingInfo.value = null;
}
onMounted(() => {
  // 实例化地图
  if (mapBaseSupplier.value === "腾讯地图") {
    initTencentMap();
  } else if (mapBaseSupplier.value === "自定义底图") {
    if (props.treeReq || mapJson.value?.map_tree_req_json) {
      initMapTreeData();
    } else {
      initCustomMap().then((res) => {
        markerList.value = res;
      });
    }
  }

  // 添加全局事件监听器
  document.addEventListener("mousemove", handleMouseMove);
  document.addEventListener("mouseup", handleMouseUp);
  document.addEventListener("keydown", handleKeyDown);
  document.addEventListener("keyup", handleKeyUp);
});

onUnmounted(() => {
  removeEventListeners();

  // 清理全局事件监听器
  document.removeEventListener("mousemove", handleMouseMove);
  document.removeEventListener("mouseup", handleMouseUp);
  document.removeEventListener("keydown", handleKeyDown);
  document.removeEventListener("keyup", handleKeyUp);

  // 清理requestAnimationFrame
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }

  // 重置光标样式
  document.body.style.cursor = "";
});

const vClickoutside = {
  mounted(el, binding) {
    el.clickoutsideEvent = (e) => {
      if (!(el === e.target || el.contains(e.target))) {
        binding.value(e);
      }
    };
    document.addEventListener("click", el.clickoutsideEvent);
  },
  unmounted(el) {
    document.removeEventListener("click", el.clickoutsideEvent);
  },
};
</script>

<style lang="scss" scoped>
.map-view {
  width: 100%;
  height: 100%;
  position: relative;
}
.building-view {
  display: grid;
  grid-template-columns: 150px 1fr;
  grid-template-rows: 1fr;
  .building-tree-data {
    position: unset;
    height: 100%;
    overflow-y: auto;
    display: inline-block;
    .tree-data-item {
      .tree-data-item-name {
        min-width: 100px;
      }
    }
  }
  .map-bg {
    display: inline-block;
    flex: 1;
    background-color: rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(10px);
    position: relative;
    z-index: 10;
    height: 100%;
    width: 100%;
  }
}
.map-left {
  z-index: 100;
  max-height: 80%;
  top: 15px;
  left: var(--left, 15px);
  display: flex;
  position: absolute;
  transition: left cubic-bezier(0.5, -0.5, 0.5, 1) 0.3s;
  .map-tree-data {
    position: relative;
    width: 220px;
    transform: scale(1);
    transition: transform cubic-bezier(0.5, -0.5, 0.5, 1) 0.3s;
  }
  &.collapsed {
    .map-tree-data {
      transform: scale(0);
    }
    .collapsed-icon {
      .icon {
        rotate: 180deg;
      }
    }
  }
  .collapsed-icon {
    position: absolute;
    // left: calc(var(--left) + 420px + 15px);
    // padding: 5px;
    // z-index: 99;
    cursor: pointer;
    text-align: center;
    width: 50px;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 24px;
    right: 0;
    transform: translateX(100%);
    .icon {
      transform: scale(0);
      rotate: 0;
    }
    &:hover {
      backdrop-filter: blur(1px);
      .icon {
        transform: scale(1);
      }
    }
  }
}

.map-tree-data {
  position: absolute;
  top: 15px;
  left: 15px;
  z-index: 100;
  background: #fff;
  max-height: 80%;
  overflow-y: auto;
  overflow-x: auto;
  scrollbar-width: thin;
  scrollbar-color: #ccc #f5f5f5;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: #ccc;
    border-radius: 3px;
  }
  .tree-data-item {
    border-top: 1px solid #e5e5e5;
    &:first-child {
      border-top: none;
    }
    .tree-data-item-name {
      border-bottom: 1px solid #e5e5e5;
      &:last-child {
        border-bottom: none;
      }
      width: 100%;
      padding: 0px 30px;
      line-height: 46px;
      min-width: 175px;
      display: flex;
      justify-content: center;
      align-items: center;
      position: relative;
      text-align: center;
      cursor: pointer;
      .tree-data-item-name-icon {
        position: absolute;
        left: 10px;
        top: 50%;
        transform: translate(0, -50%);
        font-size: 16px;
        transition: transform 0.3s ease;
        cursor: pointer;

        &.expanded {
          transform: translate(0, -50%) rotate(90deg);
        }
      }
      &.active {
        background: linear-gradient(
          151.99deg,
          rgba(0, 122, 255, 1) 29.59%,
          rgba(4, 71, 171, 1) 294.82%
        );
        color: #fff;
      }
    }
    .tree-data-item-child {
      .tree-data-item-child-item {
        .tree-data-item-child-item-name {
          border-left: 2px solid transparent;
          width: 100%;
          padding: 5px 30px;
          line-height: 46px;
          cursor: pointer;
        }
      }
    }
  }
}
.map-zoom-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
  outline: none;
  user-select: none;
  
  // 可视化编辑器画布背景 - 点状网格
  background-color: #f8f9fa;
  background-image: 
    radial-gradient(circle at center, rgba(0, 0, 0, 0.15) 1px, transparent 1px);
  background-size: 20px 20px;
  background-position: 0 0;

  &:focus {
    outline: none;
  }

  // Ctrl键按下时的缩放光标样式
  &.ctrl-pressed {
    cursor: zoom-in !important;

    * {
      cursor: zoom-in !important;
    }
  }

  // 空格键按下时的拖拽光标样式
  &.space-pressed {
    cursor: grab !important;

    * {
      cursor: grab !important;
    }
  }

  // 拖拽中的光标样式
  &.dragging {
    cursor: grabbing !important;

    * {
      cursor: grabbing !important;
    }
  }
}

.custom-map {
  background-color: rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.2s ease-out;

  // 拖拽时禁用过渡动画以提升性能
  &.no-transition {
    transition: none !important;
  }

  // &:after {
  //   content: "缺少底图";
  //   position: absolute;
  //   top: 50%;
  //   left: 50%;
  //   transform: translate(-50%, -50%);
  //   color: #fff;
  //   font-size: 16px;
  //   z-index: -1;
  // }
  .map-marker {
    position: absolute;
    transform: translate(-50%, -50%);
    &.cursor-pointer {
      cursor: pointer;
    }
    .marker-icon {
      width: 30px;
      // height: 30px;
    }
  }
}

.building-view {
  background-color: rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.2s ease-out;

  // 拖拽时禁用过渡动画以提升性能
  &.no-transition {
    transition: none !important;
  }

  // 可以在这里添加building-view特有的样式
  .building-marker {
    position: absolute;
    transform: translate(-50%, -50%);
    &.cursor-pointer {
      cursor: pointer;
    }
    .marker-icon {
      width: 30px;
    }
  }
}
:global(.popover-content-to-body) {
  position: fixed;
  z-index: 1000;
  border-radius: 5px;
  transform: translate(-50%, -100%) scale(1);
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
  opacity: 1;
  // background: #fff;
  width: max-content;
  height: max-content;
  &.popover-fade-enter-active,
  &.popover-fade-leave-active {
    // transition: all 0.3s cubic-bezier(0.55, 0, 0.1, 1);
    transition: all 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55);
    // transition: all 0.5s cubic-bezier(0.22, 1, 0.36, 1);
  }
  &.popover-fade-enter,
  &.popover-fade-leave-to {
    opacity: 0;
    transform: translate(-50%, -120%) scale(0.8);
  }
  &.popover-fade-enter-to,
  &.popover-fade-leave {
    opacity: 1;
    transform: translate(-50%, -100%) scale(1);
  }
}
:global(.popover-content-to-body .popover-content) {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.8);
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55);
  background-color: rgba(0, 0, 0, 0.1);
}
:global(.popover-content-to-body .popover-content.show) {
  opacity: 1;
  transform: translate(0%, 0%) scale(1);
}
:global(.popover-content-to-body .bottom-arrow) {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translate(-50%, 0);
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 5px solid #fff;
}
.map-container {
  width: 100%;
  height: 100%;
}

.map-legend {
  position: absolute;
  right: 0;
  bottom: 0;
  background: #fff;
  border-radius: 5px;
  z-index: 10;
  .legend-wrap {
    display: flex;
    align-items: center;
    margin-bottom: 5px;
  }

  .legend-icon {
    width: 30px;
    height: 30px;
    vertical-align: text-top;
  }

  .legend-text {
    color: #202e64;
    font-size: 14px;
    line-height: 30px;
    margin: 0 5px;
  }
}

.tree-expand-enter-active,
.tree-expand-leave-active {
  transition: all 0.3s ease;
  max-height: 1000px;
  overflow: hidden;
}

.tree-expand-enter-from,
.tree-expand-leave-to {
  max-height: 0;
  opacity: 0;
}

.tree-expand-enter-to,
.tree-expand-leave-from {
  max-height: 1000px;
  opacity: 1;
}

// 一键恢复按钮样式
.map-reset-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  }
  
  .reset-icon {
    font-size: 18px;
    color: #666;
    transition: color 0.2s ease;
  }
  
  &:hover .reset-icon {
    color: #333;
  }
}
</style>
