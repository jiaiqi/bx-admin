import cloneDeep from "lodash/cloneDeep";
import cloneDeepWith from "lodash/cloneDeepWith";
import isString from "lodash/isString";
import isFunction from "lodash/isFunction";
import isUndefined from "lodash/isUndefined";

export const evalExprOrFunc = function (value, data, defaultValue, mainData = {}, vm) {
  try {
    if (isString(value)) {
      return eval(value);
    } else if (isFunction(value)) {
      return value(data, mainData);
    } else {
    }
  } catch (e) {
    if (isUndefined(defaultValue)) {
      throw e;
    } else {
      return defaultValue;
    }
  }
};
/**
 * 计算表达式或执行函数的工具方法
 * @param {string|Function} value - 要计算的表达式或函数
 * @param {Object} data - 当前行数据对象
 * @param {*} defaultValue - 计算失败时的默认返回值
 * @param {Object} mainData - 主数据对象
 * @param {Object} vm - Vue实例对象
 * @returns {*} 计算或执行的结果
 * @throws {Error} 如果计算失败且未提供默认值则抛出异常
 */
export const buildConditions = (params) => {
  const { conditions, rowData, mainData, vm, finderAuto = false, filterNull = true } = params
  let ret = []
  if (Array.isArray(conditions) && conditions.length) {
    for (let index = 0; index < conditions.length; index++) {
      const cond = conditions[index];
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
            condition.value = rowData?.[valueExpr.value_key];
          } else if (valueExpr?.value_type === "mainData") {
            condition.value = mainData?.[valueExpr.value_key];
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
            condition.value = evalExprOrFunc(
              valueExpr,
              rowData,
              null,
              mainData,
              vm
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
          !finderAuto &&
          condition.value === null &&
          cond.value !== null
        ) {
          condition.value = "";
          ret.push(condition);
        }
      }

    }
  }
  return ret
}

// 目前不支持一个colname 多个condition，如果这种case且有一个ruletype = eq， 留下eq
export const pruneConditions = (conditions) => {
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
}


export function buildRelationConditionInfo({ conditions, queryString, fieldInfo }) {
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
  if (conditions) {
    buildConditions(conditions).forEach((c) => condition.push(c));
    condition = pruneConditions(condition);

    if (condition.length > 0) {
      relaTemp.relation = "OR";
      dataTemp.data = [];
      let dataItem = {
        colName: "",
        value: "",
        ruleType: "",
      };
      // dataTemp.data = condition
      // relaTemp.data.push(cloneDeep(dataTemp))
      dataTemp.data = [];
      dataItem.ruleType = "[like]";
      dataItem.colName = fieldInfo?.valueCol;
      dataItem.value = queryString == null ? "" : queryString;
      dataTemp.data.push(cloneDeep(dataItem));
      relaTemp.data.push(cloneDeep(dataTemp));
      dataTemp.data = [];
      dataItem.ruleType = "[like]";
      dataItem.colName = fieldInfo?.dispCol;
      dataItem.value = queryString == null ? "" : queryString;
      dataTemp.data.push(cloneDeep(dataItem));
      relaTemp.data.push(cloneDeep(dataTemp));
    } else {
      relaTemp.relation = "OR";
      dataTemp.data = [];
      let dataItem = {
        colName: "",
        value: "",
        ruleType: "",
      };
      dataItem.ruleType = "[like]";
      dataItem.colName = fieldInfo?.valueCol;
      dataItem.value = queryString == null ? "" : queryString;
      dataTemp.data.push(cloneDeep(dataItem));
      relaTemp.data.push(cloneDeep(dataTemp));
      dataTemp.data = [];
      dataItem.ruleType = "[like]";
      dataItem.colName = fieldInfo?.dispCol;
      dataItem.value = queryString == null ? "" : queryString;
      dataTemp.data.push(cloneDeep(dataItem));
      relaTemp.data.push(cloneDeep(dataTemp));
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
    dataItem.colName = fieldInfo?.valueCol;
    dataItem.value = queryString == null ? "" : queryString;
    dataTemp.data.push(cloneDeep(dataItem));
    relaTemp.data.push(cloneDeep(dataTemp));
    dataTemp.data = [];
    dataItem.ruleType = "[like]";
    dataItem.colName = fieldInfo?.dispCol;
    dataItem.value = queryString == null ? "" : queryString;
    dataTemp.data.push(cloneDeep(dataItem));
    relaTemp.data.push(cloneDeep(dataTemp));
  }
  return relaTemp;
}
export function buildRelationCondition({ relationConditions, formModel, vm }) {
  function evalCustomizer(value, key, obj, stack) {
    if (key === "value" && !obj.literal) {
      try {
        return evalExprOrFunc(value, formModel, null);
      } catch (e) {
        return value;
      }
    }
  }

  var evaled = cloneDeepWith(relationConditions, evalCustomizer);

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
}