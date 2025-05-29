import {$http} from "@/common/http";

export default class OrderApi{

    //获取进入表单时的发起人信息数据
   async getPromoterInfo(){
      let user=top.user?top.user.user_no:'wuhao'
      let req={
          colNames: ["*"],
          serviceName:"srvbms_user_select",
          queryMethod:"select",
          condition: [{colName: "user_no", value:'wuhao', ruleType: "eq"}]
      }
      let url=window.APP_CONFIG.API_URL+`/auth/select/srvbms_user_select`
        return await $http.post(url, req)
    }

    async postPromoterInfo(dep){
        let url=window.APP_CONFIG.API_URL+`/auth/select/srvauth_dept_workorder_select`
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
       let url=window.APP_CONFIG.API_URL+`/auth/select/srvauth_dept_workorder_select`
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
       let url = window.APP_CONFIG.API_URL+'/auth/select/srvsys_service_columnex_v2_select?colsel_v2=srvbms_user_select'
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
       let url=window.APP_CONFIG.API_URL+`/auth/select/srvauth_dept_select?srvauth_dept_select`
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
       let url=window.APP_CONFIG.API_URL+`/auth/select/srvbms_user_select?srvbms_user_select`
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
       let url=window.APP_CONFIG.API_URL+`/auth/select/srvsys_service_columnex_v2_select?colsel_v2=srvauth_dept_workorder_select`
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
       let url= window.APP_CONFIG.API_URL+`/auth/select/srvauth_dept_workorder_select?srvauth_dept_workorder_select`
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
       return window.APP_CONFIG.API_URL+`/file/download?bx_auth_ticket=${sessionStorage.getItem("bx_auth_ticket")}&filePath=`
    }
    //删除删除图片证据
    async deletePicInfo(params){
       let url= window.APP_CONFIG.API_URL+`/file/delete`
       let req= params
       return $http.post(url, params);
    }
    //保存上传图片
    async savePicInfo(params){
       let url= window.APP_CONFIG.API_URL+`/file/operate/srvfile_icon_db_add`
       let req=[
           {
               condition:[],
               serviceName:"srvfile_icon_db_add",
               data:params
           }
       ]
       return $http.post(url, req)
    }
    //根据no获取当前上传图片列表
    async getCurrentPicInfo(option){
       let url=window.APP_CONFIG.API_URL+ `/file/select/srvfile_attachment_select?srvfile_attachment_select`
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
        let url=window.APP_CONFIG.API_URL+`/file/operate/srvfile_icon_db_update`
        let req=[
            {
                serviceName: "srvfile_icon_db_update",
                data:option.regInfo,
                condition:option.condition,
            }
        ]
        return $http.post(url, req)
    }
    //根据ids获取指定图片保存信息
    async getPicInfoById(params){
      let url=window.APP_CONFIG.API_URL+`/file/select/srvfile_icon_db_select?srvfile_icon_db_select`
      let req={
          condition:params.condition,
          colNames: ["*"],
          draft: false,
          hisVer: true,
          query_source: "detail_page",
          serviceName: "srvfile_icon_db_select",
      }
      return $http.post(url, req)
   }
   //发起工单提交
    async handleSubmitOrder(params){
       let url= window.APP_CONFIG.API_URL+ `/aud/operate/srvaud_ads_workorder_add`
       let req=[
           {
               serviceName: "srvaud_ads_workorder_add",
               data:params,
               condition: []
           }
       ]
       return $http.post(url, req)
    }

}