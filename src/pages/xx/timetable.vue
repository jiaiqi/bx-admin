<template>
  <div>
    <!-- <simple-filter v-if="srv_cols" :srv_cols="srv_cols" :supportGroup="false" v-on:search-clicked="query"
      ref="filter-form">
    </simple-filter> -->
    <time-table :srv_cols="srv_cols" :searchFormCondition="searchFormCondition" :v2Data="v2Data"></time-table>
  </div>
</template>

<script>
import simpleFilter from "@/components/common/simple-filter.vue";
import timeTable from './components/TimeTable'

export default {
  name: "timeTablePage",
  components: {
    simpleFilter, timeTable
  },
  data() {
    return {
      srv_cols: null,
      searchFormCondition: null,
      v2Data:null
    }
  },
  methods: {
    query(condtion) {
      this.searchFormCondition = condtion;
      this.loadData();
    },
    getV2(){
      this.loadColsV2('srvledu_course_schedue_select', 'list')
        .then(response => {
          let respData = response.body.data;
          this.srv_cols = respData.srv_cols
          this.v2Data = respData
        })
    },
    loadData() {

    }
  },
  created(){
    this.getV2()

  }
}
</script>

<style lang="scss" scoped></style>