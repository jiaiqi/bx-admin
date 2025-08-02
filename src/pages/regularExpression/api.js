import {$http} from "@/common/http";

export default class Expression {
     //获取配置列数据
     async getPageOptionConfig(){
        let url = '/iot/select/srvsys_service_columnex_v2_select?colsel_v2=srviot_dev_rule_expr_add'
        let req = {
            serviceName: "srvsys_service_columnex_v2_select",
            colNames: ["*"],
            condition: [
                {colName: "service_name", value: "srviot_dev_rule_expr_add", ruleType: "eq"},
                {colName: "use_type", value: "add", ruleType: "eq"},
                {colName: "main_srv", value: "srviot_dev_rule_cfg_select", ruleType: "eq"}
            ],
            order: [{colName: "seq", orderType: "asc"}],
        };
        return await $http.post(url, req)
     }
    async getSelectOptionsByColumns(obj){
      let url = '/iot/select/'+obj.serviceName;
      let req={
           colNames: ["*"],
           condition:[],
           page: {pageNo: 1, rownumber: 20},
           serviceName: obj.serviceName,
           queryMethod:'select',
           distinct: false,
           relation_condition: {
               relation: "OR",
               data: [
                 {
                   relation: "AND",
                   data:[
                       {
                            colName:obj.refed_col?obj.refed_col:obj.key_disp_col,
                            value: "",
                            ruleType: "[like]"
                       },
                       {
                           colName:obj.key_disp_col?obj.key_disp_col:obj.key_disp_col,
                           value: "",
                           ruleType: "[like]"
                       }
                   ]
                }
             ]
           }
       }
       return await $http.post(url, req)
    }
}