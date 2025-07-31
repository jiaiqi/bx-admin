<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { MessageBox } from 'element-ui'
import { $http } from '@/common/http'
import cloneDeep from 'lodash/cloneDeep'
import { useUtils } from "@/common/vueApi";

// 组件属性定义
const props = defineProps({
  mapJson: {
    type: Object,
    default: () => ({}),
  },
  markerList: {
    type: Array,
    default: () => [],
  },
  sourceJson: {
    type: Array,
    default: () => [],
  },
  mapData: {
    type: Object,
    default: () => ({}),
  },
  pageParamsModel: {
    type: Object,
    default: () => ({})
  },
})

// 事件定义
const emit = defineEmits(['update:markerList'])

// 响应式数据
const markers = ref([])
const loading = ref(false)
const error = ref(null)

// // 计算属性：获取多源POI配置
const sourceJson = computed(() => {
  return props.sourceJson
  // return props.mapJson?.multi_src_poi_json || []
})


const { renderStr } = useUtils()

/**
 * 获取标记点数据
 * @param {Object} params - 请求参数
 * @param {Object} params.srv_req_json - 服务请求配置
 * @param {string} params.poi_name - POI名称
 * @param {string} params.poi_type - POI类型
 * @param {Object} params.col_map - 列映射配置
 */
async function getMarkers(params = {}) {
  let { srv_req_json: p, poi_name, poi_type, col_map } = params
  if (params.srv_req_info) {
    // 配置变动,srv_req_json改为从srv_req_info中获取
    p = params.srv_req_info.srv_req_json
  } else {
    console.warn('获取标记点数据：缺少必要的服务配置参数', params)
    return
  }


  // 参数验证
  if (!p || !p.mapp || !p.serviceName) {
    console.warn('获取标记点数据：缺少必要的服务配置参数', params)
    return
  }

  const reqInfo = params.srv_req_info
  const {
    map_filter_poi_col: filterCol, // condition中的colName
    map_filter_poi_rule: ruleType, // 比较规则
    poi_refer_map_filter_col: dataCol // 数据中对应的字段
  } = reqInfo;

  if (filterCol && ruleType && dataCol && props.mapData[dataCol]) {
    const obj = {
      colName: filterCol,
      value: props.mapData[dataCol],
      ruleType: ruleType === '等于' ? 'eq' : 'like]'
    }
    if (p.condition) {
      p.condition.push(obj)
    } else {
      p.condition = [obj]
    }
  }
  let pageParamsModel = cloneDeep(props.pageParamsModel)
  
  if(pageParamsModel && typeof pageParamsModel === 'object'){
    for(let key in pageParamsModel){
      if(pageParamsModel[key]?.value){
        pageParamsModel[key] = pageParamsModel[key].value
      }
    }
  }

  if (p.condition?.length) {
    const globalParams = {
      ...pageParamsModel || {},
      ...props.mapData || {}
    }
    const conditions = cloneDeep(p.condition)
    const conds = []
    for (let cond of conditions) {
      let condModel = cloneDeep(cond)
      if (cond && condModel.value && condModel.value.indexOf('${') !== -1 && condModel.value.indexOf('}') !== -
        1 && params) {
        if (renderStr(condModel.value, globalParams) && renderStr(condModel.value, globalParams).indexOf('[object') == -1) {
          condModel.value = renderStr(condModel.value, globalParams)
        } else {
          let key = condModel.value
          var sreg = new RegExp("\\${", "g"); // 加'g'，删除字符串里所有的"a"
          var ereg = new RegExp("\}", "g"); // 加'g'，删除字符串里所有的"a"
          key = key.replace(sreg, "");
          key = key.replace(ereg, "");
          console.log('--srvReq', params, key)
          condModel.value = params && params.hasOwnProperty(key) ? params[key] : ""
          if (condModel.value?.value) {
            condModel.value = condModel.value.value
          }
        }
      }
      conds.push(cloneDeep(condModel))
      debugger
    }
    p.condition = conds
  }
  try {
    const url = `/${p.mapp}/select/${p.serviceName}`
    const res = await $http.post(url, p)

    if (res?.data?.state === 'SUCCESS') {
      const data = res.data.data

      // 数据验证
      if (!Array.isArray(data)) {
        console.warn('获取标记点数据：返回数据格式不正确', data)
        return
      }

      // 处理数据，添加POI信息和列映射
      const list = data.map(item => ({
        ...item,
        _poi_info: {
          poi_name,
          poi_type,
          ...params
        },
        _col_map: col_map || {}
      }))

      // 添加到标记点列表
      markers.value.push(...list)

    } else {
      const errorMsg = res?.data?.resultMessage || '获取标记点数据失败'
      console.error('获取标记点数据失败：', errorMsg)
      MessageBox.error(errorMsg)
      error.value = errorMsg
    }
  } catch (err) {
    const errorMsg = `获取标记点数据异常：${err.message}`
    console.error(errorMsg, err)
    MessageBox.error(errorMsg)
    error.value = errorMsg
  }
}

/**
 * 批量获取所有数据源的标记点（顺序执行）
 */
async function fetchAllMarkers() {
  if (!sourceJson.value.length) {
    markers.value = []
    return
  }

  loading.value = true
  error.value = null
  markers.value = []

  let successCount = 0
  let failedCount = 0

  try {
    // 顺序执行每个请求
    for (let i = 0; i < sourceJson.value.length; i++) {
      try {
        await getMarkers(sourceJson.value[i])
        successCount++
      } catch (err) {
        failedCount++
        console.error(`数据源 ${i} 请求失败：`, err)
      }
    }

    if (failedCount > 0) {
      console.warn(`${failedCount} 个数据源请求失败，${successCount} 个成功`)
    }

  } catch (err) {
    console.error('批量获取标记点数据失败：', err)
  } finally {
    loading.value = false
  }
}

// 监听数据源配置变化
watch(
  () => sourceJson.value,
  async (newVal, oldVal) => {
    if (JSON.stringify(newVal) !== JSON.stringify(oldVal)) {
      await nextTick()
      await fetchAllMarkers()
    }
  },
  {
    immediate: true,
    deep: true
  }
)

// 监听标记点数据变化，向父组件发送更新事件
watch(
  () => markers.value,
  (newVal) => {
    emit('update:markerList', newVal || [])
  },
  {
    deep: true,
    immediate: true
  }
)

// 暴露给父组件的方法
defineExpose({
  fetchAllMarkers,
  markers,
  loading,
  error
})
</script>

<template>
  <div class="multi-source-markers">
    <!-- 加载状态指示器 -->
    <div
      v-if="loading"
      class="loading-indicator"
    >
      <i class="el-icon-loading"></i>
      <span>正在加载标记点数据...</span>
    </div>

    <!-- 错误信息显示 -->
    <div
      v-if="error && !loading"
      class="error-message"
    >
      <i class="el-icon-warning"></i>
      <span>{{ error }}</span>
    </div>

    <!-- 数据统计信息 -->
    <div
      v-if="!loading && !error"
      class="marker-stats"
    >
      <span>已加载 {{ markers.length }} 个标记点</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.multi-source-markers {
  .loading-indicator {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px;
    color: #409eff;
    font-size: 14px;

    i {
      font-size: 16px;
    }
  }

  .error-message {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px;
    color: #f56c6c;
    font-size: 14px;
    background-color: #fef0f0;
    border: 1px solid #fbc4c4;
    border-radius: 4px;

    i {
      font-size: 16px;
    }
  }

  .marker-stats {
    padding: 8px 12px;
    font-size: 12px;
    color: #909399;
    background-color: #f5f7fa;
    border-radius: 4px;
  }
}
</style>