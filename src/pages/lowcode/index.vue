<template>
  <div class="lowcode-wrapper">
    <header-view
      :is-preview.sync="previewVisible"
      :json-visible.sync="jsonVisible"
    >
      <template #right>
        <el-button type="primary" size="mini">保存</el-button>
      </template>
    </header-view>
    <div class="lowcode-content">
      <materials-view class="materials-view"></materials-view>
      <div class="editor-container">
        <editor-view
          :components="components"
          @select="currentChange"
          @change="componentsChange"
        ></editor-view>
      </div>
      <!-- <property-view
        class="property-view"
        :current-id="currentId"
        :components="components"
        @change="componentsChange"
      ></property-view> -->
    </div>
    <el-dialog title="页面预览" :visible.sync="previewVisible" fullscreen>
      <div class="preview-container">
        <lc-view
          v-for="item in components"
          :key="item.id"
          v-bind="item"
          :isPreview="true"
        ></lc-view>
      </div>
    </el-dialog>
    <el-drawer
      title="页面JSON预览"
      :visible.sync="jsonVisible"
      direction="ltr"
      size="50%"
      :with-header="false"
    >
      <json-viewer
        :value="components"
        expanded
        :expand-depth="5"
        :copyable="{ copyText: '复制', copiedText: '已复制' }"
      ></json-viewer>
    </el-drawer>
  </div>
</template>

<script>
import HeaderView from "./components/header";
import MaterialsView from "./components/materials";
import EditorView from "./components/editor";
import PropertyView from "./components/property";
import lcView from "./components/materials/view.vue";
import JsonViewer from "vue-json-viewer";
import "vue-json-viewer/style.css";
import { $http, $selectOne } from "@/common/http";
export default {
  name: "lowcode-main",
  components: {
    HeaderView,
    MaterialsView,
    EditorView,
    PropertyView,
    JsonViewer,
    lcView,
  },
  data() {
    return {
      //
      pageNo: null,
      currentId: null,
      structureData: null,
      jsonVisible: false,
      previewVisible: false,
      // 组件数据
      components: [],
      comJson: [],
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
        const component_json = data?.page_row_json_data?.component_json;
        if (!Array.isArray(component_json)) return;
        this.components = component_json.sort((a, b) => a.com_seq - b.com_seq);
        this.initPageParams(); // 页面参数初始化
      } else if (msg) {
        this.$message.error(msg);
      } else {
        this.$message.info("无数据！");
      }
    },
    buildReqParams() {
      let components = this.components
      
    },
    initPageParams() {},
    currentChange(id) {
      this.currentId = id;
    },
    componentsChange(val) {
      this.components = val;
    },
  },
};
</script>

<style lang="scss" scoped>
.lowcode-wrapper {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;

  .lowcode-content {
    flex: 1;
    display: flex;
    height: calc(100% - 50px);
    .editor-container {
      flex: 1;
      // overflow: auto;
    }
    ::v-deep .customhome-container {
      height: 100%;
    }
  }
}
</style>
