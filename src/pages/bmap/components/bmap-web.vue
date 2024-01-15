<template>
    <div>
        <div class="container-fluid p-0 m-0 " id="mapContainer" style="width:100%;
        height:calc(100vh - 10px);">
            
            
        </div>
        
        <div class="ui-layout" >
            <div class="ui-layout-left">
                <div class="ui-layout-left-head">
                    <el-select v-model="activeDeptNo" filterable placeholder="请选择" style="width:100%;">
                        <el-option
                        v-for="item in depts"
                        :key="item.dept_no"
                        :label="item.dept_name"
                        :value="item.dept_no">
                        </el-option>
                    </el-select>
                </div>
                <div class="ui-layout-left-body">
                    <el-card class="box-card">
                        <div class="point-layout-bar" :class=" activeTollLink && tolllink && activeTollLink['id'] == tolllink['id'] ? 'active' : ''" v-for="(tolllink,s) in buildResLine" v-if="buildResLine.length > 0" @click.stop="onTollLink(tolllink)">
                            <div class="point-layout-bar-title">
                                {{tolllink.name}}
                                <!-- <span>{{tolllink.category}}-{{tolllink.grantry_type}}</span> -->
                            </div>
                            <div class="point-layout-bar-more">
                                {{tolllink.id}}
                            </div>
                        </div>
                    </el-card>
                </div>
                <div class="ui-layout-left-footer">
                </div>
            </div>
            <div class="ui-layout-center">
                <div class="ui-layout-center-head">
                </div>
                <div class="ui-layout-center-body">
                </div>
                <div class="ui-layout-center-footer">
                </div>
            </div>
            <div class="ui-layout-right">
                <div class="ui-layout-right-head">
                    门架列表
                </div>
                <div class="ui-layout-right-body">
                    <el-card class="box-card">
                        <div class="point-layout-bar" :class="activePoint && activePoint.id == station.id ? 'active' : ''" v-for="(station,s) in loadStations" v-if="loadStations.length > 0" @click="onPointList(station)">
                            <div class="point-layout-bar-title">
                                {{station.name}}
                                <span>{{station.category}}-{{station.grantry_type}}</span>
                            </div>
                            <div class="point-layout-bar-more">
                                {{station.id}}
                            </div>
                        </div>
                        <div class="point-layout-bar none"  v-if="loadStations.length == 0" >
                            <div class="point-layout-bar-title">
                                未选择路段
                            </div>
                            <div class="point-layout-bar-more">
                                暂无门架可显示
                            </div>
                        </div>
                    </el-card>
                    
                </div>
                <div class="ui-layout-right-footer">
                </div>
            </div>
                    <!-- <div class="line-info-title">
                        <button >关闭</button>
                    </div>
                    <div class="line-info-mini" v-if="activeLine">
                        {{activeLine.lineId}}
                    </div>
                    <div class="line-info-content">
                        <div class="line-info-content-list" v-if="polylines && Array.isArray(polylines) && polylines.length > 0">
                            <div v-for="(line,index) in polylines" @click="onLineList(line)" class="list-table-layout-tr" :class="activeLine && activeLine.uid == line.uid ? 'active' : ''">
                                {{line.uid}}
                                <span :style="`background-color:${line.strokeColor};width:1rem;height:8px;opacity:${line.strokeOpacity};`"></span>
                            </div>
                        </div> 
                        <div class="line-info-content-list" v-if=" activeLine && Array.isArray(activeLine['waypoints_points'])">
                            <div v-for="(item,index) in activeLine['waypoints_points']" @click="onPointList(item)" class="list-table-layout-tr" :class="activePoint && activePoint.uid == item.uid ? 'active' : ''">
                                <img :src="item.icon" width="24px" height="24px"></img>
                                {{item.name}}
                                
                            </div>
                        </div>
                    </div> -->
                    <!-- waypoints_points -->
        </div>
                <!-- <div class="top-tool-bar">
                    <div class="tool-bar" v-for="(tool,index) in topTools" @click="onClickBar(tool)">
                        <i :class="tool.icon"></i>
                        <span>{{tool.label}}</span>
                    </div>
                </div> -->
    </div>
    
  </template>
  
  <script>
  
// import store from '@/store'

import cameraIcon from '../assets/icon/camera.png'
// 
import gantry from '../assets/icon/gantry.png'
import gantryActive from '../assets/icon/gantry-active.png'
import startIcon from '../assets/icon/start.png'
import endIcon from '../assets/icon/end.png'
import toll from '../assets/icon/toll.png'
import tollActive from '../assets/icon/toll-active.png'

import { getBaiduMapApi} from './api.js'

import mapMixin from './map-mixin.js'  // 地图相关
import srvMixin from './service-mixin.js' // 业务相关
  export default {
    name: 'bmap-web',
    
    mixins:[mapMixin,srvMixin],
    data() {
      return {
        mockLines:[{
                name:'蓝色',
                type:'',
                id:'line-001',
                points:[
                    {
                        name:'起点',
                        lng:'108.889033',
                        lat:'34.181221',
                        startCity:'',
                        endCity:'',
                        type:0,
                        icon:cameraIcon,
                        active:false,
                        size:{
                            width:32,
                            height:32
                        },
                        id:'000'
                    },{
                    name:'模拟标点',
                    lng:'108.893024',
                    lat:'34.18876',
                    startCity:'',
                    endCity:'',
                    type:0,
                    icon:cameraIcon,
                    active:false,
                    size:{
                        width:32,
                        height:32
                    },
                    id:'001'
                },{
                    name:'模拟标点',
                    lng:'108.875163',
                    lat:'34.194719',
                    startCity:'',
                    endCity:'',
                    type:0,
                    icon:cameraIcon,
                    active:false,
                    size:{
                        width:32,
                        height:32
                    },
                    id:'002'
                },{
                    name:'模拟标点',
                    lng:'108.838162',
                    lat:'34.20437',
                    startCity:'',
                    endCity:'',
                    type:0,
                    icon:cameraIcon,
                    active:false,
                    size:{
                        width:32,
                        height:32
                    },
                    id:'003'
                },{
                        name:'终点',
                        lng:'108.798106',
                        lat:'34.404827',
                        startCity:'',
                        endCity:'',
                        type:0,
                        icon:cameraIcon,
                        active:false,
                        size:{
                            width:32,
                            height:32
                        },
                        id:'00x'
                    }]
                },{
                    name:'红色',
                    type:'',
					id:'line-002',
                    points:[
                    {
                        name:'起点',
                        lng:'108.889033',
                        lat:'34.181221',
                        startCity:'',
                        endCity:'',
                        type:0,
                        icon:cameraIcon,
                        active:false,
                        size:{
                            width:32,
                            height:32
                        },
                        id:'000'
                    },{
                    name:'模拟标点',
                    lng:'108.893024',
                    lat:'34.18876',
                    startCity:'',
                    endCity:'',
                    type:0,
                    icon:cameraIcon,
                    active:false,
                    size:{
                        width:32,
                        height:32
                    },
                    id:'001'
                },{
                    name:'模拟标点',
                    lng:'108.875163',
                    lat:'34.194719',
                    startCity:'',
                    endCity:'',
                    type:0,
                    icon:cameraIcon,
                    active:false,
                    size:{
                        width:32,
                        height:32
                    },
                    id:'002'
                },{
                    name:'模拟标点',
                    lng:'108.838162',
                    lat:'34.20437',
                    startCity:'',
                    endCity:'',
                    type:0,
                    icon:cameraIcon,
                    active:false,
                    size:{
                        width:32,
                        height:32
                    },
                    id:'003'
                },{
                    name:'模拟标点',
                    lng:'108.849741',
                    lat:'34.294792',
                    startCity:'',
                    endCity:'',
                    type:0,
                    icon:cameraIcon,
                    active:false,
                    size:{
                        width:32,
                        height:32
                    },
                    id:'004'
                },
                {
                        name:'终点',
                        lng:'108.798106',
                        lat:'34.404827',
                        startCity:'',
                        endCity:'',
                        type:0,
                        icon:cameraIcon,
                        active:false,
                        size:{
                            width:32,
                            height:32
                        },
                        id:'00x'
                    }]
                },{
                    name:'绿色',
                    type:'',
                    id:'line-003',
                    points:[
                    {
                        name:'起点',
                        lng:'108.889033',
                        lat:'34.181221',
                        startCity:'',
                        endCity:'',
                        type:0,
                        icon:cameraIcon,
                        active:false,
                        size:{
                            width:32,
                            height:32
                        },
                        id:'000'
                    },{
                    name:'模拟标点',
                    lng:'108.893024',
                    lat:'34.18876',
                    startCity:'',
                    endCity:'',
                    type:0,
                    icon:cameraIcon,
                    active:false,
                    size:{
                        width:32,
                        height:32
                    },
                    id:'001'
                },{
                    name:'模拟标点',
                    lng:'108.875163',
                    lat:'34.194719',
                    startCity:'',
                    endCity:'',
                    type:0,
                    icon:cameraIcon,
                    active:false,
                    size:{
                        width:32,
                        height:32
                    },
                    id:'002'
                },{
                    name:'模拟标点',
                    lng:'108.838162',
                    lat:'34.20437',
                    startCity:'',
                    endCity:'',
                    type:0,
                    icon:cameraIcon,
                    active:false,
                    size:{
                        width:32,
                        height:32
                    },
                    id:'003'
                },{
                    name:'模拟标点',
                    lng:'108.849741',
                    lat:'34.294792',
                    startCity:'',
                    endCity:'',
                    type:0,
                    icon:cameraIcon,
                    active:false,
                    size:{
                        width:32,
                        height:32
                    },
                    id:'004'
                },{
                    name:'模拟标点',
                    lng:'108.78995',
                    lat:'34.326875',
                    startCity:'',
                    endCity:'',
                    type:0,
                    icon:cameraIcon,
                    active:false,
                    size:{
                        width:32,
                        height:32
                    },
                    id:'005'
                },
                {
                        name:'终点',
                        lng:'108.798106',
                        lat:'34.404827',
                        startCity:'',
                        endCity:'',
                        type:0,
                        icon:cameraIcon,
                        active:false,
                        size:{
                            width:32,
                            height:32
                        },
                        id:'00x'
                    }]
                }
            ]

      }
    },
    props: {
        markers:{
            type:Array,
            default(){
                return [{

                }]
            }
        }
    },
    
    computed:{
        
    },
      methods: {
        
    },
    watch:{
        "buildResLine":{
            deep:true,
            handler:function (nval,oval) {
                console.log('buildResLine',nval)
                this.$nextTick(() => {
                    this.getDriving()
                })
               
            }
        },
        "activeLine":{
            deep:true,
            handler:function (nval,oval) {
                console.log('activeLine',nval)
                if(nval){
                    this.$nextTick(() => {
                        this.removeOverlays(nval)
                    })
                    
                }
                
            }
        }
    }
  }
  </script>
  
  <!-- Add "scoped" attribute to limit CSS to this component only -->
  <style lang="scss" scoped>
#mapContainer{
    width:100%;
    height:calc(100vh - 1px);
    
}
$activeColor:#409eff;
$activeBgColor:#ebf4fd;
$uiBarBorderColor:#eee;
$uiBarActiveBorderColor:$activeColor;
$uiBarActiveBgColor:$activeBgColor;
$bgColor:#fff;
.ui-layout{
        
        // height:400px;
        position: fixed;
        top:0;
        left:0;
        // right:0;
        // bottom:0;
        // height:100vh;
        // width:100vw;
        
        // display:grid;
        //     grid-template-columns: 16rem auto 16rem;
        .ui-layout-left{
            padding:1rem;
            position: fixed;
            top: 10px;
            left: 10px;
            width:16rem;

            .ui-layout-left-head{

            }
            .ui-layout-left-body{
                max-height:calc(100% - 0px);
                position:relative;
                overflow:hidden;
                .box-card{
                    height:100%;
                    overflow-y: auto;
                }
                .point-layout-bar{
                    border:1px solid $uiBarBorderColor;
                    margin-bottom:4px;
                    padding:2px;
                    overflow:hidden;
                    &.active{
                        border:1px solid $uiBarActiveBorderColor;
                        background-color: $uiBarActiveBgColor;
                    }
                }
            }
            .ui-layout-left-footer{
                
            }
        }
        .ui-layout-center{
            // position: fixed;
            width:100%;
            z-index:-1;
            .ui-layout-left-head{

            }
            .ui-layout-left-body{
                
            }
            .ui-layout-left-footer{
                
            }
        }
        .ui-layout-right{
            position: fixed;
            top: 10px;
            right: 10px;
            width:16rem;
            max-height:calc(100vh - 2rem);
            padding:1rem;
            display:grid;
            grid-template-rows: 30px auto 60px;
            .ui-layout-right-head{
                padding:0.5rem;
                background-color:$bgColor;
            }
            .ui-layout-right-body{
                max-height:calc(100vh - 4rem);
                position:relative;
                overflow:hidden;
                .box-card{
                    height:100%;
                    overflow-y: auto;
                }
                .point-layout-bar{
                    border:1px solid $uiBarBorderColor;
                    margin-bottom:4px;
                    padding:2px;
                    overflow:hidden;
                    &.active{
                        border:1px solid $uiBarActiveBorderColor;
                        background-color: $uiBarActiveBgColor;
                    }
                    &.none{
                        text-align:center;
                        color:#ddd;
                    }
                }
                
            }
            .ui-layout-right-footer{
                
            }
        }
        .line-info-content{
            display:flex;
            .line-info-content-list{
                width:10rem;
                .list-table-layout-tr{
                    display:flex;
                    align-items:center;
                    text-align:left;
                    &.active{
                        color:#1eaaff;
                    }
                }
            }
            
        }
    }
    .top-tool-bar{
        position: fixed;
        top: 10px;
        right: 10px; 
        display:flex;
        .tool-bar{
            background-color:#fff;
            border-radius:2px;
            padding:4px;
            display:flex;
            align-items:center;
            margin-right:10px;
            color:#323232;
        }
    }
  </style>
  