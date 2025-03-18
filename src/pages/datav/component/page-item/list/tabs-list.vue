<template>
  <!-- <div v-if="pageItem&&pageItem.com_label"> -->
  <!-- {{pageItem.com_label}} -->
  <!--    <el-tabs v-model="activeName" @tab-click="handleClick">-->
  <!--      <el-tab-pane :label="item.name" :name="item.name" v-for="item in tabs">-->
  <!--      -->
  <!--      </el-tab-pane>-->
  <!--    </el-tabs>-->
  <!-- </div> -->
  <div class="tabs">
    <div class="tab-name-box">
      <div
        class="tab-name"
        v-for="item in components"
        :key="item.id"
        :style="[activeName === item.com_name ? setActiveStyle : {}]"
        :class="{ active: activeName === item.com_name }"
        @click="activeName = item.com_name"
      >
        {{ item.com_label || "xxx" }}
      </div>
    </div>
    <div class="tab-content">
      <div v-for="item in components" :key="item.id">
        <page-item
          use-layout="false"
          ref="pageItem"
          :page-item="item"
          :in-tabs="true"
          v-if="activeName === item.com_name"
        ></page-item>
        <!-- <List
          v-if="activeName === item.com_name"
          :ref="item.com_type"
          :pageItem="item"
        ></List> -->
      </div>
    </div>
  </div>
  <!-- <el-tabs v-model="activeName">
    <el-tab-pane
      :label="item.com_name"
      :name="item.com_no"
      :key="item.id"
      v-for="item in components"
    >
      <List :ref="item.com_type" :pageItem="item"></List>
      <page-item
        use-layout="false"
        ref="pageItem"
        :page-item="item.data"
        :layout="item"
      ></page-item>
    </el-tab-pane>
  </el-tabs> -->
</template>

<script>
// import pageItem from "@/pages/datav/component/page-item/page-item.vue";
import List from "../list/list.vue";
import { formatStyleData } from "@/pages/datav/common/index.js";
// import pageItem from "@/pages/datav/component/page-item/page-item.vue";
export default {
  components: {
    pageItem: () => import("@/pages/datav/component/page-item/page-item.vue"),
    List,
  },
  data() {
    return {
      activeName: "",
      tabs: [],
    };
  },
  props: {
    pageItem: {
      type: Object,
    },
  },
  computed: {
    tabsJson() {
      return this.pageItem.tabs_json;
    },
    componentsTab() {
      return (
        Array.isArray(this.tabsJson?.com_json) && this.tabsJson?.com_json.length
      );
    },
    components() {
      return this.tabsJson.com_json || [];
    },
    setActiveStyle() {
      return formatStyleData(this.tabsJson?.active_style_json);
    },
  },
  created() {
    if (this.pageItem?.srv_req_type === "模拟数据") {
      this.tabs = this.pageItem.mock_srv_data_json || [];
      if (this.tabs.length > 0) {
        this.activeName = this.tabs[0].name;
      }
    }
    if (this.components.length) {
      this.activeName = this.components[0].com_name;
    }
  },
};
</script>

<style lang="scss" scoped>
.tab-name-box {
  display: flex;
  column-gap: 20px;
  align-items: center;
  .tab-name {
    cursor: pointer;
  }
}
</style>
