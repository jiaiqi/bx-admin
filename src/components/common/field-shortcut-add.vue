/* */
<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <div style="display: flex; align-items: center;margin-left: 10px;margin-top: 5px">
    <el-button
      type="primary"
      size="small"
      v-if="fieldActionOptions"
      @click="onAction"
    >{{ fieldActionOptions.col_btn_json.btn_name }}
    </el-button
    >
    <el-dialog
      title="添加"
      width="90%"
      :close-on-click-modal="1 == 2"
      append-to-body
      :visible="activeForm == 'add'"
      @close="activeForm = 'xx'"
    >
      <fieldOptionsAdd
        name="add"
        ref="add-form"
        :$srvApp="getSrvApp"
        v-if="activeForm == 'add'"
        :service="serviceName"
        :submit2-db="true"
        @action-complete="onAddFormActionComplete($event)"
        @form-loaded="onAddFormLoaded"
      >
      </fieldOptionsAdd>
      <!-- <add name="add" :mainService="mainService" ref="add-form" v-if="activeForm == 'add'" :service="getAddService"
        :submit2-db="storageType == 'db'" :defaultCondition='defaultCondition' :form-model-decorator="formModelDecorator"
         :haveDraft="isDraft" :pageIsDraft="activeTabName"
        :childForeignkey="childForeignkey" :parentPageType="listType" :parentMainFormDatas="listMainFormDatas"
        @action-complete="onAddFormActionComplete($event)" @form-loaded="onAddFormLoaded"
        @submitted2mem="onAdd2MemSubmitted">
      </add> -->
      <!-- :defaultValues="listMainFormDatas" -->
    </el-dialog>
    <el-dialog
      title="列表"
      width="90%"
      :close-on-click-modal="1 == 2"
      append-to-body
      :visible="activeForm == 'list'"
      @close="activeForm = 'xx'"
    >
      <!-- <add name="add" :mainService="mainService" ref="add-form" v-if="activeForm == 'add'" :service="getAddService"
        :submit2-db="storageType == 'db'" :defaultCondition='defaultCondition' :form-model-decorator="formModelDecorator"
         :haveDraft="isDraft" :pageIsDraft="activeTabName"
        :childForeignkey="childForeignkey" :parentPageType="listType" :parentMainFormDatas="listMainFormDatas"
        @action-complete="onAddFormActionComplete($event)" @form-loaded="onAddFormLoaded"
        @submitted2mem="onAdd2MemSubmitted">
      </add> -->
      <!-- :defaultValues="listMainFormDatas" -->
      <fieldOptionsList
        v-if="activeForm == 'list'"

        :service="cfg.btn_srv_name"
        ref="popup"
        :$srvApp="getSrvApp"
        listType="list"
      >
      </fieldOptionsList>
    </el-dialog>
  </div>
</template>

<script>
// import RawFieldEditor from "./raw-field-editor.vue";

// import fieldOptionsAdd from "./add.vue";
export default {
  // 字段右侧快捷按钮
  name: "field-shortcut-button",
  components: {
    fieldOptionsAdd: () => import("../common/add.vue"),
    fieldOptionsList: () => import("../common/list.vue"),
  },

  props: {
    formModel: Object,
    field:Object,
    fieldActionOptions: {
      type: Object,
      default() {
        return null;
      },
    },
  },

  data() {
    return {
      activeForm: "x",
      html: null,
      title: "帮助",
    };
  },

  computed: {
    srvtype() {
      return this.cfg?.btn_srv_type === 'select' ? 'list' : 'add'
    },
    getSrvApp() {
      return this.btnSrvReq?.mapp || this.cfg?.btn_srv_app || sessionStorage.getItem("current_app") || null
    },
    cfg() {
      return this.fieldActionOptions?.col_btn_json || null;
    },
    btnSrvReq() {
      return this.cfg?.btn_srv_req_json || null
    },
    serviceName() {
      if (this.cfg?.btn_type && this.btnSrvReq) {
        return this.btnSrvReq.serviceName
      } else if (this.cfg?.btn_srv_name) {
        return this.cfg.btn_srv_name
      } else {
        return null
      }
    },
  },

  methods: {
    addTabByUrl(url, tab_title) {
      let page = {
        title: tab_title || "新标页签",
        url,
      };
      if (window.top.tab && window.top.tab.addTab) {
        window.top.tab.addTab(page);
      } else {
        let strWindowFeatures =
          "menubar=yes,location=yes,resizable=yes,scrollbars=yes,status=yes";
        let newWindow = window.open(url, "CNN_WindowName", strWindowFeatures);
        newWindow.document.title = tab_title;
      }
    },
    onAction() {
      if (this.cfg?.btn_type && this.btnSrvReq) {
        // 支持配置btn_srv_req_json以及btn_type来判断要打开的页面：目前只支持跳转列表、跳转详情、打开新增弹窗 jiaqi/2024-05-10
        let url = ''
        switch (this.cfg.btn_type) {
          case '详情':
            const condition = this.btnSrvReq?.condition
            const formModel = this.formModel || this.field?.form?.formModel
            if (condition?.length) {
              const value = this.renderStr(condition[0].value, formModel)
              url = `/vpages/#/detail/${this.btnSrvReq.serviceName}/${condition[0].colName}/${value}`
            } else {
              this.$message.error('详情按钮的接口请求必须配置查询条件!')
            }
            break;
          case '列表':
            url = `/vpages/#/list/${this.btnSrvReq.serviceName}?operate_params=${encodeURIComponent(this.renderStr(JSON.stringify(this.btnSrvReq), this.formModel))}`
            break;
          case '新增':
            this.activeForm = 'add';
            break;
          case '编辑':
            break;
        }
        if (url) {
          this.addTabByUrl(url, this.cfg.btn_name)
        }
        return
      }
      this.activeForm = this.srvtype;
    },
    getAddService() {
      let cfg = this.cfg.btn_srv_name || "";
      return cfg;
    },
    onAddFormLoaded: function (form) {
      if (form.actions.submit) {
        form.actions.submit.nav2Location = null;
      }

      this.$emit("add-form-loaded", this.$refs["add-form"]);
    },
    onAddFormActionComplete(action) {
      if (action == "submit" || action == "save_draft") {
        this.activeForm = "x";
      }
    },
  },
};
</script>

<style scoped></style>
