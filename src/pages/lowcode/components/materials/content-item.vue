<template>
  <div
    class="lc-content lc-layout"
    :class="{ 'preview-mode': isPreview, 'view-mode': isView }"
    :style="contentStyle"
    :data-allow-drop="allowDrop"
    data-drop-effect="move"
    draggable="false"
    :data-id="id"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
    @dragstart="handleDragStart($event, props)"
  >
    <!-- 遮罩层 -->
    <div
      class="overlay"
      @click.stop="onTap"
      :class="{ active: isActive }"
      v-if="!isPreview && !isView"
    >
      <!-- 删除按钮 -->
      <!-- <i
        class="el-icon-close"
        @click="onDelete"
        v-if="children && children.length"
      ></i> -->
      <div
        @click="onDelete"
        v-if="children && children.length"
        class="delete-bar"
        title="删除"
      >
        <i class="el-icon-delete"></i>
      </div>
    </div>

    <slot> </slot>

    <!-- 拖拽调整宽度的手柄 -->
    <!-- <div v-if="!isPreview && !isView && isActive" class="resize-handles">
      <div
        class="resize-handle resize-handle-e"
        @mousedown="startResize($event, 'e')"
      ></div>
      <div
        class="resize-handle resize-handle-w"
        @mousedown="startResize($event, 'w')"
      ></div> 
     <div class="resize-unit-switch" @click.stop="toggleWidthUnit">
        {{ widthUnit === 'px' ? 'px' : '%' }}
      </div>
    </div> -->
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
    com_no: {
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
    isPreview: {
      type: Boolean,
      default: false,
    },
    isView: {
      type: Boolean,
      default: false,
    },
    width: {
      type: [Number, String],
      default: null,
    },
    widthUnit: {
      type: String,
      default: "px",
    },
  },
  data() {
    return {
      contentWidth: this.width || null,
      currentWidthUnit: this.widthUnit || "px",
      resizing: false,
      resizeDirection: null,
      startX: 0,
      startWidth: 0,
      parentWidth: 0,
    };
  },
  computed: {
    props() {
      return { ...this.$props, ...(this.$attrs || {}) };
    },
    allowDrop() {
      return this.type === "content" && !this.children?.length;
    },
    isActive() {
      let childId = this.children?.[0]?.id;
      return this.currentId && [childId, this.id].includes(this.currentId);
    },
    contentStyle() {
      if (!this.contentWidth) return {};

      return {
        width:
          this.currentWidthUnit === "px"
            ? `${this.contentWidth}px`
            : `${this.contentWidth}%`,
      };
    },
  },
  watch: {
    width(newVal) {
      if (newVal !== undefined && newVal !== null) {
        this.contentWidth = newVal;
      }
    },
    widthUnit(newVal) {
      if (newVal) {
        this.currentWidthUnit = newVal;
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
    onTap() {
      if (this.isPreview) return;
      let val = this.children?.[0]?.id ? this.children?.[0] : this.props;
      this.$emit("click", val);
    },
    onDelete() {
      if (Array.isArray(this.children) && this.children.length) {
        this.$emit("delete", this.children[0]);
      }
    },
    // 切换宽度单位
    toggleWidthUnit() {
      // 在px和%之间切换
      const newUnit = this.currentWidthUnit === "px" ? "%" : "px";

      // 转换宽度值
      if (this.contentWidth) {
        if (newUnit === "%") {
          // 从px转换为%
          const parentWidth = this.$el.parentElement.offsetWidth;
          this.contentWidth = Math.round(
            (this.contentWidth / parentWidth) * 100
          );
        } else {
          // 从%转换为px
          const parentWidth = this.$el.parentElement.offsetWidth;
          this.contentWidth = Math.round(
            (this.contentWidth / 100) * parentWidth
          );
        }
      } else {
        // 如果没有设置宽度，设置一个默认值
        this.contentWidth = newUnit === "px" ? 200 : 50;
      }

      this.currentWidthUnit = newUnit;

      // 触发宽度变化事件
      this.$emit("resize", {
        id: this.id,
        width: this.contentWidth,
        widthUnit: this.currentWidthUnit,
      });

      this.$emit("resize-end", {
        id: this.id,
        width: this.contentWidth,
        widthUnit: this.currentWidthUnit,
      });
    },

    // 开始调整宽度
    startResize(e, direction) {
      if (this.isPreview) return;

      e.preventDefault();
      e.stopPropagation();

      this.resizing = true;
      this.resizeDirection = direction;
      this.startX = e.clientX;

      // 获取当前元素的宽度和父元素的宽度
      const rect = this.$el.getBoundingClientRect();
      this.startWidth =
        this.contentWidth ||
        (this.currentWidthUnit === "px" ? rect.width : 100);
      this.parentWidth = this.$el.parentElement.offsetWidth;

      // 添加调整大小时的样式
      document.body.style.cursor = "ew-resize";
      document.body.style.userSelect = "none";
    },

    // 调整宽度过程
    onResize(e) {
      if (!this.resizing) return;

      const deltaX = e.clientX - this.startX;
      let newWidth;

      // 根据拖拽方向计算新宽度
      if (this.resizeDirection === "e") {
        // 向右拖拽增加宽度
        newWidth = this.startWidth + deltaX;
      } else if (this.resizeDirection === "w") {
        // 向左拖拽减少宽度
        newWidth = this.startWidth - deltaX;
      }

      // 根据单位类型调整粒度
      if (this.currentWidthUnit === "px") {
        // 按20px的粒度调整
        newWidth = Math.round(newWidth / 20) * 20;
        // 最小宽度为60px
        newWidth = Math.max(60, newWidth);
      } else {
        // 转换为百分比
        const percentWidth = (newWidth / this.parentWidth) * 100;
        // 按1%的粒度调整
        newWidth = Math.round(percentWidth);
        // 最小宽度为10%，最大为100%
        newWidth = Math.max(10, Math.min(100, newWidth));
      }

      // 更新宽度
      if (newWidth !== this.contentWidth) {
        this.contentWidth = newWidth;

        // 触发宽度变化事件
        this.$emit("resize", {
          id: this.id,
          width: this.contentWidth,
          widthUnit: this.currentWidthUnit,
        });
      }
    },

    // 停止调整宽度
    stopResize() {
      if (!this.resizing) return;

      this.resizing = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";

      // 触发宽度变化完成事件
      this.$emit("resize-end", {
        id: this.id,
        width: this.contentWidth,
        widthUnit: this.currentWidthUnit,
      });
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
        if (draggedType === "component") {
          // if (!["container", "layout", "content"].includes(draggedType)) {
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
      if (this.allowDrop) {
        const data = e.dataTransfer.getData("text/plain");
        if (data) {
          try {
            const draggedElement = JSON.parse(data);
            // 只处理非container和非layout类型的组件
            if (
              draggedElement.type !== "container" &&
              draggedElement.type !== "layout"
            ) {
              draggedElement.parentId = this.id;
              draggedElement.parent_no = this.props.com_no;
              draggedElement.com_seq = (this.props.children.length + 1) * 100;
              draggedElement._seq = draggedElement.com_seq;
              draggedElement.com_name =
                draggedElement.comp_label || draggedElement.chart_name;
              if (!draggedElement._editType) {
                draggedElement.id = `${this.id}${new Date().getTime()}`;
                draggedElement._editType = "add";
              }

              if (draggedElement?.mock_data_json) {
                try {
                  // const mock_data_json = JSON.parse(
                  //   draggedElement?.mock_data_json
                  // );
                  // if (Array.isArray(mock_data_json)) {
                  //   draggedElement.mock_srv_data_json = draggedElement.mock_data_json;
                  //   draggedElement.srv_req_type === "模拟数据";
                  //   draggedElement.data.mock_srv_data_json = draggedElement.mock_data_json;
                  //   draggedElement.data.srv_req_type === "模拟数据";
                  // }
                } catch (error) {
                  console.error(error);
                }
              }
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
@use "../../styles/layout.common.scss" as layout;

.overlay {
  @include layout.overlay;
  z-index: 99;
}

.lc-content {
  width: 100%;
  height: 100%;
  min-height: 50px;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  $primary-color: #17d57e;
  background-color: #F0F0F0;

  /* 添加浅色虚线边框 */
  :deep(.page-item) {
    overflow: unset;
  }

  .overlay {

    // border: 1px dashed rgba($color: $primary-color, $alpha: 0.3);
    &:hover {
      border: 2px dashed rgba($color: $primary-color, $alpha: 1);
      background-color: rgba($color: $primary-color, $alpha: 0.1);
    }

    &.drag-over {
      // cursor: pointer;
      border: 1px dashed $primary-color;

      &::before {
        content: "组件容器";
        position: absolute;
        top: 0;
        left: 0;
        padding: 2px 5px;
        background-color: $primary-color;
        color: #fff;
        transform: translateY(-100%);
      }
    }

    &.active {
      border: 2px solid $primary-color !important;
    }

    &.drag-over {
      border: 2px dashed $primary-color;
      background-color: rgba($color: $primary-color, $alpha: 0.3);

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
  }

  // 调整宽度的手柄样式
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
    background-color: $primary-color;
    pointer-events: auto;
    z-index: 11;

    &:hover {
      background-color: $primary-color;
    }

    &.resize-handle-e {
      top: 50%;
      right: 0;
      width: 6px;
      height: 20px;
      transform: translateY(-50%);
      cursor: ew-resize;
    }

    &.resize-handle-w {
      top: 50%;
      left: 0;
      width: 6px;
      height: 20px;
      transform: translateY(-50%);
      cursor: ew-resize;
    }
  }

  .resize-unit-switch {
    position: absolute;
    top: 0;
    right: 0;
    padding: 2px 5px;
    background-color: $primary-color;
    color: #fff;
    font-size: 12px;
    cursor: pointer;
    pointer-events: auto;
    z-index: 11;

    &:hover {
      background-color: $primary-color;
    }
  }

  // &.preview-mode {
  //   border-color: transparent;

  //   .resize-handles {
  //     display: none;
  //   }
  // }
}
</style>