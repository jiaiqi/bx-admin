<script setup>
import { ref, computed, watch } from 'vue'
import { MessageBox } from 'element-ui'

import { $http } from '@/common/http';


const props = defineProps({
  mapJson: {
    type: Object,
    default: () => { },
  },
  markerList: {
    type: Array,
    default: () => { },
  }
});
const sourceJson = computed(() => {
  return props.mapJson.multi_src_poi_json || [];
});
const markers = ref()
async function getMarkers(params = {}) {
  const { srv_req_json: p, poi_name, poi_type,col_map } = params
  if (p) {
    const url = `/${p.mapp}/select/${p.serviceName}`;
    const res = await $http.post(url, p)
    if (res?.data?.state === 'SUCCESS') {
      const list = res.data.data.map(item => {
        item._poi_info = {
          ...params
        }
        item._col_map = col_map
        return item
      })
      markers.value.push(...list)
    } else if (res?.data?.resultMessage) {
      MessageBox.error(res?.data?.resultMessage)
    }
  }
}

watch(() => sourceJson.value, async (newVal, oldVal) => {
  if (newVal.length) {
    markers.value = []
    newVal.forEach(item => {
      getMarkers(item)
    })
  }
}, {
  immediate: true
})

const emit = defineEmits(['update:markers'])
watch(() => markers.value, (newVal, oldVal) => {
  // debugger
  // markerList.value = buildMarkerList()
  debugger
  emit('update:markerList', newVal)
}, {
  deep: true,
})
</script>
<template>
  <div>

  </div>
</template>
<style lang="scss" scoped></style>