<template>
  <div>
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane :label="item.name" :name="item.name" v-for="item in tabs">
      
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
export default {
  data() {
    return {
      activeName: '',
      tabs: []
    }
  },
  props: {
    pageItem: {
      type: Object
    },
  },
  computed: {
   
  },
  created() {
    if (this.pageItem?.srv_req_type === '模拟数据') {
      this.tabs = this.pageItem.mock_srv_data_json || []
      if(this.tabs.length>0){
        this.activeName = this.tabs[0].name
      }
    }
  }
}
</script>

<style lang="scss" scoped></style>