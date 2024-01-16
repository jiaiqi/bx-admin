<template>
    <div class="web-layout bg-light">
        
        <!-- <cMap></cMap> -->
        <BMapJs :depts="depts" :modeUrl="urlPath" :no="no"></BMapJs>
    </div>
    
</template>
  
  <script>
  
// import store from '@/store'
  
  
// import { getWebSitePcCarousel,friendLinks,getListData } from '@/api/api.js'

import BMapJs from "./components/bmap-web.vue"




  export default {
    name: 'b-map-index',
    components: {BMapJs},
    props: {
      msg: String
    },
    computed:{
        
        urlParams(){
            let params = this.$route.query
            return params
        },
        urlPath(){
            let routePath = this.$route.path
            let path = ''
            if(routePath.indexOf('/bmap/editor/') !== -1){
                path = '/bmap/editor/'
            }else if(routePath.indexOf('/bmap/check') !== -1){
                path = '/bmap/check'
            }
            return path
        },
        no(){
            let params = this.$route.params
            params = params.no || ''
            return params
        }
    },
    data(){
        return {
            depts:[]
        }
    },
    created(){
    },
    mounted(){
        if(this.urlPath.indexOf('/bmap/editor/') !== -1){

        }else if(this.urlPath.indexOf('/bmap/check') !== -1){
            this.getAllDepts()
        }
        
    },
    methods:{
        getAllDepts(){
            // 查询所有分公司信息
            let self = this
            // category取值：门架、收费站
            // grantry_type取值：路段门架、虚拟门架、省界门架、收费站
            // company_no：分公司，可通过该字段进行过滤，分公司用户登录时，使用用户的dept_no进行过滤
            let srv = 'srvauth_dept_select';
            let srvAuth = 'auth'
            let conds = [{
                colName:'dept_class',
                ruleType:'eq',
                value:'dept_type01'
            }]
            let relationCondition = {}
            let page = null
            let order = null
            self.select(
                srv,
                conds,
                page,
                order,
                null,
                null,
                srvAuth,
                null,
                null,
                relationCondition,
                false,
                null,
                // srvAuth
              ).then(res => {
                // console.log('分公司',res.data)
                res = res.data
                if(res.state == "SUCCESS"){
                    // depts
                    self.depts = res.data.map(item => item)
                    // console.log('分公司',res.data)
                }else{
                    console.log('查询分公司信息 异常',res)
                }
              })
        }
    }

  }
  </script>
  
  <!-- Add "scoped" attribute to limit CSS to this component only -->
  <style lang="scss" scoped>
  .web-layout{
    .web-layout-content{
        position: relative;
    }
  }
  </style>
  