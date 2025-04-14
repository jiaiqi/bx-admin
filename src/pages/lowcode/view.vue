<template>
  <div class="page-wrap" :style="[setStyle, themeVariable]">
    <lc-view
      v-for="item in components"
      :key="item.id"
      v-bind="item"
      :isPreview="true"
    ></lc-view>
  </div>
</template>

<script>
import lcView from "./components/materials/view.vue";
import { $selectOne } from "@/common/http";
import { formatStyleData } from "@/common/common";
import cloneDeep from "lodash/cloneDeep";
export default {
  name: "page-wrap",
  components: {
    lcView,
  },
  computed: {
    contentAreaWidth() {
      let width = this.pageConfig?.content_area_width || 1200;
      return typeof width === "string" && width?.includes("%")
        ? width
        : `${parseFloat(width)}px`;
    },
    setStyle() {
      let style = {};
      if (this.pageConfig?.page_style_json_data) {
        style = cloneDeep(this.pageConfig?.page_style_json_data);
        if (style.theme_list) {
          delete style.theme_list;
        }
        if (style.theme_variable) {
          delete style.theme_variable;
        }
        if (style.theme_name) {
          delete style.theme_name;
        }
      }
      return formatStyleData(style);
    },
    themeVariable() {
      // 样式全局配置
      const config = this.pageConfig?.page_style_json_data;
      const themeList = config?.theme_list || [];
      const themeName = sessionStorage.current_theme || config?.current_theme;
      // 匹配当前主题的配置
      if (Array.isArray(themeList) && themeList.length) {
        let theme = themeList.find(
          (item) => themeName && item.current_theme === themeName
        );
        if (!theme) {
          theme = themeList[0];
        }
        config.theme_variable = theme.theme_variable;
      }
      const themeVariable = {};
      if (
        config?.theme_variable &&
        typeof config.theme_variable &&
        Object.keys(config?.theme_variable).length
      ) {
        Object.keys(config?.theme_variable).forEach((key) => {
          themeVariable[`--${key}`] = config?.theme_variable[key];
        });
      }
      return {
        "--theme-color": themeVariable?.theme_color || "#173808",
        "--theme-color-light": themeVariable?.theme_color_light || "#173808",
        "--theme-color-dark": themeVariable?.theme_color_dark || "#173808",
        "--header-bg-color": themeVariable?.header_bg_color || "#174b3b",
        "--header-bg-menu-color": themeVariable?.header_menu_color || "#265e4d",
        "--header-text-color": themeVariable?.header_text_color || "#fff",
        "--header-active-text-color":
          themeVariable?.header_active_text_color || "#fff",
        "--header-active-bg-color":
          themeVariable?.header_active_bg_color || "#235646",
        "--header-hover-bg-color":
          themeVariable?.header_hover_bg_color || "#235646",
        "--header-hover-text-color":
          themeVariable?.header_hover_text_color || "#fff",
        ...themeVariable,
      };
    },
  },
  data() {
    return {
      //
      pageNo: null,
      // 组件数据
      components: [],
      pageConfig: null,
    };
  },
  created() {
    this.pageNo = this.$route.query.pageNo || this.$route.params.pageNo;
    if (this.pageNo) {
      this.initPage();
    }
  },
  methods: {
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
        item.children = buildTree(components, item.com_no);
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
      this.components = this.buildComponentsTree(component_json);
    },
  },
};
</script>

<style lang="scss"></style>
