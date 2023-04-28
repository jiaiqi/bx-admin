
export default {
  data() {
    return {
      onInlineEditing: false,
      cfgJson: null,
      updateV2:null,
      inlineEditCols:null
    };
  },
  methods: {
    async getColV2() {
      const response = await this.loadColsV2(
        this.cfgJson?.list_edit_srv,
        "update"
      );
      const respData = response.body.data;
      console.log(respData);
      this.updateV2 = respData
      if (this.cfgJson?.list_edit_cols) {
        let inlineEditCols = respData.srv_cols.filter(item=>item.columns&&this.cfgJson?.list_edit_cols?.indexOf(item.columns)>-1)
        console.log('inlineEditCols:',inlineEditCols);
        if(Array.isArray(inlineEditCols)){
            this.inlineEditCols = inlineEditCols.reduce((res,cur)=>{
                res[cur.columns] = cur
                return res
            },{})
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
