<template>
  <div class="building-tree-view">
    <div class="building-header">
      <h3>{{ buildingInfo.name || '建筑物视图' }}</h3>
      <button @click="$emit('back')" class="back-btn">返回</button>
    </div>
    
    <div class="tree-container">
      <div
        v-for="item in buildingTree"
        :key="item.id"
        class="tree-item"
        :class="{ 'expanded': expandedNodes.includes(item.id) }"
      >
        <div 
          class="tree-node"
          @click="handleNodeClick(item)"
        >
          <span 
            v-if="item.children && item.children.length"
            class="expand-icon"
            @click.stop="$emit('toggle-expand', item.id)"
          >
            {{ expandedNodes.includes(item.id) ? '▼' : '▶' }}
          </span>
          <span class="node-label">{{ getTreeItemLabel(item) }}</span>
        </div>
        
        <div 
          v-if="item.children && expandedNodes.includes(item.id)"
          class="tree-children"
        >
          <div
            v-for="child in item.children"
            :key="child.id"
            class="tree-child"
            @click="handleChildClick(child)"
          >
            {{ getTreeItemLabel(child) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * 建筑物树形视图组件
 * 用于显示建筑物视图下的楼层和房间信息
 */

const props = defineProps({
  buildingTree: Array,
  floorInfo: Object,
  expandedNodes: Array,
  getTreeItemLabel: Function,
  buildingInfo: Object
})

const emit = defineEmits(['toggle-expand', 'select', 'back'])

function handleNodeClick(item) {
  emit('select', item)
}

function handleChildClick(child) {
  emit('select', child)
}
</script>

<style lang="scss" scoped>
.building-tree-view {
  position: absolute;
  left: 15px;
  top: 15px;
  width: 250px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  max-height: calc(100vh - 100px);
  overflow-y: auto;
}

.building-header {
  padding: 15px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  h3 {
    margin: 0;
    font-size: 16px;
    color: #333;
  }
  
  .back-btn {
    padding: 4px 8px;
    background: #409eff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    
    &:hover {
      background: #66b1ff;
    }
  }
}

.tree-container {
  padding: 10px;
}

.tree-item {
  margin-bottom: 5px;
}

.tree-node {
  display: flex;
  align-items: center;
  padding: 8px;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #f5f7fa;
  }
}

.expand-icon {
  margin-right: 8px;
  font-size: 12px;
  color: #666;
  width: 16px;
  text-align: center;
}

.node-label {
  flex: 1;
  font-size: 14px;
  color: #333;
}

.tree-children {
  margin-left: 24px;
  border-left: 1px dashed #ddd;
}

.tree-child {
  padding: 6px 12px;
  cursor: pointer;
  border-radius: 4px;
  font-size: 13px;
  color: #666;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #f0f9ff;
    color: #409eff;
  }
}
</style>