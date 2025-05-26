<template>
  <div class="door-frame">
    <el-timeline :reverse="reverse">
      <el-timeline-item
          :hideTimestamp="false"
          v-for="(activity, index) in list"
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
          <div v-if="activity.grantry_type==='收费站'">
            <el-image style="width:700px;height: 300px"
                      :src="getPic(activity,'car',index===0?'en':index===list.length-1?'ex':'')"></el-image>
          </div>
          <div class="button" v-else>
            <el-button type="primary" size="mini" @click="showPicture(activity)"><i class="el-icon-download mr-2"></i>获取图片
            </el-button>
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
import {ref} from "vue";

const props = defineProps({
  list: {
    type: Array,
    default: () => ([])
  }
})
const reverse = ref(false)

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
const hideDialog = () => {
  centerDialogVisible.value = false
  imgSrc.value = null
}
</script>
<style scoped>
.door-frame {
  padding: 15px;
  max-height: calc(100vh - 80px);
  overflow-y: auto;
}

.info-item {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-column-gap: 10px;
  grid-row-gap: 10px;
}

.image-box {
  width: 100%;
  height: calc(100vh - 200px);
}
</style>