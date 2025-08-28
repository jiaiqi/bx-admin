<template>
  <div>
    <el-dialog
      class="customDialogClass"
      title="添加"
      width="90%"
      :close-on-click-modal="1 == 2"
      :visible="activeForm == 'booking'"
      @close="activeForm = 'xx'"
      append-to-body
    >
      <booking-page
        :defaultApplication="defaultApplication"
        :row-data="rowData"
        :defaultValues="defaultValues"
        @cancel="activeForm = 'xx'"
        @refresh="onActionComplete"
        v-if="activeForm == 'booking'"
      ></booking-page>
    </el-dialog>
    <el-dialog
      class="customDialogClass"
      :title="getActiveFormName || '添加'"
      width="90%"
      :close-on-click-modal="1 == 2"
      :visible="activeForm == 'add'"
      @close="activeForm = 'xx'"
      append-to-body
    >
      <!-- <simple-add name="add" ref="add-form" v-if="activeForm == 'add'" :service="service" :default-conditions="defaultConditions" :mainformDatas='listMainFormDatas' :default-condition="defaultCondition"  :childForeignkey='childForeignkey'  :default-values="defaultValues" @action-complete="onActionComplete($event)">
      </simple-add>  -->
      <add
        name="list-duplicatedeep"
        ref="duplicatedeep-form"
        v-if="activeForm == 'add'"
        :service="service"
        :default-conditions="defaultConditions"
        :pageIsDraft="activeTabName"
        :defaultValues="defaultValues"
        :parentMainFormDatas="listMainFormDatas"
        @action-complete="onActionComplete($event)"
        @form-loaded="onFormLoaded"
        :serviceViewName.sync="serviceViewName"
      >
      </add>

      <!-- <add name="list-duplicatedeep" ref="duplicatedeep-form"
           v-if="activeForm == 'add'" :service="service"
           :default-conditions="defaultConditions"
           :submit2-db="storageType == 'db'"
           :haveDraft="false"
           :defaultValues="defaultValues"
           @action-complete="onActionComplete($event)"
           @form-loaded="onDuplicateFormLoaded"
           @submitted2mem="onAdd2MemSubmitted">
      </add> -->
      <!-- <add name="list-duplicatedeep" ref="duplicatedeep-form"
           v-if="activeForm == 'duplicatedeep'" :service="service"
           :default-conditions="defaultConditions"
           :submit2-db="storageType == 'db'"
           :parentPageType="listType"
           :haveDraft="isDraft"
           :pageName="'list-duplicatedeep'"
           :pageIsDraft="activeTabName"
           :defaultValues="defaultValues"
           @action-complete="onActionComplete($event)"
           @form-loaded="onDuplicateFormLoaded"
           @submitted2mem="onAdd2MemSubmitted">
      </add> -->
    </el-dialog>

    <el-dialog
      class="customDialogClass"
      :title="getActiveFormName || '编辑'"
      width="90%"
      :close-on-click-modal="1 == 2"
      :visible="activeForm == 'update'"
      @close="onCloseEvent()"
      append-to-body
    >
      <update
        name="list-update"
        ref="update-form"
        v-if="activeForm == 'update'"
        :init-load="initLoad"
        :pk="pk"
        :pkCol="pkCol"
        :service="service"
        :defaultValues="defaultValues"
        :defaultConditions="defaultConditions"
        :parentPageType="'list'"
        @form-loaded="onFormLoaded"
        @action-complete="onActionComplete"
        :serviceViewName.sync="serviceViewName"
      >
      </update>
      <!-- <simple-update name="update" :appNo="customSrvApp" :init-load="initLoad" ref="update-form" v-if="activeForm == 'update'" :service="service" :default-conditions="defaultConditions" :default-values="defaultValues" @action-complete="activeForm = null">
      </simple-update> -->
    </el-dialog>

    <el-dialog
      class="customDialogClass"
      :title="getActiveFormName || '详情'"
      width="90%"
      :close-on-click-modal="1 == 2"
      :visible="activeForm == 'detail'"
      @close="activeForm = 'xx'"
      append-to-body
    >
      <simple-detail
        name="detail"
        ref="detail-form"
        v-if="activeForm == 'detail'"
        :service="service"
        :default-conditions="defaultConditions"
        :default-values="defaultValues"
        :serviceViewName.sync="serviceViewName"
      >
      </simple-detail>
    </el-dialog>

    <el-dialog
      class="customDialogClass"
      title="列表"
      width="90%"
      :close-on-click-modal="1 == 2"
      :visible="activeForm == 'list'"
      @close="activeForm = 'xx'"
      append-to-body
    >
      <list
        name="list"
        ref="list"
        v-if="activeForm == 'list'"
        :service="service"
        :default-condition="defaultConditions"
        list-type="list"
        :serviceViewName.sync="serviceViewName"
      >
      </list>
    </el-dialog>

    <el-dialog
      class="customDialogClass"
      title="列表"
      width="90%"
      :close-on-click-modal="1 == 2"
      :visible="activeForm == 'treegrid'"
      @close="activeForm = 'xx'"
      append-to-body
    >
      <treegrid
        name="treegrid"
        ref="treegrid"
        v-if="activeForm == 'treegrid'"
        :service="service"
        :default-condition="defaultConditions"
        :serviceViewName.sync="serviceViewName"
      >
      </treegrid>
    </el-dialog>

    <el-dialog
      class="customDialogClass"
      title="编辑列表"
      width="90%"
      :close-on-click-modal="1 == 2"
      :visible="activeForm == 'editgrid'"
      @close="activeForm = 'xx'"
      append-to-body
    >
      <edit-grid
        name="editgrid"
        ref="editgrid"
        v-if="activeForm == 'editgrid'"
        :service="service"
        :buttonInfo="buttonInfo"
        :serviceViewName.sync="serviceViewName"
      >
      </edit-grid>
    </el-dialog>

    <el-dialog
      class="customDialogClass"
      title="选择填充列表"
      width="90%"
      :close-on-click-modal="1 == 2"
      :visible="activeForm == 'select_fill_grid'"
      @close="activeForm = 'xx'"
      append-to-body
    >
      <!-- 已弃用 -->
      <select-fill-grid
        v-if="activeForm == 'select_fill_grid'"
        @closeDialog="closeDialog"
        :gridData="gridData"
        :_service="_service"
        :buttonInfo="buttonInfo"
        :serviceViewName.sync="serviceViewName"
      >
      </select-fill-grid>
    </el-dialog>

    <el-dialog
      class="customDialogClass"
      title="批量选择操作"
      width="90%"
      :close-on-click-modal="1 == 2"
      :visible="activeForm == 'batch-edit-grid'"
      @close="activeForm = 'xx'"
      append-to-body
    >
      <batchEditGrid
        v-if="activeForm == 'batch-edit-grid' && batchInitConfig"
        @closeDialog="closeDialog"
        :mainData="listMainFormDatas"
        :initSelectedDatas="batchInitConfig"
        :buttonInfo="buttonInfo"
        :serviceViewName.sync="serviceViewName"
      >
      </batchEditGrid>
    </el-dialog>

    <!--列表加form操作-->
    <el-dialog
      class="customDialogClass"
      title="列表"
      width="90%"
      :close-on-click-modal="1 == 2"
      :visible="activeForm == 'list_update'"
      @close="activeForm = 'xx'"
      append-to-body
    >
      <simple-update
        name="list-update-form"
        ref="list-update-form"
        :init-load="1 == 2"
        v-if="activeForm == 'list_update'"
        :service="service"
        :default-conditions="defaultConditions"
        :default-values="defaultValues"
        @action-complete="onActionComplete"
        @form-loaded="onFormLoaded"
        :serviceViewName.sync="serviceViewName"
      >
      </simple-update>

      <list
        name="list"
        :read-only="1 == 1"
        ref="list"
        v-if="activeForm == 'list_update'"
        :service="selectService"
        :default-condition="defaultConditions"
        list-type="list"
      >
      </list>
    </el-dialog>

    <!--选择添加列表-->
    <el-dialog
      class="customDialogClass"
      title="添加列表"
      width="90%"
      :close-on-click-modal="1 == 2"
      :visible="activeForm == 'selectlist'"
      @close="activeForm = 'xx'"
      append-to-body
    >
      <list
        name="selectlist"
        ref="selectlist"
        v-if="activeForm == 'selectlist'"
        :service="service"
        :mapcondition="mapcondition"
        :default-condition="defaultConditions"
        list-type="addselectlist"
        @action-complete="onListRefresh"
      >
      </list>
    </el-dialog>
  </div>
</template>

<script>
import ExecutorMixin from "../mixin/executor-minx";
import Executor from "./executor.vue";
import SimpleAdd from "./simple-add.vue";
import add from "./add.vue";
import SimpleDetail from "./simple-detail.vue";
import SimpleUpdate from "./simple-update.vue";
import update from "./update.vue";
import List from "./list.vue";
import Treegrid from "./treegrid.vue";
import EditGrid from "./edit-grid.vue";
import SelectFillGrid from "./select-fill-grid.vue";
import batchEditGrid from "./batch-edit-grid.vue";
import bookingPage from "../../pages/xx/booking.vue"; //西乡预约页面

export default {
  components: {
    SelectFillGrid,
    EditGrid,
    Treegrid,
    List,
    SimpleUpdate,
    SimpleDetail,
    SimpleAdd,
    Executor,
    add,
    update,
    batchEditGrid,
    bookingPage,
  },
  provide() {
    return {
      preventNav: false, //阻止默认的跳转行为
      isLastStep: () => true,
      inStep: false
    };
  },
  mixins: [ExecutorMixin],

  props: {
    initLoad: true,
    callback: Function,
    buttonInfo: {},
    rowData: Object,
  },
  computed: {
    getActiveFormName() {
      let pages_attribute = sessionStorage.getItem('pages_attribute')
      if (pages_attribute && typeof pages_attribute === 'string') {
        try {
          pages_attribute = JSON.parse(pages_attribute)
        } catch (error) {
        }
        if (pages_attribute['使用服务名作为弹窗标题'] === '是') {
          return this.serviceViewName
        }
      }
    },
    customSrvApp: function () {
      let app = localStorage.getItem("activeApp");
      if (this.buttonInfo && this.buttonInfo.application) {
        app = this.buttonInfo.application;
      }
      if (this.$srvApp) {
        app = this.$srvApp;
      }

      return app;
    },
    pk: function () {
      let cond = this.defaultConditions;
      let pk = "";
      if (this.defaultConditions.length > 0) {
        pk = this.defaultConditions[0].value;
      }
      return pk;
    },
    pkCol: function () {
      let cond = this.defaultConditions;
      let pk = "";
      if (this.defaultConditions.length > 0) {
        pk = this.defaultConditions[0].colName;
      }
      return pk;
    },
  },
  data() {
    return {
      activeForm: null,
      defaultApplication: "",
      service: null,
      selectService: null,
      defaultConditions: [],
      defaultValues: null,
      mapcondition: {},
      childForeignkey: null,
      defaultCondition: null,
      listMainFormDatas: null,
      batchInitConfig: null,
      serviceViewName: null,
    };
  },

  mounted: function () {
    //console.log("dialog props srvapp",this.srvApp)
  },

  methods: {
    closeDialog() {
      this.activeForm = "xx";
    },
    onFormLoaded(formVm) {
      var me = this;
      const serviceViewName = formVm?.getBasicForm()?.formV2?.service_view_name
      this.serviceViewName = serviceViewName
      let form = this.$refs["list-update-form"];
      if (!form?.srvCols) {
        return
      }
      var srv_cols = form.srvCols;
      for (var field of srv_cols) {
        if (!field.batch_col) {
          if (form.fields[field.table_column] != undefined) {
            form.fields[field.table_column].info.visible = false;
          }
        }
      }
    },
    onCloseEvent() {
      if (this.buttonInfo != undefined && this.buttonInfo != null) {
        var suffix_actions = this.buttonInfo.suffix_actions;

        if (suffix_actions == "refresh") {
          window.location.reload();
        }
      }
      this.activeForm = "xx";
    },
    onListRefresh() {
      this.$emit("list-loaded", this);

      // this.activeForm=null;
    },
    onActionComplete(e) {
      if (e !== "reset") {
        this.activeForm = "xx";
      }
      //console.log("onActionComplete",e)
      if (e === "save_draft" || e === "submit") {
        if (this.callback && typeof this.callback === "function") {
          // 调用弹窗的地方传进来的回调函数，如果有传，则弹窗操作完成后调用此函数触发回调，通知组件操作完成
          this.callback(e);
        } else {
          window.location.reload();
        }
      }
      this.$emit('popup-action-complete', e);
    },
  },
};
</script>

<style scoped>
.bx_action {
  margin-left: 3px;
  margin-right: 3px;
}
</style>