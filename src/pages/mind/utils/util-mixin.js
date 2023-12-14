
import { themeList } from 'simple-mind-map/src/constants/constant'  // 皮肤
import { nodeIconList } from 'simple-mind-map/src/svg/icons'  // 内置图标列表
import logicalStructure from '../images/logicalStructure.png'  // tuli
import mindMap from '../images/mindMap.png'  // tuli
import organizationStructure from '../images/organizationStructure.png'  // tuli
import catalogOrganization from '../images/catalogOrganization.png'  // tuli
import timeline from '../images/timeline.png'  // tuli
import timeline2 from '../images/timeline2.png'  // tuli
import fishbone from '../images/fishbone.png'  // tuli
import verticalTimeline from '../images/verticalTimeline.png'  // tuli

import { createUid } from 'simple-mind-map/src/utils'
export default {
    data() {
        return {
            // 移植参数相关
            // myMindMap:null,
            
            loading:false,
            loadtext:'加载中',
            mouseActiveNode:null,  // 鼠标按下节点
            num:0, // 节点数量
            centerDialogVisible:false, // 显示搜索框
            defaultScale:1,
            showEditorUi:['footer','hand'],  // 显示的ui  'side','hand','footer'
            sideTools:[
                {
                    icon:'el-icon-notebook-2',
                    name:'大纲',
                    value:'outline',
                },
                {
                    icon:'el-icon-coin',
                    name:'结构',
                    value:'layout',
                },{
                    icon:' el-icon-s-open',
                    name:'主题',
                    value:'theme',
                },
                {
                    icon:'el-icon-magic-stick',
                    name:'基础样式',
                    value:'themeConfig',
                },
            ],
            activeSideTool:"",
            defaultLayout:'',
            layoutList:[
                {
                    layout:'logicalStructure',
                    name:'逻辑结构图',
                    legend:logicalStructure
                },
                {
                    layout:'mindMap',
                    name:'思维导图',
                    legend:mindMap
                },
                {
                    layout:'organizationStructure',
                    name:'组织结构图',
                    legend:organizationStructure
                },
                {
                    layout:'catalogOrganization',
                    name:'目录组织图',
                    legend:catalogOrganization
                },
                {
                    layout:'timeline',
                    name:'时间轴',
                    legend:timeline
                },
                {
                    layout:'timeline2',
                    name:'时间轴2',
                    legend:timeline2
                },
                {
                    layout:'fishbone',
                    name:'鱼骨图',
                    legend:fishbone
                },
                {
                    layout:'erticalTimeline',
                    name:'竖向时间轴',
                    legend:verticalTimeline
                },
                
            ],
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
            themeConfig:{
                // 基础设置
                // 背景颜色
                backgroundColor: 'rgb(255, 238, 228)',
                // 背景图
                backgroundImage: '',
                // 连线的颜色
                lineColor: 'rgb(230, 138, 131)',
                lineWidth: 3,
                // 概要连线的粗细
                generalizationLineWidth: 3,
                // 概要连线的颜色
                generalizationLineColor: 'rgb(222, 101, 85)',
                // 根节点样式
                root: {
                    fillColor: 'rgb(207, 44, 44)',
                    color: 'rgb(255, 233, 157)',
                    borderColor: '',
                    borderWidth: 0,
                    fontSize: 24,
                    active: {
                    borderColor: 'rgb(255, 233, 157)',
                    borderWidth: 3,
                    }
                },
                // 二级节点样式
                second: {
                    fillColor: 'rgb(255, 255, 255)',
                    color: 'rgb(211, 58, 21)',
                    borderColor: 'rgb(222, 101, 85)',
                    borderWidth: 2,
                    fontSize: 18,
                    active: {
                    borderColor: 'rgb(255, 233, 157)',
                    }
                },
                // 三级及以下节点样式
                node: {
                    fontSize: 14,
                    color: 'rgb(144, 71, 43)',
                    active: {
                    borderColor: 'rgb(255, 233, 157)'
                    }
                },
                // 概要节点样式
                generalization: {
                    fontSize: 14,
                    fillColor: 'rgb(255, 247, 211)',
                    borderColor: 'rgb(255, 202, 162)',
                    borderWidth: 2,
                    color: 'rgb(187, 101, 69)',
                    active: {
                    borderColor: 'rgb(222, 101, 85)'
                    }
                }
            },
            activeNodes:[], // 选中节点
            currentIconList:[],  // 选中节点图标
            defaultTheme:'',
            loadPageMata: null, // 页面元数据
            pageParams: null,
            pageParamsModel: null,
           // 小地图容器的宽高
           containerWidth: 100,
           containerHeight:50,
           rightMousedown:{
//                // 当前右键点击的类型
// const type = ref('')
// // 如果点击的节点，那么代表被点击的节点
// const currentNode = shallowRef(null)
// // 菜单显示的位置
// const left = ref(0)
// const top = ref(0)
// // 是否显示菜单
// const show = ref(false)
// // 记录鼠标右键按下的位置
// const mousedownX = ref(0)
// const mousedownY = ref(0)
// const isMousedown = ref(false)
// // 保存复制/剪切的节点的数据，后续可以原来粘贴
// let copyData = null
                type:'',
                currentNode:null,
                left:0,
                top:0,
                show:false,
                mousedownX:0,
                mousedownY:0,
                isMousedown:0,
                copyData:0,
           },
           showToolbar:{
                show:false,
                left:0,
                top:0,
                currentFormatInfo:{}
           }
        }
    },
    computed: {
        themeListDefault(){
            let list = themeList
            return list
        },
        iconList(){
            let list = nodeIconList
            return list
        },
        activeTheme(){
            let t = null
            t = this.themeListDefault.filter(item => item.value == this.defaultTheme)
            if(Array.isArray(t) && t.length > 0){
                t = t[0]
            }else{
                t = null
            }
            return t
        }
    },
    methods: {
        
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
        exportFile(type){
            // mindMap.export('png', true, '文件名')
            let self = this
            let exportType = type || 'pdf'
            if(exportType && self.mindMapModel.export){
                self.mindMapModel.export(exportType, true, '文件名')
            }
            
        },
        
        setTheme(theme){
            // 动态设置主题
            console.log(theme)
            let currentTheme = theme || 'classic'
            this.mindMapModel.setTheme(currentTheme)
            this.defaultTheme = this.mindMapModel.getTheme()
        },
        // 注册并使用新主题
        defineTheme(){
            MindMap.defineTheme('redSpirit', {
                // 背景颜色
                backgroundColor: 'rgb(255, 238, 228)',
                // 连线的颜色
                lineColor: 'rgb(230, 138, 131)',
                lineWidth: 3,
                // 概要连线的粗细
                generalizationLineWidth: 3,
                // 概要连线的颜色
                generalizationLineColor: 'rgb(222, 101, 85)',
                // 根节点样式
                root: {
                    fillColor: 'rgb(207, 44, 44)',
                    color: 'rgb(255, 233, 157)',
                    borderColor: '',
                    borderWidth: 0,
                    fontSize: 24,
                    active: {
                    borderColor: 'rgb(255, 233, 157)',
                    borderWidth: 3,
                    }
                },
                // 二级节点样式
                second: {
                    fillColor: 'rgb(255, 255, 255)',
                    color: 'rgb(211, 58, 21)',
                    borderColor: 'rgb(222, 101, 85)',
                    borderWidth: 2,
                    fontSize: 18,
                    active: {
                    borderColor: 'rgb(255, 233, 157)',
                    }
                },
                // 三级及以下节点样式
                node: {
                    fontSize: 14,
                    color: 'rgb(144, 71, 43)',
                    active: {
                    borderColor: 'rgb(255, 233, 157)'
                    }
                },
                // 概要节点样式
                generalization: {
                    fontSize: 14,
                    fillColor: 'rgb(255, 247, 211)',
                    borderColor: 'rgb(255, 202, 162)',
                    borderWidth: 2,
                    color: 'rgb(187, 101, 69)',
                    active: {
                    borderColor: 'rgb(222, 101, 85)'
                    }
                }
            })
        },
         onMousedown(e){
            this.mindMapModel.miniMap.onMousedown(e)
          },
          
           onMousemove(e){
            this.mindMapModel.miniMap.onMousemove(e)
          },
          
          onMouseup(e){
            this.mindMapModel.miniMap.onMouseup(e)
          },
          copy(){
            this.rightMousedown.copyData = this.mindMapModel.renderer.copyNode()
            this.hide()
        },
        cut(){
            this.mindMapModel.execCommand('CUT_NODE', _copyData => {
                this.rightMousedown.copyData = _copyData
            })
            this.hide()
        },
        paste(){
            let self = this
            this.mindMapModel.execCommand('PASTE_NODE', this.rightMousedown.copyData)
            let parentNode = this.activeNodes[0]
            let pNo = ''
            if(parentNode){
                pNo = parentNode.nodeData.data.no
                // 复制并新建节点
                let nData = this.rightMousedown.copyData[0].data
                if(pNo){
                    nData = self.getRemoteData(nData,pNo)
                }
                self.submitChange('add',nData).then(res => {
                    console.log(res)
                    if(res && res.no){
                        // 新增成功 
                        self.initPage().then(res => {
                            console.log('init Page',res)
                        })  // 加载数据
                    }
                })
                console.log(this.activeNodes,this.rightMousedown.copyData)

            }
            this.hide()
        },
        toggleBold(){
            let mindMap = this.mindMapModel
            let showToolbar = this.showToolbar
            showToolbar.currentFormatInfo.bold = !showToolbar.currentFormatInfo.bold
            mindMap.richText.formatText({
                bold: showToolbar.currentFormatInfo.bold
            })
        },
        toggleUnderline(){
            let mindMap = this.mindMapModel
            let showToolbar = this.showToolbar
            showToolbar.currentFormatInfo.underline = !showToolbar.currentFormatInfo.underline
            mindMap.richText.formatText({
                underline: showToolbar.currentFormatInfo.underline
            })
        },
        changeColor(){
            let mindMap = this.mindMapModel
            let showToolbar = this.showToolbar
            showToolbar.currentFormatInfo.color = 'red'
            mindMap.richText.formatText({
                color: 'red'
            })
        },
        hide(){
            this.rightMousedown.left = 0
            this.rightMousedown.top = 0
            this.rightMousedown.type = ''
            this.rightMousedown.show = false
        },
        onNode(e){
            this.hide() // 隐藏右键菜单
            console.log(e)
            // this.$set(this,'activeNode',e)
        },
        clearNode(){
            let self = this
            // console.log('clear node ',this,activeNode)
            // self.$set(self,'activeNode',null)
        },
         setIcon(type, name){
            let key = type + '_' + name
            // 检查当前节点是否存在该图标
            let index = this.currentIconList.findIndex(item => {
              return item === key
            })
            // 存在则删除icon
            if (index !== -1) {
                this.currentIconList.splice(index, 1)
            } else {
              // 否则判断当前图标是否和要插入的图标是一个组的
              let typeIndex = this.currentIconList.findIndex(item => {
                return item.split('_')[0] === type
              })
              // 是一个组的则进行替换
              if (typeIndex !== -1) {
                this.currentIconList.splice(typeIndex, 1, key)
              } else {
                // 否则添加icon
                this.currentIconList.push(key)
              }
            }
            this.activeNodes.forEach(node => {
              node.setIcon([...this.currentIconList])
            })
          },
          // 基础样式设置：
          setThemeConfig(color){
            let mindMap = this.mindMapModel
            mindMap.setThemeConfig({
                backgroundColor: color
            })
          },
          // 右侧工具栏

          onSideToolBar(sTool){
             // 选中侧边工具
             this.$set(this,'activeSideTool',sTool.value)
          },
          closeSideToolBar(){
            // 取消选中
            this.$set(this,'activeSideTool','')
          },
          // 基础样式设置：
          setDefaultLayout(layout){
            let mindMap = this.mindMapModel
            this.$set(this,'defaultLayout',layout)
            mindMap.setLayout(layout)
          },
          updateConfig(type){
            let mindMap = this.mindMapModel
            mindMap.updateConfig({
                mousewheelAction: type
            })
          },
        //   mindMap.view
          viewReset(){

          },
          viewSetScale(scale, cx, cy){
            let mindMap = this.mindMapModel
            // 设置缩放
            
            console.log(mindMap.view.getTransformData().transform)
            let transform = mindMap.view.getTransformData().transform
            // translateX translateY
            mindMap.view.setScale(scale / 100,0,0)
          },
          viewFit(){
            // 适配内容
            let mindMap = this.mindMapModel
            mindMap.view.fit()
            this.defaultScale = mindMap.view.getTransformData().state.scale * 100
          },
          // 插入兄弟节点
          insertNode(){
            let mindMap = this.mindMapModel
                mindMap.execCommand('INSERT_NODE')
                this.hide() // 隐藏右键菜单
        },
        // 插入子节点
        insertChildNode(){
            let mindMap = this.mindMapModel
            mindMap.execCommand('INSERT_CHILD_NODE')
            this.hide() // 隐藏右键菜单
        },
        showSearch(){
             this.centerDialogVisible=true
        },
        onDataChange(data){

            // 脑图节点数据加载
            console.log('data_change',data,this.mindMapModel.getData())
            this.num = 0
            this.walk(data)

            if(!this.mindConfig.rootNodeNo){
                // 新增根节点 当前脑图还没有根节点时
                this.noneRootNoActiveRootNode()
            }
        },
        walk(data) {
            // 遍历
            this.num++
            if (data.children && data.children.length > 0) {
              data.children.forEach(item => {
                this.walk(item)
              })
            }
        },
        hideTextEdit(textEditNode,activeNodeList){
            console.log('hideTextEdit',textEditNode,activeNodeList)
            if(Array.isArray(activeNodeList) && activeNodeList.length == 1){
                let newNodeData = activeNodeList[0]
                let nNodeData = newNodeData.nodeData // 新节点数据
                let pNodeData = null
                let pNo = null  // 父编号
                if(newNodeData.parent){
                    // 如果存在父节点
                    pNodeData = newNodeData.parent.nodeData.data
                    pNo = pNodeData.no
                }
                let nData = this.getRemoteData(nNodeData.data,pNo)   // 新节点数据
                if(nNodeData.data.no){
                    // 如果存在 no 为修改
                    // console.log('修改',nData)
                    this.onNodeUpdate(nData)
                }else{
                    this.submitChange('add',nData).then( ar => {
                        console.log(ar)
                        this.initPage().then(res => {
                            console.log('init Page',res)
                            if(res){
                                // this.initMind(this.dataTemp)
                                
                            }
                        })  // 加载数据
                    })
                    console.log('新增节点',nNodeData,nData)
                }
                
                
            }
        },
        updateNodeByActive(isActive,nodes){
            // 设置节点激活状态
            let ns = nodes || this.activeNodes
            if(Array.isArray(ns) && ns.length > 0){
                for(let n of ns){
                    n.updateNodeByActive(isActive)
                }
                
            }
            
        },
        setLoading(stats,text){
            this.$set(this,'loading',stats)
            this.$set(this,'loadtext',text)
        },
        noneRootNoActiveRootNode(){
            let self = this
            // 如果没有远程根节点时，激活根节点
            let mindMap = this.mindMapModel
            let rootUid = mindMap.getData()
            console.log(rootUid.data.uid,mindMap.node)
            this.loading = true
            this.setLoading(true,'保存根节点中...')
            self.submitChange('add').then(res => {
                // 新增根节点
                console.log(res)
                if(res && res.no){
                    // 新增成功 保存和更新 根节点编号数据
                    self.$set(self.mindConfig,'rootNodeNo',res.no)
                    self.$set(self.mindConfig.mainMind,'top_node_no',res.no)
                    this.setLoading(false,'')
                    self.submitChange().then( mres => {
                        // 回填修改脑图根节点编号
                        console.log(mres)
                        self.initPage().then(res => {
                            console.log('init Page',res)
                            if(res){
                                // self.initMind(self.dataTemp)
                                
                            }
                        })  // 加载数据
                    })
                }
            })
        },
        // 更新脑图数据：
        setMindData(data){
            let mindMap = this.mindMapModel
            if(mindMap){
                // 存在mind 实例 则执行
                mindMap.setData(data)
            }else{
                // 没有实例时创建实例
                this.initMind(this.dataTemp)
            }
            
          },
          expandBtnClick(node){
            // 展开收起回调
                this.hide()  // 隐藏右键菜单
                let nData = this.getRemoteData(node.nodeData.data)   // 新节点数据
                console.log(node.nodeData,nData)
                this.onNodeUpdate(nData)  // 进入动态修改节点信息逻辑
          },
          findNodeByUid(uid,type){
            // 通过uid获取节点实例
            let self = this
            let mindMap = self.mindMapModel
            let node = mindMap.renderer.findNodeByUid(uid)
            let nodeData = null
            if(node){
                nodeData = node.nodeData
            }
            // console.log(type,nodeData)
            // let nodeData = node.nodeData
            this.nodeDragend(nodeData,type)
          },
          nodeDragging(node,e){
            // 节点拖拽
            console.log(node,e)
          },
          nodeDragend(nodeData,type){
            // 节点拖动结束 修改逻辑
            // 修改 父节点
            let activeNode = this.mouseActiveNode
            let nData = null
            if(activeNode){
                nData = activeNode.nodeData.data
                let req = this.bxDeepClone(this.nodeUpdateRequest)
                // 修改 父节点
                req['condition'] = [{
                    colName:'no',
                    ruleType:'eq',
                    value:nData.no
                }]
                req['data'] = [{
                    'parent_no':nodeData.data.no
                }]
                switch (type) {
                    // overlapNodeUid ? 'overlapNodeUid' : uids.prevNodeUid ? 'prevNodeUid' : 'nextNodeUid'
                    case 'overlapNodeUid':
                        // 节点上
                        
                        
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
                        break;
                    case 'prevNodeUid':
                        if(nodeData.data.parent_no !== nData.parent_no){
                            // 父节点编号不同时 修改
                            req['data'] = [{
                                'parent_no':nodeData.data.parent_no
                            }]
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
                        // 节点后
                        break;
                    case 'nextNodeUid':
                        if(nodeData.data.parent_no !== nData.parent_no){
                            // 父节点编号不同时 修改
                            req['data'] = [{
                                'parent_no':nodeData.data.parent_no
                            }]
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
                        // 节点前
                        break;
                
                    default:
                        break;
                }
            }
            
            console.log(nodeData,type,nData)
          },
          nodeMousedown(node,e){
           // 节点鼠标按下
            this.$set(this,'mouseActiveNode',node)
            console.log('nodeMousedown',node,e)
          }, 
          nodeMouseup(node,e){
             // 节点鼠标松开
             this.$set(this,'mouseActiveNode',null)
            console.log('nodeMouseup',node,e)
          },
          
    }

};
