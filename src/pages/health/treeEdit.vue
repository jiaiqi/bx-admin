<template>
  <div class="tree-edit">
    <div class="btn-box">
      <el-button type="primary" @click="selectAll">全选</el-button>
      <el-button type="primary" @click="selectNone">全不选</el-button>
      <el-button type="primary" @click="selectReverse">反选</el-button>
      <el-button type="primary" @click="save">保存</el-button>
      <el-button type="primary" @click="getTreeData">刷新</el-button>
    </div>
    <div class="tree-box" v-loading="loading">
      <el-tree :data="data" show-checkbox node-key="id" :props="defaultProps" :defaultCheckedKeys="checkedKeys"
        :default-expand-all="true" ref="tree">
      </el-tree>
    </div>
    <!-- <div class="btn-box">
      <el-button type="primary" @click="save">保存</el-button>
    </div> -->
  </div>
</template>

<script>
import { $http } from "@/common/http";

export default {
  name: 'treeEdit',
  data() {
    return {
      app: "hsprl",
      service: "srvjk_classify_select",
      updateService: "srvjk_classify_update",
      labelCol: 'classify_name',
      pIdCol: 'p_uid',
      idCol: 'uid',
      list: [],
      checkedKeys: [],
      data: [{
        id: 1,
        label: '一级 1',
        children: [{
          id: 4,
          label: '二级 1-1',
          children: [{
            id: 9,
            label: '三级 1-1-1'
          }, {
            id: 10,
            label: '三级 1-1-2'
          }]
        }]
      }, {
        id: 2,
        label: '一级 2',
        children: [{
          id: 5,
          label: '二级 2-1'
        }, {
          id: 6,
          label: '二级 2-2'
        }]
      }, {
        id: 3,
        label: '一级 3',
        children: [{
          id: 7,
          label: '二级 3-1'
        }, {
          id: 8,
          label: '二级 3-2'
        }]
      }],
      defaultProps: {
        children: 'children',
        label: this.labelCol
      },
      loading: false
    }
  },
  methods: {
    selectAll() {
      this.$refs.tree.setCheckedKeys(this.list.map(item => item.id))
    },
    selectNone() {
      this.$refs.tree.setCheckedKeys([])
    },
    selectReverse() {
      // 获取所有节点
      const allNodes = this.list.map(item => item.id)
      // 获取当前选中的节点（包括父节点和子节点）
      const checkedKeys = this.$refs.tree.getCheckedKeys()
      // 获取半选中的节点（父节点）
      const halfCheckedKeys = this.$refs.tree.getHalfCheckedKeys()
      // 排除所有已选中和半选中的节点
      const uncheckedKeys = allNodes.filter(id =>
        !checkedKeys.includes(id) && !halfCheckedKeys.includes(id)
      )
      // 设置反选结果
      this.$refs.tree.setCheckedKeys(uncheckedKeys)
    },
    save() {
      const checkedKeys = this.$refs.tree.getCheckedKeys()
      console.log(checkedKeys)
      const req = [
        {
          serviceName: this.updateService,
          condition: [{ colName: "id", ruleType: "in", value: checkedKeys.toString() }],
          data: [{ comment_open: "是" }]
        }
      ]
      const list = this.list.filter(item => !checkedKeys.includes(item.id))
      req.push(
        {
          serviceName: this.updateService,
          condition: [{ colName: "id", ruleType: "in", value: list.map(item => item.id).toString() }],
          data: [{ comment_open: "否" }]
        }
      )
      this.loading = true
      let url = `${this.app}/update/${this.updateService}`
      $http.post(url, req).then(res => {
        console.log(res.data)
        this.loading = false
        if (res.data.state === 'SUCCESS') {
          this.$message.success('保存成功')
          this.getTreeData()
        }
      })
    },
    getTreeData() {
      let url = `${this.app}/select/${this.service}`
      const req = {
        serviceName: this.service,
        colNames: ["*"],
        // condition: [{ colName: "p_uid", ruleType: "isnull" }],
        relation_condition: {},
        page: { pageNo: 1, rownumber: 9999 },
        order: [],
        use_type: "treelist"
      }
      this.loading = true
      $http.post(url, req).then(res => {
        console.log(res)
        if (res.data.state === 'SUCCESS') {
          this.list = res.data.data
          this.data = this.buildTreeData(this.list)
        }
        this.loading = false
      })
    },
    buildTreeData(list) {
      let data = []
      const idCol = this.idCol
      const pIdCol = this.pIdCol
      const labelCol = this.labelCol
      const isChecked = (item) => item?.comment_open === '是'
      this.checkedKeys = []

      list.forEach(item => {
        // 设置节点是否为叶子节点的标志
        item.isLeaf = item.is_leaf === '是'
        // 设置节点显示的文本标签
        item.label = item[labelCol]
        // 如果节点被选中（comment_open为'是'）
        if (isChecked(item)) {
          // 将节点ID添加到选中节点数组中
          this.checkedKeys.push(item.id)
        }
        // 如果是根节点（没有父节点ID）
        if (!item[pIdCol]) {
          // 将根节点添加到结果数组中
          data.push(item)
          // 递归构建当前节点的子节点
          item.children = buildChildren(item)
        }

      })
      function buildChildren(item) {
        // 从列表中筛选出父ID等于当前节点ID的所有子节点
        let children = list.filter(i => i[pIdCol] === item[idCol])
        // 递归处理每个子节点，为它们构建各自的子节点
        children.forEach(i => {
          i.children = buildChildren(i)
        })
        // 返回构建好的子节点数组
        return children
      }
      return data
    }
  },
  mounted() {
    this.getTreeData()
  }
}
</script>

<style scoped lang="scss">
.tree-edit {
  display: flex;
  flex-direction: column;
  height: 100%;
  align-items: center;
  padding: 20px;

  ::v-deep .el-button--primary {
    background: linear-gradient(159.97deg, rgba(206, 234, 158, 1) -140.78%, rgba(53, 179, 137, 1) 89.45%);
    border: none;
  }

  ::v-deep .el-tree {
    .el-checkbox__input.is-checked .el-checkbox__inner,
    .el-checkbox__input.is-indeterminate .el-checkbox__inner {
      background-color:#61C38F;
      border-color: #61C38F;

    }
  }

  .tree-box {
    flex: 1;
    max-width: 1200px;
    min-width: 800px;
    padding: 10px;
    overflow-y: auto;

    ::v-deep .el-tree-node__content {
      height: 30px;
      line-height: 30px;
    }

  }

  .btn-box {
    margin-top: 10px;
    text-align: center;
    padding: 10px;
  }
}
</style>