<template>
  <div class="row-container">
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

export default {
  name: "lc-container",
  components: {
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
  },
  computed: {
    props() {
      return { ...this.$props, ...(this.$attrs || {}) };
    },
  },
  methods: {},
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
      border: 1px dashed #ff740e;
      &::before {
        content: "容器";
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
