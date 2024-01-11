<template>
    <div class="web-layout bg-light">
        
        <!-- <cMap></cMap> -->
        <BMapJs></BMapJs>
    </div>
    
</template>
  
  <script>
  
// import store from '@/store'
  
  
// import { getWebSitePcCarousel,friendLinks,getListData } from '@/api/api.js'

import BMapJs from "./components/bmap-web.vue"




  export default {
    name: 'b-map',
    components: {BMapJs},
    props: {
      msg: String
    },
    computed:{
        activeNav(){
            let key = store.getters.getActiveNav 
            key = key ? key.key : ''
            return key
        }
    },
    data(){
        return {
            
        }
    },
    created(){
    },
    mounted(){
        // if(store){
        //     let navs = store.getters.getNavs
        //     navs = navs.filter(item => item.href == '/' || item.href == '#' || item.href == '/index')
        //     if(navs.length == 1){
        //         store.commit('setActiveNav',navs[0]) 
        //     }
        // }
         
        // this.getLinks()
    },
    methods:{
        onClick(e){
            this.active = e
        },
        onCarousel(e){
            // 获取点击反馈的轮播图中设置的跳转文章编号
            console.log(e)
            if(e._data && e._data.link_content){
                this.getDetail(e._data.link_content)
            }
        },
        getDetail(no){
            // 查询文章详情
            let serviceName = 'srvdaq_pc_website_content_select'
            let req = {
                "serviceName": serviceName,
                "colNames": [
                    "*"
                ],
                "condition": [
                    {
                        "colName": "content_no",
                        "ruleType": "eq",
                        "value": no
                    }
                ],
                "page": {
                    "pageNo": 1,
                    "rownumber": 999
                },
                "order": []
            }
            getListData (req,null,serviceName).then(res=>{
                // console.log(res)
                // 查询数据
                if(res.state == "SUCCESS"){
                    let content = res.data[0]
                    console.log(content)
                    // this.$set(this,'loadData',content)
                    if(content && content.category_no_path){
                        // 存在文章数据和栏目path时 处理跳转逻辑
                        let noPath = content.category_no_path
                        let root = noPath.split('/').filter(item => item)[0]
                        let active = content.category_no

                        let rootNavbar = store.getters.getNavs
                        rootNavbar = rootNavbar.filter(item => item.key == root)[0]
                        let path = rootNavbar.href 
                        let layoutType = 'none'
                        
                        
                        
                        
                        if(rootNavbar && rootNavbar.level !== 1){
                            root = rootNavbar.path.split('/').filter(item => item)[0]
                            if(root){
                                let loadRootNavBar = this.getNavBarData(root)
                                path = loadRootNavBar.href
                                store.commit('setActiveNav',loadRootNavBar) 
                            }
                            
                        }else{
                            store.commit('setActiveNav',rootNavbar) 
                        }
                    
                        if(path == '/'){
                            let to =  this.getNavBarData(this.no)
                            path = to.href
                            root = to.key 
                            store.commit('setActiveNav',to) 
                        }
                        if(path && path.indexOf('?') !== -1){
                            // 处理模板参数
                            let pathParams = path.split('?')[1]
                            path = path.split('?')[0]
                            layoutType = pathParams.split('=')[1]
                        }
                        if(path && path.indexOf(':') !== -1){
                            path = path.split(':')[0]
                        }
                        if(!path){
                            let onItem = e
                            path = onItem.category_no_path
                            if(path){
                                path = path.split('/')
                                path = path.filter(item => item)
                                if(Array.isArray(path) && path.length > 1){
                                    root = path[0]
                                    path = 'homePage'

                                    let navs = store.getters.getNavs
                                    navs = this.getTree(navs,'key','parent_no',root)
                                    if(navs.length == 1){
                                        navs = navs[0]
                                        store.commit('setActiveNav',navs)   
                                    }
                                }
                            }
                        }
                        this.$router.push(`/${path}/${root}/${content.category_no}/detail/${content.id}/${layoutType}`)
                    }
                    
                }
            })
        },
        toPage(url){
            let no = url.layoutNo
            if(no){
                let navs = store.getters.getNavs
                let active = this.getTree(navs,'key','parent_no',no)
                let root = null
                if(active.length == 1){
                    active = active[0]
                    if(active.parent_no){
                        root = this.getTree(navs,'key','parent_no',active.parent_no)
                        if(root.length == 1){
                            root = root[0]
                        }
                    }else{
                        root = active
                    }
                }
                if(active.children && active.children.length > 0){
                    active = active.children[0]
                }
                
                store.commit('setActiveNav',root) 

                
                this.toHomePage(active,root.key)
            }
        },
        getLinks(){
            let no = this.webConfig.webNo
            let req = {
            "serviceName": "srvcms_friend_links_select",
            "colNames": [
                "*"
            ],
            "condition": [
                {
                "colName": "website_no",
                "ruleType": "eq",
                "value": no
                },
                {
                "colName": "display",
                "ruleType": "eq",
                "value": '是'
                }
            ],
            "relation_condition": {},
            "page": {
                "pageNo": 1,
                "rownumber": 999
            },
            "order": [],
            "draft": false,
            "query_source": "list_page"
            }
            // friendLinks(req).then((res) => {
            //     // console.log('友情链接',res)
            //     this.links = res.data.map(item => item)
            // })
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
  