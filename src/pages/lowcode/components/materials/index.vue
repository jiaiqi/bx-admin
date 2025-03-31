<template>
  <div class="materia-warp">
    <div class="left">
      <div
        v-for="item in list"
        :key="item.id"
        :id="item.id"
        draggable="true"
        :data-type="item.type"
        :class="['component-item', `type-${item.type}`, 'cursor-move h-50px rounded p-3']"
        @dragstart="handleDragStart($event, item)"
      >
        {{ item.name }}
      </div>
    </div>
  </div>
</template>

<script>
import dragStore from '../../store/dragStore';

export default {
  name: "lowcode-materials",
  components: {
  },
  data() {
    return {
      //
      list: [
        {
          id: "1", // 组件ID，唯一标识
          type: "button", // 组件类型，用于区分组件
          component: "el-button", // 组件类型，用于区分组件
          name: "按钮", // 组件名称，用于显示在编辑器中
        },
        {
          id: "2",
          type: "input",
          component: "el-input",
          name: "输入框",
        },
        {
          id: "3",
          type: "select",
          component: "el-select",
          name: "下拉选择",
        },
        {
          id: "4",
          type: "layout",
          component: "lc-block",
          subType: "layout-1-2",
          name: "两列布局",
        },
        {
          id: "5",
          type: "layout",
          component: "lc-block",
          subType: "layout-1-3",
          name: "三列布局",
        },
        {
          id: "6",
          type: "container",
          component: "lc-container",
          name: "容器",
        },
      ],
    };
  },
  mounted() {
    // 添加全局拖拽结束事件监听
    document.addEventListener('dragend', this.handleGlobalDragEnd);
  },
  
  beforeDestroy() {
    // 移除全局事件监听
    document.removeEventListener('dragend', this.handleGlobalDragEnd);
  },
  methods: {
    //
    onEnd(val) {
      console.log("end", val);
    },
    handleDragStart(e, item) {
      // 设置拖拽数据
      const dragData = { ...item };
      
      // 确保布局组件有children属性
      if (item.type === "layout" && !dragData.children) {
        dragData.children = [];
      }
      
      e.dataTransfer.setData("text/plain", JSON.stringify(dragData));
      
      // 设置组件类型到全局状态
      dragStore.setDragType(item.type);
      
      // 设置拖拽效果
      e.dataTransfer.effectAllowed = "copy";
      // 创建自定义拖拽图像（可选）
      const dragIcon = document.createElement('div');
      dragIcon.innerHTML = item.name;
      dragIcon.className = 'drag-icon';
      document.body.appendChild(dragIcon);
      e.dataTransfer.setDragImage(dragIcon, 0, 0);
      
      // 延迟移除拖拽图像
      setTimeout(() => {
        document.body.removeChild(dragIcon);
      }, 0);
    },
    
    // 全局拖拽结束处理
    handleGlobalDragEnd() {
      // 清除拖拽状态
      dragStore.clearDragType();
      
      // 清除所有拖拽样式
      document.querySelectorAll('.editor-drag-over, .editor-drag-not-allowed, .drag-over, .drag-not-allowed').forEach(el => {
        el.classList.remove('editor-drag-over');
        el.classList.remove('editor-drag-not-allowed');
        el.classList.remove('drag-over');
        el.classList.remove('drag-not-allowed');
      });
    }
  },
};
</script>

<style scoped lang="scss">
.left {
  width: 200px;
  height: 100%;
  border: 1px solid #f0f0f0;
  border-top: none;
  padding: 10px;
}

.component-item {
  margin-bottom: 10px;
  background-color: rgba(128, 128, 128, 0.05);
  border: 1px solid #eee;
  border-radius: 4px;
  transition: all 0.3s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  &.type-container {
    border-left: 3px solid #ff740e;
  }
  
  &.type-layout {
    border-left: 3px solid #2c48ff;
  }
  
  &.type-button,
  &.type-input,
  &.type-select {
    border-left: 3px solid #17d57e;
  }
}

.drag-icon {
  padding: 5px 10px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: absolute;
  top: -1000px;
}
</style>
