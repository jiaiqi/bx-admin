import { $http } from "./http";

/**
 * 通用查询方法
 * @param {object} option
 * @param {string} option.app 应用名
 * @param {string} option.service 服务名
 * @param {?array} option.condition 查询条件
 * @param {?object} option.page 分页信息
 * @param {?object}} option.order 排序信息
 * @param {?array} option.group 分组信息
 * @param {?object} option.mapcondition 映射条件
 * @param {?boolean} option.isproc 是否是流程
 * @param {?array} option.columns 查询字段
 * @param {?array} option.relationCondition 关联查询条件
 * @param {?boolean} option.draft 是否是草稿
 * @param {?string} option.pageType 页面类型
 * @param {?boolean} option.srvAuth 是否在header中增加bx_srv_auth_ticket参数
 * @param {?string} option.vpageNo v2唯一标识
 * @param {?string} option.useType 使用类型
 * @param {?boolean} option.rdt 是否是树形结构
 * @param {?array} option.divCondition 分表条件
 * @returns
 */
export const onFetch = async (
  option = {
    app: null,
    service: "",
    condition: [],
    page: {},
    order: [],
    group: [],
    mapcondition: [],
    isproc: false,
    columns: ["*"],
    relationCondition: [],
    draft: false,
    pageType: null,
    srvAuth: null,
    vpageNo: null,
    useType: "list",
    rdt: false,
    divCondition: null,
  },
  vm = {}
) => {
  const res = await doSelect(option, vm);
  if (res.data) {
    return res.data;
  } else {
    console.error(res);
  }
};

export const resolveDefaultSrvApp = function (vm = {}) {
  let app = null;
  // search $srvApp from node to root
  let node = vm;
  while (!node.$srvApp) {
    if (node.$parent) {
      node = node.$parent;
    } else {
      break;
    }
  }

  if (node.$srvApp) {
    app = node.$srvApp;
  } else {
    // whole path does not have $srvApp,
    // try  page level
    if (node?.$route && node?.$route?.query?.srvApp) {
      app = node?.$route?.query?.srvApp;
    } else {
      let defaultApp =
        (window.frameElement && window.frameElement.dataset["app"]) ||
        (top.window.pathConfig && top.window.pathConfig.application);
      app = defaultApp;
    }
  }
  return app;
};

export const doSelect = function (option = {}, vm = {}) {
  const {
    service: service_name,
    condition,
    page,
    order,
    group,
    mapcondition,
    app,
    isproc,
    columns,
    relationCondition,
    draft,
    pageType,
    srvAuth,
    vpageNo,
    useType,
    rdt,
    divCondition,
  } = option;
  const defaultApp = app || resolveDefaultSrvApp(vm);
  let url = `${window.backendIpAddr}/${app}/select/${service_name}`;
  const query = {
    serviceName: service_name,
    colNames: columns || ["*"],
    condition: condition || [],
    relation_condition: relationCondition || {},
    page: page,
    order: order,
    draft: draft,
    vpage_no: vpageNo,
    use_type: useType, //2023.10.20增加use_type参数 解决行按钮权限丢失问题
  };
  if (divCondition) {
    query["divCond"] = divCondition;
  } else if (
    query.condition.length &&
    query.condition.find((item) => item.use_div_calc === "是")
  ) {
    let divCond = query.condition.filter((item) => item.use_div_calc === "是");
    if (divCond?.length) {
      query.divCond = divCond.map((item) => {
        return {
          colName: item.colName,
          ruleType: item.ruleType,
          value: item.value,
        };
      });
      query.condition = query.condition.map((item) => {
        return {
          colName: item.colName,
          ruleType: item.ruleType,
          value: item.value,
        };
      });
    }
  }
  if (query["divCond"]?.length) {
    if (query["condition"]?.length) {
      query.condition = query["condition"].map((item) => {
        if (item.ruleType === "like" && defaultApp !== "log") {
          item.ruleType = "eq";
        }
        return item;
      });
    }
    query["divCond"] = query["divCond"].map((item) => {
      if (!Array.isArray(item.value)) {
        item.value = [item.value];
      }
      return item;
    });
  }
  if (useType === "treelist") {
    // 2023年11月13日增加，top tree data特性，后端返回符合条件的数据的最顶层节点数据，不使用parentCol为null作为条件
    //  query["rdt"] = "ttd";
    if (rdt) {
      query["rdt"] = rdt;
      if (query.page?.rownumber) {
        query.page.rownumber = 9999;
      }
    }
  }
  if (pageType && pageType === "list_page") {
    query["query_source"] = "list_page";
  }
  if (isproc) {
    query["proc_data_type"] = isproc;
  }
  if (group) {
    query.group = group;
  }

  if (mapcondition != undefined && mapcondition != "" && mapcondition != null) {
    query["map_table_condtion"] = mapcondition;
  }

  url = url + "?" + service_name;
  if (
    srvAuth &&
    sessionStorage.getItem(`bx_srv_auth_ticket-${defaultApp}-${service_name}`)
  ) {
    let bx_srv_auth_ticket = sessionStorage.getItem(
      `bx_srv_auth_ticket-${defaultApp}-${service_name}`
    );
    return $http.post(url, query, {
      headers: {
        bx_auth_ticket: sessionStorage.getItem("bx_auth_ticket"),
        bx_srv_auth_ticket: bx_srv_auth_ticket,
      },
    });
  } else {
    return $http.post(url, query);
  }
};
