/* */
<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <div style="display: flex; align-items: center;margin-left: 10px;">
    <el-button
      type="primary"
      size="small"
      v-if="fieldActionOptions"
      @click="onAction"
      >{{ fieldActionOptions.col_btn_json.btn_name }}</el-button
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
        :service="cfg.btn_srv_name"
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
  name: "shortcut-add",

  components: {
    fieldOptionsAdd: () => import("../common/add.vue"),
    fieldOptionsList: () => import("../common/list.vue"),
  },

  props: {
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
      let type = "add";
      if(this.cfg?.btn_srv_type==='select'){
        type='list'
      }
      return type;
    },
    getSrvApp() {
      return (
        this.cfg?.btn_srv_app || sessionStorage.getItem("current_app") || null
      );
    },
    cfg() {
      let cfg = null;

      if (this.fieldActionOptions && this.fieldActionOptions.col_btn_json) {
        cfg = this.fieldActionOptions.col_btn_json;
      }
      return cfg;
    },
  },

  methods: {
    onAction() {
      console.log(this.fieldActionOptions);
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
