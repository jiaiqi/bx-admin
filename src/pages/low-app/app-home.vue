<template>
 <div class="app_home">
  <!--信息头部-->
   <div class="app_header">
     <div class="app_other"></div>
     <div class="app_name"></div>
     <div class="app_bts">
       <li><el-button type="primary" size="mini" @click="initPage">刷新</el-button></li>
       <li><el-button type="primary" size="mini"
                      @click="onSave"
                      :loading="isSaving"
       >保存</el-button></li>
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
             @UpdateComponents="UpdateComponents"
             :components="components"
             :isPreview="false"
             ref="editRef"
             @ComponentsSwapped="ComponentsSwapped"
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
       <property-view
           class="property-view-app"
           app-no="config"
           :page-config="pageConfig"
           :key="pageRefreshKey"
           :current-item="currentItem"
           :current-id="currentId"
           :components="components"
           ref="propertyRef"
           @refresh="onRefresh"
       />
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
import PropertyView from "@/pages/low-app/app-materials/property/index.vue";
import debounce from "lodash/debounce";
export default{
  name: "app-home",
  components: {
    MaterialsView,
    RenderPage,
    PropertyView
  },
  data(){
    return{
      // 保存按钮状态
      isSaving: false,
      components:[],
      materialsCollapsed:false,
      propertyCollapsed:false,
      pageRefreshKey: new Date().getTime(),
      pageNo: null,
      draggingComponentType: null, //拖拽组件类型
      pageConfig: null,
      currentId:'',
      currentItem:null,
      positionChange:[]
    }
  },
  created(){
    this.pageNo = this.$route.query.pageNo || this.$route.params.pageNo;
    if (this.pageNo) {
      this.initPage();
    }
  },
  methods:{
    //获取被交换位置的组件信息
    ComponentsSwapped(list){
     console.log('位置被交换了',list);
     this.positionChange=list;
    },
    //实时刷新
    onRefresh() {
      setTimeout(() => {
        // location.reload();
        this.initPage();
        this.pageRefreshKey = new Date().getTime();
      }, 150);
    },
    //实时更新更新组件列表
    UpdateComponents(newComponents) {
      this.components = newComponents;
    },
    //防抖方式的保存
    onSave: debounce(function () {

      // 1. 看页面属性有没有发生变化 有的话先保存页面属性
      if (this.isSaving) return; // 如果正在保存，则不重复执行

      this.isSaving = true;

      const savePromise = this.$refs?.propertyRef?.handleSave();

      // 检查返回值是否是Promise
      if (savePromise && typeof savePromise.then === "function") {
        savePromise
            .then(() => {
              // PropertyView组件内部已经有成功提示，这里不再重复提示
            })
            .catch((err) => {
              this.$message.error("保存失败：" + (err?.message || "未知错误"));
            })
            .finally(() => {
              this.isSaving = false;
            });
      } else {
        // 如果不是Promise，直接设置状态为false
        this.isSaving = false;
      }
    }, 500),

    //组件被点击了
    handleComponentClick(list,val){
     console.log('被点击的组件是',val);
     console.log('已经加入画布的组件列表',list)
      this.currentId =val.com_no?val.id:null;
      this.currentItem = val;
    },
    //预览
    showPreview(){

      const url = process.env.NODE_ENV === "development"?`http://192.168.0.28/xmp/views/custom/index/index?page_no=${this.pageNo}`:`/xmp/views/custom/index/index?page_no=${this.pageNo}`;
      window.open(url, "_blank");
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