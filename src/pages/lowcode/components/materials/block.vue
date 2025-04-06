<template>
  <div
    class="lc-block"
    :class="[subType]"
    :style="[setStyle, blockHeightStyle]"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
    @dragend="handleDragEnd"
  >
    <!-- 遮罩层 -->
    <div
      v-if="!isPreview"
      class="overlay"
      @click="$emit('click', props)"
      :class="{ active: currentId && currentId === id }"
    >
      <!-- <div class="handle">
        <i class="el-icon-rank"></i>
      </div> -->
    </div>

    <!-- 子组件 -->
    <slot></slot>
    
    <!-- 高度调整手柄 -->
    <div 
      v-if="!isPreview && currentId && currentId === id" 
      class="resize-handle-s"
      @mousedown="startResize"
    ></div>
  </div>
</template>

<script>
import { formatStyleData } from "@/common/common";
import dragStore from "../../store/dragStore";

export default {
  name: "lc-block",
  components: {},
  props: {
    id: {
      type: [String, Number],
      default: "",
    },
    name: {
      type: String,
      default: "",
    },
    component: {
      type: String,
      default: "",
    },
    currentId: {
      type: [String, Number],
      default: "",
    },
    children: {
      type: Array,
      default: () => [],
    },
    type: {
      type: String,
      default: "",
    },
    subType: {
      type: String,
      default: "",
    },
    isPreview: {
      type: Boolean,
      default: false,
    },
    height: {
      type: [Number, String],
      default: null,
    }
  },
  data() {
    return {
      blockHeight: this.height || 10, // 默认10vh
      resizing: false,
      startY: 0,
      startHeight: 0,
    };
  },
  computed: {
    props() {
      return { ...this.$props, ...(this.$attrs || {}) };
    },
    setStyle() {
      let style = {};
      if (this.props.style_json && typeof this.props.style_json === "string") {
        style = JSON.parse(this.props.style_json);
      } else if (this.props.layout_json?.style_json) {
        style = this.props.layout_json.style_json;
      }
      return formatStyleData(style);
    },
    blockHeightStyle() {
      return {
        height: this.blockHeight ? `${this.blockHeight}vh` : null
      };
    }
  },
  watch: {
    height(newVal) {
      if (newVal) {
        this.blockHeight = newVal;
      }
    }
  },
  mounted() {
    // 添加全局事件监听
    document.addEventListener('mousemove', this.onResize);
    document.addEventListener('mouseup', this.stopResize);
  },
  beforeDestroy() {
    // 移除全局事件监听
    document.removeEventListener('mousemove', this.onResize);
    document.removeEventListener('mouseup', this.stopResize);
  },
  methods: {
    // 开始调整高度
    startResize(e) {
      if (this.isPreview) return;
      
      e.preventDefault();
      e.stopPropagation();
      
      this.resizing = true;
      this.startY = e.clientY;
      this.startHeight = this.blockHeight;
      
      // 添加调整大小时的样式
      document.body.style.cursor = 'ns-resize';
      document.body.style.userSelect = 'none';
    },
    
    // 调整高度过程
    onResize(e) {
      if (!this.resizing) return;
      
      // 计算移动的距离，转换为vh单位
      // 视口高度的1%对应的像素值
      const vh = window.innerHeight / 100;
      // 移动的vh值，向上取整到最接近的整数
      const deltaVh = Math.round((e.clientY - this.startY) / vh);
      
      // 设置新高度，最小为5vh
      const newHeight = Math.max(5, this.startHeight + deltaVh);
      
      // 只有当高度变化为整数vh时才更新
      if (newHeight !== this.blockHeight) {
        this.blockHeight = newHeight;
        
        // 触发高度变化事件
        this.$emit('resize', {
          id: this.id,
          height: this.blockHeight
        });
      }
    },
    
    // 停止调整高度
    stopResize() {
      if (!this.resizing) return;
      
      this.resizing = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      
      // 触发高度变化完成事件
      this.$emit('resize-end', {
        id: this.id,
        height: this.blockHeight
      });
    },

    // 修改拖拽相关的事件处理
    handleDragOver(e) {
      if (this.isPreview) return;
      // 阻止事件冒泡
      e.stopPropagation();
      // 阻止默认行为以允许放置
      e.preventDefault();
      // 获取当前拖拽的组件类型
      const draggedType = dragStore.getDragType();

      if (e.currentTarget) {
        console.log("handleDragOver-block:", draggedType);

        if (draggedType === "content") {
          // 只允许放置内容组件
          e.dataTransfer.dropEffect = "copy";
          e.currentTarget.classList.add("drag-over");
          e.currentTarget.classList.remove("drag-not-allowed");
        } else {
          // 不允许放置布局和容器组件
          e.dataTransfer.dropEffect = "none";
          e.currentTarget.classList.remove("drag-over");
          e.currentTarget.classList.add("drag-not-allowed");
        }
      }
    },

    handleDragLeave(e) {
      if (this.isPreview) return;
      // 阻止事件冒泡
      e.stopPropagation();
      e.currentTarget.classList.remove("drag-over");
      e.currentTarget.classList.remove("drag-not-allowed");
    },

    handleDrop(e) {
      if (this.isPreview) return;
      // 阻止事件冒泡
      e.stopPropagation();
      e.preventDefault();
      e.currentTarget.classList.remove("drag-over");
      e.currentTarget.classList.remove("drag-not-allowed");

      // 获取拖拽数据
      const data = e.dataTransfer.getData("text/plain");

      if (data) {
        try {
          const draggedElement = JSON.parse(data);

          // 只处理非layout和非container类型的组件
          if (
            draggedElement.type !== "layout" &&
            draggedElement.type !== "container"
          ) {
            draggedElement.id = `${this.id}_component_${new Date().getTime()}`;
            draggedElement.parentId = this.id;
            draggedElement._editType = "add";
            this.$emit("add", draggedElement);
          } else {
            // 不允许放置layout和container类型的组件
            e.currentTarget.classList.add("drag-not-allowed");
            setTimeout(() => {
              e.currentTarget.classList.remove("drag-not-allowed");
            }, 1500);
          }
        } catch (err) {
          console.error("解析拖拽数据失败:", err);
        }
      }
    },

    handleDragEnd() {
      if (this.isPreview) return;
      // 清除拖拽类型
      dragStore.clearDragType();
    },
  },
};
</script>

<style lang="scss" scoped>
.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0);
  z-index: 0;
}
.lc-block {
  width: 100%;
  // height: 100%;
  position: relative;
  padding: 10px;
  --primary-color: #2c48ff;
  border: 1px dashed rgba(44, 72, 255, 0.3); /* 添加浅色虚线边框 */
  
  // 高度调整手柄样式
  .resize-handle-s {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 6px;
    background-color: transparent;
    cursor: ns-resize;
    z-index: 10;
    
    &:hover, &:active {
      background-color: rgba(44, 72, 255, 0.3);
    }
    
    &::after {
      content: "";
      position: absolute;
      bottom: 2px;
      left: 50%;
      transform: translateX(-50%);
      width: 30px;
      height: 2px;
      background-color: var(--primary-color);
    }
  }
  
  &.preview-mode {
    border-color: transparent;
    
    .resize-handle-s {
      display: none;
    }
  }
  
  &.drag-over {
    border: 2px dashed var(--primary-color);
    background-color: rgba(44, 72, 255, 0.05);
    &::before {
      content: "可放置组件";
      position: absolute;
      top: 0;
      left: 0;
      padding: 2px 5px;
      background-color: var(--primary-color);
      color: #fff;
      transform: translateY(-100%);
      z-index: 10;
    }
  }

  &.drag-not-allowed {
    border: 2px dashed #ff0000;
    background-color: rgba(255, 0, 0, 0.05);
    &::before {
      content: "不可放置此组件";
      position: absolute;
      top: 0;
      left: 0;
      padding: 2px 5px;
      background-color: #ff0000;
      color: #fff;
      transform: translateY(-100%);
      z-index: 10;
    }
  }

  > .overlay {
    > .handle {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      z-index: 10;
      right: 0;
      display: none;
    }
    &:hover {
      .handle {
        display: block;
        cursor: move;
      }
    }
    &:hover {
      // cursor: pointer;
      border: 1px dashed var(--primary-color);
      &::before {
        content: "布局容器";
        position: absolute;
        top: 0;
        left: 0;
        padding: 2px 5px;
        background-color: #2c48ff;
        color: #fff;
        transform: translateY(-100%);
      }
    }
    &.active {
      border: 1px solid var(--primary-color);
      & > .handle {
        display: block;
      }
    }
  }
  &.layout-1-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-gap: 10px;
  }

  &.layout-1-3 {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    grid-gap: 10px;
  }

  &.layout-1-4 {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    grid-gap: 10px;
  }

  &.layout-2-2-3070 {
    display: grid;
    grid-template-columns: 30% 70%;
    grid-gap: 10px;
  }

  &.layout-2-2-7030 {
    display: grid;
    grid-template-columns: 70% 30%;
    grid-gap: 10px;
  }
}
// .layout-1-1 {
//   // 一行一列
//   display: flex;
// }
// .layout-1-2 {
//   // 一行两列
//   display: grid;
//   grid-template-columns: 1fr 1fr;
// }
// .layout-1-3 {
//   // 一行三列
//   display: grid;
//   grid-template-columns: 1fr 1fr 1fr;
// }
</style>
