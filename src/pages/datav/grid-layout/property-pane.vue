<template>
  <div class="">
    <el-tabs type="border-card" v-loading="pageLoading" v-model="activeTab">
      <el-tab-pane label="页面" name="页面">
        <div class="tab-content">
          <simple-update name="list-update" :defaultValues="pageConfg" :navAfterSubmit="false" :service="pageService"
            :pk="pageId" pkCol="id" @action-complete="onPageUpdate" @form-loaded="pageLoading = false" v-if="pageId">
          </simple-update>

        </div>
      </el-tab-pane>
      <el-tab-pane label="组件" name="组件" v-if="currentItem">
        <simple-update name="list-update" :service="componentService" :navAfterSubmit="false" :pk="componentId" pkCol="id"
          @action-complete="onComponentUpdate" @form-loaded="componentLoading = false" v-loading="componentLoading"
          v-if="componentId">
        </simple-update>
        <!-- <simple-add ref="duplicate-form" :pageName="'list-duplicate'" :service="componentService"
          :defaultValues="activeData" :parentMainFormDatas="listMainFormDatas" @action-complete="" @form-loaded=""
          @submitted2mem="" v-else>
        </simple-add> -->
      </el-tab-pane>

      <el-tab-pane label="布局" name="布局">
        <div style="padding: 20px;height: 100%; display: flex;justify-content: center;align-items: flex-end;">
          <el-button size="mini" type="primary" style=" margin-right: 10px;" @click="clickSave">保存</el-button>
          <el-button size="mini" type="primary" style=" margin: 10px 10px 0 0"
            @click="toPreview">预览</el-button>
        </div>
      </el-tab-pane>
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
    currentItem: {
      type: Object,
    },
  },
  watch: {
    componentId(newValue, oldValue) {
      if (newValue && !oldValue) {
        this.activeTab = '组件'
      } else if (!newValue && oldValue) {
        this.activeTab = '页面'
      }
      if (newValue && newValue !== oldValue) {
        this.componentLoading = true
        this.layoutLoading = true
      }
    }
  },
  computed: {
    currentComponent() {
      return this.currentItem?.data
    },
    pageId() {
      if (this.pageConfg?.id) {
        return this.pageConfg?.id + ''
      }
    },
    pageService() {
      return `srvpage_cfg_page_update`
    },
    componentId() {
      if (this.currentComponent?.id) {
        return this.currentComponent?.id + ''
      }
    },
    componentService() {
      if (this.currentComponent?.id) {
        // update
        return `srvpage_cfg_page_component_update`
      } else {
        // add
        return `srvpage_cfg_page_component_add`
      }
    },
    layoutId() {
      if (this.currentItem?.id) {
        return this.currentItem?.id + ''
      }
    },
    layoutService() {
      if (this.layoutId) {
        return `srvpage_cfg_layout_update`
      } else {
        return `srvpage_cfg_layout_add`
      }
    },
  },
  data() {
    return {
      pageLoading: true,
      componentLoading: false,
      layoutLoading: false,
      activeTab: '页面'
    }
  },
  methods: {
    clickSave(){
      this.$emit('save')
    },
    toPreview() {
      this.$emit('preview')
    },
    onPageUpdate(event) {
      console.log('onPageUpdate', event);
      this.$emit('refresh', 'page', event)
    },
    onComponentUpdate(event) {
      console.log('onComponentUpdate', event);
      this.$emit('refresh', 'component', event)
    },
    onLayoutUpdate(event) {
      console.log('onLayoutUpdate', event);
    },
    onUpdateFormActionComplete(event) {
      console.log('onUpdateFormActionComplete', event);
    },
    onUpdateFormLoaded(event) {
      this.pageLoading = false
      console.log('onUpdateFormLoaded', event);
    },
  },
}
</script>

<style lang="scss" scoped>
.el-tabs {
  width: 100%;
  height: calc(100vh - 2px);
  padding-bottom: 50px;
  overflow: hidden;
  border: none;
  // .tab-content{
  //   height: 100%;
  //   overflow-y: auto;
  // }
  ::v-deep .el-tab-pane{
    height: 100%;
  }
  ::v-deep .el-tabs--border-card {}

  ::v-deep .el-tabs__content {
    height: 100%;
    overflow-y: auto;
    padding: 0;
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