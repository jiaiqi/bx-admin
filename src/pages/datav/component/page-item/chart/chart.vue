<script setup>
import { initChart, startPieAutoPlay } from "../use-functions/buildOption";
import { nextTick, onMounted, onUnmounted, ref, watch } from "vue";
const props = defineProps({
  options: {
    type: Object,
  },
  width: {
    type: String,
    default: "100%",
  },
  height: {
    type: String,
    default: "100%",
  },
  chartType: {
    type: String,
  },
  cellData: {
    type: [Object, Array],
  },
});
const domRef = ref(null);

let chartObj = ref(null);
let objResizeObserver;
let autoPlayTimer = null;
defineExpose({
  chartObj,
});
onMounted(() => {
  if (!domRef.value) return;

  // 初始化
  chartObj.value = initChart(domRef.value);

  objResizeObserver = new ResizeObserver(function (entries) {
    const entry = entries[0];
    if (entry?.target === domRef.value) {
      chartObj.value?.resize();
    }
  });

  // 观察元素尺寸变化
  objResizeObserver.observe(domRef.value);

  nextTick(() => {
    setTimeout(() => {
      chartObj.value && chartObj.value.resize();
    }, 500);
  });
});

onUnmounted(() => {
  if (chartObj.value) {
    chartObj.value.dispose();
    chartObj.value = null;
  }
  // 清除自动轮播定时器
  if (autoPlayTimer) {
    autoPlayTimer();
    autoPlayTimer = null;
  }
  // 取消监听
  domRef.value && objResizeObserver.unobserve(domRef.value);
});

// 监听配置变化
watch(
  () => props.options,
  () =>
    setTimeout(() => {
      drawOption();
    }, 200),
  {
    immediate: true,
  }
);

//加载图表配置
const drawOption = () => {
  console.log(props.chartType);
  if (!chartObj.value) return;
  chartObj.value.showLoading({
    text: "加载中...",
    color: "#333",
    textColor: "#333",
    maskColor: "rgba(255, 255, 255, 0.1)",
    spinnerRadius: 20,
  });
  const options = {
    ...props.options,
  };
  if (props.colors?.length) {
    options.color = props.colors;
  }
  // 将饼图和环图的起始角度从默认的90度（12点钟方向）改为270度（6点钟方向）
  if ((props.chartType === 'pie' || props.chartType === 'ring') && !options.series[0]?.startAngle) {
    options.series = options.series.map(series => ({
      ...series,
      startAngle: 270
    }));
  }
  setTimeout(() => {
    nextTick(() => {
      chartObj.value.setOption(options);
      chartObj.value.hideLoading();

      // 如果是饼图或环图且配置了自动轮播，启动轮播
      if ((props.chartType === 'pie' || props.chartType === 'ring') && options._autoPlay) {
        // 清除之前的轮播定时器
        if (autoPlayTimer) {
          autoPlayTimer();
          autoPlayTimer = null;
        }
        // 启动新的轮播
        autoPlayTimer = startPieAutoPlay(chartObj.value, options);
      }
    });
  }, 1000);
};
</script>

<template>
  <!-- 为 ECharts 准备一个定义了宽高的 DOM -->
  <div
    ref="domRef"
    class="echarts-item"
    :style="{ width, height }"
  ></div>
</template>