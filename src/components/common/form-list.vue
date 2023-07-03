<template>
    
    <el-form  ref="formList" size="mini" class="form-list">
        <el-table
        :data="modelDatas"
        class="form-list-table"
        :show-summary="showSummary"
        :header-cell-style="{'padding':'2px'}"
                    :cell-style="{'padding':'2px'}"
        border
        style="width: 100%">
                <el-table-column
                    :prop="header.columns"
                    :label="header.label"
                    header-align="center"
                    :width="hIndex == 0 ? '400px' : 'auto'"
                    size='mini'
                    v-for="(header,hIndex) in headers" :key="hIndex"
                    >
                    <template slot-scope="scope" v-if="Object.prototype.toString.call(scope.row[header.columns]) === '[object Object]'">
                        <!-- scope.row -->

                        <el-form-item  style="margin-bottom: 2px" :rules="scope.row[header.columns].formItemRules"> 
                            <el-input v-if="['String','Integer','Float','Money'].indexOf(scope.row[header.columns].type) !== -1" :type="['Integer','Float'].indexOf(scope.row[header.columns].type) !== -1  ? 'number' : 'text'" v-model="scope.row[header.columns]['value']" clearable @change="fieldValueChange(header.columns,scope.row[header.columns]['value'],scope)"  :placeholder="`请输入${scope.row[header.columns].label}`"></el-input>
                            <el-select
                                v-if="['Enum'].indexOf(scope.row[header.columns].type) !== -1"
                                @change="fieldValueChange(header.columns,scope.row[header.columns]['value'],scope)"
                                v-model="scope.row[header.columns]['value']"
                                clearable
                                placeholder="请选择">
                                <el-option
                                v-for="item in scope.row[header.columns].options"
                                :key="item.value"
                                :label="item.label"
                                
                                :value="item.value">
                                </el-option>
                            </el-select>
                        
                        </el-form-item>


                    </template>
                    <!-- <template slot-scope="scope" v-else>
                            {{scope.row[header.columns]}}
                            case 'Integer':
                                                type = {type: 'number', message: `${info.label}必须为数字值`,trigger: 'change'}
                                                break;
                                            case 'Float':
                    </template> -->
                </el-table-column>
        </el-table>
        
    </el-form> 
  </template>

  <script>
    import { FieldInfo } from '@/components/model/FieldInfo'
import { Field } from '@/components/model/Field'

import formListMixin from "@/components/mixin/form-list-mixin";
import RawFieldEditor from "@/components/common/raw-field-editor.vue";
    export default {
      name:"form-list",
      mixins: [formListMixin],
      components: {RawFieldEditor},
      props: {
        foreignKey:{
            type:[Array,Object],
            default(){
                return null
            }  
        },
        type:{
            type:String,
            default:'detail' 
        },
        serviceName:{
            type:String,
            default:'' 
        },
        srvApp:{
            type:String,
            default:''  
        },
        useType:{
            type:String,
            default:'list'  
        },
        showSummary:{
            type:Boolean,
            default:false
        },
        summaryColumns:{
            type:[Array],
            default(){
                return []
            }
        },
        initData:{
            type:Array,
            default(){
                return []
            }  
        },
        mainService:{
            type:String,
            default:'' 
        },
        mainModel:{
            type:[Array,Object],
            default(){
                return []
            }  
        },
        initListColumns:{
            type:[Array,Object],
            default(){
                return []
            }  
        },
        rows:{
            type:[String,Number],
            default(){
                return 3
            }  
        },
      },
      computed:{
         requestModel(){
            let models = this.bxDeepClone(this.dataModels)
             let request = {
                "serviceName": this.serviceName,
                "condition": [],
                "data": []
            }
            switch (this.type) {
                case 'add':
                    request['serviceName'] = this.addService
                    request['depend_keys'] = [
                        {
                            "type": "column",
                            "add_col": this.foreignKey.keydispcol ,//"wb_no",
                            "depend_key": this.foreignKey.referenced_column_name//"wb_no"
                        }
                    ]
                    request.data = models.map(items =>{
                        let obj = {}
                        for(let key in items){
                            obj[key] = items[key].value
                        }
                        return obj
                    })
                    request.data = request.data.filter(item => {
                        let values = Object.values(item)
                        values = values.filter(item => item !== undefined && item !== null && item !== '')
                        if(values.length > 0){
                            return item
                        }
                    })
                    break;
            
                default:
                    break;
            }

             return request
         },
         modelDatas(){
            let arr = []
            arr = arr.concat(this.dataModels)
            arr = arr.concat(this.summaryModel)
            return arr
         },
         headers(){
            let headers = []
            let initColumns = this.initListColumns
            if(Array.isArray(initColumns) && this.v2){
                headers = this.v2.srv_cols.filter(item => initColumns.indexOf(item.columns) !== -1)
            }else if(this.v2){
                headers = this.v2.srv_cols.filter(item => item[`in_list`] == 1)
            }
             
            return headers
         },
         summaryModel(){
             let models = []
             
             let sums = {}
             let dataModels = this.bxDeepClone(this.dataModels) 
             if(Array.isArray(dataModels)){
                for(let items of dataModels){
                    let item = {}
                    for(let key in items){
                        item[key] = items[key].value
                    }
                    models.push(item)
                }
             }

             for(let head of this.headers){
                sums[head.columns] = models.reduce((pre, cur) => {
                    let value = Number(cur[head.columns])
                    if(!isNaN(value)){
                        return pre + value;
                    }else{
                        return pre
                    }
                    
                }, 0);
             }
             for(let key in sums){
                if(this.summaryColumns.indexOf(key) == -1){
                    sums[key] = ''
                }else if(this.summaryColumns.indexOf(key) == 0){
                    sums[key] = '合计：'
                }
             }
             return sums
         }
      },
      data() {
        return {
            tableData: [
                {
                    date: '2016-05-02',
                    name: '王小虎',
                    address: '上海市普陀区金沙江路 1518 弄'
                }, {
                    date: '2016-05-04',
                    name: '王小虎',
                    address: '上海市普陀区金沙江路 1517 弄'
                }, {
                    date: '2016-05-01',
                    name: '王小虎',
                    address: '上海市普陀区金沙江路 1519 弄'
                }, {
                    date: '2016-05-03',
                    name: '王小虎',
                    address: '上海市普陀区金沙江路 1516 弄'
                }
            ],
            dataModels:[],
            v2:null,
            addService:'',
            updateService:"",
            deleteService:"",
            addV2:null,
            updateV2:null,
            addModel:null,
            updateModel:null
        }
      },
      mounted(){
         if(this.serviceName){
            this.loadV2()
         }
      },
      methods:{
            getModelDatas(){
                return this.modelDatas
            },
            async loadV2(service,usetype){
                let srv = service || this.serviceName
                let useType = usetype || this.useType
                await this.loadColsV2(srv, useType,null,this.mainService)
                .then((res)=>{
                    // console.log(res.data)
                    if(res.data.state == 'SUCCESS'){
                        this.v2 = res.data.data
                        this.addService = this.v2.gridButton.filter(item => item.button_type == 'add')
                        this.addService = this.addService[0].service_name
                        this.updateService = this.v2.rowButton.filter(item => item.button_type == 'edit')
                        this.updateService = this.updateService[0].service_name
                        this.deleteService = this.v2.rowButton.filter(item => item.button_type == 'delete')
                        this.deleteService = this.deleteService[0].service_name
                        this.buildModelV2()
                        
                    }
                })
            },
            async buildModelV2(){
                let self = this
                let srv = ''
                let useType = ''
                switch (this.type) {
                    case 'add':
                        srv = this.addService
                        useType = `${this.type}`
                        break;
                    case 'update':
                        srv = this.updateService
                        useType = `${this.type}`
                        
                        break;
                
                    default:
                        break;
                }
                if(!srv || !useType){
                    return
                }
                await this.loadColsV2(srv, useType,null,this.mainService)
                .then((res)=>{
                    // console.log(res.data)
                    if(res.data.state == 'SUCCESS'){
                        self.$set(self,`${useType}V2`,res.data.data)
                        self.$set(self,`${useType}Model`,res.data.data.srv_cols)
                        if(Array.isArray(res.data.data.srv_cols)){
                            self[`${useType}Model`] = {}
                            res.data.data.srv_cols.map(item =>{
                                let fi = new FieldInfo(item, this.type);
                                let f = new Field(fi, self);
                                this.$set(self[`${useType}Model`],f.info.name,f)
                                return f
                            })
                            
                            for(let i=0;i< this.rows;i++){
                                // 封装 列表 表单组件简单模型
                                let models = {}
                                let keys = this.headers.map(item => item.columns)
                                for(let key of keys){
                                    let info = self[`${useType}Model`][key].info
                                    let rules = info.rules
                                    info['formItemRules'] = []
                                    if(Array.isArray(rules)){
                                        rules = rules.map(item => item)
                                        for(let rule of rules){
                                            let required = { required: true, message: `请输入${info.label}`, trigger: 'change' };
                                            let len = {message:'', trigger: 'change'}
                                            //{ min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'change' };

                                            if(rule.name == 'ngMaxlength'){
                                                len['max'] = rule.ngMaxlength,
                                                len['message'] = `${len['message']} 最大长度${len['max']}个字符`

                                                info['formItemRules'].push(len)
                                            }
                                        }
                                    }
                                    let type = {type: 'number', message: `${info.label}必须为数字值`}
                                    switch (info.type) {
                                        case 'Integer':
                                            type = {type: 'number', message: `${info.label}必须为数字值`,trigger: 'change'}
                                            break;
                                        case 'Float':
                                            type = {type: 'number', message: `${info.label}必须为数字值`,trigger: 'change'}
                                            break;
                                        default:
                                            type = {type: 'number', message: `${info.label}必须为数字值`,trigger: 'change'}
                                            break;
                                    }
                                    if(info.type == 'Enum' && info.srvCol && info.srvCol.option_list_v2 && info.srvCol.option_list_v2.options){
                                        info['options'] = info.srvCol.option_list_v2.options.map(item => item)
                                    }
                                    info['formItemRules'].push(type)
                                    if(info.initValueExpr && info.initValueExpr.indexOf("'") !== -1){
                                        info.value = info.initValueExpr.replaceAll("'","")
                                    }

                                     
                                    models[key] = self.bxDeepClone(info) 
                                }

                                this.dataModels.push(models)
                            }
                        }
                    }
                })
            }
        },
        watch:{
            "requestModel":{
                deep:true,
                handler:function(n,o){
                    // this.$emit('models-change',n)
                    this.$emit('change',n)
                }
            }
        }
    }
  </script>
  <style scoped lang="less">
  .form-list{
    .el-select el-select--mini{
        margin-left: 0px!important;
    }
    .el-form-item--mini.el-form-item, .el-form-item--small.el-form-item {
        margin-bottom: 0px!important;
    }
    .el-form-item--mini .el-form-item__content {
        line-height: 22px;
    }
    .form-list-table{
        .el-table th > .cell {
            padding: 3px 4px!important;
            line-height: 18px!important;
        }
        .el-table th > .cell {
            color: #536785;
            padding-left: 2px;
            padding-right: 2px;
            padding:0;
            white-space: nowrap!important;
        }
    }
    
  }
  
</style>