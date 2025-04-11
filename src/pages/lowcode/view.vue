<template>
  <div class="page-wrap">
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
import {  $selectOne } from "@/common/http";
import { formatStyleData } from "@/common/common";
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
        style = this.pageConfig?.page_style_json_data;
      }
      return formatStyleData(style);
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

<style lang="scss">
</style>
