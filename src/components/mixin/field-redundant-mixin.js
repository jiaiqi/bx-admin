import { Field } from "../model/Field";
import dayjs from "dayjs";
import cloneDeep from "lodash/cloneDeep";

/**
 * 字段冗余处理混入组件
 *
 * 提供表单字段冗余计算、依赖关系处理、上下游字段联动等功能。
 * 支持 JavaScript 计算冗余、外键引用冗余、主子表冗余等多种冗余模式。
 *
 * @mixin FieldRedundantMixin
 */
export default {
  methods: {
    /**
     * 处理表单模型变化时的字段冗余逻辑
     *
     * 当表单数据发生变化时，自动处理各种类型的字段冗余：
     * - 上游字段变化处理
     * - JavaScript 计算冗余字段
     * - 主子表冗余字段
     *
     * @param {Object} newVal - 新的表单数据值
     * @param {Object} oldVal - 旧的表单数据值
     * @param {Object} fields - 字段集合对象，key为字段名，value为Field实例
     * @param {Function} formModelFunc - 获取表单模型数据的函数
     * @returns {void}
     *
     * @example
     * // 在表单数据变化时调用
     * this.handleRedundantOnFormModelChange(newFormData, oldFormData, this.fields, () => this.formModel);
     */
    handleRedundantOnFormModelChange(newVal, oldVal, fields, formModelFunc, isChild = false) {
      let self = this;
      // 检查表单是否已加载完成，未加载则直接返回
      if (!this.isLoaded()) {
        return;
      }

      // 遍历所有字段，处理各种类型的冗余逻辑
      for (let fieldName in fields) {
        let field = fields[fieldName];
        // 跳过无效字段或缺少配置信息的字段
        if (!field || !field.info) {
          continue;
        }

        let fieldInfo = field.info;

        // 处理上游字段变化
        if (fieldInfo.upstream) {
          let upstreamField = fields[fieldInfo.upstream.field]; // 获取上游字段实例
          let upstreamFieldValue = upstreamField.model; // 获取上游字段当前值

          // 检查上游字段值是否发生变化
          if (
            upstreamFieldValue &&
            upstreamFieldValue != fieldInfo.upstream.fieldValue
          ) {
            // 更新缓存的上游字段值
            fieldInfo.upstream.fieldValue = upstreamFieldValue;

            // 如果值发生变化，重置当前字段
            let refCol = fieldInfo.upstream.refCol; // 引用列名
            /// field.hasOwnProperty(refCol)  is to rule out downstream field not a finder
            /// field.hasOwnProperty(refCol) 用于排除下游字段不是查找器的情况
            if (
              field.model &&
              field.hasOwnProperty(refCol) &&
              field.model[refCol] != upstreamField.getSrvVal()
            ) {
              field.reset(); // 重置字段值
            }
          }
        }

        // 处理Js计算冗余字段
        let diffFields = new Set(); // 存储发生变化的字段名
        // 找出新旧值之间发生变化的字段
        for (let fieldName in newVal) {
          if (newVal[fieldName] != oldVal[fieldName]) {
            diffFields.add(fieldName);
          }
        }

        // 处理具有冗余配置的字段
        if (fieldInfo.redundant) {
          // 排除仅当前字段自身变化的情况，避免无限循环
          if (
            !(diffFields.size == 1 && diffFields.has(fieldName)) &&
            diffFields.size > 0
          ) {
            let vm = self;
            let calc_trigger_col = fieldInfo?.srvCol.calc_trigger_col; // 计算触发列配置
            // 过滤掉当前字段名，避免自触发
            if (Array.isArray(calc_trigger_col)) {
              calc_trigger_col = calc_trigger_col.filter(
                (col) => col !== fieldName
              );
            }
            // 如果计算函数中发请求了，再判断是否匹配calc_trigger_col来判断是否需要进行计算，否则直接计算,避免之前没配置calc_trigger_col的表内计算不会触发
            // 检查计算函数是否包含HTTP请求
            if (fieldInfo.redundant?.func?.indexOf("$http.") > -1) {
              // 对于包含HTTP请求的计算：
              if (Array.isArray(calc_trigger_col) && calc_trigger_col.length) {
                // 配置了 calc_trigger_col 时，仅在这些列变化时触发
                let needUpdate = calc_trigger_col.some(
                  (col) => newVal[col] != oldVal[col]
                );
                if (needUpdate) {
                  self.handleRedundantViaJs(field, formModelFunc, vm);
                }
              } else {
                // 兼容老数据：未配置 calc_trigger_col 时，回退到 dependField 变化触发
                const dependFieldName = fieldInfo?.redundant?.dependField;
                if (
                  dependFieldName &&
                  newVal[dependFieldName] != oldVal[dependFieldName]
                ) {
                  self.handleRedundantViaJs(field, formModelFunc, vm);
                }
              }
            } else {
              // 对于不包含HTTP请求的计算，直接执行
              self.handleRedundantViaJs(field, formModelFunc, vm);
            }
          } else
            // 处理子表求和
            if (isChild) {
              if (fieldInfo?.redundant?.func) {
                let vm = self;
                self.handleRedundantViaJs(field, formModelFunc, vm);
              }
            }
        }



        // 处理主子表冗余逻辑
        const dependField = fieldInfo?.redundant?.dependField
        const refedCol = fieldInfo?.redundant?.refedCol
        const mainData = self.parentAddMainFormDatas; // 获取主表数据
        if (fieldInfo.mainSubRedundant) {
          // if (dependField&&this.allFields?.[dependField] && refedCol !== fieldInfo.name ) {
          //   // dependField是子表本身的字段并且refedCol不是当前字段 不触发主子表冗余
          //   return 
          // }
          if (this.childForeignkey && this.childForeignkey['referenced_column_name'] && dependField !== this.childForeignkey['referenced_column_name'] && dependField !== this.childForeignkey['column_name']) {
            // dependField 不是主表的编号字段
            continue
          }
          // 主子表冗余
          let subMainRedundant = fieldInfo.mainSubRedundant; // 主子表冗余配置
          // 检查主表数据存在且触发条件为"always"
          if (mainData && subMainRedundant.trigger == "always") {
            // 检查主表数据中是否包含引用列
            if (mainData.hasOwnProperty(subMainRedundant.quoteCol)) {
              let ret = mainData[subMainRedundant.quoteCol]; // 获取引用列的值
              field.setSrvVal(ret); // 设置字段值
            }
          }
        }
      }
    },

    /**
     * 通过 JavaScript 函数处理字段冗余计算
     *
     * 执行字段配置的 JavaScript 计算函数，根据计算结果更新字段值。
     * 支持同步和异步计算，支持多种触发条件（always、isnull）。
     *
     * @param {Field} field - 需要处理冗余的字段实例
     * @param {Function} formModelFunc - 获取表单模型数据的函数
     * @param {Object} vm - Vue 组件实例，用于在计算函数中访问组件方法和数据
     * @returns {void}
     *
     * @example
     * // 处理单个字段的 JS 冗余计算
     * this.handleRedundantViaJs(field, () => this.formModel, this);
     *
     * @example
     * // 字段配置示例
     * field.info.redundant = {
     *   func: "(row, vm, field) => row.price * row.quantity", // 计算函数
     *   trigger: "always", // 触发条件：always | isnull | unchange
     *   calc_rule: { type: "求和", constraint_name: "items" } // 计算规则
     * };
     */
    handleRedundantViaJs: function (field, formModelFunc, vm) {
      let fieldInfo = field.info;
      // 检查字段是否配置了冗余计算函数
      if (!fieldInfo.redundant || !fieldInfo.redundant.func) {
        return;
      }

      let func = fieldInfo.redundant.func; // 获取计算函数字符串

      if (func) {
        let moment = dayjs; // 为计算函数提供日期处理库
        let row = formModelFunc(); // 获取当前表单数据
        // console.log('handleRedundantViaJs row',row,func)
        // 执行计算函数，使用 eval 动态执行字符串形式的函数
        let ret = undefined
        try {
          ret = eval("var zz=" + func + "(row, vm, field); zz");
        } catch (error) {
          console.error("计算函数执行出错:", error);
          console.warn('执行出错的计算函数:', func);
        }

        // 获取计算规则配置
        const calc_rule = fieldInfo.redundant.calc_rule;
        const calcType = calc_rule?.type; // 计算类型（求和、计数等）

        // 处理子表求和、计数类型的特殊逻辑
        if (
          ["求和", "计数"]?.includes(calcType) &&
          calc_rule?.constraint_name
        ) {
          // 子表求和、计数
          // 检查是否存在子表数据
          if (
            !row?._children?.[calc_rule.constraint_name] ||
            !row?._children?.[calc_rule.constraint_name]?.length
          ) {
            // 没有子表或者子表数量为0的时候不进行计算
            return;
          }
        }

        // 过滤无效的日期计算结果
        if (ret === "Invalid date") {
          return;
        }

        // 过滤函数类型的返回值（避免错误的计算结果）
        if (typeof ret === "function") {
          return;
        }

        let update = false; // 是否需要更新字段值的标志

        // 根据触发条件判断是否需要更新
        if (fieldInfo.redundant.trigger == "isnull" && field.isEmpty()) {
          // 仅当字段为空时才更新
          update = true;
        } else if (
          !fieldInfo.redundant.trigger ||
          fieldInfo.redundant.trigger == "always"
        ) {
          // 默认或"always"触发条件，总是更新
          update = true;
        }

        // 执行字段值更新
        if (
          update &&
          field.info?.subType !== "autocomplete" && // 排除自动完成字段
          ret !== undefined // 确保有有效的返回值
        ) {
          // undefined说明没有返回值 不要更新
          // 处理异步计算结果（Promise）
          if (typeof ret === "object" && ret instanceof Promise) {
            ret.then((res) => {
              field.setSrvVal(res); // 异步设置字段值
            });
          } else {
            // 处理同步计算结果，避免不必要的更新
            if (field.getSrvVal() !== ret) {
              field.setSrvVal(ret); // 设置字段值
            }
          }
        }
      }

    },

    /**
     * 构建字段依赖关系
     *
     * 分析字段配置，建立字段间的依赖关系网络：
     * - 基于 dispLoader 条件的条件依赖关系
     * - 基于 redundant.dependField 的冗余依赖关系
     *
     * 该方法会为每个字段添加 dependentFields 和 condDependentFields 属性，
     * 用于后续的字段联动和冗余处理。
     *
     * @param {Object} fields - 字段集合对象，key为字段名，value为Field实例
     * @returns {void}
     *
     * @example
     * // 在表单初始化时构建依赖关系
     * this.buildDependentFields(this.fields);
     *
     * @example
     * // 构建后的字段依赖关系示例
     * field.dependentFields = new Set(['dependent_field1', 'dependent_field2']);
     * field.condDependentFields = new Set(['condition_field1']);
     */
    buildDependentFields(fields) {
      // construct redundant fields relations via fk
      // 通过外键构建冗余字段关系
      for (let fieldName in fields) {
        const field = fields[fieldName];
        // 获取字段的显示加载器条件配置
        const conditions = field?.info?.dispLoader?.conditions || [];

        // 处理基于条件的字段依赖关系
        if (Array.isArray(conditions) && conditions.length > 0) {
          // 查找包含数据引用的条件项
          const hasCondDependField = conditions.find(
            (item) =>
              item.value &&
              typeof item.value === "string" &&
              item.value.indexOf("data") !== -1 // 检查条件值是否引用了数据字段
          );

          // 如果存在条件依赖字段，建立依赖关系
          if (hasCondDependField) {
            // 遍历所有字段，查找被条件引用的字段
            for (let fieldName2 in fields) {
              const field2 = fields[fieldName2];
              const field2Name = field2?.info?.name;

              // 检查当前字段是否被条件引用
              if (
                field2Name &&
                conditions.find((item) => item?.value?.indexOf(field2Name) > -1)
              ) {
                // 为被引用字段添加条件依赖字段集合
                field2.condDependentFields =
                  field2.condDependentFields || new Set();
                field2.condDependentFields.add(field2Name); // 添加依赖字段名
              }
            }
          }
        }

        // 标记冗余依赖的字段
        const dependFieldName = field.info?.redundant?.dependField; // 获取冗余依赖字段名
        if (dependFieldName) {
          const dependField = fields[dependFieldName]; // 获取依赖字段实例
          if (dependField) {
            // 为依赖字段添加依赖字段集合
            dependField.dependentFields =
              dependField.dependentFields || new Set();
            dependField.dependentFields.add(field.info.name); // 添加当前字段为依赖项
          }
        }
      }
    },

    /**
     * 处理通过外键引用的字段冗余
     *
     * 当外键字段值发生变化时，自动更新相关的冗余字段值。
     * 支持多种触发条件和特殊字段类型的处理。
     *
     * @param {Field} field - 触发冗余的外键字段实例
     * @param {Object} fields - 字段集合对象，key为字段名，value为Field实例
     * @param {boolean} [onHandle=false] - 是否为手动操作触发
     *   - true: 手动改变下拉选项（如 autocomplete 字段）
     *   - false: 自动触发的冗余操作
     * @returns {void}
     *
     * @example
     * // 外键字段值变化时处理冗余
     * this.handleFieldFkRedundant(customerField, this.fields, false);
     *
     * @example
     * // 手动操作 autocomplete 字段时
     * this.handleFieldFkRedundant(autocompleteField, this.fields, true);
     *
     * @description
     * 触发条件说明：
     * - "isnull": 仅当依赖字段为空时才进行冗余
     * - "unchange": 仅当依赖字段未被手动修改时才进行冗余
     * - "always": 总是进行冗余（默认）
     */
    handleFieldFkRedundant: function (field, fields, onHandle = false) {
      // 处理条件依赖字段的重置逻辑
      if (
        field.model === null && // 当前字段值为空
        field.condDependentFields && // 存在条件依赖字段
        field.condDependentFields.size > 0
      ) {
        // 重置所有条件依赖的字段
        field.condDependentFields.forEach((dependentFieldName) => {
          let dependentField = fields[dependentFieldName];
          dependentField.reset(); // 重置依赖字段
        });
      }

      // 处理冗余依赖字段的更新逻辑
      if (field.dependentFields) {
        // 遍历所有依赖当前字段的字段
        field.dependentFields.forEach((dependentFieldName, index) => {
          const dependentField = fields[dependentFieldName]; // 获取依赖字段实例
          const refedCol = dependentField.info.redundant.refedCol; // 获取引用列名
          let sync = true; // 是否需要同步的标志

          // 根据触发条件判断是否需要同步
          if (dependentField.info.redundant.trigger === "isnull") {
            // 触发字段数据发生变化，其它字段为null的时候冗余
            sync = dependentField.isEmpty(); // 仅当依赖字段为空时同步
          }

          // 处理"unchange"触发条件的特殊逻辑
          if (dependentField.info.redundant.trigger === "unchange") {
            //  触发字段数据发生变化，其它字段没有被手动修改的时候，冗余，如果存在手动修改，则不在冗余
            //  unchange处理调整：当前值为空的时候，即使为unchange，选fk时仍然填写冗余。 25.6.28王总确认
            const nullVal = [null, undefined, ""]; // 定义空值
            // 检查依赖字段是否为空值或者值与旧值相同（未手动修改）
            if (
              nullVal.includes(dependentField.model) || // 当前值为空
              (field.modelOld && // 存在旧值记录
                dependentField.getSrvVal &&
                dependentField.getSrvVal() === field.modelOld[refedCol]) // 值未发生变化
            ) {
              sync = true; // 允许同步
            } else {
              sync = false; // 禁止同步（已手动修改）
            }
          }

          // 执行字段值同步
          if (sync) {
            // 特殊处理自动完成字段
            if (
              dependentField.info.subType === "autocomplete" && // 自动完成字段
              dependentField.getSrvVal() && // 已有值
              onHandle !== true // 非手动操作
            ) {
              // 表单自动冗余操作，如果字段是autocomplete且本身有值，不进行冗余
              return;
            }

            // 冗余处理 --- 根据当前字段值设置依赖字段值
            if(field.info.type==='fks' && field.model){
              // fks字段冗余处理
              if(typeof field.model === 'string'){
                // model为值，从组件中获取原始数据
                const modelRawData = field?.editor?.$refs?.editor?.$refs?.tablePicker?.currentModelsRaw || []
                if(Array.isArray(modelRawData)&&modelRawData.length&&modelRawData.length===field.model.split(',').length){
                  let dependent_field_val_arr = []
                  modelRawData.forEach(item=>{
                    if(item && (item[refedCol]||item[refedCol]===0)){
                      dependent_field_val_arr.push(item[refedCol])
                    }
                  })
                  if(Array.isArray(dependent_field_val_arr)&&dependent_field_val_arr.length){
                    dependentField.setSrvVal(dependent_field_val_arr.join(',')); // 设置依赖字段值
                    field.modelOld = cloneDeep(field.model); // 保存当前值作为旧值记录
                  }else{
                    dependentField.reset(); // 重置依赖字段
                  }
                }
              }
            }else if (
              field.model && // 当前字段有值
              (field.model[refedCol] || field.model[refedCol] === 0) // 引用列有值（包括0值）
            ) {
              // fk字段冗余处理
              dependentField.setSrvVal(field.model[refedCol]); // 设置依赖字段值
              field.modelOld = cloneDeep(field.model); // 保存当前值作为旧值记录
            } else {
              dependentField.reset(); // 重置依赖字段
            }
          }
        });
      }

      // for user field xxx, try to set the _xxx_disp field
      let dispFieldName = `_${field.info.name}_disp`; // 构造显示字段名
      // 处理用户类型字段的显示字段设置
      if (field.info.type === "User" && fields[dispFieldName]) {
        if (field.model) {
          fields[dispFieldName].setSrvVal(field.model.user_disp); // 设置用户显示字段值
        }
      }
    },
  },
};
