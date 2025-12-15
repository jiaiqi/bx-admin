<template>
  <div class="list-left-tree-wrap">
    <div class="list-left-tree">
      <!-- 搜索框 -->
      <div class="tree-search-box">
        <el-input
          v-model="filterText"
          placeholder="搜索节点"
          prefix-icon="el-icon-search"
          clearable
          @change="handleFilter"
        />
      </div>
      <!-- 树结构 -->
      <div class="tree-container" v-loading="loading">
        <el-tree
          ref="tree"
          :data="processedTreeData"
          :props="treeProps"
          :load="loadNode"
          node-key="value"
          highlight-current
          @node-click="handleNodeClick"
          @node-expand="handleNodeExpand"
          @node-collapse="handleNodeCollapse"
          lazy
        >
          <template #default="{ data }">
            <span class="custom-tree-node">
              <span>{{ data.label }}</span>
            </span>
          </template>
        </el-tree>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    cfgJson: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      filterText: "",
      treeData: [],
      processedTreeData: [],
      expandedNodes: new Set(),
      isSearching: false,
      loading: false,
    };
  },
  computed: {
    filterCol() {
      return this.cfgJson?._list_json?.tree_filter_list_fk_col;
    },
    srvApp() {
      return this.cfgJson?._list_json?.tree_filter_mapp;
    },
    service() {
      return this.cfgJson?._list_json?.tree_filter_srv;
    },
    pathCol() {
      return this.cfgJson?._list_json?.tree_filter_srv_path_col;
    },
    dataPathCol() {
      return this.cfgJson?._list_json?.tree_filter_path_col;
    },
    labelCol() {
      return this.cfgJson?.fkColInfo?.option_list_v2?.key_disp_col;
    },
    valueCol() {
      return this.cfgJson?.fkColInfo?.option_list_v2?.refed_col;
    },
    parentCol() {
      return this.cfgJson?.fkColInfo?.option_list_v2?.parent_col;
    },
    treeProps() {
      return {
        label: "label",
        children: "children",
        isLeaf: "isLeaf",
      };
    },
  },
  watch: {
    filterText(val) {
      this.handleFilter();
    },
  },
  methods: {
    // 处理搜索
    handleFilter() {
      this.isSearching = this.filterText !== "";
      // 清空树数据，重新加载
      // if (this.$refs.tree) {
      // this.$refs.tree.setData([]);
      this.processedTreeData = [];
      this.loadSearchData();
      // }
    },
    // 加载搜索数据
    async loadSearchData() {
      const searchData = await this.getTreeData(null, this.filterText);
      // if (this.$refs.tree) {
      // this.$refs.tree.setData(searchData);
      this.processedTreeData = searchData;
      // }
    },
    // 加载节点数据
    async loadNode(node, resolve) {
      if (node.level === 0) {
        // 根节点加载
        const rootData = await this.getTreeData(null);
        resolve(rootData);
      } else {
        // 子节点加载
        const childrenData = await this.getTreeData(node.data.value);
        resolve(childrenData);
      }
    },
    // 获取树数据
    async getTreeData(parent_no, searchText = "") {
      const url = `/${this.srvApp}/select/${this.service}`;
      let condition = [
        {
          colName: this.parentCol || "parent_no",
          ruleType: parent_no ? "eq" : "isnull",
          value: parent_no,
        },
      ];

      // 如果有搜索文本，添加搜索条件
      if (searchText) {
        condition = [
          {
            colName: this.labelCol,
            ruleType: "like",
            value: `%${searchText}%`,
          },
        ];
      }

      const req = {
        serviceName: this.service,
        colNames: ["*"],
        condition,
        rdt: "ttd",
      };
      try {
        this.loading = true;
        const res = await this.$http.post(url, req);
        this.loading = false;
        if (res?.data?.state === "SUCCESS") {
          return (
            res?.data?.data?.map((item) => ({
              _raw: item,
              label: item[this.labelCol],
              value: item[this.valueCol],
              parent_no: item[this.parentCol],
              isLeaf: item.is_leaf === "是",
            })) || []
          );
        }
        return [];
      } catch (error) {
        console.error("获取树数据失败:", error);
        return [];
      }
    },
    // 节点点击事件
    handleNodeClick(data, node) {
      console.log("点击节点:", data, node);
      this.$emit("node-click", data, node);
    },
    // 节点展开事件
    handleNodeExpand(data, node) {
      this.expandedNodes.add(data.value);
      this.$emit("node-expand", data, node);
    },
    // 节点折叠事件
    handleNodeCollapse(data, node) {
      this.expandedNodes.delete(data.value);
      this.$emit("node-collapse", data, node);
    },
    // 清空选择
    clearSelection() {
      this.$refs.tree?.setCurrentKey(null);
    },
    // 设置默认选中
    setDefaultSelected(key) {
      this.$refs.tree?.setCurrentKey(key);
    },
    // 加载初始数据
    loadInitialData() {
      this.isSearching = false;
      // if (this.$refs.tree) {
      // this.$refs.tree.setData([]);
      // }
    },
  },
  created() {
    // 组件创建时初始化数据
    this.loadInitialData();
  },
};
</script>

<style lang="scss" scoped>
.list-left-tree-wrap {
  padding-left: 10px;
  padding-bottom: 10px;
}
.list-left-tree {
  min-width: 200px;
  height: 100%;
  overflow-y: auto;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;

  // 响应式设计
  @media (max-width: 768px) {
    min-width: 180px;
  }

  @media (max-width: 480px) {
    min-width: 160px;
  }

  .tree-search-box {
    padding: 12px;
    border-bottom: 1px solid #e5e7eb;

    :deep(.el-input__wrapper) {
      border-radius: 6px;
      border: 1px solid #e5e7eb;
      transition: all 0.2s ease;

      &:hover {
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }

      &.is-focus {
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }
    }

    :deep(.el-input__inner) {
      font-size: 14px;
      line-height: 20px;
      color: #374151;
    }
  }

  .tree-container {
    flex: 1;
    overflow-y: auto;
    padding: 8px 0;

    // 自定义滚动条
    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: #f9fafb;
      border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb {
      background: #d1d5db;
      border-radius: 3px;

      &:hover {
        background: #9ca3af;
      }
    }

    // 优化树节点样式
    :deep(.el-tree) {
      font-size: 14px;
      line-height: 22px;
      color: #374151;

      // 节点间距
      .el-tree-node {
        padding: 2px 0;
      }

      // 节点内容
      .el-tree-node__content {
        height: 30px;
        line-height: 30px;
        border-radius: 4px;
        transition: all 0.2s ease;

        &:hover {
          background-color: #f3f4f6;
        }
      }

      // 选中节点样式
      .el-tree-node.is-current > .el-tree-node__content {
        background-color: #dbeafe;
        color: #1d4ed8;
        font-weight: 500;
      }

      // 节点图标
      .el-tree-node__expand-icon {
        font-size: 12px;
        color: #9ca3af;
        transition: transform 0.2s ease;

        &:hover {
          color: #3b82f6;
        }

        &.is-expanded {
          transform: rotate(90deg);
        }
      }

      // 叶子节点图标占位
      .el-tree-node__expand-icon.is-leaf {
        color: transparent;
      }

      // 优化节点文本样式
      .el-tree-node__label {
        font-size: 14px;
        line-height: 22px;
        transition: all 0.2s ease;
      }
    }
  }

  .custom-tree-node {
    display: flex;
    align-items: center;
    height: 100%;
    cursor: pointer;
  }
}
</style>