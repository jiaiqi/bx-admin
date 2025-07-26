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
    <MapTreeSidebar
      v-if="!isBuildingView"
      :tree-data="treeData"
      :selected-tree-data="selectedTreeData"
      :expanded-nodes="expandedNodes"
      :is-collapsed="isCollapsed"
      :map-json="mapJson"
      :set-children="setChildren"
      @tree-data-click="tapTreeData"
      @toggle-expand="toggleExpand"
      @toggle-collapsed="changeCollapsed"
    />

    <!-- 自定义底图-地图视图区域 -->
    <zoom-drag-container
      :show-tips="true"
      :ignore-scale-classes="'map-marker'"
    >
      <div
        class="map-view base-image"
        :class="{
          'building-view': isBuildingView,
          'custom-map': !isBuildingView,
          'image-loading': imageLoading,
          'image-loaded': imageLoaded,
        }"
        :style="{
          backgroundImage: `url(${currentImageSrc})`,
        }"
      >
        <!-- 图片加载动画 -->
        <div
          class="image-loading-overlay"
          v-if="imageLoading"
        >
          <div class="loading-spinner">
            <div class="spinner-ring"></div>
            <div class="spinner-ring"></div>
            <div class="spinner-ring"></div>
            <div class="loading-text">底图加载中...</div>
          </div>
        </div>

        <!-- 建筑物视图内容 -->
        <template v-if="isBuildingView">
          <!-- building-view 的标记点内容可以在这里添加 -->
        </template>

        <!-- 普通视图的标记点内容 -->
        <template v-else>
          <!-- 标签类型的标记点 -->
          <template v-if="!mapJson.multi_src_poi_json && mapJson && mapJson.map_type === '标签' && markerList.length">
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
              @click="handleMarkerClick(marker, $event)"
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
              @click.stop="handleMarkerClick(item, $event)"
              :class="{ 'cursor-pointer': allowClick(item) }"
              v-for="item in markerList"
              :title="getMarkerTitle(item)"
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

    <!-- 地图切换记录 - 面包屑导航 -->
    <MapBreadcrumb
      :breadcrumb-items="finallyMapUndoRedo"
      @breadcrumb-click="handleMapJsonChange"
    />


    <!-- 使用多标记物配置加载标记物数据 -->
    <multi-source-markers
      :map-json="mapJson"
      :source-json="mapJson.multi_src_poi_json"
      :marker-list.sync="markerList"
      v-if="mapJson && mapJson.map_option && mapJson.map_option.includes('多来源标记物') && mapJson.multi_src_poi_json"
    ></multi-source-markers>

    <!-- 地图标记点弹窗 -->
    <map-popover
      :active-marker="activeMarker"
      :marker-element="activeMarkerElement"
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

import { onMounted, ref, computed, watch, set } from "vue";

/**
 * 工具函数和组件导入
 */
import { $http, getImagePath } from "@/common/http.js"; // 图片路径处理工具
import { $selectList } from "@/common/http"; // HTTP 请求工具
import TreeDataItem from "../TreeDataItem.vue"; // 树形数据项组件
import { formatStyleData } from "../../../common"; // 样式数据格式化工具
import cloneDeep from "lodash/cloneDeep";
import ZoomDragContainer from "@/components/common/ZoomDragContainer.vue"; // 缩放拖拽容器组件
import MultiSourceMarkers from "./MultiSourceMarkers.vue";
import MapPopover from "./MapPopover.vue"; // 地图弹窗组件
import MapTreeSidebar from "./MapTreeSidebar.vue"; // 地图树形侧边栏组件
import MapBreadcrumb from "./MapBreadcrumb.vue"; // 地图面包屑导航组件
import { useUtils } from "@/common/vueApi";

import { useMarkers } from "./composables/useMarkers";

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

const emit = defineEmits(["select"]);

/**
 * 左侧面板折叠状态管理
 */
const isCollapsed = ref(false); // 是否折叠左侧面板

/**
 * 切换左侧面板折叠状态
 * @function changeCollapsed
 */
const changeCollapsed = () => {
  isCollapsed.value = !isCollapsed.value;
};


const mapUndoRedo = ref([])
const finallyMapUndoRedo = computed(() => {
  let result = []
  if (Array.isArray(mapUndoRedo.value)) {
    result = [...mapUndoRedo.value]
  }
  return result
})

/**
 * 地图配置
 */
const mapJson = ref(null)
if (props.pageItem.map_json) {
  mapJson.value = props.pageItem.map_json
}

const { getItemPosition, getItemIcon, isActive, setLabelActiveStyle, setLabelStyle } = useMarkers(props, mapJson)


const baseIamgeByReq = ref("")


function handleMapJsonChange(item, index) {
  if (index) {
    mapUndoRedo.value.splice(index, 1)
  } else if (index === 0) {
    mapUndoRedo.value = []
  }
  if (item.config) {
    getMapBaseImage(item.config.drill_down['jump_map_json'], item.config, item.data)
  }
  resetMapState()
  mapJson.value = cloneDeep(item.map_json)
  initComponents()
}

/**
 * 标记点和弹窗相关状态
 */
const markerList = ref([]); // 标记点列表
const activeMarker = ref({}); // 当前激活的标记点
const activeMarkerElement = ref(null); // 当前激活标记点的 DOM 元素引用
const cardUnitJson = computed(() => mapJson.value.tips_card_unit_json); // 卡片单元配置

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
 * 图片加载状态管理
 */
const imageLoading = ref(false); // 图片是否正在加载
const imageLoaded = ref(true); // 图片是否已加载完成
const currentImageSrc = ref(''); // 当前显示的图片路径

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
  if (baseIamgeByReq.value) {
    return getImagePath(baseIamgeByReq.value)
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
  // if (selectedTreeData.value?.is_leaf !== "是") {
  // 检查当前选中项的底图
  if (selectedTreeData.value?.[baseImageCol]) {
    return getImagePath(selectedTreeData.value[baseImageCol]);
  }
  // }

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
 * 预加载图片并处理过渡效果
 * @param {string} imageSrc - 图片路径
 * @returns {Promise} 图片加载Promise
 */
function preloadImage(imageSrc) {
  return new Promise((resolve, reject) => {
    if (!imageSrc) {
      resolve();
      return;
    }

    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${imageSrc}`));
    img.src = imageSrc;
  });
}

/**
 * 处理图片切换的平滑过渡
 * @param {string} newImageSrc - 新的图片路径
 */
async function handleImageTransition(newImageSrc) {
  // 如果新图片路径与当前相同，不需要切换
  if (newImageSrc === currentImageSrc.value) {
    return;
  }

  try {
    // 设置加载状态
    imageLoading.value = true;

    // 预加载新图片
    await preloadImage(newImageSrc);

    // 图片加载完成后，开始过渡
    imageLoaded.value = false;

    // 短暂延迟后切换图片并显示
    setTimeout(() => {
      currentImageSrc.value = newImageSrc;
      imageLoaded.value = true;
      imageLoading.value = false;
    }, 150); // 150ms的淡出时间

  } catch (error) {
    console.warn('图片加载失败:', error);
    // 即使加载失败也要更新状态
    currentImageSrc.value = newImageSrc;
    imageLoaded.value = true;
    imageLoading.value = false;
  }
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


function allowClick(marker) {
  if (marker?._poi_info?.onclick) {
    return true
  } else if (marker && cardUnitJson.value && mapJson.value.onclick === '弹出卡片') {
    return true
  }
}

/**
 * 统一的标记点点击处理函数
 * 处理所有类型标记点的点击事件，包括弹窗显示和建筑物视图切换
 *
 * @function handleMarkerClick
 * @param {Object} marker - 标记点数据对象
 * @param {Event} event - 点击事件对象
 */
function handleMarkerClick(marker, event) {
  console.log('点击标记点', marker, mapJson.value.onclick);
  if (marker?._poi_info?.onclick) {
    // 多标记物点击事件处理
    switch (marker._poi_info.onclick) {
      case '弹出卡片':

        break;
      case '跳转':

        break;

      case '下钻':
        drillDown(marker._poi_info, marker)
        break;
      case '设置变量':

        break;
    }
    return
  } else if (mapJson.value?.building_view_val && mapJson.value.building_view_col) {
    // 检查是否配置了建筑物视图切换条件
    const val = marker[mapJson.value?.building_view_col]; // 获取标记点的建筑物视图字段值
    // 如果值匹配建筑物视图条件，切换到建筑物视图
    if (val && mapJson.value?.building_view_val?.includes(val)) {
      switchToBuildingView(marker);
      return; // 切换到建筑物视图后直接返回
    }
  } else if (marker && cardUnitJson.value) {
    // 检查是否需要显示弹窗
    const shouldShowPopover = mapJson.value.onclick === '弹出卡片';
    if (shouldShowPopover) {
      // 如果点击的是当前激活的标记点，隐藏弹窗
      if (marker?.id && marker?.id === activeMarker.value?.id) {
        activeMarker.value = null;
        activeMarkerElement.value = null;
      } else {
        activeMarker.value = marker; // 设置新的激活标记点
        // 记录标记点元素引用
        if (event && event.currentTarget) {
          console.log('标记点元素:', event.currentTarget);
          activeMarkerElement.value = event.currentTarget; // 保存元素引用
        }
      }
    }
  }


}

async function getMapBaseImage(map_json, config, data = {}) {
  if (map_json?.image_source_type === '接口请求') {
    // 底图从接口请求查找
    if (map_json.base_image_srv_req_json) {
      if (config?.col_map?.col_no) {
        data.noVal = data[config.col_map.col_no]
      }
      const baseImageData = await getMapBaseImageWithReq(map_json.base_image_srv_req_json, data)
      if (map_json?.map_base_col) {
        const baseImageNo = baseImageData[map_json.map_base_col]
        baseIamgeByReq.value = baseImageNo
      }
    }
  }
}

/**
 * 地图下钻
 * @param params 
 */
async function drillDown(config, data) {
  const { drill_down } = config
  if (drill_down['jump_map_json']) {
    if (!mapUndoRedo.value.length) {
      // 下钻前先保存原始地图配置
      mapUndoRedo.value.push({
        map_json: cloneDeep(mapJson.value),
        markerList: cloneDeep(markerList.value),
      })
    }

    handleMapJsonChange({
      map_json: drill_down['jump_map_json']
    })
    getMapBaseImage(drill_down['jump_map_json'], config, data)
    // 下钻后保存新地图配置
    mapUndoRedo.value.push({
      map_json: cloneDeep(drill_down['jump_map_json']),
      data: data,
      config: config,
    })
  }
}
const { renderStr } = useUtils()
async function getMapBaseImageWithReq(reqJson, data) {
  let req = {}
  if (reqJson) {
    req = { ...reqJson }
    if (Array.isArray(reqJson?.condition) && reqJson.condition.length) {
      req.condition = reqJson.condition.map(item => {
        return {
          ...item,
          value: renderStr(item.value, data)
        }
      })
    }
    const url = `${req.mapp}/select/${req.serviceName}`
    const res = await $http.post(url, req)
    if (res.data.data?.length) {
      const baseImageInfo = res.data.data[0]
      return baseImageInfo
    }
  }
}


function getMarkerTitle(marker) {
  if (marker?._col_map?.col_label) {
    return marker[marker._col_map.col_label]
  }
}

/**
 * 重置地图状态
 * 重置地图配置、标记点列表、激活标记点等状态
 *
 * @function resetMapState
 */
async function resetMapState() {
  isCollapsed.value = false;
  mapJson.value = null
  markerList.value = []
  activeMarker.value = null
  activeMarkerElement.value = null

  treeData.value = []
  selectedTreeData.value = null
  expandedNodes.value = {}

  isBuildingView.value = false;
  buildingInfo.value = null
  buildingTree.value = []
  floorInfo.value = null
  expandedBuildingNodes.value = {}

  imageLoading.value = false;
  imageLoaded.value = true;
  currentImageSrc.value = ""
  baseIamgeByReq.value = ""
}

/**
 * 关闭弹窗
 * 隐藏当前激活的标记点弹窗
 *
 * @function closePopup
 */
function closePopup() {
  activeMarker.value = null;
  activeMarkerElement.value = null;
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
    if (mapJson.value?.map_option?.includes('多来源标记物')) {

    } else if (
      newVal?.children?.length &&
      mapJson.value?.x_col &&
      mapJson.value?.y_col
    ) {
      markerList.value = newVal.children.filter(
        (item) => item[mapJson.value?.x_col] && item[mapJson.value?.y_col]
      ).map(item => {
        return {
          ...item,
          _type: '标签'
        }
      })
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
 * 监听baseImage变化，触发平滑过渡
 */
watch(
  () => baseImage.value,
  (newImageSrc) => {
    handleImageTransition(newImageSrc);
  },
  { immediate: true }
);


function initComponents() {
  // 检查是否有树形数据配置
  if (setTreeReq.value) {
    initMapTreeData(); // 初始化树形数据
  } else {
    // 初始化自定义地图数据
    initCustomMap().then((res) => {
      markerList.value = res;
    });
  }
}

/**
 * 组件挂载生命周期钩子
 * 初始化地图
 */
onMounted(() => {
  initComponents();
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
  transition: opacity 0.3s ease-in-out;
  opacity: 1;

  /* 图片加载状态样式 */
  &.image-loading {
    opacity: 0.7;
    backdrop-filter: blur(20px);
  }

  &.image-loaded {
    opacity: 1;
  }

  /* 图片切换时的过渡效果 */
  &:not(.image-loaded) {
    backdrop-filter: blur(20px);
  }
}

/* 图片加载动画样式 */
.image-loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease-in-out;
}

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.spinner-ring {
  width: 40px;
  height: 40px;
  border: 3px solid transparent;
  border-top: 3px solid #007aff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  position: absolute;
}

.spinner-ring:nth-child(1) {
  width: 40px;
  height: 40px;
  animation-delay: 0s;
}

.spinner-ring:nth-child(2) {
  width: 60px;
  height: 60px;
  border-top-color: #4a90e2;
  animation-delay: -0.3s;
  animation-duration: 1.5s;
}

.spinner-ring:nth-child(3) {
  width: 80px;
  height: 80px;
  border-top-color: #87ceeb;
  animation-delay: -0.6s;
  animation-duration: 2s;
}

.loading-text {
  margin-top: 120px;
  font-size: 14px;
  color: #666;
  font-weight: 500;
  animation: pulse 1.5s ease-in-out infinite;
}

/* 动画关键帧 */
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes pulse {

  0%,
  100% {
    opacity: 0.6;
  }

  50% {
    opacity: 1;
  }
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
</style>