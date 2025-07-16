<!--
/**
 * 地图卡片组件 - 支持自定义底图和在线地图的交互式地图展示组件
 * 
 * @component MapCard
 * @description 
 * 地图展示组件，支持以下特性：
 *
 * @features
 * - 🗺️ 多种地图底图支持（自定义图片、百度地图等）
 * - 🔍 地图缩放功能（Ctrl + 鼠标滚轮）
 * - 🖱️ 地图拖拽功能（Space + 鼠标拖拽）
 * - 📍 标记点展示和交互
 * - 🏢 建筑物视图和楼层切换
 * - 🌳 树形数据结构展示
 * - 💬 标记点弹窗详情展示
 * - 🎨 自定义样式和图标支持
 * - 📱 响应式设计
 * 
 * 
 * @example
 * <map-card 
 *   :page-item="pageItemConfig" 
 *   :tree-req="treeRequestConfig"
 * />
 */
-->
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
    v-clickoutside="closePopup"
    v-else-if="mapJson && mapJson.map_base_supplier === '自定义底图'"
  >
    <div
      class="map-left"
      :style="{
        '--left': left + 'px',
      }"
      :class="{ collapsed: isCollapsed }"
      v-if="treeData && treeData.length"
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
/**
 * Vue 3 Composition API 导入
 * 导入必要的 Vue 响应式 API 和生命周期钩子
 */
import {
  onMounted,
  onUnmounted,
  ref,
  nextTick,
  computed,
  watch,
  set,
} from "vue";

/**
 * 工具函数和组件导入
 */
import { getImagePath } from "../../common/http"; // 图片路径处理工具
import {
  initMapData,
  generateMapID,
  initMap,
} from "../../common/functions/mapUtils.js"; // 地图工具函数
import { $selectList } from "@/common/http"; // HTTP 请求工具
import cardGroupCell from "./card-group-cell/card-group-cell.vue"; // 卡片组单元格组件
import TreeDataItem from "./TreeDataItem.vue"; // 树形数据项组件
import { formatStyleData } from "../../common"; // 样式数据格式化工具
import { Icon } from "@iconify/vue2"; // 图标组件
import Teleport from "vue2-teleport"; // Vue 2 传送门组件

/**
 * 组件 Props 定义
 * @typedef {Object} Props
 * @property {Object} pageItem - 页面项配置对象，包含地图配置、样式等信息
 * @property {Object} treeReq - 树形数据请求配置对象，用于获取树形结构数据
 */
const props = defineProps({
  pageItem: Object, // 页面项配置
  treeReq: Object, // 树形数据请求配置
});

/**
 * 左侧面板折叠状态管理
 */
const isCollapsed = ref(false); // 是否折叠左侧面板
const left = computed(() => (isCollapsed.value ? -230 : 15)); // 计算左侧面板位置
/**
 * 切换左侧面板折叠状态
 * @function changeCollapsed
 */
const changeCollapsed = () => {
  isCollapsed.value = !isCollapsed.value;
};

/**
 * 地图缩放相关状态和配置
 */
const zoomScale = ref(1); // 当前缩放比例
const minZoom = 0.5; // 最小缩放比例
const maxZoom = 3; // 最大缩放比例
const zoomStep = 0.1; // 缩放步长

/**
 * 地图拖拽相关状态
 */
const isDragging = ref(false); // 是否正在拖拽
const dragStart = ref({ x: 0, y: 0 }); // 拖拽起始位置
const mapPosition = ref({ x: 0, y: 0 }); // 地图当前位置
const isSpacePressed = ref(false); // 空格键是否按下

/**
 * 键盘状态管理
 */
const isCtrlPressed = ref(false); // Ctrl键是否按下

/**
 * 处理鼠标滚轮事件 - 地图缩放功能
 * 只有在按住 Ctrl 键时才进行缩放操作，防止误操作
 *
 * @function handleWheel
 * @param {WheelEvent} event - 鼠标滚轮事件对象
 * @description
 * - 检查 Ctrl 键是否按下，只有按下时才允许缩放
 * - 阻止默认滚动行为
 * - 缩放时自动隐藏活动的标记点弹窗
 * - 根据滚轮方向计算缩放增量
 * - 限制缩放范围在 minZoom 和 maxZoom 之间
 */
const handleWheel = (event) => {
  // 只有按住Ctrl键时才进行缩放
  if (event.ctrlKey) {
    event.preventDefault(); // 阻止默认滚动行为

    // 缩放时隐藏popover，避免位置错乱
    if (activeMarker.value?.id) {
      activeMarker.value = null;
      currentMarkerElement.value = null;
      removeEventListeners();
    }

    // 计算缩放增量：向下滚动缩小，向上滚动放大
    const delta = event.deltaY > 0 ? -zoomStep : zoomStep;
    const newScale = zoomScale.value + delta;

    // 限制缩放范围，防止过度缩放
    if (newScale >= minZoom && newScale <= maxZoom) {
      zoomScale.value = newScale;
    }
  }
};

/**
 * 处理鼠标按下事件 - 开始拖拽操作
 * 只有在按住 Space 键时才允许拖拽
 *
 * @function handleMouseDown
 * @param {MouseEvent} event - 鼠标按下事件对象
 * @description
 * - 检查 Space 键是否按下，只有按下时才允许拖拽
 * - 阻止默认行为，避免文本选择等
 * - 设置拖拽状态和起始位置
 * - 拖拽时自动隐藏活动的标记点弹窗
 * - 更新光标样式
 */
const handleMouseDown = (event) => {
  if (isSpacePressed.value) {
    event.preventDefault(); // 阻止默认行为
    isDragging.value = true; // 设置拖拽状态

    // 拖拽时隐藏popover，避免位置错乱
    if (activeMarker.value?.id) {
      activeMarker.value = null;
      currentMarkerElement.value = null;
      removeEventListeners();
    }

    // 记录拖拽起始位置，考虑当前地图位置偏移
    dragStart.value = {
      x: event.clientX - mapPosition.value.x,
      y: event.clientY - mapPosition.value.y,
    };
    updateCursor(); // 更新光标样式
  }
};

/**
 * 拖拽性能优化变量
 * 使用 requestAnimationFrame 优化拖拽性能，避免频繁重绘
 */
let animationFrameId = null;

/**
 * 处理鼠标移动事件 - 执行拖拽操作
 * 使用 requestAnimationFrame 优化性能
 *
 * @function handleMouseMove
 * @param {MouseEvent} event - 鼠标移动事件对象
 * @description
 * - 检查是否处于拖拽状态且 Space 键按下
 * - 使用 requestAnimationFrame 优化性能，避免频繁重绘
 * - 取消之前的动画帧，确保只有最新的移动生效
 * - 根据鼠标位置更新地图位置
 */
const handleMouseMove = (event) => {
  if (isDragging.value && isSpacePressed.value) {
    event.preventDefault(); // 阻止默认行为

    // 使用requestAnimationFrame优化性能，避免频繁重绘
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }

    animationFrameId = requestAnimationFrame(() => {
      // 计算新的地图位置
      mapPosition.value = {
        x: event.clientX - dragStart.value.x,
        y: event.clientY - dragStart.value.y,
      };
    });
  }
};

/**
 * 处理鼠标松开事件 - 结束拖拽操作
 *
 * @function handleMouseUp
 * @description
 * - 检查是否处于拖拽状态
 * - 重置拖拽状态
 * - 更新光标样式
 */
const handleMouseUp = () => {
  if (isDragging.value) {
    isDragging.value = false; // 重置拖拽状态
    updateCursor(); // 更新光标样式
  }
};

/**
 * 处理键盘按下事件 - 快捷键功能
 * 支持 Space 键拖拽和 Ctrl 键缩放
 *
 * @function handleKeyDown
 * @param {KeyboardEvent} event - 键盘按下事件对象
 * @description
 * - Space 键：启用拖拽模式，阻止默认滚动行为
 * - Ctrl 键：启用缩放模式
 * - 更新对应的键盘状态和光标样式
 */
const handleKeyDown = (event) => {
  if (event.code === "Space") {
    event.preventDefault(); // 阻止空格键的默认滚动行为
    if (!isSpacePressed.value) {
      isSpacePressed.value = true; // 设置 Space 键状态
      updateCursor(); // 更新光标样式
    }
  } else if (event.code === "ControlLeft" || event.code === "ControlRight") {
    if (!isCtrlPressed.value) {
      isCtrlPressed.value = true; // 设置 Ctrl 键状态
      updateCursor(); // 更新光标样式
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
  return (
    zoomScale.value === 1 &&
    mapPosition.value.x === 0 &&
    mapPosition.value.y === 0
  );
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

/**
 * 递归查找具有底图的父级节点
 * 用于在当前节点没有底图时，向上查找父级节点的底图
 *
 * @function findParentWithBaseImage
 * @param {Object} data - 当前数据节点
 * @param {Array} list - 树形数据列表
 * @returns {Object|null} 找到的父级节点或 null
 */
function findParentWithBaseImage(data, list) {
  if (!data?.parent_no || !list?.length) return null; // 检查参数有效性
  const valCol = mapJson.value?.map_filter_val_field; // 获取值字段配置
  if (!valCol) return null;

  // 遍历列表查找匹配的父级节点
  for (const item of list) {
    if (item[valCol] && item[valCol] === data.parent_no) {
      return item;
    }
    // 递归查找子节点
    if (item.children?.length) {
      const found = findParentWithBaseImage(data, item.children);
      if (found) return found;
    }
  }
  return null;
}

/**
 * 底图计算属性
 * 根据地图配置和当前选中状态，动态计算要显示的底图
 *
 * @computed baseImage
 * @returns {string} 底图图片路径
 * @description
 * 底图选择优先级：
 * 1. 建筑物视图的底图
 * 2. 当前选中项的底图（非叶子节点）
 * 3. 递归查找父级节点的底图
 * 4. 默认底图
 */
const baseImage = computed(() => {
  if (mapBaseSupplier.value !== "自定义底图") {
    return ""; // 非自定义底图时返回空
  }

  const baseImageCol = mapJson.value.map_base_col; // 底图字段配置
  if (!baseImageCol) {
    // 如果没有配置底图字段，检查楼层信息
    if (floorInfo.value?.[baseImageCol]) {
      return getImagePath(floorInfo.value[baseImageCol]);
    }
    return getImagePath(mapJson.value.base_image); // 返回默认底图
  }

  // 楼视图优先
  if (buildingInfo.value?.[baseImageCol]) {
    return getImagePath(buildingInfo.value[baseImageCol]);
  }

  // 检查当前选中项是否为叶子节点(没有子节点)
  if (selectedTreeData.value?.is_leaf !== "是") {
    // 检查当前选中项的底图
    if (selectedTreeData.value?.[baseImageCol]) {
      return getImagePath(selectedTreeData.value[baseImageCol]);
    }
  }

  // 递归查找父级节点的底图
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

/**
 * 地图相关状态变量
 */
const mapInstance = ref(null); // 地图实例对象
const mapId = ref(""); // 地图容器 ID
const iconJson = ref([]); // 地图图例配置数组
const markerInfo = ref({}); // 标记点信息对象

/**
 * 标记点和弹窗相关状态
 */
const markerList = ref([]); // 标记点列表
const activeMarker = ref({}); // 当前激活的标记点
const popoverPosition = ref({ x: 0, y: 0 }); // 弹窗位置坐标
const cardUnitJson = computed(() => mapJson.value.tips_card_unit_json); // 卡片单元配置
const currentMarkerElement = ref(null); // 当前标记点 DOM 元素引用

/**
 * 初始化腾讯地图
 * 动态加载腾讯地图 API 脚本并初始化地图实例
 *
 * @function initTencentMap
 * @description
 * - 动态创建并加载腾讯地图 API 脚本
 * - 生成唯一的地图容器 ID
 * - 延迟初始化地图实例和数据
 * - 处理地图标记点和图例数据
 */
function initTencentMap() {
  // 动态加载腾讯地图 API 脚本
  var script = document.createElement("script");
  script.type = "text/javascript";
  script.src =
    "https://map.qq.com/api/gljs?v=1.exp&key=G3VBZ-CKMKB-4CFUZ-JZLSE-676K6-J4FWP";
  document.head.appendChild(script);

  // 生成唯一的地图容器 ID
  mapId.value = generateMapID(props.pageItem?.com_no, "map-container");

  // 延迟初始化，确保脚本加载完成
  setTimeout(() => {
    nextTick(() => {
      // 初始化地图实例
      mapInstance.value = initMap(mapId.value, props.pageItem);
      // 初始化地图数据
      initMapData(mapInstance.value, props.pageItem).then((markerData) => {
        markerInfo.value = markerData;
        if (markerData.iconJson) {
          iconJson.value = markerData.iconJson; // 设置图例数据
        }
        // 预留：处理标记点数据
        // if(markerData?.center&&markerData?.markers){
        // }
      });
    });
  }, 1000);
}

/**
 * 初始化自定义地图数据
 * 根据配置获取自定义地图的标记点数据
 *
 * @async
 * @function initCustomMap
 * @returns {Promise<Array>} 标记点数据列表
 * @description
 * 支持两种数据来源：
 * - 请求数据：通过 API 获取实时数据
 * - 模拟数据：使用预设的模拟数据
 */
async function initCustomMap() {
  console.log("自定义底图"); // 调试日志
  let list = [];

  // 处理请求数据类型
  if (
    props.pageItem.srv_req_type === "请求数据" &&
    props.pageItem.srv_req_json
  ) {
    const reqJson = props.pageItem.srv_req_json;
    const req = props.pageItem.srv_req_json;
    const url = `/${reqJson.mapp}/select/${reqJson.serviceName}`;
    const res = await $selectList(url, req); // 发起 API 请求
    if (res.ok) {
      list = res.data; // 获取响应数据
    }
  }
  // 处理模拟数据类型
  else if (props.pageItem.srv_req_type === "模拟数据") {
    list = props.pageItem.mock_data_json; // 使用模拟数据
  }

  return list;
}

/**
 * 获取标记点图标
 * 根据配置和数据项获取对应的图标路径
 *
 * @function getItemIcon
 * @param {Object} item - 数据项对象，默认为空对象
 * @returns {string} 图标路径，如果没有配置则返回空字符串
 * @description
 * 图标获取优先级：
 * 1. 数据项中配置的自定义图标
 * 2. 地图配置中的默认图标
 * 3. 空字符串（无图标）
 */
function getItemIcon(item = {}) {
  // 优先使用数据项中的自定义图标
  if (mapJson.value?.marker_icon_col && item[mapJson.value?.marker_icon_col]) {
    return getImagePath(item[mapJson.value?.marker_icon_col]);
  }
  // 使用默认图标
  else if (mapJson.value?.icon_default) {
    return getImagePath(mapJson.value?.icon_default);
  }
  return ""; // 无图标时返回空字符串
}

/**
 * 获取标记点位置
 * 根据配置的坐标字段计算标记点在地图上的位置
 *
 * @function getItemPosition
 * @param {Object} item - 数据项对象，默认为空对象
 * @returns {Object} 位置对象，包含 left 和 top 属性（百分比值）
 * @description
 * - 使用百分比定位，便于响应式布局
 * - 支持 X 轴和 Y 轴坐标配置
 * - 默认位置为 (0, 0)
 */
function getItemPosition(item = {}) {
  let post = {
    left: 0,
    top: 0,
  };

  // 设置 X 轴位置（左右位置）
  if (mapJson.value?.x_col && item[mapJson.value?.x_col]) {
    post.left = item[mapJson.value?.x_col] + "%";
  }

  // 设置 Y 轴位置（上下位置）
  if (mapJson.value?.y_col && item[mapJson.value?.y_col]) {
    post.top = item[mapJson.value?.y_col] + "%";
  }

  return post;
}

/**
 * 标签样式计算属性
 * 当地图类型为标签时，格式化标签的样式配置
 *
 * @computed setLabelStyle
 * @returns {Object|undefined} 格式化后的样式对象
 */
const setLabelStyle = computed(() => {
  if (
    mapJson.value?.map_type === "标签" &&
    mapJson.value?.col_label_style_json
  ) {
    return formatStyleData(mapJson.value?.col_label_style_json);
  }
});

/**
 * 标签激活状态样式计算属性
 * 当地图类型为标签时，格式化标签激活状态的样式配置
 *
 * @computed setLabelActiveStyle
 * @returns {Object|undefined} 格式化后的激活样式对象
 */
const setLabelActiveStyle = computed(() => {
  if (
    mapJson.value?.map_type === "标签" &&
    mapJson.value?.label_active_style_json
  ) {
    return formatStyleData(mapJson.value?.label_active_style_json);
  }
});

/**
 * 计算弹窗位置
 * 根据标记点元素的位置计算弹窗的显示位置
 *
 * @function calculatePopoverPosition
 * @param {HTMLElement} element - 标记点 DOM 元素
 * @description
 * - 使用 getBoundingClientRect() 获取元素相对于视口的位置
 * - 弹窗使用 position: fixed 定位，相对于视口
 * - 考虑弹窗的 transform 偏移（translate(-50%, -100%)）
 * - 在元素上方居中显示弹窗
 */
function calculatePopoverPosition(element) {
  if (!element) return; // 检查元素是否存在

  // 由于popover使用position: fixed定位（相对于视口），
  // 我们需要获取元素相对于视口的准确位置
  const elementRect = element.getBoundingClientRect();

  // 计算popover的位置（相对于视口）
  // popover的transform是translate(-50%, -100%)，所以需要考虑这个偏移
  popoverPosition.value = {
    x: elementRect.left + elementRect.width / 2, // 水平居中
    y: elementRect.top - 10, // 在元素上方，留出10px间距
  };
}

// 注意：现在缩放和拖拽时直接隐藏popover，不再需要重新计算位置

/**
 * 标记点点击处理函数
 * 处理标记点的点击事件，显示或隐藏弹窗
 *
 * @function tapMarker
 * @param {Object} item - 标记点数据对象
 * @param {Event} event - 点击事件对象
 * @description
 * - 如果点击的是当前激活的标记点，则隐藏弹窗
 * - 如果点击的是其他标记点，则显示对应的弹窗
 * - 记录当前标记点元素引用，用于位置计算
 * - 添加窗口事件监听器，处理窗口变化
 */
function tapMarker(item, event) {
  // 如果点击的是当前激活的标记点，隐藏弹窗
  if (item?.id && item?.id === activeMarker.value?.id) {
    activeMarker.value = null;
    currentMarkerElement.value = null;
    removeEventListeners(); // 移除事件监听器
  } else {
    activeMarker.value = item; // 设置新的激活标记点
    // 记录点击位置和元素引用
    if (event) {
      console.log(event.currentTarget); // 调试日志
      const ele = event.currentTarget;
      currentMarkerElement.value = ele; // 保存元素引用
      calculatePopoverPosition(ele); // 计算弹窗位置
      addEventListeners(); // 添加事件监听器
    }
  }
}

/**
 * 关闭弹窗
 * 隐藏当前激活的标记点弹窗
 *
 * @function closePopup
 */
function closePopup() {
  activeMarker.value = null;
  currentMarkerElement.value = null;
  removeEventListeners(); // 移除事件监听器
  calculatePopoverPosition(); // 计算弹窗位置
}

/**
 * 窗口大小变化处理函数
 * 当窗口大小改变时，重新计算弹窗位置
 *
 * @function handleResize
 */
function handleResize() {
  if (currentMarkerElement.value && activeMarker.value?.id) {
    calculatePopoverPosition(currentMarkerElement.value);
  }
}

/**
 * 页面滚动处理函数
 * 当页面滚动时，重新计算弹窗位置
 *
 * @function handleScroll
 */
function handleScroll() {
  if (currentMarkerElement.value && activeMarker.value?.id) {
    calculatePopoverPosition(currentMarkerElement.value);
  }
}

/**
 * 添加窗口事件监听器
 * 监听窗口大小变化和滚动事件，确保弹窗位置正确
 *
 * @function addEventListeners
 */
function addEventListeners() {
  window.addEventListener("resize", handleResize); // 监听窗口大小变化
  window.addEventListener("scroll", handleScroll, true); // 监听滚动事件（捕获阶段）
}

/**
 * 移除窗口事件监听器
 * 清理事件监听器，防止内存泄漏
 *
 * @function removeEventListeners
 */
function removeEventListeners() {
  window.removeEventListener("resize", handleResize);
  window.removeEventListener("scroll", handleScroll, true);
}

/**
 * 树形数据相关状态
 */
const treeData = ref([]); // 树形数据列表
const selectedTreeData = ref({}); // 当前选中的树形数据项
const expandedNodes = ref({}); // 展开的节点状态映射

/**
 * 切换树形节点展开/折叠状态
 *
 * @function toggleExpand
 * @param {Object} item - 树形数据项
 */
function toggleExpand(item) {
  console.log("toggleExpand", item); // 调试日志
  if (!item || !item.id) return; // 检查参数有效性

  // 切换展开状态
  set(expandedNodes.value, item.id, !expandedNodes.value[item.id]);
  console.log("expandedNodes", expandedNodes.value); // 调试日志
}

/**
 * 获取树形数据项的显示标签
 * 根据配置字段获取数据项的显示文本
 *
 * @function getTreeItemLabel
 * @param {Object} item - 树形数据项
 * @returns {string} 显示标签文本
 */
function getTreeItemLabel(item) {
  // 优先使用配置的标签字段
  if (item?.[mapJson.value?.map_filter_label_field]) {
    return item[mapJson.value?.map_filter_label_field];
  }
  // 备用字段：area_name 或 name
  return item?.area_name || item?.name || "";
}

/**
 * 监听选中树形数据的变化
 * 当选中项变化时，更新标记点列表
 */
watch(
  () => selectedTreeData.value,
  (newVal) => {
    console.log(newVal); // 调试日志
    // 如果选中项有子节点且配置了坐标字段，过滤出有坐标的子项作为标记点
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

/**
 * 组件事件发射器
 */
const emit = defineEmits(["select"]);

/**
 * 树形数据项点击处理函数
 *
 * @function tapTreeData
 * @param {Object} item - 点击的树形数据项
 */
function tapTreeData(item) {
  selectedTreeData.value = item; // 设置选中项
  emit("select", item); // 发射选择事件
  // 切换展开状态
  if (item?.id) {
    set(expandedNodes.value, item.id, !expandedNodes.value[item.id]);
  }
}

/**
 * 初始化地图树形数据
 * 从服务器获取树形结构数据并初始化
 *
 * @async
 * @function initMapTreeData
 * @description
 * - 从 props 或地图配置中获取请求配置
 * - 发起 API 请求获取树形数据
 * - 设置默认选中第一个数据项
 */
async function initMapTreeData() {
  const req = props.treeReq || mapJson.value?.map_tree_req_json; // 获取请求配置
  if (!req) {
    console.log("没有配置请求"); // 调试日志
    return;
  }

  req.treeData = true; // 标记为树形数据请求
  const url = `/${req.mapp}/select/${req.serviceName}`;
  const res = await $selectList(url, req); // 发起 API 请求

  if (res.ok) {
    treeData.value = res.data; // 设置树形数据
    if (res.data.length) {
      selectedTreeData.value = res.data[0]; // 默认选中第一项
    }
  }
}

/**
 * 建筑物视图相关状态
 */
const isBuildingView = ref(false); // 是否为建筑物视图模式
const buildingInfo = ref({}); // 当前建筑物信息
const buildingTree = ref([]); // 建筑物树形数据
const floorInfo = ref(null); // 当前楼层信息
const expandedBuildingNodes = ref({}); // 建筑物节点展开状态

/**
 * 建筑物树形数据项点击处理函数
 *
 * @function tapBuildingTreeData
 * @param {Object} item - 点击的建筑物数据项
 */
function tapBuildingTreeData(item) {
  floorInfo.value = item; // 设置当前楼层信息
  // 切换展开状态
  if (item?.id) {
    set(
      expandedBuildingNodes.value,
      item.id,
      !expandedBuildingNodes.value[item.id]
    );
  }
  emit("select", item); // 发射选择事件
}

/**
 * 标记点点击处理函数（建筑物视图）
 * 检查是否需要切换到建筑物视图
 *
 * @function clickMarker
 * @param {Object} marker - 点击的标记点数据
 */
function clickMarker(marker) {
  // 检查是否配置了建筑物视图切换条件
  if (mapJson.value?.building_view_val && mapJson.value.building_view_col) {
    const val = marker[mapJson.value?.building_view_col]; // 获取标记点的建筑物视图字段值
    // 如果值匹配建筑物视图条件，切换到建筑物视图
    if (val && mapJson.value?.building_view_val?.includes(val)) {
      switchToBuildingView(marker);
    }
  }
}

/**
 * 切换到建筑物视图
 *
 * @function switchToBuildingView
 * @param {Object} marker - 建筑物标记点数据
 */
function switchToBuildingView(marker) {
  isBuildingView.value = true; // 启用建筑物视图模式
  buildingInfo.value = marker; // 设置建筑物信息
  buildingTree.value = getBuildingTree(marker); // 获取建筑物树形数据
  // 默认选中第一个楼层
  if (buildingTree.value?.length) {
    floorInfo.value = buildingTree.value[0];
  }
}

/**
 * 获取建筑物树形数据
 * 从标记点的子数据中筛选出建筑物相关数据
 *
 * @function getBuildingTree
 * @param {Object} marker - 建筑物标记点数据
 * @returns {Array} 建筑物树形数据列表
 */
function getBuildingTree(marker) {
  let list = marker?.children || []; // 获取子数据列表
  let res = [];

  // 筛选包含建筑物视图字段的数据项
  for (let i = 0; i < list.length; i++) {
    const item = list[i];
    if (item?.[mapJson.value?.building_view_col]) {
      res.push(item);
    }
  }

  return res;
}

/**
 * 获取建筑物标记点（预留函数）
 *
 * @function getBuildingMakers
 * @todo 实现建筑物标记点获取逻辑
 */
function getBuildingMakers() {
  // 预留函数，待实现
}

/**
 * 切换回标记点视图
 * 退出建筑物视图模式
 *
 * @function switchToMarkerView
 */
function switchToMarkerView() {
  isBuildingView.value = false; // 禁用建筑物视图模式
  buildingInfo.value = null; // 清空建筑物信息
}

/**
 * 组件挂载生命周期钩子
 * 初始化地图和添加全局事件监听器
 */
onMounted(() => {
  // 根据地图供应商类型实例化地图
  if (mapBaseSupplier.value === "腾讯地图") {
    initTencentMap(); // 初始化腾讯地图
  } else if (mapBaseSupplier.value === "自定义底图") {
    // 检查是否有树形数据配置
    if (props.treeReq || mapJson.value?.map_tree_req_json) {
      initMapTreeData(); // 初始化树形数据
    } else {
      // 初始化自定义地图数据
      initCustomMap().then((res) => {
        markerList.value = res;
      });
    }
  }

  // 添加全局事件监听器，处理地图交互
  document.addEventListener("mousemove", handleMouseMove); // 鼠标移动事件
  document.addEventListener("mouseup", handleMouseUp); // 鼠标松开事件
  document.addEventListener("keydown", handleKeyDown); // 键盘按下事件
  document.addEventListener("keyup", handleKeyUp); // 键盘松开事件
});

/**
 * 组件卸载生命周期钩子
 * 清理事件监听器和资源
 */
onUnmounted(() => {
  removeEventListeners(); // 移除弹窗相关事件监听器

  // 清理全局事件监听器，防止内存泄漏
  document.removeEventListener("mousemove", handleMouseMove);
  document.removeEventListener("mouseup", handleMouseUp);
  document.removeEventListener("keydown", handleKeyDown);
  document.removeEventListener("keyup", handleKeyUp);

  // 清理动画帧，防止内存泄漏
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }

  // 重置光标样式
  document.body.style.cursor = "";
});
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
  scrollbar-width: none;

  // 可视化编辑器画布背景 - 点状网格
  background-color: #f8f9fa;
  background-image: radial-gradient(
    circle at center,
    rgba(0, 0, 0, 0.15) 1px,
    transparent 1px
  );
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
