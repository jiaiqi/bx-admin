<template>
  <Fragment v-if="partsShow">
    <video
      class="bx-cell-video"
      controls
      :src="getImagePath(getPartModelData)"
      v-if="['视频'].includes(partsType)"
    ></video>
    <div
      v-else-if="['string', '时间日期'].includes(cellItem.parts_type)"
      class="bx-cell-string"
      :class="{
        'cursor-pointer': isLink,
      }"
      @click.stop="onClickSubBlock()"
      :style="[buildColStyleJson]"
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
    >
      {{ getPartModelData }}
    </div>
    <el-image
      v-else-if="item.parts_type == 'iconImg'"
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
    ></el-image>
    <el-rate
      :disabled="true"
      v-else-if="item.parts_type == 'rate'"
      :count="5"
      :value="Number(getPartModelData) || 0"
    ></el-rate>
    <el-progress
      :show-text="false"
      :style="[buildColStyleJson]"
      v-else-if="item.parts_type == 'progress'"
      :count="5"
      :define-back-color="buildColStyleJson['background-color'] || ''"
      :color="buildColStyleJson.color || '#2979ff'"
      :percentage="Number(getPartModelData) || 0"
    ></el-progress>
    <i
      v-else-if="
        item.parts_type == 'icon' &&
        item.parts_text &&
        item.parts_text.indexOf('el-icon-') !== -1
      "
      :class="[item.parts_text, { 'cursor-pointer': isLink }]"
      :style="[buildColStyleJson]"
      @click.stop="onClickSubBlock()"
    ></i>
    <Icon
      v-else-if="
        item.parts_type == 'icon' &&
        item.parts_text &&
        item.parts_text.indexOf('i-') === 0
      "
      :icon="item.parts_text"
      :class="{ 'cursor-pointer': isLink }"
      :style="[buildColStyleJson]"
      @click.stop="onClickSubBlock()"
    ></Icon>
    <div
      v-else-if="item.parts_type == '富文本'"
      :style="[buildColStyleJson]"
      v-html="getPartModelData"
    ></div>
    <div
      :class="['bx-cell-' + cellItem.parts_type, { 'cursor-pointer': isLink }]"
      v-else-if="
        (cellItem.parts_type == 'row' || cellItem.parts_type == 'block') &&
        cellItem.hasOwnProperty('sub_card_parts_json') &&
        cellItem.sub_card_parts_json.length > 0
      "
      :style="[buildColStyleJson]"
      @click.stop="onClickSubBlock()"
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
          @on-click-part="onClickSubBlock"
          @on-click-cell="onClickCell"
          @show-dialog="showDialog"
        ></card-cell-part>
      </template>
    </div>
  </Fragment>
</template>

<script>
import { mapGetters } from "vuex";

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
  },
  computed: {
    ...mapGetters("loginInfo", ["logined", "loginUser"]),
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
      const cellLayoutJson = this.cellLayoutJson;
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

          style[key.replace(/_/g, "-")] = styleJson[key];
          // console.log('styleJson',key)
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
      return style;
    },
    getPartModelData() {
      const item = this.cellItem;
      const map = this.comColMap;
      const itemData = this.cellItemData;
      let type = item.parts_type;
      let key = item.variable || null;
      let val = item.parts_text;
      switch (type) {
        case "iconImg":
          val = item.parts_img;
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
              // val = itemData[map[key]]
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
            } else if (item.parts_type === "string" && item.parts_text) {
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
        } else if (item.parts_type === "string" && item.parts_text) {
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
      if (val && type === "iconImg" && item?.img_amount_limit === "多张") {
        // 展示多张图片
        if (this.fileNoMap[val] === undefined) {
          this.$set(this.fileNoMap, val, null);
          this.getFiles(val, item?.img_dpi);
        }
      }
      return val;
    },

    partsShow() {
      const item = this.cellItem;
      const itemData = this.cellItemData;
      const map =
        this.comColMap ||
        Object.keys(itemData).reduce((acc, key) => {
          acc[key] = key;
          return acc;
        }, {});
      let show = true;
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
      // if((!layout?.sys_fun || layout?.sys_fun === "无") && !layout.jump_json)return
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
      debugger
      this.$emit("show-dialog", { rect, data, jumpJson });
    },
    onClickSubBlock: throttle(
      function (itemData, subCol, cellLayoutJson, parentCol, originCol) {
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
              this.$message.error("功能开发中...");
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
