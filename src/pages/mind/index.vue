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
            <div class="hander-layout"></div>
            <div class="side-layout"></div>
            <div class="footer-layout">

                <el-dropdown @command="setTheme" trigger="click">
                    <el-button class="el-dropdown-link" plain type="primary" style="margin-right:10px;">
                        {{activeTheme ? activeTheme.name : '切换皮肤'}}
                        <i class="el-icon-arrow-down el-icon--right"></i></el-button>
                    <!-- <span class="el-dropdown-link">
                        下拉菜单<i class="el-icon-arrow-down el-icon--right"></i>
                    </span> -->
                    <el-dropdown-menu slot="dropdown" style="max-height:20rem;overflow-y:auto;">
                        <el-dropdown-item :style="`color:${theme.value == defaultTheme ? '#409EFF' : '#000'};`"  :command="theme.value" v-for="(theme,index) in themeListDefault" >
                            
                            {{theme.name}}
                            <i v-if="theme.value == defaultTheme" class="el-icon-check"></i>
                        </el-dropdown-item>
                    </el-dropdown-menu>
                <!-- icon="el-icon-plus" @click="setTheme(theme.value)" -->
                </el-dropdown>
               

                <el-button  type="primary" @click="exportFile('pdf')">导出</el-button>

                <el-button  type="primary" @click="getAllData()">获取数据</el-button>
                <el-button  type="danger" @click="resetMindMap()">重置</el-button>

            </div>
        </div>
        <div class="contextMenu" v-if="rightMousedown.show" :style="{ left: rightMousedown.left + 'px', top: rightMousedown.top + 'px' }">
            <template v-if="rightMousedown.type === 'node'">
                <div class="contextMenuItem" @click="copy">复制</div>
                <div class="contextMenuItem" @click="cut">剪切</div>
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
    </div>
        


  </template>
  
  <script>
  

import MindMap from "simple-mind-map";
import { ref, onMounted, shallowRef } from 'vue'
import { nodeIconList } from 'simple-mind-map/src/svg/icons'
import utilsMixin from './utils/util-mixin.js'

import RichText from 'simple-mind-map/src/plugins/RichText.js'  // 节点富文本编辑
import Export from 'simple-mind-map/src/plugins/Export.js'  // 导出插件
import ExportPDF from 'simple-mind-map/src/plugins/ExportPDF.js' // 导出pdf

MindMap.usePlugin(Export)
MindMap.usePlugin(ExportPDF)
MindMap.usePlugin(RichText)

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
    mixins:[utilsMixin],
    components: {},
    computed:{
        
    },
    props: {},
    data() {
      return {
        mindMapModel:null,
        loading:false,
        loadtext:'加载中',
        dataTemp:{
            data:{
                // 节点文本
                text: '根节点',
                // 图片
                image: '',
                imageTitle: '图片名称',
                imageSize: {
                    width: 1152,
                    height: 1152
                },
                // 图标
                icon: ['priority_1'],
                // 标签
                tag: ['标签1', '标签2'],
                // 链接
                hyperlink: 'http://lxqnsys.com/',
                hyperlinkTitle: '理想青年实验室',
                // 备注内容
                note: '理想青年实验室\n一个有意思的角落',
                // 概要
                generalization: {
                    text: '概要的内容'
                },
                // 节点是否展开
                expand: true,
            },
            "children": [
                {
                "data": {
                    "text": "二级节点"
                },
                "children": []
                },
                {
                "data": {
                    "text": "二级节点"
                },
                "children": []
                }
            ]
        }
      };
    },
  computed:{
     
  },
  created: function () {
    this.loading = true
    
  },

  mounted: function () {
    this.loading = false
    this.initMind(this.dataTemp)
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
        loadMind(){
            // 从数据中取出各个部分
            let storeData = {
                root:null,
                layout:null,
                theme:null,
                view:null,
            }
            let { root, layout, theme, view } = storeData
            this.mindMapModel = new MindMap({
                el: container,
                data: root,
                layout: layout,
                theme: theme.template,
                themeConfig: theme.config,
                viewData: view,
                // ...
            })
        },
        initMind(d){
            // 转载初始化数据
            mindMap = new MindMap({
                el: document.getElementById('mindMapContainer'),
                data: d,
                initRootNodePosition: ['center', 'center'],
            });
            // const data = mindMap.getData(true)
            // 动态开启富文本编辑
            mindMap.addPlugin(RichText)
            // 动态关闭富文本编辑
            // mindMap.removePlugin(RichText)
            this.mindMapModel = mindMap
            
            this.defaultTheme = this.mindMapModel.getTheme()
            // mindMap.on('data_change', updateMiniMp)
            // mindMap.on('view_data_change', updateMiniMp)
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
            mindMap.on('node_click', this.hide)
            mindMap.on('draw_click', this.hide)
            mindMap.on('expand_btn_click', this.hide)
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
                
                
        },
        hide(){
            this.rightMousedown.left = 0
            this.rightMousedown.top = 0
            this.rightMousedown.type = ''
            this.rightMousedown.show = false
        }
        
    },
    watch:{
        
    }
  };
  </script>
  
  
  
  <style lang="scss" scoped>
  
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
        .hander-layout,.side-layout,.footer-layout{
            position: fixed;
        }
        .hander-layout{
            top:10px;

        }
        .side-layout{
            right:10px;
        }
        .footer-layout{
            bottom:10px;
            right:10px;
            padding:10px;
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
  