<template>
    <div>
        <div class="container-fluid p-0 m-0 " id="mapContainer" style="width:100%;
        height:calc(100vh - 10px);">
            
            
        </div>
        <div class="ui-layout" >
                    <!-- v-if="lineInfoShow && activeLine" -->
                    <div class="line-info-title">
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
                    </div>
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

import { getBaiduMapApi} from './api.js'

import mapMixin from './map-mixin.js'
// import {BmNavigation,BmCityList,BmMarker,BmContextMenu,BmContextMenuItem,BmBoundary,BmlLushu,BmDriving,BmLabel,BmPolyline,BmInfoWindow,BmControl} from 'vue-baidu-map'
// bm-navigation
  export default {
    name: 'bmap-web',
    // components:{BaiduMap,BmNavigation,BmCityList,BmMarker,BmContextMenu,BmContextMenuItem,BmBoundary,BmlLushu,BmDriving,BmLabel,BmPolyline,BmInfoWindow,BmControl},
    mixins:[mapMixin],
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
    mounted(){
        this.initMap()
        this.getDriving()
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
    height:calc(100vh - 10px);
    
}

.ui-layout{
        
        height:400px;
        position: fixed;
        top: 10px;
        left: 10px;
        background: #fff;
        color:#000;
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
  