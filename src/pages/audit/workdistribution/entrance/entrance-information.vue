<template>
  <div class="door-frame">
    <el-timeline :reverse="reverse" v-if="list.length>0">
      <el-timeline-item
          :hideTimestamp="false"
          v-for="(item, index) in list"
          :key="index"
          :color="index===0?'#0bbd87':index===list.length-1?'#e80621':'#3194f6'"
          :timestamp="item.transtime">
        <div class="info-item">
          <div class="item-list">
            门架编号：{{ item.tollgrantry_id }}
          </div>
          <div class="item-list">
            门架名称：{{ item.tollgrantry_name }}
          </div>
          <div class="item-list">
            过车时间：{{ item.transtime }}
          </div>
          <div class="item-list">
            计费金额：{{ item.fee_disp }}
          </div>
          <div v-if="item.grantry_type==='收费站'">
            <el-image style="width:43.75rem;height: 18.75rem"
                      :src="getPic(item,'car',index===0?'en':index===list.length-1?'ex':'')"></el-image>
          </div>
          <div v-else>
            <el-image style="width:43.75rem;height: 18.75rem"
                      :src="getPic(item,'car','')"></el-image>
          </div>
        </div>
      </el-timeline-item>
    </el-timeline>
    <el-dialog
        title="图片"
        fullscreen
        append-to-body
        destroy-on-close
        :visible.sync="centerDialogVisible"
        center>
      <div class="image-box">
        <el-image :src="imgSrc" style="width: 100%;height: 100%" fit="scale-down"></el-image>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="hideDialog">关闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script setup>
// 门架信息
import {onMounted, ref} from "vue";
import {useRoute} from "@/common/vueApi";
import {getEntranceData} from "@/pages/audit/workdistribution/entrance/entrance";
import OrderApi from "@/pages/audit/api/order";
const orderUtil= new OrderApi()
const reverse = ref(false)
const route = useRoute()
const list = ref([])
const centerDialogVisible = ref(false);
const imgSrc = ref(null)
const showPicture = (item) => {
  imgSrc.value = getPic(item)
  centerDialogVisible.value = true
}
const getPic = (item, imgtype, enType) => {
  let url = `${window.APP_CONFIG.API_URL}/aud/get/gantry/img?passid=${item.passid}&gantryid=${item.tollgrantry_id}&transtime=${item.transtime}&type=${item.grantry_type}&vehicleid=${item.vehicleid}`
  if (enType) {
    url += `&enextype=${enType}`
  }
  if (imgtype) {
    url += `&imgtype=${imgtype}`
  }
  return url
}
/**
 * @Description:根据携带进入的passid进行车辆通行流水查询
 * @Author:Eirice
 * @Date: 2025-05-30 10:32:53
 */
const getTrafficFlow = (id) => {
  let cadn = {
    condition: [{colName: "passid", ruleType: "like", value: id}]
  }
  orderUtil.getCarWaysInfo(cadn).then(res => {
    if (res.data.state !== 'SUCCESS') return;
    getCarTimeLine(res.data.data)
    console.log('获取到流水', this.suspectedData)
  }).catch(err => {
  })
}
/**
 * @Description:根据查询到的车辆信息获取车辆通行信息
 * @Author:Eirice
 * @Date: 2025-05-30 14:06:57
 */
const getCarTimeLine=(info)=>{
    let tep= info[0]
   if(tep){
     let cadn = {
       condition: [
         {colName: "passid", value: tep.passid, ruleType: "eq"},
         {colName: "enid", value: tep.enpointid, ruleType: "eq"},
         {colName: "exid", value: tep.expointid, ruleType: "eq"},
         {colName: "vtype", value: 1, ruleType: "eq"}
       ],
       divCond:[{colName: "transtime", ruleType: "between", value: [tep.entime, tep.extime]}]
     }
     orderUtil.getCarPathInfoById(cadn).then(res=>{
       if(res.data.state !== 'SUCCESS') return;
       list.value=res.data.data

     }).catch(err => {})
   }


}
const hideDialog = () => {
  centerDialogVisible.value = false
  imgSrc.value = null
}
const getRouteInfo = () => {
  let passId = route.query.pass_id
  if (passId) {
    console.log('---787', passId)
    getTrafficFlow(passId)
  }
}
onMounted(() => {
  getRouteInfo()
})
</script>
<style scoped>
.door-frame {
  padding: 15px;
  max-height: calc(100vh - 5rem);
  overflow-y: auto;
}

.info-item {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-column-gap: 0.625rem;
  grid-row-gap: 0.625rem;
}

.image-box {
  width: 100%;
  height: calc(100vh - 12.5rem);
}
</style>