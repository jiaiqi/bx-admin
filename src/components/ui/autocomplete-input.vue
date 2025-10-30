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
  <el-autocomplete
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
import cloneDeep from 'lodash/cloneDeep';
import TreeFinder from './tree-finder.vue';
export default {
  props: {
    field: Object,
    disabled: Boolean,
  },
  components: {
    TreeFinder,
  },
  mounted() { },
  computed: {
    setTreeField() {
      const field = this.field
      const optionListV2 = cloneDeep(this.optionsV2List)
      field.info.srvCol = cloneDeep(field.info.srvCol)
      field.info.srvCol.option_list_v2 = optionListV2
      field.info.srvCol.option_list_v3 = optionListV2
      field.info.valueCol = optionListV2.refed_col
      field.info.dispCol = optionListV2.key_disp_col
      field.info.parentCol = optionListV2.parent_no_col
      return field
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
      return this.optionsV2List?.is_tree === true
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
    };
  },

  methods: {
    onTreeChange(val) {
      console.log('onTreeChange', val);
      if (val) {
        this.handleSelect({
          option: val,
          label: val[this.optionsV2List.key_disp_col],
          value: val[this.optionsV2List.refed_col],
        })
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
      const refedColVal = dependField.model[refedCol];
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
          this.$emit("field-value-changed", this.field.info.name);
          break;

        default:
          break;
      }
    },
    querySearch(queryString, cb) {
      let req = this.bxDeepClone(this.optionsReq);
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
              result.label = `${item[this.optionsV2List["key_disp_col"]]}(${item[this.optionsV2List["refed_col"]]
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