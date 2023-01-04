<template>
  <div
    style="padding-bottom: 17px; box-sizing: border-box"
    class="handle-row flex-between"
  >
    <div class="left">
      <div class="common-filter">
        <el-form :inline="true" v-if="canMount" :model="formLabelAlign">
          <el-form-item :key="item.key" v-for="item in domFilterItem">
            <el-input
              size="mini"
              :placeholder="`请输入${item.label}`"
              v-if="
                item.col_type == 'String' && formLabelAlign[`${item.columns}`]
              "
              v-model="formLabelAlign[`${item.columns}`].value"
            ></el-input>
            <el-input
              size="mini"
              type="number"
              :placeholder="`请输入${item.label}`"
              v-if="
                item.col_type == 'Float' && formLabelAlign[`${item.columns}`]
              "
              v-model="formLabelAlign[`${item.columns}`].value"
            ></el-input>
            <el-select
              v-if="
                item.option_data_type == 'local' &&
                formLabelAlign[`${item.columns}`]
              "
              size="mini"
              :multiple="true"
              style="width: 145px; margin-right: 15px"
              v-model="formLabelAlign[`${item.columns}`].value"
              :placeholder="`请选择${item.label}`"
              :clearable="true"
            >
              <el-option
                v-for="listItem in item.option_list_v2"
                :key="listItem.value"
                :label="listItem.label"
                :value="listItem.value"
              >
              </el-option>
            </el-select>
            <el-select
              v-if="
                item.option_data_type == 'remote' &&
                storeData[`${item.columns}`] &&
                !item.option_list_v2.is_tree &&
                formLabelAlign[`${item.columns}`]
              "
              size="mini"
              :multiple="true"
              :clearable="true"
              style="width: 145px; margin-right: 15px"
              v-model="formLabelAlign[`${item.columns}`].value"
              :placeholder="`请选择${item.label}`"
            >
              <el-option
                v-for="listItem in storeData[`${item.columns}`].remoteArray"
                :key="listItem.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>

            <el-cascader
              v-if="
                item.option_data_type == 'remote' &&
                storeData[`${item.columns}`] &&
                item.option_list_v2.is_tree &&
                formLabelAlign[`${item.columns}`]
              "
              :clearable="true"
              size="mini"
              style="width: 145px; margin-right: 15px"
              v-model="formLabelAlign[`${item.columns}`].value"
              :placeholder="`请选择${item.label}`"
              :options="storeData[`${item.columns}`].remoteArray"
            ></el-cascader>
          </el-form-item>
        </el-form>
      </div>
    </div>

    <div class="right">
      <el-button @click="searchFn" size="mini" type="primary">搜索</el-button>
    </div>
  </div>
</template>
<style scoped>
.common-filter /deep/ .el-form-item {
  margin-bottom: 0px !important;
}

.common-filter /deep/ .el-select--mini .el-input__inner {
  height: 28px !important;
}
</style>

<script>
import "@/assets/common.scss";

export default {
  components: {
    formLabelAlign: {},
    storeData: {},
    canMount: false,
  },

  mixins: [],

  props: {
    filterColumn: {
      type: Array,
    },
    app: {
      type: String,
    },
    tableInfo: {
      type: Object,
    },
  },
  computed: {},
  watch: {
    arrayList() {
      this.makeOptions();
    },
  },
  data() {
    return {
      canMount: false,
      formLabelAlign: {},
      storeData: {},
      domFilterItem: [],
      mainTable: [],
    };
  },

  methods: {
    makeOptions() {
      if (this.domFilterItem.length > 0) {
    
        for (let i = 0; i < this.domFilterItem.length; i++) {
          let item = this.domFilterItem[i];

          let defaultValue = "";
          let formItem = "";
          if (item.option_data_type == "local") {
            defaultValue = [];

            if (item.option_list_v2.is_tree) {
              formItem = "cascader";
            } else {
              formItem = "select";
            }
          }

          if (item.option_data_type == "remote") {
            defaultValue = [];
            this.$set(this.storeData, item.columns, {
              remoteArray: [],
            });
            if (item.option_list_v2.is_tree) {
              formItem = "cascader";
            } else {
              formItem = "select";
            }
            // srvpark_park_info_select

            let condition = {
              serviceName: item.option_list_v2.serviceName,
              colNames: ["*"],
              relation_condition: {},
            };

            this.$axios
              .post(
                `/${this.mainTable.appName}/select/${item.option_list_v2.serviceName}`,
                condition
              )
              .then((res) => {
                let data = res.data.data;
                if (item.option_list_v2.is_tree) {
                  let treeArray = this.makeTree(data, {
                    parentKey: item.option_list_v2.parent_col,
                    labelKey: item.option_list_v2.key_disp_col,
                    valueKey: item.option_list_v2.refed_col,
                  });
                  console.log(treeArray, "==treeArray==");
                  this.storeData[`${item.columns}`].remoteArray = treeArray;

                  // this.$set(this.storeData,item.columns,{
                  //     remoteArray:treeArray
                  // });
                } else {
                  this.storeData[`${item.columns}`].remoteArray = treeArray;
                  //  this.$set(this.storeData,item.columns,{
                  //     remoteArray:data
                  // });
                }

                console.log(this.storeData, "==this.storeData===");
              });
          }

          if (item.col_type == "String") {
            defaultValue = "";
            formItem = "input";
          }

          if (item.col_type == "Float") {
            defaultValue = "";
            formItem = "number";
          }

          this.$set(this.formLabelAlign, `${item.columns}`, {
            value: defaultValue,
            otherInfo: {
              formItem,
            },
          });
        }

        this.canMount = true;
      }
    },
    searchFn() {
      let serviceParams = {
        serviceName: this.mainTable.mainTableInfo.select.serviceName,
        colNames: ["*"],
        condition: [
         
        ],
        relation_condition: {},
        order: [],
        draft: false,
        query_source: "list_page",
      };

    
     
      for (let key in this.formLabelAlign) {
        let formItem = this.formLabelAlign[key].otherInfo.formItem;
        let value = this.formLabelAlign[key].value;
        if (
          (formItem == "input" || formItem == "number") &&
          value &&
          value != ""
        ) {
          serviceParams.condition.push({ colName: key, ruleType: "like", value: value });
        } else if (formItem == "select" && value && value.length > 0) {
          serviceParams.condition.push({
            colName: key,
            ruleType: "in",
            value: value.join(","),
          });
        } else if (formItem == "cascader" && value && value.length > 0) {
          serviceParams.condition.push({
            colName: key,
            ruleType: "like",
            value: value.join(","),
          });
        }
      }
      this.$axios.post(this.mainTable.mainTableInfo.select.url, serviceParams).then((res) => {
      
        this.$emit("search", res.data.data);
      });
    },
    getArrayList() {
      let columnArray = this.mainTable.srv_cols;
      let appName = this.mainTable.gridButton[0].application;
      let filterColumn = this.filterColumn;

      let resultArray = this.getV2Columns(
        filterColumn,
        columnArray,
        (filterItem, dataItem) => {
          console.log( dataItem.columns,"-- dataItem.columns-- dataItem.columns")
          if (filterItem.key == dataItem.columns) {
            return true;
          } else {
            return false;
          }
        }
      );
      console.log(resultArray, "==resultArray==");
      let array2 = resultArray.sort((a, b) => a.souceSort < b.souceSort);
      this.domFilterItem = array2;
      this.makeOptions();
    },
  },

  created: function () {
    window.h = this.$createElement;
  },

  mounted: function () {
    if (this.tableInfo && !this.tableInfo.mainTableInfo) {
      this.mainTable = this.filterTableInfo(this.tableInfo);
    } else {
      this.mainTable = this.tableInfo;
    }
    this.getArrayList();
  },
};
</script>

<style scoped>
</style>


