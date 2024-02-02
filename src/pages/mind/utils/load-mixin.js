import {walk} from 'simple-mind-map/src/utils'
export default {
    data() {
        return {
            routeMade:'norm', // 'norm' 'cust'
            v2:null,
            searchValue:'',
            treeData:[],
            mindConfig:{},
            loadMindDatas:{},
            dataTemp:{
                data:{
                    // 节点文本
                    text: '新导图',
                    // 图片
                    // image: '',
                    // imageTitle: '图片名称',
                    // imageSize: {
                    //     width: 1152,
                    //     height: 1152
                    // },
                    // 图标
                    // icon: ['priority_1'],
                    // 标签
                    // tag: ['标签1', '标签2'],
                    // 链接
                    // hyperlink: 'http://lxqnsys.com/',
                    // hyperlinkTitle: '理想青年实验室',
                    // 备注内容
                    // note: '理想青年实验室\n一个有意思的角落',
                    // 概要
                    // generalization: {
                    //     text: '概要的内容'
                    // },
                    // 节点是否展开
                    expand: true,
                },
                "children": [
                    // {
                    // "data": {
                    //     "text": "新节点"
                    // },
                    // "children": []
                    // },
                    // {
                    // "data": {
                    //     "text": "新节点"
                    // },
                    // "children": []
                    // }
                ]
            }
        }
    },
    
    computed: {
        rootNodeNo(){
            let no = this.mindConfig.rootNodeNo || this.$route.params.rootNo
            return no
        },
        imgReqModel(){
            let model = this.bxDeepClone(this.imageMode)
            model['app_no'] = this.query.app
            return model
        },
        themeListDefault(){
            let list = 'themeList'
            return list
        },
        query(){
            let query = this.$route.query
            // url 获取参数
            if(query){
                if(!query.serviceName){
                    query['serviceName'] = ''
                }
                if(!query.app){
                    query['app'] = ''
                }
                if(!query.no){
                    query['no'] = ''
                }
            }
            return query
        },
        remoteColMaps(){
            let map ={}
            let config = this.mindConfig.mindbizJson.col
            if(config){
                map = this.bxDeepClone(config)
            }

            return map
        },
        nodeSrvApp(){
            // 配置的app
            let result = null
            let app = this.mindConfig.mindbizJson.srv.srv_mapp
            if(app){
                // 深度复制
                result = app
            }
            return result
        },
        nodeSelectRequest(){
            // 查询节点动态请求
            let result = null
            let serviceName = this.mindConfig.mindbizJson.srv.srv_select
            let req = {
                serviceName: serviceName
            }
            let rootNo = this.rootNodeNo
            if(rootNo){
                req['colNames'] = ['*']
                req['condition'] = [
                    // 根节点编号查询
                    // {
                    //     colName:'no',
                    //     ruleType:'eq',
                    //     value:this.mindConfig.rootNodeNo
                    // }
                    // 根节点编号查询 path
                    {
                        colName:'path',
                        ruleType:'[like]',
                        value:rootNo
                    }
                ]
                // req['treeData'] = true
                // req["use_type"]='treelist'
            }
            if(serviceName){
                // 深度复制
                result = this.bxDeepClone(req)
            }
            return result
        },
        nodeAddRequest(){
            // 新增节点动态请求
            let result = null
            let serviceName = this.mindConfig.mindbizJson.srv.srv_add
            let req = {
                serviceName: serviceName
            }
            let mindMap = this.mindMapModel // 导图实例
            
            
            if(!this.rootNodeNo && mindMap){
                let rootUid = mindMap.getData()
                console.log('node add request', rootUid)
                req['data'] = [this.getRemoteData(rootUid.data)]
            }
            if(serviceName){
                // 深度复制
                result = [this.bxDeepClone(req)]
            }
            return result
        },
        nodeUpdateRequest(){
            // 修改节点动态请求
            let result = null
            let serviceName = this.mindConfig.mindbizJson.srv.srv_update
            let req = {
                serviceName: serviceName
            }
            if(serviceName){
                // 深度复制
                result = this.bxDeepClone(req)
            }
            return result
        },
        nodedeleteRequest(){
            // 删除节点动态请求
            let result = null
            let serviceName = this.mindConfig.mindbizJson.srv.srv_delete
            let req = {
                serviceName: serviceName
            }
            if(serviceName){
                // 深度复制
                result = this.bxDeepClone(req)
            }
            return result
        },
        mindUpdateRequest(){
            // 脑图实例修改请求  根据原始脑图数据 例如更新 根节点后 提交回填修改请求使用。
            let result = null
            let serviceName = 'srvtools_mind_map_subject_update'
            let mind =  this.bxDeepClone( this.mindConfig.oldMind) // 原始数据
            let mainMind = this.bxDeepClone( this.mindConfig.mainMind) // 绑定数据
            let req = {
                serviceName: serviceName,
                condition:[{
                    colName:'mind_no',
                    ruleType:'eq',
                    value:mind.mind_no
                }]
            }
            let data = {}
            for(let okey in mind){
                if(mainMind[okey] != mind[okey] && !['mindbiz_json'].includes(okey)){
                    data[okey] = mainMind[okey]
                }
            }
            if(serviceName && Object.keys(data).length > 0){
                // 深度复制  修改请求 Array
                req['data'] = [data]
                result = [this.bxDeepClone(req)]
            }
            return result
        },
    },
    methods: {
        
        onNodeUpdate(nNode){
            // 检测节点信息修改
            console.log(nNode)
            let req = this.bxDeepClone(this.nodeUpdateRequest) // 修改请求 
            let no = nNode[this.remoteColMaps['col_no']] || nNode.no
            let old = null
            let data = {}
            let colName = this.remoteColMaps['col_no'] || 'no'
            if(no){
                req['condition'] = [{
                    colName:colName,
                    ruleType:'eq',
                    value:no
                }] // 构造修改条件
                old = this.mindConfig.oldNodes.filter(item => item[colName] == no)
                if(Array.isArray(old) && old.length == 1){
                    // 存在原始数据
                    old = old[0]
                    // 节点原始数据
                    for(let key in nNode){
                        // 对比原始数据 修改了那些
                        if(nNode[key] !== old[key]){
                            data[key] = nNode[key]
                        }
                    }
                    console.log(data,req)
                    if(Object.keys(data).length > 0){
                        // 存在有效data 时 提交修改请求
                        req['data'] = [data]
                        this.submitChange('update',req).then( r => {
                            console.log(r)
                            if(r){
                                // 修改成功刷新mind
                                this.initPage().then(res => {
                                    console.log('init Page',res)
                                    if(res){
                                        // this.initMind(this.dataTemp)
                                        
                                    }
                                })  // 加载数据
                            }
                            
                        })
                    }
                }
                
            }
        },
        remoteToMindNodes(){
            this.buildMindData() // 远程数据 转 mind 数据
        },
        buildMindData(no){
            let rootNodeNo = this.rootNodeNo
            let datas = this.bxDeepClone(this.mindConfig.oldNodes)   // 脑图已保存的节点原始数据
            let root = {
                data:null,
                children:[]
            }
            let noColName = this.remoteColMaps['col_no'] || 'no'
            let rootData = datas.filter(item => item[noColName] == rootNodeNo)[0]
            root['data'] = this.getMindNodeData(rootData).data
            root['children'] = this.getMindNodeData(rootData).children
            // obj.data = 
            console.log('build Mind Data',rootData,root)
            this.$set(this,'dataTemp',this.bxDeepClone(root) )  // UI数据
            this.$set(this,'loadMindDatas',this.bxDeepClone(root) ) // 初始数据
            this.setMindData(this.bxDeepClone(root)) // 动态更新数据
        },
        getMindNodeData(item){
            //获取 mind 数据 item 远程行数据  远程行数据转换为 组件数据
            
            let datas = this.bxDeepClone(this.mindConfig.oldNodes)   // 脑图已保存的节点原始数据
            let obj = {}
            let maps = this.remoteColMaps // 映射
            let no = maps['col_no'] ||  'no'
            if(item && maps){
                let data = {}
                let children = datas.filter(c => c.parent_no == item[no])
                for(let key in item){
                    if(key == 'no' || key == 'col_no' ){
                        // id
                        data['no'] = item[key]
                    }
                    if(key == maps.col_no && maps.col_no){
                        data['no'] = item[key]
                    }
                    if(key == maps.col_seq && maps.col_seq){
                        // 排序字段
                        data['seq'] = item[key]
                    }
                    if(key == maps.col_title && maps.col_title){
                        // 文字内容
                        data['text'] = item[key]
                    }
                    if(key == maps.col_fold && maps.col_fold){
                        // 展开状态
                        data['expand'] = item[key] === '是' ? true : false
                    }
                    if(key == maps.col_image && maps.col_image){
                        // data['image'] = this.getImagePath(item[key]) 
                    }else if(key == 'image'){
                        let img = item[key]
                        if(img){
                            if(img.indexOf('{') !== -1){
                                img = JSON.parse(img)
                                data['image'] = this.getImagePath(img['no']) 
                                data['imageSize'] = img['size'] 
                                data['imageSize']['custom'] = false
                            }
                        }
                        // data['image'] = this.getImagePath(item[key]) 
                    }
                    if(key == maps.col_parent_no && maps.col_parent_no){
                        data['parent_no'] = item[key]
                    }
                    if(key == maps.col_seq && maps.col_seq){
                        data['seq'] = item[key]
                    }else{
                        data['seq'] = item['seq']
                    }
                    

                    
                    // 样式
                    if(key == maps.col_style && maps.col_style){
                        let style = item[key]
                        if(style){
                            style = JSON.parse(style)
                            Object.assign(data,style)
                        }
                    }
                    // 子节点
                    if(key == 'children'){
                        let children = this.bxDeepClone(item[key])
                        if(Array.isArray(children) && children.length > 0){
                            
                            for(let c of children){
                                children.push(this.getMindNodeData(c))
                            }
                        }
                    }
                    
                    // console.log(key,item,obj)
                }
                obj['data'] = this.bxDeepClone(data)
                if(children.length > 0){
                    obj['children'] = []
                    for(let child of children){
                        let mc = this.getMindNodeData(child)
                        obj['children'].push(this.bxDeepClone(mc))
                    }
                }else{
                    obj['children'] = []
                }
                
            }
            console.log('getMindNodeData',obj)
            return obj
        },
        getRemoteData(node,pNo){
            // 获取远程数据 node mind 数据
            let data = {}
            let maps = this.remoteColMaps
            if(node && maps){
                for(let key in node){
                    if(key == 'text' && maps.col_title){
                        data[maps.col_title] = node[key]
                    }
                    
                    if(key == 'expand' && maps.col_fold){
                        data[maps.col_fold] = node[key] === true ? '是' : '否'
                    }
                    if(key == 'no' && maps.col_no){
                        data[maps.col_no] = node[key]
                    }
                    if(key == 'parent_no'){
                        data['parent_no'] = node[key]
                    }
                    // if(key == 'image'){
                    //     data['image'] = this.getImagePath(node[key]) 
                    // }
                    
                    
                    // console.log(key,node)
                }
                if(pNo){
                    data['parent_no'] = pNo
                }
                
            }
            data = this.bxDeepClone(data)
            return data

        },
        async getFullData(mindMap) {
            return await new Promise(function (resolve, reject) {
                if (mindMap) {
                    let data = mindMap.getData(true)
                    console.log('full data:', data)
                    resolve(data)
                } else {
                    resolve(false)
                }
            })
        },
        getV2(){
            let self = this
            let serviceName = self.query.serviceName
            let app = self.query.app
            let req = {
                "serviceName": "srvsys_service_columnex_v2_select",
                "colNames": [
                    "*"
                ],
                "condition": [
                    {
                        "colName": "service_name",
                        "value":serviceName,
                        "ruleType": "eq"
                    },
                    {
                        "colName": "use_type",
                        "value": "list",
                        "ruleType": "eq"
                    }
                ],
                "order": [
                    {
                        "colName": "seq",
                        "orderType": "asc"
                    }
                ]
            }
            const url = self.getServiceUrl("select", "srvsys_service_columnex_v2_select", app);
            self.$axios.post(url, req).then(res => {
                    let page = res.data
                    console.log(page)
                    if (page.state === "SUCCESS" && page.data) {
                        
                        this.$set(this,'v2',page.data)
                    }
                    
                   
                    // return this.initPageParams().then((r) => {
                    //   if (r) {
                    //     return new Promise(function(resolve, reject) {
                    //       resolve(true)
                    //     })
                    //   } else {
                    //     return new Promise(function(resolve, reject) {
                    //       resolve(false)
                    //     })
                    //   }
                    // })
              })
        },
        async getCustConfig(){
            let self = this
            // self.getV2()
            let serviceName = 'srvpage_cfg_com_mind_map_select'
            
            let app = 'config'
            let mindbizNo = self.$route.params.mindbizNo
            const req = {
                "serviceName": serviceName,
                "colNames": [
                  "*"
                ],
                "condition": [{
                    colName:'mindbiz_no',
                    ruleType:'eq',
                    value:mindbizNo
                }]
              }
              // treeData 3000条， 普通查询500条
            const url = self.getServiceUrl("select", serviceName, app);
            console.log('init url',url)
            if(!mindbizNo){
                return false
            }else{
                return  self.$axios.post(url, req).then(res => {
                    let page = res.data
                    console.log('getCustConfig',page)
    
                    return new Promise(function(resolve, reject) {
                            if (page.state === "SUCCESS" && Array.isArray(page.data) && page.data.length == 1) {
                                let mind = page.data[0]
                                console.log(mind,page.data)
                                if(mind && mind.mindbiz_json){
                                 // 是否有配置业务 有序列化json
                                     mind.mindbiz_json = JSON.parse(mind.mindbiz_json)
                                     self.$set(self.mindConfig,'mindbizJson',mind.mindbiz_json)
                                     
                                     self.$set(self.mindConfig,'mindCustConfig',self.bxDeepClone({...mind,...mind.mindbiz_json}))  // 原始数据
                                }
                                self.$set(self.mindConfig,'rootNodeNo',mind.top_node_no)  // 当前脑图根节点编号
                                self.$set(self.mindConfig,'oldMind',self.bxDeepClone(mind))  // 原始数据
                                self.$set(self.mindConfig,'mainMind',self.bxDeepClone(mind))  // 原始数据
                                self.$set(self,'defaultTheme', 'classic4')  // 主题
                                self.$set(self,'defaultLayout', mind.mind_style || '')  // 主题
                                self.submitChange('select').then(r => {
                                   
                                    console.log('select nodes',r)
                                    if(Array.isArray(r)){
                                        self.$set(self.mindConfig,'oldNodes',r)
                                        self.remoteToMindNodes()
                                    }
                                    
                                    resolve(true)
                                })
                                
                             }else{
                                resolve(false)
                             }
                    })
    
                  
                }).catch(err=>{
                    console.log(err)
                })
            }
            
        },
        async initPage(isAll){
            // 根据脑图编号查询脑图实例
            let self = this
            self.getV2()
            let serviceName = this.query.serviceName
            
            let app = this.query.app
            const req = {
                "serviceName": serviceName,
                "colNames": [
                  "*"
                ],
                "condition": [{
                    colName:'mind_no',
                    ruleType:'eq',
                    value:this.query.no
                }]
              }
              // treeData 3000条， 普通查询500条
            const url = self.getServiceUrl("select", serviceName, app);
            console.log('init url',url)
            if(self.mindConfig && self.mindConfig.oldMind && !isAll){
                // 只加载节点数据
                return new Promise(function(resolve, reject) {
                    self.submitChange('select').then(r => {
                           
                        console.log('select nodes',r)
                        if(Array.isArray(r)){
                            self.$set(self.mindConfig,'oldNodes',r)
                            self.remoteToMindNodes()
                        }
                        
                        resolve(true)
                    })
                })
            }else{
                // 加载图表
                return  self.$axios.post(url, req).then(res => {
                    let page = res.data
                    console.log(page)
    
                    return new Promise(function(resolve, reject) {
                            if (page.state === "SUCCESS" && Array.isArray(page.data) && page.data.length == 1) {
                                let mind = page.data[0]
                                console.log(mind,page.data)
                                if(mind && mind.mindbiz_json){
                                 // 是否有配置业务 有序列化json
                                     mind.mindbiz_json = JSON.parse(mind.mindbiz_json)
                                     self.$set(self.mindConfig,'mindbizJson',mind.mindbiz_json)
                                }
                                self.$set(self.mindConfig,'rootNodeNo',mind.top_node_no)  // 当前脑图根节点编号
                                self.$set(self.mindConfig,'oldMind',self.bxDeepClone(mind))  // 原始数据
                                self.$set(self.mindConfig,'mainMind',self.bxDeepClone(mind))  // 原始数据
                                self.$set(self,'defaultTheme', 'classic4')  // 主题
                                self.$set(self,'defaultLayout', mind.mind_style || '')  // 主题
                                self.submitChange('select').then(r => {
                                   
                                    console.log('select nodes',r)
                                    if(Array.isArray(r)){
                                        self.$set(self.mindConfig,'oldNodes',r)
                                        self.remoteToMindNodes()
                                    }
                                    
                                    resolve(true)
                                })
                                
                             }else{
                                resolve(false)
                             }
                    })
    
                  
                }).catch(err=>{
                    console.log(err)
                })
            }
            
          },
          buildMindDatas(list){
            let treeData = []
            if(this.query.no && this.query.pNo && this.query.title && Array.isArray(list)){
                 let treeData = list.filter(item => !item[this.query.pNo])
                 if(Array.isArray(treeData) && treeData.length > 0){
                    for(let root of treeData){
                        let no = roow[this.query.no]
                            if(no){
                                root['children'] = this.buildChildren(no,list)
                            }
                    }
                 }


            }
          },
          buildChildren(no,list){
             let children = list.filter(item => item[this.query.pNo] == no)
             return children
          },
          submitChange(type,data){
            let url = ''
            let reqType = ''
            let req = null
            let serviceName = ''
            switch (type) {
                case 'add':
                    // 节点新增
                    req = this.bxDeepClone(this.nodeAddRequest)
                    reqType = 'operate'
                    if(data){
                        if(data.no){
                            delete data.no
                        }
                        req[0]['data'] = [data]
                    }
                    break;
                case 'update':
                    // 节点修改
                    req = this.bxDeepClone(this.nodeUpdateRequest)
                    reqType = 'operate'
                    if(data){
                        req = [].concat(data)
                    }
                    break;
                
                case 'delete':
                    // 节点删除
                    req = this.bxDeepClone(this.nodeDeleteRequest)
                    reqType = 'operate'
                    break;
                case 'select':
                    // 节点
                    req = this.bxDeepClone(this.nodeSelectRequest)
                    let seq = "seq"
                    if(this.routeMade == 'cust'){
                        seq = this.mindConfig.mindCustConfig.col_seq
                    }
                    req['order'] = [{
                        "colName": seq,
                        "orderType": "asc"
                    }]
                    reqType = 'select'
                    break;
            
                default:
                    // 修改脑图数据
                    req = this.bxDeepClone(this.mindUpdateRequest)
                    reqType = 'operate'
                    break;
            }
            if(req && reqType){
                if(Array.isArray(req)){
                    // 新增请求是数组
                    serviceName = req[0].serviceName
                }else{
                    // 查询请求时对象
                    serviceName = req.serviceName
                }
                url =  this.getServiceUrl(reqType, serviceName, this.nodeSrvApp);
            }
            if((type == 'add' && req[0].data.length > 0  && Object.keys(req[0].data[0]).length > 0) || ((!type || type == 'update' || type == 'delete') && Array.isArray(req[0].condition) && req[0].condition.length > 0 && req[0].data.length > 0) || (type == 'select' && req.condition)){
                // 判断 请求结构是否基本完整
                return  this.$http.post(url, req).then(res => {
                    let page = res.data
                    console.log(page)
                    return new Promise(function(resolve, reject) {
                        let result = null
                        if(type == 'add'){
                            if(page.state == 'SUCCESS'){
                                // 根据新增请求 返回的数据结构 返回有效数据
                                result = page.response[0].response.effect_data[0]
                            }
                        }
                        if(type == 'select'){
                            if(page.state == 'SUCCESS'){
                                // 根据新增请求 返回的数据结构 返回有效数据
                                result = page.data
                            }
                        }
                        if(type == 'update'){
                            if(page.state == 'SUCCESS'){
                                // 根据修改请求 返回的数据结构 返回有效数据
                                result = page.response[0].response.effect_data[0]
                            }
                        }
                        if(page.state == 'FAILURE' && page.resultCode == '9999'){
                            this.setMode('readonly')
                            this.setLoading(true,'无权限')
                            resolve(false)  // 完成 promise
                        }else{
                            resolve(result)  // 完成 promise
                        }
                        
                    })
    
                  
                }).catch(err=>{
                    console.log(err)
                })
            }else{
                return new Promise(function(resolve, reject) {
                    let result = null
                    resolve(result)
                })
            }
            console.log(url,req)
          },
          updateNodeStyle(no,newStyle){
            console.log('updateNodeStyle',no,newStyle)
            let self = this
             let oldNode = this.mindConfig.oldNodes.filter(item => item.no == no)  
             // 节点原始数据
             if(Array.isArray(oldNode) && oldNode.length == 1){
                let updateReq = this.bxDeepClone(this.nodeUpdateRequest)
                updateReq['condition'] = [{
                    colName:'no',
                    ruleType:'eq',
                    value:no
                }]
                oldNode = oldNode[0]
                let oldStyle = oldNode[this.remoteColMaps.col_style]
                if(newStyle && no){
                    // 如果有新样式
                    oldStyle = oldStyle ? JSON.parse(oldStyle) : {}
                    for(let key in newStyle){
                        oldStyle[key] = newStyle[key]
                    }
                    updateReq['data'] = [{}]
                    updateReq['data'][0][this.remoteColMaps.col_style] = JSON.stringify(oldStyle)
                    console.log('updateNodeStyle',updateReq)
                    self.submitChange('update',updateReq).then(r=>{
                        if(r){
                            // 修改成功刷新mind
                            this.initPage().then(res => {
                                console.log('init Page',res)
                                if(res){
                                    // this.initMind(this.dataTemp)
                                    
                                }
                            })  // 加载数据
                        }
                    })
                }
             }
          },
          updateNodeImage(no,fileNo){
            console.log('updatefileNo',no,fileNo)
            let self = this
             let oldNode = this.mindConfig.oldNodes.filter(item => item.no == no)  
             // 节点原始数据
             if(Array.isArray(oldNode) && oldNode.length == 1){
                let updateReq = this.bxDeepClone(this.nodeUpdateRequest)
                updateReq['condition'] = [{
                    colName:'no',
                    ruleType:'eq',
                    value:no
                }]
                oldNode = oldNode[0]
                let oldImage = oldNode[this.remoteColMaps.col_image]
                if(fileNo && no){
                    // 如果有新样式
                    
                    updateReq['data'] = [{

                    }]
                    fileNo = JSON.stringify(fileNo)
                    updateReq['data'][0][this.remoteColMaps.col_image || 'image'] = fileNo
                    console.log('updateNodeImage',updateReq)
                    self.submitChange('update',updateReq).then(r=>{
                        if(r){
                            // 修改成功刷新mind
                            this.initPage().then(res => {
                                console.log('save image',res)
                                if(res){
                                    // this.initMind(this.dataTemp)
                                    
                                }
                            })  // 加载数据
                        }
                    })
                }
             }
          }

       
          




    }

};
