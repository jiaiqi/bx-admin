<template>
  <!-- <tree-finder //树形选择器在autocomplete的场景功能还不完善，暂时不使用
    :disabled="disabled"
    :$srvApp="optionsReq && optionsReq.srvApp || null"
    ref="editor"
    :field="setTreeField"
    :allow-change-model="false"
    @on-change="onTreeChange"
  >
  </tree-finder> -->
  <el-select
    v-if="isMultiple"
    v-model="selectedTags"
    multiple
    filterable
    clearable
    :disabled="disabled"
    placeholder="请输入内容"
    remote
    :remote-method="remoteSearch"
    :loading="loading"
    @change="handleSelectChange"
    @clear="handleClear"
    @keyup.enter.native="handleEnter"
    @focus="handleFocus"
    ref="input"
    class="el-select"
  >
    <el-option
      v-for="item in options"
      :key="item.value"
      :label="item.label"
      :value="item"
    >
    </el-option>
    <el-option
      v-if="showCustomOption"
      :key="'custom'"
      :label="searchQuery"
      :value="{ label: searchQuery, value: searchQuery, isCustom: true }"
    >
      {{ `使用自定义：${searchQuery}` }}
    </el-option>
  </el-select>
  <el-autocomplete
    v-else
    class="inline-input"
    v-model="field.model"
    clearable
    :disabled="disabled"
    :trigger-on-focus="true"
    :fetch-suggestions="querySearch"
    placeholder="请输入内容"
    value-key="label"
    suffix-icon="el-icon-edit"
    @select="handleSelect"
    @clear="handleClear"
  >
  </el-autocomplete>
</template>

<script>
import cloneDeep from "lodash/cloneDeep";
import TreeFinder from "./tree-finder.vue";
export default {
  props: {
    field: Object,
    disabled: Boolean,
  },
  components: {
    TreeFinder,
  },
  mounted() {},
  computed: {
    dependField() {
      let colName = this.field.info?.redundant?.dependField;
      if (colName) {
        let column = this.field.form.allFields[colName];
        if (column) {
          return column;
        }
      }
    },
    valueCol() {
      return (
        this.dependField?.info?.valueCol ||
        this.field.info?.valueCol ||
        this.optionsV2List?.refed_col
      );
    },
    dispCol() {
      return (
        this.dependField?.info?.dispCol ||
        this.field.info?.dispCol ||
        this.optionsV2List?.key_disp_col
      );
    },
    dependFieldType() {
      let column = this.dependField;
      if (column) {
        return column?.info?.type;
      }
    },
    fksDispCols() {
      return this.dependField?.info?.fmt?.cols || [this.dispCol];
    },
    isMultiple() {
      return ["fks", "fkjsons"].includes(this.dependFieldType);
    },
    setTreeField() {
      const field = this.field;
      const optionListV2 = cloneDeep(this.optionsV2List);
      field.info.srvCol = cloneDeep(field.info.srvCol);
      field.info.srvCol.option_list_v2 = optionListV2;
      field.info.srvCol.option_list_v3 = optionListV2;
      field.info.valueCol = optionListV2.refed_col;
      field.info.dispCol = optionListV2.key_disp_col;
      field.info.parentCol = optionListV2.parent_no_col;
      return field;
    },
    modelValue() {
      let value = this.field.model;
      return value;
    },
    modelType() {
      let type = "string";

      return type;
    },
    optionsV2List() {
      let optionsV2 = this.field.autocompleteFunc();
      return optionsV2;
    },
    isTree() {
      return this.optionsV2List?.is_tree === true;
    },
    optionsReq() {
      let optionsV2 = this.field.autocompleteFunc();
      let refedCol = this.field.info?.redundant?.refedCol;
      if (this.field.stringAutocompleteInput) {
        refedCol = optionsV2?.refed_col || optionsV2?.key_disp_col;
      }
      let req = {
        serviceName: optionsV2.serviceName,
        srvApp: optionsV2.srv_app || null,
        colNames: ["*"],
        condition: [
          {
            colName: refedCol,
            ruleType: "[like]",
            value: this.modelValue,
          },
        ],
        page: {
          pageNo: 1,
          rownumber: 999,
        },
        relation_condition: {},
      };
      // if(this.modelValue){
      //   req.condition.push( {
      //       colName: refedCol,
      //       ruleType: "[like]",
      //       value: this.modelValue,
      //     },)
      // }
      if (this.optionsV2List?.conditions?.length) {
        const formModel = this.field.form.srvValFormModel();
        this.optionsV2List.conditions.forEach((item) => {
          const obj = {
            colName: item.colName,
            ruleType: item.ruleType,
          };
          if (item.value?.indexOf("data.") === 0) {
            obj.value = formModel[item.value.replace("data.", "")];
          } else if (
            item.value &&
            item.value.startsWith("'") &&
            item.value.endsWith("'")
          ) {
            // /^'.*'$/.test(item.value)
            obj.value = item.value.replace(/'/g, "");
          } else {
            obj.ruleType = "like";
            obj.value = item.value;
          }
          if (obj.value) {
            req.condition.push(obj);
          }
        });
      }
      return req;
    },
  },
  data() {
    return {
      selected: null,
      oldValue: null,
      selectedTags: [],
      options: [],
      loading: false,
      searchQuery: "",
      showCustomOption: false,
    };
  },

  methods: {
    setSrvVal(val) {
      this.field.model = val;
      if (this.isMultiple) {
        let options =
          this.dependField?.editor?.$refs?.editor?.getSelectedData?.();
        // this.selected =
        if (Array.isArray(options) && options.length) {
          this.selectedTags = options.map((item) => ({
            option: item,
            label: item[this.dispCol],
            value: item[this.valueCol],
          }));
        }
      } else {
        this.selected = val;
      }
    },
    onTreeChange(val) {
      console.log("onTreeChange", val);
      if (val) {
        this.handleSelect({
          option: val,
          label: val[this.optionsV2List.key_disp_col],
          value: val[this.optionsV2List.refed_col],
        });
      } else {
        const dependField = this.getDependField();
        dependField.model = null;
        dependField.finderSelected = null;
        this.$set(dependField, "model", null);
        this.$emit("change", dependField);
      }
    },

    getDependField() {
      let dependField; //fk字段
      if (this.field.form.fields && Array.isArray(this.field.form.fields)) {
        for (let f of this.field.form.fields) {
          if (f.info.name == this.field.info.redundant.dependField) {
            dependField = f;
          }
        }
      } else {
        dependField =
          this.field.form.fields[this.field.info.redundant.dependField];
      }
      return dependField;
    },
    handleClear() {
      // 清空autocomplete字段时候，是否清空fk字段的值的逻辑
      const dependField = this.getDependField();
      const redundant = this.field.info?.redundant;
      if (redundant?.trigger) {
        if (redundant?.trigger === "isnull") {
          // 为空的时候才进行冗余 配置了isnull的字段清空时不改变fk字段的值
          return;
        }
      }
      const refedCol = redundant?.refedCol;
      const refedColVal = dependField.model?.[refedCol];
      if (refedCol && refedColVal) {
        this.$nextTick(() => {
          if (this.oldValue && this.oldValue === refedColVal) {
            // 当前字段的值跟fk字段中冗余到当前字段的值一致时，才清空fk字段的值
            dependField.model = null;
            dependField.finderSelected = null;
            this.$set(dependField, "model", null);
            this.$emit("change", dependField);
          }
        });
      }
      if (this.isMultiple) {
        this.selectedTags = [];
        this.field.model = [];
        this.$emit("change", this.field);
      }
    },
    handleSelect(item) {
      console.log("handleSelect", item);
      this.selected = item;
      if (this.field.stringAutocompleteInput) {
        return;
      }
      let dependField = this.getDependField();
      // let dependField; //fk字段
      // if (this.field.form.fields && Array.isArray(this.field.form.fields)) {
      //   for (let f of this.field.form.fields) {
      //     if (f.info.name == this.field.info.redundant.dependField) {
      //       dependField = f;
      //     }
      //   }
      // } else {
      //   dependField =
      //     this.field.form.fields[this.field.info.redundant.dependField];
      // }

      let dependType = dependField?.info?.editor;
      switch (dependType) {
        case "finder":
        case "tree-finder":
          if (this.isMultiple) {
            if (Array.isArray(item) && item.length) {
              const model = item.map((i) => i.option).filter((i) => i);
              // const modelValue = model.map((i) => i[this.valueCol]).toString()
              if (!model?.length) {
                // 都是自定义数据
                return;
              }
              dependField?.editor?.setSelectedData?.(model);
            } else {
              dependField.model = null;
              dependField.finderSelected = null;
              this.$set(dependField, "model", null);
              this.$emit("change", dependField);
            }
          } else {
            if (item) {
              dependField.model = item.option;
              dependField.finderSelected = item.value;
              this.$set(dependField, "model", item.option);
              this.$emit("change", dependField);
            } else {
              dependField.model = null;
              dependField.finderSelected = null;
              this.$set(dependField, "model", null);
              this.$emit("change", dependField);
            }
          }

          this.$emit("field-value-changed", this.field.info.name);
          break;

        default:
          break;
      }
    },
    querySearch(queryString, cb) {
      let req = cloneDeep(this.optionsReq);
      req["condition"][0].value = queryString;
      let valColumn = req["condition"][0].colName;
      let results = [];
      this.selectList(req, req.srvApp).then((response) => {
        if (response && response.data && response.data.data) {
          let options = response.data.data;
          results = options.map((item) => {
            let result = {
              option: item,
              value: item[valColumn] + "",
              label:
                item[this.optionsV2List["refed_col"]] +
                "/" +
                item[this.optionsV2List["key_disp_col"]],
            };
            if (valColumn == this.optionsV2List["key_disp_col"]) {
              result.label = item[this.optionsV2List["key_disp_col"]];
            } else {
              result.label = `${item[this.optionsV2List["key_disp_col"]]}(${
                item[this.optionsV2List["refed_col"]]
              }/${item[this.optionsV2List["key_disp_col"]]})`;
            }
            return result;
          });
        }
        cb(results);
      });
      this.$emit("change", this.field);
      // 调用 callback 返回建议列表的数据
    },
    // 处理输入框聚焦事件
    handleFocus() {
      console.log("Input focused, triggering remoteSearch");
      // 聚焦时触发一次远程搜索，可以传入当前搜索词或空字符串
      if (!this.searchQuery && !this.selectedTags.length) {
        this.remoteSearch(this.searchQuery || "");
      }
    },
    // 多选模式下的远程搜索方法
    remoteSearch(query) {
      console.log("remoteSearch triggered with query:", query);
      this.searchQuery = query;
      this.loading = true;
      this.showCustomOption = false;

      let req = cloneDeep(this.optionsReq);
      if (req.condition) {
        delete req.condition;
      }
      // 使用label或者value模糊搜索
      req.relation_condition = {
        relation: "OR",
        data: [
          {
            colName: this.valueCol,
            value: query,
            ruleType: "like",
          },
          {
            colName: this.dispCol,
            value: query,
            ruleType: "like",
          },
        ],
      };

      // 调用实际的selectList方法，确保它能正确获取数据
      this.selectList(req, req.srvApp)
        .then((response) => {
          console.log("selectList response:", response);
          this.loading = false;
          if (response && response.data && response.data.data) {
            let options = response.data.data;
            this.options = options.map((item) => {
              let result = {
                option: item,
                // 使用refed_col作为value，确保唯一性
                value: item[this.valueCol] + "",
                // 使用fksDispCols生成label，按顺序显示字段
                label: item[this.dispCol],
              };
              return result;
            });

            console.log("Generated options:", this.options);

            // 检查是否有且仅有一个完全匹配的选项
            const exactMatches = this.options.filter((option) => {
              return (
                option.option[this.valueCol] === query ||
                option.option[this.dispCol] === query
              );
            });

            if (this.options.length === 0) {
              // 显示自定义选项
              this.showCustomOption = true;
            }
          } else {
            this.options = [];
            this.showCustomOption = true;
          }
        })
        .catch((error) => {
          console.error("selectList error:", error);
          this.loading = false;
          this.options = [];
          this.showCustomOption = true;
        });
    },
    // 多选模式下的选择变化处理
    handleSelectChange(val) {
      console.log("handleSelectChange triggered with val:", val);
      if (this.isMultiple) {
        this.handleSelect(val);
      }
    },
    // 处理回车事件
    handleEnter() {
      console.log("handleEnter triggered with searchQuery:", this.searchQuery);
      if (!this.searchQuery) return;
      // 检查是否有完全匹配的选项
      const exactMatches = this.options.filter((option) => {
        return (
          option.option[this.valueCol] === this.searchQuery ||
          option.option[this.dispCol] === this.searchQuery
        );
      });
      if (exactMatches.length === 1) {
        // 自动选中这条数据
        this.$nextTick(() => {
          if (
            !this.selectedTags.some(
              (tag) => tag.value === exactMatches[0].value
            )
          ) {
            this.selectedTags.push(exactMatches[0]);
            this.handleSelectChange(this.selectedTags);
          }
        });
      } else if (exactMatches.length === 0) {
        // 没有匹配的数据，显示提示
        this.$message.warning("没有匹配的数据");
      }
    },
  },
  watch: {
    modelValue: {
      deep: true,
      handler: function (nval, oval) {
        console.log(nval);
        this.oldValue = oval;
        if (!nval) {
          // this.handleSelect();
        }
      },
    },
  },
};
</script>

<style scoped lang="scss">
.el-select {
  ::v-deep .el-input .el-input__icon{
    transform: unset;
  }
  ::v-deep .el-input .el-icon-:before {
    content: "\E78C"; /* 替换为 ElementUI Icon 对应的 Unicode */
  }
}
</style>