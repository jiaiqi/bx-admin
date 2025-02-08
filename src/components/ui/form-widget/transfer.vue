<template>
  <div class="border p-2 rounded-sm transfer-widget">
    <el-transfer
      :titles="calcTitles"
      v-model="value"
      :data="options"
      class="custom-transfer"
      :props="props"
      filterable
      @change="handleChange"
    >
      <!-- <template slot="left-footer">
        <div class="text-center">
          <el-pagination
            small
            layout="prev, pager, next"
            :pager-count="5"
            :total="page.total"
            :current-page.sync="page.pageNo"
            :page-size.sync="page.rownumber"
            hide-on-single-page
            @current-change="handleCurrentChange"
          >
          </el-pagination>
        </div>
      </template> -->

      <!-- <el-button class="transfer-footer" slot="right-footer" size="small"
        >操作</el-button
      > -->
    </el-transfer>
  </div>
</template>

<script>
import cloneDeep from "lodash/cloneDeep";
import cloneDeepWith from "lodash/cloneDeepWith";
import difference from "lodash/difference";
export default {
  name: "transfer",
  model: {
    prop: "value",
    event: "change",
  },
  watch: {
    formModel: {
      handler(newVal, oldVal) {
        if (Array.isArray(this.optionListV2?.transfer?.conditions)) {
          const relationCols = this.optionListV2?.transfer?.conditions.map(
            (item) => item.colName
          );
          if (Array.isArray(relationCols) && relationCols.length) {
            relationCols.forEach((col) => {
              if (newVal[col] !== oldVal[col]) {
                this.setInitVal();
              }
            });
          }
        }
      },
      deep: true,
    },
  },
  computed: {
    calcTitles() {
      return [`请选择${this.field.info.label}`, `已选${this.field.info.label}`];
    },
    props() {
      let props = {
        key: this.field.info.valueCol,
        label: this.needRenameLabel() ? "valuezh" : this.field.info.dispCol,
        checkStrictly: top?.env?.includes("health") ? false : true,
      };

      return props;
    },
    unlimited() {
      // 是否允许选择 任意一级， false ，true
      let unlimited =
        this.optionListV2 || this.field.info.srvCol.option_list_v2;
      if (
        unlimited.hasOwnProperty("unlimited") &&
        unlimited.unlimited === false
      ) {
        return false;
      } else {
        return true;
      }
    },
    dispLoaderV2() {
      if (this.optionListV2?.refed_col) {
        const optionListV2 = this.optionListV2;
        return {
          service: optionListV2.serviceName || optionListV2.service,
          conditions: optionListV2.conditions || [],
          relation_conditions: optionListV2.relation_conditions || null,
          orders: optionListV2.orders || null,
          showAsPair: optionListV2.show_as_pair || null,
          imgType: optionListV2.img_type || null, // 图片类型：img-图片 eicon- el-icon图标
          imgCol: optionListV2.refed_col || null, // 图片字段 同之前的img_url_expr
          imgUrlExpr: optionListV2.img_url_expr || optionListV2.img_col || null,
          dedup: optionListV2.dedup,
          srvApp: optionListV2.srv_app || null,
          parentCol:
            optionListV2.parent_col || optionListV2.parent_no_col || null,
          refedCol: optionListV2.refed_col,
          dispCol: optionListV2.key_disp_col || optionListV2.disp_col,
        };
      } else {
        return this.field?.info?.dispLoader;
      }
    },
    optionListV2() {
      if (this.field?.info?.srvCol?.option_list_v3?.length) {
        const option_list_v3 = this.field?.info?.srvCol?.option_list_v3;
        const formModel = this.field.form.srvValFormModel();
        const result = option_list_v3.find((item) => {
          if (item.conds?.length) {
            // 条件外键
            return item.conds.every((cond) =>
              cond.case_val?.includes?.(formModel[cond.case_col])
            );
          } else {
            return true;
          }
        });
        if (result) {
          return result;
        } else {
          return null;
        }
      }
      return this.field?.info?.srvCol?.option_list_v2;
    },
  },
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
    field: {
      type: Object,
      default: () => ({}),
    },
    defaultCondition: {
      type: Array,
      default: () => [],
    },
    defaultValues: {
      type: Object,
      default: () => ({}),
    },
    childForeignKey: {
      type: Object,
      default: () => ({}),
    },
    mainFormDatas: {
      type: Object,
      default: () => ({}),
    },
    formModel: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      value: [],
      oldValue: [], // 旧值字符串数组
      oldValues: [], // 旧值对象数组
      options: [],
      page: {
        pageNo: 1,
        rownumber: 50,
        total: 0,
      },
    };
  },
  created() {
    this.loadOptions();
    this.setInitVal();
  },
  methods: {
    handleChange(val) {
      this.field.model = val?.toString();
      this.$emit("change", val);
      this.$emit("blur", this.field);
      this.emitFieldValueChange();
    },
    getTransferValues() {
      return this.options.filter(
        (item) =>
          item[this.field.info.valueCol] &&
          this.value.includes(item[this.field.info.valueCol])
      );
    },
    getAddValues() {
      // 新增的值
      let addValue = difference(this.value, this.oldValue);
      return this.options.filter((item) =>
        addValue.includes(item[this.field.info.valueCol])
      );
    },
    getRemoveValues() {
      let removeValues = difference(this.oldValue, this.value);
      if (removeValues?.length) {
        return {
          data: this.oldValues.filter((item) =>
            removeValues.includes(item[this.field.info.name])
          ),
          serviceName: this.optionListV2?.transfer?.delService,
        };
      }
    },
    setInitVal() {
      // 设置初始值
      if (this.optionListV2?.transfer?.serviceName) {
        const loader = this.optionListV2.transfer;
        const queryJson = {
          serviceName: loader.serviceName,
          queryMethod: "select",
          distinct: !!loader.distinct,
          colNames: ["*"],
          condition: [],
          page: {
            pageNo: 1,
            rownumber: 100,
          },
        };
        if (loader.conditions) {
          this.buildConditions(loader, false).forEach((c) =>
            queryJson.condition.push(c)
          );
          queryJson.condition = this.pruneConditions(queryJson.condition);
        }
        if (loader.relation_conditions) {
          queryJson.relation_condition = this.buildRelationCondition(loader);
        }
        if (loader && loader.orders) {
          queryJson.order = loader.orders;
        }

        let app = this.$srvApp && this.field.evalFormExpr(this.$srvApp, "");
        if (this.$srvApp && !app) {
          // 使用了动态srvApp，但是eval结果出错，取消查询
          return;
        }
        return this.selectList(queryJson, app).then((response) => {
          if (response && response.data && response.data.data) {
            this.value = response.data.data.map(
              (item) => item[this.field.info.name]
            );
            this.oldValue = cloneDeep(this.value);
            this.oldValues = cloneDeep(response.data.data);
          }
        });
      }
    },
    handleCurrentChange(val) {
      this.page.pageNo = val;
      this.loadOptions();
    },
    async loadOptions() {
      let fieldInfo = this.field.info;
      let loader = this.dispLoaderV2;
      if (!loader) {
        return;
      }
      if (loader.enableFunc) {
        if (!loader.enableFunc()) {
          return;
        }
      }
      let queryJson = {
        serviceName: loader.service,
        queryMethod: "select",
        distinct: !!loader.distinct,
        // * is here to support redundant or img url expr etc...
        colNames: ["*"],
        condition: [],
        page: {
          pageNo: this.page.pageNo,
          rownumber: this.page.rownumber,
        },
      };
      if (loader) {
        if (loader.conditions) {
          this.buildConditions(loader).forEach((c) =>
            queryJson.condition.push(c)
          );
          queryJson.condition = this.pruneConditions(queryJson.condition);
          queryJson.relation_condition = this.buildRelationConditionInfo(
            loader,
            ""
          );
        } else if (loader.relation_conditions) {
          queryJson.relation_condition = this.buildRelationCondition(loader);
        } else {
          // 如果没有配置 conditions 和 relation_condition , 自动处理 默认的 relation_condition
          queryJson.relation_condition = this.buildRelationConditionInfo(
            loader,
            ""
          );
        }
      }

      if (loader && loader.orders) {
        queryJson.order = loader.orders;
      }

      let app = this.$srvApp && this.field.evalFormExpr(this.$srvApp, "");
      if (this.$srvApp && !app) {
        // 使用了动态srvApp，但是eval结果出错，取消查询
        // cb([]);
        return;
      }
      return this.selectList(queryJson, app).then((response) => {
        if (response && response.data && response.data.data) {
          this.page.total = response.data.page.total;
          let options = response.data.data;
          if (loader.dedup) {
            this.dedupOptions(options);
          }

          options.forEach((item) => {
            item["label"] =
              loader.showAsPair !== true
                ? item[fieldInfo.dispCol]
                : `${item[fieldInfo.dispCol]}/${item[fieldInfo.valueCol]}`;
            item["value"] = item[fieldInfo.valueCol];
            item.labelFunc = (item) => {
              if (item[fieldInfo.dispCol]) {
                if (loader.showAsPair) {
                  return `${item[fieldInfo.dispCol]}/${
                    item[fieldInfo.valueCol]
                  }`;
                } else {
                  return item[fieldInfo.dispCol];
                }
              } else {
                return item[fieldInfo.valueCol];
              }
            };
          });

          this.options = options.map((item) => item);
          this.setInitVal();
        } else {
          return [];
        }
      });
    },
    buildConditions: function (dispLoader, filterNull = true) {
      let ret = [];
      const rowData = this.field.form.srvValFormModel();
      const mainData = this.mainFormDatas;
      for (let i in dispLoader.conditions) {
        let cond = dispLoader.conditions[i];
        let condition = {};
        try {
          condition.colName = cond.colName;
          condition.ruleType = cond.ruleType;
          if (cond.disableExpr && eval(cond.disableExpr)) {
            continue;
          }

          let valueExpr = cond.valueExpr || cond.value;
          if (valueExpr?.value_type && valueExpr?.value_key) {
            if (valueExpr?.value_type === "rowData") {
              condition.value = rowData[valueExpr.value_key];
            } else if (valueExpr?.value_type === "mainData") {
              condition.value = mainData[valueExpr.value_key];
            } else if (
              valueExpr?.value_type === "constant" &&
              valueExpr.value
            ) {
              condition.value = valueExpr.value;
            }
          } else if (valueExpr) {
            // literal value or js expr
            if (cond.literalValue) {
              condition.value = valueExpr;
            } else {
              condition.value = this.evalExprOrFunc(
                valueExpr,
                this.field.form.srvValFormModel(),
                null,
                mainData
              );
            }
          } else if (cond.valueFunc) {
            condition.value = cond.valueFunc();
          }
        } catch (e) {
          continue;
        }
        if (condition.ruleType === "isnull") {
          /**
           * 增加支持 ruleType === isnull
           */
          ret.push(condition);
        } else {
          if (condition.value != null && condition.value != "") {
            if (Array.isArray(condition.value)) {
              if (condition.value.length == 0) {
                continue;
              }
            }
            ret.push(condition);
          } else if (condition.value != null || condition.value != "") {
            if (filterNull === false) {
              // 不过滤值为空的condition
              ret.push(condition);
            }
          } else if (
            !this.field.info._finderAuto &&
            condition.value === null &&
            cond.value !== null
          ) {
            condition.value = "";
            ret.push(condition);
          }
        }
      }

      return ret;
    },
    // 目前不支持一个colname 多个condition，如果这种case且有一个ruletype = eq， 留下eq
    pruneConditions(conditions) {
      let map = [];
      conditions.forEach((condition) => {
        if (map.hasOwnProperty(condition.colName)) {
          // keep ruletype == eq  增加支持 ruletype = in 20200526
          if (condition.ruleType === "eq" || condition.ruleType === "in") {
            map.push(condition);
          } else {
            // ignore
            map.push(condition);
          }
        } else {
          map.push(condition);
        }
      });

      return map;
    },
    emitFieldValueChange() {
      let objCol = null;
      let objInfo = this.optionListV2?.obj_info;
      if (objInfo?.a_save_b_cols && objInfo?.a_save_b_obj_col) {
        // fk字段值改变后，更新其option_list_v3中配置的的a_save_b_obj_col
        const newValue = this.field.model;
        const cols = objInfo?.a_save_b_cols.split(",");
        let obj = {};
        let objStr = "";
        if (cols?.includes("*")) {
          obj = cloneDeep(newValue);
        } else if (newValue && cols?.length) {
          cols.forEach((col) => {
            obj[col] = newValue?.[col];
          });
        }
        objStr = JSON.stringify(obj);
        if (objStr === "{}" || !newValue || !isObject(newValue)) {
          objStr = "";
        }
        objCol = {
          type: "a_save_b_obj",
          col: objInfo.a_save_b_obj_col,
          val: objStr,
        };
        console.log("更新obj_info", objCol);
        // 将更新的字段信息保存在_obj_col上，方便在form中获取
        this.$set(this.field, "_obj_col", objCol);
      } else if (this.field?._obj_col?.val) {
        // 清空通过_obj_col保存的值
        this.$set(this.field["_obj_col"], "val", "");
      }
      this.$emit("field-value-changed", this.field.info.name, this.field);
    },

    handleBlur() {
      try {
        if (this.field.getSrvVal()) {
          if (
            this.selected != this.field.getDispVal() &&
            this.selected !=
              `${this.field.getDispVal()}/${this.field.getSrvVal()}`
          ) {
            this.field.reset();
          }
        } else {
          // this.selected = ''
        }
      } finally {
        this.$emit("blur", this.field);
        this.emitFieldValueChange();
      }
    },
    renameLable(option) {
      if (!option) {
        return;
      }
      option.valuezh = option.value;

      if (option.children && option.children.length > 0) {
        option.children.forEach((child) => this.renameLable(child));
      }
    },
    needRenameLabel() {
      return this.field.info.dispCol === "value";
    },
    buildRelationConditionInfo(dispLoader, queryString) {
      let self = this;
      let relaTemp = {
        relation: "AND",
        data: [],
      };
      let condition = [];
      let dataTemp = {
        relation: "AND",
        data: [],
      };
      console.log("dispLoader:", dispLoader);

      let relation_condition = {};
      if (dispLoader.conditions) {
        this.buildConditions(dispLoader).forEach((c) => condition.push(c));
        condition = this.pruneConditions(condition);

        if (condition.length > 0) {
          relaTemp.relation = "OR";
          dataTemp.data = [];
          let dataItem = {
            colName: "",
            value: "",
            ruleType: "",
          };
          // dataTemp.data = condition
          // relaTemp.data.push(self.bxDeepClone(dataTemp))
          dataTemp.data = [];
          dataItem.ruleType = "[like]";
          dataItem.colName = this.field.info.valueCol;
          dataItem.value = queryString == null ? "" : queryString;
          dataTemp.data.push(self.bxDeepClone(dataItem));
          relaTemp.data.push(self.bxDeepClone(dataTemp));
          dataTemp.data = [];
          dataItem.ruleType = "[like]";
          dataItem.colName = this.field.info.dispCol;
          dataItem.value = queryString == null ? "" : queryString;
          dataTemp.data.push(self.bxDeepClone(dataItem));
          relaTemp.data.push(self.bxDeepClone(dataTemp));
        } else {
          relaTemp.relation = "OR";
          dataTemp.data = [];
          let dataItem = {
            colName: "",
            value: "",
            ruleType: "",
          };
          dataItem.ruleType = "[like]";
          dataItem.colName = this.field.info.valueCol;
          dataItem.value = queryString == null ? "" : queryString;
          dataTemp.data.push(self.bxDeepClone(dataItem));
          relaTemp.data.push(self.bxDeepClone(dataTemp));
          dataTemp.data = [];
          dataItem.ruleType = "[like]";
          dataItem.colName = this.field.info.dispCol;
          dataItem.value = queryString == null ? "" : queryString;
          dataTemp.data.push(self.bxDeepClone(dataItem));
          relaTemp.data.push(self.bxDeepClone(dataTemp));
        }
      } else {
        // 默认的 value  disp 字段模糊查询条件
        relaTemp.relation = "OR";
        dataTemp.data = [];
        let dataItem = {
          colName: "",
          value: "",
          ruleType: "",
        };
        dataItem.ruleType = "[like]";
        dataItem.colName = this.field.info.valueCol;
        dataItem.value = queryString == null ? "" : queryString;
        dataTemp.data.push(self.bxDeepClone(dataItem));
        relaTemp.data.push(self.bxDeepClone(dataTemp));
        dataTemp.data = [];
        dataItem.ruleType = "[like]";
        dataItem.colName = this.field.info.dispCol;
        dataItem.value = queryString == null ? "" : queryString;
        dataTemp.data.push(self.bxDeepClone(dataItem));
        relaTemp.data.push(self.bxDeepClone(dataTemp));
      }
      return relaTemp;
    },
    buildRelationCondition(dispLoader) {
      let self = this;

      function evalCustomizer(value, key, obj, stack) {
        if (key === "value" && !obj.literal) {
          try {
            return self.evalExprOrFunc(
              value,
              self.field.form.srvValFormModel(),
              null
            );
          } catch (e) {
            return value;
          }
        }
      }

      var evaled = cloneDeepWith(
        dispLoader.relation_conditions,
        evalCustomizer
      );

      function pruneCustomizer(value, key, obj, stack) {
        if (
          key === "data" &&
          Array.isArray(value) &&
          !isEmpty(value) &&
          value[0].hasOwnProperty("colName")
        ) {
          return value.filter(
            (leafCondition) =>
              leafCondition.value !== "" &&
              leafCondition.value !== null &&
              leafCondition.value !== undefined
          );
        }
      }

      var result = cloneDeepWith(evaled, pruneCustomizer);
      return result;
    },
  },
};
</script>

<style lang="scss" scoped>
.transfer-widget {
  // height: 500px;
}
.custom-transfer {
  display: flex;
  align-items: center;
  ::v-deep .el-transfer-panel {
    flex: 1;
    .el-transfer-panel__body{
      display: flex;
      flex-direction: column;
      height: 500px;
      .el-transfer-panel__list{
        flex: 1;
      }
    }
  }
}
</style>
