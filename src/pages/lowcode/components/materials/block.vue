<template>
  <div class="lc-block" :class="[subType]">
    <div
      class="overlay"
      @click="$emit('click', props)"
      :class="{ active: currentId && currentId === id }"
    >
      <!-- <div class="handle">
        <i class="el-icon-rank"></i>
      </div> -->
    </div>
    <slot />
  </div>
</template>

<script>
export default {
  name: "lc-block",
  components: {  },
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
  },
  computed: {
    props() {
      return { ...this.$props, ...(this.$attrs || {}) };
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
}
.layout-1-1 {
  // 一行一列
  display: flex;
}
.layout-1-2 {
  // 一行两列
  display: grid;
  grid-template-columns: 1fr 1fr;
}
.layout-1-3 {
  // 一行三列
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
}
</style>
