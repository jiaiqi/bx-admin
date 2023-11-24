// import paramsModelsMixin from '@/common/paramsModelsMixin.js';
export default {
  data() {
    return {
      cellData: [{

      }],
      componentParamsModels: null
    };
  },
  // mixins: [paramsModelsMixin],
  components: {},
  props: {
    pageParams: {
      type: [Array, Object]
    },
    pageItem: {
      type: Object
    },
    pageItemParams: {
      type: Object
    },
    pageParamsModel: {
      type: Object,
      default () {
        return {}
      }
    },
    "pageNo": {
      type: String
    }

  },

  computed: {
    comParamsLoaded: function() {
      // 校验组件参数是否转载完成
      let type = this.compType
      let params = this.compInitParams
      let loading = false
      switch (type) {
        case 'list':
          break;
        case 'form':
          if (params && params.hasOwnProperty('type') && params.hasOwnProperty('serviceName')) {
            loading = true
          }
          break;
        default:
          loading = true
          break;
      }
      if (loading) {
        console.log('comloading SUCCESS:', this.pageItem.com_name, params)
      } else {
        console.error('comloading ERROR:', this.pageItem.com_name, params)
      }
      return loading
    },
    comDataFormType: function() {
      //  数据源从哪里来，比如从用户信息来？
      let jsons = this.pageItem?.com_para_with_map_json
      let modeParamsFormType = {}
      let type = []
      if (jsons && jsons.length > 0) {
        for (let p of jsons) {
          let src = p.src_map

          for (let s of src) {
            modeParamsFormType[p.para] = s.from_type
          }
        }
      }
      // for(let val of modeParamsFormType){
      //  type.push(val)
      // }
      // type = Array.from(new Set(type));
      return type
    },
    comColMapRun: function() {
      // 1.0版本 字段col 部件映射
      let jsons = this.pageItem?.com_para_with_map_json || this.pageItem?.cols_map_json
      // let maps = this.paramsBuild(json)?.target?.com || {}
      let maps = {}

      if (this.serviceName == 'srvwuliu_car_select' && this.componentParamsModels && this.compType == 'currentInfo') {
        maps = {
          "title_col_name": this.componentParamsModels.title_col_name,
          "subtitle_col_name": this.componentParamsModels.subtitle_col_name,
          "image_col_name": this.componentParamsModels.image_col_name,
        }
      } else if (jsons && jsons.length > 0) {
        for (let p of jsons) {
          let src = p.src_map
          maps[p.para] = p.para
          for (let s of src) {
            maps[p.para] = s.col_from
          }
        }
      }
      return maps || {}
    },
    compType: function() {
      // 组件类型
      let type = this.pageItem?.com_type || this.pageItem?.com_type
      return type || ''
    },

    cardLayoutJson: function() {
      // 组件布局 单元、部件
      let json = this.pageItem?.card_group_json?.card_layout_json || {}
      let compType = this.compType

      switch (compType) {
        case 'currentInfo':
          json = this.pageItem?.current_info_json?.tmpl_card_unit_json
          break;
        default:
          break;
      }
      return json
    },
    datasfromType: function() {
      let cfgfrom = this.pageItem.card_unit_cfg_from || '静态配置'
      switch (cfgfrom) {
        case '模板动态加载':
          return this.pageItem?.srv_req_type
          break;
        default:
          break;
      }
    },
    fromType: function() {
      let cfgfrom = this.pageItem.card_unit_cfg_from || ''
      return cfgfrom
    },
    cellsLayoutJson: function() {
      let cfgfrom = this.pageItem.card_unit_cfg_from
      let cells = []
      switch (cfgfrom) {
        case '静态配置':
          cells = this.pageItem?.card_unit_merge_json || [this.pageItem?.card_group_json?.card_unit_json]
          break;
        case '模板动态加载':
          cells = this.pageItem?.card_group_json?.card_unit_json ? [this.pageItem?.card_group_json?.card_unit_json] :
            []
          break;
        default:
          let compType = this.compType

          switch (compType) {
            case 'currentInfo':
              cells = this.pageItem?.current_info_json?.tmpl_card_unit_json ? [this.pageItem?.current_info_json
                ?.tmpl_card_unit_json
              ] : []
              break;
            default:
              break;
          }
          break;
      }
      return cells
    },
    srvReq: function() {
      let self = this
      let params = this.componentParamsModels ? this.bxDeepClone(this.componentParamsModels) : {};
      if (this.pageParamsModel && typeof this.pageParamsModel === 'object') {
        params = {
          ...this.pageParamsModel,
          ...params
        }
      }
      // let page = this.bxDeepClone(this.page)
      let req = this.bxDeepClone(this.pageItem?.srv_req_json) || {}
      let conds = []
      const globalParams = {
        ...params,
        user_no: sessionStorage.getItem('login_user_info')?.user_no,
        userInfo:  sessionStorage.getItem('login_user_info'),
      }
      if (req.hasOwnProperty('condition') && req.condition.length > 0) {
        for (let cond of req.condition) {
          let condModel = this.bxDeepClone(cond)

          if (cond && condModel.value && condModel.value.indexOf('${') !== -1 && condModel.value.indexOf('}') !== -
            1 && params) {
            if (this.renderStr(condModel.value, globalParams)&&this.renderStr(condModel.value, globalParams).indexOf('[object')==-1) {
              condModel.value = this.renderStr(condModel.value, globalParams)
            } else {
              let key = condModel.value
              var sreg = new RegExp("\\${", "g"); // 加'g'，删除字符串里所有的"a"
              var ereg = new RegExp("\}", "g"); // 加'g'，删除字符串里所有的"a"
              key = key.replace(sreg, "");
              key = key.replace(ereg, "");
              console.log('--srvReq', params, key)
              condModel.value = params && params.hasOwnProperty(key) ? params[key] : ""
              if (condModel.value?.value) {
                condModel.value = condModel.value.value
              }
            }

          }
          conds.push(this.bxDeepClone(condModel))

        }
        req.condition = conds.map(item => item)
      }
      let type = this.comType
      switch (type) {
        case 'list':
          // let rowNumber = req.page
          // self.$set(self.page,'rownumber',rowNumber.rownumber)
          // console.log('page no',self.page)
          // req['page'] = page

          break;
        default:
          break;
      }

      return req
    },
    serviceName: function() {
      let srv = this.srvReq?.serviceName || ''
      return srv
    }
  },

  methods: {
    // Vue.prototype.
    paramsBuild(json){
      if (!json) {
        return
      }
      let configJson = json
      //  url   sys user page com srv_col srv_cond
      let target = configJson?.dest_owner // 目标
      let source = configJson?.src_owner // 源
      let map = configJson?.cols_map_json || {}
      let maps = {
        target: {},
        source: {}
      }
      maps['target'][target] = map
      return maps


    },
    refreshComponent() {
      // console.log('page item component srvReq updated! refresh component:',this.pageItem.com_type,this.pageItem.com_name)
      let type = this.compType
      if ((type == 'list' || type == 'form' || type == 'cardGroup') && this.hasOwnProperty('refresh')) {
        this.refresh()
      }

    },
    initItemParams() {
      let itemParams = {}
      let type = this.compType
      switch (type) {
        case value:
          break;
        default:
          break;
      }
      // 	if (!this.urlSearchParams || Object.keys(this.urlSearchParams).length === 0) {
      // 		this.pageParams.forEach(item => {
      // 			item.value = item.default_val || ''
      // 		})
      // 	} else if(this.pageParams){
      // console.log(this.pageParams,this.urlSearchParams)
      // for(let param of this.pageParams){
      // 	for (let key in this.urlSearchParams) {
      // 		if (key == param.para_name && this.urlSearchParams[key]) {
      // 			param.value = this.urlSearchParams[key]
      // 		}
      // 	}
      // }
      // 	}
    },

  },
  mounted() {
    // if (this.serviceName) {
    //   this.loading = true
    //   this.getListV2().then(_ => {
    //     this.refresh().then(_ => {
    //       this.loading = false
    //     })
    //   });
    // }
    this.$on('refresh-component', (data) => {
      console.log('on page item params update')
      this.refreshComponent()
    });
    this.$on('pageItemParamsComponent', (data) => {
      console.log('on page item params update')
    });
  },

  watch: {
    "srvReq": {
      deep: true,
      handler: function(newVal, oldVal) {
        console.log('page item component srvReq updated!', JSON.stringify(newVal.condition))
        if (!this.isisIndexedList && JSON.stringify(newVal.condition) !== JSON.stringify(oldVal.condition)) {

          this.refreshComponent()
        }
      }
    }
  }
};