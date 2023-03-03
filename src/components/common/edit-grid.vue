<template>
  <div>
    <el-table ref="multipleTable" :data="tableData" border class="tb-edit" style="width: 100%"
      @selection-change="handleSelectionChange" highlight-current-row>
      <el-table-column type="selection" label="全选" header-align="left" v-if="tableData && tableData.length > 0">
      </el-table-column>
      <el-table-column :prop="data.columns" :label="data.label" v-for="(data, index) in tableHeadr" :key="index"
        v-if="data.isShow">
        <template slot-scope="scope">
          <el-input-number size="small" v-if="data.isEdit && (data.colType === 'Integer' || 'int' || 'float' || 'money')"
            v-model="scope.row[data.columns]" @change="handleEdit(scope.$index, scope.row)" :min="0"
            label=""></el-input-number>
          <el-input size="small" v-else-if="data.isEdit && data.colType === 'String'" v-model="scope.row[data.columns]"
            @change="handleEdit(scope.$index, scope.row)"></el-input>
          <span v-else>{{ scope.row[data.columns] }}</span>
        </template>
      </el-table-column>
    </el-table>

    <div style="text-align: center; margin-top: 20px;">
      <el-button type="primary" size="small" @click="closeDialog()">确定</el-button>
    </div>
  </div>
</template>


<script>

export default {
  components: {
  },

  props: {
    service: {
      type: String
    },
    _service: {
      type: String
    },
    buttonInfo: {},
  },

  data() {
    return {
      service_name: this._service || this.$route.params.service_name,
      tableHeadr: [],
      tableData: [],
      addCols: [],
      moreConfig: JSON.parse(this.buttonInfo.more_config),
    };
  },
  created: function () {
    this.getData();
  },
  methods: {
    getData() {
      let serviceObj = null

      this.loadColsV2(this.service_name, "selectlist", this.moreConfig.app_name).then(response => {
        const resData = response.body.data
        const srv_cols = resData.srv_cols

        srv_cols.forEach(item => {
          if (item.columns === this.moreConfig['batch_add_select_fill_grid_srv_option_list_col']) {
            serviceObj = item.option_list_v2
          }

          let obj = JSON.parse(JSON.stringify(item))
          this.addCols = this.moreConfig.update_able_cols
          this.addCols.forEach(col => {
            if (col === item.columns) {
              obj.label = item.label
              obj.columns = item.columns
              obj.isEdit = true
              obj.colType = item.bx_col_type
              obj.isShow = true
            }
          })
          this.tableHeadr.push({ ...item, ...obj })
        })

        this.select(
          serviceObj.serviceName,
        ).then(response => {
          let list = response.body.data;

          const k_col = serviceObj.key_disp_col
          const r_col = serviceObj.refed_col
          this.tableHeadr.unshift({
            label: r_col,
            columns: r_col,
            isShow: true
          })
          this.tableHeadr.unshift({
            label: k_col,
            columns: k_col,
            isShow: true
          })

          list.forEach(item => {
            let obj = {}
            obj[k_col] = item[k_col]
            obj[r_col] = item[r_col]

            this.moreConfig.update_able_cols.forEach(col => {
              obj[col] = 0
            })

            this.tableData.push({ ...item, ...obj })
          })

          // 上次选中行数据回显
          let frontTableData = this.$store.getters.getFrontTableData()
          if (JSON.stringify(frontTableData) !== '{}') {
            let rows = []

            this.tableData.forEach(data => {
              frontTableData.selectFillGrid.forEach(ck => {
                let key = this.moreConfig.check_set_1_col
                if (ck[key] > 0) {
                  if (data.id === ck.id) {
                    this.addCols.forEach(col => {
                      data[col] = ck[col]
                    })
                    rows.push(data)
                  }
                } else {
                  // vuex里删除空数据行
                }
              })
            })

            rows.forEach(row => {
              this.$refs.multipleTable.toggleRowSelection(row)
            })
          }
        });
      });
    },
    handleSelectionChange(val) {
      let idList = this.$refs.multipleTable.selection.map(item => item.id)
      let key = this.moreConfig.check_set_1_col
      const result = this.tableData.filter(item => !val.includes(item))

      this.tableData.forEach(item => {
        idList.forEach(id => {
          if (id === item.id) {
            if (item[key] === 0) {
              item[key] = 1
            }
          }
        })

        result.forEach(res => {
          if (item.id === res.id) {
            item[key] = 0
          }
        })
      })
    },
    handleEdit(index, row) {
      let key = this.moreConfig.check_set_1_col

      if (row[key] === 0) {
        this.$refs.multipleTable.toggleRowSelection(row, false)
      } else {
        this.$refs.multipleTable.toggleRowSelection(row, true)
      }
    },
    closeDialog() {
      this.$emit('closeDialog')

      this.$store.commit("setFrontTableData", {
        table: 'selectFillGrid',
        data: this.$refs.multipleTable.selection
      })
    }
  }
};
</script>
<style scoped></style>
