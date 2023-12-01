<script setup>
import { setDefaultChartOption } from "../../page-item/use-functions/buildOption.js"
import * as echarts from "echarts";
import 'echarts/extension/bmap/bmap';
import { onMounted, ref, watch } from "vue";
const props = defineProps({
  pageItem: {
    type: Object,
  },
  chartType: {
    type: String,
  },
  colors: Array,
  chartOption: {
    type: Object,
  },
  index: {
    type: [Number, String],
  },
  canvasId: {
    type: String,
    default: () => {
      return "ec-canvas" + new Date().getTime();
    },
  },
});
const { pageItem, chartType } = props
const chartOption = ref(null);

let myChart = null;

const setChartOption = (chart) => {
  // 指定图表的配置项和数据
  const defaultOption = setDefaultChartOption(chartType, pageItem?.chart_json, echarts)//生成图表默认配置
  const option = {
    ...defaultOption,
    ...props.chartOption,
  };
  if(props.chartType==='map'){
    debugger
  }
  // 使用刚指定的配置项和数据显示图表。
  myChart.setOption(option);
  chartOption.value = option;
};

onMounted(() => {
  // 基于准备好的dom，初始化echarts实例
  myChart = echarts.init(document.getElementById(props.canvasId));
  setChartOption(myChart);
  setTimeout(() => {
    myChart.resize();
  }, 100);
  watch(() => props.chartOption, () => {
    setChartOption(myChart);
  })
});

watch(
  () => props.chartOption,
  () => {
    if (props.chartOption) {
      setChartOption(props.chartOption, myChart);
    }
  }
);

const onResize = () => {
  myChart.resize();
};

defineExpose({
  onResize,
});
</script>

<template>
  <!-- 为 ECharts 准备一个定义了宽高的 DOM -->
  <div :id="canvasId" style="width: 100%; height: 100%"></div>
</template>

<style lang="scss" scoped></style>
