<template>
  <div class="lowcode-wrapper">
    <header-view :is-preview.sync="previewVisible" :json-visible.sync="jsonVisible"></header-view>
    <div class="lowcode-content">
      <!-- <editor-next></editor-next> -->
      <materials-view class="materials-view"></materials-view>
      <editor-view
        :components="components"
        class="editor-view"
        @select="selectComponent"
        @change="componentsChange"
      ></editor-view>
      <property-view
        class="property-view"
        :current-id="currentId"
        :components="components"
        @change="componentsChange"
      ></property-view>
    </div>
    <el-dialog title="页面预览"
      :visible.sync="previewVisible"
      fullscreen
      :before-close="handlePreviewClose">
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
        :copyable="{copyText: '复制', copiedText: '已复制'}"
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
// import editorNext from "../datav/grid-layout/editor-next.vue";
import JsonViewer from "vue-json-viewer";
import "vue-json-viewer/style.css";

export default {
  name: "lowcode-main",
  components: {
    HeaderView,
    MaterialsView,
    EditorView,
    PropertyView,
    // editorNext,
    JsonViewer,
    lcView
  },
  data() {
    return {
      //
      currentId: null,
      structureData: null,
      jsonVisible: false,
      previewVisible: false,
      // 组件数据
      components: [
      ],
    };
  },
  methods: {
    //
    handlePreviewClose(done) {
      this.previewVisible = false;
      done();
    },
    selectComponent(id) {
      this.currentId = id;
    },
    componentsChange(val) {
      console.log("componentsChange", val); //
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
    height: 100%;

    ::v-deep .customhome-container {
      height: 100%;
    }
  }
}
</style>
