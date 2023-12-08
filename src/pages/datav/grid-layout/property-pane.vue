<template>
  <div class="">
    <el-tabs type="border-card" v-loading="loading">
      <el-tab-pane label="页面配置">
        <div class="tab-content">

          <simple-update name="list-update" :defaultValues="pageConfg" ref="update-form" :service="getUpdateService"
            :pk="getId" pkCol="id" @action-complete="onUpdateFormActionComplete($event)"
            @form-loaded="onUpdateFormLoaded($refs['update-form'])" @submitted2mem="onUpdate2MemSubmitted" v-if="getId">
          </simple-update>
        </div>
      </el-tab-pane>
      <el-tab-pane label="组件配置">组件配置</el-tab-pane>
      <!-- <el-tab-pane label="组件配置">组件配置</el-tab-pane> -->
    </el-tabs>
  </div>
</template>

<script>
import simpleUpdate from '@/components/common/simple-update.vue'
export default {
  components: {
    simpleUpdate,
  },
  props: {
    pageConfg: {
      type: Object,
    },
  },
  computed: {
    getId() {
      if(this.pageConfg?.id){
        return this.pageConfg?.id +''
      }
    },
    getUpdateService() {
      return `srvpage_cfg_page_update`
    }
  },
  data() {
    return {
      loading: true
    }
  },
  methods: {
    onUpdateFormActionComplete(event) {
      console.log('onUpdateFormActionComplete', event);
    },
    onUpdateFormLoaded(event) {
      this.loading = false
      console.log('onUpdateFormLoaded', event);
    },
    onUpdate2MemSubmitted(event) {
      console.log('onUpdate2MemSubmitted', event);
    }
  },
}
</script>

<style lang="scss" scoped>
.el-tabs {
  width: 100%;
  height: calc(100vh - 2px);
  padding-bottom: 50px;
  overflow: hidden;

  // .tab-content{
  //   height: 100%;
  //   overflow-y: auto;
  // }
  ::v-deep .el-tabs__content {
    height: 100%;
    overflow-y: auto;
  }

  ::v-deep .el-form {
    .el-col {
      width: 100%;
    }
  }

  ::v-deep .el-form-item__label {
    text-align: left !important;
  }

  ::v-deep .el-form-item__content {
    margin-left: 0 !important;
  }
}
</style>