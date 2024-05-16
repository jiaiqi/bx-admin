

import store from '@/store'
import { getV2,setRequest,sendCode } from './api.js'

var codeTime = null
export default {
  // name: 'form-layout',
  props: {
    msg: String,
    formType:{
      type:String,
      default:''   // add  update detail
    },
    initType:{
      type:String,
      default:''   // person  group
    },
    initTitle:{
      type:String,
      default:''
    },
    initServiceName:{
      type:String,
      default:''
    },
    initApp:{
      type:String,
      default:'ws'
    },
    defaultValue:{
      type:[Object,Array],
      default(){
        return null

      }
    }
  },
  components:{},
  mounted(){
    // this.getFriendLinks()
    if(this.useType && this.app && this.serviceName){
      this.getV2()
    }
    setTimeout(() => {
      this.$set(this,'readonlyInput',false)

    }, 300);

  },
  computed:{
    useType(){
      let type = ''
      if(this.formType){
        type = this.formType
      }

      return type
    },
    serviceName(){
      let srv = ''
      if(this.initServiceName){
        srv = this.initServiceName
      }
      return srv
    },
    app(){
      let app = ''

      if(this.initApp){
        app = this.initApp
      }
      return app
    },
    fieldsBuild(){
      let fields = []
      if(this.v2){
        fields = this.v2.srv_cols.filter(item => {
          if(item[`in_${this.formType}`]){
            return item
          }
        })
        fields = fields.map(item => {
          if(item[`in_${this.formType}`]){
            let type = 'text'
            let colType = item.col_type
            switch (colType) {
              case 'Enum':
                type = 'radio'
                item['_options'] = item.option_list_v2.map(item => {

                  return {
                    text:item.value,
                    value:item.value
                  }

                })
                break;

              case 'MultilineText':
                type = 'textarea'
                break;
              case 'String':
                type = 'text'
                break;
              case 'Image':
                type = 'image'
                break;
              default:
                break;
            }
            item['_inputType'] = type
            this.$set(this.fieldModel,item.columns,'')


            let field = {
              label:item.label,
              column:item.columns,
              type:type,
              value:null,
              placeholder:`请输入${item.label}...`,
              rules:[{
                type:'required',
                trigger:'change',
                msg:`${item.label}不能为空`
              }],
              state:null,
              msg:'',
              show:item[`in_${this.formType}`] == 1
              // '_data':item
            }
            return field
          }


        })
      }

      return fields
    }
  },
  data() {
    return {
      codeTime:0,
      codeState:false,
      regPhone: /^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/,
      regPwd:/^(?=.*\d)(?=.*[a-z])(?!.*\s).{8,}$/,
      v2:null,
      fieldModel:{},
      fields:[],
      submit:false,
      readonlyInput:true
    }
  },
  methods: {
    buildField(){
      let fields = []
      if(this.v2){
        fields = this.v2.srv_cols.filter(item => {
          if(item[`in_${this.formType}`]){
            return item
          }
        })
        fields = fields.map(item => {
          if(item[`in_${this.formType}`]){

            let type = 'text'
            let colType = item.col_type
            let initValue = this.defaultValue && this.defaultValue[item.columns] ? this.defaultValue[item.columns] : ''
            let reg = /^\'.*\'$/

            // console.log(item.label,item.init_expr,reg.test(item.init_expr)); // true
            if(reg.test(item.init_expr)){
              initValue = item.init_expr.replaceAll("'", "");
            }
            switch (colType) {
              case 'Enum':
                type = 'radio'
                item['_options'] = item.option_list_v2.map(item => {

                  return {
                    text:item.value,
                    value:item.value
                  }

                })
                break;

              case 'MultilineText':
                type = 'textarea'
                break;
              case 'String':
                type = 'text'
                if(item.subtype == 'verifySmsCode'){
                  type = 'code'
                }
                if(item.subtype == 'verifyMobile'){
                  // type = 'code'

                }
                break;
              case 'Image':
                type = 'image'
                break;
              default:

                if((colType.indexOf('bx') == 0 || colType == 'Fk') && item.option_list_v2 && initValue){
                  let srv = item.option_list_v2.serviceName
                  let no = item.option_list_v2.refed_col
                  let disp = item.option_list_v2.key_disp_col
                  let req = {
                    "serviceName": srv,
                    "colNames": [
                      "*"
                    ],
                    "condition": []
                  }
                  item.type = 'radio'
                  this.getFkOptions(req,srv).then(loadList => {
                    item['options_load_list'] = loadList.map(i=>i)
                    item['option_active'] = loadList.filter(i => i[no] == initValue)
                    if(Array.isArray(item['option_active'])){
                      item['option_active'] = item['option_active'][0]
                    }
                  })
                  console.log(item.columns,'::::',item['options_load_list'])

                }

                break;
            }
            item['_inputType'] = type
            let field = {
              label:item.label,
              column:item.columns,
              type:type,

              placeholder:`请输入${item.label}...`,
              rules:[{
                type:'required',
                trigger:'change',
                msg:`${item.label}不能为空`
              }],
              state:null,
              msg:'',
              show:item[`in_${this.formType}`] == 1,
              readonly:item['updatable'] === 0,
              options:item._options,
              'options_load_list':item.options_load_list,
              'option_active':item.option_active,
              '_data':item
            }
            if(['code'].indexOf(item.columns) == -1){
              field['value'] = initValue
            }
            console.log(item.column,initValue,item.label,field.value)
            // if(!this.fieldModel.hasOwnProperty(item.columns)){
            //     this.$set(this.fieldModel,item.columns,field.value)
            // }

            return field
          }


        })
      }

      this.fields = fields.map(item => {
        // this.$set(this.fieldModel,item.column,item.value)

        return item
      })
    },
    async getFkOptions(req,serviceName,app){
      let srvApp = app || this.app
      let loadList = []
      if(req && serviceName){
        let res = await  setRequest(req,'select',serviceName,srvApp)
        console.log(res)
        if(res.state == 'SUCCESS'){
          loadList = res.data.map(item => item)

          return loadList
        }else{
          return loadList
        }
      }

    },
    getV2(){
      let req = {
        "serviceName":'srvsys_service_columnex_v2_select',
        "colNames":["*"],
        "condition":[
          {"colName":"service_name",
            "value":this.serviceName,
            "ruleType":"eq"
          },{
            "colName":"use_type",
            "value":this.useType,
            "ruleType":"eq"
          }
        ],
        "order":[{"colName":"seq","orderType":"asc"}]
      }
      getV2(req,this.app).then((res) =>{
        // console.log('----',res)
        this.v2 = this.bxDeepClone(res.data)
        this.buildField()
      })
    },
    onReset(){

    },
    change(e,msg,valid = true){
      let self = this
      console.log(e.value)
      let valids = {}
      for(let field of this.formFields){
        if(e.column == field.column){
          let rules = field.rules
          if(valid && !msg && Array.isArray(rules)){
            for(let rule of rules){
              let type = rule.type
              switch (type) {
                case 'regular':
                  if(e.value){
                    let reg = new RegExp(rule.value)
                    if(!reg.test(e.value)){
                      self.$set(e,'state',false)
                      self.$set(e,'msg',rule.msg)
                      valids[e.column] = false
                    }
                  }
                  break;
                case 'required':
                  if(e.value == '' || e.value == null || e.value == undefined){
                    self.$set(e,'state',false)
                    self.$set(e,'msg',rule.msg)
                    valids[e.column] = false
                  }else if(e.value.trim()){

                    if(field.column == 'phone_no' && this.regPhone.test(e.value)){
                      self.$set(e,'state',null)
                      self.$set(e,'msg','')
                    }else if(field.type == 'password' && field.column !== 'pwd' && this.regPwd.test(e.value)){
                      self.$set(e,'state',null)
                      self.$set(e,'msg','')
                    }else if(field.column == 'pwd' && e.value.trim()){
                      self.$set(e,'state',null)
                      self.$set(e,'msg','')
                    }else{
                      let msg = rule.msg
                      if(field.type == 'password' && field.column !== 'pwd' && !this.regPwd.test(e.value)){
                        msg = '请输入8位以上,数字+字母组合密码'

                        self.$set(e,'state',false)
                        self.$set(e,'msg',msg)
                        valids[e.column] = false
                      }else{
                        self.$set(e,'state',null)
                        self.$set(e,'msg','')
                      }
                    }

                  }else{
                    self.$set(e,'state',false)
                    self.$set(e,'msg',msg)
                    valids[e.column] = false

                  }

                  break;

                default:
                  break;
              }
            }
          }else if(!valid && msg){
            self.$set(field,'state',valid)
            self.$set(field,'msg',msg)
            valids[field.column] = false
          }
        }
      }
      console.log('change field',valids)
    },
    validFeedback(){
      let self = this
      let valids = {}
      for(let field of this.formFields){
        let rules = field.rules
        if(Array.isArray(rules)){
          for(let rule of rules){
            let type = rule.type
            switch (type) {
              case 'required':
                if(field.value == '' || field.value == null || field.value == undefined){
                  self.$set(field,'state',false)
                  valids[field.column] = false
                  self.$set(field,'msg',rule.msg)
                }else{
                  self.$set(field,'state',null)
                  valids[field.column] = true
                  self.$set(field,'msg','')
                }
                break;

              default:
                break;
            }
          }
        }
      }
      return valids
      console.log('validFeedback',valids)
    },
    // onSubmit(){
    //  let model = this.reqBuild

    //  if(!this.fieldModel.message || !this.fieldModel.telephone || !this.fieldModel.contacts ){
    //     return
    //  }

    //  setRequest(model,'operate',this.serviceName,this.app).then(res=>{
    //     console.log(res.data)
    //     if(res.state == 'SUCCESS'){
    //          this.submit = true
    //     }
    //  })
    //      console.log('on submit',model)
    // }
    getCode(){
      console.log('获取验证码')
      let phone = ''

      let self = this
      let values = {}
      let valids = []
      let isValid = true
      for(let field of this.formFields){
        if(field.column == 'phone_no'){
          phone = field.value
          this.change(field)
        }else if(field.column !== 'code'){
          let value = field.value + ''
          if(field.value && value.trim()){
            console.log('--:',field.value,value.trim())

            self.$set(field,'state',null)
            self.$set(field,'msg','')
          }else{
            self.$set(field,'state',false)
            self.$set(field,'msg',`请填写有效的${field.label}`)
            valids.push(false)
          }
        }
      }
      if(!phone || !this.regPhone.test(phone) || valids.length > 0){
        return
      }

      let req = [{
        "serviceName": "srvmobile_note_send",
        "data": [{
          "mobile": phone
        }]
      }]

      sendCode(req).then(res => {
        if(res.state=="SUCCESS"){
          console.log('获取成功')
          let countdown = res.response[0].response.exp_time
          if(countdown){
            this.codeState = true
            this.countdown(countdown)
          }

        }else{
          this.$bvModal.msgBoxOk(res.resultMessage, {
            title: '请确认',
            size: 'sm',
            buttonSize: 'sm',
            okVariant: 'primary',
            okTitle: '确认',
            footerClass: 'p-2',
            hideHeaderClose: false,
            centered: true
          })
            .then(value => {
              // this.boxOne = value
            })
            .catch(err => {
              // An error occurred
            })
        }
      })
    },
    countdown(countdown){
      localStorage.setItem('codeTime',countdown)
      this.codeTime = countdown
      codeTime = setInterval(()=>{
        let time = localStorage.getItem('codeTime')
        this.codeTime = time
        if(time && time >= 1){
          time = (time - 1)
          localStorage.setItem('codeTime',time)
        }else{
          time = 0
          localStorage.setItem('codeTime',0)
          clearInterval(codeTime);
          this.codeState = false
        }
      }, 1000);
      console.log('倒计时',countdown)
    }
  },
  watch:{
    // "contentText":{
    //     deep:true,
    //     handler:function(nval,oval){
    //         // console.log(nval,oval)
    //         if(this.type == `mediaDetails` && this.contentText){
    //             this.getDetail(this.contentText)
    //         }
    //     }
    // },
  }
}
