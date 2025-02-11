import { FieldInfo } from "../model/FieldInfo";
import { Field } from "../model/Field";
import Vue from "vue";
import { ActionInfo } from "../model/ActionInfo";
import dayjs from "dayjs";
import cloneDeep from "lodash/cloneDeep";
import debounce from "lodash/debounce";
export default {
  methods: {
    handleRedundantOnFormModelChange: function (
      newVal,
      oldVal,
      fields,
      formModelFunc
    ) {
      let self = this;
      if (!this.isLoaded()) {
        return;
      }

      for (let fieldName in fields) {
        let field = fields[fieldName];
        if (!field || !field.info) {
          continue;
        }

        let fieldInfo = field.info;

        // 处理上游字段变化
        if (fieldInfo.upstream) {
          let upstreamField = fields[fieldInfo.upstream.field];
          let upstreamFieldValue = upstreamField.model;

          if (
            upstreamFieldValue &&
            upstreamFieldValue != fieldInfo.upstream.fieldValue
          ) {
            fieldInfo.upstream.fieldValue = upstreamFieldValue;

            // if value changed,  reset curr field,
            let refCol = fieldInfo.upstream.refCol;
            /// field.hasOwnProperty(refCol)  is to rule out downstream field not a finder
            if (
              field.model &&
              field.hasOwnProperty(refCol) &&
              field.model[refCol] != upstreamField.getSrvVal()
            ) {
              field.reset();
            }
          }
        }

        // 处理Js计算冗余字段
        let diffFields = new Set();
        for (let fieldName in newVal) {
          if (newVal[fieldName] != oldVal[fieldName]) {
            diffFields.add(fieldName);
          }
        }

        if (fieldInfo.redundant) {
          if (!(diffFields.size == 1 && diffFields.has(fieldName))) {
            let vm = this;
            // 如果计算函数中发请求了，再判断是否匹配calc_trigger_col来判断是否需要进行计算，否则直接计算,避免之前没配置calc_trigger_col的表内计算不会触发
            if(fieldInfo.redundant?.func?.indexOf("$http.") > -1){
              if (Array.isArray(fieldInfo.srvCol?.calc_trigger_col) && fieldInfo.srvCol?.calc_trigger_col.length) {
                // 触发计算的字段值有变化才进行计算
                let needUpdate = fieldInfo.srvCol?.calc_trigger_col.some(col => newVal[col] != oldVal[col]);
                if (needUpdate) {
                  this.handleRedundantViaJs(field, formModelFunc, vm);
                }
              }
            }else{
              this.handleRedundantViaJs(field, formModelFunc, vm);
            }
          }
        }
        if (fieldInfo.mainSubRedundant) {
          // 主子表冗余
          let mainData = self.parentAddMainFormDatas;
          let subMainRedundant = fieldInfo.mainSubRedundant;

          if (mainData && subMainRedundant.trigger == "always") {
            if (mainData.hasOwnProperty(subMainRedundant.quoteCol)) {
              let ret = mainData[subMainRedundant.quoteCol];
              field.setSrvVal(ret);
            }
            console.log(
              fieldName,
              ":",
              mainData,
              subMainRedundant.quoteCol,
              mainData.hasOwnProperty(subMainRedundant.quoteCol)
            );
          }
        }
      }
    },

    /**
     *
     * @param field
     * @param formModelFunc
     * @param vm used in func js
     */
    handleRedundantViaJs: debounce(function (field, formModelFunc, vm) {
      let fieldInfo = field.info;
      if (!fieldInfo.redundant || !fieldInfo.redundant.func) {
        return;
      }

      let func = fieldInfo.redundant.func;

      if (func) {
        let moment = dayjs;
        let row = formModelFunc();
        // console.log('handleRedundantViaJs row',row,func)
        let ret = eval("var zz=" + func + "(row, vm, field); zz");
        const calc_rule = fieldInfo.redundant.calc_rule;
        if (calc_rule?.type === "求和" && calc_rule?.constraint_name) {
          if (!row?._children?.[calc_rule.constraint_name] || !row?._children?.[calc_rule.constraint_name]?.length) {
            // 没有子表或者子表数量为0的时候不进行计算
            return;
          }
        }
        // console.log('计算结果',fieldInfo.label,ret)
        // 有返回calc_rule的话 使用calc_rule的逻辑来计算
        // const calc_rule = fieldInfo.redundant.calc_rule
        // if (
        //   calc_rule?.type === "求和" &&
        //   calc_rule?.constraint_name &&
        //   calc_rule?.child_col
        // ) {
        //   if (row?._children && row._children[calc_rule.constraint_name]) {
        //     ret = row._children[calc_rule.constraint_name].reduce(
        //       (acc, cur) => {
        //         const val = Number(cur[calc_rule.child_col]);
        //         if (!isNaN(val)) {
        //           acc = (acc * 1000 + val * 1000) / 1000;
        //         }
        //         return acc;
        //       },
        //       0
        //     );
        //   } else {
        //     ret = 0;
        //   }
        // }

        if (ret === "Invalid date") {
          return;
        }

        if (typeof ret === "function") {
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
        if (update && field.info?.subType !== 'autocomplete' && ret !== undefined) {
          // undefined说明没有返回值 不要更新
          if (typeof ret === "object" && ret instanceof Promise) {
            ret.then((res) => {
              field.setSrvVal(res);
            })
          } else {
            if (field.getSrvVal() !== ret) {
              field.setSrvVal(ret);
            }
          }
        }
      }
    },200),

    buildDependentFields: function (fields) {
      // construct redundant fields relations via fk
      for (let fieldName in fields) {
        let field = fields[fieldName];

        if (
          field &&
          field.info &&
          field.info.dispLoader &&
          Array.isArray(field.info.dispLoader.conditions) &&
          field.info.dispLoader.conditions.length > 0
        ) {
          const hascondDependField = field.info.dispLoader.conditions.find(
            (item) =>
              item.value &&
              typeof item.value === "string" &&
              item.value.indexOf("data") !== -1
          );

          if (hascondDependField) {
            for (let fieldName2 in fields) {
              let field2 = fields[fieldName2];
              if (
                field2 &&
                field2.info &&
                field2.info.name &&
                field.info.dispLoader.conditions.find(
                  (item) =>
                    item.value && item.value.indexOf(field2.info.name) > -1
                )
              ) {
                field2.condDependentFields =
                  field2.condDependentFields || new Set();
                field2.condDependentFields.add(field.info.name);
              }
            }
          }
        }

        if (
          field &&
          field.info &&
          field.info.redundant &&
          field.info.redundant.dependField
        ) {
          let dependField = fields[field.info.redundant.dependField];
          if (dependField) {
            dependField.dependentFields =
              dependField.dependentFields || new Set();
            dependField.dependentFields.add(field.info.name);
          }
        }
      }
    },

    /**
     * 处理通过fk引用的冗余字段
     * @param field
     * @param fields
     * @param {true|false} onHandle - autocomplete字段手动改变下拉选项
     */
    handleFieldFkRedundant: function (field, fields, onHandle = false) {
      if (
        field.model === null &&
        field.condDependentFields &&
        field.condDependentFields.size > 0
      ) {
        field.condDependentFields.forEach((dependentFieldName) => {
          let dependentField = fields[dependentFieldName];
          dependentField.reset();
        });
      }

      if (field.dependentFields) {
        field.dependentFields.forEach((dependentFieldName, index) => {
          let dependentField = fields[dependentFieldName];

          let sync = true;
          if (dependentField.info.redundant.trigger === "isnull") {
            // 触发字段数据发生变化，其它字段为null的时候冗余
            sync = dependentField.isEmpty();
          }

          if (dependentField.info.redundant.trigger === "unchange") {
            //  触发字段数据发生变化，其它字段没有被手动修改的时候，冗余，如果存在手动修改，则不在冗余
            if (
              dependentField.model === null ||
              (field.modelOld &&
                dependentField.getSrvVal &&
                dependentField.getSrvVal() ===
                field.modelOld[dependentField.info.redundant.refedCol])
            ) {
              sync = true;
            } else {
              sync = false;
            }
          }

          // if(field.model===null&&field.modelOld&&dependentField.getSrvVal&&dependentField.getSrvVal()===field.modelOld[dependentField.info.redundant.refedCol]){
          //   dependentField.reset();
          //   if(index === field.dependentFields.length-1){
          //   field.modelOld = null
          //   }
          // }

          if (sync) {
            if (dependentField.info.subType === 'autocomplete' && dependentField.getSrvVal() && onHandle !== true) {
              // 表单自动冗余操作，如果字段是autocomplete且本身有值，不进行冗余
              return
            }
            if (
              field.model &&
              (field.model[dependentField.info.redundant.refedCol] ||
                field.model[dependentField.info.redundant.refedCol] === 0)
            ) {
              dependentField.setSrvVal(
                field.model[dependentField.info.redundant.refedCol]
              );
              field.modelOld = cloneDeep(field.model);
            } else {
              dependentField.reset();
            }
          }
        });
      }

      // for user field xxx, try to set the _xxx_disp field
      let dispFieldName = `_${field.info.name}_disp`;
      if (field.info.type === "User" && fields[dispFieldName]) {
        if (field.model) {
          fields[dispFieldName].setSrvVal(field.model.user_disp);
        }
      }

      // else{
      //   fields[dispFieldName].setSrvVal(field.model.user_disp)
      // }
    },
  },
};
