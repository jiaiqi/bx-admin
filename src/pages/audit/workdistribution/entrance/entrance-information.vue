<template>
  <div
    class="door-frame"
    v-loading="isLoading"
    element-loading-text="查询中....."
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.8)"
  >
    <div
      v-if="list.length == 0"
      class="err_info"
    >
      <el-empty description="暂无该passid对应的通行信息，请核对">无效passid为：{{ passId }}</el-empty>
    </div>
    <el-timeline
      :reverse="reverse"
      v-if="list.length > 0"
    >
      <el-timeline-item
        :hideTimestamp="false"
        v-for="(item, index) in list"
        :key="index"
        :color="index === 0 ? '#0bbd87' : index === list.length - 1 ? '#e80621' : '#3194f6'"
        :timestamp="item.transtime"
      >
        <div class="info-item">
          <div class="item-list">
            门架编号：{{ item.tradenodeid }}
          </div>
          <div class="item-list">
            门架名称：{{ item.tradenodename }}
          </div>
          <div class="item-list">
            过车时间：{{ item.transtime }}
          </div>
          <div class="item-list">
            计费金额：{{ item.fee_disp ? item.fee_disp : item.fee }}
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
            <div
              v-if="expandedImages[index]"
              class="image-content"
            >
              <div v-if="item.grantry_type === '收费站'">
                <el-image
                  style="width:43.75rem;height: 18.75rem"
                  :src="getPic(item, 'car', index === 0 ? 'en' : index === list.length - 1 ? 'ex' : '')"
                  lazy
                ></el-image>
              </div>
              <div v-else>
                <el-image
                  style="width:43.75rem;height: 18.75rem"
                  :src="getPic(item, 'car', '')"
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
      center
    >
      <div class="image-box">
        <el-image
          :src="imgSrc"
          style="width: 100%;height: 100%"
          fit="scale-down"
        ></el-image>
      </div>
      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button
          type="primary"
          @click="hideDialog"
        >关闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script setup>
// 门架信息
import { onMounted, ref, reactive, computed, nextTick, getCurrentInstance } from "vue";
import { useRoute } from "@/common/vueApi";
import { getEntranceData } from "@/pages/audit/workdistribution/entrance/entrance";
import OrderApi from "@/pages/audit/api/order";
import { Loading } from 'element-ui';
const orderUtil = new OrderApi()
const reverse = ref(false)
const route = useRoute()
const list = ref([])
const centerDialogVisible = ref(false);
const imgSrc = ref(null)
const isLoading = ref(false)

// 图片展开状态管理 
const expandedImagesMap = ref(new Map())

// 创建computed属性来处理模板中的访问
const expandedImages = computed(() => {
  const result = {}
  expandedImagesMap.value.forEach((value, key) => {
    result[key] = value
  })
  return result
})

const showPicture = (item) => {
  imgSrc.value = getPic(item)
  centerDialogVisible.value = true
}

const toggleImageExpand = (index) => {
  const currentState = expandedImagesMap.value.get(index) || false
  expandedImagesMap.value.set(index, !currentState)
  expandedImagesMap.value = new Map(expandedImagesMap.value)
}
let passId = route.query?.pass_id
let strTime = route.query?.startTime
let endTime = route.query?.endTime
const getPic = (item, imgtype, enType) => {
  let url = `${window.APP_CONFIG.API_URL}/aud/get/gantry/img?passid=${item.passid}&gantryid=${item.grantry_id}&transtime=${item.transtime}&type=${item.grantry_type}&vehicleid=${item.vehicleid}`
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
    condition: [{ colName: "passid", ruleType: "like", value: passId }],
    divCond: [{ colName: "createtime", ruleType: "between", value: [strTime, endTime] }]
  }
  orderUtil.getCarWaysInfo(cadn).then(res => {
    if (res.data.state !== 'SUCCESS') return;
    // getCarTimeLine(res.data.data)
    console.log('获取到流水', this.suspectedData)
  }).catch(err => {
  })
}
/**
 * @Description:初次进入调用远端中心接口查询通行信息
 * @Author:Eirice
 * @Date: 2025-06-06 17:45:45
 */
const getPointByOriginCenter = () => {
  isLoading.value = true
  let obj = {
    condition: [{ colName: "passid", ruleType: "like", value: passId }],
    divCond: [{ colName: "createtime", ruleType: "between", value: [strTime, endTime] }]
  }
  orderUtil.getOriginCenterDetails(obj).then(res => {
    if (res.data.state !== 'SUCCESS') return;
    isLoading.value = false
    handleFilterListInfo(res.data.data)
  }).catch(err => { })
}

/**
 * @Description:从本地服务中调用获取车辆通行信息
 * @Author:Eirice
 * @Date: 2025-06-06 17:48:49
 */
const getPointByLocation = () => {
  isLoading.value = true
  let obj = {
    condition: [{ colName: "passid", ruleType: "like", value: passId }],
    divCond: [{ colName: "createtime", ruleType: "between", value: [strTime, endTime] }]
  }
  orderUtil.getLocationCenterDetails(obj).then(res => {
    if (res.data.state !== 'SUCCESS') return;
    if (res.data.data && res.data.data.length > 0) {
      isLoading.value = false
      handleFilterListInfo(res.data.data)
    } else {
      getPointByOriginCenter()
    }
  }).catch(err => { })
}

/**
 * @Description:数据过滤去重
 * @Author:Eirice
 * @Date: 2025-06-07 17:47:24
 */
const handleFilterListInfo = (data) => {
  // 使用 Map 来存储唯一的点位，以 lng,lat 作为键
  const uniquePoints = new Map();
  // 处理重复点位
  data.forEach(item => {
    const key = `${item.lng},${item.lat}`;
    if (!uniquePoints.has(key)) {
      uniquePoints.set(key, item);
    } else {
      // 如果已存在，且当前项是收费站，则跳过
      if (item.grantry_type === '收费站') {
        return;
      }
      // 如果已存在项是收费站，则替换为当前项
      const existingItem = uniquePoints.get(key);
      if (existingItem.grantry_type === '收费站') {
        uniquePoints.set(key, item);
      }
    }
  });
  // 转换为数组并排序
  const sortedPoints = Array.from(uniquePoints.values())
    .sort((a, b) => {
      // 优先使用seq字段排序
      const seqA = a.seq || a.seq_id || 0;
      const seqB = b.seq || b.seq_id || 0;
      return seqA - seqB;
    });
  list.value = sortedPoints
}
/**
 * @Description:根据查询到的车辆信息获取车辆通行信息
 * @Author:Eirice
 * @Date: 2025-05-30 14:06:57
 */
const getCarTimeLine = (info) => {
  let tep = info[0]
  if (tep) {
    let cadn = {
      condition: [
        { colName: "passid", value: tep.passid, ruleType: "eq" },
        { colName: "enid", value: tep.enpointid, ruleType: "eq" },
        { colName: "exid", value: tep.expointid, ruleType: "eq" },
        { colName: "vtype", value: 1, ruleType: "eq" }
      ],
      divCond: [{ colName: "transtime", ruleType: "between", value: [tep.entime, tep.extime] }]
    }
    orderUtil.getCarPathInfoById(cadn).then(res => {
      if (res.data.state !== 'SUCCESS') return;
      list.value = res.data.data

    }).catch(err => { })
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
    getTrafficFlow(passId);
    getPointByLocation()
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