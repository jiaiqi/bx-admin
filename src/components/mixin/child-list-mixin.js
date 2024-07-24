export default {
  data(){
     return {
      initDatas:[]
     }
  },
  computed:{
    initDataModelType(){
       let type = 'add'
       if(this.listType !== 'addchildlist' && this.listType !== 'updatechildlist'){

       }

       return type
    },
    initDataMap(){
       let map = {}
       if(this.childListConfig.hasOwnProperty('data_source_cfg')){
        let  config = this.childListConfig.data_source_cfg
        if(config.mapping){
          map = config.mapping
        }
       }else{
        map = {}
       }
       return map
    },
    initDataSelectReq(){
      // 配置的主子表需要填充的默认值请求 data_source_cfg
      let config = null
      let req = {
       "serviceName": "",
       "colNames": [
         "*"
       ],
       "condition": []
     }
      if(this.childListConfig.hasOwnProperty('data_source_cfg')){
       config = this.childListConfig.data_source_cfg
       req.serviceName = config.select_srv
       req.srvApp = config.app
       if(config.condition){
         for(let cond of config.condition){
            req.condition.push({
             "colName": cond.colName,
             "ruleType": cond.ruleType,
             "value": this.mainFormDatas[cond.value_main_col]
           })
         }
       }
      }else{
        req = null 
      }
      
      return req
   }
  }
  ,
  mounted(){
    this.getInitSelectDatas()
    
  },
  methods: {
    getInitSelectDatas(){
      if(this.initDataSelectReq){
        let req = this.initDataSelectReq
        this.selectList(req,req.srvApp).then(response => {
          if (response && response.data && response.data.data) {
              let options = response.data.data;
              this.initDatas = options.map(item => {
                let initData = {}
                if(Object.keys(this.initDataMap).length > 0){
                  for(let key in this.initDataMap){
                    initData[key] = item[this.initDataMap[key]]
                  }
                }
                return initData
              })
              console.log(options)
            
          }
        })
      }
      
    },

    onListLoaded: function (innerList) {
      let refCol = this.foreignKey.column_name;
      let refTable = this.foreignKey.table_name;
      let refedCol = this.foreignKey.referenced_column_name;
      let refedTable = this.foreignKey.referenced_table_name;

      if(this.foreignKey.hasOwnProperty('relation_type') && this.foreignKey.relation_type == '服务'){
        refCol = this.foreignKey.ref_service_column;
        refTable = this.foreignKey.ref_service;
        refedCol = this.foreignKey.refed_service_column;
        refedTable = this.foreignKey.refed_service;
        // hide headers if srvcol comes from main table
        if (innerList != undefined) {
          innerList.gridHeader.filter(header => {
            let srvcol = header.srvcol;
            if (!srvcol) {
              return false
            }
            let isRefCol = srvcol.service_name == refTable && srvcol.columns == refCol;
            let isRefedDispCol = srvcol.service_name == refedTable && srvcol.columns;
            let hide = isRefCol || isRefedDispCol;
            return hide;
          }).forEach(header => {
            header.show = false;
          });
        }
      }else{
          // hide headers if srvcol comes from main table
        if (innerList != undefined) {
          innerList.gridHeader.filter(header => {
            let srvcol = header.srvcol;
            if (!srvcol) {
              return false
            }

            let isRefCol = srvcol.table_name == refTable && srvcol.columns == refCol;
            let isRefedDispCol = srvcol.table_name == refedTable && srvcol.columns == ("_" + refCol + "_disp");
            let hide = isRefCol || isRefedDispCol;
            return hide;
          }).forEach(header => {
            header.show = false;
          });
        }
      }

      // 从主表冗余过来的字段在子表列表中不显示
      innerList?.gridHeader?.filter(header=>{
        return header?.srvcol?.main_sub_red?.quoteCol
      }).forEach(header=>{
        header.show = false
      })

      if (this !== innerList) {

        this.$emit("list-loaded", this);
      }
    },


    onStandbyRowAdded: function (newRow) {
      let refCol = this.foreignKey.column_name;
      newRow[refCol] = this.getRefColValue;

      // hide extra fk condition cols and set values
      if (this.foreignKey.conditions) {
        this.foreignKey.conditions.forEach(item => {
          let refCol = item.colName
          newRow[refCol] = item.value
        })
      }
    },


    hiddRefColFieldInForm: function (form) {
      let refCol = this.foreignKey.column_name;
      let refColField = form.fields[refCol];
      if(refColField&&refColField.info){
        refColField.info.visible = false;
      }
    }
  },
  watch: {
    'initDataSelectReq': {
      deep: true,
      handler(newVal,oldVal) {
        console.log(newVal)
        let dataSourceCfg = this.childListConfig.data_source_cfg
        if(dataSourceCfg && dataSourceCfg.is_reset_data == '是'){
            if(newVal&&oldVal&&JSON.stringify(newVal)!==JSON.stringify(oldVal)){
              this.getInitSelectDatas()
            }
        }
      }
    },
  },

};
