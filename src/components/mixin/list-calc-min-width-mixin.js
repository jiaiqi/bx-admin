import {wrapButton} from "../common/wrapper_util";

export default {
    data() {
        return {
            columnWidthMap: {}, //存储改变后的列宽
        }
    },
    computed: {
        saveWidthBtn(){
            if(Object.keys(this.columnWidthMap)?.length>0){
                return wrapButton({
                    more_config:"",
                    _moreConfig:{},
                    moreConfig:{},
                    button_type:'saveColumnWidth',
                    button_name:"保存列宽"
                })
            }
        },
        // 更新表字段的最小列宽的请求参数
        calcTableColumnWidthReq() {
            if (Object.keys(this.columnWidthMap)?.length) {
                const arr = [];
                Object.keys(this.columnWidthMap).forEach((key) => {
                    if (
                        this.columnWidthMap[key]?.width &&
                        !isNaN(parseFloat(this.columnWidthMap[key].width))
                    ) {
                        arr.push({
                            serviceName: "srvsys_table_columns_update",
                            data: [{list_min_width: this.columnWidthMap[key].width}],
                            condition: [
                                {colName: "column_name", value: key, ruleType: "eq"},
                                {
                                    colName: "table_name",
                                    value: this.columnWidthMap[key].fieldInfo.table_name,
                                    ruleType: "eq",
                                },
                            ],
                        });
                    }
                });
                return arr;
            }
        },
        // 更新服务列最小列宽的请求参数
        calcColumnWidthReq() {
            if (Object.keys(this.columnWidthMap)?.length) {
                const arr = [];
                Object.keys(this.columnWidthMap).forEach((key) => {
                    if (
                        this.columnWidthMap[key]?.width &&
                        !isNaN(parseFloat(this.columnWidthMap[key].width))
                    ) {
                        arr.push({
                            serviceName: "srvsys_service_columns_query_update",
                            data: [{list_min_width: this.columnWidthMap[key].width}],
                            condition: [
                                {colName: "columns", value: key, ruleType: "eq"},
                                {
                                    colName: "service_name",
                                    value: this.columnWidthMap[key].fieldInfo.service_name,
                                    ruleType: "eq",
                                },
                                {
                                    colName: "table_name",
                                    value: this.columnWidthMap[key].fieldInfo.table_name,
                                    ruleType: "eq",
                                },
                            ],
                        });
                    }
                });
                return arr;
            }
        },
    },
    methods: {
        async hotReload() {
            const url = this.getServiceUrl("operate", 'srvsys_hot_reload_data');
            const req =  [{"serviceName":"srvsys_hot_reload_data"}]
            const res = await  this.$http.post(url, req);
            if(res?.data?.state==='SUCCESS'){
                return true
            }else if(res?.data?.resultMessage){
                this.$message.error(res.data.resultMessage);
            }
            return false;
        },
        onColumnWidthChange(newWidth, oldWidth, column = {columnKey: ''}) {
            //拖动表头改变列宽后触发
            console.log(newWidth, oldWidth, column.columnKey);
            const field = this.gridHeader.find(item => item.column === column.columnKey)
            if (field) {
                this.$set(this.columnWidthMap, column.columnKey, {
                    width: newWidth > 50 ? newWidth : 50,
                    fieldInfo: {
                        column: column.columnKey,
                        service_name: field.srvcol?.service_name,
                        table_name: field.srvcol?.table_name,
                    },
                });
            }
            // this.$nextTick(() => {
            //     this.saveColumnWidth()
            // })
        },
        // 更新服务列的最小宽度
        saveColumnWidth() {
            const url = this.getServiceUrl("operate", 'srvsys_service_columns_query_update');
            const req = this.calcColumnWidthReq;
            const loading = this.$loading({
                lock: true,
                text: 'Loading',
                spinner: 'el-icon-loading',
                background: 'rgba(0, 0, 0, 0.7)'
            });
            setTimeout(() => {
                loading.close();
            }, 5000);
            this.$http.post(url, req).then((res) => {
                if (res?.data?.state === "SUCCESS") {
                    this.$message.success(res.data.resultMessage);
                    this.updateTableColumn();
                    this.columnWidthMap = {};
                    this.hotReload().then((isReload)=>{
                        if(isReload===true){
                            this.initGridData(true).then(() => {
                                loading.close();
                            });
                        }

                    })
                } else {
                    this.$message.error(res.data.resultMessage);
                }
            });
        },
        // 更新表字段的最小宽度
        updateTableColumn() {
            const url = this.getServiceUrl("operate", 'srvsys_table_columns_update');
            const req = this.calcTableColumnWidthReq;
            const loading = this.$loading({
                lock: true,
                text: 'Loading',
                spinner: 'el-icon-loading',
                background: 'rgba(0, 0, 0, 0.7)'
            });
            setTimeout(() => {
                loading.close();
            }, 5000);
            this.$http.post(url, req).then((res) => {
                loading.close();
                if (res?.data?.state === "SUCCESS") {
                    // this.$message.success(res.data.resultMessage);
                } else {
                    console.error(`更新表字段失败：${res.data.resultMessage}`);
                    this.$message.error(`更新表字段失败：${res.data.resultMessage}`);
                }
            });
        },
    },
}