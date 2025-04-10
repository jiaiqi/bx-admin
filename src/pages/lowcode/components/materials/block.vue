<template>
  <div
    class="lc-block lc-layout"
    :class="[subType]"
    :style="[
      setStyle,
      blockHeightStyle,
      blockWidthStyle,
      {
        '--content-width': contentWidth,
      },
    ]"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
    @dragend="handleDragEnd"
  >
    <!-- 遮罩层 -->
    <div
      class="overlay"
      :class="{ active: currentId && currentId === id }"
      v-if="!isPreview && !isView"
      @click.stop="$emit('click', props)"
    >
      <!-- 删除按钮 -->
      <!-- <i class="el-icon-close" @click="$emit('delete', props)"></i> -->
      <div
        @click="$emit('delete', props)"
        @mousemove.stop.capture=""
        @mouseenter.stop.capture=""
        class="delete-bar"
        title="删除"
      >
        <i class="el-icon-delete"></i>
        <!-- <span>
          删除
        </span> -->
      </div>
    </div>

    <!-- 子组件 -->
    <slot></slot>

    <!-- 高度调整手柄 -->
    <div
      v-if="!isPreview && !isView && currentId && currentId === id"
      class="resize-handle-s"
      title="调整高度"
      @mousedown="startResizeHeight"
    ></div>

    <!-- 宽度调整手柄 -->
    <!-- <div v-if="!isPreview && currentId && currentId === id" class="resize-handles">
      <div class="resize-handle resize-handle-e" @mousedown="startResizeWidth($event, 'e')"></div>
      <div class="resize-handle resize-handle-w" @mousedown="startResizeWidth($event, 'w')"></div>
    </div> -->
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
    com_no: {
      type: String,
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
    isView: {
      type: Boolean,
      default: false,
    },
    height: {
      type: [Number, String],
      default: null,
    },
    width: {
      type: [Number, String],
      default: null,
    },
    contentWidth: {
      type: String,
      default: "1200px",
    },
  },
  data() {
    return {
      blockHeight: this.height || 10, // 默认10vh
      blockWidth: this.width || null, // 默认为null，使用CSS中的宽度
      resizingHeight: false,
      resizingWidth: false,
      resizeDirection: null,
      startY: 0,
      startX: 0,
      startHeight: 0,
      startWidth: 0,
      parentWidth: 0,
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
      } else if (
        this.props.style_json &&
        typeof this.props.style_json === "object"
      ) {
        style = this.props.style_json;
      }
      if (
        this.props.layout_json?.style_json &&
        typeof this.props.layout_json.style_json === "object"
      ) {
        style = { ...this.props.layout_json.style_json, ...style };
      }
      return formatStyleData(style);
    },
    blockHeightStyle() {
      return {
        height: this.blockHeight ? `${this.blockHeight}vh` : null,
      };
    },
    blockWidthStyle() {
      return this.blockWidth ? { width: `${this.blockWidth}%` } : {};
    },
  },
  watch: {
    "props.layout_height": {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          this.blockHeight = newVal;
        }
      },
    },
    height(newVal) {
      if (newVal) {
        this.blockHeight = newVal;
      }
    },
    width(newVal) {
      if (newVal !== undefined && newVal !== null) {
        this.blockWidth = newVal;
      }
    },
  },
  mounted() {
    // 添加全局事件监听
    document.addEventListener("mousemove", this.onResize);
    document.addEventListener("mouseup", this.stopResize);
  },
  beforeDestroy() {
    // 移除全局事件监听
    document.removeEventListener("mousemove", this.onResize);
    document.removeEventListener("mouseup", this.stopResize);
  },
  methods: {
    // 开始调整高度
    startResizeHeight(e) {
      if (this.isPreview) return;

      e.preventDefault();
      e.stopPropagation();

      this.resizingHeight = true;
      this.startY = e.clientY;
      this.startHeight = this.blockHeight;

      // 添加调整大小时的样式
      document.body.style.cursor = "ns-resize";
      document.body.style.userSelect = "none";
    },

    // 开始调整宽度
    startResizeWidth(e, direction) {
      if (this.isPreview) return;

      e.preventDefault();
      e.stopPropagation();

      this.resizingWidth = true;
      this.resizeDirection = direction;
      this.startX = e.clientX;

      // 获取当前元素的宽度和父元素的宽度
      const rect = this.$el.getBoundingClientRect();
      this.startWidth = this.blockWidth || 100;
      this.parentWidth = this.$el.parentElement.offsetWidth;

      // 添加调整大小时的样式
      document.body.style.cursor = "ew-resize";
      document.body.style.userSelect = "none";
    },

    // 调整尺寸过程
    onResize(e) {
      // 处理高度调整
      if (this.resizingHeight) {
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
          this.$emit("resize", {
            id: this.id,
            height: this.blockHeight,
          });
        }
      }

      // 处理宽度调整
      if (this.resizingWidth) {
        const deltaX = e.clientX - this.startX;
        let deltaPercent = (deltaX / this.parentWidth) * 100;

        // 根据拖拽方向计算新宽度
        let newWidth;
        if (this.resizeDirection === "e") {
          // 向右拖拽增加宽度
          newWidth = this.startWidth + deltaPercent;
        } else if (this.resizeDirection === "w") {
          // 向左拖拽减少宽度
          newWidth = this.startWidth - deltaPercent;
        }

        // 按1%的粒度调整
        newWidth = Math.round(newWidth);

        // 限制最小宽度为10%，最大为100%
        newWidth = Math.max(10, Math.min(100, newWidth));

        // 更新宽度
        if (newWidth !== this.blockWidth) {
          this.blockWidth = newWidth;

          // 触发宽度变化事件
          this.$emit("resize", {
            id: this.id,
            width: this.blockWidth,
          });
        }
      }
    },

    // 停止调整尺寸
    stopResize() {
      if (this.resizingHeight) {
        this.resizingHeight = false;
        document.body.style.cursor = "";
        document.body.style.userSelect = "";

        // 触发高度变化完成事件
        this.$emit("resize-end", {
          id: this.id,
          height: this.blockHeight,
        });
      }

      if (this.resizingWidth) {
        this.resizingWidth = false;
        document.body.style.cursor = "";
        document.body.style.userSelect = "";

        // 触发宽度变化完成事件
        this.$emit("resize-end", {
          id: this.id,
          width: this.blockWidth,
        });
      }
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
          if (!["layout", "container"].includes(draggedElement.type)) {
            draggedElement.parentId = this.id;
            if (!draggedElement._editType) {
              draggedElement.id = `${this.id
                }_component_${new Date().getTime()}`;
              draggedElement._editType = "add";
              draggedElement.parent_no = this.com_no;
              this.$emit("add", draggedElement);
            }
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
@use "../../styles/layout.common.scss" as layout;

.overlay {
  @include layout.overlay;
}

.lc-block {
  width: 100%;
  width: var(--content-width);
  // height: 100%;
  position: relative;
  padding: 10px;
  --primary-color: #2c48ff;
  $primary-color: #2c48ff;
  border: 1px dashed rgba(44, 72, 255, 0.3);
  /* 添加浅色虚线边框 */

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

    &:hover,
    &:active {
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
      background-color: $primary-color;
    }
  }

  // 宽度调整手柄样式
  .resize-handles {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 10;
  }

  .resize-handle {
    position: absolute;
    background-color: transparent;
    pointer-events: auto;
    z-index: 11;

    &:hover,
    &:active {
      background-color: rgba(44, 72, 255, 0.3);
    }

    &.resize-handle-e {
      top: 0;
      right: 0;
      width: 6px;
      height: 100%;
      cursor: ew-resize;

      &::after {
        content: "";
        position: absolute;
        right: 2px;
        top: 50%;
        transform: translateY(-50%);
        width: 2px;
        height: 30px;
        background-color: $primary-color;
      }
    }

    &.resize-handle-w {
      top: 0;
      left: 0;
      width: 6px;
      height: 100%;
      cursor: ew-resize;

      &::after {
        content: "";
        position: absolute;
        left: 2px;
        top: 50%;
        transform: translateY(-50%);
        width: 2px;
        height: 30px;
        background-color: $primary-color;
      }
    }
  }

  // &.preview-mode {
  //   border-color: transparent;

  //   .resize-handle-s,
  //   .resize-handles {
  //     display: none;
  //   }
  // }

  &.drag-over {
    border: 2px dashed $primary-color;
    background-color: rgba(44, 72, 255, 0.05);

    &::before {
      content: "可放置组件";
      position: absolute;
      top: 0;
      left: 0;
      padding: 2px 5px;
      background-color: $primary-color;
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

  >.overlay {
    >.handle {
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
      border: 1px dashed $primary-color;

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
      border: 1px solid $primary-color;

      &>.handle {
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
// }</style>