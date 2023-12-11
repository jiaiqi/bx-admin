<template>
  <div class="">
    <el-tabs type="border-card" v-loading="pageLoading" v-model="activeTab">
      <el-tab-pane label="页面" name="页面">
        <div class="tab-content">
          <simple-update name="list-update" :defaultValues="pageConfg" :navAfterSubmit="false" :service="pageService"
            :pk="pageId" pkCol="id" @action-complete="onPageUpdate" @form-loaded="pageLoading = false" v-if="pageId">
          </simple-update>
          <simple-add :service="pageService" :navAfterSubmit="false" @executor-complete="onPageUpdate($event, 'add')"
            @form-loaded="pageLoading = false" @submitted2mem="" v-else>
          </simple-add>
        </div>
      </el-tab-pane>
      <el-tab-pane label="组件" name="组件" v-if="componentId || (!componentId && pageId && currentItem)"
        v-loading="componentLoading">
        <simple-update name="list-update" :service="componentService" :navAfterSubmit="false" :pk="componentId" pkCol="id"
          @action-complete="onComponentUpdate" @form-loaded="componentLoading = false" v-if="componentId">
        </simple-update>
        <simple-add ref="duplicate-form" :pageName="'list-duplicate'" :service="componentService"
          :defaultValues="addCompDefaultValues" @executor-complete="onComponentUpdate($event, 'add')"
          @form-loaded="componentLoading = false" :navAfterSubmit="false" @submitted2mem="" v-else-if="showAddComponent">
        </simple-add>
      </el-tab-pane>

      <el-tab-pane label="布局" name="布局">
        <div style="
            padding: 20px;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: flex-end;
          ">
          <el-button size="mini" type="primary" style="margin-right: 10px" @click="clickSave">保存</el-button>
          <el-button size="mini" type="primary" style="margin: 10px 10px 0 0" @click="toPreview">预览</el-button>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import simpleUpdate from "@/components/common/simple-update.vue";
import simpleAdd from "@/components/common/simple-add.vue";
import dayjs from "dayjs";
export default {
  components: {
    simpleUpdate,
    simpleAdd,
  },
  props: {
    pageConfg: {
      type: Object,
    },
    currentItem: {
      type: Object,
    },
    layout: Array,
    appNo: String,
  },
  watch: {
    componentId(newValue, oldValue) {
      if (newValue && !oldValue) {
        this.activeTab = "组件";
      } else if (!newValue && oldValue) {
        this.activeTab = "页面";
      }
      if (newValue && newValue !== oldValue) {
        this.componentLoading = true;
        this.layoutLoading = true;
      }
    },
  },
  computed: {
    showAddComponent() {
      return (
        this.currentItem?.data && this.currentItem.i && !this.componentId && this.pageId
      );
    },
    addCompDefaultValues() {
      return {
        com_type: this.currentItem.data.com_type,
        page_no: this.pageConfg.page_no,
        page_layout_no: this.pageConfg.layout_no,
        com_seq: (Number(this.currentItem.i) + 1) * 100,
        layout_seq: Number((new Date().getTime() + '').slice(-9)),
      };
    },
    currentComponent() {
      return this.currentItem?.id && this.currentItem?.data;
    },
    pageId() {
      if (this.pageConfg?.id) {
        return this.pageConfg?.id + "";
      }
    },
    pageService() {
      return this.pageId ? `srvpage_cfg_page_update` : `srvpage_cfg_page_add`;
    },
    componentId() {
      if (this.currentComponent?.id) {
        return this.currentComponent?.id + "";
      } else {
        return false;
      }
    },
    componentService() {
      if (this.componentId) {
        // update
        return `srvpage_cfg_page_component_update`;
      } else {
        // add
        return `srvpage_cfg_page_component_add`;
      }
    },
    layoutId() {
      if (this.currentItem?.id) {
        return this.currentItem?.id + "";
      }
    },
    layoutService() {
      if (this.layoutId) {
        return `srvpage_cfg_layout_update`;
      } else {
        return `srvpage_cfg_layout_add`;
      }
    },
  },
  data() {
    return {
      pageLoading: true,
      componentLoading: false,
      layoutLoading: false,
      activeTab: "页面",
    };
  },
  methods: {
    async addComponent(componentData) {
      if (componentData?.id) {
        // 组件创建成功后创建对应布局
        const item = this.currentItem;
        let  layout_name = componentData.com_name||componentData.com_label||"组件";
        layout_name += `_${item?.data?.com_type_name}_${dayjs().format("YYYY-MM-DD HH:mm:ss")}`
        const addObj = {
          serviceName: "srvpage_cfg_layout_add",
          data: [
            {
              layout_party: "组件",
              parent_no: this.pageConfg.layout_no,
              seq: componentData.layout_seq,
              pos_x: item.x,
              pos_y: item.y,
              col_span: item.h,
              row_span: item.w,
              layout_name:
                item?.data?.com_type_name +
                "_" +
                dayjs().format("YYYY-MM-DD HH:mm:ss"),
            },
          ],
        };
        return await this.httpOperate("add", addObj);
      }
    },
    async addPage(pageData) {
      // 新建页面
      if (pageData?.id) {
        const layout = this.layout.map((item) => {
          return {
            ...item,
            // 时间戳
            timestamp: Number((new Date().getTime() + '').slice(-9)),
          };
        });
        const pageName = pageData.page_name || pageData.page_title;
        // 创建页面容器
        let addObj = {
          serviceName: "srvpage_cfg_layout_add",
          srvApp: "config",
          data: [
            {
              layout_party: "页面",
              layout_name: `${pageName}_${dayjs().format(
                "YYYY-MM-DD HH:mm:ss"
              )}`,
            },
          ],
        };
        const layoutInfo = await this.httpOperate("add", addObj, null, true);

        // 创建子容器
        addObj.data = [];
        layout.forEach((item, i) => {
          addObj.data.push({
            layout_party: "组件",
            parent_no: layoutInfo.layout_no,
            layout_name: `${item?.data?.com_type_name}_${i + 1
              }_${dayjs().format("YYYY-MM-DD HH:mm:ss")}`,
            seq: item.timestamp || i + 1, //改用时间戳做关联 相对更可靠
            pos_x: item.x,
            pos_y: item.y,
            col_span: item.h,
            row_span: item.w,
          });
        });
        await this.httpOperate("add", addObj);
        // 将页面布局编号更新到页面信息中
        const updateObj = {
          serviceName: "srvpage_cfg_page_update",
          srvApp: "config",
          condition: [
            {
              ruleType: "eq",
              colName: "id",
              value: pageData.id,
            },
          ],
          data: [
            {
              layout_no: layoutInfo.layout_no,
              app_no: this.appNo,
            },
          ],
        };
        await this.httpOperate("update", [updateObj], pageData.id);

        //创建子组件
        addObj = {
          serviceName: "srvpage_cfg_page_component_add",
          srvApp: "config",
          data: [],
        };
        layout.forEach((item, i) => {
          addObj.data.push({
            com_name: item.data.com_type_name,
            com_preview: item.data.example,
            page_layout_no: layoutInfo.layout_no,
            com_type: item.data.com_type,
            page_no: pageData.page_no,
            com_seq: (i + 1) * 100,
            layout_seq: item.timestamp || i + 1, //改用时间戳做关联 相对更可靠
          });
        });
        await this.httpOperate("add", addObj);
        return layoutInfo;
      }
    },
    async httpOperate(type, o, id, returnData) {
      let params = [];
      switch (type) {
        case "add":
          params = [
            {
              serviceName: o.serviceName,
              srvApp: "config",
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
        if (returnData) {
          return response.data.response[0].response.effect_data[0];
        } else {
          return response.data.response[0].response;
        }
      } else {
        this.$message.error(response.body.resultMessage);
      }
    },
    clickSave() {
      this.$emit("save");
    },
    toPreview() {
      this.$emit("preview");
    },
    onPageUpdate(event, type) {
      if (type === "add" && event?.data?.state === "SUCCESS") {
        const response = event?.data?.response?.[0]?.response?.effect_data;
        if (Array.isArray(response) && response.length > 0) {
          const resData = response[0];
          this.addPage(resData).then((res) => {
            if (res) {
              this.$emit("refresh", resData);
            }
          });
          return;
        }
      }
      this.$emit("refresh", "page", event);
    },
    onComponentUpdate(event, type) {
      console.log("onComponentUpdate", event);
      if (type === "add" && event?.data?.state === "SUCCESS") {
        // 组件创建成功
        // 编辑页面，新增组件
        const response = event?.data?.response?.[0]?.response?.effect_data;
        if (Array.isArray(response) && response.length > 0) {
          const resData = response[0];
          this.addComponent(resData).then((res) => {
            if (res) {
              this.$emit("refresh", resData);
              this.activeTab = '页面'
            }
          });
          return;
        }
      }
      this.$emit("refresh", "component", event);
    },
    onLayoutUpdate(event) {
      console.log("onLayoutUpdate", event);
    },
    onUpdateFormActionComplete(event) {
      console.log("onUpdateFormActionComplete", event);
    },
    onUpdateFormLoaded(event) {
      this.pageLoading = false;
      console.log("onUpdateFormLoaded", event);
    },
  },
};
</script>

<style lang="scss" scoped>
.el-tabs {
  width: 100%;
  height: calc(100vh - 2px);
  padding-bottom: 50px;
  overflow: hidden;
  border: none;

  // .tab-content{
  //   height: 100%;
  //   overflow-y: auto;
  // }
  ::v-deep .el-tab-pane {
    height: 100%;
  }

  ::v-deep .el-tabs--border-card {}

  ::v-deep .el-tabs__content {
    height: 100%;
    overflow-y: auto;
    padding: 0;
  }

  ::v-deep .el-form {
    .el-col {
      width: 100%;
    }
  }

  ::v-deep .el-form-item__label {
    text-align: left !important;
  }

  ::v-deep .el-form-item__content {
    margin-left: 0 !important;
  }
}
</style>
