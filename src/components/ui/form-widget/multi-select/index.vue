<template>
  <transferVue
    v-if="dispLoaderV2"
    :calc-titles="calcTitles"
    :is-tree="dispLoaderV2.isTree"
    :loadData="loadData"
    :default-props="props"
    :load-node="loadChildNode"
    :value="value"
    @addToRight="addToRight"
    @removeFromRight="removeFromRight"
  ></transferVue>
</template>

<script>
import transferVue from "./transfer.vue";
import uniqBy from "lodash/uniqBy";
import cloneDeep from "lodash/cloneDeep";
import difference from "lodash/difference";
import {
  buildConditions,
  pruneConditions,
  buildRelationCondition,
  buildRelationConditionInfo,
} from "../utils/fk.js";
export default {
  components: {
    transferVue,
  },
  data() {
    return {
      allOptions: [],
      value: [],
      oldValue: [],
      oldValues: [],
    };
  },
  computed: {
    calcTitles() {
      return [`请选择${this.field.info.label}`, `已选${this.field.info.label}`];
    },
    // sourceTitle() {
    //   return `请选择${this.field.info.label}`;
    // },
    // targetTitle() {
    //   return `已选${this.field.info.label}`;
    // },
    props() {
      let props = {
        key: this.field.info.valueCol,
        label: this.needRenameLabel() ? "valuezh" : this.field.info.dispCol,
        // checkStrictly: top?.env?.includes("health") ? false : true,
        checkStrictly: true,
        children: "children",
        isLeaf: "isLeaf",
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
          isTree: optionListV2?.is_tree || false,
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
        const formModel = this.formModel || this.field.form.srvValFormModel();
        const result = option_list_v3.find((item) => {
          if (item.conds?.length) {
            // 条件外键
            return item.conds.every(
              (cond) =>
                formModel[cond.case_col] &&
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
    // value: {
    //   type: [Array, String],
    //   default: "",
    // },
    formModel: {
      type: Object,
      default: () => ({}),
    },
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
    mainFormDatas: {
      type: Object,
      default: () => ({}),
    },
  },
  methods: {
    handleChange(val) {
      this.field.model = val?.toString();
      this.$emit("change", val);
      this.$emit("blur", this.field);
      this.emitFieldValueChange();
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
    getTransferValues() {
      return this.allOptions.filter(
        (item) =>
          item[this.field.info.valueCol] &&
          this.value.includes(item[this.field.info.valueCol])
      );
    },
    getAddValues() {
      // 新增的值
      let addValue = difference(this.value, this.oldValue);
      console.log("addValue", addValue);
      return this.allOptions.filter((item) => {
        if (this.props?.checkStrictly && item.is_leaf === "否") {
          return false;
        }
        return addValue.includes(item[this.field.info.valueCol]);
      });
    },
    getRemoveValues() {
      let removeValues = difference(this.oldValue, this.value);
      console.log("removeValues", removeValues);
      if (removeValues?.length) {
        return {
          data: this.oldValues.filter((item) =>
            removeValues.includes(item[this.field.info.name])
          ),
          serviceName: this.optionListV2?.transfer?.delService,
        };
      }
    },
    addToRight(checkedNodes) {
      console.log(checkedNodes);
      this.value = [...new Set([...this.value, ...checkedNodes])];
      this.handleChange(this.value);
    },
    removeFromRight(checkedNodes) {
      console.log(checkedNodes);
      this.value = this.value.filter((item) => !checkedNodes.includes(item));
      this.handleChange(this.value);
    },
    needRenameLabel() {
      return this.field.info.dispCol === "value";
    },
    loadChildNode: function (node, resolve) {
      let loader = this.dispLoaderV2;
      let queryJson = {
        serviceName: loader.service,
        queryMethod: "select",
        distinct: !!loader.distinct,
        // * is here to support redundant or img url expr etc...
        colNames: ["*"],
        condition: [
          {
            colName: loader.parentCol || "parent_no",
            ruleType: "eq",
            value: node.data[loader.refedCol],
          },
        ],
      };
      this.selectList(queryJson).then((response) => {
        if (response && response.data && response.data.data) {
          let options = response.data.data.map((item) => {
            item["label"] =
              loader.showAsPair !== true
                ? item[loader.dispCol]
                : `${item[loader.dispCol]}/${item[loader.refedCol]}`;
            item["value"] = item[loader.refedCol];
            item.isLeaf = item.is_leaf === "是";
            if (this.props?.checkStrictly) {
              // item.disabled = item.is_leaf === "否";
            }
            item.labelFunc = (item) => {
              if (item[loader.dispCol]) {
                if (loader.showAsPair) {
                  return `${item[loader.dispCol]}/${item[loader.refedCol]}`;
                } else {
                  return item[loader.dispCol];
                }
              } else {
                return item[loader.refedCol];
              }
            };
            return item;
          });
          resolve(options);
        }
      });
    },
    async loadData({ page, pageSize }) {
      let ret = {
        total: 0,
        data: [],
      };
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
          pageNo: page,
          rownumber: pageSize,
        },
      };
      if (loader.isTree) {
        // queryJson.rdt = "ttd";
        // delete queryJson.page;
        queryJson.page.rownumber = 9999;
      }
      if (loader) {
        if (loader.conditions) {
          // buildConditions({
          //   conditions: loader.conditions,
          //   rowData: this.formModel,
          //   mainData: this.mainFormDatas,
          //   vm: this,
          // }).forEach((c) => queryJson.condition.push(c));
          // queryJson.condition = pruneConditions(queryJson.condition);
          // queryJson.relation_condition = buildRelationConditionInfo({
          //   conditions: loader.conditions,
          //   fieldInfo: this.field.info,
          // });
        } else if (loader.relation_conditions) {
          queryJson.relation_condition = buildRelationCondition({
            relationConditions: loader.relation_conditions,
            fieldInfo: this.field.info,
            formModel: this.formModel,
            vm: this,
          });
        } else {
          // 如果没有配置 conditions 和 relation_condition , 自动处理 默认的 relation_condition
          queryJson.relation_condition = buildRelationConditionInfo(loader, "");
        }
      }

      let app = this.$srvApp && this.field.evalFormExpr(this.$srvApp, "");
      // app配置了this或者data.app的 使用当前app
      if (app === "this" || (!app && loader?.srvApp?.includes("data.app"))) {
        app = sessionStorage.getItem("current_app");
      }
      if (loader?.srvApp) {
        app = loader.srvApp;
      }
      const response = await this.selectList(queryJson, app);
      if (response && response.data && response.data.data) {
        ret.total = response.data.page.total;
        if (loader.isTree) {
          ret.rownumber = response.data.page.rownumber;
        }
        let options = response.data.data;
        // if (loader.dedup) {
        //   this.dedupOptions(options);
        // }

        options.forEach((item) => {
          item["label"] =
            loader.showAsPair !== true
              ? item[fieldInfo.dispCol]
              : `${item[fieldInfo.dispCol]}/${item[fieldInfo.valueCol]}`;
          item["value"] = item[fieldInfo.valueCol];
          item.isLeaf = item.is_leaf === "是";
          if (this.props?.checkStrictly) {
            // item.disabled = item.is_leaf === "否";
          }
          item.labelFunc = (item) => {
            if (item[fieldInfo.dispCol]) {
              if (loader.showAsPair) {
                return `${item[fieldInfo.dispCol]}/${item[fieldInfo.valueCol]}`;
              } else {
                return item[fieldInfo.dispCol];
              }
            } else {
              return item[fieldInfo.valueCol];
            }
          };
        });
        if (loader.isTree) {
          ret.data = this.flatToNestedTree(
            options,
            null,
            this.dispLoaderV2.parentCol || "parent_no",
            this.dispLoaderV2.refedCol || "id"
          );
        } else {
          ret.data = options.map((item) => item);
        }
        this.allOptions = cloneDeep(options);
      } else {
      }

      return ret;
    },
    // 将平铺的树形数据转换为嵌套的树形结构
    flatToNestedTree(
      flatData,
      rootId = null,
      parent_col = "parent_no",
      idCol = "id"
    ) {
      // 定义一个递归函数来构建树
      function buildTree(parent_no) {
        let filteredData = flatData.filter(
          (item) => item[parent_col] === parent_no
        );
        return filteredData.map((child) => ({
          ...child, // 复制当前节点的所有属性
          children: buildTree(child[idCol]), // 递归地为当前节点构建子树
        }));
      }

      // 开始构建树，从rootId开始寻找根节点
      return buildTree(rootId);
    },
    async loadRightData() {
      // 设置初始值
      console.log("loadRightData");

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
            rownumber: 9999,
          },
        };
        if (loader.conditions) {
          buildConditions(
            {
              conditions: loader.conditions,
              rowData: this.formModel,
              mainData: this.mainFormDatas,
              vm: this,
            },
            false
          ).forEach((c) => queryJson.condition.push(c));
          queryJson.condition = pruneConditions(queryJson.condition);
        }
        if (loader.relation_conditions) {
          queryJson.relation_condition = buildRelationCondition(loader);
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
            if (this.value.length && !this.dispLoaderV2.isTree) {
              // this.getInitValues();
            }
          }
        });
      }
    },
    getInitValues() {
      let list = this.value;
      if (Array.isArray(list) && list.length) {
        const loader = this.dispLoaderV2;
        const queryJson = {
          serviceName: loader?.service,
          queryMethod: "select",
          colNames: ["*"],
          condition: [
            {
              colName: loader.refedCol,
              ruleType: "in",
              value: list.toString(),
            },
          ],
          page: {
            pageNo: 1,
            rownumber: this.page.rownumber,
          },
        };
        // queryJson.relation_condition = {
        //   relation: "OR",
        //   data: list.map((item) => {
        //     return {
        //       colName: "path",
        //       ruleType: "[like",
        //       value: `/${item}/`,
        //     };
        //   }),
        // };
        this.selectList(queryJson).then((response) => {
          if (response && response.data && response.data.data) {
            const resData = response.data.data.map((item) => {
              item["label"] =
                loader.showAsPair !== true
                  ? item[loader.dispCol]
                  : `${item[loader.dispCol]}/${item[loader.refedCol]}`;
              item["value"] = item[loader.refedCol];
              item.isLeaf = item.is_leaf === "是";
              item.labelFunc = (item) => {
                if (item[loader.dispCol]) {
                  if (loader.showAsPair) {
                    return `${item[loader.dispCol]}/${item[loader.refedCol]}`;
                  } else {
                    return item[loader.dispCol];
                  }
                } else {
                  return item[loader.refedCol];
                }
              };
              return item;
            });
            // this.allOptions = cloneDeep(resData);
            // this.options.push(...resData);
            // this.options = this.flatToNestedTree(
            //   uniqBy([...resData, ...this.options], "value"),
            //   null,
            //   loader.parent_col,
            //   loader.refed_col
            // );
          }
        });
      }
    },
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
                this.loadRightData();
              }
            });
          }
        }
      },
      deep: true,
    },
  },
};
</script>

<style lang="scss" scoped></style>
