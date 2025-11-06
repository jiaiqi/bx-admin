/**
 * @fileoverview 低代码页面混入 - 提供页面配置、组件管理、主题设置等通用功能
 * @author jq
 * @version 1.0.0
 * @since 2025
 */

import { mapState, mapGetters, mapActions } from "vuex";

import cloneDeep from "lodash/cloneDeep";
import "animate.css";

import { Icon, addCollection } from "@iconify/vue2";
import carbon from "@iconify/json/json/carbon.json";
import mdiLight from "@iconify/json/json/mdi-light.json";
import ri from "@iconify/json/json/ri.json";

import { $selectOne, getHomePageNo } from "@/common/http";
import { formatStyleData } from "@/pages/datav/common/index.js";

import { buildComponentsTree } from "../utils/common";
import { pageCompCols } from "../components/property/columns";

/**
 * 低代码页面混入器
 * @mixin LowcodePageMixin
 * @description 为低代码页面提供通用的配置管理、组件初始化、主题设置等功能
 */
export default {
  props: {
    propPageNo: {
      type: String,
      default: ''
    },
  },
  /**
   * 向子组件提供页面配置和参数的访问方法
   * @returns {Object} 包含获取页面配置和参数方法的对象
   */
  provide() {
    return {
      getPageConfig: () => this.pageConfig,
      getPageParams: () => this.pageParams,
    };
  },
  /**
   * 组件数据
   * @returns {Object} 组件的响应式数据
   * @property {string|null} pageNo - 页面编号
   * @property {Object|null} pageConfig - 页面配置对象
   * @property {Array} components - 页面组件列表
   * @property {string} anchorName - 锚点名称
   */
  data() {
    return {
      appCfg: null,
      pageNo: null,
      pageConfig: null,
      components: [],
      anchorName: ""
    }
  },
  computed: {
    ...mapState("theme", ["currentTheme"]),
    ...mapGetters("theme", ["themeList", "themeVariable"]),
    /**
     * 计算内容区域宽度
     * @returns {string} 格式化后的宽度值（px或%）
     */
    contentAreaWidth() {
      let width = this.pageConfig?.content_area_width || 1400;
      return typeof width === "string" && width?.includes("%")
        ? width
        : `${parseFloat(width)}px`;
    },
    /**
     * 获取页面样式配置
     * @returns {Object} 格式化后的样式对象
     */
    setStyle() {
      let style = {};
      if (this.pageConfig?.page_style_json_data) {
        style = cloneDeep(this.pageConfig?.page_style_json_data);
      }
      return formatStyleData(style);
    },
    /**
     * 获取应用配置
     * @returns {Object} 应用配置对象
     */
    appConfig() {
      return this.pageConfig?.app_json_data || {};
    },
  },
  watch: {
    /**
     * 监听当前主题变化
     * @param {string} newValue - 新主题值
     * @param {string} oldValue - 旧主题值
     */
    currentTheme(newValue, oldValue) {
      console.log("currentTheme", newValue);
      if (newValue !== oldValue) {
        this.setThemeVariable();
      }
    },
    setStyle: {
      handler(newVal, oldVal) {
        if (newVal && newVal['font-size']) {
          document.body.style.fontSize = newVal['font-size']
          document.querySelector('html').style.fontSize = newVal['font-size']
        }
      },
      deep: true,
      immediate: true,
    }
  },
  async created() {
    if (this.lowCodeJson?.page_no) {
      this.pageNo = this.lowCodeJson.page_no
      this.pageConfig = {
        ...cloneDeep(this.lowCodeJson),
        page_row_json: cloneDeep(this.lowCodeJson)
      }
      const newData = await this.initPageConfig(this.pageConfig);
      this.initComponents(newData);
      this.initPageParams()
      this.setThemeVariable();
      return
    }
    if (this.propPageNo) {
      this.pageNo = this.propPageNo
    } else if(this.$route.query.pageNo || this.$route.params.pageNo){
      this.pageNo = this.$route.query.pageNo || this.$route.params.pageNo;
    } else if(getHomePageNo?.()){
      this.pageNo = getHomePageNo?.();
    }

    if (this.pageNo) {
      await this.getPageConfig()
      this.$nextTick(() => {
        let anchorName =
          this.$route.query.anchorName || this.$route.params.anchorName;
        if (anchorName) {
          this.anchorName = anchorName;
          let ele = document.getElementById(anchorName);
          if (ele) {
            ele.scrollIntoView({
              behavior: "smooth",
              block: "start",
              inline: "nearest",
            });
          } else {
            console.error("未找到锚点:", anchorName);
          }
        }
      });
      this.setThemeVariable();
    }
  },
  mounted() {
    addCollection(carbon);
    addCollection(mdiLight);
    addCollection(ri);
  },
  methods: {
    ...mapActions("theme", ["setCurrentTheme", "setThemeList", "initTheme"]),

    /**
     * 设置主题变量到DOM
     * @description 将主题变量转换为CSS样式并应用到body元素
     */
    setThemeVariable() {
      const appCfg = this.appCfg
      let appStyleJson = null
      if (appCfg?.app_style_json) {
        try {
          appStyleJson = JSON.parse(appCfg.app_style_json)
        } catch (error) {
          console.log(error);
        }
      }
      let appThemeInfo = {}
      if (appStyleJson?.theme_color) {
        Object.keys(appStyleJson?.theme_color).forEach(key => {
          if (appStyleJson?.theme_color[key]) {
            appThemeInfo[`--${key}`] = appStyleJson?.theme_color[key]
          }
        })
      }
      let themeVariable = Object.keys(this.themeVariable).reduce(
        (pre, cur) => {
          pre += `${cur}: ${this.themeVariable[cur]};`;
          if (cur?.includes('_')) {
            pre += `${cur.replace(/\_/g, '-')}: ${this.themeVariable[cur]};`;
          }
          return pre;
        },
        ""
      );
      if (appThemeInfo && Object.keys(appThemeInfo).length) {
        themeVariable += Object.keys(appThemeInfo).reduce((pre, cur) => {
          pre += `${cur}: ${appThemeInfo[cur]};`;
          if (cur?.includes('_')) {
            pre += `${cur.replace(/\_/g, '-')}: ${appThemeInfo[cur]};`;
          }
          return pre;
        }, '')
      }
      document.body.setAttribute("style", themeVariable);
    },
    /**
     * 获取应用配置
     * @description 从服务器获取应用配置，根据应用编号查询应用详情
     * @param {string} appNo - 应用编号
     * @returns {Promise<Object|null>} 应用配置对象，如果请求失败或未找到应用则返回null
     */
    async getAppConfig(appNo) {
      if (!appNo) return
      const service = 'srvpage_cfg_app_guest_select'
      const req = {
        "serviceName": service,
        "colNames": ["*"],
        "condition": [{
          colName: 'app_no',
          ruleType: "eq",
          value: appNo
        }],
        "page": {
          "pageNo": 1,
          "rownumber": 1
        },
      }
      try {
        const res = await this.$http.post(`/config/select/${service}`, req)
        console.log(res);
        if (res.data.state === 'SUCCESS' && Array.isArray(res.data.data) && res.data.data.length) {
          let appCfg = res.data.data[0]
          sessionStorage.setItem('lowAppCfg', JSON.stringify(appCfg))
          this.appCfg = appCfg
        }
      } catch (error) {
        console.error(error);
      }
    },
    /**
     * 获取页面配置数据
     * @async
     * @description 从服务器获取页面配置，并初始化页面组件和参数
     * @throws {Error} 当请求失败时抛出错误
     */
    async getPageConfig() {
      console.log("initPage");
      const url = `/config/select/srvpage_cfg_page_guest_select`;
      const req = {
        serviceName: "srvpage_cfg_page_guest_select",
        colNames: ["*"],
        condition: [
          {
            colName: "page_no",
            ruleType: "eq",
            value: this.pageNo,
          },
        ],
      };
      const { data, ok, msg } = await $selectOne(url, req);
      if (ok) {
        let newData = await this.initPageConfig(data);
        this.initComponents(newData);
        this.initPageParams()
      } else if (msg) {
        this.$message.error(msg);
      } else {
        this.$message.info("无数据！");
      }
    },
    /**
     * 初始化页面配置
     * @param {Object} data - 原始页面配置数据
     * @returns {Object} 处理后的页面配置数据
     * @description 解析JSON字段，设置页面配置，初始化主题
     */
    async initPageConfig(data) {
      Object.keys(data).forEach((key) => {
        if (key && data[key] && key.indexOf("_json") !== -1) {
          if (typeof data[key] === "object") {
            data[`${key}_data`] = data[key]
          } else {
            try {
              data[`${key}_data`] = JSON.parse(data[key]);
            } catch (e) {
              console.error(e);
            }
          }
        }
      });
      this.pageConfig = data;
      if (data?.app_no) {
        // 查找app信息
        await this.getAppConfig(data.app_no)
      }

      // 使用Vuex初始化主题
      if (data?.app_json_data) {
        let currentTheme = data.app_json_data.current_theme;
        if (
          localStorage.currentTheme &&
          localStorage.getItem("currentTheme") !== currentTheme
        ) {
          currentTheme = localStorage.getItem("currentTheme");
        }
        if (!currentTheme && data?.app_json_data?.theme_list) {
          currentTheme = data.app_json_data.theme_list[0].name;
        }
        this.initTheme({
          currentTheme: currentTheme,
          themeList: data.app_json_data.theme_list || [],
        });
      }

      return data;
    },
    /**
     * 初始化页面组件
     * @async
     * @param {Object} data - 页面配置数据
     * @description 处理组件配置，设置组件类型和属性，构建组件树
     */
    async initComponents(data) {
      let list = data?.page_row_json_data?.component_json
      if (this.getPageComponents && typeof this.getPageComponents === "function") {
        list = await this.getPageComponents(list)
      }
      const component_json = list?.map(
        (item) => {
          if (item.com_type === "layout") {
            const layout_party = item?.layout_json?.layout_party;
            if (layout_party === "页面") {
              item.type = "container";
              item.component = "lc-container";
            } else if (layout_party === "布局") {
              item.type = "layout";
              item.component = "lc-block";
            } else {
              item.type = "content";
              item.component = "lc-content";
            }
            if (item.layout_json?.child_num) {
              item.child_num = item.layout_json.child_num;
            }
          } else {
            item.component = "page-item";
            if (item.com_name !== '咨询入口' && item.com_option?.includes("悬浮可拖动")) {
              item.component = "float-component";
            }
            //在线咨询特别处理
            if (item.com_name === '咨询入口' && item.com_option?.includes("悬浮可拖动")) {
              item.component = "chat-entrance";
            }
          }
          item.data = {};
          pageCompCols.forEach((col) => {
            if (item[col]) {
              item.data[col] = item[col];
            }
          });
          if (item.id) {
            item.data.id = item.id;
          }
          const keys = ["component", "type", "_type"];
          keys.forEach((key) => {
            if (item.data[key]) {
              delete item.data[key];
            }
          });

          return item;
        }
      );
      if (!Array.isArray(component_json)) {
        this.components = [];
        return;
      }
      this.components = buildComponentsTree(component_json)?.sort(
        (a, b) => a.com_seq - b.com_seq
      );
    },
  },
}