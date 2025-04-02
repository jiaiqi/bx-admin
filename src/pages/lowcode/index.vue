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
    <el-dialog
      title="页面预览"
      :visible.sync="previewVisible"
      fullscreen
    >
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
      currentId: null,
      structureData: null,
      jsonVisible: false,
      previewVisible: false,
      // 组件数据
      components: [],
    };
  },
  methods: {
    async initPage(data) {
      console.log("initPage");
      if (data?.page_no) {
        this.pgNo = data.page_no;
      }
      this.layout = [];
      const url = `/config/select/srvpage_cfg_page_guest_select`;
      const req = {
        serviceName: "srvpage_cfg_page_guest_select",
        colNames: ["*"],
        condition: [
          {
            colName: "page_no",
            ruleType: "eq",
            value: this.pgNo,
          },
        ],
      };
      const res = await $axios.post(url, req);
      if (
        res.data.state === "SUCCESS" &&
        Array.isArray(res.data.data) &&
        res.data.data.length > 0
      ) {
        let data = res.data.data[0];
        Object.keys(data).forEach((key) => {
          if (key && key.indexOf("_json") !== -1) {
            try {
              data[`${key}_data`] = JSON.parse(data[key]);
            } catch (e) {
              //TODO handle the exception
            }
          }
        });
        let page_row_json_data = data.page_row_json_data;

        this.pageId = data.id;
        this.pageName = page_row_json_data.page_name;
        this.pageTitle = page_row_json_data.page_title;
        this.comJson = page_row_json_data.component_json || [];
        this.pageConfg = data;

        // this.styleJson = page_row_json_data.page_style_json;
        // if (!this.styleJson) {
        //   this.styleJson = {
        //     width: this.screenType == 'PC' ? '1920px' : '375px',
        //     height: this.screenType == 'PC' ? '1080px' : '667px',
        //   }
        // }
        this.contentData = {
          width:
            this.styleJson?.width ||
            (this.screenType === "mobile" ? "375px" : "1920px"),
          height:
            this.styleJson?.height ||
            (this.screenType === "mobile" ? "667px" : "1080px"),
        };
        // if (this.isDataview) {
        //   delete this.styleJson.width;
        //   delete this.styleJson.height;
        // }
        if (!this.comJson) return;
        // this.comJson.forEach((com, i) => {
        //   this.comList.forEach((list) => {
        //     if (list.com_type === com.com_type) {
        //       this.comJson[i].example = list.example;
        //     }
        //   });
        // });
        this.comJson = this.comJson.sort((a, b) => a.layout_seq - b.layout_seq);

        this.layoutJson = data.layout_json_data;
        if (
          Array.isArray(data.layout_json_data) &&
          data.layout_json_data.length > 0
        ) {
          this.layoutJson.parts_json = data.layout_json_data.sort(
            (a, b) => a.seq - b.seq
          );
        }
        if (this.useLayout) {
          // 使用布局容器
          this.parentLayoutNo = data.layout_no;
          this.layoutJson.parts_json.forEach((item, index) => {
            // const data = this.comJson.find(e=>e.layout_seq===item.seq);
            const data = this.comJson[index];
            let obj = {
              x: item.pos_x,
              y: item.pos_y,
              w: item.row_span,
              h: item.col_span,
              i: item.id || new Date().getTime(), // item.seq - 1
              // i: index, // item.seq - 1
              layout_no: item.layout_no,
              data,
              isLeftBarItem: false,
              id: item.id,
            };

            this.layout.push(obj);
          });
        } else {
          // 直接将坐标、宽高存在组件上
          if (this.layoutJson?.parts_json?.length) {
          } else {
            this.comJson = this.comJson.sort((a, b) => a.com_seq - b.com_seq);
          }
          this.comJson.forEach((item, index) => {
            let layoutItem = {};
            if (this.layoutJson?.parts_json?.length - 1 >= index) {
              // 兼容之前使用布局容器的方案
              layoutItem = this.layoutJson.parts_json[index];
            }
            switch (item.com_type) {
              case "list":
                if (
                  !item.srv_req_json &&
                  item.list_json?.default_srv_req_json
                ) {
                  item.srv_req_json = item.list_json.default_srv_req_json;
                }
                if (!item.cols_map_json && item.list_json?.cols_map_json) {
                  item.cols_map_json = item.list_json.cols_map_json;
                }
                break;
              default:
                break;
            }
            const obj = {
              x: item.layout_x || 0,
              y:
                item.layout_y || item.layout_y === 0
                  ? item.layout_y
                  : index * this.initWH.h,
              z: item.layout_z || index + 1,
              w: item.layout_width || this.initWH.w,
              h: item.layout_height || this.initWH.h,
              i: item.id || new Date().getTime(), // item.seq - 1
              // layout_no: item.layout_no,
              data: {...item},
              isLeftBarItem: false,
              id: item.id,
              colNum: this.colNum,
            };
            if (
              layoutItem?.col_span &&
              layoutItem.row_span &&
              layoutItem.pos_x &&
              layoutItem.pos_y &&
              this.screenType === "pc" &&
              this.useLayout
            ) {
              obj.w = (layoutItem?.row_span * 100 * 1.6) / 1920;
              obj.h = (layoutItem?.col_span * 100 * 1.17) / 1080;
              obj.x = (layoutItem?.pos_x * 100 * 1.6) / 1920;
              obj.y = (layoutItem?.pos_y * 100 * 1.17) / 1080;
              obj.layout_no = layoutItem?.layout_no;
            }
            this.layout.push(JSON.parse(JSON.stringify(obj)));
          });
        }
        this.strLayout = JSON.stringify(this.layout);
        this.$set(this, "loadPageMata", data); // 保存页面元数据
        this.initPageParams(); // 页面参数初始化
      } else {
        this.$message.info("无数据！");
      }
    },
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
