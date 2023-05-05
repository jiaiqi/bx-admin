<template>
  <div class="inline-edit-list">
    <!-- 111 -->
    <el-input
      v-model.number="value"
      placeholder=""
      v-if="editorType === 'digit'"
      type="number"
      @change="onChange"
      clearable
    ></el-input>

    <el-input-number
      v-model.number="value"
      @change="onChange"
      :step="step"
      :precision="precision"
      v-else-if="editorType === 'number' || editorType === 'digit'"
    ></el-input-number>
    <el-input
      v-model="value"
      @change="onChange"
      placeholder=""
      v-else-if="editorType === 'string'"
    ></el-input>
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
      value: null,
      oldValue: null,
    };
  },
  computed: {
    precision() {
      return this.editorType == "digit" ? 2 : 0;
    },
    step() {
      return this.editorType == "digit" ? 0.1 : 1;
    },
    editorType() {
      let type = "";
      const colType = this.field.col_type || "String";
      switch (colType) {
        case "Money":
        case "Float":
          type = "digit";
          break;
        case "Money":
        case "Integer":
          type = "number";
          break;
        default:
          type = "string";
          break;
      }
      return type;
    },
  },
  created() {
    if (this.data && this.field?.columns) {
      this.value = this.data[this.field.columns];
      this.oldValue = this.data[this.field.columns];
    }
  },
  methods: {
    onChange(e) {
      this.$emit("on-change", {
        newValue: this.editorType === "digit" ? Number(e) : e,
        oldValue: this.oldValue,
        column: this.field.columns,
        id: this.data.id,
      });
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

<style lang="scss" scoped>
.inline-edit-list {
  text-align: center;
}

::v-deep .inline-edit-list input::-webkit-outer-spin-button,
::v-deep .inline-edit-list input::-webkit-inner-spin-button {
  -webkit-appearance: none !important;
}
</style>
