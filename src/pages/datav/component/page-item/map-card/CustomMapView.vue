<template>
  <!-- 自定义底图的地图容器 - 支持建筑物视图和普通视图 -->
  <div class="map-view-container">
    <!-- 建筑物视图的树形数据 -->
    <div
      class="building-tree-data map-tree-data"
      v-if="isBuildingView && buildingTree && buildingTree.length"
    >
      <div
        class="tree-data-item"
        v-for="item in buildingTree"
        :key="item.id"
      >
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

    <!-- 普通视图的侧边栏树形数据 -->
    <div
      class="map-left"
      :style="{
        '--left': left + 'px',
      }"
      :class="{ collapsed: isCollapsed }"
      v-else-if="!isBuildingView && treeData && treeData.length"
    >
      <div
        class="map-tree-data"
        v-if="treeData.length"
      >
        <div
          class="tree-data-item"
          v-for="item in treeData"
          :key="item.id"
        >
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
            <div
              class="tree-data-item-child"
              v-show="expandedNodes[item.id]"
            >
              <tree-data-item
                v-for="child in item.children"
                :key="child.id"
                :item="child"
                :selected="selectedTreeData"
                :level="1"
                :set-children-func="setChildren"
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
        <Icon
          icon="material-symbols:arrow-menu-close"
          class="icon"
        ></Icon>
      </div>
    </div>

    <!-- 自定义底图-地图视图区域 -->
    <zoom-drag-container
      ref="zoomDragContainerRef"
      :show-tips="true"
      :ignore-scale-classes="'map-marker'"
    >
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
          <template v-if="mapJson && mapJson.map_type === '标签' && markerList.length">
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
              @click="clickMarker(marker, $event)"
            >
              <div class="map-marker-content">
                {{ marker[mapJson.col_label] || "" }}
              </div>
            </div>
          </template>

          <!-- 图标类型的标记点 -->
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
        </template>
      </div>
    </zoom-drag-container>
    <multi-source-markers
      :map-json="mapJson"
      v-if="mapJson && mapJson.map_option && mapJson.map_option.includes('多来源标记物')"
      :marker-list.sync="markerList"
    ></multi-source-markers>
    <!-- 地图弹窗组件 -->
    <MapPopover
      :active-marker="activeMarker"
      :popover-position="popoverPosition"
      :page-item="pageItem"
      :card-unit-json="cardUnitJson"
      :is-building-view="isBuildingView"
      @close="closePopup"
    />
  </div>
</template>

<script setup>
/**
 * 自定义底图组件 - 支持建筑物视图和普通视图的交互式地图展示组件
 *
 * @component CustomMapView
 * @description
 * 自定义底图展示组件，支持以下特性：
 *
 * @features
 * - 🗺️ 自定义图片底图支持
 * - 🔍 地图缩放功能（Ctrl + 鼠标滚轮）
 * - 🖱️ 地图拖拽功能（Space + 鼠标拖拽）
 * - 📍 标记点展示和交互
 * - 🏢 建筑物视图和楼层切换
 * - 🌳 树形数据结构展示
 * - 💬 标记点弹窗详情展示
 * - 🎨 自定义样式和图标支持
 * - 📱 响应式设计
 *
 * @example
 * <custom-map-view
 *   :page-item="pageItemConfig"
 *   :tree-req="treeRequestConfig"
 * />
 */

import { onMounted, onUnmounted, ref, computed, watch, set } from "vue";

/**
 * 工具函数和组件导入
 */
import { getImagePath } from "@/common/http.js"; // 图片路径处理工具
import { $selectList } from "@/common/http"; // HTTP 请求工具
import cardGroupCell from "../card-group-cell/card-group-cell.vue"; // 卡片组单元格组件
import TreeDataItem from "../TreeDataItem.vue"; // 树形数据项组件
import { formatStyleData } from "../../../common"; // 样式数据格式化工具
import { Icon } from "@iconify/vue2"; // 图标组件
import cloneDeep from "lodash/cloneDeep";
import ZoomDragContainer from "@/components/common/ZoomDragContainer.vue"; // 缩放拖拽容器组件
import MultiSourceMarkers from "./MultiSourceMarkers.vue";
import MapPopover from "./MapPopover.vue"; // 地图弹窗组件
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
 * 组件事件发射器
 */
const emit = defineEmits(["select"]);

/**
 * 左侧面板折叠状态管理
 */
const isCollapsed = ref(false); // 是否折叠左侧面板
const left = computed(() =>
  isCollapsed.value ? -CONFIG.UI.SIDEBAR_WIDTH : CONFIG.UI.SIDEBAR_MARGIN
); // 计算左侧面板位置

/**
 * 切换左侧面板折叠状态
 * @function changeCollapsed
 */
const changeCollapsed = () => {
  isCollapsed.value = !isCollapsed.value;
};

/**
 * 组件配置常量
 */
const CONFIG = {
  // UI 配置
  UI: {
    SIDEBAR_WIDTH: 230, // 侧边栏宽度
    SIDEBAR_MARGIN: 15, // 侧边栏边距
    POPUP_OFFSET: 10, // 弹窗偏移距离
  },
  // 性能优化配置
  PERFORMANCE: {
    DEBOUNCE_DELAY: 100, // 防抖延迟时间（毫秒）
  },
};

/**
 * 地图配置计算属性
 */
const mapJson = computed(() => {
  return props.pageItem.map_json || {};
});

/**
 * 标记点和弹窗相关状态
 */
const markerList = ref([]); // 标记点列表
const activeMarker = ref({}); // 当前激活的标记点
const popoverPosition = ref({ x: 0, y: 0 }); // 弹窗位置坐标
const cardUnitJson = computed(() => mapJson.value.tips_card_unit_json); // 卡片单元配置
const currentMarkerElement = ref(null); // 当前标记点 DOM 元素引用

/**
 * 树形数据相关状态
 */
const treeData = ref([]); // 树形数据列表
const selectedTreeData = ref({}); // 当前选中的树形数据项
const expandedNodes = ref({}); // 展开的节点状态映射

/**
 * 建筑物视图相关状态
 */
const isBuildingView = ref(false); // 是否为建筑物视图模式
const buildingInfo = ref({}); // 当前建筑物信息
const buildingTree = ref([]); // 建筑物树形数据
const floorInfo = ref(null); // 当前楼层信息
const expandedBuildingNodes = ref({}); // 建筑物节点展开状态

/**
 * 缩放容器相关状态
 */
const zoomDragContainerRef = ref(null); // ZoomDragContainer组件引用

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
 * 判断标记点是否激活
 */
function isActive(marker) {
  if (selectedTreeData.value && marker?.id) {
    return selectedTreeData.value?.id === marker.id;
  }
  return false;
}

/**
 * 初始化自定义地图数据
 * 根据配置获取自定义地图的标记点数据
 *
 * @async
 * @function initCustomMap
 * @returns {Promise<Array>} 标记点数据列表
 */
async function initCustomMap() {
  console.log("自定义底图初始化开始");
  let list = [];
  try {
    // 处理请求数据类型
    if (
      props.pageItem.srv_req_type === "请求数据" &&
      props.pageItem.srv_req_json
    ) {
      const reqJson = props.pageItem.srv_req_json;
      const req = props.pageItem.srv_req_json;
      const url = `/${reqJson.mapp}/select/${reqJson.serviceName}`;

      console.log("发起API请求:", url, req);
      const res = await $selectList(url, req); // 发起 API 请求

      if (res.ok) {
        list = res.data || []; // 获取响应数据，确保返回数组
        console.log("API请求成功，获取数据:", list.length, "条");
      } else {
        console.warn("API请求失败:", res.message || "未知错误");
        list = []; // 请求失败时返回空数组
      }
    }
    // 处理模拟数据类型
    else if (props.pageItem.srv_req_type === "模拟数据") {
      list = props.pageItem.mock_data_json || []; // 使用模拟数据，确保返回数组
      console.log("使用模拟数据:", list.length, "条");
    } else {
      console.warn("未配置有效的数据源类型:", props.pageItem.srv_req_type);
    }
  } catch (error) {
    console.error("初始化自定义地图数据失败:", error);
    list = []; // 发生错误时返回空数组
  }

  console.log("自定义底图初始化完成，返回数据:", list.length, "条");
  return list;
}

/**
 * 获取标记点图标
 * 根据配置和数据项获取对应的图标路径
 *
 * @function getItemIcon
 * @param {Object} item - 数据项对象，默认为空对象
 * @returns {string} 图标路径，如果没有配置则返回空字符串
 */
function getItemIcon(item = {}) {
  // 参数类型检查
  if (!item || typeof item !== "object") {
    console.warn("getItemIcon: 无效的item参数", item);
    item = {};
  }
  if (item?.col_map?.customized_icon) {
    // 自定义图标
    return getImagePath(item[item.col_map.customized_icon])
  } else if (item?._poi_info?.poi_type_icon) {
    // 默认图标
    return getImagePath(item._poi_info.poi_type_icon)
  } else if (item?._poi_info?.icon) {
    // 默认图标
    return getImagePath(item._poi_info.icon)
  }

  const mapConfig = mapJson.value;
  if (!mapConfig) {
    console.warn("getItemIcon: 地图配置不存在");
    return "";
  }

  try {
    // 优先使用数据项中的自定义图标
    const iconCol = mapConfig.marker_icon_col;
    if (iconCol && item[iconCol]) {
      return getImagePath(item[iconCol]);
    }

    // 使用默认图标
    if (mapConfig.icon_default) {
      return getImagePath(mapConfig.icon_default);
    }
  } catch (error) {
    console.error("getItemIcon: 获取图标路径失败", error);
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
 */
function getItemPosition(item = {}) {
  let pos = {
    left: 0,
    top: 0,
  };
  if (mapJson.value?.x_col && mapJson.value?.y_col) {
    // 设置 X 轴位置（左右位置）
    if (item[mapJson.value?.x_col]) {
      pos.left = item[mapJson.value?.x_col] + "%";
    }
    // 设置 Y 轴位置（上下位置）
    if (item[mapJson.value?.y_col]) {
      pos.top = item[mapJson.value?.y_col] + "%";
    }
  } else if (item?._col_map) {
    const { col_label, col_no, col_x, col_x_width, col_y, col_y_width, customized_icon } = item._col_map || {}
    pos.label = item[col_label]
    pos.left = item[col_x] + "%";
    pos.top = item[col_y] + "%";
    pos.width = (col_x_width || 30) + 'px';
    pos.height = (col_y_width || 30) + 'px';
    pos.icon = customized_icon
    pos.value = item[col_no]
  }

  return pos;
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
 * 获取弹窗实际尺寸
 * 通过查询DOM元素获取弹窗的实际宽高
 *
 * @function getPopoverDimensions
 * @returns {Object} 包含width和height的对象
 */
function getPopoverDimensions() {
  const popoverElement = document.querySelector('.popover-content-to-body .popover-content');

  if (popoverElement) {
    const rect = popoverElement.getBoundingClientRect();
    return {
      width: rect.width || 300, // 如果获取失败，使用默认值
      height: rect.height || 200
    };
  }

  // 如果无法获取实际尺寸，返回估算值
  return {
    width: 300,
    height: 200
  };
}

/**
 * 计算弹窗位置
 * 根据标记点元素的位置计算弹窗的显示位置，智能检测视口边界并调整位置和箭头方向
 *
 * @function calculatePopoverPosition
 * @param {HTMLElement} element - 标记点 DOM 元素
 */
function calculatePopoverPosition(element) {
  if (!element) return; // 检查元素是否存在

  // 获取元素相对于视口的位置
  const elementRect = element.getBoundingClientRect();

  // 获取视口尺寸
  const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

  // 获取弹窗实际尺寸或使用估算值
  const popoverDimensions = getPopoverDimensions();
  const popoverWidth = popoverDimensions.width;
  const popoverHeight = popoverDimensions.height;
  const padding = 50; // 距离视口边缘的最小间距

  // 标记点中心位置
  const markerCenterX = elementRect.left + elementRect.width / 2;
  const markerCenterY = elementRect.top + elementRect.height / 2;

  // 计算初始位置（默认在元素上方居中）
  let x = markerCenterX;
  let y = elementRect.top - CONFIG.UI.POPUP_OFFSET;

  // 水平位置调整
  const popoverLeft = x - popoverWidth / 2;
  const popoverRight = x + popoverWidth / 2;

  if (popoverLeft < padding) {
    // 左边界溢出，调整弹窗到左对齐
    x = padding + popoverWidth / 2;
  } else if (popoverRight > viewportWidth - padding) {
    // 右边界溢出，调整弹窗到右对齐
    x = viewportWidth - padding - popoverWidth / 2;
  }

  // 垂直位置调整
  const popoverTop = y - popoverHeight; // 考虑transform: translate(-50%, -100%)
  const popoverBottom = y;

  if (popoverTop < padding) {
    // 上边界溢出，将弹窗显示在元素下方
    y = elementRect.bottom + CONFIG.UI.POPUP_OFFSET + popoverHeight;

    // 检查下方是否也会溢出
    if (y > viewportHeight - padding) {
      // 上下都会溢出，选择空间较大的一侧
      const spaceAbove = elementRect.top;
      const spaceBelow = viewportHeight - elementRect.bottom;

      if (spaceAbove > spaceBelow) {
        // 上方空间更大，显示在上方但调整位置
        y = Math.max(padding + popoverHeight, elementRect.top - CONFIG.UI.POPUP_OFFSET);
      } else {
        // 下方空间更大，显示在下方但调整位置
        y = Math.min(viewportHeight - padding, elementRect.bottom + CONFIG.UI.POPUP_OFFSET + popoverHeight);
      }
    }
  } else if (popoverBottom > viewportHeight - padding) {
    // 下边界溢出（这种情况在默认上方显示时不太可能发生，但为了完整性保留）
    y = viewportHeight - padding;
  }

  // 更新弹窗位置（移除箭头相关属性）
  popoverPosition.value = { x, y };

  // 可选：添加调试信息
  console.log('弹窗位置计算:', {
    element: { x: elementRect.left, y: elementRect.top, width: elementRect.width, height: elementRect.height },
    marker: { centerX: markerCenterX, centerY: markerCenterY },
    viewport: { width: viewportWidth, height: viewportHeight },
    popover: { x, y, width: popoverWidth, height: popoverHeight },
    adjustments: {
      horizontalOverflow: popoverLeft < padding || popoverRight > viewportWidth - padding,
      verticalOverflow: popoverTop < padding || popoverBottom > viewportHeight - padding
    }
  });
}

/**
 * 标记点点击处理函数
 * 处理标记点的点击事件，显示或隐藏弹窗
 *
 * @function tapMarker
 * @param {Object} item - 标记点数据对象
 * @param {Event} event - 点击事件对象
 */
function tapMarker(item, event) {
  console.log('点击标记点', item, mapJson.value.onclick);

  if (mapJson.value.tips_card_unit_json && mapJson.value.onclick === '弹出卡片') {
    // 如果点击的是当前激活的标记点，隐藏弹窗
    if (item?.id && item?.id === activeMarker.value?.id) {
      activeMarker.value = null;
      currentMarkerElement.value = null;
      removeEventListeners(); // 移除事件监听器
    } else {
      activeMarker.value = item; // 设置新的激活标记点
      // 记录点击位置和元素引用
      if (event) {
        console.log(event.currentTarget);
        const ele = event.currentTarget;
        currentMarkerElement.value = ele; // 保存元素引用
        calculatePopoverPosition(ele); // 初始位置计算
        addEventListeners(); // 添加事件监听器

        // 延迟重新计算位置，确保弹窗内容已渲染
        setTimeout(() => {
          if (currentMarkerElement.value && activeMarker.value?.id) {
            calculatePopoverPosition(currentMarkerElement.value);
          }
        }, 100); // 100ms延迟，可根据实际情况调整

        // 再次延迟计算，处理可能的异步内容加载
        setTimeout(() => {
          if (currentMarkerElement.value && activeMarker.value?.id) {
            calculatePopoverPosition(currentMarkerElement.value);
          }
        }, 300); // 300ms延迟，处理异步内容
      }
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
 * 防抖延迟时间（毫秒）
 */
const DEBOUNCE_DELAY = CONFIG.PERFORMANCE.DEBOUNCE_DELAY;

/**
 * 防抖定时器引用
 */
let debounceTimer = null;

/**
 * 视口变化处理函数（防抖优化版本）
 * 当窗口大小变化或页面滚动时，检查标记点是否在可视区域内
 * 如果在可视区域内则重新计算弹窗位置，否则关闭弹窗
 *
 * @function handleViewportChange
 */
function handleViewportChange() {
  // 清除之前的防抖定时器
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  // 设置新的防抖定时器
  debounceTimer = setTimeout(() => {
    // 检查是否有激活的标记点和对应的DOM元素
    if (currentMarkerElement.value && activeMarker.value?.id) {
      // 检查标记点元素是否在可视区域内
      if (isElementInViewport(currentMarkerElement.value)) {
        // 在可视区域内，重新计算弹窗位置
        calculatePopoverPosition(currentMarkerElement.value);
      } else {
        // 不在可视区域内，关闭弹窗
        closePopup();
      }
    }
  }, DEBOUNCE_DELAY);
}

/**
 * 检查元素是否在可视区域内
 *
 * @function isElementInViewport
 * @param {HTMLElement} element - 要检查的DOM元素
 * @returns {boolean} 元素是否在可视区域内
 */
function isElementInViewport(element) {
  if (!element) return false;

  const rect = element.getBoundingClientRect();
  const windowHeight =
    window.innerHeight || document.documentElement.clientHeight;
  const windowWidth = window.innerWidth || document.documentElement.clientWidth;

  // 检查元素是否完全在视口外
  return (
    rect.top < windowHeight &&
    rect.bottom > 0 &&
    rect.left < windowWidth &&
    rect.right > 0
  );
}

/**
 * 添加窗口事件监听器
 * 监听窗口大小变化和滚动事件，智能管理弹窗显示状态
 *
 * @function addEventListeners
 */
function addEventListeners() {
  window.addEventListener("resize", handleViewportChange); // 监听窗口大小变化
  window.addEventListener("scroll", handleViewportChange, true); // 监听滚动事件（捕获阶段）
}

/**
 * 移除窗口事件监听器
 * 清理事件监听器，防止内存泄漏
 *
 * @function removeEventListeners
 */
function removeEventListeners() {
  window.removeEventListener("resize", handleViewportChange);
  window.removeEventListener("scroll", handleViewportChange, true);
}

/**
 * 切换树形节点展开/折叠状态
 *
 * @function toggleExpand
 * @param {Object} item - 树形数据项
 */
async function toggleExpand(item) {
  console.log("toggleExpand", item);
  if (!item || !item.id) return; // 检查参数有效性
  await setChildren(item);

  // 切换展开状态
  set(expandedNodes.value, item.id, !expandedNodes.value[item.id]);

  console.log("expandedNodes", expandedNodes.value);
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
    console.log(newVal);
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

/**
 * 树形数据项点击处理函数
 *
 * @function tapTreeData
 * @param {Object} item - 点击的树形数据项
 */
async function tapTreeData(item) {
  await setChildren(item);
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
 */
async function initMapTreeData() {
  const req = setTreeReq.value; // 获取请求配置
  if (!req) {
    console.log("没有配置请求");
    return;
  }

  // req.treeData = true; // 标记为树形数据请求
  const url = `/${req.mapp}/select/${req.serviceName}`;
  const res = await $selectList(url, req); // 发起 API 请求

  if (res.ok) {
    if (res.data.length) {
      await setChildren(res.data[0]);
      selectedTreeData.value = res.data[0]; // 默认选中第一项
    }
    treeData.value = res.data;
  }
}

async function getChildrenData(parent_no) {
  const req = cloneDeep(props.treeReq || mapJson.value?.map_tree_req_json); // 获取请求配置
  if (!req) {
    console.log("没有配置请求");
    return;
  }
  if (!parent_no) {
    return;
  }

  if (!req.condition) {
    req.condition = [];
  }
  let condition = req.condition.filter((item) => item.colName !== "parent_no");
  req.condition = [
    ...condition,
    {
      colName: "parent_no",
      ruleType: "eq",
      value: parent_no,
    },
  ];
  const url = `/${req.mapp}/select/${req.serviceName}`;
  const res = await $selectList(url, req);
  if (res.ok) {
    return res.data;
  } else if (res.msg) {
    // ElMessage.error(res.msg);
  }
  return [];
}

async function setChildren(item) {
  const noCol = mapJson.value?.["map_filter_val_field"];
  if (item.is_leaf !== "是" && !item.children?.length) {
    const children = await getChildrenData(item[noCol]);
    set(item, "children", children);
  }
  return item;
}

/**
 * 建筑物树形数据项点击处理函数
 *
 * @function tapBuildingTreeData
 * @param {Object} item - 点击的建筑物数据项
 */
async function tapBuildingTreeData(item) {
  await setChildren(item);

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
 * 标记点点击处理函数（标签类型和建筑物视图）
 * 处理标签类型标记点的弹窗显示和建筑物视图切换
 *
 * @function clickMarker
 * @param {Object} marker - 点击的标记点数据
 * @param {Event} event - 点击事件对象（可选）
 */
function clickMarker(marker, event) {
  // 检查是否配置了建筑物视图切换条件
  if (mapJson.value?.building_view_val && mapJson.value.building_view_col) {
    const val = marker[mapJson.value?.building_view_col]; // 获取标记点的建筑物视图字段值
    // 如果值匹配建筑物视图条件，切换到建筑物视图
    if (val && mapJson.value?.building_view_val?.includes(val)) {
      switchToBuildingView(marker);
      return; // 切换到建筑物视图后直接返回
    }
  }

  // 处理标签类型标记点的弹窗显示（如果配置了弹窗）
  if (cardUnitJson.value && marker) {
    // 如果点击的是当前激活的标记点，隐藏弹窗
    if (marker?.id && marker?.id === activeMarker.value?.id) {
      activeMarker.value = null;
      currentMarkerElement.value = null;
      removeEventListeners(); // 移除事件监听器
    } else {
      activeMarker.value = marker; // 设置新的激活标记点

      // 如果有事件对象，记录点击位置和元素引用
      if (event && event.currentTarget) {
        const ele = event.currentTarget;
        currentMarkerElement.value = ele; // 保存元素引用
        calculatePopoverPosition(ele); // 初始位置计算
        addEventListeners(); // 添加事件监听器

        // 延迟重新计算位置，确保弹窗内容已渲染
        setTimeout(() => {
          if (currentMarkerElement.value && activeMarker.value?.id) {
            calculatePopoverPosition(currentMarkerElement.value);
          }
        }, 100); // 100ms延迟，可根据实际情况调整

        // 再次延迟计算，处理可能的异步内容加载
        setTimeout(() => {
          if (currentMarkerElement.value && activeMarker.value?.id) {
            calculatePopoverPosition(currentMarkerElement.value);
          }
        }, 300); // 300ms延迟，处理异步内容
      }
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

const setTreeReq = computed(() => {
  let result = false;
  if (props.treeReq?.serviceName) {
    result = props.treeReq;
  } else if (mapJson.value?.map_tree_req_json?.serviceName) {
    result = mapJson.value?.map_tree_req_json;
  }
  return result;
});

/**
 * 组件挂载生命周期钩子
 * 初始化地图
 */
onMounted(() => {
  // 检查是否有树形数据配置
  if (setTreeReq.value) {
    initMapTreeData(); // 初始化树形数据
  } else {
    // 初始化自定义地图数据
    initCustomMap().then((res) => {
      markerList.value = res;
    });
  }
});

/**
 * 组件卸载生命周期钩子
 * 清理事件监听器和定时器，防止内存泄漏
 */
onUnmounted(() => {
  removeEventListeners(); // 移除弹窗相关事件监听器

  // 清理防抖定时器
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
});
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
        background: linear-gradient(151.99deg,
            rgba(0, 122, 255, 1) 29.59%,
            rgba(4, 71, 171, 1) 294.82%);
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

.custom-map {
  background-color: rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  position: relative;
  width: 100%;
  height: 100%;

  .map-marker {
    position: absolute;
    transform: translate(-50%, -50%);


    &.cursor-pointer {
      cursor: pointer;

      &:hover {
        transform: translate(-50%, -50%) scale(1.1);
        z-index: 20;
      }

      &:active {
        transform: translate(-50%, -50%) scale(0.95);
      }
    }

    .marker-icon {
      width: 30px;
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

/* 移除旧的箭头样式 */
:global(.popover-content-to-body .bottom-arrow) {
  display: none;
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
</style>