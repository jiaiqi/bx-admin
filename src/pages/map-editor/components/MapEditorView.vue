<template>
  <div class="map-editor-view">
    <!-- 地图容器 -->
    <div 
      class="map-container"
      :style="{
        backgroundImage: `url(${mapConfig.base_image})`,
        backgroundSize: mapConfig.base_image_fill_method || 'contain',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }"
    >
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-overlay">
        <div class="loading-content">
          <i class="el-icon-loading"></i>
          <span>加载中...</span>
        </div>
      </div>

      <!-- 可拖拽标记点 -->
      <DraggableMarker
        v-for="marker in markerList"
        :key="marker.id"
        :marker="marker"
        :map-config="mapConfig"
        @position-change="handleMarkerPositionChange"
        @drag-start="handleMarkerDragStart"
        @drag-end="handleMarkerDragEnd"
      />

      <!-- 编辑模式控制栏 -->
      <div class="edit-controls">
        <div class="controls-content">
          <div class="status-info">
            <span class="status-text">
              <i class="el-icon-edit"></i>
              编辑模式已开启，可拖拽移动标记点
            </span>
            <span class="marker-count">
              可编辑标记点: {{ editableMarkersCount }} 个
            </span>
          </div>

          <div class="control-buttons">
            <el-button 
              type="success" 
              size="small"
              :disabled="!hasChanges"
              @click="handleSaveChanges"
            >
              <i class="el-icon-check"></i>
              保存更改
            </el-button>
            <el-button 
              type="warning" 
              size="small"
              @click="handleCancelChanges"
            >
              <i class="el-icon-close"></i>
              取消
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import DraggableMarker from './DraggableMarker.vue'

/**
 * 地图编辑器视图组件
 * @description 负责渲染地图底图和可拖拽的标记点
 */
export default {
  name: 'MapEditorView',
  components: {
    DraggableMarker
  },
  props: {
    // 地图配置
    mapConfig: {
      type: Object,
      required: true,
      default: () => ({})
    },
    // 标记点列表
    markerList: {
      type: Array,
      default: () => []
    },
    // 加载状态
    loading: {
      type: Boolean,
      default: false
    }
  },
  emits: [
    'marker-position-change',
    'save-changes', 
    'cancel-changes'
  ],
  computed: {
    /**
     * 可编辑标记点数量
     */
    editableMarkersCount() {
      return this.markerList.filter(marker => 
        marker._poi_info?.marker_edit_cfg?.update_request_no
      ).length
    },
    /**
     * 是否有未保存的更改
     */
    hasChanges() {
      return this.$parent.hasChanges
    }
  },
  methods: {
    /**
     * 处理标记点位置变更
     */
    handleMarkerPositionChange(marker, newX, newY) {
      this.$emit('marker-position-change', marker, newX, newY)
    },

    /**
     * 处理标记点拖拽开始
     */
    handleMarkerDragStart(marker) {
      console.log('开始拖拽标记点:', marker.name || marker.id)
    },

    /**
     * 处理标记点拖拽结束
     */
    handleMarkerDragEnd(marker) {
      console.log('结束拖拽标记点:', marker.name || marker.id)
    },

    /**
     * 保存更改
     */
    handleSaveChanges() {
      this.$emit('save-changes')
    },

    /**
     * 取消更改
     */
    handleCancelChanges() {
      this.$emit('cancel-changes')
    }
  }
}
</script>

<style lang="scss" scoped>
.map-editor-view {
  width: 100%;
  height: 100%;
  position: relative;
}

.map-container {
  width: 100%;
  height: 100%;
  position: relative;
  background-color: #f5f5f5;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  overflow: hidden;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;

  .loading-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    color: #666;

    i {
      font-size: 24px;
    }

    span {
      font-size: 14px;
    }
  }
}

.edit-controls {
  position: absolute;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  padding: 12px 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  z-index: 100;

  .controls-content {
    display: flex;
    align-items: center;
    gap: 20px;
  }

  .status-info {
    display: flex;
    flex-direction: column;
    gap: 4px;

    .status-text {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 14px;
      font-weight: 500;
      color: #333;

      i {
        color: #409eff;
      }
    }

    .marker-count {
      font-size: 12px;
      color: #666;
    }
  }

  .control-buttons {
    display: flex;
    gap: 8px;
  }
}

@media (max-width: 768px) {
  .edit-controls {
    position: static;
    transform: none;
    margin: 16px;
    
    .controls-content {
      flex-direction: column;
      gap: 12px;
      align-items: stretch;
    }

    .control-buttons {
      justify-content: center;
    }
  }
}
</style>