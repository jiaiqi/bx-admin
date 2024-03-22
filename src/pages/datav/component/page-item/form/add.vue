<script setup>
import simpleAdd from "@/components/common/simple-add.vue";
import {computed, ref} from "vue";

const props = defineProps({
  pageItem: Object
})
const service = computed(()=>{
  return props.pageItem?.srv_req_json?.serviceName
})
const srvApp = computed(()=> {
  return props.pageItem?.srv_req_json?.mapp
})
const srvType = computed(()=> {
  return props.pageItem?.srv_req_json?.srv_type
})
const pageLoading = ref(true) //表单加载中
const afterSubmit = (data) => {
  console.log('afterSubmit:', data)
}
</script>

<template>
  <simple-add :service="service" :$srv-app="srvApp" :navAfterSubmit="false" @executor-complete="afterSubmit"
              @form-loaded="pageLoading = false" v-if="service">
  </simple-add>
</template>

<style scoped lang="scss">

</style>