<script setup>
// 出入口信息
const props = defineProps({
  inData: {
    type: Object,
    default: () => ({})
  },
  outData: {
    type: Object,
    default: () => ({})
  }
})
const colList2 = [
  {
    column: 'extollstationname',
    label: '出口站名'
  },
  {
    column: 'extime',
    label: '出口时间'
  }, {
    column: 'extolllanehex',
    label: '出口车道'
  }, {
    column: 'exvehicleid',
    label: '出口车牌'
  }, {
    column: 'exvehicletype',
    label: '出口车型'
  }, {
    column: 'exvehicleclass',
    label: '出口车种'
  }
]
const colList1 = [
  {
    column: 'entollstationname',
    label: '入口站名'
  },
  {
    column: 'entime',
    label: '入口时间'
  }, {
    column: 'entolllanehex',
    label: '入口车道'
  }, {
    column: 'envehicleid',
    label: '入口车牌'
  }, {
    column: 'envehicletype',
    label: '入口车型'
  }, {
    column: 'envehicleclass',
    label: '入口车种'
  }
]

</script>

<template>
  <div class="info-list">
    <div class="info-list-box">
      <div class="info-list-item" v-for="item in colList1">
        <div class="label">{{ item.label }}:</div>
        <div class="value">{{ inData[item.column] || '-' }}</div>
      </div>
    </div>
    <div class="info-list-box">
      <div class="info-list-item" v-for="item in colList2">
        <div class="label">{{ item.label }}:</div>
        <div class="value">{{ outData[item.column] || '-' }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">

.info-list {
  padding: 15px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-column-gap: 20px;

  &-box {
    grid-row-gap: 10px;
    display: grid;

  }

  &-item {
    display: grid;
    grid-template-columns: auto 1fr;
    grid-column-gap: 10px;
  }
}
</style>