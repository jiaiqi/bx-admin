<template>
  <Chart ref="chartRef" class="uni-ec-canvas" :page-item="pageItem" :chart-option="option" :canvasId="canvasId"
    :chartType="chartType" :colors="colors" v-if="option" @click-chart="clickChart"></Chart>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import Chart from "./chart.vue";
import { $select } from "../../../common/http.js";
import { useBuildOption } from "../use-functions/buildOption";
const props = defineProps({
  pageItem: Object,
  layout: Object,
  index: [String, Number],
  canvasId: {
    type: String,
    default: () => {
      return "ec-canvas" + new Date().getTime();
    },
  },
});
const { pageItem } = props;

let timer = null;
const emit = defineEmits(["clickChart"]);

const option = ref({});

const clickChart = () => {
  emit("clickChart");
};
const colors = ref(null);
if (pageItem?.chart_json?.legend_color_seq) {
  colors.value = pageItem.chart_json.legend_color_seq.split(",");
}
const chartConfig = computed(() => {
  return pageItem?.chart_json;
});
const showLoading = ref(true);
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
    default:
      break;
  }
  return chartType;
});


onMounted(() => {
  if (pageItem?.srv_req_type === '模拟数据' && pageItem?.mock_srv_data_json?.length) {
    // 使用模拟数据
    cellData.value = pageItem.mock_srv_data_json;
    option.value = useBuildOption(chartType.value, pageItem, cellData.value, props.layout);
  } else {
    onSrvReq();
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
    onSrvReq();
  }, interval * 1000);
};
const onSrvReq = async () => {
  let req = pageItem?.srv_req_json;
  if (req) {
    let res = await $select(req, req.mapp);
    console.log(res);
    if (res.ok && res.data.length > 0) {
      cellData.value = res.data;
    }
    console.log(pageItem);

    option.value = useBuildOption(chartType.value, pageItem, res.data, props.layout);
  }
};

const chartRef = ref(null);
const onResize = () => {
  // option.value = useBuildOption(chartType.value, pageItem, cellData.value, props.layout);
  chartRef?.value?.onResize();
};
defineExpose({
  onResize,
});
</script>

<style lang="scss" scoped></style>
