
<template>
    <div class="monitor">
        <!--面包屑-->
        <span class="content_span">
            <el-breadcrumb separator-class="el-icon-arrow-right">
                <el-breadcrumb-item :to="{ path: '/index' }">首页</el-breadcrumb-item>
                <el-breadcrumb-item>后台管理</el-breadcrumb-item>
                <el-breadcrumb-item>人员管理</el-breadcrumb-item>
                <el-breadcrumb-item>{{this.$route.meta.title}}</el-breadcrumb-item>
            </el-breadcrumb>
        </span>
        <!-- 左侧信息 -->
        <div class="left">
            <el-tree 
              :data="data" 
              :props="defaultProps"
              show-checkbox
              @check-change="handleCheckChange">
              <span class="custom-tree-node" slot-scope="{ node, data }">
                <span>
                    <i :class="node.icon"></i>{{ node.label }}
                </span>              
            </span>
            </el-tree>
        </div>
 
        <!-- 地图 -->
        <div id="map">
        
        </div>
 
        <!-- 下面的展示区域 -->
        <div class="bottom">
              <el-table
                :data="tableData"
                style="width: 100%">
                <el-table-column
                    prop="Name"
                    label="设备名称"
                    width="200">
                </el-table-column>
                <el-table-column
                    prop="Address"
                    label="地理位置">
                </el-table-column>
                <el-table-column
                    prop="Speed"
                    label="速度"
                    width="200">
                </el-table-column>
                <el-table-column
                    prop="Time"
                    label="上报时间"
                    width="300">
                </el-table-column>
                <el-table-column
                    prop="IsStatus"
                    label="是否在线"
                    width="200">
                </el-table-column>
             </el-table>
        </div>
    </div>
</template>
 
<script>
var _this;
import axios from '../../apiconfig/index.js';

const moment=require('moment');
export default {
    data(){
        return {
           data:[{
                label: '设备列表',
                children: [{
                    label: 'HBWS',
                        children: [{
                            label:"1095001"
                        }]
                }]
           }],
           defaultProps: {
              children: 'children',
              label: 'label'
           },
 
           map:'',
           point:'',
           marker:'',
           label:'',
           icon:'',
           timer:null,
 
           description:{
                type:String,
                default:'天安门'
           },
           pu:[],
           
           tableData:[]
           
        }
    },
    mounted(){
       _this=this;
       _this.getPuName();
       window.localStorage.removeItem('PuID');
       _this.baidu();
    },
    beforeDestroy(){
      clearInterval(_this.timer);
    },
    methods:{
       //获取getPuName
       getPuName(){
            axios
            .get('/api/SafetyHat/GetEquipment')
            .then(res=>{
                console.log(res)
                if(res.ResultType==0){
                    _this.pu=res.Data.pu;
                    _this.data[0].children[0].children=res.Data.pu.map((item)=>{
                        return {
                            label:item.PuName
                        }
                    })
                }
            })
            .catch(error=>{
                console.log(error)
            })
       },
       //设置定时器
       setDing(){
            if(localStorage.getItem('PuID') != undefined && localStorage.getItem('PuID') != null){
                //封装函数
                function move(){
                    console.log('666')                    
                        _this.map.removeOverlay(_this.marker);
                        axios
                        .get('/api/SafetyHat/Monitor',{
                            params:{
                                PuID:localStorage.getItem('PuID') || ''
                            }
                        })
                        .then(res=>{
                            console.log(res)
                            var PuName=_this.pu.find(itm=>{return itm.PuID==localStorage.getItem('PuID')}).PuName
                            if(res.ResultType==0){
                                _this.point=new BMap.Point(res.Data[0].Longitude,res.Data[0].Latidude);
                                if(res.Data[0].State == 1){
                                    _this.icon=new BMap.Icon('../../../static/imgs/map1.png', new BMap.Size(25, 20), {
                                            anchor: new BMap.Size(10, 20)
                                    });
                                }else{
                                    _this.icon=new BMap.Icon('../../../static/imgs/cap.png', new BMap.Size(25, 20), {
                                            anchor: new BMap.Size(10, 20)
                                    });
                                }
                                _this.map.centerAndZoom(_this.point, 17);
                                _this.label = new BMap.Label(PuName, {offset: new BMap.Size(-10, 25)});
                                _this.marker=new BMap.Marker(_this.point,{icon:_this.icon});
                                _this.marker.setLabel(_this.label)
                                _this.map.addOverlay(_this.marker);
                                
                                //点击出现框框
                                var opts ={
                                        width :250,
                                        height:200,
                                        title :"地址：",
                                }
                                var infoWindow =new BMap.InfoWindow('aaaaa',opts);// 创建信息窗口对象
                                _this.marker.addEventListener("click",function(){
                                    _this.map.openInfoWindow(infoWindow,_this.point);
                                });
                                //根据经纬度获取地址
                                var geolocation = new BMap.Geolocation();
                                var gc = new BMap.Geocoder();
                                var pointAdd = new BMap.Point(res.Data[0].Longitude, res.Data[0].Latidude);
                                gc.getLocation(pointAdd, function(rs){
                                    //console.log(rs.address)
                                    //点击给底部赋值
                                    _this.tableData=res.Data.map((item)=>{
                                        return {
                                            Name:PuName,
                                            Address:rs.address,
                                            Speed:item.Speed+'km/h',
                                            Time:moment(item.GpsTime*1000).format('YYYY-MM-DD HH:mm:ss'),
                                            IsStatus:item.State == 0 ? '在线':'不在线'
                                        }
                                    })
                                })
 
                            }
                        })
                        .catch(error=>{
                            console.log(error)
                        })                    
                }
                move();
                //调用定时器
                _this.timer=setInterval(move,20000);
            }
       },
       baidu(){
            // panTo()方法将让地图平滑移动至新中心点，如果移动距离超过了当前地图区域大小，则地图会直跳到该点
            // new BMap.DrivingRoute(map);创建驾车实例
       
                    _this.map = new BMap.Map("map");    // 创建Map实例
                    _this.point=new BMap.Point(114.471938,38.071433);
 
                    _this.map.centerAndZoom(_this.point, 15);  // 初始化地图,设置中心点坐标和地图级别
                    //添加地图类型控件
                    _this.map.addControl(new BMap.MapTypeControl({
                        mapTypes:[
                            BMAP_NORMAL_MAP,
                            BMAP_HYBRID_MAP
                        ]}));	  
                    _this.map.setCurrentCity("石家庄");          // 设置地图显示的城市 此项是必须设置的
                    _this.map.enableScrollWheelZoom(true);     //开启鼠标滚轮缩放
                    
                    //调用定时器
                    _this.setDing();
                    
            
        },
        //多选框点击时
        handleCheckChange(data, checked, indeterminate) {
                if(checked==true){
                        var PuID=_this.pu.find(itm=>{return itm.PuName==data.label}).PuID;
                        window.localStorage.setItem('PuID',PuID);
                        axios
                        .get('/api/SafetyHat/Monitor',{
                            params:{
                                PuID:localStorage.getItem('PuID') || ''
                            }
                        })
                        .then(res=>{
                            console.log(res)
                            if(res.ResultType==0){
                                    _this.setDing();
                                } 
                        })
                        .catch(error=>{
                            console.log(error)
                        })
                }else{
                    window.localStorage.removeItem('PuID')
                    clearInterval(_this.timer);
                    _this.map.removeOverlay(_this.marker);
                }
        },
    }
}
</script>
 
<style scoped>
 /* .monitor{
    width:89%;
    height:900px;
    float:right;
 } */
 .left{
    width:15%;
    height:980px;
    float:left;
    background: #e0eeee;
    padding:10px 5px;
}
#map{
    width:85%;
    height:980px;
    float:right;
 }
.el-tree{
    background: #e0eeee;
    font-size:13px;
}
.bottom{
    width:89%;
    height:100px;
    position: absolute;
    left:11%;
    bottom:0;
}
.bottom .el-table{
    background: #eee;
}
</style>