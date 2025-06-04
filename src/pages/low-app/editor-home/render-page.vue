<template>
  <div 
    class="render-page"
    @dragover.prevent
    @drop.prevent
  >
    <div class="component-container">
      <div 
        v-for="(item, index) in currentComponents"
        :key="item.id || index"
        class="component-wrapper"
        :style="getWrapperStyle(item)"
        draggable="true"
        @dragstart="handleDragStart($event, item, index)"
        @dragover.prevent
        @dragenter.prevent="handleDragEnter($event, index)"
        @dragleave.prevent="handleDragLeave($event, index)"
        @drop.prevent="handleDrop($event, index)"
        @click="handleComponentClick(item)"
      >
        <div class="component-header">
          <div class="drag-handle">
            <i class="el-icon-rank"></i>
          </div>
          <div 
            class="delete-btn"
            @click.stop="handleDeleteComponent(item.id)"
            title="删除组件"
          >
            <i class="el-icon-delete"></i>
          </div>
        </div>
        <div class="component-content">
          <component
            :is="getComponentType(item)"
            v-bind="item"
            :style="getComponentStyle(item)"
            :pageItem="item"
            :layout="item.layout"
            :screenType="screenType"
            :pageConfig="pageConfig"
            :inTabs="false"
            :inEdit="inEdit"
            :currentId="currentId"
          />
        </div>
        <div 
          class="resize-handle"
          @mousedown.stop.prevent="startResize($event, item)"
        ></div>
      </div>
    </div>
  </div>
</template>

<script>
import dragStore from '../app-materials/store/dragStore'
import pageItem from "@/pages/datav/component/page-item/page-item.vue";
import floatComponent from "./float-component.vue";

export default {
  name: "render-page",
  components: {
    pageItem,
    floatComponent
  },
  data() {
    return {
      currentComponents: [], // 存储所有组件
      screenType: 'pc', // 默认屏幕类型 mobile /pc
      pageConfig: {}, // 页面配置
      inEdit: true, // 是否处于编辑状态
      currentId: null, // 当前选中的组件ID
      resizing: false, // 是否正在调整大小
      currentResizeItem: null, // 当前正在调整大小的组件
      startY: 0, // 开始调整时的Y坐标
      startHeight: 0, // 开始调整时的高度
      dragIndex: -1, // 当前拖拽的组件索引
      dragOverIndex: -1, // 当前拖拽经过的组件索引
    }
  },
  props:{
    components: {
      type: Array,
      default: ()=> []
    }
  },
  watch: {
    components: {
      immediate: true,
      deep: true,
      handler(newValue) {
        if (newValue && newValue.length > 0) {
          // 为传入的组件添加拖拽索引
          const componentsWithIndex = newValue.map((comp, index) => ({
            ...comp,
            dragIndex: index
          }))
          this.currentComponents = componentsWithIndex
          // 更新组件的z-index
          this.rearrangeComponents()
        }
      },
    },
  },
  methods: {
    // 处理删除组件
    handleDeleteComponent(id) {
      // 找到要删除的组件的索引
      const index = this.currentComponents.findIndex(comp => comp.id === id)
      if (index > -1) {
        // 删除组件
        this.currentComponents.splice(index, 1)
        // 重新排列剩余组件
        this.rearrangeComponents()
      }
    },

    // 重新排列组件
    rearrangeComponents() {
      // 更新每个组件的z-index和拖拽索引
      this.currentComponents.forEach((comp, index) => {
        comp.layout_z = index + 1
        comp.dragIndex = index
      })
    },

    // 获取容器样式
    getWrapperStyle(item) {
      return {
        position: 'relative',
        width: '100%',
        height: `${item.layout_height || 6.25}rem`,
        marginBottom: '0.625rem',
        zIndex: item.layout_z || 1
      }
    },

    // 获取组件类型
    getComponentType(item) {
      if (!item) return null
      
      console.log('当前获取的组件:', item)
      
      // 根据组件类型返回对应的组件名称
      switch (item.type) {
        case 'container':
          return 'lc-container'
        case 'layout':
          return 'lc-block'
        case 'component':
          return item.component || 'page-item'
        default:
          return 'page-item'
      }
    },

    // 获取组件样式
    getComponentStyle(item) {
      if (!item) return {}
      
      return {
        width: '100%',
        height: '100%',
        pointerEvents: 'auto'
      }
    },

    // 处理组件点击事件
    handleComponentClick(item) {
      this.$emit('componentClick', item)
    },

    // 添加新组件
    addComponent(componentData) {
      if (!componentData) return
      
      // 生成唯一ID
      const id = componentData.id || `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      // 创建新组件数据
      const newComponent = {
        id,
        ...componentData,
        layout_height: componentData.layout_height || 6.25, // 100px / 16 = 6.25rem
        layout_z: this.currentComponents.length + 1,
        dragIndex: this.currentComponents.length // 添加拖拽索引
      }

      // 添加到组件列表末尾
      this.currentComponents.push(newComponent)
    },

    // 更新组件
    updateComponent(id, newData) {
      const index = this.currentComponents.findIndex(comp => comp.id === id)
      if (index > -1) {
        this.$set(this.currentComponents, index, {
          ...this.currentComponents[index],
          ...newData
        })
      }
    },

    // 删除组件
    removeComponent(id) {
      const index = this.currentComponents.findIndex(comp => comp.id === id)
      if (index > -1) {
        this.currentComponents.splice(index, 1)
        this.rearrangeComponents()
      }
    },

    // 获取调整大小手柄的样式
    getResizeHandleStyle(item) {
      return {
        position: 'absolute',
        left: '50%',
        bottom: '-0.375rem',
        transform: 'translateX(-50%)',
        width: '4rem',
        height: '0.375rem',
        cursor: 'ns-resize',
        zIndex: (item.layout_z || 1) + 1
      }
    },

    // 开始调整大小
    startResize(event, item) {
      if (!this.inEdit) return
      
      const wrapper = event.target.closest('.component-wrapper')
      if (!wrapper) return
      
      // 禁用拖拽
      wrapper.draggable = false
      
      this.resizing = true
      this.currentResizeItem = item
      this.startY = event.clientY
      this.startHeight = item.layout_height || 6.25

      // 添加全局鼠标事件监听
      document.addEventListener('mousemove', this.handleResize)
      document.addEventListener('mouseup', this.stopResize)
    },

    // 处理调整大小
    handleResize(event) {
      if (!this.resizing || !this.currentResizeItem) return

      const deltaY = event.clientY - this.startY
      const deltaYRem = deltaY / 16
      const newHeight = Math.max(6.25, this.startHeight + deltaYRem)
      
      // 直接更新组件的高度
      this.currentResizeItem.layout_height = newHeight
    },

    // 停止调整大小
    stopResize(event) {
      if (!this.resizing) return
      
      // 恢复拖拽
      if (this.currentResizeItem) {
        const wrapper = document.querySelector(`[data-id="${this.currentResizeItem.id}"]`)
        if (wrapper) {
          wrapper.draggable = true
        }
      }
      
      this.resizing = false
      this.currentResizeItem = null
      
      // 移除全局鼠标事件监听
      document.removeEventListener('mousemove', this.handleResize)
      document.removeEventListener('mouseup', this.stopResize)
    },

    // 处理拖拽开始
    handleDragStart(event, item, index) {
      this.dragIndex = index
      event.dataTransfer.effectAllowed = 'move'
      event.dataTransfer.setData('text/plain', index)
      // 添加拖拽时的样式
      event.target.classList.add('dragging')
    },

    // 处理拖拽进入
    handleDragEnter(event, index) {
      if (index === this.dragIndex) return
      this.dragOverIndex = index
      event.target.classList.add('drag-over')
    },

    // 处理拖拽离开
    handleDragLeave(event, index) {
      event.target.classList.remove('drag-over')
    },

    // 处理放置
    handleDrop(event, index) {
      // 移除所有组件的拖拽相关样式
      document.querySelectorAll('.component-wrapper').forEach(el => {
        el.classList.remove('drag-over')
        el.classList.remove('dragging')
      })
      
      if (this.dragIndex === index) return
      
      // 获取拖拽的组件
      const draggedItem = this.currentComponents[this.dragIndex]
      
      // 创建新的组件数组
      const newComponents = [...this.currentComponents]
      
      // 从原位置移除
      newComponents.splice(this.dragIndex, 1)
      
      // 插入到新位置
      newComponents.splice(index, 0, draggedItem)
      
      // 使用 Vue.set 更新整个数组以确保响应式
      this.$set(this, 'currentComponents', newComponents)
      
      // 更新组件的z-index和拖拽索引
      this.rearrangeComponents()
      
      // 重置拖拽状态
      this.dragIndex = -1
      this.dragOverIndex = -1
    }
  },
  mounted() {
    // 监听拖拽结束事件
    document.addEventListener('drop', (e) => {
      const dragData = dragStore.getDraggingElement()
      if (dragData) {
        // 获取鼠标位置
        const rect = this.$el.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        
        // 将像素转换为rem（除以16）
        const xRem = x / 16
        const yRem = y / 16
        
        // 创建新组件数据
        const newComponent = {
          id: `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: dragData.type || 'component',
          component: dragData.component || 'page-item',
          com_type: dragData.com_type || dragData.type,
          com_label: dragData.comp_label || dragData.label || dragData.name,
          layout_x: xRem,
          layout_y: yRem,
          layout_width: dragData.layout_width || 12.5, // 200px / 16 = 12.5rem
          layout_height: dragData.layout_height || 6.25, // 100px / 16 = 6.25rem
          layout_z: this.currentComponents.length + 1,
          ...dragData.data
        }

        console.log('Adding new component:', newComponent)
        
        // 使用 addComponent 方法添加新组件
        this.addComponent(newComponent)
        
        // 清除拖拽状态
        dragStore.clearDragType()
        dragStore.setDraggingElement(null)
      }
    })

    // 添加拖拽结束事件监听
    document.addEventListener('dragend', () => {
      // 只在非drop事件时清除状态
      if (!dragStore.getDraggingElement()) {
        dragStore.clearDragType()
        dragStore.setDraggingElement(null)
      }
    })
  },
  beforeDestroy() {
    // 移除事件监听
    document.removeEventListener('drop', this.handleDrop)
    document.removeEventListener('dragend', this.handleDragEnd)
  }
}
</script>

<style scoped lang="scss">
.render-page {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 500px;
  background-color: #000;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border-radius:0.9375rem;
}

.component-container {
  position: relative;
  width: 100%;
  height: 100%;
  flex: 1;
  min-height: 500px;
  background-color: #000;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  padding: 0.625rem; // 10px / 16 = 0.625rem
  overflow-y: auto;
}

.component-wrapper {
  border: 1px dashed #ccc;
  background-color: #d2d0d0;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border-radius: 0.3125rem;
  position: relative;
  
  &.dragging {
    opacity: 0.5;
    cursor: move;
  }
  
  &.drag-over {
    border: 2px dashed #1890ff;
    transform: translateY(0.625rem);
  }
  
  &:hover {
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
    
    .delete-btn {
      opacity: 1;
    }
    
    .resize-handle {
      background-color: #40a9ff;
    }
  }
}

.component-header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 0.5rem;
  background-color: rgba(245, 245, 245, 0.9);
  border-top-left-radius: 0.3125rem;
  border-top-right-radius: 0.3125rem;
  z-index: 2;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.component-wrapper:hover .component-header {
  opacity: 1;
}

.drag-handle {
  cursor: move;
  color: #666;
  padding: 0.25rem;
  
  &:hover {
    color: #1890ff;
  }
}

.component-content {
  width: 100%;
  height: 100%;
  position: relative;
  padding-top: 2rem;
}

.delete-btn {
  position: static;
  width: 1.25rem;
  height: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 50%;
  background-color: rgba(255, 77, 79, 0.8);
  color: #fff;
  opacity: 0;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: #ff4d4f;
    transform: scale(1.1);
  }
  
  i {
    font-size: 0.875rem;
  }
}

.resize-handle {
  background-color: #1890ff;
  border: 1px solid #fff;
  border-radius: 0.25rem;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  
  &::after {
    content: '';
    width: 2rem;
    height: 0.125rem;
    background-color: #fff;
    border-radius: 0.0625rem;
  }
  
  &:hover {
    background-color: #40a9ff;
  }
  
  &:active {
    background-color: #096dd9;
  }
}
</style>