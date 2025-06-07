<template>
  <div class="catalog-tree">
    <el-tree
      :data="data"
      :props="defaultProps"
      @node-click="handleNodeClick"
      :render-content="renderContent"
      ref="elTree"
      v-if="unfold"
    ></el-tree>
  </div>
</template>

<script>
export default {
  name: "CatalogTree",
  props: {
    defaultProps: {
      type: Object,
      default: () => ({
        children: "children",
        label: "name",
      }),
    },
    data: {
      type: Array,
      default: () => [],
    },
    unfold: {
      type: Boolean,
      default: false,
    }
  },
  data() {
    return {};
  },
  watch: {
    unfold: {
      immediate: false,
      deep: true,
      handler(newValue, oldValue) {
        if(oldValue===true&&newValue===false){
          
        }
      }
    }
  },
  methods: {
    handleNodeClick(data) {
      console.log("handleNodeClick", data);
      this.$emit("node-click", data);
    },
    renderContent(h, { node, data, store }) {
      return node.expanded ? (
        <span class="custom-tree-node">
          <span>{node.label}</span>
          {node.isLeaf ? null : (
            <span class="el-icon-arrow-right expanded"></span>
          )}
        </span>
      ) : (
        <span class="custom-tree-node">
          <span>{node.label}</span>
          {node.isLeaf ? null : <span class="el-icon-arrow-right"></span>}
        </span>
      );
    },
  },
};
</script>

<style lang="scss" scoped>
.catalog-tree {
  :deep(.el-tree) {
    background: transparent;
    border: none;
    overflow: hidden;
    .el-tree-node__content {
      height: 36px;
    }
    .el-tree-node__expand-icon {
      display: none;
    }
  }
  :deep(.custom-tree-node) {
    text-align: center;
    width: 100%;
    margin-left: 20px;
    font-weight: normal;
    font-size: 0.8em;
    position: relative;
    line-height: 36px;
    justify-content: center;
    .el-icon-arrow-right {
      position: absolute;
      right: 5px;
      top: 50%;
      transform: translateY(-50%);
      transition: transform 0.3s ease;
      &.expanded {
        transform: translateY(-50%) rotate(90deg);
      }
    }
  }
}
</style>
