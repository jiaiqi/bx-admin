/* */
<template>
  <div>
    <div v-if="subType !== 'select'">
      <a
        v-if="field.info.linkUrlFunc && !field.info.editable && !isFks"
        v-show="field.getSrvVal()"
        style="white-space: normal; color: dodgerblue; cursor: pointer"
        @click="onLinkClicked()"
      >
        {{ field.getDispVal4Read() }}
      </a>
      <div
        class="div-el-input"
        v-else-if="
          formType === 'add' &&
          optionListV2 &&
          optionListV2.allow_input === '自行输入' &&
          addService
        "
        @click="activePopup = 'add'"
      >
        <span v-if="field.getDispVal()">{{ field.getDispVal() }}</span>
        <i class="el-icon-edit"></i>
      </div>
      <location-picker
        v-else-if="isLocation"
        :field="field"
        :disabled="!field.info.editable"
        :mainformDatas="mainformDatas"
        :defaultValues="defaultValues"
        :current-selected="field.model"
        @on-selected="onPickerSelected"
      ></location-picker>
      <table-picker
        v-bind="$props"
        :selectedGridData="multiSelected"
        :finder-selected="field.model"
        :defaultValues="defaultValues"
        :mainformDatas="mainformDatas"
        :disabled="!field.info.editable"
        @on-selected="onPickerSelected"
        v-else-if="isFks"
      ></table-picker>
      <div v-else style="display: flex; align-items: center">
        <el-autocomplete
          ref="autocomplete"
          :prefix-icon="
            (dispLoaderV2 &&
              dispLoaderV2.imgType === 'eicon' &&
              field.getSrvVal()) ||
            ''
          "
          :trigger-on-focus="showAutocomplete"
          :fetch-suggestions="loadOptions"
          :value-key="field.info.dispCol"
          :disabled="!field.info.editable"
          v-model="selected"
          :placeholder="field.info.placeholder"
          clearable
          @select="handleSelect"
          @blur="handleBlur"
          style="min-width: 220px; flex: 1"
          class="finder-autocomplete"
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
              v-html="item.imgUrlFunc(item)"
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
          icon="el-icon-plus"
          style="margin-left: 5px; height: 38px"
          size="mini"
          v-if="
            addSrvCfg &&
            addSrvCfg.permission &&
            addSrvCfg.srv &&
            optionListV2 &&
            optionListV2.allow_input === '编辑选择'
          "
          @click="activePopup = 'add'"
        >
        </el-button>
      </div>
      <el-dialog
        :title="submit2Db ? '新增选项' : '编辑'"
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
          :defaultValues="submit2Db?null:field.model"
          @submitted2mem="submitted2mem"
          @executor-complete="onExecutorComplete"
          @form-loaded="onAddFormLoaded"
          v-if="activePopup == 'add'"
        >
        </add>
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
        :disabled="!field.info.editable"
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
import tablePicker from "../common/table-picker.vue";
import locationPicker from "./location-picker.vue";
import includes from "lodash/includes";
import remove from "lodash/remove";
import cloneDeepWith from "lodash/cloneDeepWith";
import cloneDeep from "lodash/cloneDeep";
import isEmpty from "lodash/isEmpty";
import isObject from "lodash/isObject";
export default {
  components: {
    List: () => import("../common/list.vue"),
    tablePicker,
    locationPicker,
    Add: () => import("../common/add.vue"),
    //  () => import("../common/table-picker.vue")
  },
  model: {
    prop: "finderSelected",
    event: "change",
  },
  props: {
    field: Object,
    defaultConditions: Array,
    finderSelected: [String, Object],
    defaultValues: Object,
    childForeignkey: Object,
    mainformDatas: Object,
    formModel: Object,
  },
  data() {
    return {
      selected: null,
      popup: false,
      activePopup: "",
      appNo: null,
      options: [],
      childForeign: null,
      multiSelected: [],
      hasInit: false, //已经设置过初始值
    };
  },
  watch: {
    optionListV2: {
      deep: true,
      immediate: true,
      handler(newVal, oldVal) {
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
        console.log("field.model", this.field.info.name, newval);
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
      if (this.optionListV2?.allow_input === "自行输入") {
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
        // return this.field?.info?.dispLoader;
      }
    },
    optionListV2() {
      let result = null;
      if (this.field?.info?.srvCol?.option_list_v3?.length) {
        // 如果有v3 则使用v3
        const option_list_v3 = this.field?.info?.srvCol?.option_list_v3;
        result = option_list_v3.find((item) => {
          if (item.conds?.length) {
            // 条件外键
            return item.conds.every(
              (cond) => this.formModel[cond.case_col] === cond.case_val
            );
          } else {
            return true;
          }
        });
      }else if (this.field?.info?.srvCol?.option_list_v2) {
        result = this.field?.info?.srvCol?.option_list_v2;
      }
      // if (!result) {
      //   result = this.field?.info?.srvCol?.option_list_v2;
      // }
      if(this.field?.info?._upstreamCondition?.colName){
        if(Array.isArray(result?.conditions)){
          result.conditions.push(cloneDeep(this.field.info._upstreamCondition))
        }else if(result){
          result.conditions = [cloneDeep(this.field.info._upstreamCondition)]
        }
      }
      return result;
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
  },
  methods: {
    onAddFormLoaded: function (form) {
      if (form?.actions?.submit) {
        // 去掉提交后跳转事件
        form.actions.submit.nav2Location = null;
      }
    },
    submitted2mem(event) {
      console.log("submitted2mem:", event);
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
      console.log("onExecutorComplete:", event);
      const data = event.data?.response[0]?.response?.effect_data?.[0];
      if (data) {
        this.handleSelect(data);
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
            ? this.options[0][fieldInfo.dispCol]
            : `${this.options[0][fieldInfo.dispCol]}/${
                this.options[0][fieldInfo.valueCol]
              }`;
        this.hasInit = true;
      } else if (this.field.model && this.finderSelected) {
        this.selected = this.finderSelected;
      }
    },
    onPickerSelected(selected) {
      this.field.model = selected;
      this.selected = selected;
    },
    getOptions(queryString) {
      let self = this;
      let fieldInfo = this.field.info;
      let loader = this.dispLoaderV2;
      if(!loader){
        return
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
                    return `${item[fieldInfo.dispCol]}/${
                      item[fieldInfo.valueCol]
                    }`;
                  } else {
                    return item[fieldInfo.dispCol];
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

    popupDefaultConditions() {
      let conditions = this.defaultConditions || [];
      let fieldInfo = this.field.info;
      let loader = this.dispLoaderV2;
      return conditions.concat(this.buildConditions(loader));
    },

    dedupOptions(options) {
      let loader = this.dispLoaderV2;
      if (!loader.dedup) {
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
      if(!loader){
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
                : data[fieldInfo.dispCol];
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

    buildConditions: function (dispLoader) {
      let ret = [];
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
          if (valueExpr) {
            // literal value or js expr
            if (cond.literalValue) {
              condition.value = valueExpr;
            } else {
              condition.value = this.evalExprOrFunc(
                valueExpr,
                this.field.form.srvValFormModel(),
                null
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

    handleSelect(item) {
      console.log("handleSelect", item);
      this.field.model = item;

      let fieldInfo = this.field.info;
      let loader = this.dispLoaderV2;
      if (this.subType == "select") {
        let selectItem = this.options.filter(
          (opt) => opt[fieldInfo.valueCol] == item
        );
        this.field.model = selectItem[0] || "";
        // this.emitFieldValueChange();
      } else {
        if (item === null) {
          this.selected = "";
        } else {
          this.selected =
            loader.showAsPair !== true
              ? item[fieldInfo.dispCol]
              : `${item[fieldInfo.dispCol]}/${item[fieldInfo.valueCol]}`;
        }
      }
      this.emitFieldValueChange();
    },

    emitFieldValueChange() {
      let objCol = null;
      const objInfo = this.optionListV2?.obj_info;
      if (objInfo?.a_save_b_cols && objInfo?.a_save_b_obj_col) {
        // fk字段值改变后，更新其option_list_v3中配置的的a_save_b_obj_col
        const newValue = this.field.model;
        const cols = objInfo?.a_save_b_cols.split(",");
        const obj = {};
        const objStr = "";
        if (cols?.length) {
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
        // 将更新的字段信息保存在_obj_col上，方便在form中获取
        this.$set(this.field, "_obj_col", objCol);
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
        if (srvVal) {
          try {
            json = JSON.parse(srvVal);
          } catch (error) {
            console.log(error);
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
            console.log("setSrvVal", item);
            let fieldInfo = this.field.info;
            let loader = this.dispLoaderV2;
            if (this.subType === "select") {
              this.selected = this.field.model[fieldInfo.valueCol];
            } else {
              this.selected =
                loader.showAsPair !== true
                  ? this.field.model[fieldInfo.dispCol]
                  : `${this.field.model[fieldInfo.dispCol]}/${
                      this.field.model[fieldInfo.valueCol]
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
          ? item[fieldInfo.dispCol]
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

  created: function () {},

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
              ? this.field.model[fieldInfo.dispCol]
              : `${this.field.model[fieldInfo.dispCol]}/${
                  this.field.model[fieldInfo.valueCol]
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
  [class*="el-icon-"] {
    position: absolute;
    right: 10px;
    line-height: 40px;
    color: #c0c4cc;
    font-size: 14px;
  }
}
</style>
