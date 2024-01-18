<template>
    <div>
        <div class="container-fluid p-0 m-0 " id="mapContainer" style="width:100%;
        height:calc(100vh - 10px);">
            
            
        </div>
        
        <div class="ui-layout" >
            <div class="ui-layout-left">
                <div class="ui-layout-left-head">
                    
                    <el-select v-model="activeDeptNo" filterable placeholder="请选择" style="width:100%;" v-if="modeUrl == '/bmap/check'">
                        <el-option
                        v-for="item in depts"
                        :key="item.dept_no"
                        :label="item.dept_name"
                        :value="item.dept_no">
                        </el-option>
                        <i slot="prefix" style="line-height:40px;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-diagram-3-fill" viewBox="0 0 16 16">
  <path fill-rule="evenodd" d="M6 3.5A1.5 1.5 0 0 1 7.5 2h1A1.5 1.5 0 0 1 10 3.5v1A1.5 1.5 0 0 1 8.5 6v1H14a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-1 0V8h-5v.5a.5.5 0 0 1-1 0V8h-5v.5a.5.5 0 0 1-1 0v-1A.5.5 0 0 1 2 7h5.5V6A1.5 1.5 0 0 1 6 4.5v-1zm-6 8A1.5 1.5 0 0 1 1.5 10h1A1.5 1.5 0 0 1 4 11.5v1A1.5 1.5 0 0 1 2.5 14h-1A1.5 1.5 0 0 1 0 12.5v-1zm6 0A1.5 1.5 0 0 1 7.5 10h1a1.5 1.5 0 0 1 1.5 1.5v1A1.5 1.5 0 0 1 8.5 14h-1A1.5 1.5 0 0 1 6 12.5v-1zm6 0a1.5 1.5 0 0 1 1.5-1.5h1a1.5 1.5 0 0 1 1.5 1.5v1a1.5 1.5 0 0 1-1.5 1.5h-1a1.5 1.5 0 0 1-1.5-1.5v-1z"/>
</svg>
                        </i>
                    </el-select>
                </div>
                <div class="ui-layout-left-body">
                    <el-card class="box-card" v-if="modeUrl == '/bmap/check'">
                        <div class="point-layout-bar" :class=" activeTollLink && tolllink && activeTollLink['id'] == tolllink['id'] ? 'active' : ''" v-for="(tolllink,s) in buildResLine" v-if="buildResLine.length > 0" @click.stop="onTollLink(tolllink)">
                            <div class="point-layout-bar-title">
                                {{tolllink.name}}
                                <span :style="`display:block;width:1rem;background-color:${activeTollLink && tolllink && activeTollLink['id'] == tolllink['id'] ? lineColors[s%4].selectedColor : lineColors[s%4].color};opacity:${0.8};border-radius: 4px;`"></span>
                            </div>
                            <!-- <div class="point-layout-bar-more">
                                {{tolllink.id}}
                            </div> -->
                        </div>
                    </el-card>
                    <el-card class="box-card" v-if="modeUrl == '/bmap/editor/'" :header-style="{ padding: '10px' }" :body-style="{ padding: '20px' }">
                        

                        <!-- 路径 -->
                        <div class="point-layout-bar" style="border:0;" v-for="(tolllink,s) in buildResLine" v-if="buildResLine.length > 0 && s == 0" @click.stop="onTollLink(tolllink)">
                            <div  class="point-layout-bar-title">
                                <span style="color:rgb(0, 122, 255);font-size:1.2rem;">车辆信息</span>
                                <!-- <el-button style="float: right; padding: 3px 0" type="text">操作按钮</el-button> -->
                            </div>
                            <div class="point-layout-bar-body" style="background-color:rgb(242 244 251);">
                                <div class="point-layout-bar-body-icon">
                                    <el-image
                                    style="width: 100px; height: 100px"
                                    :src="carIconUrl"
                                    :fit="'fit'"></el-image>
                                </div>
                                <div class="point-layout-bar-body-info">
                                    <div> {{tolllink.vehicleid}}</div>
                                    <div>起点： {{tolllink.enstationname}}</div>
                                    <div>终点： {{tolllink.exstationname}}</div>
                                    <div>应收：{{tolllink.payfee}}</div>
                                </div>
                               
                                <!-- <span :style="`display:block;width:1rem;background-color:${activeTollLink && tolllink && activeTollLink['id'] == tolllink['id'] ? lineColors[s%4].selectedColor : lineColors[s%4].color};opacity:${0.8};border-radius: 4px;`"></span> -->
                            </div>
                            <!-- <div class="point-layout-bar-more">
                                {{tolllink.id}}
                            </div> -->
                        </div>
                    </el-card>
                </div>
                <div class="ui-layout-left-footer">
                </div>
            </div>
            <div class="ui-layout-center">
                <div class="ui-layout-center-head">
                    
                    <el-button icon="el-icon-question" circle @click="showHelp = true"  v-if="modeUrl == '/bmap/check'"></el-button>
                    <el-button type="primary" v-if="updatePoints.length > 0 && modeUrl == '/bmap/check'" @click="submitUpdatePoints"  >保存</el-button>
                </div>
                <div class="ui-layout-center-body">
                </div>
                <div class="ui-layout-center-footer">
                    <div class="ui-layout-center-footer-bar" v-if="modeUrl == '/bmap/editor/'">
                        <div class="ui-layout-center-footer-bar-item" :class="activeLine && activeLine['_editor_type'] == line.type ? 'active' : ''" v-for="(line,i) in lineColors" v-if="line.type !== 'none'" @click="onEditorType(line.type)">
                            
                            <span v-if="line.type !== 'driving_min'" :style="`width:1rem;height:4px;background-color:${line.color};`">
                            </span>
                            <i v-if="line.type == 'driving_min'" class="el-icon-more" :style="`color:${line.color};`"></i>
                            
                            {{line.label}}
                        </div>
                    </div>
                    <div class="ui-layout-center-footer-bar" v-if="modeUrl == '/bmap/editor/'">
                        <div class="ui-layout-center-footer-bar-item" v-for="(point,i) in pointsColors">
                            <span :style="`color:${point.color};`">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-circle-fill" viewBox="0 0 16 16">
  <circle cx="8" cy="8" r="8"/>
</svg>
                            </span>
                            {{point.label}}
                        </div>
                    </div>
                </div>
            </div>
            <div class="ui-layout-right">
                <div class="ui-layout-right-head">
                    <div v-if="isEditor" style="background-color:#fff;">门架列表</div>
                    
                    <!-- <el-button icon="el-icon-edit" v-if="isEditor == false" @click="openIsEditor">校准</el-button> -->
                </div>
                <div class="ui-layout-right-body">
                    <el-card class="box-card" v-if="modeUrl == '/bmap/check'">
                        <div class="point-layout-bar" :class="activePoint && activePoint.id == station.id ? 'active' : ''" v-for="(station,s) in loadStations" v-if="loadStations.length > 0" @click="onPointList(station)">
                            <div class="point-layout-bar-title">
                                {{station.name}}
                                <!-- <span>{{station.category}}</span> -->
                                <el-tag v-if="station.category == '门架'" size="mini">{{station.category}}</el-tag>
                                <el-tag v-if="station.category == '收费站'" type="danger" size="mini">{{station.category}}</el-tag>
                                
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
                    <el-card class="box-card" v-if="modeUrl == '/bmap/editor/' && isEditor">
                        <!-- 路径可视化门架 -->
                        <el-timeline v-if="activeLine && activeLine.hasOwnProperty('all_points') && Array.isArray(activeLine['all_points']) && activeLine['all_points'].length > 0" style="padding-left:5px;">
                            <el-timeline-item
                            v-for="(station, index) in activeLine['all_points']"
                            :key="index"
                            :icon="station.icon"
                            :type="activePoint && activePoint.id == station.id ? 'primary' : 'info'"
                            :color="station.color"
                            :size="'large'"
                            :timestamp="station.timestamp"
                            @click="onPointList(station)">

                                <div class="point-layout-bar" :class="activePoint && activePoint.id == station.id ? 'active' : ''"  v-if="activeLine && activeLine.hasOwnProperty('all_points') && Array.isArray(activeLine['all_points']) && activeLine['all_points'].length > 0" @click="onPointList(station)">
                                    <div class="point-layout-bar-title">
                                        {{station.name}}
                                        <el-tag v-if="station.category == '门架'" size="mini">{{station.category}}</el-tag>
                                        <el-tag v-if="station.category == '收费站'" type="danger" size="mini">{{station.category}}</el-tag>
                                        
                                    </div>
                                    <div class="point-layout-bar-more">
                                        {{station.transtime}}
                                    </div>
                                </div>
                            </el-timeline-item>
                        </el-timeline>
                        
                        <!-- <div class="point-layout-bar" :class="activePoint && activePoint.id == station.id ? 'active' : ''" v-for="(station,s) in activeLine['all_points']" v-if="activeLine && activeLine.hasOwnProperty('all_points') && Array.isArray(activeLine['all_points']) && activeLine['all_points'].length > 0" @click="onPointList(station)">
                            <div class="point-layout-bar-title">
                                {{station.name}}
                                <el-tag v-if="station.category == '门架'" size="mini">{{station.category}}</el-tag>
                                <el-tag v-if="station.category == '收费站'" type="danger" size="mini">{{station.category}}</el-tag>
                                
                            </div>
                            <div class="point-layout-bar-more">
                                {{station.id}}
                            </div>
                        </div> -->
                        <div class="point-layout-bar none"  v-if="activeLine && activeLine.hasOwnProperty('all_points') && Array.isArray(activeLine['all_points']) && activeLine['all_points'].length == 0" >
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

                <el-dialog
                title="提示"
                :visible.sync="showHelp"
                width="30%"
                >
                    <div>1.切换路段：选择分公司>选择路段>选择门架或收费站.</div>
                    <div>2.地图操作：地图鼠标滚轮缩放，鼠标左键按下移动视口.</div>
                    <div>3.鼠标左键按下拖动地图门架或收费站图标，松开鼠标点击【确认】即可立即保存.</div>
                    <div>注意:选择路段或门架后地图会自动切换中心位置，缩放不合适请使用鼠标操作平移或放大缩小！</div>
                    <span slot="footer" class="dialog-footer">
                        <el-button type="primary" @click="showHelp = false">确 定</el-button>
                    </span>
                </el-dialog>
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
        showHelp:false,
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
            top: 0;
            left: 0;
            min-width:16rem;

            .ui-layout-left-head{
                display:flex;
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
                    padding:6px;
                    border-radius:6px;
                    overflow:hidden;
                    &.active{
                        border:1px solid $uiBarActiveBorderColor;
                        background-color: $uiBarActiveBgColor;
                        color:$uiBarActiveBorderColor;
                    }
                    .point-layout-bar-title{
                        font-size:12px;
                        display:flex;
                        justify-content: space-between;
                        
                    }
                    .point-layout-bar-body{
                        display:flex;
                        width:20rem;
                    }
                }
            }
            .ui-layout-left-footer{
                
            }
        }
        .ui-layout-center{
            position: fixed;
            width:calc(100% - 34rem);
            left:16rem;
            top:0;
            z-index:-1;
            .ui-layout-center-head{
                padding:1rem;
                display:flex;
                justify-content: end;
            }
            .ui-layout-center-body{
                
            }
            .ui-layout-center-footer{
                position: fixed;
                // top: 0;
                bottom: 1rem;
                display:flex;
                .ui-layout-center-footer-bar{
                    display:flex;
                    background-color:#fff;
                    margin-right:10px;
                    border-radius:4px;
                     padding:5px;
                    .ui-layout-center-footer-bar-item{
                        padding:5px;
                        display:flex;
                        align-items:center;
                        border:1px solid #fff;
                        &>span{
                            margin-right:4px;
                            display:inline-block;
                        }
                        &>i{
                            margin-right:4px;
                            display:inline-block;
                        }
                        &.active{
                            border:1px solid rgb(253, 226, 19);
                            background-color:rgb(255 252 231);
                        }
                        
                    }
                }
            }
        }
        .ui-layout-right{
            position: fixed;
            top: 0;
            right: 0;
            width:18rem;
            max-height:calc(100vh - 2rem);
            padding:1rem;
            display:grid;
            grid-template-rows: 30px auto 60px;
            .ui-layout-right-head{
                &>div{
                    
                    padding:0.5rem;
                    background-color:$bgColor;
                }
            }
            .ui-layout-right-body{
                max-height:calc(100vh - 5rem);
                position:relative;
                overflow:hidden;
                .box-card{
                    height:100%;
                    overflow-y: auto;
                }
                .point-layout-bar{
                    border:1px solid $uiBarBorderColor;
                    margin-bottom:4px;
                    overflow:hidden;
                    padding:6px;
                    border-radius:6px;
                    &.active{
                        border:1px solid $uiBarActiveBorderColor;
                        background-color: $uiBarActiveBgColor;
                    }
                    &.none{
                        text-align:center;
                        color:#ddd;
                    }
                    .point-layout-bar-title{
                        font-size:14px;
                    }
                    .point-layout-bar-more{
                        font-size:12px;
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
  