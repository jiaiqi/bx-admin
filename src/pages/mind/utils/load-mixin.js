import {walk} from 'simple-mind-map/src/utils'

import { themeList } from 'simple-mind-map/src/constants/constant'
export default {
    data() {
        return {
            routeMade:'norm', // 'norm' 'cust'
            v2:null,
            searchValue:'',
            treeData:[],
            mindConfig:{},
            loadMindDatas:{},
            layoutList:[
                {
                    layout:'logicalStructure',
                    name:'逻辑结构图'
                },
                {
                    layout:'mindMap',
                    name:'思维导图'
                },
                {
                    layout:'organizationStructure',
                    name:'组织结构图'
                },
                {
                    layout:'catalogOrganization',
                    name:'目录组织图'
                },
                {
                    layout:'timeline',
                    name:'时间轴'
                },
                {
                    layout:'timeline2',
                    name:'时间轴2'
                },
                {
                    layout:'fishbone',
                    name:'鱼骨图'
                },
                {
                    layout:'verticalTimeline',
                    name:'竖向时间轴'
                },
                
            ],
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
        tools(){
            let tools = [{
                name:'基础设置',
                tools:[
                {
                    name:'修改标题',
                    key:'edit',
                    icon:'el-icon-bottom-right',
                    disabled:false,
                    options:[],
                    value:'',
                    // predefines: this.layouts,
                },{
                    name:'主题',
                    key:'theme',
                    icon:'el-icon-bottom-right',
                    disabled:false,
                    options:[],
                    value:'',
                    predefines: themeList,
                },
                {
                    name:'布局',
                    key:'layout',
                    icon:'el-icon-bottom-right',
                    disabled:false,
                    options:[],
                    value:'',
                    predefines: this.layouts,
                },{
                    name:'大纲',
                    key:'tree',
                    icon:'el-icon-bottom-right',
                    disabled:false,
                    options:[],
                    value:'',
                    // predefines: this.layouts,
                },{
                    name:'搜索',
                    key:'search',
                    icon:'el-icon-bottom-right',
                    disabled:false,
                    options:[],
                    value:'',
                    // predefines: this.layouts,
                }]
            }]
            if(this.routeMade == 'cust'){
                tools[0].tools = tools[0].tools.filter(item => !['layout','theme','edit'].includes(item.key))
            }
            return tools
        },
        topbars(){
            let topbars = [{
                name:'文字样式',
                tools:[{
                    name:'字体',
                    key:'fontFamily',
                    icon:'el-icon-bottom-right',
                    disabled:false,
                    options:[],
                    value:'',
                    predefineFonts: [{
                        ch: '宋体',
                        en: 'SimSun'
                    }, {
                        ch: '黑体',
                        en: 'SimHei'
                    }, {
                        ch: '微软雅黑',
                        en: 'Microsoft Yahei'
                    }, {
                        ch: '微软正黑体',
                        en: 'Microsoft JhengHei'
                    }, {
                        ch: '楷体',
                        en: 'KaiTi'
                    }, {
                        ch: '新宋体',
                        en: 'NSimSun'
                    }, {
                        ch: '仿宋',
                        en: 'FangSong'
                    }],
                },{
                    name:'字号',
                    key:'fontSize',
                    icon:'el-icon-bottom-right',
                    disabled:false,
                    options:[],
                    value:'',
                    predefineFonts: [{
                        name: 'H1',
                        value: '2em'
                    },{
                        name: 'H2',
                        value: '1.5em'
                    },{
                        name: 'H3',
                        value: '1.17em'
                    },{
                        name: 'H4',
                        value: '14px'
                    },{
                        name: 'H5',
                        value: '0.83em'
                    },{
                        name: '正文',
                        value: '12px'
                    }],
                },{
                    name:'加粗',
                    key:'fontWeight',
                    icon:'el-icon-bottom-right',
                    disabled:false,
                    options:[],
                    value:'',
                },{
                    name:'删除线',
                    key:'textDecoration',
                    icon:'el-icon-bottom-right',
                    disabled:false,
                    options:[],
                    value:'',
                },{
                    name:'文字颜色',
                    key:'color',
                    icon:'el-icon-bottom-right',
                    disabled:false,
                    options:[],
                    value:'',
                    predefineColors: [
                        // 预置颜色
                        '#ff4500',
                        '#ff8c00',
                        '#ffd700',
                        '#90ee90',
                        '#00ced1',
                        '#1e90ff',
                        '#c71585',
                        'rgba(255, 69, 0, 0.68)',
                        'rgb(255, 120, 0)',
                        'hsv(51, 100, 98)',
                        'hsva(120, 40, 94, 0.5)',
                        'hsl(181, 100%, 37%)',
                        'hsla(209, 100%, 56%, 0.73)',
                        '#c7158577'
                    ],
                }]
            },{
                name:'节点样式',
                tools:[{
                    name:'边框颜色',
                    key:'borderColor',
                    icon:'el-icon-bottom-right',
                    disabled:false,
                    options:[],
                    value:'',
                    predefineColors: [
                        // 预置颜色
                        '#ff4500',
                        '#ff8c00',
                        '#ffd700',
                        '#90ee90',
                        '#00ced1',
                        '#1e90ff',
                        '#c71585',
                        'rgba(255, 69, 0, 0.68)',
                        'rgb(255, 120, 0)',
                        'hsv(51, 100, 98)',
                        'hsva(120, 40, 94, 0.5)',
                        'hsl(181, 100%, 37%)',
                        'hsla(209, 100%, 56%, 0.73)',
                        '#c7158577'
                    ],
                },{
                    name:'背景颜色',
                    key:'fillColor',
                    icon:'el-icon-bottom-right',
                    disabled:false,
                    options:[],
                    value:'',
                    predefineColors: [
                        // 预置颜色
                        '#ff4500',
                        '#ff8c00',
                        '#ffd700',
                        '#90ee90',
                        '#00ced1',
                        '#1e90ff',
                        '#c71585',
                        'rgba(255, 69, 0, 0.68)',
                        'rgb(255, 120, 0)',
                        'hsv(51, 100, 98)',
                        'hsva(120, 40, 94, 0.5)',
                        'hsl(181, 100%, 37%)',
                        'hsla(209, 100%, 56%, 0.73)',
                        '#c7158577'
                    ],
                },{
                    name:'节点形状',
                    key:'shape',
                    icon:'el-icon-bottom-right',
                    disabled:false,
                    options:[],
                    value:'',
                    predefineShapes: [
                        {
                            name: '矩形',
                            value: 'rectangle'
                        },
                        {
                            name: '菱形',
                            value: 'diamond'
                        },
                        {
                            name: '平行四边形',
                            value: 'parallelogram'
                        },
                        {
                            name: '圆角矩形',
                            value: 'roundedRectangle'
                        },
                        {
                            name: '八角矩形',
                            value: 'octagonalRectangle'
                        },
                        {
                            name: '外三角矩形',
                            value: 'outerTriangularRectangle'
                        },
                        {
                            name: '内三角矩形',
                            value: 'innerTriangularRectangle'
                        },
                        {
                            name: '椭圆',
                            value: 'ellipse'
                        },
                        {
                            name: '圆',
                            value: 'circle'
                        }
                        ],
                    }]
                },{
                name:'节点内容',
                tools:[{
                    name:'插入图片',
                    key:'setImage',
                    icon:'el-icon-bottom-right',
                    disabled:false,
                    options:[],
                    value:'',
                    predefineColors: [
                        ],
                }]
            }]
            let list = []
            if(this.routeMade == 'cust' || this.routeMade == 'norm'){
                for(let bar of topbars){
                    
                    switch (bar.name) {
                        case '文字样式':
                            // tools[0].tools = tools[0].tools.filter(item => !['layout','theme','edit'].includes(item.key))
                            
                            if(this.remoteColMaps['col_style']){
                               list.push(bar)         
                            }
                            break;
                        case '节点样式':
                            if(this.remoteColMaps['col_style']){
                                list.push(bar)         
                             }
                            break;
                        case '节点内容':
                            if(this.remoteColMaps['col_image']){
                                list.push(bar)         
                             }
                            break;
                    
                        default:
                            break;
                    }  
                }
                
            }else{
                list = topbars.map(item => item)
            }
            return list
        },
        rootNodeNo(){
            let no = this.mindConfig.rootNodeNo
            if(this.$route.params && this.$route.params.rootNo){
                no = this.$route.params.rootNo
            }
            if(this.$route.query && this.$route.query.rootNo){
                no = this.$route.query.rootNo
            }
            return no
        },
        mindbizNo(){
            let no = ''
            if(this.$route.params && this.$route.params.mindbizNo){
                no = this.$route.params.mindbizNo
            }
            if(this.$route.query && this.$route.query.mindbizNo){
                no = this.$route.query.mindbizNo
            }
            return no 
        },
        no(){
            let no = this.query.no || this.$route.params.no
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
        nodeNoColName(){
            let no = 'no'
            if(this.remoteColMaps && this.remoteColMaps['col_no']){
                no = this.remoteColMaps['col_no']
            }

            return no 
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
            if(this.routeMade == 'cust'){
                req['serviceName'] = 'srvpage_cfg_com_mind_map_update'
                req['condition'] =[{
                    colName:'id',
                    ruleType:'eq',
                    value:mind.id
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
                                if(this.routeMade == 'cust'){
                                    this.getCustConfig()
                                }else{
                                    this.initPage().then(res => {
                                        console.log('init Page',res)
                                        if(res){
                                            // this.initMind(this.dataTemp)
                                            
                                        }
                                    })  // 加载数据
                                }
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
            if(root.data){
                root['data']['expand'] = true
                this.$nextTick(() => {
                    this.$set(this,'dataTemp',this.bxDeepClone(root) )  // UI数据
                    this.$set(this,'loadMindDatas',this.bxDeepClone(root) ) // 初始数据
                    this.setMindData(this.bxDeepClone(root)) // 动态更新数据
                })
                
            }
            
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
                        // if(data['seq'] && !isNaN( data['seq'])){
                        //     data['seq'] = data['seq']  + ''
                        // }
                        
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
                    // if(key == maps.col_seq && maps.col_seq){
                    //     data['seq'] = item[key]
                    // }else{
                    //     data['seq'] = item['seq']
                    // }
                    
                    if(this.activeNodeId && data['no'] == this.activeNodeId){
                        // 如果节点编号等于 记录选中 no时 选中状态设置为 true
                        data['isActive'] = true
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
            // console.log('getMindNodeData',obj)
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
            if(serviceName){
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
            }
            
        },
        async getCustConfig(){
            // 查询定制业务脑图配置
            let self = this
            // self.getV2()
            let serviceName = 'srvpage_cfg_com_mind_map_select'
            
            let app = 'config'
            let mindbizNo = self.mindbizNo
            
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
                console.error('没有mindbizno')
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
                                self.$set(self.mindConfig,'rootNodeNo',self.rootNodeNo || mind.top_node_no)  // 当前脑图根节点编号
                                self.$set(self.mindConfig,'oldMind',self.bxDeepClone(mind))  // 原始数据
                                self.$set(self.mindConfig,'mainMind',self.bxDeepClone(mind))  // 原始数据
                                let defaultTheme = self.bxDeepClone(mind)['default_style']  
                                if(defaultTheme){
                                    // 回显默认皮肤
                                    
                                    let defaultThemeKey = ''
                                    if(Array.isArray(self.layoutList)){
                                        for(let layout of self.layoutList){
                                            if(layout.name == defaultTheme){
                                                defaultThemeKey = layout.layout
                                            }
                                        }
                                    }
                                    if(defaultThemeKey){
                                        self.$set(self,'defaultLayout',defaultThemeKey)
                                    }else{
                                        self.$set(self,'defaultLayout', defaultThemeKey || '')  // 主题
                                    }
                                    
                                }
                                
                                self.$set(self,'defaultTheme', 'classic4')  // 主题
                               
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
                    value:this.no
                }]
              }
              // treeData 3000条， 普通查询500条
            const url = self.getServiceUrl("select", serviceName, app);
            console.log('init url',url)
            if(serviceName && self.mindConfig && self.mindConfig.oldMind && !isAll && self.no){
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
            }else if(serviceName){
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
                                // self.$set(self,'defaultLayout', mind.mind_style || '')  // 主题
                                let defaultTheme = mind.mind_style
                                if(defaultTheme){
                                    // 回显默认皮肤
                                    
                                    let defaultThemeKey = ''
                                    if(Array.isArray(self.layoutList)){
                                        for(let layout of self.layoutList){
                                            if(layout.name == defaultTheme){
                                                defaultThemeKey = layout.layout
                                            }
                                        }
                                    }
                                    if(defaultThemeKey){
                                        self.$set(self,'defaultLayout',defaultThemeKey)
                                    }else{
                                        self.$set(self,'defaultLayout', defaultThemeKey || '')  // 主题
                                    }
                                    
                                }
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
            let self = this
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
                    console.log('request',page)
                    return new Promise(function(resolve, reject) {
                        let result = null
                        if(type == 'add'){
                            if(page.state == 'SUCCESS'){
                                // 根据新增请求 返回的数据结构 返回有效数据
                                result = page.response[0].response.effect_data[0]
                                if(result && self.remoteColMaps){
                                    // 保存新增节点key，便于回显时设置选中状态
                                    self.activeNodeId = result[self.remoteColMaps['col_no']]
                                    console.log('add',result,self.activeNodeId)

                                }
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
            let noColName = self.remoteColMaps['col_no'] || 'no'
             let oldNode = this.mindConfig.oldNodes.filter(item => item[noColName] == no)  
             // 节点原始数据
             if(Array.isArray(oldNode) && oldNode.length == 1){
                let updateReq = this.bxDeepClone(this.nodeUpdateRequest)
                updateReq['condition'] = [{
                    colName:noColName,
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
                            if(this.routeMade == 'cust'){
                                this.getCustConfig()
                            }else{
                                this.initPage().then(res => {
                                    console.log('init Page',res)
                                    if(res){
                                        // this.initMind(this.dataTemp)
                                        
                                    }
                                })  // 加载数据
                            }
                            // 修改成功刷新mind
                            // this.initPage().then(res => {
                            //     console.log('init Page',res)
                            //     if(res){
                            //         // this.initMind(this.dataTemp)
                                    
                            //     }
                            // })  // 加载数据
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
                            if(this.routeMade == 'cust'){
                                this.getCustConfig()
                            }else{
                                this.initPage().then(res => {
                                    console.log('init Page',res)
                                    if(res){
                                        // this.initMind(this.dataTemp)
                                        
                                    }
                                })  // 加载数据
                            }
                            // 修改成功刷新mind
                            // this.initPage().then(res => {
                            //     console.log('save image',res)
                            //     if(res){
                            //         // this.initMind(this.dataTemp)
                                    
                            //     }
                            // })  // 加载数据
                        }
                    })
                }
             }
          }

       
          




    }

};
