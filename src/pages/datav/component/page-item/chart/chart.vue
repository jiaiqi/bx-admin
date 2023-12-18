<script setup>
import { initChart } from '../use-functions/buildOption'
import { onMounted, onUnmounted, ref, watch } from "vue";
const props = defineProps({
  options: {
    type: Object,
  },
  width: {
    type: String,
    default: '100%',
  },
  height: {
    type: String,
    default: '100%',
  },
});
const domRef = ref(null)

let chartObj = null;
let objResizeObserver;
onMounted(() => {
  if (!domRef.value) return

  // 初始化
  chartObj = initChart(domRef.value)

  if (props.options) {
    drawOption()
  }

  objResizeObserver = new ResizeObserver(function (entries) {
    const entry = entries[0];
    if (entry?.target === domRef.value) {
      chartObj?.resize()
    }
  });

  // 观察元素尺寸变化
  objResizeObserver.observe(domRef.value);

  setTimeout(() => {
    chartObj && chartObj.resize()
  }, 1000)
})

onUnmounted(() => {
  if (chartObj) {
    chartObj.dispose()
    chartObj = null
  }
  // 取消监听
  domRef.value && objResizeObserver.unobserve(domRef.value);
})

// 监听配置变化
watch(() => props.options, () => drawOption())


//加载图表配置
const drawOption = () => {
  if (!chartObj) return
  const options = {
    ...props.options,
  };
  if (props.colors?.length) {
    options.color = props.colors
  }
  chartObj.setOption(options)
}
</script>

<template>
  <!-- 为 ECharts 准备一个定义了宽高的 DOM -->
  <div ref="domRef" class="echarts-item" :style="{ width, height }" />
</template>
