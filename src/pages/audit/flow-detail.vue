<script setup>
import {useRoute} from '@/common/vueApi.js'
import {$axios as $http} from "@/pages/datav/common/http.js";
import {onMounted, ref,nextTick} from "vue";
import { Loading } from 'element-ui';
import inOutInfo from './components/in-out-info.vue'
import doorFrame from './components/door-frame.vue'
import showPath from './components/show-path.vue'

const route = useRoute()
const {passid, entime:time1, extime:time2} = route?.params || {}

const activeTab = ref('0')
const inData = ref({})
const outData = ref({})
const doorFrameData = ref([])
const pathData = ref([])


const getInData = async () => {
  if(inData.value?.passid) return
  const service = `srvaud_laneentry_select`
  const url = `${window.backendIpAddr}/aud/select/${service}`
  const cond = [
    {"colName": "passid", "ruleType": "eq", "value": passid},
    // {"colName": "lanesignbx", "ruleType": "eq", "value": '出口'},
    {"colName": "createtime", "ruleType": "between", "value": [time1, time2]},
  ]
  const req = {
    "serviceName": service,
    "colNames": ["*"],
    "condition": cond,
    "divCond": cond,
    "page": {"pageNo": 1, "rownumber": 5},
    "order": [],
  }
  const loading = Loading.service({
    lock: true,
    text: 'Loading',
    spinner: 'el-icon-loading',
    background: 'rgba(0, 0, 0, 0.7)'
  });
  setTimeout(() => {
    loading.close();
  }, 6000);
  const res = await $http.post(url, req)
  loading?.close();
  if (res?.data?.data?.length) {
    inData.value = res.data.data[0]
  }
  console.log(res.data)
}

const getOutData = async () => {
  if(inData.value?.passid) return
  const service = `srvaud_laneexit_select`
  const url = `${window.backendIpAddr}/aud/select/${service}`
  const cond = [
    {"colName": "passid", "ruleType": "eq", "value": passid},
    // {"colName": "lanesignbx", "ruleType": "eq", "value": '出口'},
    {"colName": "createtime", "ruleType": "between", "value": [time1, time2]},
  ]
  const req = {
    "serviceName": service,
    "colNames": ["*"],
    "condition": cond,
    "divCond": cond,
    "page": {"pageNo": 1, "rownumber": 5},
    "order": [],
  }
  const loading = Loading.service({
    lock: true,
    text: 'Loading',
    spinner: 'el-icon-loading',
    background: 'rgba(0, 0, 0, 0.7)'
  });
  setTimeout(() => {
    loading.close();
  }, 6000);
  const res = await $http.post(url, req)
  loading?.close();
  if (res?.data?.data?.length) {
    outData.value = res.data.data[0]
  }
  console.log(res.data)
}

const getDoorFrameData = async () => {
  const service = `srvaud_susvehpasspath_select`
  const url = `${window.backendIpAddr}/aud/select/${service}`
  const cond = [
    {
      "colName": "passid",
      "ruleType": "eq",
      "value": passid
    }, {
      "colName": "path_type",
      "ruleType": "eq",
      "value": '行驶路径'
    }, {
      "colName": "datatype",
      "ruleType": "eq",
      "value": '3'
    },
    {"colName": "transtime", "ruleType": "between", "value": [time1, time2]}]
  const req = {
    "serviceName": service,
    "colNames": ["*"],
    "condition": cond,
    "divCond": cond
  }
  const loading = Loading.service({
    lock: true,
    text: 'Loading',
    spinner: 'el-icon-loading',
    background: 'rgba(0, 0, 0, 0.7)'
  });
  setTimeout(() => {
    loading.close();
  }, 6000);
  const res = await $http.post(url, req)
  loading?.close();
  if (res?.data?.data?.length) {
    doorFrameData.value = res.data.data
  }
  console.log(res.data)
}

const getPathData = async () => {
  const service = `srvaud_susvehpasspath_select`
  const url = `${window.backendIpAddr}/aud/select/${service}`
  const cond = [
    {
      "colName": "passid",
      "ruleType": "eq",
      "value": passid
    },
    // {"colName": "path_type", "ruleType": "eq", "value": '行驶路径'},
    {"colName": "transtime", "ruleType": "between", "value": [time1, time2]}

  ]
  const req = {
    "serviceName": service,
    "colNames": ["*"],
    "condition": cond,
    "divCond": cond
  }
  const loading = Loading.service({
    lock: true,
    text: 'Loading',
    spinner: 'el-icon-loading',
    background: 'rgba(0, 0, 0, 0.7)'
  });
  setTimeout(() => {
    loading.close();
  }, 6000);
  const res = await $http.post(url, req)
  loading?.close();
  if (res?.data?.data?.length) {
    pathData.value = res.data.data
  }
  console.log(res.data)

}


onMounted(() => {
  getInData()
  getOutData()
  getPathData()
})

const handleClick = (tab, event) => {
  console.log(tab.index)
  if (activeTab.value !== tab.index) {
    activeTab.value = tab.index
    switch (tab.index) {
      case '0':
        getInData()
        getOutData()
        break
      case '1':
        getDoorFrameData()
        break
      case '2':
        getPathData()
        break
    }
  }
}
</script>

<template>
  <div class="flow-detail">
    <el-tabs type="border-card" class="el-tabs" @tab-click="handleClick">
      <el-tab-pane label="入出口信息">
        <in-out-info :in-data="inData" :out-data="outData"></in-out-info>
      </el-tab-pane>
      <el-tab-pane label="门架信息">
        <door-frame :data="doorFrameData"></door-frame>
      </el-tab-pane>
      <el-tab-pane label="路径展示" style="padding: 0">
        <show-path :data="pathData" v-if="activeTab==='2'"></show-path>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<style scoped lang="scss">
.flow-detail {
  //padding: 20px;
  height: 100%;
  ::v-deep .el-tabs__content{
    padding: 0;
  }
}

.el-tabs {
  min-height: 100%;
}

</style>