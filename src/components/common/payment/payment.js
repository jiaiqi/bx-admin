import {$http} from "@/common/http";
import  axios from 'axios'
export default class Payment {
   //现金线下支付调用
    async handlePayCash(params){
       let url=`/wx/operate/srvbank_xa_pay_offline_order`
       let req=[
           {
               serviceName: "srvbank_xa_pay_offline_order",
               data:[params]
           }
       ]
       return await $http.post(url, req)
    }
     //新线上支付调用
    async handlePayPublicOrder(params){
       let url=`/wx/operate/srvbank_xa_to_pulic_order`
       let req=[
           {
               serviceName: "srvbank_xa_to_pulic_order",
               data:[params]
           }
       ]
       return await $http.post(url, req)
    }
    //订单列表信息获取
    async getOrderListByNo(params){
       let url =`/wx/select/srvbank_xa_order_item_select`
       let req={
           serviceName: "srvbank_xa_order_item_select",
           colNames:["*"],
           condition:[ {colName: params.keyName, ruleType:params.ruleType, value:params.ids}],
       }
       return await $http.post(url,req)
    }
    //获取扫描支付使用二维码信息
    async getQrcodeInfo(params){
        let url =`/wx/operate/srvbank_xa_pay_scode_order`
        let req=[
            {
                serviceName: "srvbank_xa_pay_scode_order",
                data: [params]
            }
        ]
       return await $http.post(url,req)
    }
    //查询 二维码支付使用订单支付情况
    async getPayStatus(params){
        let url =`/wx/select/srvbank_xa_pay_state_select`
        let req={
            "serviceName": "srvbank_xa_pay_state_select",
            "condition": [
                {
                    "colName": "order_no",
                    "ruleType": "eq",
                    "value": params
                }
            ]
        }
       return await $http.post(url,req)
    }
    //获取预付费订单信息
    async getPayPrepaidInfo(params){
       let url= `/park/select/srvpark_object_dev_sd_balance_select`
       let req ={
           serviceName: "srvpark_object_dev_sd_balance_select",
           colNames: ["*"],
           condition: [{colName: "no", ruleType: "like", value:params.no}],
           page: {"pageNo": 1, "rownumber": 10},
       }
       return await $http.post(url,req)
    }

    //获取停车月缴费信息
    async getFeeByMonth(params){
        let url =`/park/select/srvpark_monthly_payment_select`
        let req={
            serviceName: "srvpark_monthly_payment_select",
            colNames: ["*"],
            condition:[{colName: "bill_no", ruleType: "like", value: params.no}],
            page: {"pageNo": 1, "rownumber": 10},
        }
        return await $http.post(url,req)
    }

    //手动添加订单数据入库返回订单编号信息数据
    async getAddPayInfo(params){
        let url=`/park/add/srvpark_prepaid_sd_bill_add`
        let req=[
            {
                serviceName: "srvpark_prepaid_sd_bill_add",
                condition:[],
                data:params,
            }
        ]
        return await $http.post(url,req)
    }
}