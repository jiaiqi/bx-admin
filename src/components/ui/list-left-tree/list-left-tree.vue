<template>
  <div class="list-left-tree">
    <!-- 搜索框 -->
    <div class="tree-search-box">
      <el-input
        v-model="filterText"
        placeholder="搜索节点"
        prefix-icon="el-icon-search"
        clearable
        @input="handleFilter"
      />
    </div>
    <!-- 树结构 -->
    <div class="tree-container">
      <el-tree
        ref="tree"
        :data="processedTreeData"
        :props="treeProps"
        :load="loadNode"
        node-key="value"
        highlight-current
        :filter-node-method="filterNode"
        @node-click="handleNodeClick"
        @node-expand="handleNodeExpand"
        @node-collapse="handleNodeCollapse"
        lazy
      >
        <template #default="{ node, data }">
          <span class="custom-tree-node">
            <span>{{ data.label }}</span>
          </span>
        </template>
      </el-tree>
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
      filterText: '',
      treeData: [],
      processedTreeData: [],
      expandedNodes: new Set(),
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
        label: 'label',
        children: 'children',
        isLeaf: 'isLeaf',
      };
    },
  },
  watch: {
    filterText(val) {
      this.$refs.tree?.filter(val);
    },
  },
  methods: {
    // 处理搜索
    handleFilter() {
      this.$refs.tree?.filter(this.filterText);
    },
    // 节点过滤方法
    filterNode(value, data) {
      if (!value) return true;
      return data.label.toLowerCase().includes(value.toLowerCase());
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
    async getTreeData(parent_no) {
      const url = `/${this.srvApp}/select/${this.service}`;
      const req = {
        serviceName: this.service,
        colNames: ["*"],
        condition: [
          {
            colName: this.parentCol || "parent_no",
            ruleType: parent_no ? "eq" : "isnull",
            value: parent_no,
          },
        ],
        page: { pageNo: 1, rownumber: 50 },
        use_type: "treelist",
      };
      try {
        const res = await this.$http.post(url, req);
        if (res?.data?.state === "SUCCESS") {
          return res?.data?.data?.map((item) => ({
            _raw: item,
            label: item[this.labelCol],
            value: item[this.valueCol],
            parent_no: item[this.parentCol],
            isLeaf: false, // 默认不是叶子节点，需要根据实际数据判断
          })) || [];
        }
        return [];
      } catch (error) {
        console.error('获取树数据失败:', error);
        return [];
      }
    },
    // 节点点击事件
    handleNodeClick(data, node) {
      console.log('点击节点:', data, node);
      this.$emit('node-click', data, node);
    },
    // 节点展开事件
    handleNodeExpand(data, node) {
      this.expandedNodes.add(data.value);
      this.$emit('node-expand', data, node);
    },
    // 节点折叠事件
    handleNodeCollapse(data, node) {
      this.expandedNodes.delete(data.value);
      this.$emit('node-collapse', data, node);
    },
    // 清空选择
    clearSelection() {
      this.$refs.tree?.setCurrentKey(null);
    },
    // 设置默认选中
    setDefaultSelected(key) {
      this.$refs.tree?.setCurrentKey(key);
    },
  },
  created() {
    // 组件创建时初始化数据
  },
};
</script>

<style lang="scss" scoped>
.list-left-tree {
  min-width: 200px;
  height: 100%;
  overflow-y: auto;
  border: 1px solid rgba(229, 229, 234, 1);
  display: flex;
  flex-direction: column;
  
  .tree-search-box {
    padding: 10px;
    border-bottom: 1px solid rgba(229, 229, 234, 1);
  }
  
  .tree-container {
    flex: 1;
    overflow-y: auto;
    padding: 0 10px 10px;
  }
  
  .custom-tree-node {
    display: flex;
    align-items: center;
    height: 30px;
  }
}
</style>