<template>
  <div
    class="page-wrap"
    :style="[setStyle, { '--content-width': contentAreaWidth }]"
  >
    <lc-view
      v-for="item in components"
      :key="item.id"
      v-bind="item"
      :content-width="contentAreaWidth"
      :query-options="queryOptions"
      :isPreview="true"
    ></lc-view>
  </div>
</template>

<script>
import "animate.css";
import lcView from "./components/materials/view.vue";
import { $selectOne } from "@/common/http";
import { formatStyleData } from "@/pages/datav/common/index.js";
import cloneDeep from "lodash/cloneDeep";
import { pageCompCols } from "./components/property/columns";
import { mapState, mapGetters, mapActions } from "vuex";
import { Icon, addCollection } from "@iconify/vue2";
import carbon from "@iconify/json/json/carbon.json";
import mdiLight from "@iconify/json/json/mdi-light.json";
import ri from "@iconify/json/json/ri.json";
export default {
  name: "page-wrap",
  components: {
    lcView,
  },
  provide() {
    return {
      getPageConfig: () => this.pageConfig,
    };
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
  data() {
    return {
      //
      pageNo: null,
      // 组件数据
      components: [],
      pageConfig: null,
      anchorName: "",
      queryOptions:null,
    };
  },
  mounted() {
    addCollection(carbon);
    addCollection(mdiLight);
    addCollection(ri);
    this.setThemeVariable();
  },
  created() {
    this.pageNo = this.$route.query.pageNo || this.$route.params.pageNo;
    this.queryOptions = this.$route.query
    if (this.pageNo) {
      this.initPage().then(() => {
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
  watch: {
    currentTheme(newValue, oldValue) {
      console.log("currentTheme", newValue);
      if (newValue !== oldValue) {
        this.setThemeVariable();
      }
    },
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
    // 构建组件树
    buildComponentsTree(components) {
      let list = components.filter((item) => !item.parent_no);
      function buildTree(list, parentId) {
        const result = [];
        if (Array.isArray(list) && list.length) {
          list.forEach((item) => {
            if (parentId && item.parent_no === parentId) {
              item.children = buildTree(list, item.com_no);
              result.push(item);
            }
          });
        }
        return result;
      }
      list = list.map((item) => {
        item.children = buildTree(components, item.com_no)?.sort(
          (a, b) => a.com_seq - b.com_seq
        );
        return item;
      });
      return list;
    },
    async initPage() {
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
    initComponents(data) {
      const component_json = data?.page_row_json_data?.component_json?.map(
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
      this.components = this.buildComponentsTree(component_json)?.sort(
        (a, b) => a.com_seq - b.com_seq
      );
    },
  },
};
</script>

<style lang="scss">
.animate__animated {
  animation-delay: var(--animate-delay);
  animation-iteration-count: var(--animate-repeat);
}
</style>
