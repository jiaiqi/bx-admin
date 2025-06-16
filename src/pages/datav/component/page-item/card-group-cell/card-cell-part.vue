<template>
  <Fragment v-if="partsShow">
    <LiquidFillChart
      v-if="partsType === '水球图'"
      :value="getPartModelData"
      :color="item.wave_color"
      :ref="partsType"
    />
    <video
      class="bx-cell-video"
      :controls="videoAttribute.controls === true"
      :muted="videoAttribute.muted === true"
      :loop="videoAttribute.loop === true"
      :controlslist="videoAttribute.controlslist"
      :autoplay="videoAttribute.autoplay === true"
      :poster="videoPoster"
      :class="{
        'cursor-pointer': isLink,
      }"
      :src="getImagePath(getPartModelData)"
      :style="[buildColStyleJson]"
      v-if="['视频'].includes(partsType)"
      :ref="partsType"
    ></video>
    <div
      v-else-if="['string', '字符串', '时间日期'].includes(cellItem.parts_type)"
      class="bx-cell-string"
      :class="[
        {
          'cursor-pointer': isLink,
        },
        animationClass,
      ]"
      @click.stop="onClickSubBlock()"
      :style="[buildColStyleJson, animationStyle]"
      :ref="partsType"
    >
      {{ getPartModelData }}
    </div>
    <div
      v-else-if="item.parts_type == 'variable'"
      class="bx-cell-variable"
      :class="{
        'cursor-pointer': isLink,
      }"
      @click.stop="onClickSubBlock()"
      :style="[buildColStyleJson]"
      :ref="partsType"
    >
      {{ getPartModelData }}
    </div>
    <el-image
      v-else-if="['图片', 'iconImg'].includes(item.parts_type)"
      @click.stop="onClickSubBlock()"
      :loading-img="getImagePath(item.parts_img)"
      :height="buildColStyleJson.height || 'auto'"
      :width="buildColStyleJson.width || '100%'"
      :border-radius="buildColStyleJson['border-radius']"
      :src="getImagePath(getPartModelData, 150)"
      class="demo-layout bx-text-cell"
      :class="{
        'cursor-pointer': isLink,
      }"
      :style="[buildColStyleJson]"
      mode="aspectFill"
      img-mode="aspectFill"
      :ref="partsType"
    ></el-image>
    <el-rate
      :disabled="true"
      v-else-if="['rate', '星级评分'].includes(item.parts_type)"
      :count="5"
      :value="Number(getPartModelData) || 0"
      :ref="partsType"
    ></el-rate>
    <el-progress
      :show-text="false"
      :style="[buildColStyleJson]"
      v-else-if="['progress', '进度条'].includes(item.parts_type)"
      :count="5"
      :define-back-color="buildColStyleJson['background-color'] || ''"
      :color="buildColStyleJson.color || '#2979ff'"
      :percentage="Number(getPartModelData) || 0"
      :ref="partsType"
    ></el-progress>
    <i
      v-else-if="
        item.parts_type == 'icon' &&
        getPartModelData &&
        getPartModelData.indexOf('el-icon-') === 0
      "
      :class="[getPartModelData, { 'cursor-pointer': isLink }]"
      :style="[buildColStyleJson]"
      @click.stop="onClickSubBlock()"
      :ref="partsType"
    ></i>
    <!-- <Icon
      v-else-if="
        item.parts_type == 'icon' &&
        getPartModelData &&
        getPartModelData.indexOf('i-') === 0
      "
      :icon="getPartModelData.replace('i-', '')"
      class="bx-cell-icon"
      :class="[{ 'cursor-pointer': isLink }, getPartModelData]"
      :style="[buildColStyleJson]"
      @click.stop="onClickSubBlock()"
    ></Icon> -->
    <Icon
      v-else-if="item.parts_type == 'icon' && getIconName"
      :icon="getIconName"
      class="bx-cell-icon"
      :class="[{ 'cursor-pointer': isLink }, getPartModelData]"
      :style="[buildColStyleJson]"
      @click.stop="onClickSubBlock()"
      :ref="partsType"
    ></Icon>
    <div
      v-else-if="item.parts_type == '富文本'"
      :style="[buildColStyleJson]"
      v-html="recoverFileAddress4richText(getPartModelData)"
      :ref="partsType"
    ></div>
    <qr-code
      :size="buildColStyleJson.width ? parseInt(buildColStyleJson.width) : 100"
      :text="getPartModelData || 'https://www.baidu.com'"
      :color="buildColStyleJson.color || '#000000'"
      :style="[buildColStyleJson]"
      v-else-if="cellItem.parts_type == '二维码'"
      :ref="partsType"
    ></qr-code>
    <div
      :class="['bx-cell-' + cellItem.parts_type, { 'cursor-pointer': isLink }]"
      v-else-if="
        (cellItem.parts_type == 'row' || cellItem.parts_type == 'block') &&
        cellItem.hasOwnProperty('sub_card_parts_json') &&
        cellItem.sub_card_parts_json.length > 0
      "
      :style="[buildColStyleJson]"
      @click.stop="onClickSubBlock()"
      @mouseenter="onMouseenter"
      @mouseleave="onMouseleave"
    >
      <template v-for="(subCardPart, subindex) in cellItem.sub_card_parts_json">
        <card-cell-part
          :cellItem="subCardPart"
          :comColMap="comColMap"
          :cellItemData="cellItemData"
          :readOnly="readOnly"
          :queryOptions="queryOptions"
          :cellLayoutJson="subCardPart"
          :parentPart="cellItem"
          :accordion="accordion"
          :accordion-seq="accordionSeq"
          :active-accordion-seq="activeAccordionSeq"
          @on-click-part="onClickSubBlock"
          @on-click-cell="onClickCell"
          @show-dialog="showDialog"
        ></card-cell-part>
      </template>
    </div>
  </Fragment>
</template>

<script>
import "animate.css";

import { mapGetters } from "vuex";
import { Icon } from "@iconify/vue2";
import dayjs from "dayjs";
import LiquidFillChart from "../LiquidFillChart.vue";
import qrCode from "../qr-code/qr-code.vue";
import { formatStyleData } from "@/pages/datav/common";
import { setAnimationClass, setAnimationStyle } from "@/common/common";
import { numberAnimationRun } from "@/common/animations";
// 节流
function throttle(func, delay = 300) {
  let prev = 0;
  return function () {
    let now = Date.now();
    if (now - prev >= delay) {
      func.apply(this, arguments);
      prev = Date.now();
    }
  };
}
export default {
  name: "cardCellPart",
  options: {
    virtualHost: true, // 将自定义节点设置成虚拟的，更加接近Vue组件的表现。
  },
  components: {
    cardCellPart: () => import("./card-cell-part.vue"),
    Icon,
    LiquidFillChart,
    qrCode,
  },
  data() {
    return {
      fileNoMap: {},
    };
  },
  props: {
    cellItem: {
      type: Object,
    },
    cellItemData: {
      type: [Object, String],
    },
    parentPart: Object,
    readOnly: {
      type: Boolean,
      default() {
        return false;
      },
    },
    comColMap: {
      type: Object,
      default: null,
    },
    cellLayoutJson: {
      type: [Array, Object],
      default: function () {
        return {};
      },
    },
    queryOptions: Object,
    accordion: Boolean, //使用手风琴效果
    accordionSeq: Number,
    activeAccordionSeq: Number,
  },
  computed: {
    ...mapGetters("loginInfo", ["logined", "loginUser"]),
    animationClass() {
      return setAnimationClass({
        type: this.cellItem.animation_type,
        direction: this.cellItem.animation_direction,
      });
    },
    animationStyle() {
      return setAnimationStyle({
        duration: this.cellItem.animation_duration,
        delay: this.cellItem.animation_delay,
        repeat: this.cellItem.animation_repeat,
      });
    },
    useNumber() {
      return (
        this.cellItem?.use_animation === "是" &&
        this.cellItem.animation_type === "数字滚动"
      );
    },
    getIconName() {
      if (this.cellItem?.parts_type == "icon") {
        let icon = this.getPartModelData || "";
        if (icon) {
          if (icon?.startsWith("i-")) {
            return icon.replace("i-", "");
          } else if (icon?.startsWith("ri")) {
            return icon.replace("ri-", "ri:");
          } else if (icon?.startsWith("el-icon-")) {
            return icon.replace("el-icon-", "ep:");
          } else {
            return icon;
          }
        }
      }
    },
    item() {
      return this.cellItem;
    },
    isLink() {
      if (this.cellItem.sys_fun) {
        if (
          ["拨打电话", "地图导航", "登录", "退出登录"].includes(
            this.cellItem.sys_fun
          )
        ) {
          return true;
        }
      }
      if (this.cellItem.jump_json) {
        return true;
      }
      return false;
    },
    partsType() {
      return this.cellItem.parts_type;
    },
    videoAttribute() {
      let obj = {
        autoplay: false,
        controls: false,
        muted: false,
        loop: false,
        controlslist: "",
      };
      // set('自动播放','控制面板','不允许下载','不允许全屏','自动循环播放','默认静音')
      if (this.cellItem.video_attribute?.includes("自动播放")) {
        obj.autoplay = true;
      }
      if (this.cellItem.video_attribute?.includes("控制面板")) {
        obj.controls = true;
      }
      if (this.cellItem.video_attribute?.includes("不允许下载")) {
        obj.controlslist = "nodownload";
      }
      if (this.cellItem.video_attribute?.includes("不允许全屏")) {
        obj.controlslist += obj.controlslist ? ",nofullscreen" : "nofullscreen";
      }
      if (obj.controlslist) {
        obj.controls = true;
      }
      if (this.cellItem.video_attribute?.includes("自动循环播放")) {
        obj.loop = true;
      }
      if (this.cellItem.video_attribute?.includes("默认静音")) {
        obj.muted = true;
      }
      return obj;
    },
    videoPoster() {
      let poster = this.cellItem.video_default_poster;
      if (this.cellItem.video_poster_field) {
        poster = this.cellItemData[this.cellItem.video_poster_field] || poster;
      }
      return this.getImagePath(poster);
    },
    resetRichTextHtml() {
      if (this.getPartModelData && typeof this.getPartModelData === "string") {
        // 将所有nowrap改为wrap，防止一行展示不全不自动换行
        return this.getPartModelData.replace(/nowrap/gi, "wrap");
      } else {
        return "";
      }
    },
    buildColStyleJson() {
      const styleJson = this.cellItem?.style_json || {};
      let style = {};
      if (styleJson) {
        style = formatStyleData(styleJson);
      }
      if (
        this.accordionSeq === this.activeAccordionSeq &&
        this.accordion === true &&
        this.cellItem?.active_style_json
      ) {
        style = {
          ...style,
          ...formatStyleData(this.cellItem.active_style_json),
        };
      }
      return style;
    },
    getPartModelData() {
      const item = this.cellItem;
      const itemData = this.cellItemData || {};
      const map =
        this.comColMap ||
        Object.keys(itemData).reduce((acc, key) => {
          acc[key] = key;
          return acc;
        }, {});
      let type = item.parts_type;
      let key = item.variable || null;
      let val = item.parts_text;
      switch (type) {
        case "iconImg":
          val = item.parts_img;
          break;
        case "icon":
          val = item.parts_icon || val;
          break;
        default:
          break;
      }
      if (key && key.startsWith("user.")) {
        key = key.replace("user.", "");
        if (this.loginUser && this.loginUser[key]) {
          val = this.loginUser[key] || val || "";
        }
        return val;
      }
      if (item && itemData && !!map) {
        let data = itemData;
        let optionsType = "";
        if (item.hasOwnProperty("sys_fun") && item?.sys_fun) {
          optionsType = item?.sys_fun;
        }
        switch (optionsType) {
          case "拨打电话":
            key = item?.para_phone_col || item.variable;
            if (
              key &&
              map.hasOwnProperty(key) &&
              itemData.hasOwnProperty(map[key]) &&
              itemData[map[key]]
            ) {
              val = itemData[map[key]];
            }
            break;
          case "地图导航":
            let lgtKey = item?.para_map_lon;
            let latKey = item?.para_map_lat;
            // key = item?.para_phone_col || item.variable
            val = null;
            val = {};
            if (
              lgtKey &&
              map.hasOwnProperty(lgtKey) &&
              itemData.hasOwnProperty(map[lgtKey]) &&
              itemData[map[lgtKey]]
            ) {
              val["lgt"] = itemData[map[lgtKey]];
            } else {
              val = null;
            }
            if (
              latKey &&
              map.hasOwnProperty(latKey) &&
              itemData.hasOwnProperty(map[latKey]) &&
              itemData[map[latKey]]
            ) {
              val["lat"] = itemData[map[latKey]];
            } else {
              val = null;
            }
            break;
          default:
            if (
              item?.variable &&
              key &&
              map?.[key] &&
              itemData.hasOwnProperty(map[key]) &&
              itemData[map[key]]
            ) {
              val = itemData[map[key]] || "";
            } else if (
              item?.variable &&
              key &&
              itemData?.[key] &&
              itemData[key]
            ) {
              val = itemData[key] || "";
            } else if (
              item?.variable &&
              key &&
              this.queryOptions?.[key] &&
              this.queryOptions[key]
            ) {
              val = this.queryOptions[key] || "";
            } else if (
              ["string", "时间日期"].includes(item.parts_type) &&
              item.parts_text
            ) {
              val =
                this.renderStr(item.parts_text, {
                  data: itemData,
                  user: this.loginUser || {},
                  top: {
                    user: this.loginUser || {},
                  },
                  ...(this.queryOptions || {}),
                }) || "";
            }
            break;
        }
      } else if (item && itemData && !map) {
        if (item.hasOwnProperty("variable") && key && itemData?.[key]) {
          val = itemData[key] || "";
        } else if (
          item.hasOwnProperty("variable") &&
          key &&
          this.queryOptions?.[key]
        ) {
          val = this.queryOptions[key] || "";
        } else if (
          ["string", "时间日期"].includes(item.parts_type) &&
          item.parts_text
        ) {
          val =
            this.renderStr(item.parts_text, {
              data: itemData,
              user: this.loginUser || {},
              top: {
                user: this.loginUser || {},
              },
              ...this.queryOptions,
            }) || "";
        }
      }
      if (type === "时间日期" && item.date_format_rule) {
        val = dayjs(val).format(item.date_format_rule);
      }
      if (val && type === "iconImg" && item?.img_amount_limit === "多张") {
        // 展示多张图片
        if (this.fileNoMap[val] === undefined) {
          this.$set(this.fileNoMap, val, null);
          this.getFiles(val, item?.img_dpi);
        }
      }
      if (type === "水球图") {
        if (isNaN(parseFloat(val))) {
          val = 0;
        }
        return parseFloat(val);
      }
      return val;
    },

    partsShow() {
      const item = this.cellItem;
      const itemData = this.cellItemData || {};
      const map =
        this.comColMap ||
        Object.keys(itemData).reduce((acc, key) => {
          acc[key] = key;
          return acc;
        }, {});
      let show = true;
      if (
        item.disp_flag === "显示" &&
        item?.disp_variable?.includes("手风琴")
      ) {
        return this.accordionSeq === this.activeAccordionSeq;
      }
      // 根据显示条件判断是否显示 islogin代表是否登录
      if (item.disp_flag && item?.disp_variable?.toLowerCase() === "islogin") {
        if (item.disp_flag === "显示") {
          return item.disp_compare_value === "是"
            ? !!this.logined
            : !this.logined;
        } else if (item.disp_flag === "隐藏") {
          return item.disp_compare_value === "是"
            ? !this.logined
            : !!this.logined;
        }
      } else if (item && itemData) {
        if (
          item.disp_flag == "显示" &&
          item.disp_variable &&
          map.hasOwnProperty(item.disp_variable)
        ) {
          show = false;
          let val =
            itemData[map[item.disp_variable]] ||
            this.queryOptions[map[item.disp_variable]] ||
            null;
          let dispValue = item.disp_compare_value || null; // 显示值
          if (dispValue === "notnull") {
            show = !!val;
          } else if (dispValue && val) {
            dispValue = dispValue.split(",");
            // console.log('dispValue1',dispValue,val,itemData.target_name)
            if (dispValue.indexOf(val) !== -1) {
              show = true;
            }
          }
        } else if (
          item.disp_flag == "隐藏" &&
          item.disp_variable &&
          map.hasOwnProperty(item.disp_variable)
        ) {
          show = true;
          let val =
            itemData[map[item.disp_variable]] ||
            this.queryOptions[map[item.disp_variable]] ||
            null;
          let dispValue = item.disp_compare_value || null; // 隐藏值
          if (["null", "false"].includes(disp_compare_value)) {
            show = !!val;
          } else if (dispValue && val) {
            dispValue = dispValue.split(",");
            if (dispValue.indexOf(val) !== -1) {
              show = false;
            }
          }
        }
      }
      // console.log('dispValue2',itemData.rent_type,itemData.rent_status,show)
      if (!show) {
        console.log(
          "dispValue2",
          itemData.rent_type,
          itemData.rent_status,
          show
        );
      }
      return show;
    },
  },
  methods: {
    onMouseenter(event) {
      this.$emit("mouse-enter", event);
    },
    onMouseleave() {
      // this.$emit('update:active-accordion-seq', 0);
    },
    buildStyleJson(styleJson) {
      const cellLayoutJson = this.cellLayoutJson;
      let style = {};
      if (styleJson) {
        for (let key in styleJson) {
          style[key.replace(/_/g, "-")] = styleJson[key];
          // console.log('styleJson',key)
        }
      }
      let bgImg =
        cellLayoutJson && cellLayoutJson.background_image
          ? cellLayoutJson.background_image
          : "";

      // if (bgImg) {
      //   // 单元背景图 补偿样式。
      //   style['background-image'] = `url(${this.getImagePath(bgImg)})`;
      //   style['background-size'] = '100% 100%';
      //   style['background-repeat'] = 'no';
      // }
      // if (cellLayoutJson && !style.hasOwnProperty('min-height') && bgImg) {
      //   style['min-height'] = '40rpx'
      // };
      if (!style["background-color"]) {
        style["background-color"] = "transparent";
      }
      if (!style["overflow"]) style["overflow"] = "hidden";
      return style || {};
    },
    onClickCell(data, layout) {
      this.$emit("onClickSubBlock", data, layout);
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
      this.$emit("show-dialog", { rect, data, jumpJson });
    },
    onClickSubBlock: throttle(
      function (itemData, subCol, cellLayoutJson, parentCol, originCol) {
        this.$emit("on-click-row", itemData, cellLayoutJson);
        const self = this;
        itemData = itemData || this.cellItemData;
        subCol = subCol || this.cellItem;
        cellLayoutJson = cellLayoutJson || this.cellLayoutJson;
        if (this.readOnly) {
          return;
        }
        if (subCol?.sys_fun === "登录") {
          this.toLogin();
        } else if (subCol?.sys_fun === "退出登录") {
          this.$confirm("确认退出登录吗?", "提示", {
            confirmButtonText: "确认",
            cancelButtonText: "取消",
            type: "warning",
          }).then(() => {
            this.$store.dispatch("loginInfo/logout");
          });
        } else if (
          (!subCol?.sys_fun || subCol?.sys_fun === "无") &&
          !subCol?.jump_json
        ) {
          // 如果沒有配置系統功能 也没配置跳转 将事件传递到父部件
          if (this.parentPart?.parts_type) {
            this.$emit(
              "on-click-part",
              itemData,
              this.parentPart,
              cellLayoutJson,
              null,
              subCol
            );
          } else if (this.parentPart?.jump_json) {
            // 如果父部件配置了跳转 执行跳转
            this.jumpAction(this.parentPart?.jump_json, itemData);
            return;
          } else {
            // 没有父部件配置 点击事件传到卡片单元
            this.onClickCell(itemData, cellLayoutJson);
          }
          return;
        } else if (subCol?.jump_json) {
          // 执行自定义跳转
          if (subCol?.jump_json?.click_type === "弹框") {
            const element = this.$el;
            const rect = element.getBoundingClientRect();
            this.showDialog({
              rect,
              data: itemData,
              jumpJson: subCol.jump_json,
            });
          } else {
            this.jumpAction(subCol?.jump_json, itemData);
          }
          return;
        }
        let type = "";
        let optionsType = "";
        let text = "";
        let item = itemData;
        if (subCol) {
          type = subCol.parts_type;
          text = subCol.card_parts_name;
          if (subCol.hasOwnProperty("sys_fun") && subCol.sys_fun) {
            optionsType = subCol.sys_fun;
          }
        }
        let map = this.comColMap;
        let val = null;
        switch (optionsType) {
          case "拨打电话":
            // val = this.getPartModelData(subCol, map, item)
            val = itemData[subCol.para_phone_col];
            console.log("拨打电话", val);
            if (val) {
              window.location.href = `tel:${val}`;
              // this.$message.error("功能开发中...");
            } else {
              this.$message.error("未配置电话号码");
            }
            break;
          case "发短信":
            // val = this.getPartModelData(subCol, map, item)
            val = this.getPartModelData;
            console.log("发短信", val);
            if (val) {
              window.location.href = `sms:${val}`;
              // this.$message.error("功能开发中...");
            } else {
              this.$message.error("未配置电话号码");
            }
            break;
          case "地图导航":
            val = this.getPartModelData;
            console.log("地图导航", val);
            if (val && val.hasOwnProperty("lat") && val.hasOwnProperty("lgt")) {
              this.$message.error("功能开发中...");
            }
            break;
          case "表单操作":
            // if (subCol?.form_srv) {
            //   this.openUpdateFormPopup(itemData.id, subCol?.form_srv);
            // }
            break;
          case "退出登录":
            this.$confirm("确认退出登录吗?", "提示", {
              confirmButtonText: "确认",
              cancelButtonText: "取消",
              type: "warning",
            }).then(() => {
              this.$store.dispatch("loginInfo/logout");
            });
            break;
          case "登录":
            this.$store.dispatch("loginInfo/logout");
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
            break;
          default:
            console.log("没有点击事件");
            break;
        }
        console.log("onClickSubBlock", text, type, optionsType, item);
      },
      500,
      true
    ),
    getFileUrl(url) {
      if (url?.indexOf("http") === 0) {
        return url;
      } else if (url?.indexOf("data:image") === 0) {
        return url;
      } else {
        return `${
          this.serviceApi().downloadFile
        }${url}&bx_auth_ticket=${sessionStorage.getItem("bx_auth_ticket")}`;
      }
    },
    async getFiles(no, size) {
      let res = await this.getFilePath(no);
      if (res?.length) {
        res = res.map((item) => {
          item.__url = this.getFileUrl(item.fileurl);
          if (size !== "原图") {
            if (
              size &&
              !isNaN(parseInt(size)) &&
              typeof parseInt(size) === "number"
            ) {
              item.__url += `&thumbnailType=fwfh_${size}`;
            } else {
              item.__url += `&thumbnailType=fwfh_150`;
            }
          }

          return item;
        });
        this.$set(this.fileNoMap, no, res);
      }
    },
  },
  mounted() {
    if (this.useNumber) {
      // 使用数字滚动特效
      let ele = this.$refs?.[this.partsType];
      if (ele?.$el) {
        ele = ele?.$el;
      }
      if (ele) {
        numberAnimationRun({
          from: 0,
          to: Number(this.getPartModelData),
          duration: (this.cellLayoutJson?.animation_duration || 10) * 1000,
          delay: (this.cellLayoutJson?.animation_delay || 0) * 1000,
          easing: "easeOutExtreme",
          onProgress: (val) => {
            ele.innerHTML = val;
          },
          isInteger: true,
        });
      }
    }
  },
};
</script>

<style lang="scss" scoped>
[class^="bx-cell-"] {
  &.cursor-pointer {
    &:hover {
      color: var(--primary-color, #409eff);
    }
  }
}
.bx-cell-video {
  width: 100%;
  height: 100%;
  background-color: #ccc;
  object-fit: cover;
}
.bx-cell-string {
  text-align: justify;
  overflow: hidden;
  /* 溢出隐藏 */
  overflow: hidden;
  /* 溢出显示省略号 */
  text-overflow: ellipsis;
  word-break: break-all;
  // &:after{
  // 	content:"...";
  // 	position:relative;
  // 	right:0;
  // 	bottom:0;
  // 	width:1em;
  // }
}

.bx-text-cell {
  overflow: hidden;

  .u-wrap {
    background-color: transparent !important;
  }
}

.image-list {
  display: flex;
  flex-wrap: wrap;
  height: 100%;

  .image-item {
    margin-right: 10rpx !important;

    &.demo-layout {
      width: 100%;
      height: 100%;
    }

    &:last-child {
      margin-right: 0 !important;
    }
  }
}
</style>
