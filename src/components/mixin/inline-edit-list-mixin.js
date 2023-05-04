export default {
  data() {
    return {
      onInlineEditing: false,
      cfgJson: null,
      updateV2: null,
      inlineEditCols: null,
      newGridData: [],
    };
  },
  computed: {
    submitButton() {
      if (
        Array.isArray(this.updateV2.formButton) &&
        this.updateV2.formButton.length > 0
      ) {
        return this.updateV2.formButton.find(
          (item) => item.button_type === "edit"
        );
      }
    },
  },
  methods: {
    getButtonName(item) {
      let res = item.button_name;
      if (this.onInlineEditing === true && item.button_type === "batchupdate") {
        res = "保存";
      }
      return res;
    },
    async saveData() {
      const req = [];
      if (
        Array.isArray(this.newGridData) &&
        this.newGridData.length > 0 &&
        this.cfgJson?.list_edit_srv
      ) {
        this.newGridData.forEach((item) => {
          const obj = {};
          Object.keys(item).forEach((key) => {
            if (item[key] !== null && typeof item[key] === "object") {
              if (item[key]["newValue"] !== item[key]["oldValue"]) {
                obj[key] = item[key]["newValue"];
              }
            }
          });
          if (Object.keys(obj).length > 0) {
            req.push({
              serviceName: this.cfgJson.list_edit_srv,
              condition: [{ colName: "id", ruleType: "eq", value: item.id }],
              data: [obj],
            });
          }
        });
        this.gridData = this.gridData.map((item) => {
          Object.keys(item).forEach((key) => {
            if (item[key] !== null && typeof item[key] === "object") {
              item[key] = item[key]["newValue"];
            }
          });
          return item;
        });
      }
      if (req.length > 0 && this.submitButton?.application) {
        const url = this.getServiceUrl(
          "operate",
          this.submitButton.service_name
        );
        // const url = `/${this.submitButton.application}/operate/${this.submitButton.service_name}`;
        const res = await this.$http.post(url, req);
        if (res?.data?.state === "SUCCESS") {
          this.$message({
            message: res.data.resultMessage || "提交成功！",
            type: "success",
          });
        }
        this.loadTableData();
      }
    },
    onInlineChange(e) {
      console.log(e);
      // TODO 表内计算
      this.newGridData = this.gridData.map((item) => {
        if (e.id && e.id === item.id) {
          item[e.column] = { newValue: e.newValue, oldValue: e.oldValue };
        }
        return item;
      });
    },
    getColumnMinWidth(item) {
      if (
        item.column &&
        this.onInlineEditing &&
        this.inlineEditCols &&
        this.inlineEditCols[item.column]
      ) {
        return 180;
      }
    },
    onBatchUpdateClick() {
      if (this.onInlineEditing === false) {
        this.onInlineEditing = true;
      } else {
        this.saveData().then(() => {
          this.onInlineEditing = false;
        });
      }
    },
    async getColV2() {
      const response = await this.loadColsV2(
        this.cfgJson?.list_edit_srv,
        "update"
      );
      const respData = response.body.data;
      console.log(respData);
      this.updateV2 = respData;
      if (this.cfgJson?.list_edit_cols) {
        let inlineEditCols = respData.srv_cols.filter(
          (item) =>
            item.columns &&
            this.cfgJson?.list_edit_cols?.indexOf(item.columns) > -1
        );
        console.log("inlineEditCols:", inlineEditCols);
        if (Array.isArray(inlineEditCols)) {
          this.inlineEditCols = inlineEditCols.reduce((res, cur) => {
            res[cur.columns] = cur;
            return res;
          }, {});
        }
      }
    },
    handleCfgJson(e) {
      console.log(e);
      if (e && typeof e === "string") {
        this.cfgJson = JSON.parse(e);
        if (this.cfgJson?.list_edit_srv) {
          this.getColV2();
        }
      }
    },
    changeInlineEditState() {
      this.onInlineEditing = !this.onInlineEditing;
    },
    isInlineEditColumn(column) {
      return (
        column &&
        this.cfgJson?.list_edit_cols &&
        typeof this.cfgJson?.list_edit_cols === "string" &&
        this.cfgJson?.list_edit_cols.indexOf(column) > -1
      );
    },
  },
};
