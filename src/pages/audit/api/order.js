import {$http} from "@/common/http";
import  axios from 'axios'
let path = process.env.NODE_ENV === "development"?window.APP_CONFIG.API_URL:window.backendIpAddr
export default class OrderApi{

    //获取进入表单时的发起人信息数据
   async getPromoterInfo(){
      let user=top.user?top.user.user_no:'wuhao'
      let req={
          colNames: ["*"],
          serviceName:"srvbms_user_select",
          queryMethod:"select",
          condition: [{colName: "user_no", value:user, ruleType: "eq"}]
      }
      let url=path+`/auth/select/srvbms_user_select`
        return await $http.post(url, req)
    }

    async postPromoterInfo(dep){
        let url=path+`/auth/select/srvauth_dept_workorder_select`
        let req={
            colNames: ["*"],
            queryMethod: "select",
            serviceName: "srvauth_dept_workorder_select",
            condition: [{colName: "dept_no", value:dep, ruleType: "eq"}]
        }
        return await $http.post(url, req)
    }
    //全量模糊机构编号查询
    async getMoirDepList(){
       let url=path+`/auth/select/srvauth_dept_workorder_select`
       let req={
           colNames: ["*"],
           condition: [],
           distinct: false,
           page: {pageNo: 1, rownumber: 20},
           queryMethod: "select",
           serviceName: "srvauth_dept_workorder_select",
           relation_condition:{
               relation:"OR",
               data:[{relation: "AND", data: [{colName: "dept_no", value: "", ruleType: "[like]"}]},{relation: "AND", data: [{colName: "dept_name", value: "", ruleType: "[like]"}]}]
           }
       }
        return await $http.post(url, req)
    }
    //获取发起人弹窗用户类型
    async getModUserOption(){
       let url = path+'/auth/select/srvsys_service_columnex_v2_select?colsel_v2=srvbms_user_select'
        let req={
            colNames: ["*"],
            serviceName:"srvsys_service_columnex_v2_select",
            order: [{colName: "seq", orderType: "asc"}],
            condition: [{colName: "service_name", value: "srvbms_user_select", ruleType: "eq"}, {colName: "use_type", value: "selectlist", ruleType: "eq"}]
        }
        return await $http.post(url, req)
    }
    //获取机构级联数据
    async getSelectDepCascader(conditions){
       let url=path+`/auth/select/srvauth_dept_select?srvauth_dept_select`
       let req={
           colNames: ["*"],
           condition:conditions,
           page: {pageNo: 1, pageSize: 2000},
           treeData: true,
           relation_condition: {},
           serviceName: "srvauth_dept_select"
       }
       return await $http.post(url, req)
    }
    //获取发起人弹窗表格数据
    async getPromoterTable(option){
       let url=path+`/auth/select/srvbms_user_select?srvbms_user_select`
        let req={
            colNames: ["*"],
            serviceName: "srvbms_user_select",
            vpage_no:option.vpage_no,
            query_source: "list_page",
            relation_condition:option.relation_condition,
            draft:false,
            order:option.order,
            page:option.page,
            condition:option.condition
        }
      return   await $http.post(url, req)
    }

     //获取机构编号弹窗机构分类
    async getInsSelectList(option){
       let url=path+`/auth/select/srvsys_service_columnex_v2_select?colsel_v2=srvauth_dept_workorder_select`
        let req={
           colNames: ["*"],
            serviceName: "srvsys_service_columnex_v2_select",
            order:[{colName: "seq", orderType: "asc"}],
            condition:[{colName: "service_name", value: "srvauth_dept_workorder_select", ruleType: "eq"}, {colName: "use_type", value: "selectlist", ruleType: "eq"}]
        }
       return  await $http.post(url, req)
    }

    //获取机构编号弹窗数据
    async getInsTable(option){
       let url= path+`/auth/select/srvauth_dept_workorder_select?srvauth_dept_workorder_select`
        let req={
            colNames: ["*"],
            serviceName: "srvauth_dept_workorder_select",
            vpage_no:option.vpage_no,
            query_source: "list_page",
            relation_condition:option.relation_condition,
            draft:false,
            order:option.order,
            page:option.page,
            condition:option.condition
        }
        return await $http.post(url, req)
    }
    //图片加载地址
    dowPicInfoUrl(){
       return path+`/file/download?bx_auth_ticket=${sessionStorage.getItem("bx_auth_ticket")}&filePath=`
    }
    //删除删除图片证据
    async deletePicInfo(params){
       let url= path+`/file/delete`
       let req= params
       return await $http.post(url, params);
    }
    //保存上传图片
    async savePicInfo(params){
       let url= path+`/file/operate/srvfile_icon_db_add`
       let req=[
           {
               condition:[],
               serviceName:"srvfile_icon_db_add",
               data:params
           }
       ]
       return await $http.post(url, req)
    }
    //根据no获取当前上传图片列表
    async getCurrentPicInfo(option){
       let url=path+ `/file/select/srvfile_attachment_select?srvfile_attachment_select`
        let req={
            colNames: ["*"],
            serviceName: "srvfile_attachment_select",
            page: null,
            relation_condition: option.relation_condition,
            order: [{colName: "seq", orderType: "asc"}],
            condition:option.condition
        }
       return await $http.post(url, req)
    }
    //根据更新指定图片信息
    async updatePicInfo(option){
        //
        let url=path+`/file/operate/srvfile_icon_db_update`
        let req=[
            {
                serviceName: "srvfile_icon_db_update",
                data:option.regInfo,
                condition:option.condition,
            }
        ]
        return await $http.post(url, req)
    }
    //根据ids获取指定图片保存信息
    async getPicInfoById(params){
      let url=path+`/file/select/srvfile_icon_db_select?srvfile_icon_db_select`
      let req={
          condition:params.condition,
          colNames: ["*"],
          draft: false,
          hisVer: true,
          query_source: "detail_page",
          serviceName: "srvfile_icon_db_select",
      }
      return await $http.post(url, req)
   }
   //发起工单提交
    async handleSubmitOrder(params){
       let url= path+ `/aud/add/srvaud_ads_workorder_add`
       let req=[
           {
               serviceName: "srvaud_ads_workorder_add",
               data:params,
               condition: []
           }
       ]
       return await $http.post(url, req)
    }
   //根据passid获取车辆通行流水
    async getCarWaysInfo(options){
       let url = path+ `/aud/select/srvaud_susvehpass_select?srvaud_susvehpass_select`
       let req={
           colNames: ["*"],
           draft: false,
           order: [],
           query_source: "list_page",
           serviceName: "srvaud_susvehpass_select",
           condition:options.condition,
           divCond:options.divCond,
           relation_condition: {relation: "AND", data: options.condition},
           page: {pageNo: 1, rownumber: 10}
       }
      return await $http.post(url, req)
    }
    //根据车辆流水内的出入时间及passid获取通行信息数据（收费站，门架）
    async getCarPathInfoById(options){
       let url = path+`/aud/select/srvaud_susvehpasspath_select`
       let req={
           colNames: ["*"],
           serviceName: "srvaud_susvehpasspath_select",
           condition:options.condition,
           divCond:options.divCond,
       }
       return await $http.post(url, req)
    }
  //获取车辆通行路径
    async getCarPathPoint(options){
       let url= path+`/aud/select/srvaud_susvehpasspath_select?srvaud_susvehpasspath_select`
       let req={
           colNames: ["*"],
           serviceName: "srvaud_susvehpasspath_select",
           draft: false,
           order: [],
           page: {pageNo: 1, rownumber: 10},
           query_source: "list_page",
           relation_condition: {},
           divCond:options.divCond,
           condition:options.condition,
       }
       return await $http.post(url, req)
    }
    //通行门架信息查询
    async getAllStations(option){
       let url = path+`/aud/select/srvaud_tollgrantry_station_aud_select`
       let req={
           colNames: ["*"],
           serviceName: "srvaud_tollgrantry_station_aud_select",
           draft: false,
           order: [],
           query_source: "list_page",
           page: {pageNo: 1, rownumber: 10},
       }
       return await $http.post(url, req)
    }
    //条件查询门架和收费站
    async  getAllStationByInfo(options){
       let url= path+`/aud/select/srvaud_tollgrantry_station_aud_select`
       let req={
         colNames: ["*"],
         condition:options.condition,
         page:options.page,
         serviceName: "srvaud_tollgrantry_station_aud_select",
         query_source: "list_page",
         relation_condition:options.relation_condition,
         draft: false,
         order: []
        }
      return await $http.post(url, req)
    }
    //百度路径规划调用(url包含整个请求的参数，测试环境使用互联网结构)
    async getBaiduMapRoute (ak,baseUrl,params){
        return await axios({
            url: baseUrl,
            method: 'GET',
            params: {
                ...params,
                ak,
                output: 'json'
            }
        })
    }
    //工单提交前检查是否允许提交
    async handleTestOrder (params){
       let url= path+`/aud/select/srvaud_workorder_passid_select`
        let req={
           colNames: ["*"],
           serviceName: "srvaud_workorder_passid_select",
           condition: [{"colName": "pass_id", "ruleType": "eq", value:params.pass_id}]

        }
      return await $http.post(url, req)
    }
    //远端中心调用查询车辆的通行信息接口，在初次进入地图时调用
    async getOriginCenterDetails(params){
       let url= path + `/aud/select/srvaud_audit_passconvdetail_ori_select`;
       let req={
          colNames: ["*"],
          serviceName: "srvaud_audit_passconvdetail_ori_select",
          condition:params.condition,
          divCond:params.divCond,
       }
       return await $http.post(url, req)
    }
    //本地服务中查询车辆通行信息接口（初次进入地图时使用，有数据就用，没有数据使用远端中心接口的返回数据）
    async getLocationCenterDetails(params){
        let url= path + `/aud/select/srvaud_audit_passconvdetail_select`;
        let req={
            colNames: ["*"],
            serviceName: "srvaud_audit_passconvdetail_select",
            condition:params.condition,
            divCond:params.divCond,
        }
        return await $http.post(url, req)
    }

    //调用计费查询接口获取根据passid查询获取的费用信息
    async getDriverFreeDetails(params){
       let url=path+`/calc/toll/fee`
       let data={
           passid:params.pass_id,
       }
       return await $http.post(url, data)
    }
    //地图界面保存时保存查询到的车辆通行信息
    async saveDriverDetails(params){
       let url= path+`/aud/add/srvaud_audit_passconv_add`
       let req=[{
           serviceName: "srvaud_audit_passconv_add",
           data:params,
           condition: []
       }]
      return $http.post(url, req)
    }
    //地图界面保存门架收费站信息
    async handleSubmitDoorAndStationDetails(params){
        let url= path+`/aud/add/srvaud_audit_passconvdetail_add`
        let req=[{
            serviceName: "srvaud_audit_passconvdetail_add",
            data:params,
            condition: []
        }]
        return $http.post(url, req)
    }
    //地图门架收费站删除
    async handleDeleteStationDetails(params){
       let url= path+`/aud/delete/srvaud_audit_passconvdetail_delete`
       let req=[{
           serviceName: "srvaud_audit_passconvdetail_delete",
           condition:params,
       }]
       return $http.post(url, req)
    }

    //查询提交参数汇总，传入服务名称
    async getPublicColName (col){
       let url= path+`/aud/select/srvsys_service_columnex_v2_select?${col}`
       let req={
           colNames: ["*"],
           serviceName:"srvsys_service_columnex_v2_select",
           order: [{colName: "seq", orderType: "asc"}],
           condition: [{colName: "use_type", value: "add", ruleType: "eq"},{colName: "service_name", value:col, ruleType: "eq"}]
       }
      return await $http.post(url,req)
    }
    //获取工单提交信息表单字典
    async getOrderFormList(){
        let url= path+`/aud/select/srvsys_service_columnex_v2_select?colsel_v2=srvaud_ads_workorder_add`
        let req = {
            serviceName:"srvsys_service_columnex_v2_select",
            colNames: ["*"],
            condition: [
                {colName: "service_name", value: "srvaud_ads_workorder_add", ruleType: "eq"},
                {colName: "use_type", value: "add", ruleType: "eq"}
            ],
            order: [{colName: "seq", orderType: "asc"}],
        };
        return $http.post(url, req)
    }
    //经营管理单位
    async getRelevantList(params){
       let url= path+`/aud/select/srvaud_workorder_organ_select`
       let req={
           colNames: ["*"],
           condition:params.condition,
           divCond:params.divCond,
           query_source: "list_page",
           order:[],
           page:{pageNo: 1, rownumber: 10},
           serviceName:"srvaud_workorder_organ_select",
           draft: false
       }
      return await $http.post(url,req)
    }
}