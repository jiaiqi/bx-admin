<script setup>
// 门架信息
import {ref} from "vue";

const props = defineProps({
  data: {
    type: Array,
    default: () => ([])
  }
})
const reverse = ref(false)
const activities = ref(
    [{
      content: '活动按期开始',
      timestamp: '2018-04-15'
    }, {
      content: '通过审核',
      timestamp: '2018-04-13'
    }, {
      content: '创建成功',
      timestamp: '2018-04-11'
    }]
)
</script>

<template>
  <div class="door-frame">
    <el-timeline :reverse="reverse" >
      <el-timeline-item
          :hideTimestamp="false"
          v-for="(activity, index) in data"
          :key="index"
          :timestamp="activity.transtime">
        <div class="info-item">
          <div class="item-list">
            门架编号：{{ activity.tollgrantry_id }}
          </div>
          <div class="item-list">
            门架名称：{{ activity.tollgrantry_name }}
          </div>
          <div class="item-list">
            过车时间：{{ activity.transtime }}
          </div>
          <div class="item-list">
            计费金额：{{ activity.fee_disp }}
          </div>
          <!--        <div class="button">-->
          <!--          <el-button type="primary" size="mini"> <i class="el-icon-download mr-2"></i>获取图片</el-button>-->
          <!--        </div>-->
        </div>
      </el-timeline-item>
    </el-timeline>
  </div>
</template>

<style scoped>
.door-frame{
  padding: 15px;
  max-height: calc(100vh - 80px);
  overflow-y:auto ;
}
.info-item {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-column-gap: 10px;
  grid-row-gap: 10px;
}
</style>