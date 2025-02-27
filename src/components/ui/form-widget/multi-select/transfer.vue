<template>
  <div class="tree-transfer">
    <div class="transfer-container">
      <!-- 左侧树形面板 -->
      <transfer-panel
        :data="sourceData"
        :is-tree="isTree"
        :props="defaultProps"
        :load-node="loadNode"
        :filter-method="filterNode"
        :checked-keys="leftChecked"
        :filterable="true"
        @checked-change="handleLeftCheckChange"
        ref="leftPanel"
        v-loading="loading"
        :title="sourceTitle"
      >
      </transfer-panel>
      <!-- 中间操作按钮 -->
      <div class="transfer-buttons">
        <el-button
          type="primary"
          @click="addToRight"
          :disabled="leftChecked && leftChecked.length === 0"
        >
          <i class="el-icon-arrow-right"></i>
        </el-button>
        <el-button
          type="primary"
          @click="removeFromRight"
          :disabled="rightChecked && rightChecked.length === 0"
        >
          <i class="el-icon-arrow-left"></i>
        </el-button>
      </div>
      <!-- 右侧已选面板 -->
      <transfer-panel
        :data="targetData"
        :is-tree="isTree"
        :props="defaultProps"
        :default-expanded-all="true"
        :default-expanded-keys="value"
        @checked-change="handleRightCheckChange"
        :title="targetTitle"
        ref="rightPanel"
      />
    </div>
  </div>
</template>

<script>
import TransferPanel from "./transfer-panel.vue";
import cloneDeep from "lodash/cloneDeep";
export default {
  name: "TreeTransfer",
  components: {
    TransferPanel,
  },
  props: {
    // 数据加载API方法
    loadData: {
      type: Function,
      required: true,
    },
    // 加载子节点方法
    loadNode: {
      type: Function,
      required: true,
      default() {
        return ()=>{};
      }
    },
    defaultProps: {
      type: Object,
      default: () => ({
        key:'id',
        children: "children",
        label: "label",
        isLeaf: "isLeaf",
      }),
    },
    value: {
      type: Array,
      default: () => [],
    },
    isTree: {
      type: Boolean,
      default: false,
    },
    calcTitles: {
      type: Array,
      default: () => ["请选择", "已选"],
    },
  },
  computed: {
    sourceTitle() {
      return this.calcTitles[0];
    },
    targetTitle() {
      return this.calcTitles[1];
    },
    sourceData() {
      if (this.isTree) {
        const filterTree = (data) => {
          return data.filter((item) => {
            if (item.children) {
              item.children = filterTree(item.children);
            }
            if (this.value?.includes(item[this.defaultProps.key || "id"])) {
              return false;
            } else {
              return true;
            }
          });
        };
        return filterTree(cloneDeep(this.allData||[]));
      }
      return this.allData?.filter(
        (item) => !this.value?.includes(item[this.defaultProps.key || "id"])
      );
    },
    targetData() {
      if (this.isTree) {
        const filterTree = (data) => {
          return data.filter((item) => {
            if (item.children) {
              item.children = filterTree(item.children);
            }
            if (item.children.length) {
              return true;
            }
            if (this.value?.includes(item[this.defaultProps.key || "id"])) {
              return true;
            } else {
              return false;
            }
          });
        };
        return filterTree(cloneDeep(this.allData||[]));
      }
      return this.allData?.filter((item) =>
        this.value?.includes(item[this.defaultProps.key || "id"])
      );
    },
  },
  data() {
    return {
      filterText: "",
      flatData: [], // 平铺数据
      allData: [], // 所有数据
      leftChecked: [], // 左侧已选
      rightChecked: [], // 右侧已选
      currentPage: 1,
      pageSize: 5000,
      total: 0,
      loading: false,
    };
  },
  mounted() {
    this.loadPageData();
  },
  methods: {
    // 加载分页数据
    async loadPageData() {
      this.loading = true;
      try {
        const { data, total, rownumber, flatData } = await this.loadData({
          page: this.currentPage,
          pageSize: this.pageSize,
        });
        this.allData = cloneDeep(data||[]);
        this.total = total;
        this.pageSize = rownumber || 10;
        this.flatData = flatData;
      } catch (error) {
        console.error("加载数据失败:", error);
      } finally {
        this.loading = false;
      }
    },
    // 分页变化
    handlePageChange(page) {
      this.currentPage = page;
      this.loadPageData();
    },
    // 过滤节点方法
    filterNode(value, data) {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    },
    // 左侧选中变化
    handleLeftCheckChange(checked) {
      // 可以在这里处理选中逻辑
      this.leftChecked = checked;
      console.log(this.leftChecked);
    },
    // 右侧选中变化
    handleRightCheckChange(checked) {
      // 可以在这里处理选中逻辑
      this.rightChecked = checked;
      console.log(this.rightChecked);
    },
    // 添加到右侧
    addToRight() {
      // const checkedNodes = this.$refs.leftPanel?.getCheckedNodes();
      // this.targetData = [...this.targetData, ...checkedNodes];

      console.log(this.$refs.leftPanel?.getCheckedKeys());
      this.$emit("addToRight", this.$refs.leftPanel?.getCheckedKeys());
      // 清除左侧选中状态
      this.$refs.leftPanel.setCheckedKeys([]);
    },
    // 从右侧移除
    removeFromRight() {
      // const checkedNodes = this.$refs.rightPanel?.getCheckedNodes();
      // this.targetData = this.targetData.filter(
      //   (node) => !checkedNodes.some((checked) => checked.id === node.id)
      // );
      this.$emit("removeFromRight", this.$refs.rightPanel?.getCheckedKeys());
      // 清除右侧选中状态
      this.$refs.rightPanel.setCheckedKeys([]);
    },
  },
};
</script>

<style scoped lang="scss">
.tree-transfer {
  padding: 0;
  border: 1px solid #dee2e6 !important;
  border-radius: 0.2rem;
  overflow: hidden;
}

.transfer-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.transfer-panel {
  min-width: 200px;
  border: 1px solid #dcdfe6;
  border-top: none;
  border-bottom: none;
  flex: 1;
  &:first-child {
    border-left: none;
  }
  &:last-child {
    border-right: none;
  }
}

.panel-header {
  height: 40px;
  line-height: 40px;
  background: #f5f7fa;
  padding: 0 15px;
  border-bottom: 1px solid #dcdfe6;
}

.panel-body {
  padding: 10px;
  display: flex;
  height: 400px;
  flex-direction: column;
  .tree-content {
    flex: 1;
    display: flex;
    overflow-y: auto;
    width: 100%;
  }
}

.panel-footer {
  padding: 0;
  text-align: center;
  border-top: 1px solid #dcdfe6;
}

.transfer-buttons {
  padding: 0 10px;
  display: flex;
  flex-direction: column;
  .el-button {
    margin-bottom: 10px;
    margin-left: 0;
  }
}

.el-input {
  margin-bottom: 10px;
}
</style>
