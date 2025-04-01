<template>
  <div class="header-view">
    <div class="left">
      <el-button @click="showJSON" size="mini">页面JSON</el-button>
    </div>
    <div class="center">可视化编辑器</div>
    <div class="right">
      <el-button type="primary" size="small" @click="togglePreview">
        {{ isPreview ? '退出预览' : '预览' }}
      </el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: "lowcode-header",
  props: {
    isPreview: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      //
    };
  },
  methods: {
    togglePreview() {
      this.$emit('toggle-preview');
    },
    showJSON() {
      this.$emit('show-json');
    }
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

.right {
  display: flex;
  align-items: center;
}
</style>