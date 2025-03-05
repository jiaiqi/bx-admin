/* */
<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <!-- <el-col :span="field.info.colspan"> -->
  <!-- 响应式布局属性 -->
  <div
    class="field-editor"
    :class="{
      'child-form-field': (ignoreVif || field.evalXIf()) && field.flatChildForm,
    }"
  >
    <slot name="field-child-prepend"></slot>
    <template v-if="(ignoreVif || field.evalXIf()) && field.flatChildForm">
      <child-form v-bind="$props" @form-loaded="$emit('child-form-loaded',$event)"></child-form>
    </template>
    <el-col
      :xs="field.info.colspan.xs"
      :sm="field.info.colspan.sm"
      :md="field.info.colspan.md"
      :lg="field.info.colspan.lg"
      :xl="field.info.colspan.xl"
      v-else-if="ignoreVif || field.evalXIf()"
      v-show="ignoreVif || field.evalVisible()"
    >
      <el-form-item
        :key="field.info.name"
        :prop="field.info.name"
        :title="field.info.label"
        :show-message="false"
        :error="field.getAnyValidateError()"
        :class="{
          fix_height_form_item: fixHeight,
          invalid_form_item: formHasInvalidError,
        }"
      >
        <!--显示字段label-->
        <template v-slot:label>
          <label
            :for="field.info.name"
            :title="field.info.label"
            :class="
              field.info.isRequired()
                ? `${field.info.getLabelStyle()} required`
                : field.info.getLabelStyle()
            "
            class="el-form-item__label"
            style="
              width: 10rem;
              text-overflow: ellipsis;
              overflow: hidden;
              white-space: nowrap;
            "
          >
            {{ field.info.label }}

            <el-button
              v-if="field.info.explain !== ''"
              type="text"
              @click="showHelpTips(field.info)"
              style="color: #28d828"
              slot="reference"
              icon="el-icon-question"
            ></el-button>
          </label>
        </template>

        <!--内容部分-->
        <el-dialog
          :title="title"
          :visible.sync="dialogVisible"
          width="68%"
          append-to-body
          destroy-on-close
        >
          <div
            style="
              border-radius: 4px;
              padding: 10px;
              border: 1px solid #dcdfe6;
              overflow: auto;
              max-width: 210mm;
              margin: 0 auto;
            "
            v-html="html"
          ></div>
          <span slot="footer" class="dialog-footer">
            <el-button @click="dialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="dialogVisible = false"
              >确 定</el-button
            >
          </span>
        </el-dialog>
        <el-row>
          <el-col
            v-for="contentField in this.contentFields"
            :key="contentField.info.name"
            v-if="ignoreVif || contentField.evalXIf()"
            :span="getInnerFieldColspan(contentField)"
          >
            <!-- style="display: flex;" -->
            <!--
            @field-value-changed="$emit('field-value-changed', $event)"
            v-show="contentField.info.bodyVisible && contentField.info.srvCol.in_detail == 1"  label设置隐藏 in_detail == 2 ， 显示lebel 不显示 field-editor-->
            <raw-field-editor
              ref="inner"
              :field="contentField"
              v-if="
                (ignoreVif || contentField.evalXIf()) &&
                !hideInput(contentField)
              "
              :childForeignkey="childForeignkey"
              :defaultCondition="defaultCondition"
              :mainformDatas="mainformDatas || parentAddMainFormDatas"
              :defaultValues="defaultValues"
              :form-model="formModel"
              v-show="
                contentField.info.readonly
                  ? contentField.info.srvCol.in_detail == 1
                  : contentField.info.bodyVisible
              "
              @field-value-changed="$emit('field-value-changed', $event)"
              @field-history-popup="$emit('field-history-popup', $event)"
              style="flex: 1"
            >
            </raw-field-editor>
            <template
              v-if="
                (ignoreVif || contentField.evalXIf()) &&
                contentField.fieldActionOptionsJson &&
                contentField.fieldActionOptionsJson.hasOwnProperty(
                  'col_btn_json'
                ) &&
                contentField.fieldActionOptionsJson.col_btn_json.hasOwnProperty(
                  'btn_name'
                )
              "
            >
              <shortcutButton
                :formModel="formModel"
                :field="field"
                :fieldActionOptions="contentField.fieldActionOptionsJson"
              ></shortcutButton>
            </template>
          </el-col>
        </el-row>
      </el-form-item>
    </el-col>
    <slot name="field-child-append"></slot>
  </div>
</template>

<script>
import RawFieldEditor from "./raw-field-editor.vue";
import shortcutButton from "./field-shortcut-add.vue";
import toInteger from "lodash/toInteger";
import ChildForm from "./child-form/main.vue";
export default {
  name: "field-editor",

  components: {
    shortcutButton,
    RawFieldEditor,
    ChildForm,
  },

  props: {
    ignoreVif: {
      type: Boolean,
      default: false,
    },
    defaultCondition: {
      type: Array,
    },
    childForeignkey: {
      type: Object,
    },
    /**
     * 主字段，提供label、colspan等
     * */
    field: {
      type: Object,
      default: null,
    },

    /**
     * 内容字段集合，包含主字段和其他字段
     * */
    contentFields: {
      type: Array,
      default: function () {
        return [];
      },
    },

    formHasInvalidError: {
      type: Boolean,
      default: false,
    },
    mainformDatas: {
      type: Object,
    },
    parentAddMainFormDatas: {
      type: Object,
    },
    defaultValues: {
      type: Object,
    },
    formModel: {
      type: Object,
    },
  },

  data() {
    return {
      dialogVisible: false,
      html: null,
      title: "帮助",
    };
  },

  computed: {
    hideInput() {
      return (field) => {
        return (
          field?.fieldActionOptionsJson?.options?.includes("隐藏输入框") ===
          true
        );
      };
    },
    fixHeight: function () {
      let editor = this.field.info.editor;
      let flexEditors = new Set([
        "upload-file",
        "upload-image",
        "ueditor",
        "qrcode",
        "textarea",
        "userlist",
        "code-editor",
      ]);
      return flexEditors.has(editor);
    },
  },
  mounted() {
    this.$forceUpdate();
  },
  methods: {
    handleClose() {
      let self = this;
      self.dialogVisible = false;
    },
    getInnerFieldColspan(contentField) {
      if (this.contentFields.length === 1) {
        return 24;
      }

      let colSpan2 = contentField.info.srvCol.col_span2;
      if (!colSpan2) {
        colSpan2 = contentField.info.srvCol.col_span;
      }
      let inner = Number.parseFloat(colSpan2);
      return toInteger(inner * 24);
    },
    getconsole(e) {},
    showHelpTips(e) {
      this.html = e.explain;
      this.title = e.label + "[说明]";
      this.dialogVisible = true;
      let type = "explain";
      let urlParams = e.explain;
      let tab_title = e.label + "[说明]";
      //  this.addTab(type, urlParams, tab_title);
    },
    handleClose(e) {},
  },
};
</script>

<style scoped lang="scss">
label.required::before {
  content: "*";
  color: #f74b4b;
  margin-right: 4px !important;
}

.el-form label.red {
  color: #c03434;
  font-weight: 600 !important;
}

.el-form label.normal {
  color: #3f65b1 !important;
}

div.el-form-item {
  margin-bottom: unset;
}

div.invalid_form_item {
  /* margin-bottom: 16px !important; */
}

.el-form-item__error {
  padding-top: 0px;
}
.field-editor {
  // display: flex;
  // flex-direction: column;
  // padding: 10px 0;
  // width: 100%;
  &.child-form-field {
    display: flex;
    flex-direction: column;
    // padding: 10px 0;
    width: 100%;
    ::v-deep(.child-form){
      .form-view-wrapper{
        .el-row{
          border:none;
          padding: 0;
        }
      }
    }
  }
}

.m-y-5 {
  margin: 5px 0 !important;
}

.el-form .el-form-item.fix_height_form_item {
  margin-bottom: 5px !important;
  height: unset !important;
}
</style>
