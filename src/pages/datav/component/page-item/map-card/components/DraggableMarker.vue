<template>
  <div
    class="draggable-marker"
    :class="{
      'is-dragging': isDragging,
      'is-editable': isEditable && isEditMode
    }"
    :style="[
      markerStyle,
      getItemPosition(item),
      isDragging ? { zIndex: 9999 } : {}
    ]"
    @mousedown="handleMouseDown"
  >
    <!-- 复用MapMarker组件 -->
    <MapMarker
      :item="item"
      :map-json="mapJson"
      @marker-click="handleMarkerClick"
      class="marker-content"
      :in-drag="true"
    />

    <!-- 编辑模式下的拖拽指示器 -->
    <div
      v-if="isEditable && isEditMode"
      class="drag-indicator"
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path
          d="M13,6V11H18V7.75L22.25,12L18,16.25V13H13V18H16.25L12,22.25L7.75,18H11V13H6V16.25L1.75,12L6,7.75V11H11V6H7.75L12,1.75L16.25,6H13Z"
        />
      </svg>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import MapMarker from './MapMarker.vue'

/**
 * 可拖拽标记点组件
 * @component DraggableMarker
 * @description 支持拖拽编辑的地图标记点组件，复用MapMarker组件
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
  // 是否处于编辑模式
  isEditMode: {
    type: Boolean,
    default: false
  },
  // 标记点位置获取函数
  getItemPosition: {
    type: Function,
    required: true
  },
  // 标记点样式
  markerStyle: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits([
  'marker-click',
  'position-change',
  'drag-start',
  'drag-end'
])

// 拖拽状态
const isDragging = ref(false)
const dragStartPos = ref({ x: 0, y: 0 })
const markerStartPos = ref({ x: 0, y: 0 })

/**
 * 检查标记点是否可编辑
 */
const isEditable = computed(() => {
  return props.item._poi_info?.marker_edit_cfg?.update_request_no
})

/**
 * 处理鼠标按下事件
 */
function handleMouseDown(event) {
  // 只有在编辑模式下且标记点可编辑时才允许拖拽
  if (!props.isEditMode || !isEditable.value) {
    return
  }

  event.preventDefault()
  event.stopPropagation()

  // 记录拖拽开始位置
  dragStartPos.value = {
    x: event.clientX,
    y: event.clientY
  }

  // 记录标记点初始位置
  const xCol = props.mapJson.x_col || props.item._col_map?.col_x
  const yCol = props.mapJson.y_col || props.item._col_map?.col_y

  if (xCol && yCol) {
    markerStartPos.value = {
      x: props.item[xCol],
      y: props.item[yCol]
    }
  }

  isDragging.value = true
  emit('drag-start', props.item)

  // 添加全局事件监听
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)

  // 防止页面选择文本
  document.body.style.userSelect = 'none'
}

/**
 * 处理鼠标移动事件
 */
function handleMouseMove(event) {
  if (!isDragging.value) return

  event.preventDefault()

  // 计算鼠标移动距离
  const deltaX = event.clientX - dragStartPos.value.x
  const deltaY = event.clientY - dragStartPos.value.y

  // 获取地图容器元素
  const mapContainer = event.target.closest('.map-view')
  if (!mapContainer) return

  const containerRect = mapContainer.getBoundingClientRect()

  // 将像素移动距离转换为百分比
  const deltaXPercent = (deltaX / containerRect.width) * 100
  const deltaYPercent = (deltaY / containerRect.height) * 100

  // 计算新位置
  const newX = Math.max(0, Math.min(100, markerStartPos.value.x + deltaXPercent))
  const newY = Math.max(0, Math.min(100, markerStartPos.value.y + deltaYPercent))

  // 更新标记点位置
  updateMarkerPosition(newX, newY)
}

/**
 * 处理鼠标释放事件
 */
function handleMouseUp(event) {
  if (!isDragging.value) return

  event.preventDefault()

  isDragging.value = false
  emit('drag-end', props.item)

  // 移除全局事件监听
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)

  // 恢复页面文本选择
  document.body.style.userSelect = ''
}

/**
 * 更新标记点位置
 */
function updateMarkerPosition(newX, newY) {
  const xCol = props.mapJson.x_col || props.item._col_map?.col_x
  const yCol = props.mapJson.y_col || props.item._col_map?.col_y

  if (xCol && yCol) {
    // 直接修改标记点数据
    props.item[xCol] = newX
    props.item[yCol] = newY

    // 通知父组件位置变更
    emit('position-change', props.item, newX, newY)
  }
}

/**
 * 处理标记点点击事件
 */
function handleMarkerClick(item, event) {
  // 如果正在拖拽或处于编辑模式，不触发点击事件
  if (isDragging.value || (props.isEditMode && isEditable.value)) {
    event.preventDefault()
    event.stopPropagation()
    return
  }

  emit('marker-click', item, event)
}
</script>

<style lang="scss" scoped>
.draggable-marker {
  position: absolute;
  transform: translate(-50%, -50%);
  transition: all 0.2s ease;

  &.is-editable {
    cursor: grab;

    &:hover {
      transform: translate(-50%, -50%) scale(1.05);

      .marker-content {
        position: relative;

        &::after {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          border: 2px solid #007aff;
          background: rgba(0, 122, 255, 0.1);
          border-radius: 4px;
          animation: pulseBlue 1.5s infinite;
        }
      }
    }
  }

  &.is-dragging {
    cursor: grabbing;
    transform: translate(-50%, -50%) scale(1.1);
    transition: none;
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));

    .marker-content::after {
      content: '';
      position: absolute;
      top: -2px;
      left: -2px;
      right: -2px;
      bottom: -2px;
      border: 2px solid #007aff;
      background: rgba(0, 122, 255, 0.2);
      border-radius: 4px;
    }
  }

  .marker-content {
    position: relative;
    pointer-events: none; // 防止内部元素干扰拖拽
    transform: translate(0,0);
    left: unset;
    top: unset;
  }

  .drag-indicator {
    position: absolute;
    top: -8px;
    right: -8px;
    width: 16px;
    height: 16px;
    background: #007aff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 10px;
    opacity: 0;
    transition: opacity 0.2s ease;
    pointer-events: none;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  &.is-editable:hover .drag-indicator,
  &.is-dragging .drag-indicator {
    opacity: 1;
  }
}

// 蓝色边框脉冲动画
@keyframes pulseBlue {
  0% {
    box-shadow: 0 0 0 0 rgba(0, 122, 255, 0.4);
  }

  70% {
    box-shadow: 0 0 0 8px rgba(0, 122, 255, 0);
  }

  100% {
    box-shadow: 0 0 0 0 rgba(0, 122, 255, 0);
  }
}
</style>