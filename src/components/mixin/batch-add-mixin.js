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
            operateData = this.pre_data_handle(item, operateData);
            var service = item["operate_service"];
            var new_conditions = [];
            var new_data = {};
            var page_type = "";
            var operate_type = 'batchadd';

            var load_old_data = true;
            var operate_params = JSON.parse(item["operate_params"]);


            if (operate_params != '' && operate_params != null) {

                var load_data = operate_params.load_data;
                if (load_data == false) {
                load_old_data = load_data;
                }

                var packageData = this.getPackageData(item, operateData);
                new_data = packageData["data"];
                new_conditions = packageData["conditions"];



            }


            var params={};
            params["service"]=service;
            params["condition"]=new_conditions;
            params["initSelectedDatas"]=operateData;
            params["btninfo"]=item;

            params["childForeignkey"]=this.childForeignkey;
            params["defaultCondition"]=this.defaultCondition;
            params["listMainFormDatas"]=this.listMainFormDatas;
            params['formType'] = 'batch-edit-grid'
            this.popupDialog(params);
        }
        
  
    }
  
  };
  