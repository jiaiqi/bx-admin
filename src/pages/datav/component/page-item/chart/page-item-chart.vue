<template>
  <Chart
    ref="chartRef"
    v-loading="loading"
    element-loading-background="rgba(0, 0, 0, 0.1)"
    class="uni-ec-canvas"
    :page-item="pageItem"
    :options="option"
    :canvasId="canvasId"
    :chartType="chartType"
    :cellData="cellData"
    v-if="option && chartType !== 'liquidFill'"
    @click-chart="clickChart"
  ></Chart>
  <LiquidFillChart
    v-else-if="option && chartType == 'liquidFill'"
    :value="liquidValue"
    :color="setLiquidColor"
  ></LiquidFillChart>
</template>

<script setup>
import { computed, watch, onMounted, ref } from "vue";
import LiquidFillChart from "@/pages/datav/component/page-item/LiquidFillChart.vue";
import Chart from "./chart.vue";
import { $select } from "../../../common/http.js";
import {
  useBuildOption,
  setDefaultChartOption,
} from "../use-functions/buildOption";
import { useUtils } from "@/common/vueApi.js";
import cloneDeep from "lodash/cloneDeep";
import { formatStyleData } from "@/pages/datav/common";
const { renderStr } = useUtils();

const props = defineProps({
  pageItem: Object,
  pageParamsModel: Object,
  layout: Object,
  index: [String, Number],
  canvasId: {
    type: String,
    default: () => {
      return "ec-canvas" + new Date().getTime();
    },
  },
});
function deepClone(obj) {
  if (obj == null) return null;
  let newObj = obj instanceof Array ? [] : {};
  for (var i in obj) {
    newObj[i] = typeof obj[i] == "object" ? deepClone(obj[i]) : obj[i];
  }
  return newObj;
}
const pageItem = props.pageItem;

let timer = null;
const emit = defineEmits(["clickChart"]);

const option = ref(null);
const loading = ref(false);

const clickChart = () => {
  emit("clickChart");
};

const setLiquidColor = computed(() => {
  const styleJson = pageItem?.style_json || {};
  let style = {};
  if (styleJson) {
    style = formatStyleData(styleJson);
  }
  if (style.color) {
  }
  return style.color;
});
const chartConfig = computed(() => {
  return pageItem?.chart_json;
});
const chartType = computed(() => {
  let chartType = "";
  switch (chartConfig.value?.chart_type) {
    case "折线图":
      chartType = "line";
      break;
    case "柱状图":
    case "条形图":
      chartType = "bar";
      break;
    case "饼图":
      chartType = "pie";
      break;
    case "环图":
      chartType = "ring";
      break;
    case "雷达图":
      chartType = "radar";
      break;
    case "组合图":
      chartType = "lineBar";
      break;
    case "地图":
      chartType = "map";
      break;
    case "雷达图":
      chartType = "radar";
      break;
    case "词云图":
      chartType = "wordcloud";
      break;
    case "水球图":
      chartType = "liquidFill";
      break;
    default:
      chartType = "line";
      break;
  }
  return chartType;
});
const colsMapDetailJson = computed(() => {
  // 组件参数 的map array  接口返回数据格式 无法确定接口时啥样子，小程序 逻辑使用com_para_with_map_json 但没值，改用有值的 page_com_cols_map_json
  let pageComColsMapJson = pageItem?.page_com_cols_map_json || null;
  let colsMapDetailJson = null;
  if (pageComColsMapJson) {
    // 识别、处理组件到页面参数联动
    if (
      pageComColsMapJson.cols_map_detail_json &&
      Array.isArray(pageComColsMapJson.cols_map_detail_json)
    ) {
      colsMapDetailJson = pageComColsMapJson.cols_map_detail_json;
    }
  }
  return colsMapDetailJson;
});

const calcSrvReq = (req) => {
  let params = {};
  if (props.pageParamsModel && typeof props.pageParamsModel === "object") {
    params = {
      ...props.pageParamsModel,
    };
  }

  let conds = [];
  const globalParams = {
    ...params,
    user_no: sessionStorage.getItem("login_user_info")?.user_no,
    userInfo: sessionStorage.getItem("login_user_info"),
  };

  if (
    req.hasOwnProperty("condition") &&
    Array.isArray(req.condition) &&
    req.condition.length > 0
  ) {
    for (let cond of req.condition) {
      let condModel = cloneDeep(cond);
      if (
        cond &&
        condModel.value &&
        condModel.value.indexOf("${") !== -1 &&
        condModel.value.indexOf("}") !== -1 &&
        params
      ) {
        if (
          renderStr(condModel.value, globalParams) &&
          renderStr(condModel.value, globalParams).indexOf("[object") == -1
        ) {
          condModel.value = renderStr(condModel.value, globalParams);
        } else {
          let key = condModel.value;
          var sreg = new RegExp("\\${", "g");
          var ereg = new RegExp("\}", "g");
          key = key.replace(sreg, "");
          key = key.replace(ereg, "");
          console.log("--srvReq", params, key);
          condModel.value =
            params && params.hasOwnProperty(key) ? params[key] : "";
          if (condModel.value?.value) {
            condModel.value = condModel.value.value;
          }
        }
      }
      conds.push(cloneDeep(condModel));
    }
    req.condition = conds.map((item) => item);
  }
  return req;
};

const onSrvReq = async (req = null) => {
  req = req || pageItem?.srv_req_json;
  if (req) {
    req = calcSrvReq(req);
    loading.value = true;
    let res = await $select(req, req.mapp);
    loading.value = false;
    console.log(res);
    if (res.ok && res.data.length > 0) {
      cellData.value = res.data;
    }
    console.log(pageItem);
    //todo 水球数据只需要传入具体的数字
    setLiquidData();
    option.value = useBuildOption(
      chartType.value,
      pageItem,
      res.data,
      props.layout
    );
  }
};

watch(
  () => props.pageParamsModel,
  (newVal, oldVal) => {
    paramsLinkage();
  },
  { immediate: true, deep: true }
);
const liquidValue = ref(0);
//手动更新水球图数据
const setLiquidData = () => {
  if (cellData.value.length > 0) {
    liquidValue.value =
      cellData.value[0].value === "string"
        ? Number(cellData.value[0].value)
        : cellData.value[0].value;
  }
};
onMounted(() => {
  if (
    pageItem?.srv_req_type === "模拟数据" &&
    pageItem?.mock_srv_data_json?.length
  ) {
    // 使用模拟数据
    cellData.value = pageItem.mock_srv_data_json;
    option.value = useBuildOption(
      chartType.value,
      pageItem,
      cellData.value,
      props.layout
    );
  } else if (
    chartConfig.value?.more_option?.includes("使用模拟数据") &&
    !pageItem?.srv_req_json &&
    !cellData.value.length &&
    !chartType.value === "liquidFill"
  ) {
    option.value = useBuildOption(
      chartType.value,
      pageItem,
      chartConfig.value.mock_data_json || [],
      props.layout
    );
  } else if (
    chartConfig.value?.more_option?.includes("使用模拟数据") &&
    !pageItem?.srv_req_json &&
    !cellData.value.length &&
    chartType.value === "liquidFill"
  ) {
    option.value = {
      chartType: chartType.value,
      pageItem: pageItem,
      cellData: chartConfig.value.mock_data_json || [],
    };
    cellData.value = chartConfig.value.mock_data_json || [];
    //todo 水球数据只需要传入具体的数字
    setLiquidData();
  } else if (!pageItem?.srv_req_type && !cellData.value?.length) {
    option.value = setDefaultChartOption(
      chartType.value,
      pageItem,
      [],
      props.layout
    );
  } else {
    let itemReqJson = pageItem?.srv_req_json
      ? JSON.parse(JSON.stringify(pageItem.srv_req_json))
      : null;
    const req = itemReqJson ? buildRequestParams(itemReqJson) : itemReqJson;
    onSrvReq(req);
    // onSrvReq();
    if (pageItem?.srv_req_json?.cycle_req_timer) {
      // 定时刷新
      autoRefreshData();
    }
  }
});

const cellData = ref([]);
const autoRefreshData = () => {
  const interval = pageItem?.srv_req_json?.cycle_req_timer;
  timer = setInterval(() => {
    let itemReqJson = pageItem?.srv_req_json
      ? JSON.parse(JSON.stringify(pageItem.srv_req_json))
      : null;
    const req = itemReqJson ? buildRequestParams(itemReqJson) : itemReqJson;
    onSrvReq(req);
  }, interval * 1000);
};

function buildRequestParams(e) {
  console.log("请求参数====>", e);
  let condition = deepClone(e.condition);
  let mapsJonss = colsMapDetailJson.value || [];
  if (Array.isArray(condition)) {
    for (let cond of condition) {
      console.log("buildRequestParams", cond.colName, cond.value);
      if (
        cond.value &&
        cond.value.startsWith("${") &&
        cond.value.endsWith("}")
      ) {
        console.log("2", cond.value);
        let par = cond.value.replace("${", "");

        par = par.replace("}", "");
        let params = deepClone(props.pageParamsModel);
        if (params && Object.keys(params).length > 0) {
          for (let key in params) {
            console.log("key", key, par);
            if (key === par) {
              let mapsCol = mapsJonss.filter(
                (item) => item.col_to === par || item.col_from === par
              );
              if (Array.isArray(mapsCol) && mapsCol.length > 0) {
                let value = "";
                let model = null;
                for (let col of mapsCol) {
                  switch (col.from_type) {
                    case "页面":
                      model = params;
                      switch (col.to_type) {
                        case "组件":
                          cond.value = params[key].value;
                          // $set(cond,'value',pageParamsModel[key].value)
                          break;
                        case "页面":
                          break;

                        default:
                          break;
                      }
                      break;
                    case "组件":
                      switch (col.to_type) {
                        case "组件":
                          break;
                        case "页面":
                          break;

                        default:
                          break;
                      }
                      break;

                    default:
                      break;
                  }
                }
              }
              console.log("请求参数", e);
              //  $set(cond,'value',)
            }
          }
        }
      }
    }
    condition = condition.filter((item) => {
      if (
        item.ruleType === "eq" &&
        (item.value === null || item.value === undefined)
      ) {
        return false;
      } else {
        return true;
      }
    });
  }

  e.condition = deepClone(condition);
  // console.log(e.serviceName,condition)
  return e;
}
function paramsLinkage() {
  let itemReqJson = pageItem?.srv_req_json
    ? JSON.parse(JSON.stringify(pageItem.srv_req_json))
    : null;
  const req = itemReqJson ? buildRequestParams(itemReqJson) : itemReqJson;
  console.log("图表请求", req, req?.serviceName);
  if (Array.isArray(colsMapDetailJson.value)) {
    for (let p of colsMapDetailJson.value) {
      if (p.from_type === "页面" && p.trigger_time === "联动") {
        if (req?.serviceName) {
          onSrvReq(req);
        }
      }
    }
  }
}

const chartRef = ref(null);
const onResize = () => {
  // chartRef?.value?.onResize();
};
defineExpose({
  onResize,
});
</script>

<style lang="scss" scoped>
::v-deep .el-loading-mask {
  background-color: rgba($color: #000000, $alpha: 0.1);
}
</style>
