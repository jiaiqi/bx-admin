<script setup>
import {useRoute} from '@/common/vueApi.js'
// import {$axios as $http} from "@/pages/datav/common/http.js";
import { $http } from '@/common/http';
import {onMounted, ref, nextTick} from "vue";
import {Loading, Message} from 'element-ui';
import inOutInfo from './components/in-out-info.vue'
import doorFrame from './components/door-frame.vue'
import showPath from './components/show-path.vue'

const route = useRoute()
let {passid, entime: entime, extime: extime} = route?.params || {}
console.log(passid, 88888888)
if (route?.query?.entime && route?.query?.extime) {
  entime = route?.query?.entime
  extime = route?.query?.extime
}

const activeTab = ref('0')
const inData = ref({})
const outData = ref({})
const doorFrameData = ref([])
const pathData = ref([])


const getInData = async () => {
  if (inData.value?.passid) return
  const service = `srvaud_laneentry_select`
  const url = `${window.backendIpAddr}/aud/select/${service}`
  const cond = [
    {"colName": "passid", "ruleType": "eq", "value": passid},
    // {"colName": "lanesignbx", "ruleType": "eq", "value": '出口'},
    {"colName": "createtime", "ruleType": "between", "value": [entime, extime]},
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
  } else if (res?.data?.state === 'SUCCESS') {
    Message.error('未查到入口数据')
  } else if (res?.data?.resultMessage) {
    Message.error(res?.data?.resultMessage)
  }
  console.log(res.data)
}

const getOutData = async () => {
  if (inData.value?.passid) return
  const service = `srvaud_laneexit_select`
  const url = `${window.backendIpAddr}/aud/select/${service}`
  const cond = [
    {"colName": "passid", "ruleType": "eq", "value": passid},
    // {"colName": "lanesignbx", "ruleType": "eq", "value": '出口'},
    {"colName": "createtime", "ruleType": "between", "value": [entime, extime]},
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
  } else if (res?.data?.state === 'SUCCESS') {
    Message.error('未查到出口数据')
  } else if (res?.data?.resultMessage) {
    Message.error(res?.data?.resultMessage)
  }
  console.log(res.data)
}

const getDoorFrameData = async () => {
  const service = `srvaud_susvehpasspath_select`
  // const service = `srvaud_susvehpasspath_select`
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
    },
    {
      'colName': 'grantry_type',
      "ruleType": "in",
      "value": '路段门架,收费站'
    },
    // {
    //   "colName": "datatype",
    //   "ruleType": "eq",
    //   "value": '3'
    // },
    {"colName": "transtime", "ruleType": "between", "value": [entime, extime]}]
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
  } else if (res?.data?.state === 'SUCCESS') {
    Message.error('未查到门架数据')
  } else if (res?.data?.resultMessage) {
    Message.error(res?.data?.resultMessage)
  }
  console.log(res.data)
}

const getPathData = async () => {
  // 获取途径点
  let operateParams = route?.query?.operate_params;
  if(operateParams){
    try {
      operateParams = JSON.parse(operateParams);
    } catch (error) {
      
    }
  }
  const service = operateParams?.serviceName || `srvaud_susvehpasspath_select`
  const url = `${window.backendIpAddr}/aud/select/${service}`
  let divCond = [
    // {
    //   "colName": "passid",
    //   "ruleType": "eq",
    //   "value": passid
    // },
    // {"colName": "path_type", "ruleType": "eq", "value": '行驶路径'},
    {"colName": "transtime", "ruleType": "between", "value": [entime, extime]}

  ]
  let cond = [...divCond]
  if(operateParams?.condition?.length){
    cond = [...operateParams.condition]
  }
  const req = {
    "serviceName": service,
    "colNames": ["*"],
    "condition": cond,
    "divCond": divCond
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
  } else if (res?.data?.state === 'SUCCESS') {
    Message.error('未查到路径数据')
  } else if (res?.data?.resultMessage) {
    Message.error(res?.data?.resultMessage)
  }
  console.log(res.data)

}


onMounted(() => {
  // getInData()
  // getOutData()
  getDoorFrameData()
  getPathData()
})

const handleClick = (tab, event) => {
  console.log(tab.index)
  if (activeTab.value !== tab.index) {
    activeTab.value = tab.index
    switch (tab.index) {
      case '0':
        // getInData()
        // getOutData()
        //   break
        // case '1':
        getDoorFrameData()
        break
      case '1':
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
<!--        <in-out-info :in-data="inData" :out-data="outData"></in-out-info>-->
        <door-frame :data="doorFrameData"></door-frame>
      </el-tab-pane>
      <!--      <el-tab-pane label="门架信息">-->
      <!--        <door-frame :data="doorFrameData"></door-frame>-->
      <!--      </el-tab-pane>-->
      <el-tab-pane label="路径展示" style="padding: 0">
        <show-path :data="pathData" v-if="activeTab==='1'"></show-path>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<style scoped lang="scss">
.flow-detail {
  //padding: 20px;
  height: 100%;

  ::v-deep .el-tabs__content {
    padding: 0;
  }
}

.el-tabs {
  min-height: 100%;
}

</style>