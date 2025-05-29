<template>
  <div
    class="editor-view"
    @click.stop=""
    @dragover="handleEditorDragOver"
    @dragleave="handleEditorDragLeave"
    @drop="handleEditorDrop"
    @dragend="handleEditorDragEnd"
    :style="{ '--content-width': contentWidth }"
  >
    <div
      class="overlay"
      :class="{
        'on-drag-float-component': draggingComponentType === '悬浮组件',
      }"
      @click="clickOutside"
    ></div>
    <lc-view
      :style="{
        'pointer-events': draggingComponentType === '悬浮组件' ? 'none' : '',
      }"
      v-for="item in editorComponents"
      :current-id="currentId"
      :key="item.id"
      :content-width="contentWidth"
      :hiddenComponentVisible="hiddenComponentVisible"
      v-bind="item"
      :in-edit="true"
      @click="onTap"
      @open="openComponentSelector = true"
      @add="addComponent"
      @delete="deleteComponent"
      @resize="onResize"
      @swap-components="swapComponents"
      @move-component="moveComponent"
    >
    </lc-view>
  </div>
</template>

<script>
// import LcBlock from "../materials/block.vue";
// import LcContainer from "../materials/container.vue";
// import LcContent from "../materials/content-item.vue";
import lcView from "../materials/view.vue";
import { VueDraggable } from "vue-draggable-plus";
import dragStore from "../../store/dragStore";
export default {
  name: "lowcode-editor",
  components: {
    // LcBlock,
    // LcContainer,
    // LcContent,
    lcView,
    VueDraggable,
  },
  props: {
    currentId: {
      type: [String, Number],
      default: "",
    },
    contentWidth: {
      type: String,
      default: "",
    },
    components: {
      type: Array,
      default: () => [],
    },
    hiddenComponentVisible: {
      type: Boolean,
      default: false,
    },
    draggingComponentType: {
      type: String,
      default: "",
    },
  },
  computed: {
    isView() {
      return this.$route.meta?.isView === true;
    },
  },
  watch: {
    components: {
      immediate: true,
      deep: true,
      handler(newValue, oldValue) {
        if (oldValue !== newValue) {
          this.editorComponents = newValue;
        }
      },
    },
  },
  data() {
    return {
      // 组件数据
      editorComponents: [],
      // currentId: null,
      openComponentSelector: false,
    };
  },
  methods: {
    onStart(e) {
      // console.log("start", e);
    },

    onEnd(e) {
      // console.log("onEnd", e);
    },

    onUpdate(val) {
      // console.log("update",val,this.editorComponents);
      this.$nextTick(() => {
        this.$emit("change", this.editorComponents);
      });
    },
    clickOutside() {
      console.log("clickOutside");
      // this.currentId = null;
      this.$emit("select", null, null);
    },
    onTap(val) {
      console.log("onTap", val);
      // this.currentId = val.id;
      this.$emit("select", val.id, val);
    },

    // 处理组件交换
    swapComponents(data) {
      console.log("swapComponents", data);
      const {
        sourceContentId,
        targetContentId,
        draggedComponent,
        targetComponent,
      } = data;

      // 查找源容器和目标容器
      let sourceContainer = null;
      let targetContainer = null;

      // 递归查找容器
      const findContainers = (components) => {
        for (let i = 0; i < components.length; i++) {
          const item = components[i];
          if (item.id === sourceContentId) {
            sourceContainer = item;
          }
          if (item.id === targetContentId) {
            targetContainer = item;
          }
          if (sourceContainer && targetContainer) {
            return true;
          }
          if (item.children && item.children.length > 0) {
            if (findContainers(item.children)) {
              return true;
            }
          }
        }
        return false;
      };

      findContainers(this.editorComponents);

      if (sourceContainer && targetContainer) {
        // 交换组件
        const sourceIndex = sourceContainer.children.findIndex(
          (item) => item.id === draggedComponent.id
        );
        const targetIndex = targetContainer.children.findIndex(
          (item) => item.id === targetComponent.id
        );

        if (sourceIndex !== -1 && targetIndex !== -1) {
          // 更新父容器ID
          const tempComponent = { ...sourceContainer.children[sourceIndex] };
          tempComponent.parentId = targetContainer.id;
          tempComponent.parent_no = targetContainer.com_no;
          tempComponent.com_seq = targetContainer.com_seq;
          tempComponent._editType = "update";

          const tempTargetComponent = {
            ...targetContainer.children[targetIndex],
          };
          tempTargetComponent.parentId = sourceContainer.id;
          tempTargetComponent.parent_no = sourceContainer.com_no;
          tempTargetComponent.com_seq = sourceContainer.com_seq;
          tempTargetComponent._editType = "update";

          // 交换组件
          this.$set(sourceContainer.children, sourceIndex, tempTargetComponent);
          this.$set(targetContainer.children, targetIndex, tempComponent);

          // 触发更新
          this.$nextTick(() => {
            this.$emit("change", this.editorComponents);
          });
        }
      }
    },

    // 处理组件移动
    moveComponent(data) {
      console.log("moveComponent", data);
      const { sourceContentId, targetContentId, component } = data;

      // 查找源容器和目标容器
      let sourceContainer = null;
      let targetContainer = null;

      // 递归查找容器
      const findContainers = (components) => {
        for (let i = 0; i < components.length; i++) {
          const item = components[i];
          if (item.id === sourceContentId) {
            sourceContainer = item;
          }
          if (item.id === targetContentId) {
            targetContainer = item;
          }
          if (sourceContainer && targetContainer) {
            return true;
          }
          if (item.children && item.children.length > 0) {
            if (findContainers(item.children)) {
              return true;
            }
          }
        }
        return false;
      };

      findContainers(this.editorComponents);

      if (sourceContainer && targetContainer) {
        // 从源容器中移除组件
        const sourceIndex = sourceContainer.children.findIndex(
          (item) => item.id === component.id
        );

        if (sourceIndex !== -1) {
          // 更新父容器ID
          const tempComponent = { ...sourceContainer.children[sourceIndex] };
          tempComponent.parentId = targetContainer.id;
          tempComponent.parent_no = targetContainer.com_no;
          tempComponent.com_seq = targetContainer.com_seq;
          tempComponent._editType = "update";

          // 从源容器移除
          sourceContainer.children.splice(sourceIndex, 1);

          // 添加到目标容器
          targetContainer.children.push(tempComponent);

          // 触发更新
          this.$nextTick(() => {
            this.$emit("change", this.editorComponents);
          });
        }
      }
    },
    findComponentById(id, list = [], data) {
      let result = null;
      for (let i = 0; i < list.length; i++) {
        const item = list[i];
        if (id && (item.id === id || item.com_no === id)) {
          // 检查是否已有children数组
          if (!item.children) {
            this.$set(item, "children", []);
          }
          item.children.push(data);
          result = item;
          break; // 找到后立即退出循环
        }
        if (item.children && item.children.length > 0) {
          const found = this.findComponentById(id, item.children, data);
          if (found) {
            result = found;
            break;
          }
        }
      }
      return result;
    },
    onResize(val) {
      this.$emit("resize", val || {});
    },
    addComponent(val) {
      console.log("addComponent", val);
      if (val?.parentId) {
        this.findComponentById(val.parentId, this.editorComponents, val);
        // 触发更新
        this.$nextTick(() => {
          this.$emit("change", this.editorComponents);
        });
      }
    },
    deleteComponent(val) {
      console.log("deleteComponent", val);
      this.$emit("delete", val);
    },
    // 在methods中添加以下方法
    handleEditorDragOver(e) {
      // 获取拖拽元素的类型
      const draggedType = dragStore.getDragType();
      console.log("handleEditorDragOver", draggedType);
      // 阻止默认行为以允许放置
      e.preventDefault();
      // 检查拖拽元素的类型
      console.log("draggedType", draggedType);
      if (draggedType === "container") {
        // 允许放置容器组件
        e.dataTransfer.dropEffect = "copy";
        e.currentTarget.classList.add("editor-drag-over");
        e.currentTarget.classList.remove("editor-drag-not-allowed");
      } else if (draggedType === "悬浮组件") {
        // 允许放置悬浮组件
        e.dataTransfer.dropEffect = "copy";
        e.currentTarget.classList.add("on-drag-float-component");
        e.currentTarget.classList.add("editor-drag-over");
        e.currentTarget.classList.remove("editor-drag-not-allowed");
      } else if (draggedType) {
        // 不允许放置非容器组件
        e.dataTransfer.dropEffect = "none";
        e.currentTarget.classList.remove("editor-drag-over");
        e.currentTarget.classList.add("editor-drag-not-allowed");
      }
    },
    handleEditorDragLeave(e) {
      e.currentTarget.classList.remove("editor-drag-over");
      e.currentTarget.classList.remove("editor-drag-not-allowed");
      e.currentTarget.classList.remove("on-drag-float-component");
    },
    // 添加拖拽结束处理
    handleEditorDragEnd(e) {
      // 清除拖拽状态
      dragStore.clearDragType();
      // 清除所有拖拽样式
      document
        .querySelectorAll(
          ".editor-drag-over, .editor-drag-not-allowed, .drag-over, .drag-not-allowed"
        )
        .forEach((el) => {
          el.classList.remove("editor-drag-over");
          el.classList.remove("editor-drag-not-allowed");
          el.classList.remove("drag-over");
          el.classList.remove("drag-not-allowed");
        });
    },
    handleEditorDrop(e) {
      e.preventDefault();
      e.currentTarget.classList.remove("editor-drag-over");
      e.currentTarget.classList.remove("editor-drag-not-allowed");
      e.currentTarget.classList.remove("on-drag-float-component");
      // 获取拖拽数据
      const data = e.dataTransfer.getData("text/plain");

      if (data) {
        try {
          const draggedElement = JSON.parse(data);
          // 只处理container类型的组件
          if (draggedElement.type === "container") {
            if (!draggedElement._editType) {
              draggedElement.id = `root_container_${new Date().getTime()}`;
              draggedElement._editType = "add";
              draggedElement._seq = (this.editorComponents.length + 1) * 100; // 计算seq
              // 添加到顶层组件
              this.editorComponents.push(draggedElement);
            }
            this.$emit("change", this.editorComponents);
          } else if (draggedElement.type === "悬浮组件") {
            // 计算当前放入的点相对于editor-view的位置 单位使用百分比
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const xPercent = (x / rect.width) * 100;
            const yPercent = (y / rect.height) * 100;
            console.log("xPercent", xPercent, "yPercent", yPercent);
            draggedElement.position = {
              x: xPercent,
              y: yPercent,
            };
            draggedElement.com_type = "cardGroup";
            draggedElement.component = "float-component";
            if (!draggedElement._editType) {
              draggedElement.id = `root_container_${new Date().getTime()}`;
              draggedElement._editType = "add";
              draggedElement.com_name = "悬浮组件";
              draggedElement.com_option = "悬浮可拖动";
              draggedElement._seq =
                (this.editorComponents.length + 1) * 100 + 10000; // 计算seq
              // 添加到顶层组件
              this.editorComponents.push(draggedElement);
            }
            this.$emit("change", this.editorComponents);
          } else {
            // 不是container类型，显示不允许放置的反馈
            let target = e.currentTarget;
            target.classList.add("editor-drag-not-allowed");
            setTimeout(() => {
              target.classList.remove("editor-drag-not-allowed");
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

<style scoped lang="scss">
.editor-view {
  width: 100%;
  min-width: var(--content-width);
  position: relative;
  padding-bottom: 50px;
  &.editor-drag-over {
    border: 2px dashed #ff740e;
    background-color: rgba(255, 116, 14, 0.05);

    &::before {
      content: "可放置页面容器";
      position: absolute;
      top: 10px;
      left: 10px;
      padding: 5px 10px;
      background-color: #ff740e;
      color: #fff;
      z-index: 100;
      border-radius: 4px;
    }
  }
  &.on-drag-float-component {
    background-color: rgba(255, 116, 14, 0.1);
    &.editor-drag-over {
      &::before {
        content: "放置悬浮组件";
        position: absolute;
        top: 10px;
        left: 10px;
        padding: 5px 10px;
        color: #fff;
        z-index: 100;
        border-radius: 4px;
      }
    }
  }

  &.editor-drag-not-allowed {
    border: 2px dashed #ff0000;
    background-color: rgba(255, 0, 0, 0.05);

    &::before {
      content: "不可放置此组件";
      position: absolute;
      top: 10px;
      left: 10px;
      padding: 5px 10px;
      background-color: #ff0000;
      color: #fff;
      z-index: 100;
      border-radius: 4px;
    }
  }
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0);
  z-index: 0;
  .on-drag-float-component {
    z-index: 9999999;
  }
}
</style>
