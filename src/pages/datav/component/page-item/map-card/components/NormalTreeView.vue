<template>
  <div 
    class="normal-tree-view"
    :class="{ 'collapsed': isCollapsed }"
    :style="{ left: left + 'px' }"
  >
    <!-- 折叠/展开按钮 -->
    <div class="toggle-btn" @click="$emit('toggle-collapsed')">
      {{ isCollapsed ? '▶' : '◀' }}
    </div>
    
    <!-- 树形数据内容 -->
    <div class="tree-content" v-if="!isCollapsed">
      <div class="tree-header">
        <h4>数据导航</h4>
      </div>
      
      <div class="tree-container">
        <div
          v-for="item in treeData"
          :key="item.id"
          class="tree-item"
          :class="{ 
            'expanded': expandedNodes.includes(item.id),
            'selected': selectedTreeData && selectedTreeData.id === item.id
          }"
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
              :class="{ 'selected': selectedTreeData && selectedTreeData.id === child.id }"
              @click="handleChildClick(child)"
            >
              {{ getTreeItemLabel(child) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * 普通树形视图组件
 * 用于显示侧边栏的树形数据导航
 */

const props = defineProps({
  treeData: Array,
  selectedTreeData: Object,
  expandedNodes: Array,
  isCollapsed: Boolean,
  left: Number,
  getTreeItemLabel: Function,
  setChildrenFunc: Function
})

const emit = defineEmits(['toggle-expand', 'select', 'toggle-collapsed'])

function handleNodeClick(item) {
  // 如果有子节点，先设置子节点
  if (item.children && props.setChildrenFunc) {
    props.setChildrenFunc(item)
  }
  emit('select', item)
}

function handleChildClick(child) {
  emit('select', child)
}
</script>

<style lang="scss" scoped>
.normal-tree-view {
  position: absolute;
  top: 15px;
  width: 230px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  max-height: calc(100vh - 100px);
  overflow: hidden;
  transition: all 0.3s ease;
  
  &.collapsed {
    width: 40px;
    
    .tree-content {
      display: none;
    }
  }
}

.toggle-btn {
  position: absolute;
  right: -20px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 40px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #ddd;
  border-left: none;
  border-radius: 0 8px 8px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 12px;
  color: #666;
  transition: all 0.2s;
  
  &:hover {
    background: #f5f7fa;
    color: #409eff;
  }
}

.tree-content {
  overflow-y: auto;
  max-height: 100%;
}

.tree-header {
  padding: 15px;
  border-bottom: 1px solid #eee;
  
  h4 {
    margin: 0;
    font-size: 16px;
    color: #333;
  }
}

.tree-container {
  padding: 10px;
}

.tree-item {
  margin-bottom: 5px;
  
  &.selected > .tree-node {
    background-color: #e6f7ff;
    color: #1890ff;
  }
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
  
  &.selected {
    background-color: #e6f7ff;
    color: #1890ff;
  }
}
</style>