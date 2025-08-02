<template>
  <div
    class="map-marker"
    :style="[
      getItemPosition(item)
    ]"
    :title="getItemLabel(item)"
  >
    <img
      :src="getItemIcon(item)"
      class="marker-icon"
      :class="{ 'cursor-pointer': allowClick(item) }"
      :style="getIconStyle(item)"
      @click.stop="handleMarkerClick(item, $event)"
      v-if="getItemIcon(item)"
    />
    <span
      v-if="getItemLabel(item)"
      :style="getLabelStyle(item)"
      class="marker-label"
    >{{ getItemLabel(item) }}</span>
  </div>
</template>

<script setup>
import { getImagePath } from '@/common/http.js'
import { formatStyleData } from '@/pages/datav/common/index.js'

/**
 * 地图标记组件
 * @component MapMarker
 * @description 负责渲染单个地图标记点，包括图标和标签
 */

/**
 * 组件 Props 定义
 */
const props = defineProps({
  // 标记点数据
  item: {
    type: Object,
    required: true
  },
  // 地图配置
  mapJson: {
    type: Object,
    required: true
  },
});

/**
 * 组件事件定义
 */
const emit = defineEmits(['marker-click']);

/**
 * 标记点点击处理
 * @param {Object} item - 标记点数据
 * @param {Event} event - 点击事件
 */
function handleMarkerClick(item, event) {
  emit('marker-click', item, event);
}

/**
 * 判断是否允许点击
 * @param marker 标记点数据
 * @returns {boolean} 是否允许点击
 */
function allowClick(marker) {
  if (marker?._poi_info?.onclick) {
    return true
  }
}

/**
 * 获取标记点标签文本
 * @param {Object} item - 标记点数据
 * @returns {string} 标签文本
 */
function getItemLabel(item) {
  if (item._col_map && item._col_map.col_label && item[item._col_map.col_label]) {
    return item[item._col_map.col_label]
  }
  if (props.mapJson.col_label && item[props.mapJson.col_label]) {
    return item[props.mapJson.col_label]
  }
  return ''
}

/**
 * 获取标签样式
 * @param {Object} item - 标记点数据
 * @returns {Object} 样式对象
 */
function getLabelStyle(item) {
  if (item._poi_info?.label_style_json) {
    return formatStyleData(item._poi_info?.label_style_json)
  }
  return {}
}

/**
 * 获取图标样式
 * @param {Object} item - 标记点数据
 * @returns {Object} 样式对象
 */
function getIconStyle(item) {
  if (item._poi_info?.icon_style_json) {
    return formatStyleData(item._poi_info?.icon_style_json)
  }
  return {}
}

/**
 * 获取标记点图标
 * @param {Object} item - 标记点数据
 * @returns {string} 图标路径
 */
function getItemIcon(item = {}) {
  if (!item || typeof item !== "object") {
    console.warn("getItemIcon: 无效的item参数", item)
    item = {}
  }

  if (item?.col_map?.customized_icon) {
    return getImagePath(item[item.col_map.customized_icon])
  } else if (item?._poi_info?.poi_type_icon) {
    return getImagePath(item._poi_info.poi_type_icon)
  } else if (item?._poi_info?.icon) {
    return getImagePath(item._poi_info.icon)
  }

  const mapConfig = props.mapJson
  if (!mapConfig) {
    console.warn("getItemIcon: 地图配置不存在")
    return ""
  }

  try {
    const iconCol = mapConfig.marker_icon_col
    if (iconCol && item[iconCol]) {
      return getImagePath(item[iconCol])
    }

    if (mapConfig.icon_default) {
      return getImagePath(mapConfig.icon_default)
    }
  } catch (error) {
    console.error("getItemIcon: 获取图标路径失败", error)
  }

  return ""
}

/**
 * 获取标记点位置
 * @param {Object} item - 标记点数据
 * @returns {Object} 位置样式对象
 */
function getItemPosition(item = {}) {
  let pos = {
    left: 0,
    top: 0,
  }

  if (props.mapJson?.x_col && props.mapJson?.y_col) {
    if (item[props.mapJson?.x_col]) {
      pos.left = item[props.mapJson?.x_col] + "%"
    }
    if (item[props.mapJson?.y_col]) {
      pos.top = item[props.mapJson?.y_col] + "%"
    }
  } else if (item?._col_map) {
    const { col_label, col_no, col_x, col_x_width, col_y, col_y_width, customized_icon } = item._col_map || {}

    pos.label = item[col_label]
    pos.left = item[col_x] + "%"
    pos.top = item[col_y] + "%"
    if (col_x_width) {
      pos.width = col_x_width + 'px'
    }
    if (col_y_width) {
      pos.height = col_y_width + 'px'
    }
    pos.icon = customized_icon
    pos.value = item[col_no]
  }

  return pos
}
</script>

<style lang="scss" scoped>
.map-marker {
  position: absolute;
  transform: translate(-50%, -50%);

  .marker-icon {
    width: 30px;
    transition: all 0.3s ease-in-out;

    &.cursor-pointer {
      cursor: pointer;

      &:hover {
        transform: scale(1.1);
        z-index: 20;
      }

      &:active {
        transform: scale(0.95);
      }
    }
  }

  .marker-label {
    position: absolute;
    bottom: -10px;
    left: 50%;
    min-width: 50px;
    text-align: center;
    white-space: nowrap;
    transform: translate(-50%, 100%);
  }
}
</style>