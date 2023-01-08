
export default {
    data: {
        tableInfo: {},
        service_name: "",
    },
    methods: {
       async makeOptions2222(service,array2) {
             console.log(service,"service2是什么？？？？---它到底是什么啊？？？")
            if (array2.length > 0) {
                 if(!this[`${service}V2`].storeData){
                    this[`${service}V2`].storeData={

                    }
                 } 
                for (let i = 0; i < array2.length; i++) {
                    let item = array2[i];

                    if(!this[`${service}V2`].storeData[item.columns]){
                        this[`${service}V2`].storeData[item.columns]={
                            
                        };
                    }else{
                        continue
                    }
                    
                    if(item.option_data_type == 'local'){
                        this[`${service}V2`].storeData[item.columns].array=item.option_list_v2
                       
                    }
                    if (item.option_data_type == "remote") {
                      
                      
                  
                        // srvpark_park_info_select

                        let condition = {
                            serviceName: item.option_list_v2.serviceName,
                            colNames: ["*"],
                            relation_condition: {},
                        };

                       await this.$axios
                            .post(
                                `/${this[`${service}V2`].appName}/select/${item.option_list_v2.serviceName}`,
                                condition
                            )
                            .then((res) => {
                                let data = res.data.data;
                                if (item.option_list_v2.is_tree) {
                                    let treeArray = this.makeTree(data, {
                                        parentKey: item.option_list_v2.parent_col,
                                        labelKey: item.option_list_v2.key_disp_col,
                                        valueKey: item.option_list_v2.refed_col,
                                    });
                                    console.log(treeArray, "==treeArray==");
                                    this.storeData[`${item.columns}`].array = treeArray;

                                } else {
                                    this.storeData[`${item.columns}`].array = treeArray;
                                    
                                }

                                console.log(this.storeData, "==this.storeData===");
                            });
                    }

                

                }

                return  this[`${service}V2`].storeData
            }else{
                 return {

                 }
            }
        },
       async  getArrayList(service,filterColumn) {
            let columnArray;
            let appName; 
            console.log("啊哈哈哈")
            if(this[`${service}V2`]){
                columnArray = this[`${service}V2`].srv_cols;
                appName = this[`${service}V2`].gridButton[0].application;
            }else{
                 await this.getV222222Columns(service);
                 columnArray = this[`${service}V2`].srv_cols;
                 appName = this[`${service}V2`].gridButton[0].application;
            }
            let resultArray = this.getV2Columns(
                filterColumn,
                columnArray,
                (filterItem, dataItem) => {
                    
                    if (filterItem.key == dataItem.columns) {
                        return true;
                    } else {
                        return false;
                    }
                }
            );
            console.log(resultArray,"什么是resultArray-resultArray-resultArray")
            let array2 = resultArray.sort((a, b) => a.souceSort < b.souceSort);
            
            let returnData=await this.makeOptions2222(service,array2);
            console.log(returnData,"==returnData==他是什么returnData==returnData==");
            return returnData;
        },
        async getMainTable4444() {
             console.log(this.condition,"this--condition是什么？？？")
            let condition = {
                serviceName: this.tableInfo.mainTableInfo.select.serviceName,
                colNames: ["*"],
                condition: this.condition||[],
                relation_condition: {},
                order: [],
                draft: false,
                query_source: "list_page",
            };

            let returnData = await this.$axios.post(
                this.tableInfo.mainTableInfo.select.url,
                condition
            );
            this.getMainTableInfo(returnData);
        },
        async getV222222Columns(service) {
            let condition = {
                serviceName: "srvsys_service_columnex_v2_select",
                colNames: ["*"],
                condition: [
                    {
                        colName: "service_name",
                        value:service || this.serviceName ,
                        ruleType: "eq",
                    },
                    { colName: "use_type", value: "list", ruleType: "eq" },
                ],
                order: [{ colName: "seq", orderType: "asc" }],
            };
            let returnData = await this.$axios.post(
                `${this.applicationUrl}/select/srvsys_service_columnex_v2_select?colsel_v2=${this.serviceName}`,
                condition
            );

            console.log(returnData, "==returnData==returnData=是什么？？？")
            this.tableInfo = this.filterTableInfo(returnData.data.data);
            this[`${service}V2`]=this.tableInfo


         
            // this.mountedTableInfo(tableInfo);
            if (this.autoMainTable) {
                this.getMainTable4444()
            }
            if(this.getV2TableInfo){
                this.getV2TableInfo(this.tableInfo)
            }
          


        }
    },
    mounted() {
        //   let serviceName=this.service || this.$route.params.service_name;
        //   console.log("什么事serviceName")

        // serviceName:'srvwuliu_car_select',
        // applicationUrl:'lgs',

        let service_name = this.service ||
            this.$route.params.service_name || this.serviceName;
        this.serviceName = service_name;
        this.getV222222Columns()
    }
};