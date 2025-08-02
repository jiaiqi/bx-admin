<template>
  <div
    class="draggable-marker"
    :class="{ 'dragging': isDragging }"
    :style="markerStyle"
    @mousedown="handleMouseDown"
    @touchstart="handleTouchStart"
  >
    <!-- 标记点图标 -->
    <div class="marker-icon">
      <img
        v-if="marker.icon_url"
        :src="marker.icon_url"
        :alt="marker.name || '标记点'"
        class="marker-image"
      />
      <i
        v-else
        class="el-icon-location-outline default-icon"
      ></i>
    </div>

    <!-- 标记点标签 -->
    <div
      v-if="marker.name"
      class="marker-label"
    >
      {{ marker.name }}
    </div>

    <!-- 拖拽提示 -->
    <div
      v-if="isDragging"
      class="drag-hint"
    >
      拖拽移动位置
    </div>
  </div>
</template>

<script>
/**
 * 可拖拽标记点组件
 * @description 支持鼠标和触摸拖拽的地图标记点
 */
export default {
  name: 'DraggableMarker',
  props: {
    // 标记点数据
    marker: {
      type: Object,
      required: true
    },
    // 地图配置
    mapConfig: {
      type: Object,
      required: true
    }
  },
  emits: [
    'position-change',
    'drag-start',
    'drag-end'
  ],
  data() {
    return {
      isDragging: false,
      dragStartPos: { x: 0, y: 0 },
      markerStartPos: { x: 0, y: 0 }
    }
  },
  computed: {
    colMap() {
      return this.marker._col_map || {}
    },
    /**
     * 标记点样式
     */
    markerStyle() {
      const xCol = this.marker._col_map?.col_x
      const yCol = this.marker._col_map?.col_y

      if (!xCol || !yCol) {
        return { display: 'none' }
      }

      const x = this.marker[xCol] || 0
      const y = this.marker[yCol] || 0

      return {
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        transform: 'translate(-50%, -100%)',
        cursor: this.isEditable ? 'move' : 'pointer',
        zIndex: this.isDragging ? 1000 : 10
      }
    },

    /**
     * 是否可编辑
     */
    isEditable() {
      return Boolean(this.marker._poi_info?.marker_edit_cfg?.update_request_no)
    }
  },
  methods: {
    /**
     * 处理鼠标按下事件
     */
    handleMouseDown(event) {
      if (!this.isEditable) return

      event.preventDefault()
      this.startDrag(event.clientX, event.clientY)

      document.addEventListener('mousemove', this.handleMouseMove)
      document.addEventListener('mouseup', this.handleMouseUp)
    },

    /**
     * 处理触摸开始事件
     */
    handleTouchStart(event) {
      if (!this.isEditable) return

      event.preventDefault()
      const touch = event.touches[0]
      this.startDrag(touch.clientX, touch.clientY)

      document.addEventListener('touchmove', this.handleTouchMove, { passive: false })
      document.addEventListener('touchend', this.handleTouchEnd)
    },

    /**
     * 开始拖拽
     */
    startDrag(clientX, clientY) {
      this.isDragging = true
      this.dragStartPos = { x: clientX, y: clientY }

      const xCol = this.marker._col_map?.col_x
      const yCol = this.marker._col_map?.col_y

      this.markerStartPos = {
        x: this.marker[xCol] || 0,
        y: this.marker[yCol] || 0
      }

      this.$emit('drag-start', this.marker)
    },

    /**
     * 处理鼠标移动事件
     */
    handleMouseMove(event) {
      if (!this.isDragging) return
      event.preventDefault()
      this.updatePosition(event.clientX, event.clientY)
    },

    /**
     * 处理触摸移动事件
     */
    handleTouchMove(event) {
      if (!this.isDragging) return
      event.preventDefault()
      const touch = event.touches[0]
      this.updatePosition(touch.clientX, touch.clientY)
    },

    /**
     * 更新标记点位置
     */
    updatePosition(clientX, clientY) {
      const deltaX = clientX - this.dragStartPos.x
      const deltaY = clientY - this.dragStartPos.y

      const newX = this.markerStartPos.x + deltaX
      const newY = this.markerStartPos.y + deltaY

      // 限制在地图容器范围内
      const container = this.$el.parentElement
      const containerRect = container.getBoundingClientRect()

      const boundedX = Math.max(0, Math.min(newX, containerRect.width))
      const boundedY = Math.max(0, Math.min(newY, containerRect.height))

      // 将像素值转换为百分比
      const percentageX = (boundedX / containerRect.width) * 100
      const percentageY = (boundedY / containerRect.height) * 100

      this.$emit('position-change', this.marker, percentageX, percentageY)
    },

    /**
     * 处理鼠标抬起事件
     */
    handleMouseUp() {
      this.endDrag()
      document.removeEventListener('mousemove', this.handleMouseMove)
      document.removeEventListener('mouseup', this.handleMouseUp)
    },

    /**
     * 处理触摸结束事件
     */
    handleTouchEnd() {
      this.endDrag()
      document.removeEventListener('touchmove', this.handleTouchMove)
      document.removeEventListener('touchend', this.handleTouchEnd)
    },

    /**
     * 结束拖拽
     */
    endDrag() {
      if (!this.isDragging) return

      this.isDragging = false
      this.$emit('drag-end', this.marker)
    }
  },
  beforeDestroy() {
    // 清理事件监听器
    document.removeEventListener('mousemove', this.handleMouseMove)
    document.removeEventListener('mouseup', this.handleMouseUp)
    document.removeEventListener('touchmove', this.handleTouchMove)
    document.removeEventListener('touchend', this.handleTouchEnd)
  }
}
</script>

<style lang="scss" scoped>
.draggable-marker {
  position: absolute;
  user-select: none;
  transition: transform 0.2s ease;

  &.dragging {
    transform: translate(-50%, -100%) scale(1.1);
    z-index: 1000;

    .marker-icon {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }
  }

  &:hover:not(.dragging) {
    transform: translate(-50%, -100%) scale(1.05);
  }
}

.marker-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border: 2px solid #409eff;
  border-radius: 50% 50% 50% 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.2s ease;

  .marker-image {
    width: 20px;
    height: 20px;
    object-fit: contain;
  }

  .default-icon {
    font-size: 18px;
    color: #409eff;
  }
}

.marker-label {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  margin-top: 4px;
  pointer-events: none;
}

.drag-hint {
  position: absolute;
  top: -40px;
  left: 50%;
  transform: translateX(-50%);
  background: #409eff;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  pointer-events: none;
  animation: fadeIn 0.3s ease;

  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 4px solid transparent;
    border-top-color: #409eff;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-4px);
  }

  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}
</style>