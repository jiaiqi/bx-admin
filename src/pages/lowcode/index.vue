<template>
  <div class="lowcode-wrapper">
    <header-view
      :is-preview.sync="previewVisible"
      :json-visible.sync="jsonVisible"
    >
      <template #right>
        <el-button type="primary" size="mini" @click="onSave">保存</el-button>
      </template>
    </header-view>
    <div class="lowcode-content">
      <!-- 修改物料面板，添加收缩功能 -->
      <div class="materials-panel-container" :class="{'collapsed': materialsCollapsed}">
        <div class="materials-toggle" @click="toggleMaterialsPanel">
          <i :class="materialsCollapsed ? 'el-icon-arrow-right' : 'el-icon-arrow-left'"></i>
        </div>
        <materials-view class="materials-view"></materials-view>
      </div>
      <div class="editor-container">
        <editor-view
          :components="components"
          @select="currentChange"
          @change="componentsChange"
        ></editor-view>
      </div>
      <div class="property-panel-container" :class="{'collapsed': propertyCollapsed}">
        <div class="property-toggle" @click="togglePropertyPanel">
          <i :class="propertyCollapsed ? 'el-icon-arrow-left' : 'el-icon-arrow-right'"></i>
        </div>
        <property-view
          class="property-view"
          :page-config="pageConfig"
          :current-item="currentItem"
          :current-id="currentId"
          :components="components"
          @change="componentsChange"
        ></property-view>
      </div>
    </div>
    <!-- 其他对话框和抽屉保持不变 -->
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
    };
  },
  created() {
    this.pageNo = this.$route.query.pageNo || this.$route.params.pageNo;
    if (this.pageNo) {
      this.initPage();
    }
  },
  methods: {
    // 切换物料面板
    toggleMaterialsPanel() {
      this.materialsCollapsed = !this.materialsCollapsed;
    },
    // 切换属性面板
    togglePropertyPanel() {
      this.propertyCollapsed = !this.propertyCollapsed;
    },
    onSave() {
      // 1. 看页面属性有没有发生变化 有的话先保存页面属性
    },
    // 页面配置保存
    async savePage() {},
    async saveComponent() {},
    clickSave() {
      if (this.layout.length === 0) {
        this.$message.error("画布为空！");
        return;
      }

      this.$confirm("是否确认保存", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          this.saveFn();
        })
        .catch(() => {
          // 已取消
        });
    },
    async saveFn() {
      const layout = this.layout.map((item) => {
        return {
          ...item,
          timestamp: Number((new Date().getTime() + "").slice(-9)),
        };
      });
      // 新增保存

      // 编辑保存
      // 子容器
      const parseLayout = JSON.parse(this.strLayout || "[]");
      // 删除的子容器id数组
      let arrLayoutDel = [];
      // add子容器入参
      let addLayout = {
        serviceName: "srvpage_cfg_layout_add",
        data: [],
      };
      // update子容器入参
      let arrUpdateLayout = [];
      // delete子容器入参
      let deleteLayout = {
        serviceName: "srvpage_cfg_layout_delete",
      };

      let arrComDel = [];
      let addCom = {
        serviceName: "srvpage_cfg_page_component_add",
        data: [],
      };
      let deleteCom = {
        serviceName: "srvpage_cfg_page_component_delete",
      };
      // 更新、删除布局容器
      if (Array.isArray(parseLayout) && parseLayout.length) {
        parseLayout.forEach((oldItem) => {
          let isDel = true;
          layout.forEach((item, i) => {
            if (oldItem.id === item.id) {
              isDel = false;
              if (
                oldItem.x !== item.x ||
                oldItem.y !== item.y ||
                oldItem.h !== item.h ||
                oldItem.w !== item.w
              ) {
                // x y h w 有任意一个发生变化，则更新
                const data = {};
                // x y h w 在服务端对应的字段
                const keyMap = {
                  x: "pos_x",
                  y: "pos_y",
                  h: "col_span",
                  w: "row_span",
                };
                Object.keys(keyMap).forEach((key) => {
                  if (oldItem[key] !== item[key]) {
                    data[keyMap[key]] = item[key];
                  }
                });
                arrUpdateLayout.push({
                  serviceName: "srvpage_cfg_layout_update",
                  srvApp: "config",
                  condition: [
                    {
                      colName: "id",
                      ruleType: "eq",
                      value: item.id,
                    },
                  ],
                  data: [data],
                });
              }
            }
          });
          if (isDel) {
            // 删除
            arrLayoutDel.push(oldItem.id);
            arrComDel.push(oldItem.data.id);
          }
        });
      }

      layout.forEach((item, i) => {
        if (!item.id) {
          // 新增组件
          addCom.data.push({
            com_name: item.data.com_type_name,
            com_preview: item.data.example,
            page_layout_no: this.layoutObj.layout_no,
            com_type: item.data.com_type,
            page_no: this.pgNo,
            com_seq: (i + 1) * 100,
            layout_seq: item.timestamp || i + 1,
          });
        }
      });

      // 组件
      if (arrComDel.length > 0) {
        await this.saveService("delete", deleteCom, arrComDel.join());
      }
      if (addCom.data.length > 0) {
        await this.saveService("add", addCom);
      }

      this.layout = [];
      this.initPage();
    },
    async saveService(type, o, id, isTrue) {
      let params = [];
      switch (type) {
        case "add":
          params = [
            {
              serviceName: o.serviceName,
              srvApp: "config",
              condition: [],
              data: o.data,
            },
          ];
          break;
        case "update":
          params = o;
          break;
        case "delete":
          params = [
            {
              serviceName: o.serviceName,
              srvApp: "config",
              condition: [{ colName: "id", ruleType: "in", value: id }],
            },
          ];
          break;
      }

      const response = await this.operate(params);
      if (response.data.state === "SUCCESS") {
        if (isTrue) {
          return response.data.response[0].response.effect_data[0];
        } else {
          return response.data.response[0].response;
        }
      } else {
        this.$message.error(response.body.resultMessage);
      }
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
            }else {
              item.component = 'normal-component'
              item.data = {...item}
              const keys = ['component','type','_type']
              keys.forEach((key) => {
                if (item.data[key]) {
                  delete item.data[key]
                }
              })
            }

            return item;
          }
        );
        if (!Array.isArray(component_json)) return;
        this.components = this.buildComponentsTree(component_json);
        // component_json.sort((a, b) => a.com_seq - b.com_seq)
        this.initPageParams(); // 页面参数初始化
      } else if (msg) {
        this.$message.error(msg);
      } else {
        this.$message.info("无数据！");
      }
    },
    buildReqParams() {
      let components = this.components;
      const req = [
        {
          serviceName: "srvpage_cfg_page_component_add",
          condition: [],
          data: [
            {
              com_type: "layout",
              show_label: "是",
              display: "是",
              page_com_interface_json: "{}",
              child_count: 0,
              page_no: "PG2504010001",
            },
          ],
        },
      ];
    },
    // 更新页面属性时同时创建新增的组件，以及对应的组件配置
    async insertComponents(pageData, layout) {
      if (pageData?.id) {
        //创建子组件
        if (layout?.length === 0) {
          // 页面上没有组件 直接通知父组件刷新页面
          return true;
        }
        let addCompArr = [];
        // 每次新增加组件类型之后要将组件表的自动生成编号字段加到componentNoKey中，创建组件的时候不能提交这个字段
        const componentNoKey = [
          "current_info_no",
          "chart_no",
          "swiper_no",
          "list_no",
          "grid_no",
          "cardg_no",
          "map_no",
          "tabs_no",
          "widget_no",
          "noticebar_no",
          "tabs_no",
          "form_no",
          "current_info_no",
          "userlist_no",
          "calendar_no",
          "card_layout_no",
          "nav_no",
        ];
        const ignoreField = [
          ...componentNoKey,
          "notice_bar_json",
          "tabs_json",
          "form_json",
          "map_json",
          "interface_json",
          "cols_map_json",
          "swiper_json",
          "widget_json",
          "srv_req_json",
          "list_json",
          "card_group_json",
          "sys_option",
          "chart_json",
          "com_type",
          "comp_label",
          "create_time",
          "com_no",
          "create_user",
          "create_user_disp",
          "del_flag",
          "id",
          "modify_time",
          "modify_user",
          "modify_user_disp",
          "row_json",
          "page_no",
          "image",
        ];
        layout.forEach((item, i) => {
          const data = { ...item.data };
          ignoreField.forEach((key) => {
            if (data[key]) {
              delete data[key];
            }
          });
          Object.keys(data).forEach((key) => {
            if (data[key] === "" || data[key] === null) {
              delete data[key];
            }
          });
          const compObj = {
            serviceName: "",
            srvApp: "config",
            data: [data],
          };
          switch (item.data.com_type) {
            case "chart":
              compObj.serviceName = "srvpage_cfg_com_chart_add";
              break;
            case "list":
              compObj.serviceName = "srvpage_cfg_com_list_add";
              break;
            case "cardGroup":
              compObj.serviceName = "srvpage_cfg_card_group_add";
              break;
            case "控件":
            case "widget":
              compObj.serviceName = "srvpage_cfg_meta_col_widget_add";
              break;
            case "swiper":
              compObj.serviceName = "srvpage_cfg_figure_swiper_add";
              break;
            case "map":
              compObj.serviceName = "srvpage_cfg_com_map_add";
              break;
            case "noticeBar":
              compObj.serviceName = "srvpage_cfg_com_notice_bar_add";
              break;
            case "form": //表单
              compObj.serviceName = "srvpage_cfg_com_form_add";
              break;
            case "tabs": //
              compObj.serviceName = "srvpage_cfg_com_tabs_add";
              break;
            case "grid": //
              compObj.serviceName = "srvpage_cfg_com_grid_update";
              compObj.condition = [
                {
                  colName: "grid_no",
                  ruleType: "eq",
                  value: data?.grid_no,
                },
              ];
              break;
            case "navBar":
              compObj.serviceName = "srvpage_cfg_page_nav_bar_add";
              break;
          }
          addCompArr.push(compObj);
        });
        let compRes = await this.httpOperate("batch_add", addCompArr);

        let addObj = {
          serviceName: "srvpage_cfg_page_component_add",
          srvApp: "config",
          data: [],
        };
        let componentsLength = 0;
        if (
          pageData.component_json &&
          typeof pageData.component_json === "string"
        ) {
          componentsLength = JSON.parse(pageData.component_json)?.length;
        }
        if (isNaN(componentsLength)) {
          componentsLength = 0;
        }
        layout.forEach((item, index) => {
          const comp = compRes[index]?.response?.effect_data?.[0];
          const data = {
            com_name: item.data.chart_name,
            com_preview: item.data.example,
            com_type: item.data.com_type,
            page_no: pageData.page_no,
            com_seq: (index + 1 + componentsLength) * 100,
            layout_x: item.x,
            layout_y: item.y,
            layout_z: item.z,
            layout_width: item.w,
            layout_height: item.h,
          };
          switch (item.data.com_type) {
            case "chart":
              data.chart_no = comp?.chart_no;
              break;
            case "list":
              data.list_no = comp?.list_no;
            case "cardGroup":
              data.card_group_no = comp?.cardg_no;
              break;
            case "控件":
            case "widget":
              data.widget_no = comp?.widget_no;
              break;
            case "swiper":
              data.swiper_no = comp?.swiper_no;
              // data.image = null;
              break;
            case "map":
              data.map_no = comp?.map_no;
              break;
            case "noticeBar":
              data.notice_bar_no = comp?.noticebar_no;
              break;
            case "form":
              data.form_no = comp?.form_no;
            case "tabs":
              data.tabs_no = comp?.tabs_no;
              break;
            case "grid":
              data.grid_no = comp?.grid_no;
              break;
            case "navBar":
              data.com_case_no = comp?.nav_no;
              break;
          }
          addObj.data.push(data);
        });
        return await this.httpOperate("add", addObj);
      }
    },
    initPageParams() {},
    currentChange(id, item) {
      this.currentId = id;
      this.currentItem = item;
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
}
</style>
