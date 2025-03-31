<template>
  <div
    class="row-container"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
    @dragend="handleDragEnd"
  >
    <!-- 遮罩层 -->
    <div
      class="overlay"
      @click="$emit('click', props)"
      :class="{ active: currentId && currentId === id }"
    >
      <div class="handle">
        <i class="el-icon-rank"></i>
      </div>
    </div>

    <!-- 子组件 -->
      <slot></slot>
  </div>
</template>

<script>
import dragStore from "../../store/dragStore";

export default {
  name: "lc-container",
  components: {},
  props: {
    id: {
      type: [String, Number],
      default: "",
    },
    currentId: {
      type: [String, Number],
      default: "",
    },
  },
  computed: {
    props() {
      return { ...this.$props, ...(this.$attrs || {}) };
    },
  },
  methods: {
    handleDragLeave(e) {
      // 阻止事件冒泡
      e.stopPropagation();
      e.target.classList.remove("drag-over");
      e.target.classList.remove("drag-not-allowed");
    },

    handleDragOver(e) {
      // 阻止事件冒泡
      e.stopPropagation();
      // 阻止默认行为以允许放置
      e.preventDefault();

      // 获取当前拖拽的组件类型
      const draggedType = dragStore.getDragType();

      if (e.target) {
        if (draggedType === "layout") {
          // 允许放置布局组件
          e.dataTransfer.dropEffect = "copy";
          e.target.classList.add("drag-over");
          e.target.classList.remove("drag-not-allowed");
        } else if (draggedType) {
          // 不允许放置其他类型组件
          e.dataTransfer.dropEffect = "none";
          e.target.classList.remove("drag-over");
          e.target.classList.add("drag-not-allowed");
        }
      }
    },

    // 添加拖拽结束处理
    handleDragEnd() {
      // 清除拖拽状态
      dragStore.clearDragType();

      // 清除所有拖拽样式
      document
        .querySelectorAll(".drag-over, .drag-not-allowed")
        .forEach((el) => {
          el.classList.remove("drag-over");
          el.classList.remove("drag-not-allowed");
        });
    },

    handleDrop(e) {
      // 阻止事件冒泡
      e.stopPropagation();
      e.preventDefault();
      e.target.classList.remove("drag-over");
      e.target.classList.remove("drag-not-allowed");

      // 获取拖拽数据
      const data = e.dataTransfer.getData("text/plain");

      if (data) {
        try {
          const draggedElement = JSON.parse(data);

          // 只处理layout类型的组件
          if (draggedElement.type === "layout") {
            draggedElement.id = `${this.id}_layout_${new Date().getTime()}`;
            draggedElement.parentId = this.id;

            // 根据布局类型创建对应数量的内容组件
            let columnCount = 1; // 默认一列
            if (draggedElement.subType === "layout-1-2") {
              columnCount = 2; // 两列布局
            } else if (draggedElement.subType === "layout-1-3") {
              columnCount = 3; // 三列布局
            }

            // 创建子内容组件
            if (!draggedElement.children) {
              draggedElement.children = [];
            }

            for (let i = 0; i < columnCount; i++) {
              const contentItem = {
                id: `${draggedElement.id}_content_${i}_${new Date().getTime()}`,
                type: "content",
                component: "lc-content",
                name: `内容${i + 1}`,
                parentId: draggedElement.id,
              };
              draggedElement.children.push(contentItem);
            }

            this.$emit("add", draggedElement);
          } else {
            // 不是layout类型，显示不允许放置的反馈
            e.target.classList.add("drag-not-allowed");
            setTimeout(() => {
              e.target.classList.remove("drag-not-allowed");
            }, 1500);
          }
        } catch (err) {
          console.error("解析拖拽数据失败:", err);
        }
      }
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
.row-container {
  width: 100%;
  min-height: 20px;
  display: flex;
  flex-wrap: wrap;
  padding: 20px;
  position: relative;
  --primary-color: #ff740e;
  $primary-color: #ff740e;
  border: 1px dashed rgba($color:$primary-color, $alpha: 0.3); /* 添加浅色虚线边框 */


  > .overlay {

  &.drag-over {
    border: 2px dashed var(--primary-color);
    background-color: rgba(255, 116, 14, 0.3);
    &::before {
      content: "可放置布局组件";
      position: absolute;
      top: 0;
      left: 0;
      padding: 2px 5px;
      background-color: var(--primary-color);
      color: #fff;
      transform: translateY(-100%);
      z-index: 10;
      font-size: 12px;
      border-radius: 2px 2px 0 0;
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
      border: 1px dashed #ff740e;
      &::before {
        content: "整行容器";
        position: absolute;
        top: 0;
        left: 0;
        padding: 2px 5px;
        background-color: #ff740e;
        color: #fff;
        transform: translateY(-100%);
      }
    }
    &.active {
      border: 1px solid var(--primary-color);
    }
  }
}
</style>
