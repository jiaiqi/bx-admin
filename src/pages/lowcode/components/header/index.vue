<template>
  <div class="header-view">
    <div class="left"></div>
    <div class="center">可视化编辑器</div>
    <div class="right"></div>
  </div>
</template>

<script>
export default {
  name: "lowcode-header",
  data() {
    return {
      //
    };
  },
  methods: {
    //
  },
};
</script>

<style lang="scss" scoped>
.header-view{
  --header-height: 50px;
  --header-background-color: #fff;
  --header-color: #333;

  background-color: var(--header-background-color);
  height: var(--header-height);
  line-height: var(--header-height);
  color: var(--header-color);
  padding: 0 10px;
  border-bottom: 1px solid #f1f1f1;
  display: flex;
  justify-content: space-between;
}
</style>