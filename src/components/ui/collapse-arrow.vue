<template>
  <span class="collapse-arrow" :class="{ 'is-collapse': collapse }">
    <i class="el-icon-arrow-up"></i>
  </span>
</template>

<script>
export default {
  props: {
    collapse: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

<style lang="scss" scoped>
.collapse-arrow {
  display: inline-block;
  transition: transform 0.3s ease-in-out;
  &.is-collapse {
    transform: rotate(180deg);
    transform-origin: center;
  }
}
</style>
