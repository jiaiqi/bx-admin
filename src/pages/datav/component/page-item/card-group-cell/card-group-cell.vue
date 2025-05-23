<template>
  <div :style="[gridStyle]" class="bx-card">
    <template
      v-if="
        ('static' && listOptions.indexOf('分页') !== -1) ||
        (listOptions.indexOf('分页') == -1 && index < totalMaximum)
      "
      v-for="(cellItemData, index) in cellDataRun"
    >
      <div
        v-if="showActiveCard && index === 0"
        class="bx-card-cell"
        :class="{
          checked:
            pageItem &&
            pageItem._refedCol &&
            currentRadio === cellItemData[pageItem._refedCol],
          'is-link': activeCellLayout && activeCellLayout.jump_json,
          'list-item': inList,
        }"
        :style="[
          activeCellLayout.style_json
            ? buildColStyleJson(
                activeCellLayout.style_json,
                null,
                activeCellLayout
              )
            : buildColStyleJson(null, null, activeCellLayout),
        ]"
        @click="onClickCell(cellItemData, activeCellLayout)"
      >
        <template v-for="item in activeCellLayout.parts_json">
          <card-cell-part
            :comColMap="comColMap"
            :cellItem="item"
            :cellItemData="cellItemData"
            :readOnly="readOnly"
            :queryOptions="queryOptions"
            :cellLayoutJson="item"
            :parent-part="activeCellLayout"
            @on-click-cell="onClickCell"
            @show-dialog="showDialog"
          ></card-cell-part>
        </template>
      </div>
      <div
        v-for="(cellLayoutJson, i) in cellsLayout"
        :key="index + i"
        class="bx-card-cell"
        :class="{
          checked:
            pageItem &&
            pageItem._refedCol &&
            currentRadio === cellItemData[pageItem._refedCol],
          'is-link': cellLayoutJson && cellLayoutJson.jump_json,
          'list-item': inList,

        }"
        :style="[
          cellLayoutJson.style_json
            ? buildColStyleJson(cellLayoutJson.style_json, null, cellLayoutJson)
            : buildColStyleJson(null, null, cellLayoutJson),
        ]"
        @click="onClickCell(cellItemData, cellLayoutJson)"
      >
        <template v-if="!showActiveCard || (showActiveCard && index !== 0)">
          <template v-for="(item, n) in cellLayoutJson.parts_json">
            <card-cell-part
              :comColMap="comColMap"
              :cellItem="item"
              :cellItemData="cellItemData"
              :readOnly="readOnly"
              :queryOptions="queryOptions"
              :cellLayoutJson="item"
              :parent-part="cellLayoutJson"
              @on-click-cell="onClickCell"
              @show-dialog="showDialog"
            ></card-cell-part>
          </template>
        </template>
        <slot name="footer"></slot>
      </div>
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
export default {
  components: {
    Teleport,
    Icon,
    cardCellPart,
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
      default: null,
    },
    cellData: {
      type: [Object, Array],
      default: null,
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
    },
    activeCellLayout: {
      type: [Object, null],
    },
    // cellLayoutRepeat:{
    // 	type:Boolean,
    // 	default:function(){
    // 		return false
    // 	}
    // }               // repeat：重复布局，配置一个单元布局，其余数据按照该单元循环  static:静态布局，按照配置单元渲染界面，不会重复
  },
  computed: {
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
  methods: {
    ...mapActions("loginInfo", ["initLoginInfo"]),
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
    // onClickSubBlock(itemData, subCol, cellLayoutJson, parentCol, originCol) {
    //   if (subCol?.sys_fun === "登录") {
    //     this.toLogin();
    //   } else if (subCol?.sys_fun === "退出登录") {
    //     this.$confirm("确认退出登录吗?", "提示", {
    //       confirmButtonText: "确认",
    //       cancelButtonText: "取消",
    //       type: "warning",
    //     }).then(() => {
    //       this.$store.dispatch("loginInfo/logout");
    //     });
    //   } else if (
    //     (!subCol?.sys_fun || subCol?.sys_fun === "无") &&
    //     !subCol?.jump_json
    //   ) {
    //     // 如果沒有配置系統功能 也没配置跳转 将事件传递到父部件
    //     if (parentCol) {
    //       return this.onClickSubBlock(
    //         itemData,
    //         parentCol,
    //         cellLayoutJson,
    //         null,
    //         subCol
    //       );
    //     }
    //     // 没有父部件配置 点击事件传到卡片单元
    //     return this.onClickCell(itemData, cellLayoutJson);
    //   } else if (subCol?.jump_json) {
    //     // 执行自定义跳转
    //     console.log("自定义跳转");
    //     if (
    //       subCol?.jump_json?.click_type === "弹框" ||
    //       subCol?.jump_json?.click_type === "跳转"
    //     ) {
    //       const element = this.$el;
    //       const rect = element.getBoundingClientRect();
    //       const x = rect.left;
    //       const y = rect.top;
    //       const w = rect.width;
    //       const h = rect.height;
    //       console.log("弹框:", x, y, w, h);
    //       const jumpJson = subCol.jump_json;
    //       const data = itemData;
    //       if (jumpJson.tmpl_page_json?.file_path) {
    //         let pagePath = jumpJson.tmpl_page_json.file_path;
    //         if (jumpJson.dest_page_no) {
    //           pagePath = pagePath.replace(":pageNo", jumpJson.dest_page_no);
    //         }
    //         if (jumpJson.cols_map_json?.cols_map_detail_json?.length) {
    //           const mapJson = jumpJson.cols_map_json?.cols_map_detail_json;
    //           mapJson.forEach((item) => {
    //             if (
    //               item.to_type === "URL" &&
    //               ["当前数据", "业务", "模型"].includes(item.from_type) &&
    //               data?.[item.col_from]
    //             ) {
    //               pagePath?.includes("?")
    //                 ? (pagePath += `&${item.col_to}=${data[item.col_from]}`)
    //                 : (pagePath += `?${item.col_to}=${data[item.col_from]}`);
    //               // pagePath += `&${item.col_to}=${data[item.col_from]}`;
    //             }
    //           });
    //         }
    //         if (pagePath) {
    //           if (subCol?.jump_json?.click_type === "弹框") {
    //             this.dialogUrl = pagePath;
    //             this.dialogPosition = {
    //               x,
    //               y,
    //               w,
    //               h,
    //             };
    //             this.dialogVisible = true;
    //             this.iframeLoading = true;
    //           } else {
    //             if (jumpJson?.click_jump_option?.includes("先登录")) {
    //               if (this.$store.state?.loginInfo?.logined !== true) {
    //                 // 您还未登录,需要登录才能进入,点击确认前往登录
    //                 this.$confirm(
    //                   "您还未登录,需要登录才能进入,点击确认前往登录",
    //                   "提示",
    //                   {
    //                     confirmButtonText: "确定",
    //                     cancelButtonText: "取消",
    //                     type: "warning",
    //                   }
    //                 ).then(() => {
    //                   const currentUrl =
    //                     window.location.pathname + window.location.hash;
    //                   sessionStorage.setItem("login_redirect_url", currentUrl);
    //                   const loginUrl =
    //                     window.location.origin + "/main/login.html";
    //                   window.location.href = loginUrl;
    //                 });
    //                 return;
    //               }
    //             }
    //             open(pagePath);
    //           }
    //         }
    //       }
    //     }
    //   }
    // },
    buildColStyleJson(styleJson, cssArr, cellLayoutJson, column) {
      let style = {};
      if (styleJson) {
        // 将rpx转换为px
        function convertRpxToPx(css) {
          return css.replace(/\d+rpx/g, (match) => {
            const value = parseFloat(match);
            return `${value / 2}px`;
          });
        }
        for (let key in styleJson) {
          if (
            typeof styleJson[key] === "string" &&
            styleJson[key] &&
            styleJson[key].indexOf("rpx") > -1
          ) {
            styleJson[key] = convertRpxToPx(styleJson[key] || "");
          }
          if (cssArr && cssArr.length > 0) {
            let cssArrs = cssArr.split(",");
            for (let getKey of cssArrs) {
              if (getKey == key) {
                style[key.replace(/_/g, "-")] = styleJson[key];
              }
            }
          } else {
            style[key.replace(/_/g, "-")] = styleJson[key];
            // console.log('styleJson',key)
          }
        }
      }
      let bgImg = cellLayoutJson?.background_image || "";
      if (styleJson && styleJson.background_image) {
        bgImg = styleJson.background_image;
      }
      if (bgImg) {
        // 单元背景图 补偿样式。
        style["background-image"] = `url(${this.getImagePath(bgImg)})`;
        style["background-size"] = "100% 100%";
        style["background-repeat"] = "no";
      }
      if (cellLayoutJson && !style.hasOwnProperty("min-height") && bgImg) {
        style["min-height"] = "60px";
      }
      if (!style["background-color"]) {
        style["background-color"] = "transparent";
      }
      if (!style["overflow"]) {
        // style["overflow"] = "hidden";
      }
      // console.log("styleJson", style);
      if (column) {
        return style[column] || "";
      }
      return style;
    },
    // getPartModelData(item, map, itemData) {
    //   // item.variable,comColMap,cellItemData) : item.parts_text
    //   let type = item.parts_type;
    //   let key = item.variable || null;
    //   let val = item.parts_text;
    //   switch (type) {
    //     case "iconImg":
    //       val = item.parts_img;
    //       break;
    //     default:
    //       break;
    //   }
    //   if (item && itemData && !!map) {
    //     let data = itemData;
    //     let optionsType = "";
    //     if (item.hasOwnProperty("sys_fun") && item?.sys_fun) {
    //       optionsType = item?.sys_fun;
    //     }
    //     switch (optionsType) {
    //       case "拨打电话":
    //         key = item?.para_phone_col || item.variable;
    //         if (
    //           key &&
    //           map.hasOwnProperty(key) &&
    //           itemData.hasOwnProperty(map[key]) &&
    //           itemData[map[key]]
    //         ) {
    //           // val = itemData[map[key]]
    //         }
    //         break;
    //       case "地图导航":
    //         let lgtKey = item?.para_map_lon;
    //         let latKey = item?.para_map_lat;
    //         // key = item?.para_phone_col || item.variable
    //         val = null;
    //         val = {};
    //         if (
    //           lgtKey &&
    //           map.hasOwnProperty(lgtKey) &&
    //           itemData.hasOwnProperty(map[lgtKey]) &&
    //           itemData[map[lgtKey]]
    //         ) {
    //           val["lgt"] = itemData[map[lgtKey]];
    //         } else {
    //           val = null;
    //         }
    //         if (
    //           latKey &&
    //           map.hasOwnProperty(latKey) &&
    //           itemData.hasOwnProperty(map[latKey]) &&
    //           itemData[map[latKey]]
    //         ) {
    //           val["lat"] = itemData[map[latKey]];
    //         } else {
    //           val = null;
    //         }
    //         break;
    //       default:
    //         if (
    //           item.hasOwnProperty("variable") &&
    //           key &&
    //           map.hasOwnProperty(key) &&
    //           itemData.hasOwnProperty(map[key]) &&
    //           itemData[map[key]]
    //         ) {
    //           val = itemData[map[key]] || "";
    //         } else if (
    //           item.hasOwnProperty("variable") &&
    //           key &&
    //           itemData.hasOwnProperty(key) &&
    //           itemData[key]
    //         ) {
    //           val = itemData[key] || "";
    //         } else if (
    //           ["string", "时间日期"].includes(item.parts_type) &&
    //           item.parts_text
    //         ) {
    //           val = this.renderStr(item.parts_text, {
    //             data: itemData,
    //             ...this.queryOptions,
    //           });
    //         }
    //         break;
    //     }
    //   } else if (item && itemData && !map) {
    //     if (
    //       item.hasOwnProperty("variable") &&
    //       key &&
    //       itemData.hasOwnProperty(key) &&
    //       itemData[key]
    //     ) {
    //       val = itemData[key];
    //     } else if (
    //       ["string", "时间日期"].includes(item.parts_type) &&
    //       item.parts_text
    //     ) {
    //       val = this.renderStr(item.parts_text, {
    //         data: itemData,
    //         ...this.queryOptions,
    //       });
    //     }
    //   }
    //   // console.log('getPartModelData:', itemData,key,val);
    //   if (type === "时间日期" && item.date_format_rule) {
    //     val = dayjs(val).format(item.date_format_rule);
    //   }
    //   if (type === "视频") {
    //     if (val?.indexOf("http") !== 0) {
    //       val = this.serviceApi()?.downloadFileNo + val;
    //     }
    //   }
    //   return this.recoverFileAddress(val);
    // },
  },
};
</script>

<style lang="scss" scoped>
.bx-text-cell {
  // overflow: hidden;

  .u-wrap {
    background-color: transparent !important;
  }
}

.bx-card {
  position: relative;
  // height: 100%;
  flex: 1;
  // display: grid;
  // grid-template-rows: repeat(2, 200rpx);
  // gap:5px ;
  // grid-template-columns: repeat(2, 50%);
}

.bx-card-cell {
  // 隐藏滚动条
  height: 100%;
  &.is-link {
    cursor: pointer;
    transition: all 0.3s ease-in-out;
    &:hover {
      scale: 1.01;
    }
  }
  &.list-item {
    border: 1px solid transparent;
    &:hover {
      border: 1px solid #ebeef5;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    }
  }
  // scrollbar-width: thin; /* 隐藏滚动条 */
  &::-webkit-scrollbar {
    width: 4px; /* 设置滚动条的宽度 */
  }
  &::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.2); /* 设置滚动条滑块的颜色 */
    border-radius: 4px; /* 设置滚动条滑块的圆角 */
  }
  &.checked {
    border: 2px solid transparent;
    border-color: #007aff;
  }

  position: relative;

  .radio-box {
    position: absolute;
    right: 0;
    top: 0;
    transform: scale(0.7);
  }

  // background-color: #eee;
  // > .bx-cell-row {
  //   &:first-child {
  //     border-left: 0 !important;
  //   }
  //   &:last-child {
  //    border-right: 0 !important;
  //   }

  //   > .bx-cell-row {
  //     &:first-child {
  //       border-left: 0 !important;
  //     }

  //     &:last-child {
  //      border-right: 0 !important;
  //     }
  //   }
  // }

  .bx-cell-string {
    text-align: justify;
    overflow: hidden;
    /* 溢出隐藏 */
    overflow: hidden;
    /* 溢出显示省略号 */
    text-overflow: ellipsis;
    word-break: break-all;
    &:hover {
      color: var(--primary-color);
    }
  }
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
