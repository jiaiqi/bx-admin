<script setup>
import { initChart } from "../use-functions/buildOption";
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
});
const domRef = ref(null);

let chartObj = null;
let objResizeObserver;
onMounted(() => {
  if (!domRef.value) return;

  // 初始化
  chartObj = initChart(domRef.value);

  objResizeObserver = new ResizeObserver(function (entries) {
    const entry = entries[0];
    if (entry?.target === domRef.value) {
      chartObj?.resize();
    }
  });

  // 观察元素尺寸变化
  objResizeObserver.observe(domRef.value);

  setTimeout(() => {
    chartObj && chartObj.resize();
  }, 1000);
});

onUnmounted(() => {
  if (chartObj) {
    chartObj.dispose();
    chartObj = null;
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
    }, 500),
  {
    immediate: true,
  }
);

//加载图表配置
const drawOption = () => {
  if (!chartObj) return;
  chartObj.showLoading({
    text: '加载中...',
    color: '#eee',
    textColor: '#fff',
    maskColor: 'rgba(0, 0, 0, 0.2)',
    spinnerRadius: 20,
  });
  const options = {
    ...props.options,
  };
  if (props.colors?.length) {
    options.color = props.colors;
  }
  setTimeout(() => {
    nextTick(() => {
      chartObj.setOption(options);
      chartObj.hideLoading();
    });
  }, 1000);
};
</script>

<template>
  <!-- 为 ECharts 准备一个定义了宽高的 DOM -->
  <div ref="domRef" class="echarts-item" :style="{ width, height }"></div>
</template>
