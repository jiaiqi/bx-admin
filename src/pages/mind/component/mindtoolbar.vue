<template>
    <div class="top-tool-bar">
        <div  v-for="(bars,index) in toolsBuild" class="tool-bar-group">
            <div class="bar-group">
                <div class="bar-group-title">
                    {{bars.name}}
                </div>
                <div class="bar-group-tools">
                    <template v-for="(tool,index) in bars.tools">
                        
                        <div class="tool-bar "  v-if="tool.key == 'search'">
                            <el-tooltip class="item" effect="dark" :content="tool.name" placement="bottom">
                                <el-button class="tool-bar"  :type="showSearch ?  'primary' :''" plain v-if="tool.key === 'search'" :title="tool.name" :disabled="!mindConfig" size="mini" @click="onSearch(tool.key)">
                                    
<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" class="bi bi-search" viewBox="0 0 16 16">
  <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
</svg>
                                </el-button>
                            </el-tooltip>
                        </div>
                        <div class="tool-bar "  v-if="tool.key == 'edit'">
                            <el-tooltip class="item" effect="dark" :content="tool.name" placement="bottom">
                                <el-button class="tool-bar"   plain v-if="tool.key === 'edit'" :title="tool.name" :disabled="!mindConfig" size="mini" @click="onSearch(tool.key)">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" class="bi bi-pencil-square" viewBox="0 0 16 16">
  <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
  <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"/>
</svg>
                                </el-button>
                            </el-tooltip>
                        </div>
                        <div class="tool-bar "  v-if="tool.key == 'tree'">
                            <el-tooltip class="item" effect="dark" :content="tool.name" placement="bottom">
                                <el-button class="tool-bar"  :type="showTree ?  'primary' :''" plain v-if="tool.key === 'tree'" :title="tool.name" :disabled="!mindConfig" size="mini" @click="onSearch(tool.key)">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" class="bi bi-ui-radios" viewBox="0 0 16 16">
  <path d="M7 2.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-7a.5.5 0 0 1-.5-.5v-1zM0 12a3 3 0 1 1 6 0 3 3 0 0 1-6 0zm7-1.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-7a.5.5 0 0 1-.5-.5v-1zm0-5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm0 8a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zM3 1a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm0 4.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/>
</svg>
                                </el-button>
                            </el-tooltip>
                        </div>
                        <div class="tool-bar "  v-if="tool.key == 'theme'">
                   
                        
                            <el-dropdown trigger="click" v-if="tool.key === 'theme'"  @command="setTheme" >
                                
                                <el-tooltip class="item" effect="dark" :content="tool.name" placement="bottom">
                                    <el-button class="tool-bar" >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" class="bi bi-palette" viewBox="0 0 16 16">
                                            <path d="M8 5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm4 3a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM5.5 7a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm.5 6a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"/>
                                            <path d="M16 8c0 3.15-1.866 2.585-3.567 2.07C11.42 9.763 10.465 9.473 10 10c-.603.683-.475 1.819-.351 2.92C9.826 14.495 9.996 16 8 16a8 8 0 1 1 8-8zm-8 7c.611 0 .654-.171.655-.176.078-.146.124-.464.07-1.119-.014-.168-.037-.37-.061-.591-.052-.464-.112-1.005-.118-1.462-.01-.707.083-1.61.704-2.314.369-.417.845-.578 1.272-.618.404-.038.812.026 1.16.104.343.077.702.186 1.025.284l.028.008c.346.105.658.199.953.266.653.148.904.083.991.024C14.717 9.38 15 9.161 15 8a7 7 0 1 0-7 7z"/>
                                        </svg>
                                        <span style="font-size:14px;">
                                            {{tool.value && tool.predefines.filter(item => item.value == tool.value).length == 1 ? tool.predefines.filter(item => item.value == tool.value)[0].name : '默认'}}
                                        </span>
                                        
                                    </el-button>
                                </el-tooltip>
                                <el-dropdown-menu slot="dropdown" style="max-height:50vh;overflow-y:auto;">
                                    <el-dropdown-item :style="`color:${tool.value == font.value ? '#409EFF' : '#333'};`" v-for="(font,f) in tool.predefines" :key="f" :command="font.value" :icon="tool.value == font.value ?'el-icon-check':''">
                                        {{font.name}}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </el-dropdown>
                        </div>
                        <div class="tool-bar "  v-if="tool.key == 'layout'">
                   
                        
                            <el-dropdown trigger="click" v-if="tool.key === 'layout'"  @command="setLayout" >
                                
                                <el-tooltip class="item" effect="dark" :content="tool.name" placement="bottom">
                                    <el-button class="tool-bar" >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" class="bi bi-share" viewBox="0 0 16 16">
                                            <path d="M13.5 1a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM11 2.5a2.5 2.5 0 1 1 .603 1.628l-6.718 3.12a2.499 2.499 0 0 1 0 1.504l6.718 3.12a2.5 2.5 0 1 1-.488.876l-6.718-3.12a2.5 2.5 0 1 1 0-3.256l6.718-3.12A2.5 2.5 0 0 1 11 2.5zm-8.5 4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm11 5.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z"/>
                                        </svg>
                                        <span style="font-size:14px;">
                                            {{tool.value && tool.predefines.filter(item => item.layout == tool.value).length == 1 ? tool.predefines.filter(item => item.layout == tool.value)[0].name : '布局'}}
                                        </span>
                                        
                                    </el-button>
                                </el-tooltip>
                                <el-dropdown-menu slot="dropdown" style="max-height:50vh;overflow-y:auto;">
                                    <el-dropdown-item :style="`color:${tool.value == font.layout ? '#409EFF' : '#333'};`" v-for="(font,f) in tool.predefines" :key="f" :command="font.layout" :icon="tool.value == font.layout ?'el-icon-check':''">
                                        <el-image
                                            class="border"
                                            style="width: auto; height: 32px"
                                            :src="font.legend"
                                            :fit="'contain'"></el-image>
                                            {{font.name}} 
                                       
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </el-dropdown>
                        </div>
                        
                    </template>
                </div>
            </div>
        </div>
        
    </div>
</template>
<script>
import {walk} from 'simple-mind-map/src/utils'
import { themeList } from 'simple-mind-map/src/constants/constant'
import logicalStructure from '../images/logicalStructure.png'  // tuli
import mindMap from '../images/mindMap.png'  // tuli
import organizationStructure from '../images/organizationStructure.png'  // tuli
import catalogOrganization from '../images/catalogOrganization.png'  // tuli
import timeline from '../images/timeline.png'  // tuli
import timeline2 from '../images/timeline2.png'  // tuli
import fishbone from '../images/fishbone.png'  // tuli
import verticalTimeline from '../images/verticalTimeline.png'  // tuli
export default {
    name:'mind-tool-bar',
    props:{
        mode:{
            type:String,
            default(){
                return 'norm'
            }
        },
        activeNodes:{
            type:Array,
            default(){
                return []
            }
        },
        showTree:{
            type:Boolean,
            default(){
                return false
            } 
        },
        showEdit:{
            type:Boolean,
            default(){
                return false
            } 
        },
        showSearch:{
            type:Boolean,
            default(){
                return false
            } 
        },
        mindConfig:{
            type:Object,
            default(){
                return null
            }
        },
        layouts:{
            type:Array,
            default(){
                return [
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
                        layout:'verticalTimeline',
                        name:'竖向时间轴',
                        legend:verticalTimeline
                    },
                    
                ]
            }
        },
        tools:{
            type:Array,
            default(){
                return [{
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
            }
        }
    },
    data() {
        return {
            
           nodeStyle:{
                color:''
           },
           
        }
    },
    
    computed: {
        
        toolsBuild(){
            let tools = this.bxDeepClone(this.tools)
            let mindConfig = this.mindConfig ? this.mindConfig : null
            let toolsMode = this.mode
            if(mindConfig){
                // 获取节点原始样式
                let theme = mindConfig.mainMind.theme || ''
                let layout = mindConfig.mainMind.mind_style || ''
                if(toolsMode == 'cust'){
                    layout = mindConfig.mainMind.default_style
                    console.log('default_style',layout)
                    let list = this.layouts
                    for(let l of list){
                        if(layout && l.name == layout){
                            layout = l.layout
                        }
                    }
                    for(let bars of tools){
                        for(let tool of bars.tools){
                            if(tool.key == 'theme' && theme){
                                tool['value'] = theme
                            }
                            if(tool.key == 'layout' && layout){
                                tool['value'] = layout
                                tool['predefines'] = this.layouts.map(item => item)
                            }
                        }
                    }
                }else{
                    for(let bars of tools){
                        for(let tool of bars.tools){
                            if(tool.key == 'theme'){
                                tool['value'] = theme
                            }
                            if(tool.key == 'layout'){
                                tool['value'] = layout
                                tool['predefines'] = this.layouts.map(item => item)
                            }
                        }
                    }
                }
                
            }
            
            return tools
        },
        fontWeight(){
            let fontWeight = 'bold'
            for(let node of this.activeNodes){
                let style = node.getStyle()
                if(style.hasOwnProperty('fontWeight')){
                    fontWeight = style.fontWeight 
                }else{
                    fontWeight = 'none'
                }
                console.log('fontWeight',node.getStyle())
            }
            return fontWeight
        },
        textDecoration(){
            let textDecoration = ''
            for(let node of this.activeNodes){
                let style = node.getStyle()
                if(style.hasOwnProperty('textDecoration')){
                    textDecoration = style.textDecoration 
                }else{
                    textDecoration = ''
                }
                console.log('textDecoration',node.getStyle())
            }
            return textDecoration
        }
    },
    methods: {
        
        setTheme(e){
            console.log(e)
            let obj = {
                execCommand:'setTheme',
                config:{}
            }
            obj['config']['theme'] = e
            this.$emit('set-mind-config',obj)
        }, 
        setLayout(e){
            // 设置结构
            console.log(e)
            let obj = {
                execCommand:'setLayout',
                config:{}
            }
            obj['config']['layout'] = e
            this.$emit('set-mind-config',obj)
        }, 
        onSearch(e){
            // 点击工具架
            let obj = {
                execCommand:'showLayout',
                config:{}
            }
            switch (e) {
                case 'search':
                    obj['execCommand'] = 'showSearch'
                    obj['config']['showSearch'] = !this.showSearch
                    break;
                case 'tree':
                    obj['execCommand'] = 'showTree'
                    obj['config']['leftLayout'] = !this.showTree
                    
                    break;
                case 'edit':
                    obj['execCommand'] = 'showEditTitle'
                    obj['config']['editTitle'] = !this.showEdit
                    
                    break;
            
                default:
                    break;
            }
            
            this.$emit('set-mind-config',obj)
        }




    }

};
</script>
<style lang="scss">
.top-tool-bar{
    background:#fff;
    padding:5px;

    display:flex;
    align-items:center;
    &>div{
        margin-right:5px;
    }
    .tool-bar-group{
        
        .bar-group{
            display:flex;
            align-items:center;
            border-right:1px solid #eee;
            margin-right:5px;
            padding-right:5px;
            flex-direction:column;
            .bar-group-title{
                font-size:8px;
            }
            .bar-group-tools{
                display:flex;
                align-items:center;
                margin-right:5px;
                padding-right:5px;
                .tool-bar{
                    padding:4px 4px;
                    font-size:18px;
                    display:flex;
                    align-items:center;
                    &>div{
                        height:100%;
                        display:flex;
                    }
                    .tool-bar-group{
                        border-radius:3px;
                        display:flex;
                        padding-left:4px;
                        align-items:center;

                    }
                    .el-color-picker.el-color-picker--small{
                        height:28px;
                        width:28px;
                        .el-color-picker__trigger{
                            // padding:2px;
                            border:0;
                            height:28px;
                            width:28px;
                            .el-color-picker__color{
                                border:0;
                                padding:2px;
                            }
                        }
                    }
                    
                }
            }
        }
    }
   
}
</style>
