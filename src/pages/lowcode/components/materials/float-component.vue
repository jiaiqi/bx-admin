<template>
  <div class="float-component" :style="[setPosition]" @click.stop="onTap">
    <!-- 遮罩层 -->
    <div
      class="overlay"
      @click.stop="onTap"
      :class="{
        active: isActive,
      }"
      v-if="!isPreview && !isView"
    >
      <!-- 删除按钮 -->
      <div class="com-name-overlay">
        <i class="el-icon-close button close-icon" @click.stop="onDelete"></i>
      </div>
    </div>
    <page-item v-bind="props" v-if="props.data"></page-item>
    <span v-else>悬浮组件</span>
  </div>
</template>

<script>
import pageItem from "@/pages/datav/component/page-item/page-item.vue";

export default {
  components: {
    pageItem,
  },
  props: {
    id: {
      type: [String, Number],
      default: "",
    },
    currentId: {
      type: [String, Number],
      default: "",
    },
    position: {
      type: Object,
      default: () => ({
        x: 0,
        y: 0,
      }),
    },
    isPreview: {
      type: Boolean,
      default: false,
    },
    isView: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    isActive() {
      return this.currentId && this.id === this.currentId;
    },
    setPosition() {
      if (this.props.layout_x) {
        return {
          position: "absolute",
          left: this.props.layout_x + "%",
          top: this.props.layout_y + "%",
        };
      }
      return {
        position: "absolute",
        left: this.position.x + "%",
        top: this.position.y + "%",
      };
    },
    props() {
      return { ...this.$props, ...(this.$attrs || {}) };
    },
  },
  methods: {
    onTap() {
      if (this.isPreview || this.isView) return;
      let val = this.props;
      console.log("onTap:", val);
      this.$emit("click", val);
    },
    onDelete() {
      this.$emit("delete", this.props);
    },
  },
};
</script>

<style lang="scss" scoped>
@use "../../styles/layout.common.scss" as layout;

.float-component {
  width: 100px;
  height: 100px;
  position: absolute;
  z-index: 999;
  transform: translate(-50%, -50%);

  .overlay {
    @include layout.overlay;
    z-index: 99;
    $primary-color: #17d57e;
    &.child-is-layout {
      z-index: 0;
    }
    .name {
      background-color: rgba($color: $primary-color, $alpha: 0.7);
    }
    .close-icon {
      height: 28px;
      width: 28px;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: rgba($color: $primary-color, $alpha: 0.7);
      cursor: pointer;
      &:hover {
        font-size: 1.2em;
      }
    }
    &:hover {
      border: 2px dashed rgba($color: $primary-color, $alpha: 1);
      background-color: rgba($color: $primary-color, $alpha: 0.1);
    }
    &.active {
      border: 2px solid $primary-color;
    }
  }
}
</style>
