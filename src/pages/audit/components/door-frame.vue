<script setup>
// 门架信息
import { ref, computed } from "vue";

const props = defineProps({
  data: {
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
// 图片展开状态管理
const expandedImagesMap = ref(new Map())
// 在模板中以对象形式访问，保持响应性
const expandedImages = computed(() => {
  const result = {}
  expandedImagesMap.value.forEach((value, key) => {
    result[key] = value
  })
  return result
})
const toggleImageExpand = (index) => {
  const currentState = expandedImagesMap.value.get(index) || false
  expandedImagesMap.value.set(index, !currentState)
  // 触发更新
  expandedImagesMap.value = new Map(expandedImagesMap.value)
}
const getPic = (item, imgtype,enType) => {
  let url = `${window.backendIpAddr}/aud/get/gantry/img?passid=${item.passid}&gantryid=${item.tollgrantry_id}&transtime=${item.transtime}&type=${item.grantry_type}&vehicleid=${item.vehicleid}`
  if(enType){
    url+=`&enextype=${enType}`
  }
  if(imgtype){
    url+=`&imgtype=${imgtype}`
  }
  return url
}
const hideDialog = () => {
  centerDialogVisible.value = false
  imgSrc.value = null
}
</script>

<template>
  <div class="door-frame">
    <el-timeline :reverse="reverse">
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
          <!-- 图片展开/收起区域 -->
          <div class="image-toggle-section">
            <div
              class="toggle-button"
              @click="toggleImageExpand(index)"
              :class="{ 'expanded': expandedImages[index] }"
            >
              <i :class="expandedImages[index] ? 'el-icon-caret-top' : 'el-icon-caret-bottom'"></i>
              {{ expandedImages[index] ? '收起图片' : '展开图片' }}
            </div>

            <!-- 图片内容区域 -->
            <div v-if="expandedImages[index]" class="image-content">
              <div v-if="activity.grantry_type === '收费站'">
                <el-image
                  style="width:700px;height: 300px"
                  :src="getPic(activity, 'car', index === 0 ? 'en' : index === data.length - 1 ? 'ex' : '')"
                  @click="showPicture(activity)"
                  lazy
                ></el-image>
              </div>
              <div v-else>
                <el-image
                  style="width:700px;height: 300px"
                  :src="getPic(activity, 'car', '')"
                  @click="showPicture(activity)"
                  lazy
                ></el-image>
              </div>
            </div>
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

.image-toggle-section {
  grid-column: 1 / -1;
  margin-top: 10px;
}

.toggle-button {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background-color: #f5f7fa;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #606266;
  font-size: 14px;
  user-select: none;
}

.toggle-button:hover {
  background-color: #ecf5ff;
  border-color: #b3d8ff;
  color: #409eff;
}

.toggle-button.expanded {
  background-color: #ecf5ff;
  border-color: #409eff;
  color: #409eff;
}

.toggle-button i {
  margin-right: 6px;
  font-size: 16px;
}

.image-content {
  margin-top: 10px;
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>