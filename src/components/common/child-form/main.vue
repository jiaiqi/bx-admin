<template>
  <div class="child-form">
    <span
      class="section-title"
      v-if="sectionName && optionListV2"
      style="display: flex; justify-content: space-between"
      >{{ sectionName }}
    </span>
    <add
      ref="add-form"
      :service="addService"
      :$srvApp="addApp"
      :navAfterSubmit="false"
      :submit2Db="submit2Db"
      :defaultCondition="evalOptionConditions"
      :defaultValues="submit2Db ? setDefaultValue : field.model"
      @executor-complete="onExecutorComplete"
      @form-loaded="onFormLoaded"
      @onInnerFormModelChanged="onInnerFormModelChanged"
      :key="addService"
      :isPlatChildForm="true"
      v-if="formType == 'add' && addService"
    >
    </add>
    <update
      name="list-update"
      ref="update-form"
      :pk="pk"
      :pkCol="pkCol"
      :service="updateService"
      :parentPageType="'list'"
      :navAfterSubmit="false"
      @form-loaded="onFormLoaded"
      @onInnerFormModelChanged="onInnerFormModelChanged"
      :key="updateService"
      :isPlatChildForm="true"

      v-else-if="formType == 'update' && updateService"
    >
    </update>
    <simple-detail
      name="detail"
      ref="detail-form"
      v-if="formType == 'detail' && detailService"
      :service="detailService"
      :isPlatChildForm="true"

      :default-conditions="defaultConditions"
    >
    </simple-detail>
  </div>
</template>

<script>
import cloneDeep from "lodash/cloneDeep";
import isObject from "lodash/isObject";

export default {
  name: "childForm",
  props: {
    field: {
      type: Object,
      default: () => ({}),
    },
    formModel: {
      type: Object,
      default: () => ({}),
    },
  },
  components: {
    Add: () => import("../add.vue"),
    Update: () => import("../update.vue"),
    SimpleDetail: () => import("../simple-detail.vue"),
    fieldEditor: () => import("../field-editor.vue"),
  },
  data() {
    return {
      addedData: null,
      _obj_col: null,
    };
  },
  methods: {
    emitFieldValueChange() {
      let objCol = null;
      let objInfo = this.optionListV2?.obj_info;
      const targetCol = objInfo?.a_save_b_obj_col;
      const targetColField = this.field?.form?.allFields?.[targetCol];
      if (objInfo?.a_save_b_cols && objInfo?.a_save_b_obj_col) {
        // fk字段值改变后，更新其option_list_v3中配置的的a_save_b_obj_col
        const newValue = this.getChildFormVm()?.getBasicForm()?.formModel;
        const cols = objInfo?.a_save_b_cols.split(",");
        let obj = {};
        let objStr = "";
        if (cols?.includes("*")) {
          obj = cloneDeep(newValue);
        } else if (newValue && cols?.length) {
          cols.forEach((col) => {
            if (newValue?.[col]) {
              obj[col] = newValue?.[col];
            }
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
        // 将更新的字段信息保存在_obj_col上，方便在form中获取
        this._obj_col = objCol;
        if (
          (!objStr && !targetColField.getSrvVal?.()) ||
          targetColField.getSrvVal?.() === objStr
        ) {
          return;
        }
        targetColField?.setSrvVal?.(objStr);
      } else if (this.field?._obj_col?.val) {
        // 清空通过_obj_col保存的值
        this._obj_col = null;
        if (!targetColField.getSrvVal?.()) {
          return;
        }
        targetColField?.setSrvVal?.(null);
      }

      // this.$emit("field-value-changed", this.field.info.name, this.field);
    },
    getChildFormVm() {
      return this.$refs[`${this.formType}-form`];
    },
    getChildFormModel() {
      // return this.$refs[`${this.formType}-form`]?.srvValFormModel();
      return this.$refs[`${this.formType}-form`]?.buildRunQuries();
    },
    onInnerFormModelChanged(event) {
      // a_save_b_obj_col字段值改变后，更新其option_list_v3中配置的的a_save_b_obj_col
      // this.emitFieldValueChange();
    },
    buildConditions: function (dispLoader) {
      let ret = [];
      const rowData = this.field.form.srvValFormModel();
      const mainData = this.mainformDatas;
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
    onFormLoaded: function (form) {
      if (form?.actions?.submit) {
        // 去掉提交后跳转事件
        form.actions.submit.nav2Location = null;
      }
    },
    onExecutorComplete(event) {
      console.log("onExecutorComplete:", event);
      const data = event?.data?.response[0]?.response?.effect_data?.[0];
      if (data) {
        this.handleSelect(data);
        if (this.formType === "add" && this.allowEditAndSelect) {
          // 当前数据为allow_input是编辑选择的字段，点击添加按钮，在add弹窗中新创建的数据
          this.addedData = cloneDeep(data);
        }
      }
    },
  },
  computed: {
    sectionName() {
      return this.optionListV2?.section_name || this.field?.info?.label || "";
    },
    formType() {
      const service = this.field?.info?.srvCol?.service_name;
      return service?.includes("add")
        ? "add"
        : service?.includes("update")
        ? "update"
        : "detail";
    },
    submit2Db() {
      if (
        this.optionListV2?.allow_input === "自行输入" &&
        this.formType === "add"
      ) {
        // if (this.optionListV2?.allow_input === "自行输入" && (this.formType === 'add' ||!this.field.getSrvVal())) {
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
          conditions: optionListV2.conditions || optionListV2.condition || [],
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
        // return this.field?.info?.dispLoader;
      }
    },
    optionListV3() {
      return this.field?.info?.srvCol?.option_list_v3;
    },
    optionListV2() {
      let result = null;
      if (this.optionListV3?.length) {
        // 如果有v3 则使用v3
        const option_list_v3 = this.optionListV3;
        // const formModel = this.field.form.srvValFormModel();
        const formModel = this.field.form.formModel;
        console.log("formModel", formModel);

        result = option_list_v3.find((item) => {
          if (item.conds?.length) {
            // 条件外键
            return item.conds.every((cond) => {
              if (cond.case_val && formModel[cond.case_col]) {
                const pass =
                  formModel[cond.case_col]?.includes?.(cond.case_val) ||
                  cond.case_val?.includes?.(formModel[cond.case_col]);
                console.log("pass", pass);
                return pass;
              }
            });
          } else {
            return true;
          }
        });
      } else if (this.field?.info?.srvCol?.option_list_v2) {
        result = this.field.info.srvCol.option_list_v2;
      }
      result = cloneDeep(result);
      // if (!result) {
      //   result = this.field?.info?.srvCol?.option_list_v2;
      // }
      if (
        Array.isArray(result?.condition) &&
        !Array.isArray(result?.conditions)
      ) {
        result.conditions = result.condition;
      }
      if (this.field?.info?._upstreamCondition?.colName) {
        if (Array.isArray(result?.conditions)) {
          result.conditions.push(cloneDeep(this.field.info._upstreamCondition));
        } else if (result) {
          result.conditions = [cloneDeep(this.field.info._upstreamCondition)];
        }
      }
      return result;
    },
    evalOptionConditions() {
      // 解析请求条件
      let loader = this.dispLoaderV2;
      if (Array.isArray(loader?.conditions)) {
        let condition = [];
        this.buildConditions(loader).forEach((c) => condition.push(c));
        return condition;
      }
    },
    setDefaultValue() {
      if (
        Array.isArray(this.evalOptionConditions) &&
        this.evalOptionConditions.length
      ) {
        return this.evalOptionConditions.reduce((res, cur) => {
          res[cur.colName] = cur.value;
          return res;
        }, {});
      }
    },
    setDisabled() {
      return this.disabled === true || this.field.info.editable === false;
    },
    addSrvCfg() {
      return this.optionListV2?.add_srv_cfg;
    },
    addService() {
      return this.optionListV2?.add_srv_cfg?.srv;
    },
    addApp() {
      return (
        this.addSrvCfg?.app || this.optionListV2?.srv_app || this.appNo || null
      );
    },
    pkCol() {
      return this.optionListV2?.refed_col;
    },
    pk() {
      return this.formModel?.[this.field.info.name];
    },
    updateSrvCfg() {
      return this.optionListV2?.update_srv_cfg;
    },
    updateService() {
      return (
        this.optionListV2?.update_srv_cfg?.srv ||
        this.optionListV2?.serviceName?.replace("_select", "_update")
      );
    },
    updateApp() {
      return (
        this.updateSrvCfg?.app ||
        this.optionListV2?.srv_app ||
        this.appNo ||
        null
      );
    },
    detailService() {
      return this.optionListV2?.serviceName;
    },
    defaultConditions() {
      return [
        {
          colName: this.pkCol,
          ruleType: "eq",
          value: this.pk,
        },
      ];
    },
    allowEditAndSelect() {
      // 编辑选择
      return (
        this.addSrvCfg?.permission &&
        this.addSrvCfg.srv &&
        this.optionListV2.allow_input === "编辑选择"
      );
    },
    onlyEdit() {
      // 自行输入
      return (
        this.addSrvCfg?.permission &&
        this.addSrvCfg.srv &&
        this.optionListV2.allow_input === "自行输入"
      );
    },
    isAdded() {
      // 是否是add表单中新创建的fk数据
      return (
        this.allowEditAndSelect &&
        this.formType === "add" &&
        this.field.getSrvVal() &&
        this.addedData?.[this.optionListV2?.refed_col] ===
          this.field.getSrvVal()
      );
    },
  },
  created() {
    this.field.ChildForm = this;
  },
};
</script>

<style lang="scss">
.child-form {
  width: 100%;
  .section-title {
    width: 100%;
    display: flex;
    justify-content: space-between;
  }
  > .el-card {
    border: none;
    width: 100%;
    .form-view-wrapper.el-row {
      border: none;
      > .el-form {
        > .el-row {
          border: none;
          padding: 8px 0;
        }
      }
    }
  }
}
</style>
