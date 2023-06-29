<template>
    <div class="ll-content  bg-white">
        <el-form ref="ruleForm" v-if="fieldModels" :rules="formRules" :inline="false" label-position="right" label-width="8rem" :model="fieldModels"  class="demo-form-inline" size="mini">
            <el-row :gutter="5" >
                <template v-for="(formItem,fIndex) in sections">
                    <el-col :span="fieldSpan.hasOwnProperty(formItem.field.info.name) ? fieldSpan[formItem.field.info.name]  : 8" :key="formItem.field.info.name"  v-if="formItem.field.info.readonly ? formItem.field.info.srvCol.in_detail == 1 : formItem.field.info.bodyVisible  && modelFieldKeys.indexOf(formItem.field.info.name) !== -1 && formItem.field.info.name !== 'child_data_list'">
                        <el-form-item :label="`${formItem.field.info.label}`" :prop="formItem.field.info.name" >
                            <!-- (${formItem.field.info.name}) -->
                            <raw-field-editor
                                ref="inner"
                                :field="formItem.field"
                                v-show="formItem.field.info.readonly ? formItem.field.info.srvCol.in_detail == 1 : formItem.field.info.bodyVisible"
                                @field-value-changed="fieldValueChanged"
                                @field-history-popup="$emit('field-history-popup', $event)"
                                style="flex: 1;"
                            >
                            </raw-field-editor>
                        </el-form-item>
                    </el-col>
                    <el-col v-if="children.hasOwnProperty(`field-${formItem.field.info.name}`)" :span="24">
                        <el-form-item :label="children[`field-${formItem.field.info.name}`].service_view_name" prop="child_data_list" :key="'child_data_list'">
                            <!-- (${formItem.field.info.name}) -->
                            <formList :type="type" v-model="fieldModels.child_data_list" :foreignKey="children[`field-${formItem.field.info.name}`].foreign_key" :showSummary="true" :summaryColumns="['goods_name','packages','weight','volume']" :initListColumns="['goods_name','packages','weight','volume']" :serviceName="children[`field-${formItem.field.info.name}`].service_name" :useType="`${type}childlist`" :mainService="serviceName" :mainModel="fieldModels" @change="childModelsChange($event,`field-${formItem.field.info.name}`)"></formList>
                        </el-form-item>
                    </el-col>
                </template>
                
            </el-row>
        </el-form>
       
        <el-row type="flex" :gutter="5" class="row-bg padding bg-white box-border" justify="center">
            <el-col :span="12">
                <!-- // 其他功能 -->
                <!-- <el-button  size="small">收货历史</el-button> -->
            </el-col>
            <el-col :span="12">

                <el-button type="primary" size="small" @click="onSubmit" >保存运单</el-button>
            </el-col>
        </el-row>
    </div>
  </template>
  
  <script>

  import _ from "lodash";
  import "@/assets/common.scss";
  let $ = require("jquery");
  
  import { FieldInfo } from '@/components/model/FieldInfo'
import { Field } from '@/components/model/Field'

import RawFieldEditor from "@/components/common/raw-field-editor.vue";
import formList from "@/components/common/form-list.vue";
  export default {
    components: {"raw-field-editor":RawFieldEditor,formList},
  
    mixins: [],
  
    props: {},
  
    data() {
      return {
          type:'add',// add  // update
          serviceName:"",
          srvApp:"",
          v2:null,
          childsV2:null,
          fields:null,
          initData:null,
          fieldModels:null,
          fieldSpan:{
            "delivery_date": 8,
            "rcv_addr_no": 8,
            "delivery_addr_no": 8,
            "remark": 24,
            "trans_goods_item_count": 8,
            "cdr_no": 8,
            "carrier_car_no": 8,
            "depart_type": 8,
            "delivery_line_site_no": 8,
            "rcv_line_site_no": 8,
            "waybill_amount_list": 8,
            "waybill_amount_adjust": 8,
            "waybill_total_expense": 8,
            "agency_fund": 8,
            "advance_payment": 8,
            "waybill_amount_to_pay": 8,
            "waybill_amount_to_pay_arrived": 8,
            "bill_pay_party": 8,
            "pay_method": 8
        },
        tableData: [{
          id: '12987122',
          name: '王小虎',
          amount1: '234',
          amount2: '3.2',
          amount3: 10
        }, {
          id: '12987123',
          name: '王小虎',
          amount1: '165',
          amount2: '4.43',
          amount3: 12
        }, {
          id: '12987124',
          name: '王小虎',
          amount1: '324',
          amount2: '1.9',
          amount3: 9
        }, {
          id: '12987125',
          name: '王小虎',
          amount1: '621',
          amount2: '2.2',
          amount3: 17
        }, {
          id: '12987126',
          name: '王小虎',
          amount1: '539',
          amount2: '4.1',
          amount3: 15
        }]
      };
    },
    computed:{
        children(){
            let childs = this.childsV2
            let children = {}
            
            if(Array.isArray(childs)){
                for(let child of childs){
                    if(child.hasOwnProperty('foreign_key') && child.foreign_key && child.foreign_key.foreign_key_type == '主子表' && child.foreign_key.show_ui_child_table == '是'){
                        
                        if(child.foreign_key.more_config){
                            child['_moreConfig'] = JSON.parse(child.foreign_key.more_config)
                            if(child['_moreConfig'].type == 'field'){
                                child['_layout'] = `field-${child['_moreConfig'].colName}`
                            }
                            children[`field-${child['_moreConfig'].colName}`] = child
                        }else{
                            child['_layout'] = `form-`
                            children[`form-${child.foreign_key.constraint_name}`] = child
                        }
                        
                    }
                }
            }

            return children
        },
        formRules(){
            let rules= {
                }
            for(let item of this.sections){
                let f = item.field
                let r = f .info.rules
                rules[f.info.name] = []
                if(Array.isArray(r)){
                    for(let rule of r){
                        let required = { required: true, message: `请输入${f.info.label}`, trigger: 'change' };
                        let len = {message:'', trigger: 'change'}
                        //{ min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'change' };

                        if(rule.name == 'ngMaxlength'){
                            len['max'] = rule.ngMaxlength,
                            len['message'] = `${len['message']} 最大长度${len['max']}个字符`

                            rules[f.info.name].push(len)
                        }else{
                            rules[f.info.name].push(required)
                        }
                    }
                }
            }
            var validateChildren = (rule, value, callback) => {
                let self = this
                if(!value || value.length == 0){
                    value = self.fieldModels['child_data_list']
                }
                
                console.log('child_data_list',value)
                if(Array.isArray(value) && value.length !== 0 &&  Array.isArray(value[0].data)){
                    if (value[0].data.length === 0) {
                         callback(new Error('未填写货物信息'));
                    } else if(value[0].data.length > 0){
                        // if (this.ruleForm.checkPass !== '') {
                        //     this.$refs.ruleForm.validateField('checkPass');
                        // }
                        callback();
                    }else{
                        callback(new Error('未填写货物信息')); 
                    }
                }else{
                    callback(new Error('未填写信息'));
                }
                
            };
            rules['child_data_list'] = [{ validator: validateChildren, trigger: 'change' }]

            return rules
        },
        
        modelFieldKeys(){
            let fields = this.fieldSpan || {}
            let keys = []
            keys = Object.keys(fields)
            keys = this.fields.map(item => item.info.name)
            return keys
        },
        submitRequest(){
            let req = {}
            let data= this.bxDeepClone(this.fieldModels)
            if(this.v2 && this.v2.hasOwnProperty('service_name')){
                req['serviceName'] = this.v2.service_name
            }
            if(this.type == 'update'){
                req['conditon'] = []
            }
            if(this.type == 'add'){
                req['data'] = [data]
            }
            req['srvApp'] = this.srvApp
            return [req]
        },
        useType(){
            let type = this.type
            return type
        },
        initDataRequest(){
            let req = {
                "serviceName": "",
                "colNames": ["*"],
                "condition": []
            }
            if(this.v2 && this.v2.hasOwnProperty('select_service_name')){
                req['serviceName'] = this.v2.select_service_name
            }
            if(this.type == 'update'){

            }
            return req

        },
        childV2Request(){
            let req = {
                "serviceName": "",
                "colNames": ["*"],
                "condition": []
            }
            if(this.v2 && this.v2.hasOwnProperty('select_service_name')){
                req['serviceName'] = this.v2.select_service_name
            }
            if(this.type == 'update'){

            }
            return req
        },
        sections: function () {
            let sections = {};
            let fields = null;
            let section = null;
            let arr = []
            for (let key in this.fields) {
                let field = this.fields[ key ];
                if (field.info && field.info.sec && field.info.sec !== section) {
                // close last section,
                    if (fields) {
                        sections[ section || "$" ] = fields;
                    }

                    // start a new one
                    section = field.info.sec;
                    fields = [];
                }

                // add to curr section if field.vif = true
                fields = fields || [];
                field.vif && fields.push(field);
            }
            if (fields) {
                sections[ section || "$" ] = fields;
            }

            // hide section whose fields are all invisible
            let hideSections = new Set();
            for (let key in sections) {
                let sectionFields = sections[ key ];
                let visibleFields = sectionFields.filter(field => {
                return (field && field.evalVisible());
                })

                if (visibleFields.length == 0) {
                hideSections.add(key)
                }
            }

            hideSections.forEach(key => delete sections[ key ])

            // 把 field 组织成: majorField 和 contentFields， 服务一个form-item 包含多个fields
            let sectionsOfFormItems = {};
            for (let key in sections) {
                let fieldsInSection = sections[ key ];
                let isGroupedField = field => field.info.srvCol.group_field;
                let groupedFields = fieldsInSection.filter(isGroupedField)
                _.remove(fieldsInSection, isGroupedField);

                let formItems = fieldsInSection.map(majorField => {
                let contentFields = [ majorField ].concat(
                    groupedFields.filter(groupedField => groupedField.info.srvCol.group_field === majorField.info.name)
                );
                return {
                    field: majorField,
                    contentFields: contentFields,
                }
                })
                sectionsOfFormItems[ key ] = formItems;
                
                arr = arr.concat(formItems)
            }
            
            // console.log(sectionsOfFormItems)
            return arr;
        },
        allSections(){
            let fieldModels = []
            let sections = this.sections || {}
            if(sections && typeof sections[Symbol.iterator] === 'function'){
                for(let fields of sections){
                    if(Array.isArray(fields)){
                        fieldModels = fieldModels.concat(fields)
                    }
                    
                }
            }
            return fieldModels
        }
    },
    methods: {
        childModelsChange(childreq){
            let self = this
            self.fieldModels['child_data_list'] = []
             self.fieldModels['child_data_list'] = [childreq].map(item => item)
             self.$set(this.fieldModels,'child_data_list',[childreq])
             console.log('children change childModelsChange():',childreq)
            //  this.fieldModels['child_data_list'].push(childreq)
            self.$refs['ruleForm'].validateField('child_data_list',(errmsg)=>{
                        console.log(errmsg)
                    })
        },
        submitForm(){
            let self = this
            self.$confirm("确认提交?", "提示", {
                        confirmButtonText: "确定",
                        cancelButtonText: "取消",
                        type: "info"
                    }).then(()=>{
                        let queries = self.submitRequest
                        self.operate(queries)
                        .then((response) => {
                            if (response && response.data) {
                                if (response.data.state == 'SUCCESS') {

                                    // only for local refresh of treegrid
                                    response.request = queries[0];
                                    self.$message({
                                        message: response.data.resultMessage || "提交成功！",
                                        type: "success"
                                    });
                                }else{
                                    self.$message.error(response.data.resultMessage || "提交失败！");
                                }
                            }
                        });
                    }).catch(() => {
                        self.$message({
                            type: "info",
                            message: "已取消删除"
                        });
                    });
        },
        onSubmit(){
            let self = this
            self.$refs['ruleForm'].validateField('child_data_list',(errmsg)=>{
                console.log(errmsg)
            })
            self.$refs['ruleForm'].validate((valid,object) => {
                console.log(valid,object)
                if (valid) {
                    
                    self.submitForm()
                    console.log('form models:',this.fieldModels)
                } else {
                    // console.log('error submit!!');
                    console.log(valid)
                    return false;
                }
            });
        },
        fieldValueChanged(name,field){
            let self = this
            if(field.info.editor == 'finder' && field.info.dispLoader && field.info.dispLoader.refedCol){
                let value = field.model
                let valueColumn = field.info.dispLoader.refedCol
                if(Object.prototype.toString.call(field.model) === '[object Object]'){
                    value = field.model[valueColumn]
                }
               
                this.$set(this.fieldModels,name,value)
            }else{
                this.$set(this.fieldModels,name,field.model)
            }
            
            console.log(name,'change',field.model)
        },
        onFieldValueChanged(field){
            console.log(field)
        },
        getParentFormModel:function(){
                return this.fieldModels
            },
            srvValFormModel(){
                return this.fieldModels
            },
        async loadV2(){
            await this.loadColsV2(this.serviceName, this.useType,null)
            .then((res)=>{
                console.log(res.data)
                if(res.data.state == 'SUCCESS'){
                    this.v2 = res.data.data
                    this.loadChildsV2()
                    this.initFields()
                }
            })
        },
        async loadChildsV2(){
            await this.loadColsV2(this.v2.select_service_name, 'detail',null,this.serviceName)
            .then((res)=>{
                console.log(res.data)
                if(res.data.state == 'SUCCESS'){
                    this.childsV2 = res.data.data.child_service
                    if(this.childsV2 && Array.isArray(this.childsV2)){
                        this.childsV2 = this.childsV2.filter(item => item.foreign_key.foreign_key_type == '主子表')
                        this.fieldModels['child_data_list'] = []
                    }
                }
            })
            
        },
        initFields(){
            let self = this
            let fields = this.v2.srv_cols
            let modelFields = fields.filter(item => item[`in_${this.type}`] == 1)
            let colTypes = modelFields.map(item => item.col_type)
            colTypes = [...new Set(colTypes)]
            self.fieldModels = {}
            modelFields = modelFields.map((item) => {
                // let obj = {
                //     label:item.label,
                //     column:item.columns,
                //     initValue:item.init_expr,
                //     srvColType:item.col_type,
                //     value:null,
                //     srvCol:this.bxDeepClone(item) 
                // }
                // obj = new FieldInfo(item, this.type);

                let fi = new FieldInfo(item, this.type);
                let f = new Field(fi, self);
                if(item.col_span == '1'){
                    f['colspan'] = 24
                }else{
                    f['colspan'] = 8
                }

                self.$set(this.fieldModels,item.columns,f.model)
                self.$set(this.fieldModels,item.columns,f.model)
                return f
            })
            this.fields = modelFields.map(item => item)
            
            console.log(colTypes)
        }
    },
  
    created: function () {
       this.type = this.$route.params.type || 'add'
       this.serviceName = this.$route.query.serviceName || 'srvwuliu_waybill_car_self_add'
       this.srvApp = this.$route.query.srvApp || this.$route.query.menuapp
       this.loadV2()
    },
  
    mounted: async function () {
       
    },
    watch:{
        "sections":{
            deep:true,
            handler:function(n,o){
                // console.log(n)
            }
        },
        "fieldModels":{
                deep:true,
                handler:function(n,o){
                    console.log('fieldModels.child_data_list',n.child_data_list)
                    
                }
            }
    }
  };
  </script>
  
  <style lang="scss">
// .grid-content{
//     height: 100px;
// }
// .bg-purple{
//     background-color: aqua;
//   }
 
  .ll-content {
    .padding{
        padding: 20px;
    }
    .el-textarea.el-input--mini{
        height: 30px!important;
        textarea{
            height: 30px!important;
            
        }
        .el-input__count {
            bottom: 2px!important;
            font-size: 10px;
            line-height: 14px!important;
        }
    }
  }
  </style>
  