<template>
  <!-- <div v-if="pageItem&&pageItem.com_label"> -->
  <!-- {{pageItem.com_label}} -->
  <!--    <el-tabs v-model="activeName" @tab-click="handleClick">-->
  <!--      <el-tab-pane :label="item.name" :name="item.name" v-for="item in tabs">-->
  <!--      -->
  <!--      </el-tab-pane>-->
  <!--    </el-tabs>-->
  <!-- </div> -->
  <div
    class="tabs"
    :class="{ 'vertical-tabs': vertical }"
  >
    <div
      class="tab-name-box"
      :class="{
        'justify-start': !vertical && leftTab,
        'justify-end': !vertical && rightTab,
        'justify-center': !vertical && !leftTab && !rightTab
      }"
    >
      <div
        class="tab-name"
        v-for="item in components"
        :key="item.id"
        :style="[activeName === item.com_name ? setActiveStyle : {}]"
        :class="{ active: activeName === item.com_name, 'button-mode': buttonMode }"
        @click="activeName = item.com_name"
        ref="tabItems"
      >
        {{ item.com_label || "xxx" }}
      </div>
      <!-- 添加动态下划线 -->
      <div
        class="tab-underline"
        :style="[underlineStyle]"
        v-if="!buttonMode"
      ></div>
    </div>
    <div class="tab-content">
      <div
        v-for="item in components"
        :key="item.id"
      >
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
      // 添加下划线样式数据
      underlineStyle: {
        width: '0px',
        transform: 'translateX(0px)',
      }
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
    buttonMode() {
      return this.tabsJson?.tabs_options?.includes('按钮样式');
    },
    vertical() {
      return this.tabsJson?.tabs_options?.includes('垂直方向')
    },
    leftTab() {
      return this.tabsJson?.tabs_options?.includes('靠左')
    },
    rightTab() {
      return this.tabsJson?.tabs_options?.includes('靠右')
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
  watch: {
    // 监听选中标签变化，更新下划线位置
    activeName: {
      handler() {
        this.$nextTick(() => {
          this.updateUnderlinePosition();
        });
      },
      immediate: true
    }
  },
  mounted() {
    // 初始化下划线位置
    this.$nextTick(() => {
      this.updateUnderlinePosition();
    });
  },
  methods: {
    // 更新下划线位置
    updateUnderlinePosition() {
      if (this.buttonMode) {
        return
      }
      if (!this.$refs.tabItems || !this.$refs.tabItems.length) return;

      const activeIndex = this.components.findIndex(item => item.com_name === this.activeName);
      if (activeIndex === -1) return;

      const activeTab = this.$refs.tabItems[activeIndex];
      if (!activeTab) return;

      // 获取选中标签的宽度和位置
      const { width, left } = activeTab.getBoundingClientRect();
      const parentLeft = this.$el.querySelector('.tab-name-box').getBoundingClientRect().left;

      // 计算下划线位置
      this.underlineStyle = {
        width: `${width}px`,
        transform: `translateX(${left - parentLeft}px)`
      };
    }
  }
};
</script>

<style lang="scss" scoped>
.tabs {
  padding: 10px;
  &.vertical-tabs {
    display: flex;

    .tab-name-box {
      flex-direction: column;
      padding: 10px 40px;
      gap: 10px;

      .tab-name {
        min-width: 200px;
        text-align: center;
      }
    }

    .tab-content {
      flex: 1;
    }
  }
}

.tab-name-box {
  display: flex;
  align-items: center;
  position: relative; // 添加相对定位
  margin-bottom: 5px;

  .tab-name {
    cursor: pointer;
    padding: 0 4px 8px; // 添加底部内边距，为下划线留出空间
    position: relative; // 添加相对定位

    &:not(.button-mode) {
      margin-right: 20px;
    }

    &.active:not(.button-mode) {
      color: var(--primary-color, #409EFF);
    }

    &.button-mode {
      color: var(--primary-color, #409EFF);
      border: 1px solid var(--primary-color, #409EFF);
      border-radius: 0;
      padding: 4px 16px;
      margin-right: 10px;
    }

    &.active.button-mode {
      color: #fff;
      background-color: var(--primary-color, #409EFF);
    }
  }

  // 添加下划线样式
  .tab-underline {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 3px;
    background-color: var(--primary-color, #409EFF); // 默认颜色
    transition: transform 0.3s ease, width 0.3s ease; // 添加过渡动画
    border-radius: 1px;
  }
}
</style>