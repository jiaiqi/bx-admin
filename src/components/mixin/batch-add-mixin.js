export default {
    data(){
        return {

        }
    },
    methods: {
        buildBatchConfig(button){
            console.log('buildBatchConfig',button)
            this.popupBatchDialog(button, this.gridDataRun);
        },
        popupBatchDialog(item, operateData){
            let self = this
            let service = item["operate_service"];
            let config = null
            try { 
                config = item.btn_cfg_json
                config = JSON.parse(config)
            }
            catch(err) {
                console.error('没有可用的配置 或 配置错误',err)
                return null
            }
            let addCols = this.addSrvCols || []
            let addKeyCol = addCols.filter(item => item.columns == config.batch_select_add_fk_col) || []
            addKeyCol = addKeyCol.length > 0 ? addKeyCol[0] : null
            let params={};
            params["service"]=service;
            params["condition"]=[];
            params["batchInitConfig"]= {
                addKeyCol:addKeyCol,
                initSelectedDatas:operateData,
                addCols:this.addSrvCols
            };
            params["btninfo"]=item;

            params["childForeignkey"]=this.childForeignkey;
            params["defaultCondition"]=this.defaultCondition;
            params["listMainFormDatas"]= this.listMainFormDatas;
            params['formType'] = 'batch-edit-grid'
            // params = self.bxDeepClone(params)
            this.popupDialog(params);
        }
        
  
    }
  
  };
  