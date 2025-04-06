<template>
  <div
    class="content-item drop-zone"
    @click="$emit('click', props)"
    :class="{ active: isActive }"
    :data-allow-drop="allowDrop"
    data-drop-effect="move"
    draggable="false"
    :data-id="id"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
    @dragstart="handleDragStart($event, props)"
  >
    <slot> </slot>
  </div>
</template>

<script>
import { VueDraggable } from "vue-draggable-plus";
import dragStore from "../../store/dragStore";

export default {
  name: "lc-content",
  components: {
    VueDraggable,
  },
  props: {
    name: {
      type: String,
      default: "",
    },
    component: {
      type: String,
      default: "",
    },
    id: {
      type: [String, Number],
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
    isPreview: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    props() {
      return { ...this.$props, ...(this.$attrs || {}) };
    },
    allowDrop() {
      return this.type === "content" && !this.children?.length;
    },
    isActive() {
      return (
        this.currentId &&
        (this.currentId === this.id ||
          this.$children?.[0]?.$children?.[0]?.pageItem?.id === this.currentId)
      );
    },
  },
  methods: {
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
      const dragIcon = document.createElement("div");
      dragIcon.innerHTML = item.name || item.comp_label;
      dragIcon.className = "drag-icon";
      document.body.appendChild(dragIcon);
      e.dataTransfer.setDragImage(dragIcon, 0, 0);

      // 延迟移除拖拽图像
      setTimeout(() => {
        document.body.removeChild(dragIcon);
      }, 0);
    },
    handleDragLeave(e) {
      if (this.isPreview) return;
      // 阻止事件冒泡
      e.stopPropagation();
      e.target.classList.remove("drag-over");
      e.target.classList.remove("drag-not-allowed");
    },

    handleDragOver(e) {
      if (this.isPreview) return;
      // 阻止事件冒泡
      e.stopPropagation();

      // 阻止默认行为以允许放置
      e.preventDefault();

      // 获取拖拽元素的类型
      const draggedType = dragStore.getDragType();
      // console.log('handleDragOver-draggedType:',draggedType);

      if (e.target && this.allowDrop && draggedType) {
        console.log("draggedType:", draggedType);
        if (draggedType === "content") {
          // 只有同一个布局容器内的组件可以互相替换位置
        }
        if (!["container", "layout", "content"].includes(draggedType)) {
          // 允许放置非容器和非布局组件且非 content 组件
          e.dataTransfer.dropEffect = "copy";
          e.target.classList.add("drag-over");
          e.target.classList.remove("drag-not-allowed");
        } else {
          // 不允许放置容器和布局组件
          e.dataTransfer.dropEffect = "none";
          e.target.classList.remove("drag-over");
          e.target.classList.add("drag-not-allowed");
        }
      }
    },

    handleDrop(e) {
      if (this.isPreview) return;

      // 阻止事件冒泡
      e.stopPropagation();
      e.preventDefault();
      e.target.classList.remove("drag-over");
      e.target.classList.remove("drag-not-allowed");

      // 验证目标元素是否为允许的容器
      if (e.target.dataset.allowDrop === "true") {
        const data = e.dataTransfer.getData("text/plain");
        if (data) {
          try {
            const draggedElement = JSON.parse(data);

            // 只处理非container和非layout类型的组件
            if (
              draggedElement.type !== "container" &&
              draggedElement.type !== "layout"
            ) {
              draggedElement.id = `${this.id}${new Date().getTime()}`;
              draggedElement.parentId = this.id;
              draggedElement.parentNo = this.props.com_no;
              this.$emit("add", draggedElement);
            } else {
              // 不允许放置container和layout类型的组件
              e.target.classList.add("drag-not-allowed");
              setTimeout(() => {
                e.target.classList.remove("drag-not-allowed");
              }, 1500);
            }
          } catch (err) {
            console.error("解析拖拽数据失败:", err);
          }
        }
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.content-item {
  width: 100%;
  height: 100%;
  min-height: 50px;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  --primary-color: #17d57e;
  border: 1px dashed rgba(23, 213, 126, 0.3); /* 添加浅色虚线边框 */
  &.preview-mode {
    border-color: transparent;
  }
  .content {
    z-index: 1;
    .component {
      position: relative;
      z-index: 1; // 确保组件在遮罩层之上;
    }
  }

  &:hover:not(.preview-mode),
  &.drag-over {
    // cursor: pointer;
    border: 1px dashed #17d57e;
    &::before {
      content: "组件容器";
      position: absolute;
      top: 0;
      left: 0;
      padding: 2px 5px;
      background-color: #17d57e;
      color: #fff;
      transform: translateY(-100%);
    }
  }
  &.active {
    border: 2px solid var(--primary-color) !important;
  }
  .layout-1 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-gap: 10px;
  }
  &.drag-over {
    border: 2px dashed #17d57e;
    background-color: rgba(23, 213, 126, 0.05);
    &::before {
      content: "可放置组件";
      position: absolute;
      top: 0;
      left: 0;
      padding: 2px 5px;
      background-color: #17d57e;
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
}
</style>
