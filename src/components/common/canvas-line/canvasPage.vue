<template>
    <canvas :id="canvasId" class="lines" :style="canvasStyle"></canvas>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import { drawFlightLines } from "./drawLines.js";
// 组件使用前请仔细阅读，查看参数配置
// 航线参数接受说明
// options= {
//    lineColor = '#00ffff', // 基础线条颜色
//    lineWidth = 2,
//    animationDuration = 1000, //运动动画时间
      // 新增颜色配置
//    glowColor = 'rgba(0, 255, 255, 0.5)', // 发光效果颜色
//    flowColor = 'rgba(255, 255, 255, 0.8)', // 流动光效颜色
//    pointColor = '#00ffff', // 点位基础颜色
//    pointGlowColor = 'rgba(0, 255, 255, 0.8)', // 点位光晕颜色
//    rippleColor = 'rgba(0, 255, 255, 0.2)', // 水波纹颜色
//    centerPointColor = '#ffffff' // 中心点颜色
//   }

//canvas必要参数说明 相对容器在视图中的坐标
//start 起点 {x:200,y:150}
//endPoints 终点多个[{x:220,y:340},{x:300,y:540}]
const props = defineProps({
  // 画布ID
  canvasId: {
    type: String,
    default: 'line_free'
  },
  // 起点坐标
  start: {
    type: Object,
    required: true,
    validator: (value) => {
      return typeof value.x === 'number' && typeof value.y === 'number'
    }
  },
  // 终点坐标数组
  endPoints: {
    type: Array,
    required: true,
    validator: (value) => {
      return value.every(point => typeof point.x === 'number' && typeof point.y === 'number')
    }
  },
  // 画线配置选项
  options: {
    type: Object,
    default: () => ({
      lineColor: '#00ffff',
      lineWidth: 1,
      animationDuration: 2000,
    })
  },
  // 画布样式
  canvasStyle: {
    type: Object,
    default: () => ({
      width: '100%',
      height: '100%',
      position: 'fixed',
      zIndex: 1,
      left:0,
      top:0,
    })
  }
})


// 验证必要参数是否存在
const validateParams = () => {
  if (!props.start || typeof props.start.x !== 'number' || typeof props.start.y !== 'number') {
    console.warn('缺少有效的起点坐标')
    return false
  }
  
  if (!Array.isArray(props.endPoints) || props.endPoints.length === 0) {
    console.warn('缺少有效的终点坐标数组')
    return false
  }
  
  if (!props.endPoints.every(point => 
    point && typeof point.x === 'number' && typeof point.y === 'number'
  )) {
    console.warn('终点坐标数组包含无效的坐标点')
    return false
  }
  
  return true
}

// 绘制函数
const drawLines = () => {
  if (!validateParams()) {
    return
  }
  
  const canvas = document.getElementById(props.canvasId)
  if (!canvas) {
    console.warn('找不到画布元素')
    return
  }
  
  try {
    drawFlightLines(props.canvasId, props.start, props.endPoints, props.options)
  } catch (error) {
    console.error('绘制过程中发生错误:', error)
  }
}


// 监听参数变化，重新绘制
watch(
  () => [props.start, props.endPoints, props.options],
  () => {
    drawLines()
  },
  { deep: true }
)

onMounted(() => {
  const canvas = document.getElementById(props.canvasId)
  if (canvas) {
    console.log('Canvas size:', canvas.width, canvas.height)
    console.log('Canvas position:', canvas.getBoundingClientRect())
  }
  drawLines()
})
</script>

<style lang="less" scoped>
.lines {
  width: v-bind('canvasStyle.width');
  height: v-bind('canvasStyle.height');
  position: v-bind('canvasStyle.position');
  z-index: v-bind('canvasStyle.zIndex');
  display: v-bind('canvasStyle.display');
  top: v-bind('canvasStyle.top');
  left: v-bind('canvasStyle.left');
}
</style>