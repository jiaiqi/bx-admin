<template>
    <el-main style="border: 1px solid #eee;width:100%;">
        
        <div  style="margin:0 auto;margin-top:2rem;min-width:1080px;"  id="print-layout">
            <el-row  class="" style="position: absolute;right: 10%;z-index:999;">
                <el-col :span="24">
                    <div style="width:100%;" class="padding-s" :style="``">
                        <!-- background-image: url(${bgImgUrl});background-size: contain; -->
                        <el-row type="flex" class="row-bg" justify="space-between">
                            
                            <el-col :span="24" style="justify-content: end;display: flex;"  v-if="showAction">
                                <!-- <el-button size="mini">导出</el-button> -->
                                <el-button size="mini" @click="add()">评语</el-button>
                                <el-button type="primary" size="mini" @click="print()">打印</el-button>
                            </el-col>
                        </el-row>
                    
                    </div>
                </el-col>
            </el-row>
            <el-row v-if="v2Data && detailData" class="box-card parint-details" style="padding:0 10px;">
                <el-col :span="24">
                    <div style="width:100%;" class="padding-s" :style="`font-family:'宋体';`">
                        
                        <el-row type="flex" class="row-bg" justify="center">
                            <el-col :span="24">
                                <div class="grid-content bg-purple-dark center" style="line-height:6rem;font-size: 2.5rem;text-align:center;">
                                    {{`学生劳动素质档案` || `学生劳动素质档案`}}
                                </div>
                                <div class="grid-content bg-purple-dark center" style="line-height:1.5rem;font-size: 1rem;text-align:center;">
                                    {{`${detailData.sch_year}学年` || `2023-2024学年`}}
                                </div>
                                <div class="grid-content bg-purple-dark center" style="line-height:2rem;font-size: 1rem;text-align:center;">
                                    {{semester || `上学期`}}
                                </div>
                            </el-col>
                        </el-row>
                        
                    </div>
                </el-col>
            </el-row>

            <el-card class="box-card parint-details" style="border:0;" shadow="never" v-if="v2Data && detailData">
                <div slot="header" class="clearfix" style="">
                    <span  style="border-left:3px solid #409EFF;padding-left:5px;font-weight:bold;">基本信息</span>
                </div>
                <div  class="text item ">
                    <el-row >
                        <el-col :span="8">
                            <span class="grid-content bg-purple-dark student-info" style="margin-right:10px;">
                                学生姓名：<span class="font-weight-bold">{{detailData.student_name}}</span>
                            </span>
                        </el-col>
                        <el-col :span="8">
                            <span class="grid-content bg-purple-dark student-info" style="margin-right:10px; ">
                                性别：<span class="font-weight-bold">{{detailData.sex}}</span>
                            </span>
                        </el-col><el-col :span="8">
                            <span class="grid-content bg-purple-dark student-info" style="margin-right:10px; ">
                                学号：<span class="font-weight-bold">{{detailData.student_no}}</span>
                            </span>
                        </el-col><el-col :span="8">
                            <span class="grid-content bg-purple-dark student-info" style="margin-right:10px; ">
                                就读学校：<span class="font-weight-bold">{{detailData.school_name}}</span>
                            </span>
                        </el-col><el-col :span="8">
                            <span class="grid-content bg-purple-dark student-info" style="margin-right:10px; ">
                                年级：<span class="font-weight-bold">{{detailData.grade_str}}</span>
                            </span>
                        </el-col><el-col :span="8">
                            <span class="grid-content bg-purple-dark student-info" style="margin-right:10px; ">
                                班级：<span class="font-weight-bold">{{detailData.class_seq_str}}</span>
                            </span>
                        </el-col><el-col :span="8">
                            <span class="grid-content bg-purple-dark student-info" style="margin-right:10px; ">
                                报告生产日期：<span class="font-weight-bold">{{nowDateStr}}</span>
                            </span>
                        </el-col>
                    </el-row>
                
                </div>
            </el-card>
                <el-card class="box-card parint-details" style="border:0;" shadow="never">
                    <!-- 荣誉墙效果 -->
                    <div slot="header" class="clearfix" style="">
                        <span style="border-left:3px solid #409EFF;padding-left:5px;">{{`荣誉墙`}}</span>
                        <!-- <span style="border-left: 0px solid #ddd;padding-left:20px">{{`综合分值`}}
                            <span style="color:#ff5500;min-width:2rem;font-size:1.4rem;">
                                {{childServiceLoadDatas['srvledu_semester_evaluate_labor_task_select'].filter(item => item.semester == `${semester}`).reduce((total, num) => total + num.mun, 0) / childServiceLoadDatas['srvledu_semester_evaluate_labor_task_select'].filter(item => item.semester == `${semester}`).length}}
                            </span>
                        </span> -->
                    </div>
                    <el-row :gutter="20" class="text item " style="border: 1px solid #eee;border-radius:10px;padding:10px;" v-if="Array.isArray(childServiceLoadDatas['srvledu_semester_evaluate_labor_task_select']) && childServiceLoadDatas['srvledu_semester_evaluate_labor_task_select'].length > 0">
                        <el-col :span="6" :style="`padding:4px;display: flex;align-items: center;text-align:center;position: relative;border-left:${index%4 !== 0 ? '1px solid #eee' : '0'};`" v-for="(item,index) in childServiceLoadDatas['srvledu_semester_evaluate_labor_task_select']" class="font-weight-bold">
                            <!-- <el-image
                            style="width: 48px; height: 48px"
                            :src="item.index_icon"
                            :fit="'fit'"></el-image> -->
                            
                            <div style="color:#000;line-height:1.5rem;min-width:8rem;font-size:1rem;white-space: nowrap;text-align:left;padding-left:2rem;">{{item.index_name}}</div>
                            <div style="padding:8px;text-align:left">
                                <div style="color:#007bff;line-height:1.5rem;    white-space: nowrap;"><span style="font-size:1rem;min-width:3rem;" >{{item.index_cnt}}</span></div>
                            </div>
                        </el-col >
                    </el-row>
                    <!-- <div  class="text item " style="display:flex;flex-wrap: wrap;" v-if="Array.isArray(child['_load_data']) && child['_load_data'].length > 0">
                        <div :style="`text-align:center;background:#e8f3fd;border-radius: 10px;position: relative;margin-right:20px;margin-bottom:16px;box-shadow: 0 2px 4px 0 rgba(0,0,0,.1);padding:8px;`" v-for="(item,index) in child['_load_data']">
                        
                            <div style="color:#000;line-height:1.5rem;font-size:0.8rem;color:#000;">{{item.index_name}}</div>
                            <div style="">{{item.index_cnt ? 'X': ''}}{{item.index_cnt}}</div>
                            
                        </div>
                    </div> -->
                </el-card>
                
                <el-card class="box-card parint-details" style="border:0;" shadow="never">
                    <!-- 课程评价统计 -->
                    <div slot="header" class="clearfix" style="">
                        <span style="border-left:3px solid #409EFF;padding-left:5px;">{{`课程评价统计`}}</span>
                    </div>
                    <!-- <el-row :gutter="20" class="text item " v-if="Array.isArray(child['_load_data']) && child['_load_data'].length > 0">
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
                    </el-row> -->
                    <el-row :gutter="20" class="text item " style="border: 1px solid #eee;border-radius:10px;padding:10px;" v-if="Array.isArray(childServiceLoadDatas['srvledu_semester_evaluate_course_select']) && childServiceLoadDatas['srvledu_semester_evaluate_course_select'].length > 0">
                        <el-col :span="6" :style="`padding:4px;display: flex;align-items: center;text-align:center;position: relative;border-left:${index%4 !== 0 ? '1px solid #eee' : '0'};`" v-for="(item,index) in childServiceLoadDatas['srvledu_semester_evaluate_course_select']" class="font-weight-bold">
                            <div style="color:#000;line-height:1.5rem;min-width:8rem;font-size:1rem;white-space: nowrap;text-align:left;padding-left:2rem;">{{item.index_name}}</div>
                            <div style="padding:8px;text-align:left">
                                <div style="color:#007bff;line-height:1.5rem;    white-space: nowrap;"><span style="font-size:1rem;min-width:3rem;" >{{item.index_cnt}}</span></div>
                            </div>
                        </el-col >
                    </el-row>
                </el-card>
                <el-card class="box-card parint-details" style="border:0;" shadow="never">
                    <!-- 荣誉墙效果 -->
                    <div slot="header" class="clearfix" style="">
                        <span style="border-left:3px solid #409EFF;padding-left:5px;">{{`荣誉卡`}}</span>
                        <!-- <span style="border-left: 0px solid #ddd;padding-left:20px">{{`综合分值`}}
                            <span style="color:#ff5500;min-width:2rem;font-size:1.4rem;">
                                {{childServiceLoadDatas['srvledu_semester_evaluate_labor_task_select'].filter(item => item.semester == `${semester}`).reduce((total, num) => total + num.mun, 0) / childServiceLoadDatas['srvledu_semester_evaluate_labor_task_select'].filter(item => item.semester == `${semester}`).length}}
                            </span>
                        </span> -->
                    </div>
                    <el-row :gutter="20" class="text item " style="border: 1px solid #eee;border-radius:10px;padding:10px;" v-if="Array.isArray(childServiceLoadDatas['srvledu_semester_evaluate_labor_task_tea_select']) && childServiceLoadDatas['srvledu_semester_evaluate_labor_task_tea_select'].length > 0">
                        <el-col :span="6" :style="`padding:4px;display: flex;align-items: center;text-align:center;position: relative;border-left:${index%4 !== 0 ? '1px solid #eee' : '0'};`" v-for="(item,index) in childServiceLoadDatas['srvledu_semester_evaluate_labor_task_tea_select']" class="font-weight-bold">
                            <!-- <el-image
                            style="width: 48px; height: 48px"
                            :src="item.index_icon"
                            :fit="'fit'"></el-image> -->
                            
                            <div style="color:#000;line-height:1.5rem;min-width:8rem;font-size:1rem;white-space: nowrap;text-align:left;padding-left:2rem;">{{item.index_name}}</div>
                            <div style="padding:8px;text-align:left">
                                <div style="color:#007bff;line-height:1.5rem;    white-space: nowrap;"><span style="font-size:1rem;min-width:3rem;" >{{item.index_cnt}}</span></div>
                            </div>
                        </el-col >
                    </el-row>
                    <!-- <div  class="text item " style="display:flex;flex-wrap: wrap;" v-if="Array.isArray(child['_load_data']) && child['_load_data'].length > 0">
                        <div :style="`text-align:center;background:#e8f3fd;border-radius: 10px;position: relative;margin-right:20px;margin-bottom:16px;box-shadow: 0 2px 4px 0 rgba(0,0,0,.1);padding:8px;`" v-for="(item,index) in child['_load_data']">
                        
                            <div style="color:#000;line-height:1.5rem;font-size:0.8rem;color:#000;">{{item.index_name}}</div>
                            <div style="">{{item.index_cnt ? 'X': ''}}{{item.index_cnt}}</div>
                            
                        </div>
                    </div> -->
                </el-card>
                <el-card class="box-card parint-details" style="border:0;" shadow="never">
                    <!-- 劳动任务完成统计 -->
                    <div slot="header" class="clearfix" style="">
                        <span style="border-left:3px solid #409EFF;padding-left:5px;">{{`完成劳动任务统计`}}</span>
                        <!-- <el-button style="float: right; padding: 3px 0" type="text">操作按钮</el-button> -->
                    </div>
                    <div  class="text item ">
                        <el-row :gutter="10" class="text item " v-if="childServiceLoadDatas" style="margin:0; border:1px solid #eee;border-radius:10px;display: flex;align-items: center;">
                            <el-col :span="12" :style="`border:0px solid #eee;`" >
                                <el-card class="box-card-evaluate" shadow="never" :style="`border:0px solid #eee;`" >
                                    <!-- 饼图 -->
                                    <div  class="text item">
                                        <div v-if="!radarPieImg" class="radarPie" style="width: 100%; height: 220px"></div>
                                        
                                        <img v-if="radarPieImg" class="radarPieImg" style="width: 100%; height:auto;" :src="radarPieImg"></img>
                                    </div>
                                </el-card>
                            </el-col >
                            <el-col :span="12" :style="`padding:8px;height:100%;`" >
                                <el-card class="" shadow="never" :style="`border:0px solid #eee;`">
                                    <el-row :gutter="20" class="text item " style="padding:10px;" v-if="Array.isArray(childServiceLoadDatas['srvledu_semester_evaluate_task_state_select']) && childServiceLoadDatas['srvledu_semester_evaluate_task_state_select'].length > 0">
                                        <el-col :span="24" :style="`padding:8px;display: flex;align-items: center;text-align:center;position: relative;border-left:1px solid #eee;justify-content: center;`" v-for="(item,index) in childServiceLoadDatas['srvledu_semester_evaluate_task_state_select']" class="font-weight-bold">
                                            <div style="color:#000;line-height:1.5rem;width:8rem;font-size:1rem;white-space: nowrap;text-align:left;padding-left:2rem;">{{`${item.task_state}总数量`}}</div>
                                            <div style="padding:8px;text-align:left;width:8rem;">
                                                <div :style="`color:${item.task_state == '未完成' ? 'red' :  '#007bff'};line-height:1.5rem;white-space: nowrap;text-align:right;`">
                                                    <span style="font-size:1rem;min-width:3rem;" >{{item.task_cnt}}</span>
                                                </div>
                                            </div>
                                        </el-col >
                                    </el-row>
                                </el-card>
                            </el-col >
                        </el-row>
                    </div>
                </el-card>
                <el-card class="box-card parint-details" style="border:0;" shadow="never" v-if="Array.isArray(childServiceLoadDatas['srvledu_semester_evaluate_task_select'])">
                    <!-- 劳动评价指标 -->
                    <div slot="header" class="clearfix" style="">
                        <span style="border-left:3px solid #409EFF;padding-left:5px;">{{`劳动评价指标统计`}}</span>
                        <!-- <el-button style="float: right; padding: 3px 0" type="text">操作按钮</el-button> -->
                    </div>
                    <div  class="text item ">
                        <el-row :gutter="10" class="text item " v-if="Array.isArray(childServiceLoadDatas['srvledu_semester_evaluate_task_select']) && childServiceLoadDatas['srvledu_semester_evaluate_task_select'].length > 0">
                            <el-col :span="24" :style="``" >
                                <el-card class="box-card-evaluate" shadow="never">
                                    <div slot="header" class="clearfix font-weight-bold" style="background:#f7f7f7;">
                                        <!-- <span style="padding-right:20px">{{`${detailData.sch_year}上学期`}}</span> -->
                                        <span style="border-left: 0px solid #ddd;padding-left:20px">{{`综合评分`}}
                                            <span style="color:#ff5500;min-width:2rem;font-size:1.4rem;">
                                                {{childServiceLoadDatas['srvledu_semester_evaluate_task_select'].filter(item => item.semester == `${semester}`).reduce((total, num) => total + num.index_score, 0) / childServiceLoadDatas['srvledu_semester_evaluate_task_select'].filter(item => item.semester == `${semester}`).length}}
                                            </span>
                                        </span>
                                    </div>
                                    <div  class="text item">
                                        <div v-if="!radarTopImg" class="radarTop" style="width: 100%; height: 300px"></div>
                                        
                                        <img v-if="radarTopImg" class="radarTopImg" style="width: 100%; height: auto;" :src="radarTopImg"></img>
                                    </div>
                                </el-card>
                            </el-col >
                            <!-- <el-col :span="12" :style="`padding:8px;`">
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
                            </el-col > -->
                        </el-row>
                    </div>
                </el-card>
                <el-card class="box-card parint-details" style="border:0;" shadow="never" >
                    <!-- 老师评语 -->
                    <div slot="header" class="clearfix" style="">
                        <span style="border-left:3px solid #409EFF;padding-left:5px;">{{`老师评语`}}</span>
                    </div>
                    <el-row :gutter="20" class="text item " :style="`padding:8px;border-radius: 10px;min-height:150px`" >
                        <el-col :span="24" :style="`padding:8px;`" v-if="Array.isArray(childServiceLoadDatas['srvledu_semester_comment_semester_select']) && childServiceLoadDatas['srvledu_semester_comment_semester_select'].length > 0" v-for="(item,index) in childServiceLoadDatas['srvledu_semester_comment_semester_select']">
                            <div style="text-align:left">
                                <div style="color:#000;line-height:1.5rem;font-size:0.8rem;white-space: nowrap;"class="font-weight-bold">{{item.create_time}}<span style="padding-left:20px;">({{item.create_user_disp}})</span></div>
                                <div style="color:#000;line-height:1.5rem; font-size:0.9rem;"class="font-weight-bold">{{item.evaluate_comment}}
                                    <!-- <span style="font-size:1.4rem;min-width:3rem;" class="font-weight-bold"></span>次 -->
                                </div>
                            </div>
                        </el-col >
                    </el-row>
                </el-card>
                <el-card class="box-card parint-details" style="border:0;" shadow="never" >
                    <!-- 总结评分 -->
                    <div slot="header" class="clearfix" style="">
                        <span style="border-left:3px solid #409EFF;padding-left:5px;">{{`总结评分`}}</span>
                    </div>
                    <el-row :gutter="20" class="text item " :style="`padding:8px;border-radius: 10px;min-height:60px`" >
                        <el-col :span="24" :style="`padding:8px;`" >
                            <div style="padding:8px;text-align:left;display:flex;align-items:center;">
                                <div style="color:#ff5500;font-size:3rem;">
                                    {{allValuestr}}
                                </div>
                                <div style="padding-left:10px;">
                                    <!-- <div>
                                        评分
                                    </div> -->
                                    <div >
                                        <el-rate
                                        style="height:40px;font-size:30px;"
                                        :max="5"
                                        v-model="allValuestr"
                                        disabled
                                        text-color="#ff9900">
                                        </el-rate>
                                    </div>
                                </div>
                                
                                <!-- <div style="color:#000;line-height:1.5rem;font-size:0.8rem;white-space: nowrap;"class="font-weight-bold">{{item.create_time}}</div>
                                <div style="color:#000;line-height:1.5rem; font-size:0.9rem;"class="font-weight-bold">{{item.evaluate_comment}}
                                    <span style="font-size:1.4rem;min-width:3rem;" class="font-weight-bold"></span>次
                                </div> -->
                            </div>
                        </el-col >
                    </el-row>
                </el-card>
                <el-card class="box-card parint-details" style="border:0;" shadow="never" v-if="true">
                    <!-- 报告总结 -->
                    <div slot="header" class="clearfix" style="">
                        <span style="border-left:3px solid #409EFF;padding-left:5px;">{{`报告总结`}}</span>
                    </div>
                    <el-row :gutter="20" class="text item " :style="`padding:8px;border-radius: 10px;`" >
                        <el-col :span="24" :style="`padding:8px;`" >
                            <div style="padding:8px;text-align:left;min-height:150px;">
                                
                            </div>
                        </el-col >
                    </el-row>
                </el-card>
                <el-card class="box-card parint-details" style="border:0;" shadow="never" v-if="true">
                    <!-- 成长建议 -->
                    <div slot="header" class="clearfix" style="">
                        <span style="border-left:3px solid #409EFF;padding-left:5px;">{{`成长建议`}}</span>
                    </div>
                    <el-row :gutter="20" class="text item " :style="`padding:8px;border-radius: 10px;`" >
                        <el-col :span="24" :style="`padding:8px;`" >
                            <div style="padding:8px;text-align:left;min-height:150px;">
                                
                            </div>
                        </el-col >
                    </el-row>
                </el-card>
        </div>
       
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
   
import htmlPdf from './pdf.js';
var chartTop=null;
var chartBot=null;
var chartPie=null;


  export default {
    components: {
        Add: () => import("../../components/common/add.vue")
    },
  
    // mixins: [pageInit,comlistInit],
  
    props: {},
  
    data() {
      return {
        showAction:true,
        title:'学生成长档案',
        allValuestr:0,
        semester:'',
        getAddService:'srvledu_semester_comment_add',
        radarTopImg:'',
        radarBotImg:'',
        radarPieImg:'',
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
        taskTypeSum:null,
        taskTypeState:null,
        childServiceNames:['srvledu_semester_evaluate_task_type_select','srvledu_semester_evaluate_task_state_select','srvledu_semester_evaluate_task_select','srvledu_semester_comment_semester_select','srvledu_semester_evaluate_course_select','srvledu_semester_evaluate_labor_task_select','srvledu_semester_evaluate_labor_task_tea_select'],
        childServiceLoadDatas:{},
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
        },
        allCourse:0,
      };
    },
  computed:{
     nowDateStr(){
        let str = new Date().toLocaleDateString()
        return str
     },
     allValue(){
        // 动态根据 分类统计数据 计算 完成率
        let value = 0
        if(this.childServiceLoadDatas && this.childServiceLoadDatas['srvledu_semester_evaluate_task_select']){
            value = this.childServiceLoadDatas['srvledu_semester_evaluate_task_select'].filter(item => item.semester && item.semester == `${this.semester}`).reduce((total, num) => total + num.index_score, 0) / this.childServiceLoadDatas['srvledu_semester_evaluate_task_select'].filter(item => item.semester == `${this.semester}`).length;
        }
        // this.$set(this,'allValuestr',value)  // 赋值
        return value
    }
  },
  created: function () {
  },

  mounted: function () {
        if(this.$route.query){
            this.srvApp = this.$route.query.srvApp || ''
            this.semester = this.$route.query.semester || ''
            
        }
        
        this.$set(this,'radarTopImg','')
        this.$set(this,'radarBotImg','')
        this.$set(this,'radarPieImg','')
        this.$nextTick(() => {
            this.initData()
        })
        
     
  },
  
    
  
    methods: {
        async initData() {
            this.showAction = true
            let divs = document.querySelector('.divRemove')
            if(divs){
                divs.remove()
            }
                               
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
                        // 主表查询结果
                        
                        if(response.body.resultCode == '0111'){
                        
                            console.error('this.service_name',response.body)
                            console.log('response.body',response.body)
                            this.$message({
                                message: response.data.resultMessage,
                                type: "error",
                            });
                        }else{
                            // console.error('this.service_name2',response.body,response.response)
                            let detailData = response.body;
                            this.$set(this,'detailData',response.body)
                            let title = `${detailData.student_no}-${detailData.student_name}-${new Date().toLocaleDateString()}`; // 设置页面标题
                            this.title = title
                            document.title = title
                            // this.detailData = response.body;
                            this.getAllCourse() // 总分
                            // 保存详情数据
                            if(Array.isArray(this.childServiceNames) && this.childServiceNames.length > 0){
                                // 静态需要查询的 服务数据队列
                                for(let cSrv of this.childServiceNames){
                                    this.getTaskCountListData(cSrv)
                                    
                                }
                            }
                            
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
                                    // this.getListData(item)  // 去掉根据 v2 子表服务查询
                                }
                            }
                            
                            
                        });
                    }else{
                        for(let item of this.childService){
                                    // this.getListData(item)// 去掉根据 v2 子表服务查询
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
            },{
                colName:'semester',
                ruleType:"eq",
                value:this.semester
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
                        this.$set(this.childServiceLoadDatas,srv,data)
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
        async getAllCourse(){
            // srvledu_semester_evaluate_select
            let self = this
            let srv =  'srvledu_semester_evaluate_select'
            let app = 'ledu'
            let condition = [{
                colName:'sch_year',
                ruleType:"eq",
                value:this.detailData.sch_year
            },{
                colName:'student_no',
                ruleType:"eq",
                value:this.detailData.student_no
            },{
                colName:'semester',
                ruleType:"eq",
                value:this.semester
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
                        // self.$set(self.childServiceLoadDatas,srv,data); // 保存各模块内容查询数据
                        
                        let allValue = data[0]['all_course']
                        console.log('评价总分',Number(allValue) ,data)
                        this.$set(this,'allValuestr',allValue)
                    }
                    
                    
                }
            });
        }, 
        async getTaskCountListData(s){
            // 单独查询 4、完成劳动任务统计  // 查询所有子模块数据 通用，除了基本信息
            let self = this
            let srv = s || 'srvledu_semester_evaluate_task_type_select'
            let app = 'ledu'
            let condition = [{
                colName:'sch_year',
                ruleType:"eq",
                value:this.detailData.sch_year
            },{
                colName:'student_no',
                ruleType:"eq",
                value:this.detailData.student_no
            },{
                colName:'semester',
                ruleType:"eq",
                value:this.semester
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
                        self.$set(self.childServiceLoadDatas,srv,data); // 保存各模块内容查询数据
                         self.$nextTick(() => {
                                if(this.childServiceLoadDatas && self.childServiceLoadDatas['srvledu_semester_evaluate_task_state_select'] && self.childServiceLoadDatas['srvledu_semester_evaluate_task_type_select']){
                                    // 如果是饼图业务加载饼图
                                    self.buildPieChart()
                                }
                                if(srv == 'srvledu_semester_evaluate_task_select'){
                                    // 如果是劳动评价，处理雷达图
                                    this.buildChart(data)
                                }
                               
                         })
                    }
                    
                    
                }
            });
        },
        buildPieChart(initData){
            // 单独加载 完成劳动任务统计的 饼图
            initData = this.childServiceLoadDatas['srvledu_semester_evaluate_task_type_select'] || []
            let data = initData.map(item => {
                let obj = {
                    name:item.task_type,
                    value:item.task_cnt
                }
                return obj
            })
            let completionRate = 0.0
            if(this.childServiceLoadDatas && this.childServiceLoadDatas['srvledu_semester_evaluate_task_state_select']){
                let list = this.childServiceLoadDatas['srvledu_semester_evaluate_task_state_select']
                let isCompletion = 0
                let allNum = 0

                if(Array.isArray(list)){
                    for(let item of list){
                        if(item.task_state == '已完成'){
                            isCompletion = item.task_cnt
                        }
                        allNum += item.task_cnt
                    }
                }
                completionRate = isCompletion/allNum
                // console.log(completionRate.toFixed(2),isCompletion,allNum)
            }
            let options =  { 
                title : {
                    show:true,//显示策略，默认值true,可选为：true（显示） | false（隐藏）
                    text: `${completionRate.toFixed(2)}%`,//主标题文本，'\n'指定换行
                    subtext: '完成率',//副标题文本，'\n'指定换行
                    x:'50%',//水平安放位置，默认为'left'，可选为：'center' | 'left' | 'right' | {number}（x坐标，单位px）
                    y: '45%',//垂直安放位置，默认为top，可选为：'top' | 'bottom' | 'center' | {number}（y坐标，单位px）
                    textAlign: 'center',//水平对齐方式，默认根据x设置自动调整，可选为： left' | 'right' | 'center
                    backgroundColor: 'rgba(0,0,0,0)',//标题背景颜色，默认'rgba(0,0,0,0)'透明
                    borderColor: '#ccc',//标题边框颜色,默认'#ccc'
                    borderWidth: 0,//标题边框线宽，单位px，默认为0（无边框）
                    padding: 0,//标题内边距，单位px，默认各方向内边距为5，接受数组分别设定上右下左边距
                    itemGap: 5,//主副标题纵向间隔，单位px，默认为10
                    textStyle: {//主标题文本样式{"fontSize": 18,"fontWeight": "bolder","color": "#333"}
                        "fontSize": 18,
                        "color": "#007bff"
                    },
                    subtextStyle: {//副标题文本样式{"color": "#aaa"}
                        "fontSize": 12,
                        "color": "#333"
                    },
                    zlevel: 0,//一级层叠控制。默认0,每一个不同的zlevel将产生一个独立的canvas，相同zlevel的组件或图标将在同一个canvas上渲染。zlevel越高越靠顶层，canvas对象增多会消耗更多的内存和性能，并不建议设置过多的zlevel，大部分情况可以通过二级层叠控制z实现层叠控制。
                    z: 6,//二级层叠控制，默认6,同一个canvas（相同zlevel）上z越高约靠顶层。
                },
                tooltip:{
                    formatter: "{b} : {c} ({d}%)" // 鼠标悬停tip 显示内容格式
                },
                toolbox: { 
                    // feature: { saveAsImage: {}, },
                    
                }, 
                color: ['#007bff', '#14d0db', '#28a745', '#ef6567', '#f9c956', '#75bedc'],
                // 饼图颜色序列
                series: [ 
                    { 
                        type: 'pie', 
                        data: this.bxDeepClone(data), 
                        radius: ['40%', '55%'], // 环形内外径
                        itemStyle: {
                            normal:{
                                label:{
                                    show:true,
                                    formatter: "{b} :\n  {c}({d}%)",
                                    // 项目label 内容格式化
                                }
                            }
                        }
                    }, 
                ], 
            }; 
            
            // console.log(options,document,document.querySelector(".radarPie"))
            chartPie = echarts.init(document.querySelector(".radarPie"));
            // console.log(options,chartPie)
            chartPie.setOption(options);
            // 当我们浏览器缩放的时候，图表也等比例缩放
            window.addEventListener("resize", function () {
                // 让我们的图表调用 resize这个方法
                chartPie.resize();
            });
        },
        buildChart(data){
            // 基于准备好的dom，初始化echarts实例
            let loadAllData = data
            let tags = this.chartTags
            chartTop = echarts.init(document.querySelector(".radarTop"));
                                // chartBot = echarts.init(document.querySelector(".radarBot"));
            console.log(chartTop,chartBot,loadAllData)
            let topMaxData = loadAllData.filter(item => item.semester == `${this.semester}`)
            let topData = loadAllData.filter(item => item.semester == `${this.semester}`)
            // let botMaxData = loadAllData.filter(item => item.semester_str == `${this.detailData.sch_year}下学期`)
            // let botData = loadAllData.filter(item => item.semester_str == `${this.detailData.sch_year}下学期`)
            topMaxData = topData.map(item => {
                let obj = {
                    name:item.index_name,
                    max:5,
                }
                return obj
            })
            topData=topData.map(item => item.index_score ? item.index_score : 0 )
            // botMaxData = botData.map(item => {
            //     let obj = {
            //         name:item.index_name,
            //         max:5,
            //     }
            //     return obj
            // })
            // botData=botData.map(item => item.index_score ? item.index_score : 0 )
            // console.log(topData,botData)

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
            // let  botOption = this.bxDeepClone(option)
            // botOption.radar.indicator = botMaxData
            // botOption.series[0].data = [botData]
            
            chartTop.setOption(topOption);
            // chartBot.setOption(botOption);
            // 当我们浏览器缩放的时候，图表也等比例缩放
            window.addEventListener("resize", function () {
                // 让我们的图表调用 resize这个方法
                chartTop.resize();
                // chartBot.resize();
            });
        },
        exportImg(myChart,id) {
            // echart 接口获取 图标的图片base64
            const src = (myChart).getDataURL({
                type:'png',
                pixelRatio: 2,
                backgroundColor: '#fff',
            });
            const a = document.createElement('a');
            console.log(src)
            return src
            
        },
        print(){
            // 吊起浏览器打印
            // this.$set(this,'radarBotImg',this.exportImg(chartBot,'radarBotImg'))
            this.$set(this,'radarTopImg',this.exportImg(chartTop,'radarTopImg'))
            this.$set(this,'radarPieImg',this.exportImg(chartPie,'radarPieImg'))
            this.$set(this,'showAction',false)
            // 图表转canvas 保存图片
            this.$nextTick(() => {
                // setTimeout(" window.print()",200);
                
                this.exportPDF()
            })
        },
        async exportPDF() {
        // 获取要导出的Vue组件
            // const vueComponent = document.querySelector('.pdf-review')
            // // 使用html2canvas将Vue组件渲染为图片
            // const canvas = await html2canvas(vueComponent)
            // // 创建新的jsPDF文档
            // const pdf = new jsPDF('p', 'mm', 'a4')
            // // 将渲染的图片添加到PDF文档中
            // pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, 211, 298)
            // // 下载PDF文件
            // pdf.save('my-pdf-document.pdf')
                var TypeName = this.title;
                const lableList = document.getElementsByClassName('parint-details');   // 注意这一句
                console.log(lableList)
                htmlPdf(TypeName, document.querySelector('#print-layout'), lableList).then(res => {
                    if(res){
                        // 导出PDF提示
                        this.$message({
                            type: 'success',
                            message: '已开始下载pdf，请在浏览器下载记录查看下载结果!'
                        });
                        // this.$set(this,'radarTopImg','')
                        // this.$set(this,'radarBotImg','')
                        // this.$set(this,'radarPieImg','')
                        // this.$nextTick(() => {
                        //     this.initData()
                        // })
                        
                        if(this.radarPieImg && this.radarTopImg){
                            this.radarPieImg = ''
                            this.radarTopImg = ''
                            
                            this.$nextTick(() => {
                                
                                this.initData()
                            })
                        }
                       
                    }
                });
            
  
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
        padding:0;
        background:#f7f7f7 !important;
    }
    >.el-card__body{
        padding:0 !important;
    }
  }
  .box-card > .el-card__header {
    padding: 10px 10px;
    border-bottom:0;
    background: #e9f5ff !important;
}
  .student-info{
    line-height:2.6rem !important;
    >span{
        line-height:2.6rem !important;
    }
    
  }
  .parint-details{
    display:block;
    .el-rate__icon{
        font-size:40px;
    }
  }

  </style>
  