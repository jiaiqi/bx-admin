<template>
  <div
    class="page-item"
    :class="{ mobile: screenType === 'mobile' }"
    v-if="pageItemData && pageItemData.com_type"
    :style="[mixCompStyle]"
  >
    <div
      class="page-item__label"
      v-if="
        inTabs !== true &&
        pageItemData.show_label === '是' &&
        pageItemData.com_label
      "
    >
      <div
        class="page-item__label-text"
        :style="[
          mixTitleStyle,
          {
            flexDirection: mixTitleIcon === '下划线' ? 'column' : 'row',
          },
        ]"
      >
        <span class="icon1" v-if="mixTitleIcon === '竖线'"></span>
        <span class="icon2" v-if="mixTitleIcon === '圆形'"></span>
        <span class="icon3" v-if="mixTitleIcon === '方块'"></span>
        <Icon
          icon="ri-arrow-drop-right-fill"
          v-if="mixTitleIcon === '三角形'"
        ></Icon>
        <span>
          {{ pageItemData.com_label }}
        </span>
        <span v-if="mixTitleIcon === '下划线'" class="under-line"></span>
      </div>

      <div
        class="more-btn"
        v-if="showMoreBtn && pageItemData.more_position !== '数据项后'"
      >
        <span @click="toMore">
          {{ pageItemData.more_label || "更多" }}
          <i class="el-icon-arrow-right"></i>
        </span>
      </div>
    </div>

    <nav-menu
      v-if="
        pageItemData.com_type === 'navBar' &&
        pageItemData.com_case_json &&
        pageItemData.com_case_json.disp_flag !== '否'
      "
      :follow-theme-color="followThemeColor"
      :config="pageItemData.com_case_json"
      :page-config="pageConfig"
    >
      <!-- {{ pageItemData.com_case_json.label }} -->
    </nav-menu>
    <iframe
      :src="getExtPageUrl"
      frameborder="0"
      style="width: 100%; height: 100%; border: none"
      v-else-if="pageItemData.com_type === 'extPage' && getExtPageUrl"
    ></iframe>
    <video-card
      :class="{ mobile: screenType === 'mobile' }"
      v-else-if="pageItemData.com_type === 'videoCard'"
      :ref="pageItemData.com_type"
      :pageItem="pageItemData"
    ></video-card>
    <current-info
      :class="{ mobile: screenType === 'mobile' }"
      v-else-if="pageItemData.com_type === 'currentInfo'"
      :ref="pageItemData.com_type"
      :pageItem="pageItemData"
    ></current-info>
    <slide-list
      :class="{ mobile: screenType === 'mobile' }"
      v-else-if="pageItemData.com_type === 'swiper'"
      :ref="pageItemData.com_type"
      :pageItem="pageItemData"
    ></slide-list>
    <user-list
      :class="{ mobile: screenType === 'mobile' }"
      v-else-if="pageItemData.com_type === 'userList'"
      :ref="pageItemData.com_type"
      :pageItem="pageItemData"
    ></user-list>
    <notice-bar
      :class="{ mobile: screenType === 'mobile' }"
      v-else-if="pageItemData.com_type === 'noticeBar'"
      :ref="pageItemData.com_type"
      :pageItem="pageItemData"
    ></notice-bar>
    <map-card
      :class="{ mobile: screenType === 'mobile' }"
      v-else-if="pageItemData.com_type === 'map'"
      :ref="pageItemData.com_type"
      :pageItem="pageItemData"
    ></map-card>
    <page-item-chart
      :class="{ mobile: screenType === 'mobile' }"
      v-else-if="pageItemData.com_type === 'chart'"
      :ref="pageItemData.com_type"
      :pageParamsModel="pageParamsModel"
      :pageItem="pageItemData"
      :index="(layout && layout.i) || 1"
      :layout="layout"
    ></page-item-chart>
    <List
      :class="{ mobile: screenType === 'mobile' }"
      v-else-if="pageItemData.com_type === 'list'"
      :pageParamsModel="pageParamsModel"
      @setPageParams="setPageParams"
      :ref="pageItemData.com_type"
      :pageItem="pageItemData"
    ></List>
    <tab-list
      :class="{ mobile: screenType === 'mobile' }"
      v-else-if="pageItemData.com_type === 'tabs'"
      :pageParamsModel="pageParamsModel"
      :ref="pageItemData.com_type"
      :pageItem="pageItemData"
    ></tab-list>
    <!-- <mix-list
      v-if="pageItem.com_type === 'list'"
      :ref="pageItem.com_type"
      :pageItem="pageItem"
    ></mix-list> -->
    <page-widget
      :class="{ mobile: screenType === 'mobile' }"
      v-else-if="pageItemData.com_type === '控件'"
      :ref="pageItemData.com_type"
      :pageItem="pageItemData"
      :page-no="pageNo"
      @resize="$emit('resize')"
    ></page-widget>
    <card-group
      :class="{ mobile: screenType === 'mobile' }"
      v-else-if="pageItemData.com_type === 'cardGroup'"
      :ref="pageItemData.com_type"
      :pageItem="pageItemData"
    ></card-group>
    <grid-card
      :class="{ mobile: screenType === 'mobile' }"
      v-else-if="pageItemData.com_type === 'grid'"
      :ref="pageItemData.com_type"
      :pageItem="pageItemData"
    ></grid-card>
    <form-add
      :class="{ mobile: screenType === 'mobile' }"
      v-else-if="
        pageItemData.com_type === 'form' &&
        pageItemData.form_json &&
        pageItemData.form_json.form_type === '新增'
      "
      :ref="pageItemData.com_type"
      :pageItem="pageItemData"
    ></form-add>
    <div
      v-else-if="pageItemData && pageItemData.com_label"
      :class="{ mobile: screenType === 'mobile' }"
    >
      {{ pageItemData.com_label }}
    </div>

    <div
      class="more-btn-bottom"
      v-if="showMoreBtn && pageItemData.more_position === '数据项后'"
      @click="toMore"
    >
      <span class="more-btn">
        {{ pageItemData.more_label || "更多" }}
      </span>
    </div>
  </div>
</template>

<script>
import { formatStyleData } from "../../common/index.js";
import videoCard from "./video-card.vue";
import currentInfo from "./current-info.vue";
import slideList from "./slide-list.vue";
import userList from "./user-list.vue";
import noticeBar from "./notice-bar.vue";
import mapCard from "./map-card.vue";
import basicChart from "./chart-basic.vue";
import pageItemChart from "./chart/page-item-chart.vue";
import mixList from "./mix-list/list.vue";
import List from "./list/list.vue";
import pageWidget from "./widget.vue";
import cardGroup from "./card-group/card-group.vue";
import tabList from "./list/tabs-list.vue";
import gridCard from "./grid-card.vue";
import formAdd from "./form/add.vue";
import NavMenu from "./nav-menu/nav-menu.vue";
// 页面组件级 参数交互处理
import pageItemParams from "../../common/params/page-item-params-mixin.js";
import { Icon } from "@iconify/vue2";
export default {
  mixins: [pageItemParams],
  components: {
    videoCard,
    currentInfo,
    slideList,
    userList,
    noticeBar,
    mapCard,
    basicChart,
    pageItemChart,
    mixList,
    List,
    pageWidget,
    cardGroup,
    tabList,
    gridCard,
    formAdd,
    NavMenu,
    Icon,
  },
  props: {
    pageItem: {
      type: Object,
    },
    layout: {
      type: Object,
    },
    screenType: String,
    pageConfig: Object,
    inTabs: Boolean, // 是否在tabs中
  },
  computed: {
    followThemeColor() {
      return this.pageItemData.com_option?.includes("配色不跟随主题") !== true;
    },
    showMoreBtn() {
      return (
        this.pageItem?.com_option?.includes("更多") &&
        this.pageItem?.more_jump_json
      );
    },
    getExtPageUrl() {
      if (this.pageItemData?.ext_page_json?.ext_page_url) {
        return this.pageItemData?.ext_page_json?.ext_page_url;
      } else if (this.pageItemData?.com_case_json?.ext_page_url) {
        return this.pageItemData?.com_case_json?.ext_page_url;
      } else if (this.pageItemData?.ext_page_url) {
        return this.pageItemData?.ext_page_url;
      }
    },
    mixTitleIcon() {
      return this.pageItemData?.com_icon || this.pageConfig?.dv_com_icon;
    },
    mixTitleStyle() {
      let style = {};
      if (this.pageItemData?.com_title_style_json) {
        style = this.pageItemData?.com_title_style_json;
      } else if (this.pageConfig?.dv_com_title_style_json_data) {
        style = this.pageConfig?.dv_com_title_style_json_data;
      }
      return formatStyleData(style);
    },
    mixCompStyle() {
      let style = {};
      if (this.pageItemData?.style_json) {
        style = this.pageItemData?.style_json;
      } else if (this.pageItemData?.com_style_json) {
        style = this.pageItemData?.com_style_json;
      } else if (this.pageConfig?.dv_com_style_json_data) {
        style = this.pageConfig?.dv_com_style_json_data;
      }
      if (this.pageItemData.com_type === "navBar") {
        // if (style.padding) {
        //   delete style.padding;
        // }
        // if (style.border_radius) {
        //   delete style.border_radius;
        // }
      }
      return formatStyleData(style);
    },
    mixNavStyle() {
      let style = {};
      if (this.pageItemData?.com_case_json?.nav_style_json) {
        style = formatStyleData(this.pageItemData.com_case_json.nav_style_json);
      }
      return style;
    },
  },
  data() {
    return {
      pageItemData: {},
    };
  },
  mounted() {
    // console.log(this.pageItem)
  },
  watch: {
    pageItem: {
      immediate: true,
      deep: true,
      handler(newValue, oldValue) {
        if (newValue !== oldValue) {
          this.pageItemData = newValue || {};
        }
      },
    },
  },
  methods: {
    toMore() {
      const { more_jump_json: jumpJson } = this.pageItem || {};
      if (jumpJson?.obj_type === "内部页面") {
        let pageNo = jumpJson?.dest_page_no;
        if (jumpJson?.click_jump_option?.includes("先登录")) {
          if (this.$store.state?.loginInfo?.logined !== true) {
            // 您还未登录,需要登录才能进入,点击确认前往登录
            this.$confirm(
              "您还未登录,需要登录才能进入,点击确认前往登录",
              "提示",
              {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
              }
            ).then(() => {
              const currentUrl =
                window.location.pathname + window.location.hash;
              sessionStorage.setItem("login_redirect_url", currentUrl);
              const loginUrl = window.location.origin + "/main/login.html";
              window.location.href = loginUrl;
            });
            return;
          }
        }
        if (jumpJson?.tmpl_page_json?.file_path) {
          let url = `${jumpJson?.tmpl_page_json?.file_path}?page_no=${pageNo}`;
          this.$router.push({
            name: "website",
            params: {
              pageNo: pageNo,
            },
          });
        }
      }
    },
    onResize(i) {
      // console.log(this.$refs);
      // this.$refs[this.pageItem.com_type].onResize?.();
    },

    stylefn(style) {
      if (style) {
        let res = formatStyleData(style);
        if (this.layout?.h && this.layout?.w) {
          res.height = "100%";
          res.width = "100%";
        }
        return res;
      }
    },
  },
};
</script>

<style lang="scss">
.page-item {
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-size: 100% 100%;
  color: #333;
  display: flex;
  flex-direction: column;
  &.mobile {
    background-color: #eee;
    border: 1px solid #ccc;
    box-sizing: border-box;

    .mobile {
      text-align: center;
    }
  }
  .more-btn-bottom {
    text-align: center;
    background: rgba($color: #000000, $alpha: 0.05);
    margin-top: 4px;
    &:hover {
      background: rgba($color: #000000, $alpha: 0.1);
      cursor: pointer;
      .more-btn {
        color: var(--primary-color, #409eff);
        text-decoration: underline;
        text-decoration-color: var(--primary-color, #409eff);
      }
    }
    .more-btn {
      padding: 2px 10px;
      border-radius: 4px;
      font-size: 12px;
      // background-color: var(--primary-color, #409eff);
      // color: #fff;
      &:hover {
        color: var(--primary-color, #409eff);
        text-decoration: underline;
        text-decoration-color: var(--primary-color, #409eff);
      }
    }
  }
  .page-item__label {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .more-btn {
    cursor: pointer;
    &:hover {
      color: var(--primary-color, #409eff);
    }
  }
  .page-item__label-text {
    display: flex;
    position: relative;
    align-items: center;

    .icon1 {
      left: 0;
      width: 4px;
      height: 50%;
      position: absolute;
      top: 25%;
      border-radius: 2px;
      background: currentColor;
    }

    .icon2 {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      position: absolute;
      background: currentColor;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
    }

    .icon3 {
      width: 8px;
      height: 8px;
      border-radius: 2px;
      position: absolute;
      background: currentColor;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
    }

    .under-line {
      position: relative;
      display: flex;
      bottom: 0;
      left: 0;
      width: 100%;
      display: inline-block;
      height: 4px;
      border-radius: 2px;
      background: currentColor;
      // padding: inherit;
    }
  }
}
</style>
