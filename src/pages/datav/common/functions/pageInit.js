/**
 * 
 * @description "page init"  加载各种页面级配置和模版页面所需的前端公共mode。封装，公共方法。
 * @tutorial 
 * @property {Object} pageInfo = {} 页面原始配置信息 
 * @property {Object} modelLevelType = {} 模型类型 page：页面实例级  pageComp：组件实例级 compTemp：组件模版
 */
import {
  getPageItemVisible
} from '@/common/utils/page-item_utils.js'
import paramsModelsMixin from '@/common/paramsModelsMixin.js';
import { savePreviousPage } from '@/common/common'
import { formatStyleData } from "@/pages/datav/common/index.js";
export default {
  data() {
    return {
      "pageNo": "",
      "pdNo": "",
      "pageInfo": null,
      "urlSearchParams": null,
      pageParams: null,
      loadStatus: 'none', // none  loading  more no-more
      pageListV2: null,
      pageParamsModel: null,
      pageInitType: "dLoading", //'dLoading' 动态从pageNo load  'lLoading'  从本地配置加载
      "queryOptions": {},
      pageLoaded: false, // 页面加载
      page_title: null,
      pageInstance: null, //页面实例编号
      dimInfo: {}
    };
  },
  beforeDestroy() {
    this.$store.commit('SET_PAGE_INSTANCE', null)
  },
  mixins: [paramsModelsMixin],
  props: {},

  computed: {
    pagePath() {
      let pages = getCurrentPages();
      let page = pages[pages.length - 1]?.$page?.fullPath;
      console.log('path page', pages, this.$route, pages[pages.length - 1].route)
      // let page = this.$route.path
      return page
    },
    pageItemList() {
      if (Array.isArray(this.pageInfo?.component_json_data)) {
        return this.pageInfo.component_json_data.map(item => {
          item['_visible'] = getPageItemVisible(this.pageParamsModel, item)
          item['_page_no'] = this.pageInfo.page_no
          return item
        })
      }
    },
    pageTitle() {
      return this.page_title || this.pageInfo?.page_title || ''
    },
    singleStore() {
      return this.$api.singleStore && this.$api.storeNo
    },
    themeVariable() {
      // 样式全局配置
      let config = this.pageInfo?.page_style_json_data
      return `
	  			--home-height:${config?.height || '82px'};
	    --home-background:${config?.background};
	    --home-background_color:${config?.background_color};
	    --home-background_image:${config?.background_image};
	    --home-border:${config?.border};
	    --home-border_radius:${config?.border_radius};
	    --home-padding:${config?.padding};
	    --home-margin:${config?.margin};
	    --home-position:${config?.position};
	    --home-font:${config?.font};
	    --home-font_size:${config?.font_size || '14px'};
	    --home-color:${config?.color || '#fff'};
	  `
    },
    showBackPage() {
      // 是否显示返回按钮
      return getCurrentPages().length > 1 || this.showBackHome
    },
    showBackHome() {
      return false
      // if (this.storeNo === "S0000000000") {
      // 	return false
      // }
      // let status = this.StoreInfo?.audit_status;
      // if (status) {
      // 	if (['非公开', '仅本店', '双向隔离'].includes(status)) {
      // 		return false;
      // 	}
      // 	return true;
      // }
    },
    pageParamsModelRun() {
      let model = {}
      if (this.pageParamsModel) {
        for (let key in this.pageParamsModel) {
          model[key] = this.pageParamsModel[key]
        }
      } else {
        model = null
      }
      return model
    },
    pageParamType: function () {
      let type = this.tmpl_page_type
      let typeValue = "listMixForm"
      switch (type) {
        case '表单页':
          typeValue = 'form'
          break;
        case '表单页':
          typeValue = 'form'
          break;
        default:
          break;
      }
      return typeValue
    },
    pageParamServiceName: function () {
      let reqList = this.urlSearchParams
      let serviceName = reqList?.serviceName || this?.pageParams?.serviceName
      for (let key in this.pageParams) {
        switch (key) {
          case 'serviceName':
            serviceName = this.pageParams[key].value
            break;
          default:
            break;
        }
      }
      return serviceName
    },
    pageParamSrvApp: function () {
      let app = uni.getStorageSync('activeApp')
      for (let key in this.pageParams) {
        switch (key) {
          case 'srvApp':
            app = this.pageParams[key].value
            break;
          case 'mapp':
            app = this.pageParams[key].value
            break;
          default:
            break;
        }
      }
      return app
    },
  },

  methods: {
    tagStylefn(style) {
      if (style) {
        return formatStyleData(style)
      }
    },
    getPageItemVisible(pageItem) {
      let pageParamsModel = this.pageParamsModel
      let isVis = false
      let component = pageItem
      if (component && pageParamsModel) {
        if (component.hasOwnProperty('hide_runtime_case') && component.hide_runtime_case) {
          // 处理隐藏
          let caseVal = component.hide_runtime_case
          if (caseVal.indexOf('匿名状态') !== -1) {
            isVis = pageParamsModel['_isAnonymLogin']
          }
          if (caseVal.indexOf('登录状态') !== -1) {
            isVis = !pageParamsModel['_isAnonymLogin']
          }
          if (caseVal.indexOf('已关联租户') !== -1) {
            console.log(component.com_name, caseVal, caseVal.indexOf('已关联租户'),
              pageParamsModel, pageParamsModel['_isVerified'])
            isVis = !pageParamsModel['_isVerified']
          }
          if (caseVal.indexOf('已关注公众号') !== -1) {
            isVis = getApp().globalData.isSubscribe !== true
          }
        } else {
          isVis = true
        }
      } else if (component) {
        isVis = true
      }
      return isVis
    },

    // 根据配置的接口查询页面全局参数
    async getPageInitQueryOptions() {
      if (this.pageInfo.cols_map_json_data && this.pageInfo.srv_req_json_data) {
        const urlSearchParams = this.urlSearchParams || {}
        const params = {
          ...urlSearchParams
        }
        const req = JSON.parse(this.renderStr(JSON.stringify(this.pageInfo.srv_req_json_data), params));
        const url = `/${req.mapp || uni.getStorageSync('activeApp')}/select/${req.serviceName}`
        const res = await this.$http.post(url, req)
        if (res?.data?.data?.length) {
          const data = res?.data?.data[0]
          const keys = Object.keys(this.pageInfo.cols_map_json_data)
          if (keys.length > 0) {
            keys.forEach(key => {
              this.$set(this.queryOptions, key, data[this.pageInfo.cols_map_json_data[key]])
            })
          }
          return data
        }
      } else {
        return
      }

    },
    // 设置页面维度
    async setPageDim(dim_no, dim_value) {
      if (dim_no && dim_value) {
        const page_instance = this.guid('page_instance_')
        this.$emit('setDim', {
          [dim_no]: dim_value
        })
        const url = `/${uni.getStorageSync('activeApp') || 'config'}/operate/srvwx_use_dim_set`
        const req = [{
          "serviceName": "srvwx_use_dim_set",
          "data": [{
            dim_no,
            page_instance,
            dim_value,
            "dim_type": "page",
          }]
        }]
        const res = await this.$http.post(url, req)
        this.pageInstance = page_instance
        this.$store.commit('SET_PAGE_INSTANCE', page_instance)
        return res
      }
    },
    async getPageInfo() {
      if (Array.isArray(this.tabbarListData) && this.tabbarListData.length > 0) {
        const localCurTab = this.tabbarListData.find(item => item.link_page_no === this.pdNo)
        if (localCurTab?.pageInfo) {
          this.$set(this, 'pageInfo', this.deepClone(localCurTab?.pageInfo))
          return
        }
      }
      const url = `/config/select/srvpage_cfg_page_select`
      const req = {
        "serviceName": "srvpage_cfg_page_select",
        "colNames": ["*"],
        "condition": [{
          colName: 'page_no',
          ruleType: 'eq',
          // value: this.pdNo || 'PG2212160001'
          value: this.pageNo || 'PG2310240007'
        }],
        "page": {
          "pageNo": 1,
          "rownumber": 1
        },
      }
      this.loadStatus = 'loading'
      // if(this.pageNo)
      const res = await this.$http.post(url, req)
      this.loadStatus = ''
      if (res?.data?.state === 'SUCCESS' && Array.isArray(res?.data?.data) && res?.data?.data.length > 0) {
        let pageInfo = res.data.data[0]
        Object.keys(pageInfo).forEach(key => {
          if (key && key.indexOf("_json") !== -1) {
            try {
              pageInfo[`${key}_data`] = JSON.parse(pageInfo[key])
            } catch (e) { }
          }
        })
        if (Array.isArray(pageInfo?.interface_json_data) && pageInfo.interface_json_data.length) {
          pageInfo.interface_json_data.forEach(item => {
            const val = this.queryOptions[item.para]
            if (item.default_val && [null, undefined, 'null', 'undefined'].includes(val)) {
              this.$set(this.queryOptions, item.para, item.default_val)
            }
          })
          let dim_no_field = pageInfo.interface_json_data.find(item => item.dim_no)
          if (dim_no_field?.dim_no && this.queryOptions[dim_no_field.para] && this.queryOptions[dim_no_field.para] !==
            '*') {
            // 维度编号
            this.$set(this.queryOptions, '_dim_no', this.queryOptions[dim_no_field.para])
            await this.setPageDim(dim_no_field?.dim_no, this.queryOptions[dim_no_field.para])
          }
        }
        this.$set(this, 'pageInfo', pageInfo)
        await this.getPageInitQueryOptions()
        if (Array.isArray(this.pageInfo?.bottom_nav_json_data?.nav_item_json) && (!Array.isArray(this
          .tabbarListData) || this.tabbarListData.length === 0)) {
          this.tabbarListData = this.pageInfo.bottom_nav_json_data.nav_item_json.map(item => {
            item.text = item.label;
            // item['page_no']
            if (item.nav_icon) {
              item.iconPath = this.getImagePath(item.nav_icon);
              // #ifdef MP-WEIXIN
              const iconPath = this.getImagePath(item.nav_icon);
              this.url2Base64(iconPath).then(res => {
                if (res) {
                  item.iconPath = res
                }
              })
              // #endif
            }
            if (item.nav_icon_selected) {
              item.selectedIconPath = this.getImagePath(item.nav_icon_selected);
              // #ifdef MP-WEIXIN
              const selectedIconPath = this.getImagePath(item.nav_icon_selected);
              this.url2Base64(selectedIconPath).then(res => {
                if (res) {
                  item.selectedIconPath = res
                }
              })
              // #endif
            }
            return item
          })
        }
        if (pageInfo && Array.isArray(this.tabbarListData) && this.tabbarListData.length - 1 >= this.currentTab) {
          const tab = this.tabbarListData[this.currentTab]
          pageInfo = this.deepClone(pageInfo)
          if (Array.isArray(pageInfo?.component_json_data)) {
            const pageItemList = pageInfo.component_json_data.map(item => {
              // item['_visible'] = this.getPageItemVisible(item)
              item['_visible'] = getPageItemVisible(this.pageParamsModel, item)
              return item
            })
            this.$set(tab, 'pageItemList', pageItemList)
          }
          delete pageInfo.component_json_data
          delete pageInfo.component_json
          this.$set(tab, 'pageInfo', pageInfo)
          // this.$set(this.tabbarListData, this.currentTab, tab)
        }
        const loginUserInfo = uni.getStorageSync('login_user_info')
        this.$store.commit('SET_LOGIN_USER', loginUserInfo)
        if (this.pageInfo?.page_options === '先登录' && (!uni.getStorageSync('isLogin') || !loginUserInfo?.mobile)) {
          uni.showModal({
            title: '提示',
            content: '请先授权手机号进行登录',
            showCancel: false,
            success: (res) => {
              if (res.confirm) {
                savePreviousPage()
                uni.navigateTo({
                  url: '/pages/login/login?hideA'
                })
              }
            }
          })
        }
        return this.initPageParams().then((r) => {
          if (r) {
            return new Promise(function (resolve, reject) {
              resolve(true)
            })
          } else {
            return new Promise(function (resolve, reject) {
              resolve(false)
            })
          }
        })

      } else {
        this.$set(this, 'pageInfo', {})
        return this.initPageParams().then((r) => {
          if (r) {
            return new Promise(function (resolve, reject) {
              resolve(true)
            })
          } else {
            return new Promise(function (resolve, reject) {
              resolve(false)
            })
          }
        })
      }
    },
    getInitParams() {
      // 页面前端运行固定参数
      const loginUserInfo = uni.getStorageSync('login_user_info')
      const basicParamsModel = {
        '_isBindMobile': loginUserInfo?.mobile, // 登录用户
        '_isAnonymLogin': loginUserInfo?.login_state === 'anon_login', // 匿名,未登录用户
        '_isVerified': loginUserInfo && loginUserInfo?.login_state !== 'anon_login' && loginUserInfo.mobile &&
          loginUserInfo.hasOwnProperty('otherTenantInfos') && loginUserInfo.otherTenantInfos.length > 0, // 被认证，认证用户
      }
      if (this.queryOptions && Object.keys(this.queryOptions).length > 0) {
        Object.keys(this.queryOptions).forEach(key => {
          basicParamsModel[key] = {
            value: this.queryOptions[key]
          }
        })
      }
      return basicParamsModel
    },
    async initPageParams() {
      let self = this
      let getInit = self.getInitParams()
      return await new Promise(function (resolve, reject) {
        //异步操做
        let paraJson = self.pageInfo?.interface_json_data || self.pageInfo?.para_json
        let paraJsonV2 = self.pageInfo?.para_with_map_json_data || null
        console.log('new Promise( paraJson', paraJson)
        self.pageParams = {}
        if ((!self.urlSearchParams || Object.keys(self.urlSearchParams).length === 0) && paraJson && paraJson
          .length > 0) {
          paraJson.forEach(item => {
            item.value = item.default_val || ''
          })
        } else if (Array.isArray(paraJson) && paraJson && paraJson.length > 0) {
          console.log('-- page paraJson  init SUCCESS --')
          console.log(paraJson, self.urlSearchParams)
          for (let param of paraJson) {
            let keyName = param.para_name || param.para
            let urlParamsKeys = self.urlSearchParams ? Object.keys(self.urlSearchParams) : [];
            if (urlParamsKeys.indexOf(keyName) !== -1) {
              param.value = self.urlSearchParams[keyName]
            } else {
              param.value = param.default_val
            }
            // for (let key in self.urlSearchParams) {
            // 	if (key == param.para_name && self.urlSearchParams[key]) {
            // 		param.value = self.urlSearchParams[key]
            // 	}else{
            // 		param.value = param.default_val
            // 	}
            // }

            self.$set(self.pageParams, keyName, param)
          }
          self.$set(self, 'pageParamsModel', self.deepClone(self.pageParams))
        }
        if (paraJsonV2 && paraJsonV2.length > 0) {
          console.log('-- page paraJson V2  init SUCCESS --')
          let Model = {}
          for (let param of paraJsonV2) {
            for (let key in self.urlSearchParams) {
              if (key == param.para && self.urlSearchParams[key]) {
                param['value'] = self.urlSearchParams[key]
              } else {
                param['value'] = param.default_val || ''
              }
            }
            Model[param.para] = param
            self.$set(self.pageParams, param.para, param)
          }

          self.$set(self, 'pageParamsModel', self.deepClone(Model))
        }
        self.$set(self, 'pageParamsModel', {
          ...self.pageParamsModel,
          ...getInit
        })
        // if(self.urlSearchParams){

        // 	console.log('-- page urlSearchParams init SUCCESS --')
        // 	for(let key in self.urlSearchParams){
        // 		self.$set(self.pageParams,key,{value:self.urlSearchParams[key]})
        // 	}
        // }
        resolve(true)
      });

    },
    setPageParams(key, val) {
      let self = this
      // this.pageParams[key] = val
      if (self.pageParamsModel && key) {
        for (let p in self.pageParamsModel) {
          if (p == key && self.pageParamsModel[key]) {
            console.log('--', val)
            let item = self.deepClone(self.pageParamsModel[key])
            item.value = val
            self.$set(self.pageParamsModel, key, item)
          }
        }

      }

    },
    async getPageListV2() {
      let app = this.pageParamSrvApp || uni.getStorageSync('activeApp');
      let self = this;
      let colVs = await this.getServiceV2(this.pageParamServiceName, 'list', this.listType === 'proc' ? 'proclist' :
        'list', app);
      colVs?.srv_cols ? colVs.srv_cols = colVs.srv_cols.filter(item => item.in_list === 1 || item
        .in_list === 2) :
        ''
      this.pageListV2 = colVs;
      if (Array.isArray(colVs.srv_cols)) { }
      return colVs;
    },
    getParamsFromUrl(url) {
      const search = url.split("?")[1];
      if (!search) return {};
      const queryParams = {};
      const searchStrs = search.split("&");

      for (const str of searchStrs) {
        const [key, value] = str.split("=");
        queryParams[decodeURIComponent(key)] = decodeURIComponent(value);
      }

      return queryParams;
    }
  },
  onReachBottom() {
    if (this.tabsCurrent == 1) {
      this.$refs.list.loadMore();
    }
  },
  onPullDownRefresh() {
    if (this.tabsCurrent == 1) {
      this.$refs.list.refresh();
    }
    setTimeout(_ => {
      uni.stopPullDownRefresh();
    }, 500);
  },
  onLoad(option) {
    this.$store.commit('SET_PAGE_INSTANCE', null)
    if (option.q) {
      const q = decodeURIComponent(option.q) // 获取到二维码原始链接内容
      if (q && q.includes('?')) {
        const query = this.getParamsFromUrl(q)
        option = {
          ...option,
          ...query
        }
      }
      if (option.target_nav_url) {
        this.initLogin().then(() => {
          uni.redirectTo({
            url: option.target_nav_url
          })
        })
        return
      }
    }
    this.urlSearchParams = option
    this.queryOptions = option
    if (option.page_title) {
      this.page_title = option.page_title
    }
    if (option.page_no) {
      this.pageNo = option.page_no
      console.log('-- init pageNo SUCCESS : page_no --')
    } else if (option.pdNo) {
      this.pageNo = option.pdNo
      console.log('-- init pageNo SUCCESS : pdNo --')
    } else {
      console.error('-- init pageNo error : pdNo? or page_no? --')
    }
    if (!option.hasOwnProperty('pageInitType') || (option.hasOwnProperty('pageInitType') && option.pageInitType ==
      'dLoading')) {
      this.initLogin().then(() => {
        const login_user_info = uni.getStorageSync('login_user_info')
        this.getWxUserInfo(login_user_info)
        this.getIsAttention(login_user_info.otherInfo)
        this.getPageInfo()
      })
    }
    this.pageLoaded = true

  },
  async onShow(e) {
    let globalData = getApp().globalData;
    this.globalData = globalData;
    let that = this
    uni.$on('returnData', function (data) {
      console.log('the page is displayed: return data(returnData):', data);
    })
    if (this.pageInstance) {
      console.log('change-pageInstance:', this.pageInstance);
      this.$store.commit('SET_PAGE_INSTANCE', this.pageInstance, this.dimInfo)
    }
    uni.$on('page-refresh', function (data) {
      /**
       * 
       
        data = {
          pageNo:"",
          sourceComNo:""
        }
       
       */
      if (data && data.hasOwnProperty('pageNo') && data.hasOwnProperty('pageNo') && data.pageNo == that.pageNo) {
        let refs = that.$refs.pageItem
        let comNo = data.sourceComNo
        console.log(refs)
        if (refs && Array.isArray(refs) && refs.length > 0 && comNo) {
          for (let ref of refs) {
            if (ref.hasOwnProperty('refresh') && ref?.pageItem?.com_no !== comNo) {
              ref.refresh()
            } else {
              console.log('组件没有刷新方法', ref.pageItem)
            }
          }
        } else if (refs && Array.isArray(refs) && refs.length > 0) {
          for (let ref of refs) {
            if (ref.hasOwnProperty('refresh') && ref?.pageItem?.com_no !== comNo) {
              ref.refresh()
            } else {
              console.log('组件没有刷新方法', ref.pageItem)
            }
          }
        }
        console.log('page-refresh:', data, refs);
      }


    })
    if (that.pageLoaded) {
      let refs = that.$refs.pageItem
      if (refs && Array.isArray(refs) && refs.length > 0) {
        for (let ref of refs) {
          if (ref.hasOwnProperty('refresh') && (ref?.pageItem?.com_type == 'list' || ref?.pageItem?.com_type ==
            'cardGroup')) {
            ref.refresh()
          } else {
            console.log('组件没有刷新方法', ref.pageItem)
          }
        }
      }
      console.log('page-refresh:', refs);
    }
    let pages = getCurrentPages()
    let path = pages[pages.length - 1].route
    if (path && path.indexOf('views/custom/index/index') == 0) {
      that.authTenant(that.pageInfo).then((res) => {
        if (res) {
          let refs = that.$refs.pageItem
          console.log(refs)
          if (refs && Array.isArray(refs) && refs.length > 0) {
            for (let ref of refs) {
              if (ref.hasOwnProperty('refresh') && ref?.pageItem?.com_type == 'list') {
                ref.refresh()
              } else {
                console.log('组件没有刷新方法', ref.pageItem)
              }
            }
          }
          console.log('page-refresh:', refs);
        }
      })
    }

    console.log('this page loading is:', that.pageLoaded)
    // 页面根据组件是否加载完成 对已加载完成得组件进行刷新。
    // if(that.pageLoaded){
    // 	let refs = that.$refs.pageItem
    // 	console.log(refs)
    // 	if (refs && Array.isArray(refs) && refs.length > 0) {
    // 	  for (let ref of refs) {
    // 	    if (ref.hasOwnProperty('refresh') && ref?.pageItem?.com_type == 'list') {
    // 	      ref.refresh()
    // 	    } else {
    // 	      console.log('组件没有刷新方法', ref.pageItem)
    // 	    }
    // 	  }
    // 	}
    // 	console.log('page-refresh:',refs);
    // }


  },

  watch: {
    "pageParamsModelRun": {
      deep: true,
      immediate: true,
      handler: function (newVal, oldVal) {
        console.log('page params updated:', newVal)
      }
    },
    "pageParamsModel": {
      deep: true,
      immediate: true,
      handler: function (newVal, oldVal) {
        console.log('--page params updated:', newVal)
      }
    }
  }
};