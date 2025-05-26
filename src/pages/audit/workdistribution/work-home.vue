<template>
  <div class="work_main">
    <div class="work_content">
      <MineBaseMap v-if="tabIndex===3"/>
      <OrderForm v-if="tabIndex===1"/>
      <EntranceInformation v-if="tabIndex===2" :list="entranceData"/>
    </div>
    <div class="work_tab">
           <div class="work_tab_cot">
             <div v-for="(item,index) in tabs" :key="item.code" :class="activeIndex===index?'act_tab_row':'tab_row'" @click="setTab(item,index)">
               {{item.title}}
             </div>
           </div>
    </div>
  </div>
</template>
<script setup>
import {ref,onMounted} from 'vue'
import MineBaseMap from "@/pages/audit/workdistribution/map/BaseMap.vue";
import EntranceInformation from "@/pages/audit/workdistribution/entrance/entrance-information.vue";
import OrderForm from "@/pages/audit/workdistribution/workFlow/order-form.vue";
const  tabs=[{title:"工单信息",code:1},{title:"通行信息",code:2},{title:"路径轨迹",code:3}]
import {getEntranceData} from "@/pages/audit/workdistribution/entrance/entrance";

const entranceData=ref([]);
const  activeIndex=ref(0);
const  tabIndex=ref(1);
const setTab=(item,index)=>{
     activeIndex.value=index;
     tabIndex.value=item.code;
}

const getEntranceInfo=()=>{
    entranceData.value=getEntranceData().data
}
onMounted(() => {
  //暂时使用测试tooken
  getEntranceInfo()
  sessionStorage.setItem("bx_auth_ticket",'xabxdzkj-463baea9-8219-4120-8636-2e64f21bc262');
})
</script>
<style scoped lang="scss">
.work_main{
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-between;
  background: #fff;
  box-sizing: border-box;
  padding:3px 5px;
  .work_content{
    width:95.5%;
    height:100%;
    overflow: auto;

  }
  .work_tab{
    width:4%;
    height:100%;
    background: #f2f6f6;
    display: flex;
    justify-content: center;
    align-items: center;
    .work_tab_cot{
      width:100%;
      height:40%;

    }
  }
}
.tab_row{
  margin:0.9375rem auto;
  width:90%;
  padding:2px 4px;
  text-align: center;
  font-size:0.875rem;
  color: #5391ef;
  background: #cccccc;
  cursor:pointer;
  border-radius: 0.1875rem;
}
.act_tab_row{
  margin:0.9375rem auto;
  width:90%;
  padding:2px 4px;
  text-align: center;
  font-size:0.875rem;
  color: #fff;
  background:#5391ef;
  cursor:pointer;
  border-radius: 0.1875rem;
}
</style>