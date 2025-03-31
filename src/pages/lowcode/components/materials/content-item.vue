<template>
  <div
    class="content-item drop-zone"
    @click="$emit('click', props)"
    :class="{ active: currentId && currentId === id }"
    :data-allow-drop="allowDrop"
    data-drop-effect="move"
    draggable="true"
    :data-id="id"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
  >
    <slot>
      <!-- <el-button type="primary">添加组件</el-button> -->
    </slot>
  </div>
</template>

<script>
import { VueDraggable } from "vue-draggable-plus";

export default {
  name: "lc-block",
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
  },
  computed: {
    props() {
      return { ...this.$props, ...(this.$attrs || {}) };
    },
    allowDrop() {
      return this.type === "content" && !this.children?.length;
    },
  },
  methods: {
    handleDragLeave(e) {
      e.target.classList.remove("drag-over");
    },
    handleDragOver(e) {
      // console.log("handleDragOver:", e);
      if (e.target.dataset.allowDrop === "true") {
        e.preventDefault(); // 必须！否则无法触发 drop 事件
        e.dataTransfer.dropEffect = "move"; // 可视化反馈（如光标样式）
        e.target.classList.add("drag-over"); // 可选：添加类名以显示反馈
      }else{
        
      }
    },
    handleDrop(e) {
      console.log("handleDrop:", e);
      e.preventDefault();
      e.target.classList.remove("drag-over");
      // 验证目标元素是否为允许的容器
      if (e.target.dataset.allowDrop === "true") {
        const data = e.dataTransfer.getData("text/plain");
        if (data) {
          const draggedElement = JSON.parse(data);
          draggedElement.id = `${this.id}${new Date().getTime()}`;
          draggedElement.parentId = this.id;
          // console.log("draggedElement:", draggedElement);
          // e.target.appendChild(draggedElement); // 将元素移动到目标容器
          this.$emit("add", draggedElement);
        }
      }
      return;
    },
  },
};
</script>

<style lang="scss" scoped>
.content-item {
  width: 100%;
  height: 100%;
  height: 100px;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  --primary-color: #17d57e;
  .content {
    z-index: 1;
    .component {
      position: relative;
      z-index: 1; // 确保组件在遮罩层之上;
    }
  }

  &:hover,
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
    border: 1px solid var(--primary-color);
  }
  // .overlay {
  //   &:hover {
  //     // cursor: pointer;
  //     border: 1px dashed #17d57e;
  //     &::before {
  //       content: "内容块";
  //       position: absolute;
  //       top: 0;
  //       left: 0;
  //       padding: 2px 5px;
  //       background-color: #17d57e;
  //       color: #fff;
  //       transform: translateY(-100%);
  //     }
  //   }
  // }
}
.layout-1 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 10px;
}
</style>
