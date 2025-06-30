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
    //订单列表信息获取
    async getOrderListByNo(params){
       let url =`/wx/select/srvbank_xa_order_item_select`
       let req={
           serviceName: "srvbank_xa_order_item_select",
           colNames:["*"],
           condition:[ {colName: "su_order_no", ruleType: "in", value:params}],
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
}