import _ from "lodash";

import VueEvent from '../../util/VueEvent.js';
export default {
  computed: {
    formRules: function () {
      let rulesMap = {};
      for (let key in this.fields) {
        let field = this.fields[key];
        // if (field.evalEditable() && field.info.rules) {
        if (field.info.rules) {
          rulesMap[field.info.name] = field.info.rules;
        }
      }

      return rulesMap;
    },

  },


  methods: {
    hasInvalidField() {
      return Object.values(this.allFields).filter(field => field.hasValidateError()).length > 0;
    },


    /**
     * wrap the callback into a promise
     * @returns {Promise<any>}
     */
    validateForm: function () {
      return new Promise( (resolve, reject) => {
        Object.keys(this.allFields).forEach(fieldName => this.handleValidation(fieldName));
        let visibleBadFields = Object.values(this.allFields).filter(field => field.evalVisible() && field.hasValidateError());
        let ok = visibleBadFields.length === 0;
        ok ? resolve(true) : reject();
      });
    },


    handleValidation(fieldName) {
      // 字段校验
      let fieldRules = this.formRules;
      if (fieldRules[fieldName]) {
        // has field level validate rule,
        let field = this.allFields[fieldName];
        let ruleArray = fieldRules[fieldName];
        ruleArray.forEach(rule => {
          // console.log('',field)
          let state = this.evalFieldRule(rule,field,fieldName,this);
          if( (state === true)||(typeof state==='object')){
            field.clearValidateError(rule.name)
          }else{
            console.log('put Validate Error else:',rule.name, rule.message)
            field.putValidateError(rule.name, rule.message)
          }
          // (state === true)||(typeof state==='object') ?  : field.putValidateError(rule.name, rule.message);
          if(typeof state==='object'&&state.type==='confirm'){
            if(state.value===true||state.value==='true'){
              field.clearValidatePrompt(rule.name);
            }else if(typeof state.value==='string'&&state.value!=='true'){
              field.putValidatePrompt(rule.name, rule.message)
            }
          }
        });
      }

      // handle form level validators
      this.formValidators.forEach(validator => {
        this.handleFormRule(validator);
      })
    },

    handleFormRule(validator) {
      let ret = null;
      if (validator.js) {
        // noinspection JSUnusedLocalSymbols
        let form = this;
        
        let row = this.srvValFormModel();
        ret = eval("var zz=" + validator.js + "(row,form); zz");
      } else if (validator.func) {
        let row = this.srvValFormModel();
        ret = validator.func(row, this);
      }

      if (ret && ret.message) {
        // add validator errors to returned cols
        ret.cols.forEach(col => {
          let field = this.allFields[col];
          // console.log('put Validate Error ret:',validator.name, ret.message)
          field.putValidateError(validator.name, ret.message);
        });
      } else {
        // remove validator error of this rule name for all fields
        Object.values(this.allFields).forEach(field => {
          field.clearValidateError(validator.name);
        })
      }

    },


    /**
     *
     * @param rule
     * @param field
     * @returns {boolean} true for validate ok,
     */
    evalFieldRule(rule, field,fieldName,self) {
      let fieldSrvVal = field.getSrvVal();
      if(rule.name==='isValidValue'){
        if(field.finderSelected&&!fieldSrvVal){
          return {
            value:'false',
            type:'confirm'
          }
        }else{
          return {
            value:'true',
            type:'confirm'
          }
        }
      }
      if (rule.hasOwnProperty("pattern")) {
        let text = fieldSrvVal;
        if (!text) {
          return true;
        }
        var regex = RegExp(rule.pattern, 'g');
        let test = regex.test(text);
        return test;
      } else if (rule.hasOwnProperty("required")) {
        // console.log("eval Field Rule",field.info.label)
        return fieldSrvVal !== null && fieldSrvVal !== undefined && fieldSrvVal !== "";
      } else if(rule.hasOwnProperty("js_validate")){
        if(self.fields[fieldName].evalXIf()){ //如果显示当前字段
          var data = self.srvValFormModel()
          let result = null
          if(rule.js_validate){
            let js_validate = rule.js_validate
            let approval = null // 流程审批结果表单
            if(self.hasOwnProperty("approvalFormMode")){
              approval = self.approvalFormMode
            }
            
            result= eval('('+ js_validate + ')(data,approval)')
            if(typeof result ==='object'){
              if(result.hasOwnProperty('type')&&result.hasOwnProperty('value')){
                if(result.type==='validate'){
                  //警告 校验不通过将不能提交表单
                  if(typeof result.value==='string'&&result.value!=='true'){
                    rule.message=result.value
                    return false
                  }else if(result.value===true||result.value==='true'){
                    return true
                  }
                }else if(result.type==='confirm'){
                  //提示 不影响表单提交
                  // TODO 增加提示文字
                  if(typeof result.value==='string'&&result.value!=='true'){
                    rule.message=result.value
                  }
                  return result
                }
              }
            }else{
              // 按旧版本validate特性规则处理
              if(result===true){
                return result
              }else if(typeof result === 'string'){
                rule.message=result
                return false
              }
            }
            // // eval(rule.js_validate)
            // const validate = new Function('data',rule.js_validate)
            // if(validate&&typeof validate==='function'){
            //   result = validate (data)
            //   if(result===true){
            //     return result
            //   }else if(typeof result === 'string'){
            //     rule.message=result
            //     return false
            //   }
            // }
          }else{
            return true
          }
        }
      }else if (rule.hasOwnProperty("max")) {
        if (field.info.isNumeric()) {
          let number = Number.parseFloat(fieldSrvVal);
          return number <= rule.max;
        } else {
          let text = fieldSrvVal;
          return !text || text.length <= rule.max;
        }
      } else if(rule.hasOwnProperty("isValidFun")){
         // 通知 dynamic-sub-temp.vue 组件动态通知
          VueEvent.$emit('to-verify',true)
          if(rule.hasOwnProperty("valid")){
            console.log("rule.valid",rule.valid)
            return rule.valid
          }
      }else if(rule.encode==='en'&&rule.name==='ngMaxlength'&&rule.ngMaxlength){
        if(fieldSrvVal&&this.calcCharLength(fieldSrvVal)>Number(rule.ngMaxlength)){
          rule.message = `最多输入${rule.ngMaxlength}个字符,一个汉字占两个字符`
          return false
        }
        return true
      }else{
        // TODO: handle min
        return true;
      }
    },
    /**
   * 计算字符长度 一个中文算两个字符
   * @param {*} val 
   * @returns {number}
   */
  calcCharLength(val=''){
    val = val + ''
    //中文、中文标点、全角字符按1长度，英文、英文符号、数字按0.5长度计算
    let cnReg = /([\u4e00-\u9fa5]|[\u3000-\u303F]|[\uFF00-\uFF60])/g;
    let mat = val.match(cnReg);
    let length = 0;
    if (mat) {
      length = mat.length*2 + (val.length - mat.length);
    } else {
      length = val.length;
    }
    return length
    // var v = val;
    // if(v == "") return true;
    // var len = 0 ;
    // for (var i = 0; i < v.length; i++) {
    //     // 一个中文算两个字符
    //     var c = v.charCodeAt(i) > 255 ? 2 : 1;
    //     len += c;
    // }
    // return len
  }


  },
};
