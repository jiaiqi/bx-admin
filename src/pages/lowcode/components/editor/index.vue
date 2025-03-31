<template>
  <div class="editor-view">
    <div class="overlay" @click="clickOutside"></div>
    <VueDraggable
      v-model="editorComponents"
      @start="onStart"
      @update="onUpdate"
      @end="onEnd"
      :animation="150"
      handle=".handle"
      style="width: 100%; display: contents"
    >
      <lc-view
        v-for="item in editorComponents"
        :current-id="currentId"
        :key="item.id"
        v-bind="item"
        @click="onTap"
        @open="openComponentSelector = true"
        @add="addComponent"
      >
      </lc-view>
    </VueDraggable>
  </div>
</template>

<script>
// import LcBlock from "../materials/block.vue";
// import LcContainer from "../materials/container.vue";
// import LcContent from "../materials/content-item.vue";
import lcView from "../materials/view.vue";
import { VueDraggable } from "vue-draggable-plus";
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
    components: {
      type: Array,
      default: () => [],
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
      currentId: null,
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
      this.currentId = null;
    },
    onTap(val) {
      console.log("onTap", val);
      this.currentId = val.id;
      this.$emit("select", val.id);
    },
    findComponentById(id, list=[], data) {
      let result = null
      for (let i = 0; i < list.length; i++) {
        const item = list[i];
        if(id && item.id === id){
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
    addComponent(val) {
      console.log("addComponent", val);
      if(val?.parentId){
        this.findComponentById(val.parentId, this.editorComponents, val);
        // 触发更新
        this.$nextTick(() => {
          this.$emit("change", this.editorComponents);
        });
      }
    },
  },
};
</script>

<style scoped lang="scss">
.editor-view {
  height: 100%;
  width: 100%;
  position: relative;
}
.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0);
  z-index: 0;
}
</style>
