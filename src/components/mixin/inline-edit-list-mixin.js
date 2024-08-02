import dayjs from "dayjs";
import { FieldInfo } from "../model/FieldInfo";
import { Field } from "../model/Field";

export default {
  data() {
    return {
      onInlineEditing: false,
      cfgJson: null,
      updateV2: null,
      inlineEditCols: null,
      newGridData: [],
      allFields: {},
      oldGridData: [],
    };
  },
  mounted() {
    if (this.showBatchEditButton && this.listType === "updatechildlist") {
      this.onInlineEditing = true;
    }
  },
  computed: {
    showBatchEditButton() {
      return (
        this.inlineEditCols &&
        typeof this.inlineEditCols === "object" &&
        Object.keys(this.inlineEditCols).length
      );
    },
    setPageSize() {
      let pageSize = this.pageSize;
      if (this.cfgJson?.list_paging_json) {
        if (
          this.listType === "detaillist" &&
          this.childForeignkey?.foreign_key_type === "主子表"
        ) {
          pageSize = this.cfgJson?.list_paging_json?.list_paging_sublist_rownum;
        } else {
          pageSize = this.cfgJson?.list_paging_json?.list_paging_list_rownum;
        }
      }
      return pageSize;
    },
    setShowPagination() {
      let showPagination = this.showPagination;
      if (this.cfgJson?.list_paging_json) {
        if (
          this.listType === "detaillist" &&
          this.childForeignkey?.foreign_key_type === "主子表"
        ) {
          showPagination =
            this.cfgJson?.list_paging_json?.list_paging_sublist_enable !== "否";
        } else {
          showPagination =
            this.cfgJson?.list_paging_json?.list_paging_list_enable !== "否";
        }
      }
      return showPagination;
    },
    formRules: function () {
      let rulesMap = {};
      if (this.allFields && Object.keys(this.allFields).length > 0) {
        Object.keys(this.allFields).forEach((key) => {
          let field = this.allFields[key];
          if (field.info.rules) {
            rulesMap[field.info.name] = field.info.rules;
          }
        });
      }

      return rulesMap;
    },
    canInlineEdit() {
      return (
        this.cfgJson?.list_edit_srv &&
        this.cfgJson.options?.includes("列表列编辑")
      );
    },
    submitButton() {
      if (
        Array.isArray(this.updateV2.formButton) &&
        this.updateV2.formButton.length > 0
      ) {
        return this.updateV2.formButton.find(
          (item) => item.button_type === "edit"
        );
      }
    },
  },
  methods: {
    /**
     *
     * @param rule
     * @param field
     * @returns {boolean} true for validate ok,
     */
    evalFieldRule(rule, field, fieldName, srvValFormModel, fieldSrvVal) {
      if (rule.name === "isValidValue") {
        if (field.finderSelected && !fieldSrvVal) {
          return {
            value: "false",
            type: "confirm",
          };
        } else {
          return {
            value: "true",
            type: "confirm",
          };
        }
      }
      if (rule.hasOwnProperty("pattern")) {
        let text = fieldSrvVal;
        if (!text) {
          return true;
        }
        var regex = RegExp(rule.pattern, "g");
        let test = regex.test(text);
        return test;
      } else if (rule.hasOwnProperty("required")) {
        // console.log("eval Field Rule",fieldSrvVal)
        return fieldSrvVal !== null && fieldSrvVal !== "";
      } else if (rule.hasOwnProperty("js_validate")) {
        if (this.allFields[fieldName].evalXIf()) {
          //如果显示当前字段
          var data = srvValFormModel;
          data[fieldName] = fieldSrvVal;
          let result = null;
          if (rule.js_validate) {
            let js_validate = rule.js_validate;
            result = eval("(" + js_validate + ")(data)");
            if (typeof result === "object") {
              if (
                result.hasOwnProperty("type") &&
                result.hasOwnProperty("value")
              ) {
                if (result.type === "validate") {
                  //警告 校验不通过将不能提交表单
                  if (
                    typeof result.value === "string" &&
                    result.value !== "true"
                  ) {
                    rule.message = result.value;
                    return false;
                  } else if (result.value === true || result.value === "true") {
                    return true;
                  }
                } else if (result.type === "confirm") {
                  //提示 不影响表单提交
                  // TODO 增加提示文字
                  if (
                    typeof result.value === "string" &&
                    result.value !== "true"
                  ) {
                    rule.message = result.value;
                  }
                  return result;
                }
              }
            } else {
              // 按旧版本validate特性规则处理
              if (result === true) {
                return result;
              } else if (typeof result === "string") {
                rule.message = result;
                return false;
              }
            }
          } else {
            return true;
          }
        }
      } else if (rule.hasOwnProperty("max")) {
        if (field.info.isNumeric()) {
          let number = Number.parseFloat(fieldSrvVal);
          return number <= rule.max;
        } else {
          let text = fieldSrvVal + "";
          return !text || text.length <= rule.max;
        }
      } else if (rule.hasOwnProperty("min")) {
        if (field.info.isNumeric()) {
          let number = Number.parseFloat(fieldSrvVal);
          return number >= rule.min;
        } else {
          let text = fieldSrvVal + "";
          return !text || text.length >= rule.min;
        }
      } else {
        // TODO: handle min
        return true;
      }
    },
    handleValidation(fieldName, row, rowIndex, newValue) {
      // 字段校验
      let fieldRules = this.formRules;
      let isValid = true;
      if (
        Array.isArray(fieldRules[fieldName]) &&
        fieldRules[fieldName].length > 0
      ) {
        fieldRules[fieldName].forEach((rule) => {
          const field = this.allFields[fieldName];
          const state = this.evalFieldRule(
            rule,
            field,
            fieldName,
            row,
            newValue
          );
          if (state == false) {
            isValid = false;
            console.log("put Validate Error else:", rule.name, rule.message);
            this.$message.error(rule.message);
          }
        });
        console.log(fieldRules[fieldName]);
      }
      return isValid;
      // handle form level validators
    },
    getButtonName(item) {
      let res = item.button_name;
      if (this.onInlineEditing === true && item.button_type === "batchupdate") {
        res = "保存";
      }
      return res;
    },
    async saveData() {
      const req = [];
      if (
        Array.isArray(this.oldGridData) &&
        this.oldGridData.length > 0 &&
        this.cfgJson?.list_edit_srv
      ) {
        this.oldGridData.forEach((item, index) => {
          const obj = {};
          const newItem = this.gridData[index];
          Object.keys(item).forEach((key) => {
            if (item[key] !== newItem[key]) {
              obj[key] = newItem[key];
            }
          });
          if (Object.keys(obj).length > 0) {
            req.push({
              serviceName: this.cfgJson.list_edit_srv,
              condition: [{ colName: "id", ruleType: "eq", value: item.id }],
              data: [obj],
            });
          }
        });
        // this.gridData = this.gridData.map((item) => {
        //   Object.keys(item).forEach((key) => {
        //     if (item[key] !== null && typeof item[key] === "object") {
        //       item[key] = item[key]["newValue"];
        //     }
        //   });
        //   return item;
        // });
      }
      if (req.length > 0 && this.submitButton?.application) {
        const url = this.getServiceUrl(
          "operate",
          this.submitButton.service_name
        );
        // const url = `/${this.submitButton.application}/operate/${this.submitButton.service_name}`;
        const res = await this.$http.post(url, req);
        if (res?.data?.state === "SUCCESS") {
          this.$message({
            message: res.data.resultMessage || "提交成功！",
            type: "success",
          });
        }
        this.loadTableData();
      }
    },
    handleRedundantOnInlineFieldChange(column, rowData, vm) {
      let srv_cols = this.updateV2?.srv_cols;
      let fieldInfo = null;
      if (Array.isArray(srv_cols) && srv_cols.length > 0) {
        fieldInfo = srv_cols.find((item) => column && item.columns === column);
      }
      if (!fieldInfo?.redundant || !fieldInfo?.redundant?.func) {
        return false;
      }

      let func = fieldInfo.redundant.func;

      if (func) {
        let row = rowData;
        let moment = dayjs;
        let ret = eval("var zz=" + func + "(row, vm); zz");
        console.log("evalFun:", ret, column, fieldInfo, rowData);
        if (ret === "Invalid date") {
          return;
        }

        let update = false;
        if (fieldInfo.redundant.trigger == "isnull" && field.isEmpty()) {
          update = true;
        } else if (
          !fieldInfo.redundant.trigger ||
          fieldInfo.redundant.trigger == "always"
        ) {
          update = true;
        }

        if (update) {
          // console.log("计算字段",row,field.info.label,ret,field,func)
          return ret;
        }
      }
    },
    onInlineChange(e, rowIndex) {
      // 校验
      let isValid = true;
      this.oldGridData = this.gridData.map((item, index) => {
        let obj = null;
        if (this.oldGridData[index]) {
          obj = this.oldGridData[index];
        } else {
          obj = {};
        }
        // for (const key in item) {
        //   if (
        //     (key && key.indexOf("_") !== 0) ||
        //     ["_guid", "_dirtyFlags"].includes(key)
        //   ) {
        //     obj[key] = undefined;
        //   }
        // }
        if (
          rowIndex === index &&
          (e.newValue !== e.oldValue || e.isChange === true)
        ) {
          obj[e.column] = e.originValue;
        }
        return obj;
      });

      this.gridData = this.gridData.map((item, index) => {
        if (
          rowIndex === index &&
          (e.newValue !== e.oldValue || e.isChange === true)
        ) {
          let result = true;
          if (e.isChange === true) {
            // if (e.oldValue !== undefined || e.isChange===true) {
            // 不是刚添加的数据 手动修改触发
            result = this.handleValidation(e.column, item, index, e.newValue);
          }
          if (result !== false) {
            item[e.column] = e.newValue;
            if ("originValue" in e) {
              this.oldGridData[index][e.column] = e.originValue;
            }
            // this.oldGridData[index][e.column] = e.oldValue
            this.$set(item, e.column, e.newValue);
            if (!item._dirtyFlags || item._dirtyFlags === "pristine") {
              this.$set(item, "_dirtyFlags", "update");
            }
          } else {
            isValid = false;
            this.$refs?.[`inlineEditor${e.column}`][index]?.showValid({
              result: false,
            });
          }
        }
        return item;
      });

      // this.newGridData = this.gridData.map((item, index) => {
      //   let obj = {};
      //   for (const key in item) {
      //     if (
      //       (key && key.indexOf("_") !== 0) ||
      //       ["_guid", "_dirtyFlags"].includes(key)
      //     ) {
      //       obj[key] = item[key];
      //     }
      //   }
      //   if (rowIndex === index && (e.newValue !== e.oldValue||e.isChange===true)) {
      //     let result = true;
      //     if (e.isChange===true) {
      //     // if (e.oldValue !== undefined || e.isChange===true) {
      //       // 不是刚添加的数据 手动修改触发
      //       result = this.handleValidation(e.column, item, index, e.newValue);
      //     }
      //     if (result !== false) {
      //       obj[e.column] = { newValue: e.newValue, oldValue: e.oldValue };
      //       item[e.column] = e.newValue;
      //       this.$set(item, e.column, e.newValue);
      //     } else {
      //       isValid = false
      //       // item[e.column] = e.oldValue;
      //       // obj[e.column] = { newValue: e.oldValue, oldValue:undefined };
      //       // this.$set(item, e.column,undefined);
      //       // let value = null;
      //       // let result = this.handleValidation(
      //       //   e.column,
      //       //   item,
      //       //   index,
      //       //   e.oldValue
      //       // );
      //       // if (result !== false) {
      //       //   value = e.oldValue;
      //       //   this.$set(item, e.column, value);
      //       // } else {
      //       //   item[e.column] = undefined;
      //       //   this.$set(item, e.column, undefined);
      //       // }
      //       this.$refs?.[`inlineEditor${e.column}`][index]?.showValid({
      //         result: false,
      //       });
      //     }
      //   }
      //   return obj;
      // });
      if (isValid === false) {
        return;
      }
      // 处理 计算
      for (let index = 0; index < this.gridData.length; index++) {
        const obj = JSON.parse(JSON.stringify(this.gridData[index]));
        let item = this.gridData[index];

        const srv_cols = this.updateV2?.srv_cols;

        if (Array.isArray(srv_cols) && srv_cols.length > 0) {
          srv_cols.forEach((col) => {
            const key = col?.columns;
            if (key && key.indexOf("_") !== 0) {
              item[key] =
                this.handleRedundantOnInlineFieldChange(key, item, this) ||
                item[key];
              if (item[key] !== obj[key]) {
                this.$set(item, key, item[key]);

                // this.$set(this.newGridData, index, obj);
              }
              // if (item[key] !== obj[key]?.newValue) {
              //   obj[key] = {
              //     newValue: item[key],
              //     oldValue: obj[key]?.oldValue,
              //   };
              //   this.$set(item, key, item[key]);
              //   this.$set( this.newGridData, index, obj);
              // }
            }
          });
        }
      }
      // for (let index = 0; index < this.newGridData.length; index++) {
      //   const obj = JSON.parse(JSON.stringify(this.newGridData[index]));
      //   let item = this.gridData[index]
      //   for (const key in obj) {
      //     if (
      //       (key && key.indexOf("_") !== 0) ||
      //       ["_guid", "_dirtyFlags"].includes(key)
      //     ) {
      //       item[key] = obj[key]?.newValue;
      //     }
      //   }
      //   const srv_cols = this.updateV2?.srv_cols;
      //   if (Array.isArray(srv_cols) && srv_cols.length > 0) {
      //     srv_cols.forEach((col) => {
      //       const key = col?.columns;
      //       if (key && key.indexOf("_") !== 0) {
      //         item[key] = this.handleRedundantOnInlineFieldChange(key, item, this) || item[key];
      //         if (item[key] !== obj[key]?.newValue) {
      //           obj[key] = {
      //             newValue: item[key],
      //             oldValue: obj[key]?.oldValue,
      //           };
      //           this.$set(item, key, item[key]);
      //           this.$set( this.newGridData, index, obj);
      //         }
      //       }
      //     });
      //   }
      // }
      // this.newGridData = this.gridData.map((item, index) => {
      //   let obj = {
      //     ...JSON.parse(JSON.stringify(this.newGridData[index]))
      //   };
      //   // for (const key in item) {
      //   //   if (
      //   //     (key && key.indexOf("_") !== 0) ||
      //   //     ["_guid", "_dirtyFlags"].includes(key)
      //   //   ) {
      //   //     obj[key] = item[key];
      //   //   }
      //   // }
      //   const srv_cols = this.updateV2?.srv_cols;
      //   if (Array.isArray(srv_cols) && srv_cols.length > 0) {
      //     srv_cols.forEach((col) => {
      //       const key = col?.columns;
      //       if (key && key.indexOf("_") !== 0) {
      //         item[key] = this.handleRedundantOnInlineFieldChange(key, item, this) || item[key];
      //         if (item[key] !== obj[key]?.newValue) {
      //           obj[key] = {
      //             newValue: item[key],
      //             oldValue: obj[key]?.oldValue,
      //           };
      //           // this.$set(item, key, item[key]);
      //         }
      //       }
      //     });
      //   }
      //   return obj;
      // });

      // this.gridData = this.newGridData.map((item, index) => {
      //   const obj = { };
      //   // const obj = { ...this.gridData[index] };
      //   for (const key in item) {
      //     // if (key && key.indexOf("_") !== 0) {
      //     obj[key] = item[key] || null;
      //     if (
      //       item[key] &&
      //       typeof item[key] === "object" &&
      //       item[key]["newValue"]
      //     ) {
      //       obj[key] = item[key]["newValue"];
      //     }
      //     // }
      //   }
      //   return obj;
      // });
    },
    getColumnMinWidth(item) {
      if (
        item.column &&
        this.onInlineEditing &&
        this.inlineEditCols &&
        this.inlineEditCols[item.column]
      ) {
        const minWidth = item.col_type === "Integer" ? 220 : 120;
        return item.list_min_width || minWidth;
      }
    },
    onBatchUpdateClick() {
      if (this.canInlineEdit) {
        if (this.onInlineEditing === false) {
          this.onInlineEditing = true;
        } else {
          this.saveData().then(() => {
            this.onInlineEditing = false;
          });
        }
      }
    },
    async getColV2() {
      const response = await this.loadColsV2(
        this.cfgJson?.list_edit_srv,
        "update",
        null,
        this.mainService
      );
      const respData = response.body.data;
      this.updateV2 = respData;
      if (this.cfgJson?.list_edit_cols) {
        let inlineEditCols = respData.srv_cols.filter(
          (item) =>
            item.columns &&
            this.cfgJson?.list_edit_cols?.indexOf(item.columns) > -1
        );
        console.log("inlineEditCols:", inlineEditCols);
        if (Array.isArray(inlineEditCols)) {
          this.inlineEditCols = inlineEditCols.reduce((res, cur) => {
            res[cur.columns] = cur;
            return res;
          }, {});
        }
      }
      let listData = respData.srv_cols;

      for (var i = 0; i < listData.length; i++) {
        let srvCol = listData[i];
        let fi = new FieldInfo(srvCol, this.formType);
        let f = new Field(fi, this);
        f.vif = srvCol.in_update !== 0;
        // hack
        if (fi.name == "id") {
          fi.visible = false;
        }
        if (fi.editor == "multiselect") {
          f.model = [];
        }
        this.$set(this.allFields, fi.name, f);
      }
    },
    handleCfgJson(e) {
      // console.log('行内编辑配置',e);
      if (e && typeof e === "string") {
        this.cfgJson = JSON.parse(e);
        if (
          this.cfgJson?.list_type === "卡片列表" &&
          this.cfgJson?.card_json?.parts_json &&
          this.childForeignkey
        ) {
          // 子表 配置了卡片 直接展示为卡片
          this.listStyle = "card";
        }
        if (
          this.cfgJson?.list_edit_srv &&
          this.cfgJson.options?.includes("列表列编辑")
        ) {
          this.getColV2();
          if (this.listType === "addchildlist") {
            // 添加表单 子表 默认可编辑
            this.onInlineEditing = true;
          }
        }
      }
    },
    changeInlineEditState() {
      this.onInlineEditing = !this.onInlineEditing;
    },
    isInlineEditColumn(column) {
      return (
        column &&
        this.cfgJson?.list_edit_cols &&
        typeof this.cfgJson?.list_edit_cols === "string" &&
        this.cfgJson?.list_edit_cols.indexOf(column) > -1
      );
    },
  },
};
