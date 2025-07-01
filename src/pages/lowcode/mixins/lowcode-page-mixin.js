import { mapState, mapGetters, mapActions } from "vuex";

import cloneDeep from "lodash/cloneDeep";
import "animate.css";

import { Icon, addCollection } from "@iconify/vue2";
import carbon from "@iconify/json/json/carbon.json";
import mdiLight from "@iconify/json/json/mdi-light.json";
import ri from "@iconify/json/json/ri.json";

import { $selectOne } from "@/common/http";
import { formatStyleData } from "@/pages/datav/common/index.js";

import { buildComponentsTree } from "../utils/common";
import { pageCompCols } from "../components/property/columns";

export default {
  provide() {
    return {
      getPageConfig: () => this.pageConfig,
    };
  },
  data() {
    return {
      pageNo: null,
      pageConfig: null,
      components: [],
      anchorName: ""
    }
  },
  computed: {
    ...mapState("theme", ["currentTheme"]),
    ...mapGetters("theme", ["themeList", "themeVariable"]),
    contentAreaWidth() {
      let width = this.pageConfig?.content_area_width || 1400;
      return typeof width === "string" && width?.includes("%")
        ? width
        : `${parseFloat(width)}px`;
    },
    setStyle() {
      let style = {};
      if (this.pageConfig?.page_style_json_data) {
        style = cloneDeep(this.pageConfig?.page_style_json_data);
      }
      return formatStyleData(style);
    },
    appConfig() {
      return this.pageConfig?.app_json_data || {};
    },
  },
  watch: {
    currentTheme(newValue, oldValue) {
      console.log("currentTheme", newValue);
      if (newValue !== oldValue) {
        this.setThemeVariable();
      }
    },
  },
  created() {
    this.pageNo = this.$route.query.pageNo || this.$route.params.pageNo;
    if (this.pageNo) {
      this.getPageConfig().then(() => {
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
      });
    }
  },
  mounted() {
    addCollection(carbon);
    addCollection(mdiLight);
    addCollection(ri);
    this.setThemeVariable();
  },
  methods: {
    ...mapActions("theme", ["setCurrentTheme", "setThemeList", "initTheme"]),
    setThemeVariable() {
      const themeVariable = Object.keys(this.themeVariable).reduce(
        (pre, cur) => {
          pre += `${cur}: ${this.themeVariable[cur]};`;
          return pre;
        },
        ""
      );
      document.body.setAttribute("style", themeVariable);
    },
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
        let newData = this.initPageConfig(data);
        this.initComponents(newData);
      } else if (msg) {
        this.$message.error(msg);
      } else {
        this.$message.info("无数据！");
      }
    },
    initPageConfig(data) {
      Object.keys(data).forEach((key) => {
        if (key && data[key] && key.indexOf("_json") !== -1) {
          try {
            data[`${key}_data`] = JSON.parse(data[key]);
          } catch (e) {
            console.error(e);
          }
        }
      });
      this.pageConfig = data;
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
            if (item.com_option?.includes("悬浮可拖动")) {
              item.component = "float-component";
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