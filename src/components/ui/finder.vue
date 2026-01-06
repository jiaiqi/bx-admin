/* */
<template>
  <div>
    <div v-if="subType !== 'select'">
      <a
        v-if="field.info.linkUrlFunc && setDisabled && !isFks"
        v-show="field.getSrvVal()"
        style="white-space: normal; color: dodgerblue; cursor: pointer"
        @click="onLinkClicked()"
      >
        {{ field.getDispVal4Read() }}
      </a>
      <div
        class="div-el-input"
        v-else-if="onlyEdit && ['add', 'update'].includes(formType)"
        @click="onClickEdit"
      >
        <span v-if="field.getDispVal()">{{ field.getDispVal() }}</span>
        <span
          v-else
          class="placeholder"
        >点击进行编辑</span>
        <i
          class="el-icon-circle-close close-icon"
          title="清除"
          @click.stop="handleSelect()"
          v-if="field.getDispVal()"
        ></i>
        <i class="el-icon-edit"></i>
      </div>
      <location-picker
        v-else-if="isLocation"
        :field="field"
        :disabled="setDisabled"
        :mainformDatas="mainformDatas"
        :defaultValues="defaultValues"
        :current-selected="field.model"
        @on-selected="onPickerSelected"
      ></location-picker>
      <id-card-upload
        v-else-if="isIdCard"
        :field="field"
        :disabled="setDisabled"
        :mainformDatas="mainformDatas"
        :defaultValues="defaultValues"
        :current-selected="field.model"
        @on-selected="onPickerSelected"
      ></id-card-upload>
      <table-picker
        ref="tablePicker"
        v-bind="$props"
        :optionListV3="optionListV3"
        :optionListV2="optionListV2"
        :selectedGridData="multiSelected"
        :finder-selected="field.model"
        :defaultValues="defaultValues"
        :mainformDatas="mainformDatas"
        :disabled="setDisabled"
        @on-selected="onPickerSelected"
        v-else-if="isFks"
      ></table-picker>
      <div
        v-else
        style="display: flex; align-items: center"
      >
        <multi-tab-option-select
          v-if="useMultiTabOptionSelect === true"
          :placeholder="field.info.placeholder"
          :optionListV3="optionListV3"
          :field="field"
          :disabled="setDisabled"
          :prefix-icon="(dispLoaderV2 &&
            dispLoaderV2.imgType === 'eicon' &&
            field.getSrvVal()) ||
            ''
            "
          v-model="selected"
          @select="multiTabSelectChange"
        ></multi-tab-option-select>
        <el-autocomplete
          ref="autocomplete"
          :prefix-icon="(dispLoaderV2 &&
            dispLoaderV2.imgType === 'eicon' &&
            field.getSrvVal()) ||
            ''
            "
          :trigger-on-focus="showAutocomplete"
          :fetch-suggestions="loadOptions"
          :value-key="field.info.valueCol"
          :disabled="setDisabled"
          v-model="inputValue"
          :placeholder="field.info.placeholder"
          clearable
          @select="handleSelect"
          @blur="handleBlur"
          style="min-width: 220px; flex: 1"
          class="finder-autocomplete"
          v-else
        >
          <div slot="append">
            <el-button
              icon="el-icon-search"
              v-if="!field.info.noSearchIcon"
              @click="onPopupClicked"
            >
            </el-button>
          </div>
          <template slot-scope="{ item }">
            <span style="float: left">{{ item.labelFunc(item) }}</span>
            <i
              :class="item.elIconFunc(item)"
              style="font-size: 20px"
              v-if="item.elIconFunc"
            ></i>
            <div
              class="svg-icon"
              v-html="recoverFileAddress4richText(item.imgUrlFunc(item))"
              v-else-if="
                item.imgUrlFunc &&
                item.imgUrlFunc(item) &&
                item.imgUrlFunc(item).includes('<svg')
              "
              height="30"
              width="30"
            ></div>
            <img
              :src="item.imgUrlFunc(item)"
              v-else-if="item.imgUrlFunc"
              height="30"
              width="30"
            />
          </template>
        </el-autocomplete>
        <el-button
          icon="el-icon-edit"
          style="margin-left: 5px; height: 38px"
          size="mini"
          v-if="allowEditAndSelect && field.getSrvVal()"
          @click="showPopup('update')"
        >
        </el-button>
        <el-button
          icon="el-icon-plus"
          style="margin-left: 5px; height: 38px"
          size="mini"
          v-else-if="!setDisabled && allowEditAndSelect && !field.getSrvVal()"
          @click="showPopup('add')"
        >
        </el-button>
      </div>
      <el-dialog
        :title="'新增'"
        width="90%"
        :close-on-click-modal="1 == 2"
        append-to-body
        :visible="activePopup === 'add'"
        @close="activePopup = ''"
      >
        <add
          name="add-popup"
          ref="add-form"
          :service="addService"
          :$srvApp="addApp"
          :navAfterSubmit="false"
          :submit2Db="submit2Db"
          :defaultCondition="evalOptionConditions"
          :defaultValues="submit2Db ? setPopupDefaultValue : field.model"
          @submitted2mem="submitted2mem"
          @executor-complete="onExecutorComplete"
          @form-loaded="onPopupFormLoaded"
          v-if="activePopup == 'add'"
        >
        </add>
      </el-dialog>
      <el-dialog
        :title="'编辑'"
        width="90%"
        :close-on-click-modal="1 == 2"
        append-to-body
        :visible="activePopup === 'update'"
        @close="activePopup = ''"
      >
        <update
          name="add-popup"
          ref="update-form"
          :pk="field.getSrvVal()"
          :pkCol="optionListV2.refed_col"
          :service="updateService"
          :$srvApp="updateApp"
          :navAfterSubmit="false"
          :submit2Db="true"
          :defaultConditions="[
            {
              colName: optionListV2.refed_col,
              ruleType: 'eq',
              value: field.getSrvVal(),
            },
          ]"
          :defaultCondition="evalOptionConditions"
          :defaultValues="field.model || setPopupDefaultValue"
          :reference-row-data="formModel"
          :reference-no-column="noFieldColumn"
          :parentPageType="formType"
          @submitted2mem="submitted2mem"
          @executor-complete="onExecutorComplete"
          @form-loaded="onPopupFormLoaded"
          v-if="activePopup == 'update'"
        >
        </update>
      </el-dialog>
      <el-dialog
        title="查询选择"
        width="90%"
        :close-on-click-modal="1 == 2"
        append-to-body
        :visible="popup"
        @close="popup = false"
      >
        <list
          :service="dispLoaderV2.service"
          v-if="popup"
          ref="popup"
          :$srvApp="appNo"
          mode="finder"
          listType="selectlist"
          :grid-data-filter="this.dedupOptions"
          :default-condition="popupDefaultConditions()"
          @row-dbclick="onRowSelected"
        >
        </list>
        <div style="text-align: center; color: red">请双击列表行进行选择</div>
      </el-dialog>
    </div>
    <div v-if="subType === 'select'">
      <el-select
        v-model="selected"
        :value-key="field.info.dispCol"
        :disabled="setDisabled"
        clearable
        @visible-change="getOptions"
        @change="handleSelect"
        :placeholder="field.info.placeholder"
      >
        <el-option
          v-for="item in optionsRun"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        >
        </el-option>
      </el-select>
    </div>
  </div>
</template>

<script>

import remove from "lodash/remove";
import cloneDeepWith from "lodash/cloneDeepWith";
import cloneDeep from "lodash/cloneDeep";
import isEmpty from "lodash/isEmpty";
import isObject from "lodash/isObject";
import isEqual from "lodash/isEqual";
import multiTabOptionSelect from "./fk-select/multi-tab-option-select.vue";
import aSaveBMixin from "../mixin/a-save-b.mixin";

// ui组件
import tablePicker from "../common/table-picker.vue";
import locationPicker from "./location-picker.vue";
import idCardUpload from "./id-card-upload.vue";

export default {
  components: {
    List: () => import("../common/list.vue"),
    tablePicker,
    locationPicker,
    idCardUpload,
    Add: () => import("../common/add.vue"),
    Update: () => import("../common/update.vue"),
    multiTabOptionSelect,
    //  () => import("../common/table-picker.vue")
  },
  mixins: [aSaveBMixin],
  model: {
    prop: "finderSelected",
    event: "change",
  },
  props: {
    field: Object,
    defaultConditions: Array,
    finderSelected: [String, Object, Number],
    defaultValues: Object,
    childForeignkey: Object,
    mainformDatas: Object,
    formModel: Object,
    disabled: Boolean,
  },
  data() {
    return {
      selected: null,
      inputValue: "",
      popup: false,
      activePopup: "",
      appNo: null,
      options: [],
      childForeign: null,
      multiSelected: [],
      hasInit: false, // 已经设置过初始值
      addedData: null, // 当前数据为allow_input是编辑选择的字段,点击添加按钮,在add弹窗中新创建的数据
    };
  },
  watch: {
    optionListV2: {
      deep: true,
      immediate: true,
      handler(newVal, oldVal) {
        // this.handleSelect(null)
        if (!isEqual(newVal, oldVal) && isObject(oldVal) && this.optionListV3) {
          // optionListV2变化了 清空已选的值
          // console.log(
          //   "optionListV2变化了:",
          //   cloneDeep(newVal),
          //   cloneDeep(oldVal)
          // );
          this.handleSelect(null);
        }
        if (
          newVal?.serviceName &&
          this.field?.info?.srvCol?.option_list_v2?.serviceName
        ) {
          if (
            JSON.stringify(newVal) !==
            JSON.stringify(this.field?.info?.srvCol?.option_list_v2 || {})
          ) {
            const srvCol = cloneDeep(this.field.info.srvCol);
            srvCol.option_list_v2 = cloneDeep(newVal);
            this.field.info.resolveOptions(srvCol);
          }
        }
      },
    },
    "field.form.formModel": {
      deep: true,
      immediate: true,
      handler(newValue, oldValue) {
        if (typeof newValue === "object") {
          if (this.field?.info?.upstream?.field) {
            const field = this.field?.info?.upstream?.field;
            if (newValue[field]) {
              // 上游字段值改变后 主动触发el-autocomplate查询数据的方法
              this.$refs?.autocomplete?.getData();
            }
          }
        }
      },
    },
    selected(newVal) {
      this.$emit("change", newVal);
      this.$emit("blur", this.field);
      this.emitFieldValueChange();
    },
    childForeignkey: {
      deep: true,
      immediate: true,
      handler: function (newval, olval) {
        // console.log(newval,olval)
        if (newval) {
          for (const key in newval) {
            if (key == "referenced_column_name") {
              this.childForeign = newval[key];
            }
          }
        }
      },
    },
    defaultValues: {
      deep: true,
      immediate: true,
      handler: function (newval, olval) {
        for (const key in newval) {
          if (
            key == this.childForeign &&
            this.field.info.name == this.childForeign
          ) {
            // this.selected=newval[key]
            this.handleSelect(newval[key]);
          }
        }
      },
    },
    "field.model": {
      deep: true,
      immediate: true,
      handler: function (newval, olval) {
        // console.log("field.model", this.field.info.name, newval);
        this.setInitVal();
      },
    },
  },
  computed: {
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
    useMultiTabOptionSelect() {
      // 条件外键，没有符合的条件，使用多tab下拉组件
      return (
        !this.optionListV2 &&
        this.optionListV3?.filter((item) => item.conds?.length)?.length > 0
      );
    },
    optionListV2() {
      let result = null;
      if (this.optionListV3?.length) {
        // 如果有v3 则使用v3
        const option_list_v3 = this.optionListV3;
        const data = this.formModel;
        result = option_list_v3.find(
          (item) =>
            !item.conds?.length ||
            item.conds?.every(
              (cond) =>
                data?.[cond.case_col] &&
                cond.case_val?.includes?.(data?.[cond.case_col])
            )
        );
        // console.log("optionListV2", result, data);
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
    noFieldColumn() {
      let noField = this.field?.form?.srvCols?.find(
        (item) => item.bx_col_type === "no" && item.auto_generate
      );
      if (noField && noField.columns) {
        return noField.columns;
      }
      return null;
    },
    setPopupDefaultValue() {
      let obj = {};
      if (
        Array.isArray(this.evalOptionConditions) &&
        this.evalOptionConditions.length
      ) {
        this.evalOptionConditions.forEach((cur) => {
          obj[cur.colName] = cur.value;
        });
      }
      if (this.addService === "srvpage_cfg_style_add") {
        if (this.noFieldColumn && this.formModel[this.noFieldColumn]) {
          obj["owner_no"] = this.formModel[this.noFieldColumn];
          if (this.noFieldColumn === "page_no") {
            obj.page_no = obj["owner_no"];
            obj.obj_type = "页面";
          } else if (this.noFieldColumn === "com_no") {
            obj.com_no = obj["owner_no"];
            obj.obj_type = "组件";
          } else if (this.noFieldColumn === "card_no") {
            obj.com_no = obj["owner_no"];
            obj.obj_type = "卡片单元";
          } else if (this.noFieldColumn === "card_part_no") {
            obj.obj_type = "部件";
          }
        }
      }
      return obj;
    },
    setDisabled() {
      return this.disabled === true || this.field.info.editable === false;
    },
    optionsRun: function () {
      return this.options;
    },
    subType: function () {
      let subType = this.field.info.srvCol.subtype;
      return subType;
    },
    showAutocomplete: function () {
      let self = this;
      let showAutocomplete = true;
      let moreConfig = self.field.info.moreConfig;
      showAutocomplete =
        moreConfig && moreConfig.hasOwnProperty("showAutocomplete")
          ? moreConfig.showAutocomplete
          : true;
      return showAutocomplete;
    },
    isFks() {
      return (
        ["fks", "fkjson", "fkjsons"].includes(this.field?.info?.type) ||
        this.field?.info?.moreConfig?.multi === true
      );
    },
    isLocation() {
      return this.field.info?.type === "bxsys_obj_type_gps";
    },
    // 是否是身份证类型，使用身份证上传组件
    isIdCard() {
      return this.field.info?.type === "bxsys_type_idcard";
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
    allowEditAndSelect() {
      // 编辑选择
      if (this.field.info?._inFilterForm === true) {
        // 过滤表单需要编辑选择
        return false
      }
      return (
        this.addSrvCfg?.permission &&
        this.addSrvCfg.srv &&
        this.optionListV2.allow_input === "编辑选择"
      );
    },
    onlyEdit() {
      // 自行输入
      // if (this.formType === 'update' && !this.field.getSrvVal()) {
      //   return false
      // }
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
  methods: {
    showPopup(type) {
      if (this.field.info.srvCol.columns === "style_no") {
        let noField = this.field?.form?.srvCols?.find(
          (item) => item.bx_col_type === "no" && item.auto_generate
        );
        if (noField?.columns && this.formModel[noField.columns]) {
          if (type === "update") {
            // this.referenceRowData = this.formModel;
          }
        }
      }
      this.activePopup = type;
    },
    multiTabSelectChange(item, cfg) {
      this.field?.form?.allFields?.[cfg.case_col]?.setSrvVal?.(cfg.case_val);
      this.$nextTick(() => {
        this.handleSelect(item, cfg);
      });
    },
    onClickEdit() {
      if (this.optionListV2?.view_model?.includes("平铺展示")) {
      } else {
        if (this.formType === "update" && !this.field.getSrvVal()) {
          // 编辑表单，未选中数据，则打开add弹窗
          this.activePopup = "add";
        } else {
          this.activePopup = this.formType;
        }
      }
    },
    onPopupFormLoaded: function (form) {
      if (form?.actions?.submit) {
        // 去掉提交后跳转事件
        form.actions.submit.nav2Location = null;
      }
    },
    submitted2mem(event) {
      // console.log("submitted2mem:", event);
      if (
        typeof event === "object" &&
        Object.keys(event).length &&
        Object.keys(event).some((key) => event[key] && true)
      ) {
        // 值是一个对象且对象中含有有值的key
        const result = Object.keys(event).reduce((res, key) => {
          if (
            event[key] !== undefined &&
            event[key] !== null &&
            event[key] !== ""
          ) {
            res[key] = event[key];
          }
          return res;
        }, {});
        this.field.model = result;
        this.selected = result;
      } else {
        this.field.model = null;
        this.selected = null;
      }
      this.activePopup = "";
    },
    onExecutorComplete(event) {
      // console.log("onExecutorComplete:", event);
      const data = event.data?.response[0]?.response?.effect_data?.[0];
      if (data) {
        this.handleSelect(data);
        if (this.formType === "add" && this.allowEditAndSelect) {
          // 当前数据为allow_input是编辑选择的字段，点击添加按钮，在add弹窗中新创建的数据
          this.addedData = cloneDeep(data);
        }
      }
      this.activePopup = "";
    },
    setInitVal() {
      let fieldInfo = this.field.info;
      if (
        this.hasInit === false &&
        this.options.length > 0 &&
        !this.field.model &&
        this.field.info &&
        this.field.info.srvCol &&
        this.field.info.srvCol.init_expr === "$firstRowData"
      ) {
        let loader = this.dispLoaderV2;
        this.field.model = this.options[0];
        this.selected =
          loader.showAsPair !== true
            ? (this.options[0][fieldInfo.dispCol]||this.options[0][fieldInfo.valueCol])
            : `${this.options[0][fieldInfo.dispCol]}/${this.options[0][fieldInfo.valueCol]
            }`;
        this.hasInit = true;
      } else if (this.field.model && this.finderSelected) {
        this.selected = this.finderSelected;
      } else if (!this.field.model && !this.finderSelected) {
        this.selected = null;
      }
      this.inputValue = this.selected
    },
    onPickerSelected(selected) {
      this.field.model = selected;
      this.selected = selected;
    },
    getOptions(queryString) {
      let self = this;
      let fieldInfo = this.field.info;
      let loader = this.dispLoaderV2;
      if (!loader) {
        return;
      }
      if (queryString == true) {
        if (loader.enableFunc) {
          if (!loader.enableFunc()) {
            // cb([]);
            return;
          }
        }
        // console.log(queryString, cb)
        let queryJson = {
          serviceName: loader.service,
          queryMethod: "select",
          distinct: !!loader.distinct,
          // * is here to support redundant or img url expr etc...
          colNames: ["*"],
          condition: [],
          page: {
            pageNo: 1,
            rownumber: 20,
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
                    return `${item[fieldInfo.dispCol]}/${item[fieldInfo.valueCol]
                      }`;
                  } else {
                    return item[fieldInfo.dispCol] || item[fieldInfo.valueCol];
                  }
                } else {
                  return item[fieldInfo.valueCol];
                }
                return loader.showAsPair !== true
                  ? item[fieldInfo.dispCol]
                  : `${item[fieldInfo.dispCol]}/${item[fieldInfo.valueCol]}`;
              };
            });

            // options.forEach((item) => {
            //   item.labelFunc = (data) => {
            //     return loader.showAsPair !== true
            //       ? data[fieldInfo.dispCol]
            //       : `${data[fieldInfo.dispCol]}/${data[fieldInfo.valueCol]}`;
            //   };
            // });
            this.options = options.map((item) => item);
            // cb(options)
            this.setInitVal();
          } else {
            // cb([]);
            return [];
          }
        });
      }
    },
    getLinkUrl() {
      let data =
        this.field && this.field.form && this.field.form.srvValFormModel();
      if (this.field.info.linkUrlFunc) {
        let url = this.field.info.linkUrlFunc(data, this);
        return url;
      }
    },

    onLinkClicked() {
      let tabTitle =
        (this.field.info.srvCol &&
          this.field.info.srvCol.option_list_v2 &&
          this.field.info.srvCol.option_list_v2.service_label) ||
        "详情";
      // this.addTabByUrl(this.getLinkUrl(), tabTitle)

      let linkUrl = this.getLinkUrl();
      if (
        typeof linkUrl === "string" &&
        (linkUrl.indexOf("?openlayer=") !== -1 ||
          linkUrl.indexOf("&openlayer=") !== -1)
      ) {
        let paramStr =
          linkUrl.indexOf("?") !== -1
            ? linkUrl.slice(linkUrl.indexOf("?") + 1)
            : "";
        let paramArr = [];
        if (paramStr) {
          paramArr = paramStr.split("&");
        }
        let result = false;
        paramArr.forEach((item) => {
          if (item.indexOf("openlayer=") !== -1) {
            result = item.split("openlayer=")[1];
          }
        });
        if (result == "true") {
          top.layer.open({
            type: 2,
            area: ["70%", "60%"],
            content: this.getLinkUrl(), //这里content是一个URL，如果你不想让iframe出现滚动条，你还可以content: ['http://sentsin.com', 'no']
          });
        } else {
          this.addTabByUrl(this.getLinkUrl(), tabTitle);
        }
        // linkUrl = linkUrl.slice(start,)
      } else {
        this.addTabByUrl(this.getLinkUrl(), tabTitle);
      }
    },

    popupDefaultConditions(loader) {
      let conditions = this.defaultConditions || [];
      let fieldInfo = this.field.info;
      loader = loader || this.dispLoaderV2;
      return conditions.concat(this.buildConditions(loader));
    },

    dedupOptions(options, loader) {
      loader = loader || this.dispLoaderV2;
      if (!loader?.dedup) {
        return;
      }

      let form = this.field.form;
      if (form) {
        let gridData = form.srvValFormModel()._gridData;
        if (gridData && gridData.length) {
          let key_col = this.field.info.srvCol.columns;
          let existVals = gridData.map((item) => item[key_col]);
          remove(options, (option) => existVals.includes(option[key_col]));
        }
      }
    },

    loadOptions(queryString, cb) {
      let self = this;

      let fieldInfo = this.field.info;
      let loader = this.dispLoaderV2;
      if (!loader) {
        cb([]);
        return;
      }
      if (loader.enableFunc) {
        if (!loader.enableFunc()) {
          cb([]);
          return;
        }
      }
      // console.log(queryString, cb)
      let queryJson = {
        serviceName: loader.service,
        queryMethod: "select",
        distinct: !!loader.distinct,
        // * is here to support redundant or img url expr etc...
        colNames: ["*"],
        condition: [],
        page: {
          pageNo: 1,
          rownumber: 20,
        },
      };

      // if (queryString) {
      //   queryJson.condition.push({
      //     colName: fieldInfo.dispCol,
      //     value: queryString,
      //     ruleType: 'like'
      //   });
      // }

      if (loader) {
        if (loader.conditions) {
          this.buildConditions(loader).forEach((c) =>
            queryJson.condition.push(c)
          );
          queryJson.condition = this.pruneConditions(queryJson.condition);
          queryJson.relation_condition = this.buildRelationConditionInfo(
            loader,
            queryString
          );
        } else if (loader.relation_conditions) {
          queryJson.relation_condition = this.buildRelationCondition(loader);
        } else {
          // 如果没有配置 conditions 和 relation_condition , 自动处理 默认的 relation_condition
          queryJson.relation_condition = this.buildRelationConditionInfo(
            loader,
            queryString
          );
        }
      }

      if (loader && loader.orders) {
        queryJson.order = loader.orders;
      }

      let app = this.$srvApp && this.field.evalFormExpr(this.$srvApp, "");
      // app配置了this或者data.app的 使用当前app
      if (app === "this" || (!app && loader?.srvApp?.includes("data.app"))) {
        app = sessionStorage.getItem("current_app");
      }
      if (this.$srvApp && !app) {
        // 使用了动态srvApp，但是eval结果出错，取消查询
        cb([]);
        return;
      }
      return this.selectList(queryJson, app).then((response) => {
        if (response && response.data && response.data.data) {
          let options = response.data.data;
          if (loader.dedup) {
            this.dedupOptions(options);
          }

          options.forEach((item) => {
            item.labelFunc = (data) => {
              return loader.showAsPair == true
                ? `${data[fieldInfo.dispCol]}/${data[fieldInfo.valueCol]}`
                : (data[fieldInfo.dispCol] || data[fieldInfo.valueCol]);
            };
          });
          options.forEach((option) => {
            if (loader.imgType === "imgdata" && loader.refedCol) {
              option.imgUrlFunc = (data) => data[loader.refedCol];
            } else if (loader.imgType === "eicon" && loader.refedCol) {
              option.elIconFunc = (data) => data[loader.refedCol];
            } else if (loader.imgUrlExpr) {
              option.imgUrlFunc = (data) => {
                return (
                  this.serviceApi().downloadFileNo + data[loader.imgUrlExpr]
                );
              };
            }
          });
          this.options = this.bxDeepClone(options);
          
          cb(options);
        } else {
          cb([]);
          this.$refs.autocomplete.$refs.input &&
            this.$refs.autocomplete.$refs.input.blur();
        }
      });
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
      // console.log("dispLoader:", dispLoader);

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
          if( queryString && this.field.info.dispCol&&!this.field.info.dispCol.startsWith("_")){
            dataTemp.data = [];
            dataItem.ruleType = "[like]";
            dataItem.colName = this.field.info.dispCol;
            dataItem.value = queryString == null ? "" : queryString;
            dataTemp.data.push(self.bxDeepClone(dataItem));
            relaTemp.data.push(self.bxDeepClone(dataTemp));
          }
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
          } else if(valueExpr && typeof valueExpr === "string" && !valueExpr.startsWith("'") && !valueExpr.includes(".") &&  !valueExpr?.includes('(')){
            // 字符串类型且不以'开头，不包含.，则认为是常量
            condition.value = valueExpr
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

    handleSelect(item, loader) {
      // console.log("handleSelect", item);
      this.field.model = item;

      let fieldInfo = this.field.info;
      loader = loader || this.dispLoaderV2;
      if (this.subType == "select") {
        let selectItem = this.options.filter(
          (opt) => opt[fieldInfo.valueCol] == item
        );
        this.field.model = selectItem[0] || "";
        // this.emitFieldValueChange();
      } else {
        if (item === null || item === undefined || item === "") {
          this.selected = "";
        } else {
          this.selected =
            loader.showAsPair !== true
              ? (item[fieldInfo.dispCol] || item[fieldInfo.valueCol])
              : `${item[fieldInfo.dispCol]}/${item[fieldInfo.valueCol]}`;
        }
      }
      this.emitFieldValueChange();
    },

    emitFieldValueChange() {
      let objCol = null;
      let objInfo = this.optionListV2?.obj_info;
      if (objInfo?.a_save_b_cols && objInfo?.a_save_b_obj_col) {
        // fk字段值改变后，更新其option_list_v3中配置的的a_save_b_obj_col
        let newValue = this.field.model;
        if (this.isFks) {
          newValue = this.$refs?.tablePicker?.getSelectedData?.();
        }
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
        // console.log("更新obj_info", objCol);
        // 将更新的字段信息保存在_obj_col上，方便在form中获取
        this.$set(this.field, "_obj_col", objCol);
      } else if (this.field?._obj_col?.val) {
        // 清空通过_obj_col保存的值
        this.$set(this.field["_obj_col"], "val", "");
      }
      this.$emit("field-value-changed", this.field.info.name, this.field);
    },

    handleBlur() {
      let queryString = this.inputValue
      let options = this.options
      const fieldInfo = this.field.info;
      if (queryString && queryString != this.selected && options.length === 1 && (options[0][fieldInfo.valueCol] == queryString || options[0][fieldInfo.dispCol] == queryString)) {
        // 如果搜索到的值只有一条而且value字段或者label字段的值完全匹配queryString，则选中这条数据
        this.handleSelect(options[0]);
        this.$refs.autocomplete.$refs.input && this.$refs.autocomplete.$refs.input.blur();
        this.$refs.autocomplete.activated = false;
      } else if (queryString && queryString != this.selected) {
        this.$message.warning("未找到匹配的数据");
        this.inputValue = this.field.model[fieldInfo.dispCol] || this.selected || '';
      }
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

    setSrvVal(srvVal) {
      if (srvVal == null || srvVal == undefined) {
        this.selected = null;
        if (this.field.model === srvVal) {
          return;
        }
        this.emitFieldValueChange();
        return;
      }

      let fieldInfo = this.field.info;
      let loader = this.dispLoaderV2;
      if (!loader) return;
      let queryJson = {
        serviceName: loader.service,
        queryMethod: "select",
        colNames: ["*"],
        condition: [
          {
            colName: fieldInfo.valueCol,
            value: srvVal,
            ruleType: srvVal?.includes?.(",") ? "in" : "eq",
          },
        ],
      };

      if (["fkjsons", "fkjson", "fks"].includes(fieldInfo.type)) {
        let json = null;
        if (srvVal && typeof srvVal === 'string' && fieldInfo.type !== 'fks') {
          try {
            json = JSON.parse(srvVal);
          } catch (error) {
            // console.log(error);
          }
        }
        let valCol = fieldInfo.fmt && fieldInfo.fmt.primary_col;
        if (valCol && json) {
          if (fieldInfo.type === "fkjson") {
            queryJson.condition = [
              {
                colName: fieldInfo.valueCol,
                value: json[valCol],
                ruleType: "eq",
              },
            ];
          } else if (fieldInfo.type === "fkjsons") {
            queryJson.condition = [
              {
                colName: fieldInfo.valueCol,
                value: json.map((item) => item[valCol]).toString(),
                ruleType: "in",
              },
            ];
          } else if (fieldInfo.type === "fks") {
            queryJson.condition = [
              {
                colName: fieldInfo.valueCol,
                value: srvVal,
                ruleType: "in",
              },
            ];
          }
        }
      }
      if (loader) {
        if (loader.conditions) {
          this.buildConditions(loader).forEach((c) =>
            queryJson.condition.push(c)
          );
          queryJson.condition = this.pruneConditions(queryJson.condition);
        } else if (loader.relation_conditions) {
          queryJson.relation_condition = this.buildRelationCondition(loader);
        }
      }
      let app = this.$srvApp && this.field.evalFormExpr(this.$srvApp, "");
      if (this.$srvApp && !app) {
        // 使用了动态srvApp，但是eval结果出错，取消查询
        cb([]);
        return;
      }
      return this.selectList(queryJson, app).then((response) => {
        if (
          response &&
          response.data &&
          response.data.data &&
          response.data.data.length > 0
        ) {
          if (this.isFks) {
            this.multiSelected = response.data.data;
            return;
          }
          let item = response.data.data[0];
          this.field.model = item;
          if (isObject(this.field.model)) {
            // 对象 fk值 设置 默认selected 显示值
            // console.log("setSrvVal", item);
            let fieldInfo = this.field.info;
            let loader = this.dispLoaderV2;
            if (this.subType === "select") {
              this.selected = this.field.model[fieldInfo.valueCol];
            } else {
              this.selected =
                loader.showAsPair !== true
                  ? (this.field.model[fieldInfo.dispCol] || this.field.model[fieldInfo.valueCol])
                  : `${this.field.model[fieldInfo.dispCol]}/${this.field.model[fieldInfo.valueCol]
                  }`;
            }
            // this.selected = (loader.showAsPair !== false ? `${this.field.model[ fieldInfo.dispCol ]}/${this.field.model[ fieldInfo.valueCol ]}` : this.field.model[ fieldInfo.dispCol ])
          }

          this.emitFieldValueChange();
        }
      });
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

    /**
     * on row selected in finder's search popup
     * @param row
     * @param event
     */
    onRowSelected(row, event) {
      let item = row;
      this.field.model = item;

      this.$emit("blur", this.field);
      this.emitFieldValueChange();
      let fieldInfo = this.field.info;
      let loader = this.dispLoaderV2;
      this.selected =
        loader.showAsPair !== true
          ? (item[fieldInfo.dispCol] || item[fieldInfo.valueCol])
          : `${item[fieldInfo.dispCol]}/${item[fieldInfo.valueCol]}`;
      this.popup = false;
    },

    onPopupClicked() {
      if (!this.field.info.editable) {
        return;
      }

      this.popup = true;

      // hide suggestions
      this.$refs.autocomplete.activated = false;
    },
  },

  created: function () {
    // 获取数据，
    if (this.objInfo?.a_save_b_obj_col) {
      const formModel = this.field?.form?.srvValFormModel?.();
      if (formModel && formModel[this.objInfo?.a_save_b_obj_col]) {
        try {
          let values = JSON.parse(formModel[this.objInfo?.a_save_b_obj_col]);
          if (Array.isArray(values) && values.length) {
            this.$emit("more-info", values);
            return;
          }
        } catch (error) {
          // console.error(error);
        }
      }
    }
  },

  mounted: function () {
    let vm = this;
    if (this.$refs.autocomplete) {
      this.$refs.autocomplete.$refs.input.$on("clear", function () {
        vm.selected = null;
        vm.handleSelect(null);
        setTimeout((_) => vm.$refs.autocomplete.getData(""), 500);
      });
    }

    // if (this.subType === "select") {
    // this.getOptions("");
    // }
    if (this.field.model) {
      // console.log("modal--2", this.field.model)
      let value = this.field.model[this.field.info.valueCol];
      if (value == undefined || value == null) {
        this.setSrvVal(this.field.model);
      } else {
        let fieldInfo = this.field.info;
        let loader = this.dispLoaderV2;
        this.options = [this.field.model];
        if (this.subType === "select") {
          this.selected = this.field.model[fieldInfo.valueCol];
        } else {
          this.selected =
            loader.showAsPair !== false
              ? (this.field.model[fieldInfo.dispCol] || this.field.model[fieldInfo.valueCol])
              : `${this.field.model[fieldInfo.dispCol]}/${this.field.model[fieldInfo.valueCol]
              }`;
        }
      }
      // this.getOptions(true);
    }

    if (
      this.field.info &&
      this.field.info.srvCol &&
      this.field.info.srvCol.init_expr === "$firstRowData"
    ) {
      // 默认选中第一行 需要加载数据
      this.getOptions(true);
    }
    // if (this.subType === "select") {

    // }

    // if(this.field.type === "User"){
    //   this.appNo = "sso"
    // }
  },
};
</script>
<style lang="scss">
.svg-icon {
  svg {
    width: 30px;
    height: 30px;
  }
}

.el-autocomplete-suggestion li {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.div-el-input {
  position: relative;
  font-size: 14px;
  display: inline-block;
  -webkit-appearance: none;
  background-color: #fff;
  background-image: none;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  color: #606266;
  display: inline-block;
  font-size: inherit;
  height: 40px;
  line-height: 40px;
  width: 100%;
  outline: 0;
  padding: 0 15px;
  -webkit-transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
  transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
  cursor: pointer;

  .placeholder {
    color: #c8cbd2;
  }

  [class*="el-icon-"] {
    position: absolute;
    right: 10px;
    line-height: 40px;
    color: #c0c4cc;
    font-size: 14px;
  }

  .close-icon {
    display: none;
    right: 35px;
  }

  &:hover {
    .close-icon {
      display: inline-block;
      color: #666;
    }
  }
}
</style>