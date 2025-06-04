<template>
 <div class="app_home">
  <!--信息头部-->
   <div class="app_header">
     <div class="app_other"></div>
     <div class="app_name"></div>
     <div class="app_bts">
       <li><el-button type="primary" size="mini" @click="initPage">刷新</el-button></li>
       <li><el-button type="primary" size="mini" @click="initPage">保存</el-button></li>
       <li>
         <el-button type="primary" size="mini" @click="showPreview"><i class="el-icon-view"></i>预览</el-button>
       </li>
     </div>
   </div>
<!--编辑区容器-->
   <div class="app_content">
     <div :class="materialsCollapsed?'app_left_act':'app_left'">
    <!--收缩框控制器-->
       <div class="materials-toggle" @click="setToggle('mater')">
         <i
             :class="
              materialsCollapsed ? 'el-icon-arrow-right' : 'el-icon-arrow-left'
            "
         ></i>
       </div>
       <materials-view
           v-show="!materialsCollapsed"
           @drag-start="onDragStart"
           @drag-end="onDragEnd"
       />
     </div>
     <div class="app_center">
       <div class="app_edit_main">
         <RenderPage
             @componentClick="handleComponentClick"
             :components="components"
         />
       </div>
     </div>
     <div :class="propertyCollapsed?'app_right_act':'app_right'">
       <div class="property-toggle" @click="setToggle('pro')">
         <i
             :class="
              propertyCollapsed ? 'el-icon-arrow-left' : 'el-icon-arrow-right'
            "
         ></i>
       </div>
     </div>
   </div>
 </div>
</template>

<script>
import MaterialsView from "@/pages/low-app/app-materials/index.vue";
import {$selectList, $selectOne} from "@/common/http";
import {pageCompCols} from "@/pages/lowcode/components/property/columns";
import RenderPage from "@/pages/low-app/editor-home/render-page.vue";
import dragStore from "@/pages/low-app/app-materials/store/dragStore";
export default{
  name: "app-home",
  components: {
    MaterialsView,
    RenderPage
  },
  data(){
    return{
      components:[],
      materialsCollapsed:false,
      propertyCollapsed:false,
      pageRefreshKey: new Date().getTime(),
      pageNo: null,
      draggingComponentType: null, //拖拽组件类型
      pageConfig: null,
      currentId:'',
      currentItem:null,
    }
  },
  created(){
    this.pageNo = this.$route.query.pageNo || this.$route.params.pageNo;
    if (this.pageNo) {
      this.initPage();
    }
  },
  methods:{

    //组件被点击了
    handleComponentClick(val){
     console.log('被点击的组件是',val);
      this.currentId = val.id;
      this.currentItem = val;
    },
    //预览
    showPreview(){

    },
    //容器收缩板
    setToggle(type){
     if(type==='mater'){
       this.materialsCollapsed = !this.materialsCollapsed;
     }else {
       this.propertyCollapsed = !this.propertyCollapsed;
     }
    },
    //组件开始拖拽
    onDragStart(data) {
      this.draggingComponentType = data.type;
      // 设置拖拽组件信息到dragStore
      dragStore.setDraggingElement(data);
      console.log('当前拖拽的组件',data.type);
    },
    //组件拖拽结束
    onDragEnd() {
      this.draggingComponentType = null;
    },
    //初始化界面信息
    async initPage() {
      console.log("initPage");
      const url = `/config/select/srvpage_cfg_page_guest_select`;
      const req = {
        serviceName: "srvpage_cfg_page_guest_select",
        // colNames: ["*"],
        colNames: [
          "page_title",
          "page_name",
          "id",
          "page_style_no",
          "srv_req_no",
          "preview",
          "page_no",
          "page_options",
          "tmpl_page_no",
          "page_style_json",
        ],
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
        // this.initComponents(newData);
        // this.getPageComponents().then((list) => {
        //   if(Array.isArray(list)){
        //     this.initComponents(list);
        //   }
        // });
       await this.initComponents(newData);
        this.pageRefreshKey = new Date().getTime();
      } else if (msg) {
        this.$message.error(msg);
      } else {
        this.$message.info("无数据！");
      }
    },

    async initComponents(data) {
      const list = await this.getPageComponents();
      const component_json = list?.map((item) => {
        item.visible = item.display !== "否";
        if(item.com_type!=='layout'){
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
      });
      if (!Array.isArray(component_json)) {
        this.components = [];
        return;
      }else {
        this.components = component_json.filter(item => item.com_type !== 'layout');
      }
      console.log('---获取到的界面信息',this.components)
    },
    //构建组件树
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
    //获取界面组件信息
    async getPageComponents() {
      const url = `/config/select/srvpage_cfg_page_component_select`;
      const req = {
        serviceName: "srvpage_cfg_page_component_select",
        colNames: ["*"],
        condition: [
          {
            colName: "page_no",
            ruleType: "eq",
            value: this.pageNo,
          },
        ],
      };
      const { data, ok, msg } = await $selectList(url, req);
      if (ok) {
        if (Array.isArray(data) && data.length) {
          let list = [];
          console.log("getPageComponents:", data);

          data.forEach((item) => {
            if (typeof item.com_json === "string") {
              try {
                const json = JSON.parse(item.com_json);
                list.push({
                  _raw_data: item,
                  ...json,
                });
              } catch (e) {
                console.error(e);
              }
            }
          });
          console.log("getPageComponents", list);
          return list;
        }
      } else if (msg) {
        this.$message.error(msg);
      } else {
        this.$message.info("无数据！");
      }
    },
    //初始化界面配置详情
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
        // this.initTheme({
        //   currentTheme: currentTheme,
        //   themeList: data.app_json_data.theme_list || [],
        // });
      }

      return data;
    },
  }
}
</script>


<style scoped lang="less">
@import "app-home.less";
</style>