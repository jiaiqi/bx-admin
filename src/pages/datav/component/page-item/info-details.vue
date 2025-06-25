<template>
  <div class="info_details">
    11111
  </div>
</template>

<script>
import {$http} from "@/common/http";

export default {
  name: "info-detailsl",
  data() {
    return {
      infoDetails:[]
    }
  },
  props: {
    pageItem:{
      type:Object,
    },
    pageParamsModel:{
      type:Object,
    }
  },

  computed:{
    setDataInfo(){
      return this.pageItem.srv_req_type==='请求数据'? this.pageItem.srv_req_json:null
    },
    textStyle(){
      let style = this.pageItem.style_json
      if(style){
        return{
          color:style.color,
          fontSize:style.font_size,
          fontWeight:style.font_weight,
          textAlign:style.text_align
        }
      }else {
        return {}
      }
    },
  },
  created(){
    this.initInfoDetails();
  },
  methods:{
    initInfoDetails(){
      if(!this.setDataInfo) return this.infoDetails=[]
      const req = this.setDataInfo ? this.buildRequestParams(this.setDataInfo) : this.setDataInfo;
      let setParams={
        page:req.page,
        serviceName:req.serviceName,
        mdata:true,
        colNames:['*'],
      }
     this.getInfoData(req,setParams)
    },
   async getInfoData (req,params){
      const url = `/${req.mapp}/select/${req.serviceName}`;
      const res = await $http.post(url, params);
    },
    buildRequestParams(e){
      // 处理请求中变量 根据参数关系 获取动态值
      let condition = this.bxDeepClone(e.condition);
      if (Array.isArray(condition)) {
        for (let cond of condition) {
          // console.log("buildRequestParams", cond.colName, cond.value);
          if (
              cond.value &&
              cond.value.startsWith("${") &&
              cond.value.endsWith("}")
          ) {
            // 根据${} 格式转移变量名称
            let par = cond.value.replace("${", "");

            par = par.replace("}", "");
            let params = this.bxDeepClone(this.pageParamsModel);
            if (params && Object.keys(params).length > 0) {
              for (let key in params) {
                // console.log('key',key,par)
                if (key === par) {
                  let mapsCol = mapsJonss.filter(
                      (item) => item.col_to === par || item.col_from === par
                  );
                  if (Array.isArray(mapsCol) && mapsCol.length > 0) {
                    // 遍历组件参数 映射
                    let model = null;
                    for (let col of mapsCol) {
                      switch (col.from_type) {
                        case "页面":
                          // 来源为页面
                          model = this.pageParamsModel;
                          switch (col.to_type) {
                            case "组件":
                              // 目标为组件的参数，设置动态获取的值
                              cond.value = this.pageParamsModel[key].value;
                              if (
                                  cond.value === undefined &&
                                  cond.ruleType === "eq"
                              ) {
                                cond.ruleType = "like";
                              }
                              break;
                            case "页面":
                              break;

                            default:
                              break;
                          }
                          break;

                        default:
                          break;
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
      e.condition = this.bxDeepClone(condition);
      // console.log(e.serviceName,condition)
      return e;
    }
  }
}
</script>
<style scoped lang="scss">
.info_details {
  box-sizing: border-box;
  padding:0.625rem;
  width: 100%;
  height:auto;
}
</style>