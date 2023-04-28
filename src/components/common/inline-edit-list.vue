<template>
  <div class="inline-edit-list">
    <!-- 111 -->
    <!-- <el-input-number
      v-model="num"
      @change="onChange"
      :min="1"
      :max="10"
      label="描述文字"
    ></el-input-number> -->
    <!-- <raw-field-editor
      :field="fieldData"
      :defaultValues="data"
      @field-value-changed="onChange"
      @blur="onBlur"
    >
    </raw-field-editor> -->
  </div>
</template>

<script>
import { FieldInfo } from "@/components/model/FieldInfo";
import { Field } from "@/components/model/Field";
// import RawFieldEditor from "../common/raw-field-editor.vue"; // 表单元件

export default {
  components: {
    // RawFieldEditor,
  },
  props: {
    data: {
      type: Object,
      default: () => {
        return {};
      },
    },
    field: {
      type: Object,
    },
  },
  data() {
    return {
      fieldData: null,
    };
  },
  methods: {
    onChange(e) {
      console.log("value change:", e);
    },
    onBlur(e) {
      console.log("on blur:", e);
    },
    buildField() {
      let fi = new FieldInfo(this.field, "update");
      let field = new Field(fi, null);
      field.key = this.field.column;
      field.setSrvVal(this.data[field.key]);
      this.fieldData = field;
    },
  },
  mounted() {
    if (this.field?.column) {
      this.buildField();
    }
  },
};
</script>

<style lang="scss" scoped></style>
