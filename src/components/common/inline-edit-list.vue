<template>
  <div class="inline-edit-list el-form-item" :class="{ 'is-error': isError }">
    <span class="text-red" v-if="isRequired">*</span>
    <el-date-picker v-model="value" type="date" size="mini" format="yyyy 年 MM 月 dd 日" v-if="editorType === 'Date'"
      @change="onChange" placeholder="选择日期">
    </el-date-picker>
    <el-input-number v-model.number="value" @change="onChange" @blur="onBlur" :step="step" :precision="precision"
      size="mini" :min="min" :max="max" :maxlength="maxlength" v-else-if="editorType === 'number' || editorType === 'digit'"></el-input-number>
    <el-input v-model="value" @change="onChange" @blur="onBlur" placeholder="" size="mini"
      v-else-if="editorType === 'string'"></el-input>
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
      value: undefined,
      oldValue: undefined,
      isChange: false,
      isError: false,
      customPrecision: null
    };
  },
  computed: {
    min() {
      return this.fieldData?.info?.rules?.find((item) => item.name === "min")
        ?.min;
    },
    max() {
      return this.fieldData?.info?.rules?.find((item) => item.name === "max")
        ?.max;
    },
    isRequired() {
      return (
        this.field.validators && this.field.validators.indexOf("required") > -1
      );
    },
    maxlength(){
      let maxlength = 99999 
      if (this.field.col_type?.includes('decimal')) {
        const str = this.field.col_type;
        const regex = /decimal\((\d+),(\d+)\)/;
        const match = str.match(regex)
        maxlength = match[1]
      }
      return maxlength
    },
    precision() {
      let precision =  this.editorType == "digit" ? 2 : 0;
      if (this.field.col_type?.includes('decimal')) {
        const str = this.field.col_type;
        const regex = /decimal\((\d+),(\d+)\)/;
        const match = str.match(regex)
        precision = match[2]*1
      }
      return precision
    },
    step() {
      let step =  this.editorType == "digit" ? 0.1 : 1;
      if (this.field.col_type?.includes('decimal')) {
        const str = this.field.col_type;
        const regex = /decimal\((\d+),(\d+)\)/;
        const match = str.match(regex)
        step = 1 / 10**match[2]
      }
      return step
    },
    editorType() {
      let type = "";
      let colType = this.field.col_type || "string";
      if (this.field.col_type?.includes('decimal')) {
        colType = 'decimal'
        // const str = this.field.col_type;
        // const regex = /decimal\((\d+),(\d+)\)/;
        // const match = str.match(regex)

      }
      switch (colType) {
        case "Money":
        case "Float":
        case "decimal":
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
    showValid({ result, message, name, value }) {
      if (result === false) {
        this.isError = true
        // this.value = value
        // this.$set(this, "value", value);
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
      this.value = val;
      this.isChange = true
      // this.$emit("on-change", {
      //   newValue: val,
      //   oldValue: this.value,
      //   column: this.field.columns,
      //   id: this.data.id,
      // });
    },
    onBlur(e) {
      console.log("on blur:", e);
      const obj = {
        newValue: this.value,
        oldValue: this.oldValue,
        column: this.field.columns,
        id: this.data.id,
        isChange: true
      }
      this.isError = false
      this.$emit("on-change", obj);
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
    value(newValue, oldValue) {
      if (newValue !== oldValue && newValue !== undefined) {
        this.oldValue = oldValue;
        const obj = {
          newValue: newValue,
          oldValue: oldValue,
          column: this.field.columns,
          id: this.data.id,
          isChange: this.isChange
        }
        this.isError = false
        this.$emit("on-change", obj);
      }
    },
    data: {
      immediate: true,
      deep: true,
      handler(newValue) {
        if (
          newValue &&
          typeof newValue === "object" &&
          newValue.hasOwnProperty(this.field.columns)
        ) {
          this.value = newValue[this.field.columns];
        }
      },
    },
  },
  mounted() {
    if (this.field?.columns) {
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
