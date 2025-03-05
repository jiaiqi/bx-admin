import { FieldInfo } from '../model/FieldInfo'
import { Field } from '../model/Field'
import Vue, { inject } from 'vue'
import { ActionInfo } from "../model/ActionInfo";
import { formatDate } from "../../util/DataUtil";
import remove from 'lodash/remove'
import isString from 'lodash/isString'
import { cloneDeep, get } from 'lodash';
export default {
  created: function () {
    window.forms = window.forms || {}
    window.forms[this.name] = this;
  },
  provide() {
    return {
      getSortedFields: () => this.sortedFields,
      getFormModel: () => this.formModel,
      getAllFields: () => this.allFields,
    };
  },
  props: {
    initOrigin: {
      type: String,
      default: 'none'
    },
    name: {
      type: String,
      default: "main"
    },

    service: {
      type: String
    },

    // for update/detail/add, it is loader's condition
    // for filter, it is default condition
    defaultConditions: {
      type: Array
    },

    // for update/add, it is form fields default value
    defaultValues: {
      type: Object
    },

    navAfterSubmit: {
      type: Boolean,
      default: true,
    },

    submit2Db: {
      type: Boolean,
      default: true,
    },

    overrideData: {
      type: Object,
    },

    overrideformType: {
      type: String
    },

    srvvalFormModelDecorator: {
      type: Function,
    },

    loaderServiceProp: {
      type: String,
    },
    parentAddMainFormDatas: {
      type: Object,
      default: function () {
        return null
      }
    },
    approvalFormMode: {
      type: Object,
      default: function () {
        return null
      }
    },
    pageIsDraft: {
      type: String,
      default: 'norm',
    },
    pageName: {
      type: String,
      default: ''
    },
    isHistory: {
      type: Boolean,
      default() {
        return false
      }
    },
    mainService: {
      type: String,
      default: "",
    },
    isPlatChildForm:{
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      isMarker: true,

      // the visible fields
      fields: {},

      historyData: [], //字段值修改历史记录

      allFields: {},

      actions: {},

      // validators involved multiple fields,
      formValidators: [],

      mainTable: null,

      srvCols: null,
      isFromLoaded: {
        loaded: false,
        text: "加载中..."
      },

      draftDataKey: {
        colName: 'id',
        value: null
      },
      formLoaded: false,
      visible: true,
      pagePrompt: {
        "title": "",
        "type": "success",
        "description": "<div style='color:red'></div>"
      },
      fieldHisotryPopup: false,
      draftConfig: null,
      srv_more_config: {},
      fieldWithHistory: null,
      isHistoryUse: false,
      colValChangeRequestCols: [],
      moreConfig: null,
      initValToCols: [],  //请求赋值col
      cfgJson: null,
      sectionsCollapse: {},
      pub_field_map: null, //公共字段映射
      formV2:null,
      childForm:[]
    }
  },


  computed: {
    cfgJsonOptionsType() {
      let json = this.cfgJson
      let options = json && json.hasOwnProperty('options') && json.options ? json.options : ""
      options = options.split(',')
      return options
    },
    isVerifyMobile: function () {
      let phoneSubKey = 'verifyMobile'
      let smsCodeSubKey = 'verifySmsCode'
      let list = this.fields || null
      let isVerify = false
      let phoneColName = ''
      let smsCodeColName = ''
      if (list) {
        console.log('isVerifyMobile', list)
        for (let key in list) {
          let feild = list[key]
          if (feild && feild.info.subType && feild.info.subType == 'verifyMobile') {
            phoneColName = feild.info.name
          }
          if (feild && feild.info.subType && feild.info.subType == 'verifySmsCode') {
            smsCodeColName = feild.info.name
          }
        }
      }

      if (phoneColName && smsCodeColName) {
        return { phoneColName, smsCodeColName }
      } else {
        return false
      }
    },
    loaderService: function () {
      if (this.loaderServiceProp) {
        return this.loaderServiceProp;
      } else if (this.mainTable) {
        let loaderService = this.mainTable.replace('bx', 'srv') + "_select";
        return loaderService
      } else {
        return null;
      }
    },

    sortedFields: function () {
      // return this.sortFields(this.fields);
      let allFields = this.sortFields(this.allFields)
      return allFields.filter(item => item.info.srvCol.in_cond == 1)

    },

    sortedAllFields: function () {
      return this.sortFields(this.allFields);
    },

    sections: function () {
      let sections = {};
      let fields = null;
      let section = null;
      for (let key in this.sortedAllFields) {
        let field = this.sortedAllFields[key];
        if (field.info && field.info.sec && field.info.sec !== section) {
          // close last section,
          if (fields) {
            sections[section || "$"] = fields;
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
        sections[section || "$"] = fields;
      }

      // hide section whose fields are all invisible
      let hideSections = new Set();
      for (let key in sections) {
        let sectionFields = sections[key];
        let visibleFields = sectionFields.filter(field => {
          return (field && field.evalVisible());
        })

        if (visibleFields.length == 0) {
          hideSections.add(key)
        }
      }

      hideSections.forEach(key => delete sections[key])

      // 把 field 组织成: majorField 和 contentFields， 服务一个form-item 包含多个fields
      let sectionsOfFormItems = {};
      for (let key in sections) {
        let fieldsInSection = sections[key];
        let isGroupedField = field => field.info.srvCol.group_field;
        let groupedFields = fieldsInSection.filter(isGroupedField)
        remove(fieldsInSection, isGroupedField);

        let formItems = fieldsInSection.map(majorField => {
          let contentFields = [majorField].concat(
            groupedFields.filter(groupedField => groupedField.info.srvCol.group_field === majorField.info.name)
          );
          return {
            field: majorField,
            contentFields: contentFields,
          }
        })
        sectionsOfFormItems[key] = formItems;
        // if(this.cfgJsonOptionsType.indexOf('分组默认折叠') !== -1){

        // }
        if (!this.sectionsCollapse.hasOwnProperty(key)) {
          // 没有初始化值得时候 进行
          if (key !== '$') {
            // 表单字段默认折叠配置初始化
            this.sectionsCollapse[key] = this.cfgJsonOptionsType.indexOf('分组默认折叠') !== -1
          } else {
            this.sectionsCollapse['$'] = false
          }
          let sectionsKeys = Object.keys(this.sectionsCollapse)
          if (sectionsKeys.length > 0) {
            this.sectionsCollapse[sectionsKeys[0]] = false
          }
        }


      }

      // console.log(sectionsOfFormItems)
      return sectionsOfFormItems;
    },
    isHistoryRun: function () {
      if (this.isHistory) {
        return this.isHistory
      } else {
        return this.isHistoryUse
      }
    },
    formModel: function () {
      let model = {};

      for (let key in this.fields) {
        model[key] = this.fields[key].model;
        if (Object.prototype.toString.call(model[key])) {
          model[key] = this.fields[key].getSrvVal()
          // 透传子表表单的主表model 
        }
      }

      return model;
    },
    "colValChangeRequestColsRun": function () {
      let colValRequest = this.srv_more_config.hasOwnProperty('colValRequest') ? this.srv_more_config.colValRequest : null
      let reqs = this.bxDeepClone(colValRequest)


      let cols = this.colValChangeRequestCols
      let formModel = this.formModel
      for (let r of reqs) {
        let cond = r.condition
        for (let c of cond) {
          for (let col of cols) {
            if (col == c["colName"]) {
              c.value = formModel[col]
            }
          }
        }
      }

      return reqs
    }


  },


  methods: {
    onChildFormLoaded(form){
      this.childForm.push(form)
    },
    onSectionsCollapseChange(key) {
      let self = this
      if (key && this.cfgJsonOptionsType.indexOf('分组默认折叠') !== -1 && key !== '$') {
        console.log('0', key, self.sectionsCollapse[key], self.sectionsCollapse)
        self.$set(self.sectionsCollapse, key, !this.sectionsCollapse[key])
        this.$forceUpdate()
        console.log('1', key, self.sectionsCollapse[key], self.sectionsCollapse)
      }

    },
    getSectionShow(key) {
      return this.sectionsCollapse[key]
    },
    initColValRequest() {
      let self = this
      let conditionCol = self.colValChangeRequestCols

      let moreConfig = self.srv_more_config

      let initValToCols = self.initValToCols
      if (moreConfig && moreConfig.hasOwnProperty("colValRequest") && moreConfig.colValRequest) {
        moreConfig = moreConfig.colValRequest
        // self.initValToCols = moreConfig[0].colNames
        for (let key of moreConfig) {
          for (let ckey of key.condition) {
            if (conditionCol.indexOf(ckey.colName) == -1) {
              conditionCol.push(ckey.colName)
            }
          }
          for (let c of key.colNames) {
            if (initValToCols.indexOf(c) == -1) {
              initValToCols.push(c)
            }
          }

        }
        // this.colValRequest(moreConfig.colValRequest)
      }
    },
    getColValRequests() {
      let self = this
      let moreConfig = self.srv_more_config ? self.srv_more_config.colValRequest : self.srv_more_config
      let reqs = this.bxDeepClone(moreConfig[0])
      let cols = this.colValChangeRequestCols
      let fieldModel = this.formModel
      let initReqs = []
      let fields = this.allFields
      let valids = []
      for (let cond of reqs.condition) {
        for (let f in fieldModel) {
          if (cond.colName == f) {
            cond.value = this.fields[f].getSrvVal()
          }
        }
      }
      // console.log("valids === ;",cols,valids)
      console.log("valids === 2;", cols.length, valids.length)
      delete reqs['srvApp']
      let url = this.getServiceUrl('select', reqs.serviceName, reqs.srvApp ? reqs.srvApp : null)
      this.$http.post(url, reqs).then((res) => {
        console.log(res)
        // let datas = res.data[0]
        if (res) {
          this.setColValRequestsVal(res)
        } else {
          console.log('colValRequest 发生异常', res)
        }

        console.log("getColValRequests", reqs, res)
      })


    },
    setColValRequestsVal(e) {
      let self = this
      let res = e.data.data[0]
      let initValToCols = self.initValToCols
      // let 
      let moreConfig = self.srv_more_config.colValRequest
      console.log("setColValRequestsVal", res, moreConfig)
      let fields = this.fields

      for (let k of moreConfig) {
        for (let r in res) {
          for (let f in fields) {
            if (r == f) {
              fields[r].setSrvVal(res[r])
            }
          }

        }
      }

    },
    onFieldHistoryPopup(field) {
      this.isXhtml = field.info.editor == 'ueditor'
      this.fieldHisotryPopup = true;
      this.fieldWithHistory = field;
    },
    getFormDatas() {
      return this.formModel
      // return  this.bxDeepClone(this.srvValFormModel()) 

    },
    getParentFormModel() {
      return this.parentAddMainFormDatas
    },
    evalVisible() {
      return this.evalVersatileFlagVar(this.visible)
    },

    formatSection: function (section) {
      return section && isString(section) && section.startsWith('$') ? "" : section;
    },

    srvValFormModel: function () {
      let model = {};

      for (let key in this.fields) {
        // console.log(this.fields[ key ].getSrvVal())
        model[key] = this.fields[key].getSrvVal() !== undefined && this.fields[key].getSrvVal() !== null ? this.fields[key].getSrvVal() : null;

      }

      if (this.srvvalFormModelDecorator) {
        let decorator = this.srvvalFormModelDecorator;
        decorator(model);
      }
      this.$emit("form-model-changed", model)
      return model;
    },


    isLoaded: function () {
      return this.formLoaded;
    },
    onIsLoaded: function (e) {
      // 控制页面加载中
      let self = this

      if (e === 'get') {
        return self.isFromLoaded
      } else {
        self.isFromLoaded = e || self.isFromLoaded
        return self.isFromLoaded
      }
    },
    resDataKey(e) {
      self.draftDataKey = e
    },
    /**
     * 3 sources of conditions, order from priority high to low
     * query string, props.defaultConditions, pk/pkcol,
     * @returns {{colName: (default.props.pkCol|{type}|string), ruleType: string, valueFunc: (function(*): (default.props.pk|{type}|*))}}
     */
    buildConditions: function () {
      let operateParams = this.getOperateParams();
      /**
       * 2023/09/18 wyh
       * 表单页面增加 参数 ：initOrigin 缺省值  'none' 
       * 列表公共编辑弹窗 / 自定义'更新弹出' ：initOrigin 默认值：'dialog'
       * 表单页面 initOrigin 值 等于 'dialog' 时不适用url参数
       * 
       * 解决 从fk字段超链接详情 子表 卡片单元弹出修改使用了 超链接url的外键 conditions 造成 该条件 错误修改了多少数据。 
       */
      if (operateParams && this.parentPageType !== 'detaillist' && !['dialog'].includes(this.initOrigin)) {

        /**
         * 排除 指定为 dialog  表单使用 url参数输入  && !['dialog'].includes(this.initOrigin)
         */
        let params = JSON.parse(operateParams);
        if (params.condition && params.condition.length > 0) {
          // 修复bug:对于详情子表的数据，删除和修改服务，有时候会出现条件参数不是id的条件去调用服务 
          let conditions = params.condition;
          let form = this;
          // let onlyCondition = {
          //   colName: this.pkCol || 'id',
          //   ruleType: 'eq',
          //   required: true,
          //   valueFunc: _ => {
          //     return form.pk || form.$route.params.id;
          //   }
          // }
          // if( form.pk || form.$route.params.id){
          //   conditions.push(onlyCondition)
          // }
          return this.literalConditions2Conditions(conditions);
        }
      }

      if (this.defaultConditions && this.defaultConditions.length > 0) {
        return this.literalConditions2Conditions(this.defaultConditions);
      } else if (this.pk) {
        let form = this;
        let onlyCondition = {
          colName: this.pkCol || 'id',
          ruleType: 'eq',
          required: true,
          valueFunc: _ => {
            return form.pk || form.$route.params.id;
          }
        }

        return [onlyCondition];
      } else {
        return null;
      }
    },

    literalConditions2Conditions(literalConditions) {
      const conditions = literalConditions.map(a => Object.assign({}, a));
      for (let i in conditions) {
        conditions[i].valueExpr = `'${conditions[i].value}'`;
        if (conditions[i].literalValue === true) {
          conditions[i].valueExpr = conditions[i].value;
        }
      }
      return conditions;
    },
    /**
     * default values from 2 sources: querystr, props.defaultValues
     * use url params to change metadata
     */
    setFieldsDefaultValue: function () {
      let self = this
      if (this.isTopComp() && this.getOperateParams()) {
        // if (this.getOperateParams()) {
        let params = JSON.parse(this.getOperateParams());
        if (params.data && params.data.length > 0) {
          let row = params.data[0];
          for (let key in row) {
            let field = this.fields[key];
            if (field) {
              field.setSrvVal(row[key]);
            }
          }
        }
      } else if (this.defaultValues) {
        let row = this.defaultValues;
        for (let key in row) {
          let field = this.fields[key];
          if (self.name === 'list-duplicate') {
            if (field) {
              field.setSrvVal(row[key]);
            }
          } else {
            if (field && !field.info.redundant) {
              field.setSrvVal(row[key]);
            } else if (field) {
              field.setSrvVal(row[key]);
            }
          }

        }
      }
    },

    sortFields: function (fields) {
      let fieldList = [];
      let transferField = null // 穿梭框字段
      for (let key in fields) {
        if (this.formType == 'add' && fields[key]?.info?.subType === 'transfer') {
          transferField = fields[key]
          transferField.isTransfer = true
          transferField.info.isTransfer = true
          transferField.info.colspan = {
            xs: 24,
            sm: 24,
            md: 24,
            lg: 24,
            xl: 24,
          }
        } else {
          fieldList.push(fields[key]);
        }
      }
      fieldList.sort((a, b) => a.info.seq - b.info.seq);
      if (transferField) {
        fieldList = fieldList.map(item => {
          if (item.info?.redundant?.dependField === transferField.info.name) {
            // 隐藏掉 依赖transfer的字段
            item.dependField = transferField.info.name
            item.evalXIf = () => false
          }
          return item
        })
        fieldList.push(transferField)
      }
      return fieldList;
    },
    getSubFormFields: async function (finalOption, useType, f, fi, srvCol) {
      if (!finalOption?.serviceName) return
      console.log('getSubFormFields:finalOption', finalOption);
      let cfg = finalOption[`${useType}_srv_cfg`]
      if (useType === 'detail') {
        cfg = {
          srv: finalOption.serviceName,
          permission: true,
          app: finalOption.srv_app || finalOption?.add_srv_cfg?.app || add_srv_cfg?.update_srv_cfg?.app || this.resolveDefaultSrvApp()
        }
      }
      if (cfg) {
        let filter = (srvCol) => srvCol[`in_${useType}`] != 0
        if (useType === 'detail') {
          filter = (srvCol) => srvCol[`in_detail`] === 1
        }
        // 查找字段
        f.flatChildForm = true // 平铺显示子表
        return
        fi.sec = fi.label
        const app = cfg.app || this.resolveDefaultSrvApp()
        const response2 = await this.loadColsV2(cfg.srv, useType, app);
        if (Array.isArray(response2.data?.data?.srv_cols) && response2?.data?.data.srv_cols.length > 0) {
          response2.body.data.srv_cols.forEach(item => {
            // 标记当前字段是子表需要随主表一起提交的字段
            if (item.columns?.indexOf('_child_form_') === -1) {
              item.columns = `${fi.name}_child_form_${item.columns}`
            }
            item.seq = srvCol.seq + 0.0000001 * item.seq // 让子表单字段在fk字段之后
            let cfi = new FieldInfo(item, this.formType);
            let cf = new Field(cfi, this);
            cf.flatChildFormField = true
            cf.vif = !(filter && !filter(item))
            cf.parentField = fi.name
            if (fi.editor == 'multiselect') {
              f.model = [];
            }
            Vue.set(this.allFields, cfi.name, cf);
            (cf.vif) && Vue.set(this.fields, cfi.name, cf);
          })
          if (this.buildDependentFields) {
            this.buildDependentFields(this.fields);
          }
        }
      } else {
        fi.sec = null
        // f.flatChildForm = false // 平铺显示子表
      }
      return f
    },
    deleteChildFormFields: async function (key = '') {
      return await new Promise((resolve) => {
        const keys = Object.keys(this.allFields)
        Object.keys(this.allFields).forEach((key2, index) => {
          if (key) {
            if (key2.startsWith(`${key}_child_form_`)) {
              this.$set(this.allFields[key2], 'vif', false)
            }
          } else if (key2.includes(`_child_form_`)) {
            this.$set(this.allFields[key2], 'vif', false)
          }
          if (index === keys.length - 1) {
            this.$forceUpdate()
            resolve()
          }
        })
      })
    },
    setSubFormFields: async function (newVal, oldVal, onModelChange = false) {
      // 处理fk字段子表单平铺展示 目前只有add表单支持
      console.log('setSubFormFields:start');
      const useType = this.overrideformType == undefined ? this.formType : this.overrideformType;
      if (['add', 'detail','update'].includes(useType) && typeof this.allFields === 'object' && Object.keys(this.allFields)?.length) {
        const data = this.formModel
        const hasChildFormFields = []
        for (let key in this.allFields) {
          const field = this.allFields[key]
          const srvCol = field.info.srvCol
          const fi = field.info;
          // if (key.includes('_child_form_')) {
          //   continue
          // }
          if (Array.isArray(srvCol?.option_list_v3) && srvCol?.option_list_v3.length) {
            const option_list_v3 = srvCol.option_list_v3.filter(item => item.view_model === '平铺显示' && item?.allow_input === '自行输入')
            if (option_list_v3.length) {
              hasChildFormFields.push(field.info.name)
            }
          }
        }

        if (hasChildFormFields?.length) {
          // console.log('hasChildFormFields:',hasChildFormFields);
          hasChildFormFields.forEach( (key) => {
            const field = this.allFields[key]
            field.flatChildForm = true // 平铺显示子表
            // console.log('hasChildFormFields flatChildForm:',field.info.name);
            
            this.$set(field,'flatChildForm',true)
          })
          for (let key of hasChildFormFields) {
            // const fi = item.fieldInfo
            // const srvCol = item.srvCol
            // const field = this.allFields[key]
            // field.flatChildForm = true // 平铺显示子表
            // console.log('hasChildFormFields flatChildForm:',field.info.name);
            
            // this.$set(field,'flatChildForm',true)
            return
            const option_list_v3 = item.option_list_v3
            const finalOption = option_list_v3.find(item => {
              if (!item.conds?.length) {
                return true
              } else {
                const conds = item.conds.filter(cond => {
                  if (onModelChange === true) {
                    // 仅在相关字段值变化时触发
                    return newVal?.[cond.case_col] !== oldVal?.[cond.case_col]
                  }
                  return true
                })
                if (!conds.length) return false
                this.deleteChildFormFields(fi.name)
                return conds.every(cond => {
                  // 满足条件外键显示需求
                  if (cond.case_val?.includes?.(data[cond.case_col])) {
                    return true
                  } else {
                    return false
                  }
                })
              }
            })
            await this.getSubFormFields(finalOption, useType, f, fi, srvCol)
          }
        }
      }
      return this.fields
    },
    /**
     * 从后端获取service cols，转换为fields;
     * filter 为字段过滤器， 类型为(srvCol) => boolean
     */
    createFields: async function (filter, srvCols, app) {
      let srvColsProvided = !!srvCols;
      let self = this
      let useType = this.overrideformType == undefined ? this.formType : this.overrideformType;
      let srvColsP = srvCols ? Promise.resolve({ body: { data: { srv_cols: srvCols } } }) :
        this.loadColsV2(this.service_name, useType, app, this.mainService);
      const response = await srvColsP
      // .then((response) => {
      let data = response.body.data;
      this.mainTable = data.main_table;
      this.formV2 = data
      /**
       * pagePrompt 页面配置信息处理
       */
      // console.log(response)

      if (data.more_config !== null && data.more_config !== undefined && data.more_config !== "") {
        self['srv_more_config'] = JSON.parse(data.more_config)
        let colValChangeRequestColsDatas = self.srv_more_config.hasOwnProperty("colValRequest") ? self.srv_more_config.colValRequest[0].condition : []
        self.colValChangeRequestCols = colValChangeRequestColsDatas.map((item) => {
          return item.colName
        })
        self.initValToCols = self['srv_more_config'].hasOwnProperty('colValRequest') ? self['srv_more_config'].colValRequest[0].colNames : []
        self.isHistoryUse = data.his_version
        self.pagePrompt = self.srv_more_config.pagePrompt !== undefined ? self.srv_more_config.pagePrompt : null;
        self.draftConfig = self.srv_more_config.isDraft !== undefined ? Object.assign(self.srv_more_config.isDraft, { isDraft: true }) : { isDraft: false };
      } else {
        self.pagePrompt = false
        self.draftConfig = null
      }
      this.$emit('srv-config-loaded', self['srv_more_config'])

      let listData = data.srv_cols;
      this.srvCols = listData;
      if (data.pub_field_map) {
        // 字段映射
        this.pub_field_map = data.pub_field_map;
      }
      for (var i = 0; i < listData.length; i++) {
        let srvCol = listData[i];
        let fi = new FieldInfo(srvCol, this.formType);
        let f = new Field(fi, this);
        f.vif = !(filter && !filter(srvCol))
        // hack
        // if (fi.name == "id") {
        //   fi.visible = false;
        // }
        if (fi.editor == 'multiselect') {
          f.model = [];
        }
        Vue.set(this.allFields, fi.name, f);
        (f.vif) && Vue.set(this.fields, fi.name, f);
      }


      if (data.validators) {
        for (let i in data.validators) {
          this.formValidators.push({
            name: `validator-${i}`,
            js: data.validators[i].in_table_validate,
          })
        }
      }

      if (this.buildDependentFields) {
        this.buildDependentFields(this.fields);
      }


      if (data.hasOwnProperty('cfg_no') && data.cfg_no && data.cfg_json) {
        this.cfgJson = JSON.parse(data.cfg_json)
      }
      return response.body;
      // });
    },


    createActions: function (formButtons) {

      let form = this
      // formButtons = formButtons.filter(item => this.pageIsDraft == 'norm' && item.button_type !== "save_draft" && item.button_type !== 'update_draft')
      for (let i in formButtons) {
        let button = formButtons[i]
        if (!button.permission) {
          continue;
        }

        let actionInfo = null;
        let buttonType = button.button_type;
        if (buttonType == "submit" && this.addSubmitAction) {
          actionInfo = this.addSubmitAction(button);
        } else if (buttonType == "reset" && this.addResetAction) {
          actionInfo = this.addResetAction(button);
        } else if (buttonType == "edit") {
          if (this.formType == "detail") {
            actionInfo = this.addNav2UpdateAction(button);
          } else if (this.formType === "update") {
            actionInfo = this.addSubmitAction(button);
          }
        } else if (buttonType == "refresh") {
          actionInfo = form.addNav2refreshAction(button)
        } else if (buttonType == "save_draft") {
          actionInfo = form.saveDraft(button);
        } else if (buttonType == "update_draft") {
          actionInfo = this.saveDraft(button);
          // 已废弃
        } else if (buttonType == "customize") {

          let operate_params = JSON.parse(button.operate_params)
          /**
           * 处理自定义按钮保存草稿
           */
          if (operate_params && operate_params.draft !== undefined && operate_params.draft) {
            actionInfo = this.saveDraft(button)
          } else {
            let customAction = new ActionInfo(button, "form")
            actionInfo = customAction;
            let actionName = "custom-" + button.id + '-' + button.button_name;
            Vue.set(this.actions, actionName, customAction);
            let form = this;
            customAction.name = actionName
            if (button.more_config) {
              const btn_more_config = JSON.parse(button.more_config)
              if (btn_more_config.isCheck) {
                button["isVisibleForm"] = btn_more_config.isCheck
                customAction.precheckFunc = _ => {
                  return this.validateForm();
                }
              }
            }
            customAction.invokeFunc = _ => {
              let callback = null;
              if (form.formType === 'detail') {
                callback = () => {
                  // 详情页 刷新页面
                  form?.$refs?.loader?.run?.()
                }
              }
              form.customizeOperate(button, [this.srvValFormModel()], callback);
            }

          }

        }

        // common handle for  button attribute override
        if (button.action_validate) {

          actionInfo.customPrecheckFunc = () => {
            return this.evalActionValidator(button.action_validate, form.srvValFormModel())
          }
        }

        if (button.disp_exps) {
          actionInfo.visibleFunc = () => {
            return this.evalBxExpr(button.disp_exps, form.srvValFormModel())
          }
        }

        if (button.visible === "否" || (form.formType == 'update' && form.parentPageType === 'list' && form.pageIsDraft !== 'draft' && (buttonType == "update_draft" || buttonType == 'save_draft'))) {
          actionInfo.visibleFunc = () => {
            return false
          }
        }


        actionInfo.seq = button.seq;
        actionInfo.label = button.button_name;
        if (actionInfo.executor) {
          actionInfo.executor.service = button.service_name;
        }
      }
    },

    /**
     * 把表单字段绑定到executor.values
     */
    bindExecutorValues: function (executor) {
      // bind executor and field
      executor.service = this.service_name;

      let form = this;
      for (let i in this.fields) {
        let valueItem = {};
        let field = this.fields[i]
        valueItem.colName = field.info.name
        valueItem.valueFunc = _ => {
          return form.fields[field.info.name].getSrvVal();
        };

        // auto_gen field is not addable or updatable
        if (field.info && field.info.srvCol && field.info.srvCol.auto_generate) {
          valueItem.enableFunc = _ => {
            return false
          };
        }

        executor.values.push(valueItem)
      }
    },


    onFieldValueChanged: function (fieldName) {
      // 子表change 事件监听，回收
      console.log('onFieldValueChanged')
      let self = this
      // console.log('onFieldValueChanged fieldName',this.fields[fieldName].info.label,this.fields[fieldName],this.fields[fieldName].model)
      if (this.formLoaded) {

        let field = this.fields[fieldName];

        if (field['_obj_col']?.col) {
          // fk字段值改变后，更新其option_list_v3中配置的的a_save_b_obj_col
          console.log('onFieldValueChanged-_obj_col', field['_obj_col']);
          if (this.fields[field['_obj_col']?.col]) {
            this.fields[field['_obj_col']?.col].model = field['_obj_col']?.val
          }
        }

        // 处理下游游字段变化 field a -> b,  when a is null, and b is changed, set a
        if (field.info.upstream) {
          let upstreamField = this.fields[field.info.upstream.field];
          if (!upstreamField.model) {
            let refCol = field.info.upstream.refCol;
            if (field.model && field.model[refCol]) {
              upstreamField.setSrvVal(field.model[refCol]);
            }
          }
        }
        /**
         * 处理起止日期值分离同步
         */
        let DateRangeEndCol = field.info._DateRangeEndColName
        if (field.info.editor === "DateRange" && DateRangeEndCol !== null) {
          if (field.hasOwnProperty('_DateRangeModel') && field._DateRangeModel !== null) {
            field.model = field._DateRangeModel[0]
            if (DateRangeEndCol !== undefined) {
              let endCol = this.fields[DateRangeEndCol]

              endCol.model = field._DateRangeModel[1]// endCol.model = field._DateRangeModel[1]
            }
          }
        }
        self.handleValidation(fieldName);
        if (self.hasOwnProperty('handleFieldFkRedundant')) {
          self.handleFieldFkRedundant(field, this.fields)
        }
        // this.handleFieldFkRedundant && this.handleFieldFkRedundant(field, this.fields);
        for (let f of self.colValChangeRequestCols) {
          if (f === fieldName) {
            self.getColValRequests()
          }
        }
      }
    },

    /**
     * 把 loader的返回结果填充到fields
     */
    onLoaderComplete: function ({ data, resp }) {
      let listmap = data;
      if (!listmap || !listmap[0]) {

        this.$emit("form-load-nodata")
        this.$emit("detail-form-load-nodata")
        return;
      }

      let map = listmap[0]
      this.encryptedCols = map['_encrypt_cols'] || [] // 数据已加密的字段
      for (let key in map) {

        if (this.fields[key]) {
          this.fields[key].setSrvVal(map[key])
        }

      }
      for (let k in this.fields) {
        if (this.fields[k].info.editor === 'DateRange') {
          if (this.fields[k].info._DateRangeEndColName !== null) {
            this.fields[k]._DateRangeModel = []
            this.fields[k]._DateRangeModel.push(this.fields[k].model)
            this.fields[k]._DateRangeModel.push(this.fields[this.fields[k].info._DateRangeEndColName].model)
          }
        }
        for (let c in this.encryptedCols) {
          // 加密字段设置为只读 
          if (this.fields[k].info.name === this.encryptedCols[c]) {
            this.fields[k].info.readonly = true
          }
        }
        if ((this.fields[k].info.editor === 'upload-file' || this.fields[k].info.editor === 'upload-image') && (this.pageName === 'list-duplicatedeep' || this.pageName == 'list-duplicate')) {
          this.fields[k].setSrvVal('')
        }
      }
      // 把历史数据放到 field
      if (resp.data.his_data && resp.data.his_data.length > 0) {
        let historyOfRow = resp.data.his_data[0];
        if (Array.isArray(historyOfRow) && historyOfRow.length > 0) {
          this.historyData = historyOfRow
            .filter(
              (item, index) =>
                index === 0 ||
                (Array.isArray(item._diff_cols) &&
                  item._diff_cols.length > 0)
            )
            .reduce((res, cur) => {
              const index = res.findIndex(
                (item) => item.modify_time === cur.modify_time
              );
              if (index > -1) {
                res[index].list.push(cur);
              } else {
                res.push({
                  ...cur,
                  _create_user: cur.create_user_disp || cur.create_user,
                  _date_time: formatDate(cur.modify_time, "datetime"),
                  modify_time: cur.modify_time,
                  list: [{ ...cur }],
                });
              }
              return res;
            }, [])
        }


        Object.values(this.fields).forEach(field => {
          let hisOfField = historyOfRow
            .filter(ver => {
              if (field.info.name === 'biz_path') {
              }
              let firstRow = historyOfRow.indexOf(ver) == 0;
              let changed = ver._diff_cols.includes(field.info.name);
              return firstRow || changed
            })
            .map(ver => {
              let value = ver[field.info.name];
              if (field.info.isTemporal() && value !== '******') {
                value = formatDate(value, field.info.type.toLowerCase(), field.info.format);
              }

              return {
                value: value,
                remark: ver._data_desc
              }
            });

          this.$set(field, "historyData", hisOfField);
        })

      }

      if (this.encryptedCols && Array.isArray(this.encryptedCols)) {
        // 老版加密数据处理逻辑，已废弃
        // 如果当前数据为敏感数据，因为值为******, 则没有看的权限，进而不可编辑
        if (map._sensitive_data === true) {
          this.encryptedCols.forEach(col => this.fields[col] && this.fields[col].setNoPerm4Sensi(true))
        }

        // 如果_sensitive_data_update === false，则当前行敏感字段不可编辑
        if (map._sensitive_data_update === false) {
          this.encryptedCols.forEach(col => this.fields[col] && (this.fields[col].info.editable = false))
        }
      }

      let loader = this.$refs.loader;
      if (loader && loader.loadCount == 1) {
        this.setFieldsDefaultValue();
      }
    },

    watchFormModel: function () {
      let form = this;
      this.$watch(function () {
        return form.srvValFormModel();
      },
        function (newVal, oldVal) {
          if (newVal !== oldVal) {
            form.handleRedundantOnFormModelChange(newVal, oldVal, this.fields, _ => form.srvValFormModel());
            if (form.formModelChangeHandler) {
              form.formModelChangeHandler(form);
            }
            this.setSubFormFields(newVal, oldVal, true)
            form.$emit("form-model-changed", this)
          }

        }, {
        immediate: true,
        deep: true
      })
    },
    getDateRangExpr: function (infoObj, e) {
      /**
          * 处理子表默认值 引用主表from
          */
      let m = {
        min: null,
        max: null
      }
      if (infoObj.hasOwnProperty('moreConfig') && infoObj.editor === "DateRange" && infoObj.moreConfig.hasOwnProperty('DateRangeConfig')) {
        let mainData = e
        let cfg = infoObj.moreConfig.DateRangeConfig
        if (cfg.hasOwnProperty('minDate')) {
          if (cfg.minDate !== '' && cfg.minDate !== null && cfg.minDate !== undefined) {
            if (cfg.minDate.indexOf('{') !== -1 && cfg.minDate.indexOf('}') !== -1) {
              let minexp = cfg.minDate.match(/{(\S*)}/)[1]
              m.min = eval(minexp)
              if (m.min === null || m.min === undefined) {
                m.min = '1990-01-01'
              }
            } else {
              m.min = cfg.minDate
            }
          } else {
            m.min = '1990-01-01'
          }
        } else {
          m.min = '1990-01-01'

        }
        if (cfg.hasOwnProperty('maxDate')) {
          if (cfg.maxDate !== '' && cfg.maxDate !== null && cfg.maxDate !== undefined) {
            if (cfg.maxDate.indexOf('{') !== -1 && cfg.maxDate.indexOf('}') !== -1) {
              let maxexp = cfg.maxDate.match(/{(\S*)}/)[1]
              m.max = eval(maxexp)
              if (m.max === null || m.max === undefined) {
                m.max = '2050-12-30'
              }
            } else {
              m.max = cfg.maxDate
            }
          } else {
            m.max = '2050-12-30'
          }
        } else {
          m.max = '2050-12-30'
        }

      }
      return m
    }

  },
  watch: {
    "sectionsCollapse": {
      deep: true,
      handler: function (n, o) {
        console.log('sectionsCollapse change ', n)
      }
    }
  }
};
