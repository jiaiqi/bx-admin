<template>
    <el-main style="border: 1px solid #eee;width:100%;" class="print-layout">
        <el-row v-if="v2Data && detailData">
            <el-col :span="24">
                <div style="width:100%;" class="padding-s" :style="`background-image: url(${bgImgUrl});background-size: contain;`">
                    <el-row>
                        <el-col :span="24">
                            <div class="grid-content bg-purple-dark" style="line-height:3rem;">
                                <span class="font-weight-bold" style="font-size: 22px;margin-right:10px;">{{detailData.student_name}}</span>
                                <el-tag style="border-radius:10px;height:22px;line-height:20px;">
                                    <svg style="margin-bottom:6px;" color="#409EFF"  width="14px" height="14px" xmlns="http://www.w3.org/2000/svg" name="zi_graduationcap" viewBox="0 0 2000 2000"><path fill="#409EFF" d="M1745 940l-769 239q-76 23-152 0l-565-174q-28 39-33 110 22 11 33.5 30.5t11.5 45q0 25.5-13 46.5t-32 32l45 346q0 11-6 18t-17 7H113q-11 0-16.5-7t-5.5-18l45-346q-20-11-32.5-32T91 1190.5q0-25.5 12.5-46.5t32.5-32q5-82 36-135L55 940q-31-8-42.5-36t0-56Q24 820 55 811l769-239q76-22 152 0l769 239q31 9 42.5 37t0 56q-11.5 28-42.5 36zm-741 326h-3q-101 28-202 0l-424-132-37 236q0 48 76 90t205 66q129 24 281 24t281-24q129-24 205-66t76-90l-37-236-421 132zm-804 327l3-156q0-5-4-9t-9-4h-13q-5 0-9 3.5t-4 9.5l-3 156q0 5 4 9t9 4h13q5 0 9-4t4-9z"/></svg>
                                    
                                    {{detailData.sch_year}}年
                                </el-tag>
                            </div>
                        </el-col>
                    </el-row>
                    <el-row type="flex" class="row-bg" justify="space-between">
                        <el-col :span="12">
                            <span class="grid-content bg-purple-dark" style="margin-right:10px;">
                                性别：<span class="font-weight-bold">{{detailData.sex}}</span>
                            </span>
                            <span class="grid-content bg-purple-dark">
                                学号：
                                <span>{{detailData.student_no}}</span>
                            </span>
                        </el-col>
                        <el-col :span="12" style="justify-content: end;display: flex;" class="print">
                            <el-button size="mini">导出</el-button>
                            <el-button size="mini" @click="add()">评语</el-button>
                            <el-button type="primary" size="mini" @click="print()">打印</el-button>
                        </el-col>
                    </el-row>
                </div>
            </el-col>
        </el-row>

        <el-card class="box-card" style="border:0;" shadow="never" v-if="v2Data && detailData">
            <div slot="header" class="clearfix" style="">
                <span style="border-left:3px solid #409EFF;padding-left:5px;">基本信息</span>
            </div>
            <div  class="text item ">
                <span class="grid-content bg-purple-dark" style="margin-right:2rem;">
                    就读学校：<span class="">{{detailData.school_name}}</span>
                </span>
                <span class="grid-content bg-purple-dark" style="margin-right:2rem;">
                    所在班级：<span class="">{{detailData.class_name}}</span>
                </span>
               
            </div>
        </el-card>
        <template v-if="childService && Array.isArray(childService) && childService.length > 0 " v-for="(child,index) in childService">
            <el-card class="box-card" style="border:0;" shadow="never" v-if="child.service_name == 'srvledu_semester_evaluate_labor_task_select'">
                 <!-- 荣誉墙效果 -->
                <div slot="header" class="clearfix" style="">
                    <span style="border-left:3px solid #409EFF;padding-left:5px;">{{child.service_view_name}}</span>
                </div>
                <div  class="text item " style="display:flex;flex-wrap: wrap;" v-if="Array.isArray(child['_load_data']) && child['_load_data'].length > 0">
                    <div :style="`text-align:center;background:#e8f3fd;border-radius: 10px;position: relative;margin-right:20px;margin-bottom:16px;box-shadow: 0 2px 4px 0 rgba(0,0,0,.1);padding:8px;`" v-for="(item,index) in child['_load_data']">
                        <el-image
                        style="width: 80px; height: 80px"
                        :src="item.index_icon"
                        :fit="'fit'"></el-image>
                        <div style="border-radius: 10px 10px 10px 0;background-color:red;color:#fff;padding:2px 4px;font-size:12px;position: absolute;top: -4px;right: -10px;">{{item.index_cnt ? 'X': ''}}{{item.index_cnt}}</div>
                        <div style="color:#000;line-height:1.5rem;font-size:0.8rem;color:#000;">{{item.index_name}}</div>
                    </div>
                </div>
            </el-card>
            <el-card class="box-card" style="border:0;" shadow="never" v-if="child.service_name == 'srvledu_semester_evaluate_task_select'">
                <!-- 劳动评价指标 -->
                <div slot="header" class="clearfix" style="">
                    <span style="border-left:3px solid #409EFF;padding-left:5px;">{{child.service_view_name}}</span>
                    <!-- <el-button style="float: right; padding: 3px 0" type="text">操作按钮</el-button> -->
                </div>
                <div  class="text item ">
                    <el-row :gutter="10" class="text item " v-if="Array.isArray(child['_load_data']) && child['_load_data'].length > 0">
                        <el-col :span="12" :style="`padding:8px;`" >
                            <el-card class="box-card-evaluate" shadow="never">
                                <div slot="header" class="clearfix font-weight-bold" style="background:#f7f7f7;">
                                    <span style="padding-right:20px">{{`${detailData.sch_year}上学期`}}</span>
                                    <span style="border-left: 1px solid #ddd;padding-left:20px">{{`综合评分`}}
                                        <span style="color:red;min-width:2rem;font-size:1.4rem;">
                                            {{child['_load_data'].filter(item => item.semester_str == `${detailData.sch_year}上学期`).reduce((total, num) => total + num.index_score, 0) / child['_load_data'].filter(item => item.semester_str == `${detailData.sch_year}上学期`).length}}
                                        </span>
                                    </span>
                                </div>
                                <div  class="text item">
                                    <div v-if="!radarTopImg" class="radarTop" style="width: 100%; height: 300px"></div>
                                    
                                    <img v-if="radarTopImg" class="radarTopImg" style="width: 100%; height: 300px" :src="radarTopImg"></img>
                                </div>
                            </el-card>
                        </el-col >
                        <el-col :span="12" :style="`padding:8px;`">
                            <el-card class="box-card-evaluate" shadow="never">
                                <div slot="header" class="clearfix font-weight-bold" style="background:#f7f7f7;">
                                    <span style="padding-right:20px">{{`${detailData.sch_year}下学期`}}</span>
                                    <span style="border-left: 1px solid #ddd;padding-left:20px">{{`综合评分`}}
                                        <span style="color:red;min-width:2rem;font-size:1.4rem;">
                                            {{child['_load_data'].filter(item => item.semester_str == `${detailData.sch_year}下学期`).reduce((total, num) => total + num.index_score, 0)/child['_load_data'].filter(item => item.semester_str == `${detailData.sch_year}下学期`).length}}
                                        </span>
                                    </span>
                                </div>
                                <div  class="text item">
                                    <div v-if="!radarBotImg" class="radarBot" style="width: 100%; height: 300px"></div>
                                    <img v-if="radarBotImg" class="radarBotImg" style="width: 100%; height: 300px" :src="radarBotImg"></img>
                                </div>
                            </el-card>
                        </el-col >
                    </el-row>
                </div>
            </el-card>
            <el-card class="box-card" style="border:0;" shadow="never" v-if="child.service_name == 'srvledu_semester_evaluate_course_select'">
                <!-- 课程评价 -->
                <div slot="header" class="clearfix" style="">
                    <span style="border-left:3px solid #409EFF;padding-left:5px;">{{child.service_view_name}}</span>
                </div>
                <el-row :gutter="20" class="text item " v-if="Array.isArray(child['_load_data']) && child['_load_data'].length > 0">
                    <el-col :span="4" :style="`padding:8px;display: flex;align-items: center;text-align:center;background:#f7f7f7;border-radius: 10px;position: relative;margin-right:2%;margin-bottom:16px;box-shadow: 0 2px 4px 0 rgba(0,0,0,.1);`" v-for="(item,index) in child['_load_data']">
                        <el-image
                        style="width: 48px; height: 48px"
                        :src="item.index_icon"
                        :fit="'fit'"></el-image>
                        <div style="padding:8px;text-align:left">
                            <div style="color:#000;line-height:1.5rem;font-size:0.8rem;    white-space: nowrap;">{{item.index_name}}</div>
                            <div style="color:#000;line-height:1.5rem;    white-space: nowrap;"><span style="font-size:1.4rem;min-width:3rem;" class="font-weight-bold">{{item.index_cnt}}</span>次</div>
                        </div>
                    </el-col >
                </el-row>
            </el-card>
            <el-card class="box-card" style="border:0;" shadow="never" v-if="child.service_name == 'srvledu_semester_comment_select'">
                <!-- 老师评语 -->
                <div slot="header" class="clearfix" style="">
                    <span style="border-left:3px solid #409EFF;padding-left:5px;">{{child.service_view_name}}</span>
                </div>
                <el-row :gutter="20" class="text item " :style="`padding:8px;background:#f7f7f7;border-radius: 10px;`" v-if="Array.isArray(child['_load_data']) && child['_load_data'].length > 0">
                    <el-col :span="24" :style="`padding:8px;`" v-for="(item,index) in child['_load_data']">
                        <div style="padding:8px;text-align:left">
                            <div style="color:#000;line-height:1.5rem;font-size:0.8rem;white-space: nowrap;"class="font-weight-bold">{{item.create_time}}</div>
                            <div style="color:#000;line-height:1.5rem; font-size:0.9rem;"class="font-weight-bold">{{item.evaluate_comment}}
                                <!-- <span style="font-size:1.4rem;min-width:3rem;" class="font-weight-bold"></span>次 -->
                            </div>
                        </div>
                    </el-col >
                </el-row>
            </el-card>
            
        </template>
        <el-dialog class="customDialogClass" title="添加" width="90%" :close-on-click-modal="1 == 2" append-to-body
        :visible="activeForm == 'add'" @close="activeForm = 'xx'">
        <add name="list-add" :mainService="serviceName" ref="add-form" v-if="activeForm == 'add'" :service="getAddService"
            :submit2-db="true" :defaultValues="detailData"  :parentPageType="'list'"
            :parentMainFormDatas="detailData" @action-complete="onAddFormActionComplete($event)"
             @submitted2mem="onAdd2MemSubmitted">
        </add>
        <!-- :defaultValues="listMainFormDatas" -->
        </el-dialog>
    </el-main>
        


  </template>
  
  <script>
  
  
//   import draggable from 'vuedraggable'
//   import uiDrag from './components/uiDrag.vue'
//   import pageInit from './utils/page-mixin.js'
//   import comlistInit from './utils/comlist-init-mixin.js'
//   import { $axios } from "../common/http.js";
  import bgimg from './titlebg.jpg';
  import * as echarts from "echarts";
import { onMounted, ref, watch } from "vue";

var chartTop=null;
var chartBot=null;


  export default {
    components: {
        Add: () => import("../../components/common/add.vue")
    },
  
    // mixins: [pageInit,comlistInit],
  
    props: {},
  
    data() {
      return {
        getAddService:'srvledu_semester_comment_add',
        radarTopImg:'',
        radarBotImg:'',
        activeForm:null,
        bgImgUrl:bgimg,
        srvApp:null,
        id:null,
        serviceName:'',
        v2Data:null,
        initLoadModel:null,
        v2Cols:null,
        v2ChildService:null,
        detailData:null,
        childService:null,
        chartTags:['上学期','下学期'],
        childSrvLoaded:false,
        option:{
            // title: {
            //   text: "ECharts 入门示例",
            // },
            tooltip: {},
            legend: {
            data: ["销量"],
            },
            xAxis: {
            data: ["衬衫", "羊毛衫", "雪纺衫", "裤子", "高跟鞋", "袜子"],
            },
            yAxis: {},
            series: [
                {
                    name: "销量",
                    type: "bar",
                    data: [5, 20, 36, 10, 10, 20],
                }
            ]
        }
      };
    },
  computed:{
     
  },
  created: function () {
  },

  mounted: function () {
        if(this.$route.query && this.$route.query.srvApp){
            this.srvApp = this.$route.query.srvApp
            
        }
        this.radarBotImg = ''
                        this.radarTopImg = ''
        this.$nextTick(() => {
            this.initData()
        })
        
     
  },
  
    
  
    methods: {
        async initData() {
            var condition = [];
            var me = this;
            let childList = null
            if (this.$route.params ) {
                // 判断路由参数
                // condition = this.custCondition;
                if (this.$route.params && this.$route.params.serviceName != "") {
                    // 服务是否存在
                    this.serviceName = this.$route.params.serviceName;
                }
                if (this.$route.params && this.$route.params.id != "") {
                    // id是否存在
                    this.id = this.$route.params.id
                    condition = [{ colName: "id", value: this.id, ruleType: "eq" }];
                }
                if(this.serviceName && this.id){
                    // 服务和id都存在 查询数据
                    await this.selectOne(
                        this.serviceName,
                        condition,
                        null,
                        null,
                        null,
                        'detail_page',
                        this.srvApp
                    ).then(response => {
                        
                        // console.log('srvAuthKey',srvAuthKey,response.body)
                        if(response.body.resultCode == '0111'){
                        
                            console.error('this.service_name',response.body)
                            console.log('response.body',response.body)
                            this.srvAuthLogin = true
                            this.$message({
                                message: response.data.resultMessage,
                                type: "error",
                            });
                        }else{
                            // console.error('this.service_name2',response.body,response.response)
                            let detailData = response.body;
                            this.$set(this,'detailData',response.body)
                            // this.detailData = response.body;
                            // 保存详情数据
                            
                        }
                    });
                    if(!this.v2Data){
                        await this.loadColsV2(this.serviceName, "detail",this.srvApp,this.serviceName).then(response => {
                            // 查询v2
                            this.v2Data = response.body.data;
                            this.v2Cols = response.body.data["srv_cols"];
                            childList = response.body.data["child_service"];
                            
                            if(Array.isArray(childList) && childList.length > 0){
                                this.childService = []
                                for (let item of childList) {
                                    // 子表元数据封装
                                    item.show = true;
                                    let foreign_key = item.foreign_key;
                                    if (item.srv_cols) {
                                    // intra-app fk
                                        let referenced_column_name = foreign_key.referenced_column_name;
                                        item.defaultCondition = [
                                            {
                                            colName: foreign_key.column_name,
                                            ruleType: "eq",
                                            value: this.detailData[referenced_column_name]
                                            }
                                        ];
                                    } else {
                                        // inter-app fk
                                        let referenced_column_name = foreign_key.refed_service_column;
                                        item.defaultCondition = [
                                            {
                                            colName: foreign_key.ref_service_column,
                                            ruleType: "eq",
                                            value: this.detailData[referenced_column_name]
                                            }
                                        ];
                                    }

                                    this.childService.push(item);
                                
                                }
                                this.childSrvLoaded = true
                                for(let item of this.childService){
                                    this.getListData(item)
                                }
                            }
                            
                            
                        });
                    }else{
                        for(let item of this.childService){
                                    this.getListData(item)
                                }
                    }
                    

                }

            }

            
        },
        async getListData(child){
            // 子表数据查询
            let srv = child.service_name
            let app = child.srv_app
            let condition = [{
                colName:'sch_year',
                ruleType:"eq",
                value:this.detailData.sch_year
            },{
                colName:'student_no',
                ruleType:"eq",
                value:this.detailData.student_no
            }]
            
            await this.select(
                srv,
                condition,
                {
                "pageNo": 1,
                "rownumber": 999
                }, [],
                null,
                null,
                app
            ).then(response => {
                
                // console.log('srvAuthKey',srvAuthKey,response.body)
                if(response.body.resultCode == '0111'){
                
                    
                }else{
                    let data = response.body.data;
                    if(response.body.state == 'SUCCESS' && Array.isArray(data) && data.length > 0){
                        this.$set(child,'_load_data',data)
                        if(srv == 'srvledu_semester_evaluate_task_select'){
                            // 如果是劳动评价，处理雷达图
                            
                            this.$nextTick(() => {
                
                                this.buildChart(data)
                               
                            })
                        }
                    }
                    
                    
                }
            });
        },
        
        buildChart(data){
            // 基于准备好的dom，初始化echarts实例
            let loadAllData = data
            let tags = this.chartTags
            chartTop = echarts.init(document.querySelector(".radarTop"));
                                chartBot = echarts.init(document.querySelector(".radarBot"));
            console.log(chartTop,chartBot,loadAllData)
            // myChart = echarts.init(document.getElementById(props.index));
            // setChartOption(props.chartOption, myChart);
            // setTimeout(() => {
            // myChart.resize();
                
            // }, 500);
            let topMaxData = loadAllData.filter(item => item.semester_str == `${this.detailData.sch_year}上学期`)
            let topData = loadAllData.filter(item => item.semester_str == `${this.detailData.sch_year}上学期`)
            let botMaxData = loadAllData.filter(item => item.semester_str == `${this.detailData.sch_year}下学期`)
            let botData = loadAllData.filter(item => item.semester_str == `${this.detailData.sch_year}下学期`)
            topMaxData = topData.map(item => {
                let obj = {
                    name:item.index_name,
                    max:5,
                }
                return obj
            })
            topData=topData.map(item => item.index_score ? item.index_score : 0 )
            botMaxData = botData.map(item => {
                let obj = {
                    name:item.index_name,
                    max:5,
                }
                return obj
            })
            botData=botData.map(item => item.index_score ? item.index_score : 0 )
            console.log(topData,botData)

            var option = {
                // backgroundColor: "#161627",
                tooltip: {
                    show: true,
                    // 控制提示框组件的显示位置
                    position: ["60%", "10%"]
                },
                radar: {
                    indicator: [
                        { name: "机场", max: 100 },
                        { name: "商场", max: 100 },
                        { name: "火车站", max: 100 },
                        { name: "汽车站", max: 100 },
                        { name: "地铁", max: 100 }
                    ],
                    // 修改雷达图的大小
                    radius: "65%",
                    // shape: "circle",
                    // 分割的圆圈个数
                    splitNumber: 5,
                    name: {
                        // 修饰雷达图文字的颜色
                        textStyle: {
                            color: "#333"
                        }
                    },
                    // 分割的圆圈线条的样式
                    splitLine: {
                        lineStyle: {
                            color: "#ddd"
                        }
                    },
                    splitArea: {
                        show: false
                    },
                    // 坐标轴的线修改为白色半透明
                    axisLine: {
                        lineStyle: {
                            color: "#abd3ff"
                        }
                    }
                },
                series: [
                    {
                        name: "",
                        type: "radar",
                        // 填充区域的线条颜色
                        lineStyle: {
                            normal: {
                                color: "#3595ff",
                                width: 1,
                                opacity: 0.5
                            }
                        },
                        data: [[90, 19, 56, 11, 34]],
                        // 设置图形标记 （拐点）
                        // symbol: "circle",
                        // 这个是设置小圆点大小
                        symbolSize: 5,
                        // 设置小圆点颜色
                        itemStyle: {
                            color: "#0b62c3"
                        },
                        // 让小圆点显示数据
                        label: {
                            show: true,
                            fontSize: 10
                        },
                        // 修饰我们区域填充的背景颜色
                        areaStyle: {
                            color: "#68affdd9"
                        }
                    }
                ]
            };
            // 3.把配置和数据给对象
            let topOption = this.bxDeepClone(option)
            topOption.radar.indicator = topMaxData
            topOption.series[0].data = [topData]
            let  botOption = this.bxDeepClone(option)
            botOption.radar.indicator = botMaxData
            botOption.series[0].data = [botData]
            
            chartTop.setOption(topOption);
            chartBot.setOption(botOption);
            // 当我们浏览器缩放的时候，图表也等比例缩放
            window.addEventListener("resize", function () {
                // 让我们的图表调用 resize这个方法
                chartTop.resize();
                chartBot.resize();
            });
        },
        exportImg(myChart,id) {
            const src = (myChart).getDataURL({
                type:'png',
                pixelRatio: 2,
                backgroundColor: '#fff',
            });
            const a = document.createElement('a');
            console.log(src)
            
            // a.href = src;
            // a.download = 'chart-img';
            // a.click();
            return src
            
        },
        print(){

            this.$set(this,'radarBotImg',this.exportImg(chartBot,'radarBotImg'))
            this.$set(this,'radarTopImg',this.exportImg(chartTop,'radarTopImg'))
            // this.exportImg(chartBot,'radarTopImg')
            this.$nextTick(() => {
                setTimeout(" window.print()",200);
                // window.print()
               
            })
            
            setTimeout("window.location.reload()",1000);
        },
        add(){
            // this.getAddService = this.v2Data 
            this.activeForm = 'add'
        },
        onAdd2MemSubmitted(){
            console.log('onAdd2MemSubmitted')
        },
        onAddFormActionComplete(e){
            this.activeForm = null 

            
            console.log('onAddFormActionComplete',e)
            this.$nextTick(() => {
                
                this.initData()
               
            })
        },
    },
    watch:{
       
    }
  };
  </script>
  
  
  <style lang="css">
@media print {
    .print{

        display:none !important;
    }
    .print-layout{
        -webkit-print-color-adjust: exact;
print-color-adjust: exact;
        width:100vw !important;
    }
}
  </style>
  <style lang="scss">
  .padding-s{
    padding:18px !important;
  }
  .box-card-evaluate{
    >.el-card__header{
        padding:10px 10px;
        background:#f7f7f7 !important;
    }
  }
  

  </style>
  