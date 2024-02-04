<template>
    <div>
        <!-- <div class="container" @mousedown="onMousedown" @mousemove="onMousemove" @mouseup="onMouseup">
             <div  class="miniMapContainer" 
                ref="miniMapContainer"
                :style="{
                    transform: `scale(${miniMapBoxScale})`,
                    left: miniMapBoxLeft + 'px',
                    top: miniMapBoxTop + 'px'
                    }">
            </div>
            <div class="viewBoxContainer" :style="viewBoxStyle"></div>
        </div> -->

        <div  
            v-loading="loading"
            :element-loading-text="loadtext"
            element-loading-spinner="el-icon-loading"
            id="mindMapContainer">
        </div>
        <div class="tool-layout">
            <!-- && routeMade == 'norm' -->
            <div class="hander-layout" v-if="showEditorUi.includes('hand') && mindConfig && mindConfig.mainMind ">
                <div class="mind-tools shadow">
                    <div class="mind-title" v-if="routeMade == 'norm'">
                        <span v-if="!showEdit">{{mindConfig.mainMind.mind_name}}</span>
                        
                        <div class="search-layout" v-if="showEdit">
                            <el-input
                            style="width:8rem;"
                            ref="editInputRef"
                            placeholder="请输入内容"
                            v-model="mindConfig.mainMind.mind_name"
                            clearable>
                            </el-input>
                            <el-button type="primary" size="small" @click="updateMind()">确定</el-button>
                        </div>
                    </div> 
                    
                    <mindtoolbar v-if="true" :tools="tools" :showEdit="showEdit" :showTree="showTree" :showSearch="showSearch" :mindConfig="mindConfig" @set-mind-config="setMindConfig"></mindtoolbar>
                    <div class="search-layout" v-if="showSearch">
                        <el-input
                        style="width:8rem;"
                        v-if="showSearch"
                        ref="searchInputRef"
                        placeholder="请输入内容搜索"
                        v-model="searchValue"
                        clearable>
                        </el-input>
                        <el-button type="primary" size="small" @click="search()">搜索</el-button>
                    </div>

                </div>
                <!-- v-if="routeMade == 'norm'" -->
                <topToolBar :tools="topbars"  class="shadow" :activeNodes="activeNodes" @set-node-tool="setNodeTool"></topToolBar>
            </div>
            <div class="side-layout " v-if="showEditorUi.includes('side')">
                <div class="side-toolbar border border-radius  shadow ">
                    <div v-for="(sTool,index) in sideTools" :key="index" class="side-toolbar-item" :class="`${activeSideTool == sTool.value ? 'active' : ''}`" @click="onSideToolBar(sTool)">
                        <i :class="sTool.icon"></i>
                        <span>{{sTool.name}}</span>
                    </div>
                </div>
                <div class="side-layout-info border border-radius  shadow " v-if="activeSideTool">
                    <el-card class="box-card">
                        <div slot="header" class="clearfix">
                            <span>卡片名称</span>
                            <el-button style="float: right; padding: 3px 0" type="text" icon="el-icon-close" @click="closeSideToolBar"></el-button>
                        </div>
                        <div  class="text item">
                            <div v-if="Array.isArray(activeNodes) && activeNodes.length == 0 && activeSideTool == 'themeConfig'" >
                                <div class="flex align-items-center">
                                    <span class="demonstration padding-right">背景颜色：</span>
                                    <el-color-picker
                                    v-model="themeConfig.backgroundColor"
                                    @change="setThemeConfig"
                                    :predefine="predefineColors">
                                    </el-color-picker>
                                </div>
                            </div>
                            <div v-if="Array.isArray(layoutList) && layoutList.length > 0 && activeSideTool == 'layout'">
                                <div class="flex" style="flex-wrap: wrap;flex-direction:column;">
                                        <div v-for="(layout,index) in layoutList" :key="index" :style="`color:${layout.layout == defaultLayout ? '#409EFF' : '#000'};`" class="text item" style="padding:4px;"  @click="setDefaultLayout(layout.layout)">
                                            <el-image
                                            style="width: auto; height: 100px"
                                            :src="layout.legend"
                                            :fit="'contain'"></el-image>
                                            <div  style="text-align:center;">
                                                {{layout.name}}
                                                <i v-if="layout.layout == defaultLayout" class="el-icon-check"></i>
                                            </div>
                                        </div>
                                    </div>
                            </div>
                            <div v-if="Array.isArray(themeListDefault) && themeListDefault.length > 0 && activeSideTool == 'theme'">
                                <div class="flex" style="flex-wrap: wrap;flex-direction:column;">
                                        <div v-for="(theme,index) in themeListDefault" :key="index" class="text item" style="padding:4px;">
                                            <div  :style="`color:${theme.value == defaultTheme ? '#409EFF' : '#000'};`" @click="setTheme(theme.value)">
                                                {{theme.name}}
                                                <i v-if="theme.value == defaultTheme" class="el-icon-check"></i>
                                            </div>
                                        </div>
                                    </div>
                            </div>
                            <div v-if="Array.isArray(activeNodes) && activeNodes.length > 0 ">
                                <el-card class="box-card" v-for="(type,index) in iconList" :key="index">
                                    <div slot="header" class="clearfix">
                                        <span>{{type.name}}</span>
                                    </div>


                                    <div class="flex" style="flex-wrap: wrap;">
                                        <div v-for="(icon,i) in type.list" :key="i" class="text item" style="padding:4px;">
                                            <div v-html="icon.icon" style="width:24px;height:24px;" @click="setIcon(type.type,icon.name)"></div>
                                        </div>
                                    </div>
                                    
                                </el-card>
                            </div>
                        </div>
                    </el-card>
                </div>
                
                
                
                
            </div>
            
            <div class="left-layout" v-if="showTree">
                
                <el-tree v-if="showTree" style="max-height:100%;overflow-y:auto;overflow-x:auto;"  :data="treeData" :props="treeDefaultProps" default-expand-all @node-click="treeNodeClick"></el-tree>
            </div>
            <div class="footer-layout" v-if="showEditorUi.includes('footer')">
                <div>
                    <div style="min-width:6rem;background:#fff;padding:6px;text-align:center;">
                        节点数:{{num}}
                    </div>
                </div>
                <div>
                   <!-- 搜索 -->
                    <!-- <el-button icon=" el-icon-search" @click="showSearch" title="搜索节点">
                        
                    </el-button> -->
                    <el-button icon="el-icon-full-screen" @click="viewFit" title="适应画布显示">
                        <!-- 适配画布显示 -->
                    </el-button>
                    <!-- <div style="min-width:16rem;background:#fff;padding:0 10px;">
                        <el-slider
                        :min="10"
                        :max="200"
                        :step="10"
                        v-model="defaultScale"
                        @change="viewSetScale"
                        show-input>
                        </el-slider>
                    </div> -->
                    <el-button  type="primary" @click="exportFile('pdf')">导出</el-button>

                    <!-- <el-button  type="primary" @click="getAllData()">获取数据</el-button> -->
                </div>
                
                <!-- <el-button  type="primary" @click="exportFile('pdf')">导出</el-button>

                <el-button  type="primary" @click="getAllData()">获取数据</el-button>
                <el-button  type="danger" @click="resetMindMap()">重置</el-button> -->

            </div>
        </div>
        <div class="contextMenu shadow" v-if="rightMousedown.show" :style="{ left: rightMousedown.left + 'px', top: rightMousedown.top + 'px' }">
            <template v-if="rightMousedown.type === 'node'">
                <div class="contextMenuItem" @click="insertChildNode">插入下级节点</div>
                <div class="contextMenuItem" @click="insertNode">插入同级节点</div>
                <div class="contextMenuItem" @click="copy">复制</div>
                <!-- <div class="contextMenuItem" @click="cut">剪切</div> -->
                <div class="contextMenuItem" @click="paste">粘贴</div>
            </template>
            <template v-if="rightMousedown.type === 'svg'">
                <div class="contextMenuItem">收起所有</div>
            </template>
        </div>
        <div class="toolbar" v-if="showToolbar.show" :style="{left: showToolbar.left, top: showToolbar.top}">
            <button @click="toggleBold">{{ showToolbar.currentFormatInfo.bold ? '取消加粗' : '加粗'}}</button>
            <button @click="toggleUnderline">{{ showToolbar.currentFormatInfo.underline ? '取消下划线' : '下划线'}}</button>
            <button @click="changeColor">颜色</button>
        </div>
        <!-- <div class="side-toolbar-layout">
             <div class="theme-list">
                <el-button size="mini" v-for="(theme,index) in themeListDefault" :type="theme.value == defaultTheme ? 'primary' : ''" plain @click="setTheme(theme.value)">{{theme.name}}</el-button>
             </div>
        </div> -->
        <el-dialog
        title="关键字搜索"
        :visible.sync="centerDialogVisible"
        width="30%"
        top="5vh"
        :modal="false"
        center>
            <span>需要注意的是内容是默认不居中的</span>
            <span slot="footer" class="dialog-footer">
                <el-button @click="centerDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="centerDialogVisible = false">确 定</el-button>
            </span>
        </el-dialog>
    </div>
        


  </template>
  
  <script>
  

import MindMap from "simple-mind-map";
import { ref, onMounted, shallowRef } from 'vue'
import utilsMixin from './utils/util-mixin.js'  // 逻辑交互
import loadMixin from './utils/load-mixin.js'  // 数据交互

import RichText from 'simple-mind-map/src/plugins/RichText.js'  // 节点富文本编辑
import Export from 'simple-mind-map/src/plugins/Export.js'  // 导出插件
import ExportPDF from 'simple-mind-map/src/plugins/ExportPDF.js' // 导出pdf
import Drag from 'simple-mind-map/src/plugins/Drag.js' //拖拽模块
import Search from 'simple-mind-map/src/plugins/Search.js' // 搜索模块

import topToolBar from './component/toptoolbar.vue' // 顶部工具架
import mindtoolbar from './component/mindtoolbar.vue' // 顶部工具架


MindMap.usePlugin(Export)
MindMap.usePlugin(ExportPDF)
// MindMap.usePlugin(RichText)
MindMap.usePlugin(Drag)
MindMap.usePlugin(Search)
let mindMap = null
// 更新小地图
// const miniMapContainer = ref(null)
// const viewBoxStyle = ref({})
// const miniMapBoxScale = ref(1)
// const miniMapBoxLeft = ref(0)
// const miniMapBoxTop = ref(0)
// const updateMiniMp = (e) => {
//     // 计算小地图数据
//     let data = mindMap.miniMap.calculationMiniMap(containerWidth, containerHeight)
//     // 渲染到小地图
//     miniMapContainer.value.innerHTML = data.svgHTML
//     viewBoxStyle.value = data.viewBoxStyle
//     miniMapBoxScale.value = data.miniMapBoxScale
//     miniMapBoxLeft.value = data.miniMapBoxLeft
//     miniMapBoxTop.value = data.miniMapBoxTop
// }
// const activeNodes = shallowRef([])
// 当前右键点击的类型
const type = ref('')
// 如果点击的节点，那么代表被点击的节点
const currentNode = shallowRef(null)
// 菜单显示的位置
const left = ref(0)
const top = ref(0)
// 是否显示菜单
const show = ref(false)
// 记录鼠标右键按下的位置
const mousedownX = ref(0)
const mousedownY = ref(0)
const isMousedown = ref(false)
// 保存复制/剪切的节点的数据，后续可以原来粘贴
let copyData = null

  export default {
    name:'mindIndex',
    mixins:[utilsMixin,loadMixin],
    components: {topToolBar,mindtoolbar},
    computed:{
        
    },
    props: {},
    data() {
      return {
        mindMapModel:null,
        
      };
    },
  computed:{
     
  },
  created: function () {
    this.loading = true
    
  },

  mounted: function () {
    this.loading = false
    
    if((this.$route.params && this.$route.params.mindbizNo && this.$route.params.rootNo) || (this.$route.query && this.$route.query.mindbizNo && this.$route.query.rootNo)){
        this.$set(this,'routeMade','cust')
    }
    switch (this.routeMade) {
        case 'norm':
            this.initPage().then(res => {
                console.log('init Page',res)
                if(res && !this.mindMapModel){
                    this.initMind(this.dataTemp)
                    
                }
            })  // 加载数据
            break;
        case 'cust':
            this.getCustConfig().then(res => {
                console.log('getCustConfig Page',res)
                // if(res && !this.mindMapModel){
                //     this.initMind(this.dataTemp)
                    
                // }
            })  // 加载数据
            break;
        default:
            break;
    }
    
  },
  
    
  
    methods: {
        getAllData(){

            this.getFullData(this.mindMapModel).then(res=>{
                console.log(res)
            })
        },
        resetMindMap(){
            this.initMind(this.dataTemp)
        },
        // loadMind(){
        //     // 从数据中取出各个部分
        //     let storeData = {
        //         root:null,
        //         layout:null,
        //         theme:null,
        //         view:null,
        //     }
        //     let { root, layout, theme, view } = storeData
        //     this.mindMapModel = new MindMap({
        //         el: container,
        //         data: root,
        //         layout: layout,
        //         theme: theme.template,
        //         themeConfig: theme.config,
        //         viewData: view,
        //         // ...
        //     })
        // },
        initMind(d){
            // 转载初始化数据
            mindMap = new MindMap({
                el: document.getElementById('mindMapContainer'),
                // enableFreeDrag: true,
                theme:this.defaultTheme,
                layout:this.defaultLayout,
                data: d,
                mousewheelAction: 'move', // move zoom
                // initRootNodePosition: ['center', 'center'],
            });
            // const data = mindMap.getData(true)
            // 动态开启富文本编辑
            // mindMap.addPlugin(RichText)
            // 动态关闭富文本编辑
            // mindMap.removePlugin(RichText)
            this.mindMapModel = mindMap
            
            this.defaultTheme = this.mindMapModel.getTheme()
            mindMap.on('data_change',  this.onDataChange)
            // mindMap.on('view_data_change', this.nodeDragging)
            // mindMap.on('node_tree_render_end', updateMiniMp)


            // 右键点击事件 处理逻辑
            mindMap.keyCommand.addShortcut('Control+c', this.copy)
            mindMap.keyCommand.addShortcut('Control+v', this.paste)
            mindMap.keyCommand.addShortcut('Control+x', this.cut)

            mindMap.on('node_contextmenu', (e, node) => {
                console.log(e,node,'节点信息',this.rightMousedown)
                if(node){
                    this.rightMousedown.type = 'node'
                    this.rightMousedown.left = e.clientX + 10
                    this.rightMousedown.top = e.clientY + 10
                    this.rightMousedown.currentNode = node
                    this.rightMousedown.show = true
                }
                
            })
            
            mindMap.on('svg_mousedown', (e) => {
                // 如果不是右键点击直接返回

                console.log(e)
                if (e.which !== 3) {
                    return
                }
                this.rightMousedown.mousedownX = e.clientX
                this.rightMousedown.mousedownY = e.clientY
                this.rightMousedown.isMousedown = true

                this.clearNode()
            })

            mindMap.on('mouseup', (e) => {
                // 松开鼠标
                if (!this.rightMousedown.isMousedown) {
                    return
                }
                this.rightMousedown.isMousedown = false
                // 如果鼠标松开和按下的距离大于3，则不认为是点击事件
                if (
                    Math.abs(this.rightMousedown.mousedownX - e.clientX) > 3 ||
                    Math.abs(this.rightMousedown.mousedownY - e.clientY) > 3
                ) {
                    this.hide()
                    return
                }
                this.rightMousedown.type = 'svg'
                this.rightMousedown.left = e.clientX + 10
                this.rightMousedown.top = e.clientY + 10
                this.rightMousedown.show = true
            })
            // 监听事件
            mindMap.on('node_click', this.onNode) // 点击节点
            mindMap.on('draw_click', this.hide)
            mindMap.on('expand_btn_click', this.expandBtnClick)
            mindMap.on('rich_text_selection_change', (hasRange, rect, formatInfo) => {
                // 内容文字选中触发
                // hasRange（是否存在选区）
                // rectInfo（选区的尺寸和位置信息）
                // formatInfo（选区的文本格式化信息）
                // 显示你的工具栏
                console.log(hasRange, rect, formatInfo)
                if (hasRange) {
                    this.showToolbar.left = rect.left + rect.width / 2 + 'px'
                    this.showToolbar.top = rect.top - 40 + 'px'
                    this.showToolbar.currentFormatInfo = {
                        ...(formatInfo || {})
                    } 
                    console.log(this.showToolbar.currentFormatInfo)
                } 
                this.showToolbar.show = hasRange
            })
            mindMap.on('hide_text_edit',this.hideTextEdit)  // 节点修改框关闭
            

            mindMap.on('node_active', (node,activeNodeList) => {
                // 节点激活
                console.log('node_active',node,activeNodeList)
                // let activeNodes = args[1]
                this.activeNodes = activeNodeList
                if (this.activeNodes.length > 0) {
                    let firstNode = this.activeNodes[0]
                    this.currentIconList = firstNode.getData('icon') || []
                } else {
                    this.currentIconList = []
                }
            })
            mindMap.on('node_dragging',this.nodeDragging) // 节点拖拽
            mindMap.on('node_mousedown',this.nodeMousedown) // 节点鼠标按下
            mindMap.on('node_mouseup',this.nodeMouseup) // 节点鼠标松开
            
            mindMap.on('node_dragend', (uids ) => {
                // 拖拽结束
                console.log('node_dragend',uids)
                let type =  uids.overlapNodeUid ? 'overlapNodeUid' : uids.prevNodeUid ? 'prevNodeUid' : 'nextNodeUid'
                let uid = uids.overlapNodeUid ? uids.overlapNodeUid : uids.prevNodeUid ? uids.prevNodeUid : uids.nextNodeUid
                if(uid){
                    this.findNodeByUid(uid,type)
                }
                
            })
            

            
            this.defaultLayout = mindMap.getLayout()  // 回显 layout
            this.defaultScale = mindMap.view.getTransformData().state.scale * 100

            console.log(mindMap.getLayout(),mindMap.view.getTransformData())
            // mindMap.updateConfig({
            //     enableFreeDrag: true
            // })

            // this.onDataChange(mindMap.getData())
                
            // this.viewFit()
            
        }
        
    },
    watch:{
        
    }
  };
  </script>
  
  
  
  <style lang="scss" scoped>
  $primary:#409EFF;
  $success:#67C23A;
  $info:#909399;
  $warning:#E6A23C;
  $danger:#F56C6C;

  $black:#000000;

  $text:#303133;
  $grey:#C0C4CC;
  $lightGray:#DCDFE6;

  $border:#F2F6FC;
  $white:#FFFFFF;
  $Transparent:Transparent;
  $padding:10px;
  $borderRadius:6px;

  #mindMapContainer {
    width:100vw;
    height:100vh;
    
    
    > *:not(div) {
            *{
                margin: 0;
                padding: 0;
            }
        
    }
  }
  .tool-layout{
        position: fixed;
        .hander-layout,.side-layout,.footer-layout,.left-layout{
            position: fixed;
        }
        .left-layout{
            background:$white;
            padding:6px;
            left:0;
            top:100px;
            min-width:10rem;
            height:calc(100% - 160px);
            overflow-y:auto;
            overflow:hidden;
            min-height:30%;
        }
        .hander-layout{
            width:100%;
            top:0;
            background:$Transparent;
            padding:$padding;
            display:flex;
            justify-content:space-between;
            &>div{
                
                background:$white;
                border-radius:$borderRadius;
            }
            .mind-tools{
                display:flex;
                align-items:center;
                padding:0 6px;
                .mind-title{
                    padding:6px;
                }
            }
            .search-layout{
                display:flex;
            }
        }
        .side-layout{
            border-radius:$borderRadius;
            right:0;
            display:flex;
            align-items:center;
            flex-direction: row;
            top: 0;
            bottom:0;
                background: $Transparent;
            .side-toolbar{
                background:#fff;
                .side-toolbar-item{
                    display:flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    min-width:4rem;
                    padding:6px;
                    font-size:1rem;
                    cursor:pointer;
                    & > i{
                        font-size:2rem;
                    }
                    &:hover{
                        color:$primary;
                        background:$lightGray;
                    }
                    &.active {
                        background:$lightGray;
                        color:$primary;
                    }
                }
            }
            .side-layout-info{
                position: relative;
                background:#fff;
                width:16rem;
                z-index:999;
                bottom:100px;
                top:0;
                min-height:calc(100vh - 100px);
                max-height:calc(100vh - 100px);
                overflow-y:auto;
            }
        }
        .footer-layout{
            bottom:10px;
            right:10px;
            padding:10px;
            max-height:80px;
            width:100%;
            justify-content:space-between;
            display:flex;
            flex-direction:row;
            &>div{
                display:flex;
                flex-direction:row; 
                align-items:center;
            }
        }
        
    }
  .miniMapContainer {
    position: absolute;
    transform-origin: left top;
  }
  .contextMenu {
    position: absolute;
    z-index: 999;
    background: #fff;
    padding: 10px;
  }
  
  .contextMenuItem {
    cursor: pointer;
  }

  .toolbar {
    position: absolute;
    transform: translateX(-50%);
  }
  

  
  </style>
  