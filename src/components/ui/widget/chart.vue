<template>
  <div class="chart-box">
    <page-item-chart ref="chart" :pageParamsModel="pageParamsModel" :pageItem="pageItem"
      v-if="props.data && props.data.length" :key="key"></page-item-chart>
  </div>
</template>

<script setup>
import { ref, computed, defineAsyncComponent } from 'vue';

// 异步加载 page-item-chart 组件
const pageItemChart = defineAsyncComponent(() => 
  import(/* webpackChunkName: "echarts-vendor" */ '@/pages/datav/component/page-item/chart/page-item-chart.vue')
);
const props = defineProps(['config', 'data'])
const key = ref(new Date().getTime())
const pageItem = computed(() => {
  key.value = new Date().getTime()
  return {
    mock_srv_data_json: props.data,
    srv_req_type: Array.isArray(props.data) && props.data?.length ? '模拟数据' : '请求数据',
    srv_req_json: props.config.init_srv_req_json,
    page_com_cols_map_json: props.config.init_cols_map_json,
    chart_json: {
      ...props.config
    }
  }
})
const pageParamsModel = ref({});
</script>

<style lang="scss" scoped>
.chart-box {
  height: 500px;
}
</style>