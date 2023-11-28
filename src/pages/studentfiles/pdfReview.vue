<template>
    <div>
        <div style="padding:10px 10%;" v-if="showAction">
            <el-button type="primary" icon="el-icon-download" @click="exportPDF">立即下载PDF</el-button>
        </div>
        
         <div style="padding:10px 10%;"  id="pdf-layout">
            <table  class="pdf-review" v-if="detailData && v2Data">
                <tr class="pdf-details">
                    <th  colspan="6" style="font-weight:bold;text-align:center;font-size:1.5rem;">{{`${detailData.object_type == '基地' ? '实践基地' : '学校'}督导检查评估表`}}</th>
                </tr>
                <tr  class="pdf-details" >
                    <td colspan="6" style="font-weight:bold;">基本信息：</td>
                </tr>
                <tr  class="pdf-details" >
                    <td  style="width:8rem;">评估记录编号</td>
                    <td >{{detailData.estimate_no}}</td>
                    <td style="width:6rem;">{{`${detailData.object_type}名称`}}</td>
                    <td colspan="3" style="min-width:10rem;"> {{detailData.practice_name}} </td>
                </tr>
                <tr  class="pdf-details" >
                    <td  style="width:8rem;">检查人</td>
                    <td >{{detailData.examiner_name}}</td>
                    <td colspan="4"></td>
                </tr>
                <tr  class="pdf-details" >
                    <td colspan="6" style="font-weight:bold;">评选细则明细：</td>
                </tr>
                <tr  class="pdf-details" >
                    <td :colspan="chander.columns=='estimate_name' ? 3 : 1" style="text-align:center;" v-for="(chander,i) in childListHander" v-if="childHanderColName.includes(chander.columns)">{{chander.label}}</td>
                    <td  style="text-align:center;" >{{`得分`}}</td>
                </tr>
                <tr  class="pdf-details" v-for="(item,index) in childDataList" :key="index"  v-if="childDataList">
                    <td v-if="item && (col !=='type_name' || (col =='type_name' &&  getColspan(item,index).index == 0))" 
                    :rowspan="col =='type_name' ?  getColspan(item,index).rowspan : 1"  
                    :colspan="col && col =='estimate_name' ? 3 : 1" 
                    :style="`${col == 'score' ? 'text-align:center;':'text-align:left;'}`"
                    v-for="(col,c) in childHanderColName" 
                    :key="c" >
                       {{col == 'type_name' ? `${caps[childDataTitles.indexOf(item[col])]}、${item[col]}` : item[col]}}
                    </td>
                    <td  style="font-weight:bold;" >{{``}}</td>
                </tr>
             </table>
        </div>
        
    </div>
  </template>
   
  <script>
  import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
   
import htmlPdf from './pdf.js';
  export default {
    computed:{
        hander(){
            let handers = []
            let data = this.bxDeepClone(this.test)
            if(Array.isArray(data) && data.length > 0){
                handers = Object.keys(data[0])
            }
            return handers
        },
        listCondition(){
             let condition = [{
                colName:'estimate_no',
                ruleType:'eq',
                value:''
             }]
             if(this.detailData && this.detailData.estimate_no){
                condition[0].value = this.detailData.estimate_no
             }
             return condition
        },
        childListHander(){
             let cols = this.listV2Data ? this.listV2Data.srv_cols : []
             if(Array.isArray(cols) && cols.length > 0){
                cols = cols.filter( item => item['in_list'] == 1)
             }
             return cols
        },
        childDataList(){
             let list = this.childService ? this.childService[0] : null
             if(list && list.hasOwnProperty('_load_data')){
                list = list['_load_data']
             }
             return list
        },
        childDataTitles(){
             let list = this.childDataList ? this.bxDeepClone(this.childDataList) : []
             let titles = []
             if(Array.isArray(list) && list.length > 0){
                for(let item of list){
                    if(titles.indexOf(item.type_name) == -1){
                        titles.push(item.type_name)
                    }
                }
             }
             return titles
        },
        documentTitle(){
            let title = `${this.detailData && this.detailData.object_type == '基地' ? '实践基地' : '学校'}督导检查评估表`
            return title
        }
    },
    data(){
        return {
            showAction:true,
            test:[],
            caps:['一','二','三','四','五','六','七','八','九','十','十一','十二','十三','十四','十五'],
            childHanderColName:['type_name','estimate_name','score'],
            childService:'srvledu_estimate_record_item_select',
            srvApp:null,
            id:null,
            serviceName:'',
            v2Data:null,
            initLoadModel:null,
            v2Cols:null,
            v2ChildService:null,
            detailData:null,
            listV2Data:null,
            
        }
    },
    mounted(){
        if(this.$route.params ){
            if(this.$route.params.id){
                this.$set(this,'id',this.$route.params.id)
            }
            if(this.$route.params.serviceName){
                this.$set(this,'serviceName',this.$route.params.serviceName)
            }
            
        }
        if(this.$route.query){
            if(this.$route.query.srvApp){
                this.$set(this,'srvApp',this.$route.query.srvApp)
            }
        }
        this.$nextTick(() => {
            if(this.id && this.serviceName && this.srvApp){
                this.initData()
            }
            
        })
    },
    methods: {
        getColspan(e,i){
            let key = e.estimate_no
            let rowspan = 1
            let index = 0
            let datas =this.childDataList?  this.bxDeepClone(this.childDataList) : []
            let list  = []
            if(Array.isArray(datas) && datas.length > 0){
                list  = datas.filter(item => item['type_name'] == e.type_name)
                let keys = list.map(item => item.estimate_no)
                if(Array.isArray(keys) && keys.length > 1){
                    index = keys.indexOf(key)
                }
                rowspan= list.length
                // console.log(colspan,list)
                // console.log(i,key,{rowspan,index},keys)
            }
            
            return {rowspan,index}
        },
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
                        'list',
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
                            document.title = this.documentTitle;
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
                            // 查询明细v2
                            this.getListV2(this.childService,'list')

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
        async getListV2(srv,type){

            await this.loadColsV2(srv, type,this.srvApp,srv).then(response => {
                    // 查询v2
                    this.listV2Data = response.body.data;
                    
                    
                    
                });
        },
        async getListData(child){
            // 子表数据查询
            let srv = child.service_name
            let app = child.srv_app
            let condition = child.defaultCondition
            
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
                
                                // this.buildChart(data)
                               
                            })
                        }
                    }
                    
                    
                }
            });
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
            var TypeName = `${this.documentTitle}${this.detailData.estimate_no}(${new Date().toLocaleDateString()})`;
                const lableList = document.getElementsByClassName('pdf-details');   // 注意这一句
                htmlPdf(TypeName, document.querySelector('#pdf-layout'), lableList).then(res => {
                    if(res){
                        this.$message({
                            type: 'success',
                            message: '已开始下载pdf，请在浏览器下载记录查看下载结果!'
                        });
                    }
                });
            
  
        }
    }
  }
  </script>
    <style lang="css">
    #pdf-layout{
        padding:1rem;
    }
    .pdf-review{
        width: 100%; 
        height:auto;
        
        padding: 0 10%;
        /* min-height:100vh; */
        /* background-color:#eeeeee; */
        margin:0 auto;
    }
    @media print {
        
    }

    table {
        border-spacing: 0px;
        /* width: 300px; */
        /*居中*/
        max-width:100%;
        /*边框*/
        /* border: 1px solid black; */
        border-collapse: collapse;
border-spacing: 0;
border-width: 1px;
        /*设置背景颜色*/
        /* background-color: #bfa; */
      }

      /*
       * 设置边框
       */
      td,
      th {
        width:auto;
        overflow-wrap: anywhere;
        /* overflow-wrap: */
        border: 1px solid black;
        padding:6px 6px ;
        color:#000;
        border-width: 1px;
      }

      tr:hover {
        /* background-color: #ff0; */
      }
      </style>
 