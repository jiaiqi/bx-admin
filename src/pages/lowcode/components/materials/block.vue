<template>
  <div
    class="lc-block"
    :class="[subType]"
    :style="[setStyle]"
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
  },
  methods: {
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
  height: 100%;
  position: relative;
  padding: 10px;
  --primary-color: #2c48ff;
  border: 1px dashed rgba(44, 72, 255, 0.3); /* 添加浅色虚线边框 */
  &.preview-mode {
    border-color: transparent;
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
