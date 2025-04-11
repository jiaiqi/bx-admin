<template>
  <div class="lowcode-wrapper">
    <header-view
      :is-preview.sync="previewVisible"
      :json-visible.sync="jsonVisible"
      @click.native="currentChange"
      v-if="!isView"
    >
      <template #right>
        <el-button
          type="primary"
          size="mini"
          @click="initPage"
        >刷新</el-button>
        <el-button
          type="primary"
          size="mini"
          @click="onSave"
        >保存</el-button>
      </template>
    </header-view>
    <div class="lowcode-content">
      <!-- 修改物料面板，添加收缩功能 -->
      <div
        class="materials-panel-container"
        :class="{ collapsed: materialsCollapsed }"
        v-if="!isView"
      >
        <div
          class="materials-toggle"
          @click="toggleMaterialsPanel"
        >
          <i :class="materialsCollapsed ? 'el-icon-arrow-right' : 'el-icon-arrow-left'
            "></i>
        </div>
        <materials-view class="materials-view"></materials-view>
      </div>
      <div
        class="editor-container"
        :class="{ 'in-edit': !isPreview && !isView }"
      >
        <editor-view
          :components="components"
          @select="currentChange"
          @change="componentsChange"
          @delete="onDel"
          @resize="onResize"
          :content-width="contentAreaWidth"
          :style="setStyle"
        ></editor-view>
      </div>
      <div
        class="property-panel-container"
        :class="{ collapsed: propertyCollapsed }"
        v-if="!isView"
      >
        <div
          class="property-toggle"
          @click="togglePropertyPanel"
        >
          <i :class="propertyCollapsed ? 'el-icon-arrow-left' : 'el-icon-arrow-right'
            "></i>
        </div>
        <property-view
          class="property-view"
          :page-config="pageConfig"
          :current-item="currentItem"
          :current-id="currentId"
          :components="components"
          ref="propertyRef"
          @change="componentsChange"
          @page-change="onPageChange"
          @refresh="initPage"
        ></property-view>
      </div>
    </div>
    <el-dialog
      title="页面预览"
      :visible.sync="previewVisible"
      fullscreen
      v-if="!isView"
    >
      <div
        slot="title"
        class="dialog-title flex justify-between px-4"
      >
        <div class="flex items-center">
          <span class="mr-2">预览</span>
          <Icon icon="mdi-light:eye" />
        </div>
        <el-button
          type="primary"
          size="mini"
          @click="openNewTab"
        >页面预览</el-button>
      </div>
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
      v-if="!isView"
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
import { $http, $selectOne, $delete } from "@/common/http";
import { pageCompCols } from "./components/property/columns";
import { Icon } from "@iconify/vue2";
import clickoutside from "@/pages/datav/common/clickoutside.js";
import { formatStyleData } from "@/common/common";
import cloneDeep from "lodash/cloneDeep";
export default {
  name: "lowcode-main",
  components: {
    HeaderView,
    MaterialsView,
    EditorView,
    PropertyView,
    JsonViewer,
    lcView,
    Icon,
  },
  directives: {
    clickoutside: clickoutside,
  },
  computed: {
    isView() {
      return this.$route.meta?.isView === true;
    },
    contentAreaWidth() {
      let width = this.pageConfig?.content_area_width || 1200;
      return typeof width === "string" && width?.includes("%")
        ? width
        : `${parseFloat(width)}px`;
    },
    setStyle() {
      let style = {}
      if (this.pageConfig?.page_style_json_data) {
        style = this.pageConfig?.page_style_json_data
      }
      return formatStyleData(style)
    }
  },
  data() {
    return {
      //
      pageNo: null,
      currentId: null,
      currentItem: null,
      structureData: null,
      jsonVisible: false,
      previewVisible: false,
      // 组件数据
      components: [],
      comJson: [],
      pageConfig: null,
      // 属性面板折叠状态
      propertyCollapsed: false,
      // 添加物料面板折叠状态
      materialsCollapsed: false,
      isPreview: false,
    };
  },
  created() {
    this.pageNo = this.$route.query.pageNo || this.$route.params.pageNo;
    if (this.pageNo) {
      this.initPage();
    }
  },
  methods: {
    openNewTab() {
      const url = `/vpages/#/lowcode/view/${this.pageNo}`;
      window.open(url, "_blank");
    },
    // 切换物料面板
    toggleMaterialsPanel() {
      this.materialsCollapsed = !this.materialsCollapsed;
    },
    // 切换属性面板
    togglePropertyPanel() {
      this.propertyCollapsed = !this.propertyCollapsed;
    },
    findComponentById(components, id) {
      let result = null;
      if (!id || !components || !components.length) return result;
      for (let i = 0; i < components.length; i++) {
        const component = components[i];
        if (component.id == id) {
          result = component;
          if (result) {
            break;
          }
        } else if (
          Array.isArray(component.children) &&
          component.children.length
        ) {
          result = this.findComponentById(component.children, id);
          if (result) {
            break;
          }
        }
      }
      return result;
    },
    onResize({ id, width, height }) {
      function findComponentById(components, id) {
        let result = null;
        if (!id || !components || !components.length) return result;
        for (let i = 0; i < components.length; i++) {
          const component = components[i];
          if (component.id === id) {
            result = component;
            if (result) {
              break;
            }
          } else if (
            Array.isArray(component.children) &&
            component.children.length
          ) {
            result = findComponentById(component.children, id);
            if (result) {
              break;
            }
          }
        }
        return result;
      }
      let component = findComponentById(this.components, id);
      if (component && (width || height)) {
        if (width) {
          component.layout_width = width;
          this.$set(component, "layout_width", width);
        }
        if (height) {
          component.layout_height = height;
          this.$set(component, "layout_height", height);
        }
        if (!component._editType) {
          this.$set(component, "_editType", "update");
        }
      }
    },
    onSave() {
      // 1. 看页面属性有没有发生变化 有的话先保存页面属性
      this.$refs?.propertyRef?.onSave();
    },
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
        let newData = this.initPageConfig(data)
        this.initComponents(newData)
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
      return data
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
    initPageParams() { },
    currentChange(id, item) {
      this.currentId = id;
      this.currentItem = item;
    },
    componentsChange(val) {
      this.components = val;
    },

    onPageChange(val, type, compType, compId) {
      console.log(val, type);
      if(!val?.fieldName?.includes('style')){
        return
      }
      if (type === 'page-update') {
        let data = cloneDeep(val.formModel);
        this.initPageConfig(data)
      } else if (type === 'component-update' || type === 'component-add') {
        let id = val.formModel.id;
        if (id) {
          let component = this.findComponentById(this.components, id)
          if (component) {
            let value = val.value
            let key = val.fieldName
            if (key?.lastIndexOf('_json') === key.length - 5) {
              try {
                value = JSON.parse(value)
              } catch (e) {
                console.error(e);
              }
            }
            this.$set(component, key, value);
            if (component.data) {
              this.$set(component.data, key, value);
            }
          }
        }

      } else if (type === 'component-cfg-update') {
        // 组件配置
        let id = compId;
        if (!id) {
          return
        }
        let row = val.formModel;
        console.log('compType:', compType);
        let component = this.findComponentById(this.components, id)
        if (!component?.data) {
          return
        }
        switch (compType) {
          case "currentInfo": {
            this.$set(component.data, 'current_info_json', row);
            if (row.interface_json) {
              this.$set(component.data, 'page_com_interface_json', row.interface_json);
            }
            // if (row.current_info_json) {
            // m.current_info_json = JSON.parse(row.current_info_json);
            // if (m.current_info_json.interface_json) {
            //   m.page_com_interface_json = m.current_info_json.interface_json;
            // }
            // }
            break;
          }
          case "swiper": {
            this.$set(component.data, 'swiper_json', row);

            // if (row.swiper_json) {
            //   m.swiper_json = JSON.parse(row.swiper_json);
            //   if (m.swiper_json.interface_json) {
            //     m.page_com_interface_json = m.swiper_json.interface_json;
            //   }
            // }
            break;
          }
          case "userList": {
            this.$set(component.data, 'user_list_json', row);

            // if (row.user_list_json) {
            //   m.user_list_json = JSON.parse(row.user_list_json);
            //   if (m.user_list_json.interface_json) {
            //     m.page_com_interface_json = m.user_list_json.interface_json;
            //   }
            // }
            break;
          }
          case "noticeBar": {
            this.$set(component.data, 'notice_bar_json', row);

            // if (row.notice_bar_json) {
            //   m.notice_bar_json = JSON.parse(row.notice_bar_json);
            //   if (m.notice_bar_json.interface_json) {
            //     m.page_com_interface_json = m.notice_bar_json.interface_json;
            //   }
            // }
            break;
          }
          case "list": {
            this.$set(component.data, 'list_json', row);

            // if (row.list_json) {
            //   m.list_json = JSON.parse(row.list_json);
            //   if (m.list_json.interface_json) {
            //     m.page_com_interface_json = m.list_json.interface_json;
            //   }
            // }
            break;
          }
          case "grid": {
            this.$set(component.data, 'grid_json', row);

            // if (row.grid_json) {
            //   m.grid_json = JSON.parse(row.grid_json);
            //   if (m.grid_json.interface_json) {
            //     m.page_com_interface_json = m.grid_json.interface_json;
            //   }
            // }
            break;
          }
          case "cardGroup": {
            this.$set(component.data, 'card_group_json', row);

            // if (row.card_group_json) {
            //   m.card_group_json = JSON.parse(row.card_group_json);
            //   if (m.card_group_json.interface_json) {
            //     m.page_com_interface_json = m.card_group_json.interface_json;
            //   }
            // }
            break;
          }
          case "richTextCard": {
            this.$set(component.data, 'rich_text_card_json', row);

            // if (row.rich_text_card_json) {
            //   m.rich_text_card_json = JSON.parse(row.rich_text_card_json);
            //   if (m.rich_text_card_json.interface_json) {
            //     m.page_com_interface_json = m.rich_text_card_json.interface_json;
            //   }
            // }
            break;
          }
          case "videoCard": {
            this.$set(component.data, 'video_card_json', row);

            // if (row.video_card_json) {
            //   m.video_card_json = JSON.parse(row.video_card_json);
            //   if (m.video_card_json.interface_json) {
            //     m.page_com_interface_json = m.video_card_json.interface_json;
            //   }
            // }
            break;
          }
          case "map": {
            this.$set(component.data, 'map_json', row);

            // if (row.map_json) {
            //   m.map_json = JSON.parse(row.map_json);
            //   if (m.map_json.interface_json) {
            //     m.page_com_interface_json = m.map_json.interface_json;
            //   }
            // }
            break;
          }
          case "chart": {
            this.$set(component.data, 'chart_json', row);

            // if (row.chart_json) {
            //   m.chart_json = JSON.parse(row.chart_json);
            //   if (m.chart_json.interface_json) {
            //     m.page_com_interface_json = m.chart_json.interface_json;
            //   }
            // }
            break;
          }
          case "tabs": {
            this.$set(component.data, 'tabs_json', row);

            // if (row.tabs_json) {
            //   m.tabs_json = JSON.parse(row.tabs_json);
            //   if (row.relate_pages_json) {
            //     m.tabs_json.relate_pages_json = JSON.parse(row.relate_pages_json);
            //   }
            //   if (m.tabs_json.interface_json) {
            //     m.page_com_interface_json = m.tabs_json.interface_json;
            //   }
            // } else {
            //   m.tabs_json = {};
            //   if (row.relate_pages_json) {
            //     m.tabs_json.relate_pages_json = JSON.parse(row.relate_pages_json);
            //   }
            // }

            break;
          }
          case "form": {
            this.$set(component.data, 'form_json', row);

            // if (row.form_json) {
            //   m.form_json = JSON.parse(row.form_json);
            //   if (m.form_json.interface_json) {
            //     m.page_com_interface_json = m.form_json.interface_json;
            //   }
            // }
            break;
          }
          case "steps": {
            this.$set(component.data, 'steps_json', row);

            // if (row.steps_json) {
            //   m.steps_json = JSON.parse(row.steps_json);
            // }
            break;
          }
          case "footer": {
            this.$set(component.data, 'footer_json', row);

            // if (row.footer_json) {
            //   m.footer_json = JSON.parse(row.footer_json);
            // }
            break;
          }
          case "layout": {
            this.$set(component.data, 'layout_json', row);

            // if (row.layout_json) {
            //   m.layout_json = JSON.parse(row.layout_json);
            // }
            break;
          }
          case "控件": {
            this.$set(component.data, 'widget_json', row);

            // if (row.widget_json) {
            //   m.widget_json = JSON.parse(row.widget_json);
            // }
            break;

          }
          case "日历":
            this.$set(component.data, 'calendar_json', row);

            // if (row.calendar_json) {
            //   m.calendar_json = JSON.parse(row.calendar_json);
            // }
            break;

          default:
            break;

        }

      }
    },
    async deleteComponent(ids = "") {
      if (!ids) return;
      return await this.$confirm("确定要删除此组件吗？").then(async () => {
        const { data, ok, msg } = await $delete({
          app: "config",
          service: "srvpage_cfg_page_component_delete",
          value: ids,
        });
        if (ok) {
          this.$message.success(msg);
          this.initPage();
        } else {
          this.$message.error(msg);
        }
      });
    },
    async onDel(val) {
      this.currentId = null;
      this.currentItem = null;
      if (val?.com_no && val.id) {
        let getCompIds = function (list) {
          let ids = [];
          if (Array.isArray(list) && list.length) {
            list.forEach((item) => {
              if (item.id && item.com_no) {
                ids.push(item.id);
              }
              if (item.children?.length) {
                ids = ids.concat(getCompIds(item.children));
              }
            });
          }
          return ids;
        };
        const ids = [val.id, ...getCompIds(val.children)];
        return await this.deleteComponent(ids);
      }
      function del(val, list) {
        list = list.filter((item) => {
          if (val.id && item.id === val.id) {
            return false;
          } else if (item.children?.length) {
            item.children = del(val, item.children);
          }
          return true;
        });
        return list;
      }
      this.components = del(val, this.components);
    },
  },
};
</script>

<style lang="scss">
.lowcode-wrapper {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;

  .lowcode-content {
    flex: 1;
    display: flex;
    height: calc(100% - 50px);

    // 添加物料面板容器样式
    .materials-panel-container {
      position: relative;
      // width: 200px;
      height: 100%;
      transition: all 0.3s ease;
      background-color: #fff;
      box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);

      &.collapsed {
        width: 0px;

        .materials-view {
          transform: translateX(-100%);
          opacity: 0;
        }
      }

      .materials-toggle {
        position: absolute;
        right: -15px;
        top: 50%;
        transform: translateY(-50%);
        width: 15px;
        height: 40px;
        background-color: #fff;
        border-radius: 0 4px 4px 0;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
        z-index: 10;

        &:hover {
          background-color: #f5f7fa;
        }

        i {
          font-size: 12px;
          color: #909399;
        }
      }

      .materials-view {
        width: 100%;
        height: 100%;
        transition: all 0.3s ease;
        opacity: 1;
      }
    }

    .editor-container {
      flex: 1;
      transition: all 0.3s ease;

      &.in-edit {
        overflow: auto;
        padding: 50px;
        scrollbar-color: rgba(144, 146, 152, .3) transparent;
        scrollbar-width: thin;
        background-color: #fafafc;
        // #18181c 暗色
        background-size: 15px 15px, 15px 15px;
        background-image: linear-gradient(#fafafc 14px,transparent 0),linear-gradient(90deg,transparent 14px,#86909c 0);
        .editor-view {
          border: 1px dashed #666;
          min-height: 100vh;
        }
      }
    }

    // 属性面板容器样式保持不变
    .property-panel-container {
      position: relative;
      width: 300px;
      height: 100%;
      transition: all 0.3s ease;
      background-color: #fff;
      box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);

      &.collapsed {
        width: 0px;

        .property-view {
          transform: translateX(100%);
          opacity: 0;
        }
      }

      .property-toggle {
        position: absolute;
        left: -15px;
        top: 50%;
        transform: translateY(-50%);
        width: 15px;
        height: 40px;
        background-color: #fff;
        border-radius: 4px 0 0 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
        z-index: 10;

        &:hover {
          background-color: #f5f7fa;
        }

        i {
          font-size: 12px;
          color: #909399;
        }
      }

      .property-view {
        width: 100%;
        height: 100%;
        transition: all 0.3s ease;
        opacity: 1;
      }
    }

    ::v-deep .customhome-container {
      height: 100%;
    }
  }

  .lc-layout {

    &.view-mode,
    &.preview-mode {

      .resize-handle-s,
      .resize-handles {
        display: none;
      }
    }

    &.preview-mode {
      border-color: #f5f7fa;
    }

    &.view-mode {
      border-color: transparent;
    }
  }

  .preview-container {
    border: 1px dashed #ccc;
  }
}
</style>