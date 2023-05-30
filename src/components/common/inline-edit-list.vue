<template>
  <div class="inline-edit-list">
    <span class="text-red" v-if="isRequired">*</span>
    <el-date-picker
      v-model="value"
      type="date"
      size="mini"
      format="yyyy 年 MM 月 dd 日"
      v-if="editorType === 'Date'"
      @change="onChange"
      placeholder="选择日期"
    >
    </el-date-picker>
    <el-input-number
      v-model.number="value"
      @change="onChange"
      :step="step"
      :precision="precision"
      size="mini"
      v-else-if="editorType === 'number' || editorType === 'digit'"
    ></el-input-number>
    <el-input
      v-model="value"
      @change="onChange"
      placeholder=""
      size="mini"
      v-else-if="editorType === 'string'"
    ></el-input>
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
    isRequired() {
      return (
        this.field.validators && this.field.validators.indexOf("required") > -1
      );
    },
    precision() {
      return this.editorType == "digit" ? 2 : 0;
    },
    step() {
      return this.editorType == "digit" ? 0.1 : 1;
    },
    editorType() {
      let type = "";
      const colType = this.field.col_type || "string";
      switch (colType) {
        case "Money":
        case "Float":
          type = "digit";
          break;
        case "Integer":
        case "int":
          type = "number";
          break;
        case "String":
          type = "string";
          break;
        default:
          type = colType;
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
    showValid({ result, message, name }) {
      if (result === false) {
        this.value = this.oldValue;
      }
    },
    onChange(e) {
      let val = e;
      switch (this.editorType) {
        case "Date":
          val = e.Format("yyyy-MM-dd");
          break;
        case "digit":
        case "number":
          val = Number(e);
          break;
        default:
          break;
      }
      this.$emit("on-change", {
        newValue: val,
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
  watch: {
    value(newValue){

    },
    data: {
      immediate: true,
      deep: true,
      handler(newValue, oldValue) {
        if (newValue && newValue[this.field.columns] !== this.value) {
          this.value = this.data[this.field.columns];
          this.onChange(this.data[this.field.columns])
        }
      },
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

.text-red {
  color: #ff0000;
  margin-right: 8px;
}
</style>
