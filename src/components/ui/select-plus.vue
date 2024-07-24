<template>
  <el-select
    v-if="formModelData"
    filterable
    remote
    :loading="loading"
    v-model="formModelData.value"
    clearable
    placeholder="输入关键字搜索"
    :remote-method="buildFkOptionList"
    @clear="buildFkOptionList('', tab)"
  >
    <!-- @blur="buildFkOptionList(null,tab)" -->
    <el-option
      v-for="item in formModelData.options"
      :key="item.value"
      :label="item.label"
      :value="item.value"
    >
    </el-option>
  </el-select>
</template>

<script>
export default {
  name: "select-plus",
  data() {
    return {
      form: {
        name: "",
        region: "",
        date1: "",
        date2: "",
        delivery: false,
        type: [],
        resource: "",
        desc: "",
      },

      loading: false,
      onInputValue: false, // 是否有输入值
      formModelData: {},
    };
  },
  mounted() {
    this.formModelData = this.formModel;
    this.buildFkOptionList("");
  },
  props: {
    tab: {
      type: Object,
      default: () => {
        return {};
      },
    },
    formModel: {
      type: Object,
      default: () => {
        return {};
      },
    },
    formModels: {
      type: Object,
      default: () => {
        return {};
      },
    },
    mainData: {
      type: Object,
      default: () => {
        return {};
      },
    },
  },
  methods: {
    async buildFkOptionList(query) {
      let self = this;
      let e = self.tab;
      const globalData = {
        mainData: this.mainData,
        data: Object.keys(this.formModels || {}).reduce((res, key) => {
          res[this.formModels[key]?.colName?.[0]] = this.formModels[key]?.value;
          return res;
        }, {}),
      };
      console.log("buildFkOptionList", query, e, self.formModel[e.list_tab_no]);
      let conds = [];
      if (this.tab?.option_list?.conditions) {
        conds = this.tab.option_list.conditions.map((item) => {
          const obj = {
            colName: item.colName,
            ruleType: item.ruleType,
          };
          if (item.literalValue) {
            obj.value = item.value;
          }
          if (item.value?.includes("mainData.") && !item.value.includes("${")) {
            obj.value = this.mainData[item.value.replace("mainData.", "")];
          } else if (
            item.value?.includes("mainData.") &&
            item.vallue.includes("${")
          ) {
            obj.value = this.renderStr(item.value, globalData);
          }
          return obj;
        });
      }
      self.loading = true;
      let relationCondition = null;
      if (query !== "" && query !== undefined && query !== null) {
        // let cond = [
        //   {
        //     colName: e.option_list.key_disp_col,
        //     ruleType: "[like]",
        //     value: query,
        //   },
        // ];
        // conds.push(cond);
        relationCondition = {
          relation: "OR",
          data: [
            {
              colName: e.option_list.key_disp_col,
              ruleType: "[like]",
              value: query,
            },
            {
              colName: e.option_list.refed_col,
              ruleType: "[like]",
              value: query,
            },
          ],
        };
      } else {
        // conds = [];
      }
      let options = e.options || [];
      if (e?.option_list?.serviceName) {
        // service_name, condition, page, order, group, mapcondition, app, isproc, columns, relationCondition, draft, pageType, srvAuth,vpageNo,useType,rdt,divCondition
        const res = await self.select(
          e.option_list.serviceName,
          conds,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          relationCondition,
          false
        );
        const resData = res.data.data;
        for (let i = 0; i < resData.length; i++) {
          let item = resData[i];
          let opt = {
            value: item[e.option_list.refed_col],
            label: item[e.option_list.key_disp_col],
          };
          options.push(opt);
        }
      }
      console.log("options", options);
      self.formModelData.options = options;
      self.loading = false;
    },
  },
  watch: {
    "formModelData.value": {
      deep: true,
      immediate: true,
      handler: function (val, oldVal) {
        console.log("formModelData", val, oldVal);
        if (val !== oldVal) {
          this.$emit("on-value-change", {
            value: val,
            listNo: this.tab.list_tab_no,
          });
        }
      },
    },
  },
};
</script>
