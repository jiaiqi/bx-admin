<script setup>
import * as echarts from "echarts";
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
const { pageItem } = props
const chartOption = props.chartOption;

let myChart = null;

const setChartOption = (chartOption, chart) => {
  // 指定图表的配置项和数据
  const option = {
    color: props.colors || ["#007AFF", "#66E1DF", "#34C758", "#FFCB01", "#FF9502"],
    tooltip: {},
    legend: {
      data: [],
      itemStyle: {
        color: pageItem?.style_json?.color || "#848EAC"
      },
      textStyle: {
        color: pageItem?.style_json?.color || "#848EAC"

      },
      data: ["销量"],
    },
    xAxis: {
      data: ["衬衫", "羊毛衫", "雪纺衫", "裤子", "高跟鞋", "袜子"],
      axisLine: {
        lineStyle: {
          color: pageItem?.style_json?.color || "#ccc",
        },
      },
      axisLabel: {
        textStyle: {
          fontWeight: 400,
          fontSize: 10,
          color: pageItem?.style_json?.color || "#ccc",
        },
      }

    },
    yAxis: {
      axisLabel: {
        textStyle: {
          fontWeight: 400,
          fontSize: 10,
          color: pageItem?.style_json?.color || "#848EAC",
        },
        formatter: "{value}",
      },
      axisLine: {
        show: true,
        lineStyle: {
          color: pageItem?.style_json?.color || "#848EAC",
        },
      },
      splitLine: {
        //修改背景线条样式
        show: false, //是否展示
        lineStyle: {
          color: "#E8E8E8", //线条颜色
          type: "dashed", //线条样式，默认是实现，dashed是虚线
        },
      },
    },
    series: [
      {
        name: "销量",
        type: props.chartType || "bar",
        data: [5, 20, 36, 10, 10, 20],
      },
    ],
    ...chartOption,
  };
  // 使用刚指定的配置项和数据显示图表。
  chart.setOption(option);
};

onMounted(() => {
  // 基于准备好的dom，初始化echarts实例
  myChart = echarts.init(document.getElementById(props.canvasId));
  setChartOption(props.chartOption, myChart);
  setTimeout(() => {
    myChart.resize();
  }, 100);
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
