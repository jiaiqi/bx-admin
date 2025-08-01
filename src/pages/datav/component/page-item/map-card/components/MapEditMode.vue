<template>
  <div class="map-edit-mode">
    <!-- 编辑模式切换按钮 -->
    <div 
      class="edit-toggle-btn"
      :class="{ 'active': isEditMode }"
      @click="toggleEditMode"
      :title="isEditMode ? '退出编辑模式' : '进入编辑模式'"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
      </svg>
    </div>

    <!-- 编辑模式提示 -->
    <div 
      v-if="isEditMode" 
      class="edit-mode-tips"
    >
      <div class="tips-content">
        <span class="tips-text">编辑模式已开启，可拖拽移动标记点</span>
        <div class="tips-actions">
          <button 
            class="save-btn" 
            @click="saveChanges"
            :disabled="!hasChanges"
          >
            保存更改
          </button>
          <button 
            class="cancel-btn" 
            @click="cancelChanges"
          >
            取消
          </button>
        </div>
      </div>
    </div>

    <!-- 编辑状态指示器 -->
    <div 
      v-if="isEditMode && editableMarkers.length > 0" 
      class="edit-status"
    >
      <span class="status-text">
        可编辑标记点: {{ editableMarkers.length }} 个
      </span>
      <span v-if="hasChanges" class="changes-indicator">
        已修改: {{ Object.keys(markerChanges).length }} 个
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, set, del } from 'vue'

/**
 * 地图编辑模式组件
 * @component MapEditMode
 * @description 提供地图标记点编辑功能，支持拖拽移动标记点位置
 */

const props = defineProps({
  // 标记点列表
  markerList: {
    type: Array,
    default: () => []
  },
  // 地图配置
  mapJson: {
    type: Object,
    required: true
  }
})

const emit = defineEmits([
  'edit-mode-change',
  'marker-position-change',
  'save-changes',
  'cancel-changes'
])

// 编辑模式状态
const isEditMode = ref(false)
const markerChanges = ref({}) // 存储标记点位置变更
const originalPositions = ref({}) // 存储原始位置

/**
 * 计算可编辑的标记点
 * 只有配置了 _poi_info.marker_edit_cfg.update_request_no 的标记点才可编辑
 */
const editableMarkers = computed(() => {
  return props.markerList.filter(marker => 
    marker._poi_info?.marker_edit_cfg?.update_request_no
  )
})

/**
 * 检查是否有未保存的更改
 */
const hasChanges = computed(() => {
  return Object.keys(markerChanges.value).length > 0
})

/**
 * 切换编辑模式
 */
function toggleEditMode() {
  if (isEditMode.value) {
    // 退出编辑模式前检查是否有未保存的更改
    if (hasChanges.value) {
      if (confirm('有未保存的更改，确定要退出编辑模式吗？')) {
        exitEditMode()
      }
    } else {
      exitEditMode()
    }
  } else {
    enterEditMode()
  }
}

/**
 * 进入编辑模式
 */
function enterEditMode() {
  isEditMode.value = true
  
  // 保存所有可编辑标记点的原始位置
  editableMarkers.value.forEach(marker => {
    const xCol = props.mapJson.x_col || marker._col_map?.col_x
    const yCol = props.mapJson.y_col || marker._col_map?.col_y
    
    if (xCol && yCol && marker.id) {
      originalPositions.value[marker.id] = {
        x: marker[xCol],
        y: marker[yCol]
      }
    }
  })
  
  emit('edit-mode-change', true)
}

/**
 * 退出编辑模式
 */
function exitEditMode() {
  isEditMode.value = false
  markerChanges.value = {}
  originalPositions.value = {}
  emit('edit-mode-change', false)
}

/**
 * 记录标记点位置变更
 * @param {Object} marker - 标记点数据
 * @param {number} newX - 新的X坐标
 * @param {number} newY - 新的Y坐标
 */
function recordMarkerChange(marker, newX, newY) {
  if (!marker.id) return
  
  const xCol = props.mapJson.x_col || marker._col_map?.col_x
  const yCol = props.mapJson.y_col || marker._col_map?.col_y
  
  if (!xCol || !yCol) return
  
  // 检查位置是否真的发生了变化
  const originalPos = originalPositions.value[marker.id]
  if (originalPos && (originalPos.x !== newX || originalPos.y !== newY)) {
    // 使用 Vue.set 或 set 来确保响应式
    set(markerChanges.value, marker.id, {
      marker,
      originalPosition: originalPos,
      newPosition: { x: newX, y: newY },
      updateRequestNo: marker._poi_info.marker_edit_cfg.update_request_no,
      markerEditCfg: marker._poi_info.marker_edit_cfg
    })
  } else {
    // 使用 Vue.delete 或 del 来确保响应式
    if (markerChanges.value[marker.id]) {
      del(markerChanges.value, marker.id)
    }
  }
  
  // 移除可能导致循环调用的事件发射
  // emit('marker-position-change', marker, newX, newY)
}

/**
 * 保存更改
 */
function saveChanges() {
  if (!hasChanges.value) return
  
  // 按 update_request_no 分组整理数据
  const groupedChanges = {}
  
  Object.values(markerChanges.value).forEach(change => {
    const requestNo = change.updateRequestNo
    if (!groupedChanges[requestNo]) {
      groupedChanges[requestNo] = {
        update_request_no: requestNo,
        marker_edit_cfg: change.markerEditCfg,
        markers: []
      }
    }
    
    groupedChanges[requestNo].markers.push({
      id: change.marker.id,
      originalPosition: change.originalPosition,
      newPosition: change.newPosition,
      markerData: change.marker
    })
  })
  
  // 转换为数组格式
  const changesArray = Object.values(groupedChanges)
  
  emit('save-changes', changesArray)
  
  // 更新原始位置记录（在清空变更记录之前）
  Object.values(markerChanges.value).forEach(change => {
    if (change.marker.id) {
      originalPositions.value[change.marker.id] = change.newPosition
    }
  })
  
  // 清空变更记录
  markerChanges.value = {}
}

/**
 * 取消更改
 */
function cancelChanges() {
  if (!hasChanges.value) {
    exitEditMode()
    return
  }
  
  if (confirm('确定要取消所有更改吗？')) {
    // 恢复所有标记点到原始位置
    Object.values(markerChanges.value).forEach(change => {
      const marker = change.marker
      const originalPos = change.originalPosition
      const xCol = props.mapJson.x_col || marker._col_map?.col_x
      const yCol = props.mapJson.y_col || marker._col_map?.col_y
      
      if (xCol && yCol) {
        marker[xCol] = originalPos.x
        marker[yCol] = originalPos.y
      }
    })
    
    emit('cancel-changes')
    exitEditMode()
  }
}

/**
 * 暴露给父组件的方法
 */
defineExpose({
  isEditMode: () => isEditMode.value,
  editableMarkers,
  recordMarkerChange,
  hasChanges: () => hasChanges.value
})
</script>

<style lang="scss" scoped>
.map-edit-mode {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 1000;
}

.edit-toggle-btn {
  position: absolute;
  bottom: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #ddd;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  pointer-events: auto;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  &:hover {
    background: rgba(255, 255, 255, 1);
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &.active {
    background: #007aff;
    color: white;
    border-color: #007aff;

    &:hover {
      background: #0056cc;
    }
  }

  svg {
    transition: transform 0.2s ease;
  }

  &:active svg {
    transform: scale(0.9);
  }
}

.edit-mode-tips {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 122, 255, 0.95);
  color: white;
  padding: 12px 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  pointer-events: auto;
  backdrop-filter: blur(10px);
  animation: slideDown 0.3s ease;

  .tips-content {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .tips-text {
    font-size: 14px;
    font-weight: 500;
  }

  .tips-actions {
    display: flex;
    gap: 8px;
  }

  .save-btn,
  .cancel-btn {
    padding: 6px 12px;
    border: none;
    border-radius: 4px;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  .save-btn {
    background: rgba(255, 255, 255, 0.2);
    color: white;

    &:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.3);
    }
  }

  .cancel-btn {
    background: rgba(255, 255, 255, 0.1);
    color: white;

    &:hover {
      background: rgba(255, 255, 255, 0.2);
    }
  }
}

.edit-status {
  position: absolute;
  bottom: 80px;
  right: 20px;
  background: rgba(255, 255, 255, 0.9);
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  color: #666;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  pointer-events: auto;
  backdrop-filter: blur(10px);

  .status-text {
    display: block;
    margin-bottom: 4px;
  }

  .changes-indicator {
    color: #007aff;
    font-weight: 500;
  }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}
</style>