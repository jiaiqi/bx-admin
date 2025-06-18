<template>
  <div
    :class="{
      'bx-card': true,
      'marquee-mode': childAnimationType === '跑马灯',
    }"
    :style="[childAnimationType === '跑马灯' ? {} : gridStyle]"
    ref="cardRef"
  >
    <div
      ref="cardInnerContainer"
      :style="[
        gridStyle,
        {
          '--child-animation-step': childAnimationConfig.step,
          '--child-animation-type': childAnimationType,
          '--child-animation-direction': childAnimationConfig.direction,
          '--child-animation-delay': childAnimationConfig.delay,
        },
      ]"
      class="card-inner-container"
      v-if="childAnimationConfig && childAnimationConfig.type === '跑马灯'"
    >
      <template
        v-if="
          ('static' && listOptions.indexOf('分页') !== -1) ||
          (listOptions.indexOf('分页') == -1 && index < totalMaximum)
        "
        v-for="(cellItemData, index) in cellDataRun"
      >
        <card-cell-layout
          :item="activeCellLayout"
          :cellLayoutJson="activeCellLayout"
          :pageItem="pageItem"
          :currentRadio="currentRadio"
          :cellItemData="cellItemData"
          :comColMap="comColMap"
          :readOnly="readOnly"
          :queryOptions="queryOptions"
          :showActiveCard="showActiveCard"
          :inList="inList"
          v-if="showActiveCard && index === 0"
        >
        </card-cell-layout>
        <card-cell-layout
          v-for="(cellLayoutJson, i) in cellsLayout"
          :item="cellLayoutJson"
          :cellLayoutJson="cellLayoutJson"
          :pageItem="pageItem"
          :currentRadio="currentRadio"
          :cellItemData="cellItemData"
          :comColMap="comColMap"
          :readOnly="readOnly"
          :queryOptions="queryOptions"
          :showActiveCard="showActiveCard"
          :inList="inList"
        >
        </card-cell-layout>
      </template>
    </div>
    <template v-else>
      <template v-for="(cellItemData, index) in cellDataRun">
        <template
          v-if="
            ('static' && listOptions.indexOf('分页') !== -1) ||
            (listOptions.indexOf('分页') == -1 && index < totalMaximum)
          "
        >
          <card-cell-layout
            :item="activeCellLayout"
            :cellLayoutJson="activeCellLayout"
            :pageItem="pageItem"
            :currentRadio="currentRadio"
            :cellItemData="cellItemData"
            :comColMap="comColMap"
            :readOnly="readOnly"
            :queryOptions="queryOptions"
            :showActiveCard="showActiveCard"
            :inList="inList"
            v-if="showActiveCard && index === 0"
          >
          </card-cell-layout>
          <card-cell-layout
            v-for="(cellLayoutJson, i) in cellsLayout"
            :item="cellLayoutJson"
            :cellLayoutJson="cellLayoutJson"
            :pageItem="pageItem"
            :currentRadio="currentRadio"
            :cellItemData="cellItemData"
            :comColMap="comColMap"
            :readOnly="readOnly"
            :queryOptions="queryOptions"
            :showActiveCard="showActiveCard"
            :inList="inList"
          >
          </card-cell-layout>
        </template>
      </template>
    </template>

    <el-dialog
      title=""
      :visible.sync="dialogVisible"
      append-to-body
      v-if="dialogUrl && dialogVisible"
    >
      <div v-if="iframeLoading" class="iframe-loading">
        <el-loading-spinner></el-loading-spinner>
        <div class="loading-text">
          <p>
            加载中<span class="loading-dots"><i>.</i><i>.</i><i>.</i></span>
          </p>
        </div>
      </div>
      <iframe
        :src="dialogUrl"
        frameborder="0"
        style="width: 100%; height: 80vh"
        @load="iframeLoading = false"
      ></iframe>
    </el-dialog>
  </div>
</template>
<style>
.iframe-loading {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.95);
  z-index: 10;
  animation: fadeIn 0.5s ease-in-out;
  backdrop-filter: blur(3px);
  box-shadow: inset 0 0 15px rgba(64, 158, 255, 0.1);
  transition: all 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

.iframe-loading .el-loading-spinner {
  animation: pulse 1.5s infinite ease-in-out;
  filter: drop-shadow(0 0 5px rgba(64, 158, 255, 0.5));
}

.iframe-loading .loading-text {
  margin-top: 15px;
  text-align: center;
}

.iframe-loading p {
  color: #409eff;
  font-size: 16px;
  font-weight: 500;
  letter-spacing: 1px;
  margin: 0;
}

.loading-dots {
  display: inline-block;
}

.loading-dots i {
  display: inline-block;
  opacity: 0;
  font-style: normal;
  animation: loadingDots 1.5s infinite;
}

.loading-dots i:nth-child(2) {
  animation-delay: 0.2s;
}

.loading-dots i:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes loadingDots {
  0% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
</style>
<script>
/**
 *
 * @description "card-group-cell" 支持灵活配置样式的布局单元
 * @tutorial
 * @property {Object} pageItem = {} 公共组件参数  #废弃
 * @property {Object} cellData = {} 单元 data {}
 * @property {Array} cellsLayout = {} 单元布局配置[{}]
 * @property {Object} cardLayout = {} 组件 card_layout_json
 * @property {Object} comColMap = {}  字段值映射关系
 * @property {Boolean} cellLayoutRepeat = false  单元布局是否重复,暂未启用
 * @property {Boolean} readOnly = false  是否只读，只读 = true 时，拦截所有点击事件。
 * @event {Function} on-click-cell 点击单元事件
 * @event {Function} on-click-sub-block 点击row 部件 事件
 * @event {Function} on-click-icon 点击icon类型 部件 事件
 * @example  import cardGroupCell from '@/components/card-group-cell/card-group-cell.vue'
 * <cardGroupCell ref="cardGroupCell" @on-click-cell="onClickCell" @on-click-block="onClickBlock"  @on-click-icon="onClickBlock"></cardGroupCell>
 */
// import {
//   debounce,
//   throttle
// } from '@/common/func/util.js'

// import cardGroupCellItem from '@/components/card-group-cell-item/card-group-cell-item.vue'
// import bxform from '@/views/custom/components/bx-form/bx-form.vue'
var self = null;
import Teleport from "vue2-teleport";
import { Icon } from "@iconify/vue2";
import cardGroupCellMxin from "./card-group-cell-mixin.js"; // 新的确实方法依赖 混入
import dayjs from "dayjs";
import { mapGetters, mapActions } from "vuex";
import cardCellPart from "./card-cell-part.vue";
import { formatStyleData } from "@/pages/datav/common/index.js";
import cardCellLayout from "./card-cell-layout.vue";
export default {
  components: {
    Teleport,
    Icon,
    cardCellPart,
    cardCellLayout,
    // cardGroupCellItem
    // bxform
    // bxForm: () => import('@/views/custom/components/bx-form/bx-form.vue') //剔除 原小程序form组件
  },
  name: "card-group-cell",
  mixins: [cardGroupCellMxin],

  data() {
    return {
      updateService: "",
      updateDatakey: "id",
      updateDataVal: "",
      updateTitle: "",
      activeMode: null,
      dialogPosition: null,
      dialogVisible: false,
      dialogUrl: "",
      iframeLoading: true,
      currentAccordionSeq: 1,
      // 跑马灯相关状态
      marqueeTimer: null, // 跑马灯定时器
      marqueeDelayTimer: null, // 延迟启动定时器
      marqueeOffset: 0, // 当前滚动偏移量
      marqueeChildrenWidths: [], // 子元素宽度数组
      marqueeContainerWidth: 0, // 容器总宽度
    };
  },
  watch: {
    dialogVisible(val) {
      if (!val) {
        // 对话框关闭时重置loading状态
        this.iframeLoading = true;
      }
    },
  },
  props: {
    pageParamsModel: {
      type: Object,
      default: () => {
        return {};
      },
    },
    readOnly: {
      type: Boolean,
      default() {
        return false;
      },
    },
    listOptions: {
      type: [Object, Array],
      default: function () {
        return [];
      },
    },
    rowButtons: {
      type: [Object, Array],
      default: function () {
        return [];
      },
    },
    pageItem: {
      type: Object,
      default: () => {
        return {};
      },
    },
    cellData: {
      type: [Object, Array],
      default: () => {
        return [];
      },
    },
    comColMap: {
      type: Object,
      default: null,
    },
    cellsLayout: {
      type: [Array],
      default: function () {
        return [];
      },
    },
    cardLayout: {
      type: Object,
      default: () => {
        return {};
      },
    },
    selectorMode: {
      type: String,
    },
    listUseType: {
      type: String,
    },
    currentRadio: {
      type: String,
    },
    queryOptions: {
      type: Object,
      default: () => {
        return {};
      },
    },
    activeCellLayout: {
      type: [Object, null],
      default: () => {
        return {};
      },
    },
    listConfig: {
      type: [Object, null],
      default: () => {
        return {};
      },
    },
    // cellLayoutRepeat:{
    // 	type:Boolean,
    // 	default:function(){
    // 		return false
    // 	}
    // }               // repeat：重复布局，配置一个单元布局，其余数据按照该单元循环  static:静态布局，按照配置单元渲染界面，不会重复
  },
  computed: {
    childAnimationType() {
      return (
        this.listConfig?.use_animation === "是" &&
        this.listConfig?.animation_type
      );
    },
    childAnimationConfig() {
      let obj = {};

      if (this.listConfig?.use_animation === "是") {
        obj = {
          type: this.listConfig?.animation_type || "跑马灯",
          step: this.listConfig?.animation_step || "100",
          direction: this.listConfig?.animation_direction || "由左往右",
          interval: (this.listConfig?.animation_interval || 1) * 1000, // 转换为毫秒
          delay: (this.listConfig?.animation_delay || 0) * 1000, // 转换为毫秒
        };
      }
      return obj;
    },
    inList() {
      return this.pageItem?.com_type === "list";
    },
    showActiveCard() {
      if (this.activeCellLayout?.parts_json?.length) {
        return true;
      }
    },
    showRowButtons() {
      let show = false;
      if (this.pageItem && this.pageItem.com_type == "list") {
        if (
          this.pageItem.list_json.list_options &&
          this.pageItem.list_json.list_options.indexOf("单元按钮") !== -1 &&
          this.rowButtons.length > 0
        ) {
          show = true;
        }
      }
      return show;
    },
    comColMapRun: function () {
      let configJson = this.comColMap;
      let maps = this.paramsBuild(configJson);
      // console.log('comColMapRun',maps)
      //  url   sys user page com srv_col srv_cond
      // let target = configJson?.dest_owner  // 目标
      // let source = configJson?.src_owner  // 源
      // let map = configJson?.cols_map_json || {}
      return maps;
    },
    cells: function () {
      return this.cellsLayout || [];
    },
    cellStyle: function () {
      let style =
        this.cardLayout && this.cardLayout?.style_json
          ? this.cardLayout?.style_json
          : {};
      return style;
    },
    totalMaximum: function () {
      let config = this.cardLayout || {};
      config.rows_max = Number(config?.rows_max);
      let maxPageRowNumber = this.pageItem?.srv_req_json?.page?.rownumber || 9;
      let maximum =
        config && config.rows_max && config.cols_num
          ? config["rows_max"] * config["cols_num"]
          : maxPageRowNumber;
      if (config["rows_max"] == "0" || config["rows_max"] == "全部") {
        maximum = maxPageRowNumber;
      }
      return maximum;
    },
    gridStyle: function () {
      let style = {};
      let config = this.cardLayout || {
        rows_max: 1,
        cols_num: 1,
      };
      // console.log('config',config)
      let height =
        config.hasOwnProperty("style_json") &&
        config.style_json.hasOwnProperty("height")
          ? config.style_json.height
          : "auto";
      let configStyle = config["style_json"] || {};
      if (config.layout_type == "表格") {
        style["display"] = "grid";
        if (config["rows_max"]) {
          style[
            "grid-template-rows"
          ] = `repeat(${config["rows_max"]},${height})`;
        }

        style["grid-template-columns"] = `repeat(${config["cols_num"]}, 1fr)`;
      }
      for (let arr in configStyle) {
        if (configStyle[arr]) {
          style[arr.replace(/_/g, "-")] = configStyle[arr];
        }
      }
      if (Object.keys(style).indexOf("gap") == -1) {
        style["gap"] = "5px";
      }
      let style_json_diy = config.style_json_diy || {};
      if (Object.keys(style_json_diy).indexOf("gap") !== -1) {
        style["gap"] = style_json_diy["gap"];
      }
      if (Object.keys(style_json_diy).indexOf("column-gap") !== -1) {
        style["column-gap"] = style_json_diy["column-gap"];
      }
      if (Object.keys(style_json_diy).indexOf("row-gap") !== -1) {
        style["row-gap"] = style_json_diy["row-gap"];
      }
      style["margin"] = 0;
      return style;
    },
    cellDataRun: function () {
      let data = this.cellData;
      if (data && !Array.isArray(data)) {
        return [data];
      } else if (data.length > 0) {
        return data;
      } else if (this.pageItem?.com_type !== "list") {
        return [""];
      } else {
        return data;
      }
    },
    srvApp() {
      return (
        this.pageItem?.srv_req_json?.mapp ||
        sessionStorage.getItem("current_app")
      );
    },
  },
  created() {
    // self = this
  },
  mounted() {
    // 启动跑马灯动画
    if (this.childAnimationType === "跑马灯") {
      this.$nextTick(() => {
        this.initSeamlessLayout();
        this.startMarqueeAnimation();
      });
    }
  },
  beforeDestroy() {
    // 清理定时器
    this.stopMarqueeAnimation();
  },
  methods: {
    ...mapActions("loginInfo", ["initLoginInfo"]),
    // 启动跑马灯动画
    startMarqueeAnimation() {
      const config = this.childAnimationConfig;
      const marqueeElement = this.$refs.cardInnerContainer;
      if (!this.marqueeContainerWidth && marqueeElement) {
        this.marqueeContainerWidth = marqueeElement.offsetWidth;
      }
      if (!config || config.delay === undefined) return;

      // 延迟启动
      this.marqueeDelayTimer = setTimeout(() => {
        this.runMarqueeAnimation();
      }, config.delay);
    },

    // 执行跑马灯动画
    runMarqueeAnimation() {
      const config = this.childAnimationConfig;
      if (!config) return;

      this.marqueeTimer = setInterval(() => {
        this.moveMarqueeChildren();
      }, config.interval);
    },

    // 移动跑马灯子元素
    moveMarqueeChildren() {
      const marqueeElement = this.$refs.cardInnerContainer;
      if (!marqueeElement) return;

      const config = this.childAnimationConfig;
      const children = Array.from(marqueeElement.children);

      if (!children || children.length === 0) return;

      const isRightDirection = config.direction === "由左往右";

      // 为容器添加过渡动画
      if (!marqueeElement.style.transition) {
        marqueeElement.style.transition =
          "transform 0.5s var(--marquee-transition-timing)";
      }

      // 计算下一个元素的宽度
      const nextElementWidth = this.getNextElementWidth(
        children,
        isRightDirection
      );

      if (isRightDirection) {
        // 向右滚动：向左移动一个元素的宽度
        this.marqueeOffset += nextElementWidth;

        // 检查是否需要重置位置
        if (Math.abs(this.marqueeOffset) >= this.marqueeContainerWidth) {
          this.resetMarqueePosition(marqueeElement);
        } else {
          marqueeElement.style.transform = `translateX(${this.marqueeOffset}px)`;
        }
      } else {
        // 向左滚动：向右移动一个元素的宽度
        this.marqueeOffset -= nextElementWidth;

        // 检查是否需要重置位置
        if (this.marqueeOffset <= -this.marqueeContainerWidth) {
          this.resetMarqueePosition(marqueeElement);
        } else {
          marqueeElement.style.transform = `translateX(${this.marqueeOffset}px)`;
        }
      }
    },

    // 获取下一个要移动的元素宽度
    getNextElementWidth(children, isRightDirection) {
      if (isRightDirection) {
        // 向右滚动时，获取第一个可见元素的宽度
        return this.marqueeChildrenWidths[0] || children[0]?.offsetWidth || 0;
      } else {
        // 向左滚动时，获取最后一个元素的宽度
        const lastIndex = children.length - 1;
        return (
          this.marqueeChildrenWidths[lastIndex] ||
          children[lastIndex]?.offsetWidth ||
          0
        );
      }
    },

    // 重置跑马灯位置
    resetMarqueePosition(marqueeElement) {
      // 重置偏移量和位置
      this.marqueeOffset = 0;
      marqueeElement.style.transform = "translateX(0px)";

      // 重新启用过渡效果
      setTimeout(() => {
        marqueeElement.style.transition =
          "transform 0.5s var(--marquee-transition-timing)";
      }, 10);
    },

    // 计算并缓存子元素宽度
    cacheChildrenWidths() {
      const marqueeElement = this.$refs.cardInnerContainer;
      if (!marqueeElement) return;

      const children = Array.from(marqueeElement.children);
      this.marqueeChildrenWidths = children.map((child) => child.offsetWidth);

      // 计算容器总宽度
      this.marqueeContainerWidth = marqueeElement.offsetWidth;
    },

    // 初始化无缝滚动布局
    async initSeamlessLayout() {
      const marqueeElement = this.$refs.cardInnerContainer;
      if (!marqueeElement) return;

      const children = marqueeElement.children;
      if (!children || children.length === 0) return;

      // 为容器设置样式以支持无缝滚动
      marqueeElement.style.display = "flex";
      marqueeElement.style.whiteSpace = "nowrap";
      marqueeElement.style.transition = "transform 0.5s ease-in-out";
      marqueeElement.style.transform = "translateX(0px)";

      // 保持子元素原有样式，只设置必要的flex属性
      Array.from(children).forEach((child) => {
        child.style.flexShrink = "0";
      });

      // 缓存子元素宽度
      this.cacheChildrenWidths();
    },

    // 停止跑马灯动画
    stopMarqueeAnimation() {
      if (this.marqueeTimer) {
        clearInterval(this.marqueeTimer);
        this.marqueeTimer = null;
      }
      if (this.marqueeDelayTimer) {
        clearTimeout(this.marqueeDelayTimer);
        this.marqueeDelayTimer = null;
      }

      // 重置状态
      this.marqueeOffset = 0;
      this.marqueeChildrenWidths = [];
      this.marqueeContainerWidth = 0;

      // 清除容器的动画样式
      const marqueeElement = this.$refs.cardInnerContainer;
      if (marqueeElement) {
        marqueeElement.style.display = "";
        marqueeElement.style.whiteSpace = "";
        marqueeElement.style.transition = "";
        marqueeElement.style.transform = "";

        // 清除子元素的flex样式，保持其他样式不变
        Array.from(marqueeElement.children).forEach((child) => {
          child.style.flexShrink = "";
        });
      }
    },
    recoverFileAddress(val = "") {
      if (typeof val !== "string") {
        return val;
      }
      if (
        val &&
        typeof val === "string" &&
        val.indexOf("$bxFileAddress$") === -1
      ) {
        return val;
      }
      // 替换文件前缀
      const prefix = this.serviceApi().downloadFilePrefix;
      val = val?.replaceAll?.("$bxFileAddress$", prefix) || "";
      // 使用正则表达式来匹配 bx_auth_ticket 的值，并使用sessionStorage.bx_auth_ticket替换它
      const ticketStr = `bx_auth_ticket=${sessionStorage.bx_auth_ticket}`;
      val = val.replace(/(bx_auth_ticket=)[^&]+/gi, ticketStr);
      // console.log('getPartModelData:recoverFileAddress:', val);

      return val;
    },
    paramsBuild(json) {
      if (!json) {
        return;
      }
      let configJson = json;
      //  url   sys user page com srv_col srv_cond
      let target = configJson?.dest_owner; // 目标
      let source = configJson?.src_owner; // 源
      let map = configJson?.cols_map_json || {};
      let maps = {
        target: {},
        source: {},
      };
      maps["target"][target] = map;
      return maps;
    },
    v2Loaded(e) {
      this.updateTitle = e?.service_view_name;
      console.log(e);
    },
    onSubmitForm(e) {
      // 表单提交
      this.$emit("data-updated", e); //通知父组件数据更新完成
      console.log("表单提交成功：：：", e);
      this.closeUpdateFormPopup();
    },
    openUpdateFormPopup(id, service) {
      // id = '13'
      // service = 'srvwuliu_car_update'
      if (id && service) {
        this.updateService = service;
        this.updateDataVal = id;
        this.$refs?.updateFormPopup?.open();
      }
    },
    closeUpdateFormPopup() {
      this.updateService = null;
      this.updateDataVal = null;
      this.updateTitle = null;
      this.$refs?.updateFormPopup?.close();
    },
    getButtonVisible(cellItemData, button, ib) {
      // listCard、cardGroupCell组件统一不显示详情按钮 230824
      if (button?.button_type === "detail") {
        return false;
      }
      if (
        Array.isArray(cellItemData?._buttons) &&
        cellItemData._buttons.length >= ib + 1
      ) {
        return cellItemData["_buttons"][ib] === 1;
      } else {
        return false;
        console.log(
          cellItemData,
          "getButtonVisible---->cellItemDatacellItemDatacellItemData"
        );
        return (
          button.permission &&
          (!button.hasOwnProperty("visible") || button?.visible === "是")
        );
      }
    },
    onRowButton(e) {
      if (this.readOnly) {
        return;
      }
      this.$emit("on-row-button-click", e);
    },
    onClickCell(item, cellLayoutJson) {
      if (this.readOnly) {
        return;
      }
      console.log("bx-card-cell");
      // 设置选中数据
      this.$set(this, "activeMode", item);
      this.$emit("on-click-cell", {
        data: item,
        cellsLayout: cellLayoutJson,
      });
    },
    toLogin() {
      if (process.env.NODE_ENV === "development") {
        return this.$loginRef?.open((res) => {
          console.log(res);
          if (res) {
            this.initLoginInfo(res);
          }
        });
      }
      const currentUrl = window.location.pathname + window.location.hash;
      sessionStorage.setItem("login_redirect_url", currentUrl);
      const loginUrl = window.location.origin + "/main/login.html";
      window.location.href = loginUrl;
    },
    showDialog({ rect, data, jumpJson }) {
      if (this.readOnly) {
        return;
      }
      if (jumpJson) {
        const x = rect.left;
        const y = rect.top;
        const w = rect.width;
        const h = rect.height;
        console.log("弹框:", x, y, w, h);
        if (jumpJson.tmpl_page_json?.file_path) {
          let pagePath = jumpJson.tmpl_page_json.file_path;
          if (jumpJson.dest_page_no) {
            pagePath = pagePath.replace(":pageNo", jumpJson.dest_page_no);
          }
          if (jumpJson.cols_map_json?.cols_map_detail_json?.length) {
            const mapJson = jumpJson.cols_map_json?.cols_map_detail_json;
            mapJson.forEach((item) => {
              if (
                item.to_type === "URL" &&
                ["当前数据", "业务", "模型"].includes(item.from_type) &&
                data?.[item.col_from]
              ) {
                pagePath?.includes("?")
                  ? (pagePath += `&${item.col_to}=${data[item.col_from]}`)
                  : (pagePath += `?${item.col_to}=${data[item.col_from]}`);
              }
            });
          }
          if (pagePath) {
            if (jumpJson?.click_type === "弹框") {
              this.dialogUrl = pagePath;
              this.dialogPosition = {
                x,
                y,
                w,
                h,
              };
              this.dialogVisible = true;
              this.iframeLoading = true;
            } else {
              if (jumpJson?.click_jump_option?.includes("先登录")) {
                if (this.$store.state?.loginInfo?.logined !== true) {
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
                    const loginUrl =
                      window.location.origin + "/main/login.html";
                    window.location.href = loginUrl;
                  });
                  return;
                }
              }
              open(pagePath);
            }
          }
        }
      }
    },
    buildColStyleJson(styleJson, cssArr, cellLayoutJson, column) {
      let style = {};
      if (styleJson) {
        style = formatStyleData(styleJson);
      }

      let bgImg = cellLayoutJson?.background_image || "";
      if (styleJson && styleJson.background_image) {
        bgImg = styleJson.background_image;
      }
      if (bgImg) {
        // 单元背景图 补偿样式。
        style["background-image"] = `url(${this.getImagePath(bgImg)})`;
        style["background-size"] = "100% 100%";
        style["background-repeat"] = "norepeat";
      }
      if (cellLayoutJson && !style.hasOwnProperty("min-height") && bgImg) {
        style["min-height"] = "60px";
      }
      // if (!style["background-color"]) {
      //   style["background-color"] = "transparent";
      // }
      if (!style["overflow"]) {
        // style["overflow"] = "hidden";
      }
      // console.log("styleJson", style);
      if (column) {
        return style[column] || "";
      }
      return style;
    },
  },
};
</script>

<style lang="scss" scoped>
/* 跑马灯模式样式 */
.marquee-mode {
  overflow: hidden;
  position: relative;
  --marquee-transition-timing: ease-in-out;
}

/* 跑马灯渐隐效果 - 使用 CSS mask 实现自适应颜色 */
.marquee-mode .card-inner-container {
  -webkit-mask: linear-gradient(
    to right,
    transparent 0%,
    black 5%,
    black 95%,
    transparent 100%
  );
  mask: linear-gradient(
    to right,
    transparent 0%,
    black 5%,
    black 95%,
    transparent 100%
  );
}

/* 备用方案：使用 clip-path（现代浏览器支持更好） */
/* 
.marquee-mode .card-inner-container {
  clip-path: polygon(
    0% 0%, 
    5% 0%, 
    95% 0%, 
    100% 0%, 
    100% 100%, 
    95% 100%, 
    5% 100%, 
    0% 100%
  );
  filter: blur(0px);
}
*/

/* 备用方案：使用 filter + backdrop-filter（需要背景支持） */
/*
.marquee-mode::before,
.marquee-mode::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  width: 5%;
  z-index: 1;
  pointer-events: none;
  backdrop-filter: blur(2px);
}

.marquee-mode::before {
  left: 0;
  background: linear-gradient(to right, rgba(255,255,255,1), transparent);
}

.marquee-mode::after {
  right: 0;
  background: linear-gradient(to left, rgba(255,255,255,1), transparent);
}
*/

.bx-text-cell {
  // overflow: hidden;

  .u-wrap {
    background-color: transparent !important;
  }
}

.bx-card {
  position: relative;
  flex: 1;
}

.update-title {
  background-color: #fff;
  text-align: center;
  padding: 10px;
  font-size: 16px;
  font-weight: bold;
}

.popup-form-warp {
  max-height: 80vh;
  overflow-y: scroll;
  background-color: #fff;
}
</style>
