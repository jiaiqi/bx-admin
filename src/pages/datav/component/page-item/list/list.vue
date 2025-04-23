<template>
  <div>
    <div class="more-btn">
      <span v-if="showMoreBtn" @click="toMore">
        更多
        <i class="el-icon-arrow-right"></i>
      </span>
    </div>
    <div class="statistic-box" v-if="stasticData.length">
      <div
        class="statistic-item"
        v-for="(item, index) in stasticData"
        :key="index"
      >
        <div class="label">{{ item.label }}</div>
        <div class="value">
          {{ item.value || "0" }}
          <span
            v-if="
              v2Data &&
              v2Data.cfgJson &&
              v2Data.cfgJson.statistics_card_col_unit
            "
            >{{ v2Data.cfgJson.statistics_card_col_unit }}</span
          >
        </div>
      </div>
    </div>
    <grid-list
      class=""
      v-if="'多行列宫格' === listType || '多行列文本' === listType"
      :config="listConfig"
      :list="tableData"
      :page-item="pageItem"
    >
    </grid-list>
    <!-- 卡片列表 -->
    <div
      class="bx-card-list"
      :style="[styleWidthPictures]"
      v-else-if="listType == '卡片'"
    >
      <el-carousel
        trigger="click"
        :height="setSwiperHeight"
        :style="[setSwiperStyle]"
        v-if="setListSwiperImg && setListSwiperImg.length"
        class="swiper-container"
        :autoplay="true"
      >
        <el-carousel-item
          v-for="(item, index) in setListSwiperImg"
          :key="index"
        >
          <img
            :src="getImagePath(item._img_url)"
            alt=""
            style="width: 100%; height: 100%"
          />
          <div
            class="swiper-title"
            v-if="
              listConfig &&
              listConfig.swiper_title_col &&
              item[listConfig.swiper_title_col]
            "
          >
            {{ item[listConfig.swiper_title_col] }}
          </div>
        </el-carousel-item>
      </el-carousel>
      <cardGroupCell
        :pageParamsModel="pageParamsModel"
        :queryOptions="queryOptions"
        v-if="pageItem && listType == '卡片'"
        ref="cardGroupCell"
        :pageItem="pageItem"
        :cellsLayout="[cardUnitJson]"
        :cellData="tableData"
        :comColMap="comColMapJson"
        :cardLayout="layoutJson"
        :rowButtons="listV2RowButtons"
        @on-click-cell="onClickCell"
        @on-click-block="onClickBlock"
        @on-row-button-click="onRowButtonClick"
        @on-click-icon="onClickBlock"
        @setPageParams="setPageParams"
      >
      </cardGroupCell>
    </div>
    <!-- 表格 -->
    <div class="bx-table" v-else>
      <div class="table-head">
        <div
          class="table-column"
          v-for="col in tableColumn"
          :key="col.columns"
          :style="{
            color: setStyle && setStyle.color,
            'font-size': setStyle && setStyle['font-size'],
          }"
        >
          {{ col.label }}
        </div>
      </div>
      <div
        class="table-row"
        v-for="(item, index) in tableData"
        :key="index"
        :class="{ stripe: striped }"
      >
        <div
          class="table-column"
          v-for="col in tableColumn"
          :title="formatValue(item, col)"
          :key="col.columns"
          :style="{
            color: setStyle && setStyle.color,
            'font-size': setStyle && setStyle['font-size'],
          }"
        >
          {{ formatValue(item, col) }}
        </div>
      </div>
    </div>
    <div class="pagination-box" v-if="showPagination">
      <el-pagination
        background
        class="el-pagination"
        @current-change="handleCurrentChange"
        :current-page="pageInfo.pageNo"
        :page-size="pageInfo.rownumber"
        layout="total, prev, pager, next"
        :total="pageInfo.total"
      >
      </el-pagination>
    </div>
  </div>
</template>

<script>
// import { $http } from "@/pages/datav/common/http.js";
import { $http } from "@/common/http";
import cardGroupCell from "@/pages/datav/component/page-item/card-group-cell/card-group-cell.vue";
import { formatStyleData } from "../../../common/index";
import GridList from "./grid-list.vue";

export default {
  name: "data-view-list",
  components: {
    cardGroupCell,
    GridList,
  },
  props: {
    pageItem: {
      type: Object,
    },
    queryOptions: {
      type: Object,
    },
    readOnly: {
      type: Boolean,
      default: false,
    },
    pageParamsModel: {
      type: Object,
    },
  },
  data() {
    return {
      stasticData: [],
      v2Data: null,
      tableData: [],
      pageInfo: { pageNo: 1, rownumber: 10, total: 0 },
    };
  },
  computed: {
    showMoreBtn() {
      return (
        this.listOptions?.includes("更多按钮") &&
        this.listConfig?.jump_page_json
      );
    },
    styleWidthPictures() {
      const o = this.listOptions || '';
      if (
        o?.includes("顶部图片") ||
        o?.includes("底部图片") ||
        o?.includes("左侧图片") ||
        o?.includes("右侧图片")
      ) {
        let obj = {
          display: "flex",
        };
        if (o?.includes("顶部图片") || o?.includes("底部图片")) {
          obj["flex-direction"] = "column";
        }
        if (o?.includes("底部图片")) {
          obj["flex-direction"] = "column-reverse";
        }
        if (o?.includes("左侧图片") || o?.includes("右侧图片")) {
          obj["flex-direction"] = "row";
          obj["align-items"] = "flex-start";
        }
        if (o?.includes("右侧图片")) {
          obj["flex-direction"] = "row-reverse";
          obj["align-items"] = "flex-start";
        }
        return obj;
      }
    },
    listConfig() {
      return this.pageItem?.list_json || {};
    },
    listType() {
      return this.listConfig.list_type || "表格";
    },
    listOptions() {
      return this.listConfig.list_options || '';
    },
    showPagination() {
      return this.listConfig?.list_options?.includes("分页");
    },
    tableColumn() {
      let cols = this.v2Data?.srv_cols || [];
      cols = cols.filter((item) => item.in_list === 1);
      return cols.slice(0, 6);
    },
    striped() {
      return this.listConfig?.list_options?.indexOf("斑马纹") != -1;
    },
    carousel() {
      return this.listConfig?.list_options?.includes("滚动");
    },
    config() {
      let res = {
        header: [],
        data: [],
      };
      if (this.tableColumn?.length) {
        res.header = this.tableColumn.map((item) => item.label);
        if (this.tableData?.length) {
          res.data = this.tableData.map((item) => {
            let val = [];
            this.tableColumn.forEach((col) => {
              val.push(item[col.columns]);
            });
            return val;
          });
        }
      }
      return res;
    },
    layoutJson: function () {
      let json = this.listConfig?.layout_json || null;
      return json;
    },
    cardUnitJson: function () {
      let json = this.listConfig?.card_unit_json || null;
      return json;
    },
    comColMap: function () {
      let json = this.pageItem?.cols_map_json || null;
      console.log("comColMap", this.tableLayoutType, json);
      return json;
    },
    comColMapJson: function () {
      let json = this.pageItem?.cols_map_json?.cols_map_json || null;
      return json;
    },
    listV2RowButtons() {
      let buttons =
        this.v2Data?.rowButton?.filter((item) => item.permission) || [];
      if (this.readOnly) {
        //只读列表指控功能按钮
        buttons = [];
      }
      return buttons;
    },
    listV2GridButtons() {
      let buttons =
        this.v2Data?.gridButton?.filter((item) => item.permission) || [];
      if (this.readOnly) {
        //只读列表指控功能按钮
        buttons = [];
      }
      return buttons;
    },
    colsMapDetailJson() {
      // 组件参数 的map array  接口返回数据格式 无法确定接口时啥样子，小程序 逻辑使用com_para_with_map_json 但没值，改用有值的 page_com_cols_map_json
      let pageComColsMapJson = this.pageItem.page_com_cols_map_json || null;
      let colsMapDetailJson = null;
      if (pageComColsMapJson) {
        // 识别、处理组件到页面参数联动
        if (
          pageComColsMapJson.cols_map_detail_json &&
          Array.isArray(pageComColsMapJson.cols_map_detail_json)
        ) {
          colsMapDetailJson = pageComColsMapJson.cols_map_detail_json;
          console.log("colsMapDetailJson", colsMapDetailJson);
        }
      }
      return colsMapDetailJson;
    },
    setStyle() {
      return formatStyleData(this.pageItem?.style_json || {});
    },
    setSwiperStyle() {
      if (this.listConfig?.swiper_style_json) {
        return formatStyleData(this.listConfig?.swiper_style_json);
      }
    },
    setSwiperHeight() {
      return this.setSwiperStyle?.height?.includes("px")
        ? this.setSwiperStyle.height
        : "150px";
    },

    setListSwiperImg() {
      if (
        Array.isArray(this.tableData) &&
        typeof this.listOptions === "string" &&
        (this.listOptions?.includes("顶部图片") ||
          this.listOptions?.includes("底部图片") ||
          this.listOptions?.includes("左侧图片") ||
          this.listOptions?.includes("右侧图片")) &&
        this.listConfig?.swiper_col
      ) {
        return this.tableData
          .filter((item) => !!item[this.listConfig?.swiper_col])
          .map((item) => {
            item._img_url = item[this.listConfig?.swiper_col];
            return item;
          });
      }
    },
  },
  methods: {
    toMore() {
      const { jump_page_json: jumpJson } = this.listConfig || {};
      if (jumpJson?.obj_type === "内部页面") {
        let pageNo = jumpJson?.dest_page_no;
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
      this.$emit("toMore", this.listConfig?.jump_page_json);
    },
    // 透传参数
    setPageParams(key, val) {
      // 接受透传参数
      this.$emit("setPageParams", key, val);
    },
    handleCurrentChange(val) {
      this.pageInfo.pageNo = val;
      let itemReqJson = this.pageItem.srv_req_json
        ? this.bxDeepClone(this.pageItem.srv_req_json)
        : null;
      const req = itemReqJson
        ? this.buildRequestParams(itemReqJson)
        : itemReqJson;
      console.log("列表请求", req);
      this.getListData(req);
    },
    async getListData(req) {
      const url = `/${req.mapp}/select/${req.serviceName}`;
      const res = await $http.post(url, req);
      if (res.data.state === "SUCCESS") {
        this.tableData = res.data.data;
        if (res.data.page) {
          this.pageInfo = res.data.page;
        }
      }
    },
    async getV2Data(srvCfg) {
      const url = `/${srvCfg.mapp}/select/srvsys_service_columnex_v2_select?colsel_v2=${srvCfg.serviceName}`;
      const req = {
        serviceName: "srvsys_service_columnex_v2_select",
        colNames: ["*"],
        condition: [
          {
            colName: "service_name",
            ruleType: "eq",
            value: srvCfg.serviceName,
          },
          { colName: "use_type", ruleType: "eq", value: "list" },
        ],
        order: [{ colName: "seq", orderType: "asc" }],
      };
      const res = await $http.post(url, req);
      if (res?.data?.state === "SUCCESS") {
        if (res.data.data?.cfg_json) {
          try {
            res.data.data.cfgJson = JSON.parse(res.data.data.cfg_json);
          } catch (error) {}
        }
        this.v2Data = res.data.data;
      }
    },
    async getStatisticData(req) {
      const colName = this.v2Data?.cfgJson?.statistics_card_col;
      const col = this.v2Data?.srv_cols.find(
        (item) => item.columns === colName
      );
      if (col && col.col_type === "Enum") {
        const group = [
          {
            colName: colName,
            type: "by",
          },
          {
            colName: colName,
            type: "count",
            aliasName: "count",
          },
        ];
        req.condition = req.condition || [];
        req.condition.push({
          colName,
          ruleType: "notnull",
          value: null,
        });
        const url = `/${req.mapp}/select/${req.serviceName}`;
        req.group = group;
        const res = await $http.post(url, req);
        if (res.data.state === "SUCCESS") {
          if (Array.isArray(res.data.data) && res.data.data.length > 0) {
            this.stasticData = [];
            res.data.data.forEach((item) => {
              item.label = item[colName];
              item.value = item.count;
              this.stasticData.push(item);
            });
          }
        }
      }
    },
    formatValue(row, col) {
      let res = row[col.columns];

      return res;
    },
    onClickBlock(e) {
      console.log("onClickBlock", e);
    },
    onRowButtonClick(e) {
      console.log(e);
    },
    onClickCell(e = {}) {
      console.log("onClickCell", e);
      const { cellsLayout, data } = e;
      if (data && cellsLayout?.jump_json) {
        const jumpJson = cellsLayout.jump_json;
        if (jumpJson.click_type === "跳转") {
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
                  // pagePath += `&${item.col_to}=${data[item.col_from]}`;
                }
              });
            }
            if (pagePath) {
              window.open(pagePath);
            }
          }
        }
      }
    },
    buildRequestParams(e) {
      // 处理请求中变量 根据参数关系 获取动态值
      let condition = this.bxDeepClone(e.condition);
      let mapsJonss = this.colsMapDetailJson || [];

      if (Array.isArray(condition)) {
        for (let cond of condition) {
          console.log("buildRequestParams", cond.colName, cond.value);
          if (
            cond.value &&
            cond.value.startsWith("${") &&
            cond.value.endsWith("}")
          ) {
            // 根据${} 格式转移变量名称
            let par = cond.value.replace("${", "");

            par = par.replace("}", "");
            let params = this.bxDeepClone(this.pageParamsModel);
            if (params && Object.keys(params).length > 0) {
              for (let key in params) {
                // console.log('key',key,par)
                if (key === par) {
                  let mapsCol = mapsJonss.filter(
                    (item) => item.col_to === par || item.col_from === par
                  );
                  if (Array.isArray(mapsCol) && mapsCol.length > 0) {
                    // 遍历组件参数 映射
                    let model = null;
                    for (let col of mapsCol) {
                      switch (col.from_type) {
                        case "页面":
                          // 来源为页面
                          model = this.pageParamsModel;
                          switch (col.to_type) {
                            case "组件":
                              // 目标为组件的参数，设置动态获取的值
                              cond.value = this.pageParamsModel[key].value;
                              if (
                                cond.value === undefined &&
                                cond.ruleType === "eq"
                              ) {
                                cond.ruleType = "like";
                              }
                              break;
                            case "页面":
                              break;

                            default:
                              break;
                          }
                          break;

                        default:
                          break;
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
      e.condition = this.bxDeepClone(condition);
      if (e.page) {
        this.pageInfo.pageNo = e.page.pageNo;
        this.pageInfo.rownumber = e.page.rownumber;
      } else {
        e.page = {
          pageNo: this.pageInfo.pageNo,
          rownumber: this.pageInfo.rownumber,
        };
      }
      // console.log(e.serviceName,condition)
      return e;
    },
    paramsLinkage() {
      let itemReqJson = this.pageItem.srv_req_json
        ? this.bxDeepClone(this.pageItem.srv_req_json)
        : null;
      // 组件请求
      const req = itemReqJson
        ? this.buildRequestParams(itemReqJson)
        : itemReqJson;
      // console.log('列表请求',req,req.serviceName)
      let mapsJonss = this.colsMapDetailJson || [];
      if (Array.isArray(mapsJonss)) {
        for (let p of mapsJonss) {
          if (p.from_type === "页面" && p.trigger_time === "联动") {
            // 设置了与页面联动参数值时
            this.getListData(req);
          }
        }
      }
    },
  },
  mounted() {
    if (this.pageItem?.srv_req_type === "模拟数据") {
      this.tableData = this.pageItem?.mock_srv_data_json || [];
      this.pageInfo.total = this.tableData.length;
    } else if (this.pageItem?.srv_req_json) {
      let itemReqJson = this.pageItem.srv_req_json
        ? this.bxDeepClone(this.pageItem.srv_req_json)
        : null;
      const req = itemReqJson
        ? this.buildRequestParams(itemReqJson)
        : itemReqJson;
      console.log("列表请求", req);

      this.getListData(req);
      this.getV2Data(req).then((_) => {
        this.getStatisticData(req);
      });
    }
    // else if(Array.isArray(this.pageItem.list_json?.mock_data_json)&&this.pageItem.list_json?.mock_data_json.length){
    //   this.tableData = this.pageItem.list_json?.mock_data_json;
    // }
  },
  watch: {
    pageParamsModel: {
      deep: true,
      immediate: true,
      handler: function (newVal, oldVal) {
        // 页面参数更新后调用
        this.paramsLinkage();
      },
    },
  },
};
</script>

<style lang="scss" scoped>
.more-btn {
  position: absolute;
  top: 15px;
  right: 0;
  margin: 0 15px;
  cursor: pointer;
  color: inherit;
  // transition: scale 0.3s ease-in-out;
  &:hover {
    scale: 1.05;
    // font-weight: bold;
    // border-bottom: 1px dashed currentColor;
  }
}
.bx-table {
  color: #fff;
  .table-head {
    background-color: rgba($color: #999, $alpha: 0.1);
  }

  .table-head,
  .table-row {
    display: flex;

    &.stripe {
      &:nth-child(2n + 1) {
        background-color: rgba($color: #fff, $alpha: 0.1);
      }
    }

    .table-column {
      flex: 1;
      padding: 8px;
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
      cursor: pointer;
    }
  }
}

.statistic-box {
  display: flex;
  padding: 10px;

  .statistic-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 10px;
    background-color: #1e2750;
    margin-right: 20px;
    cursor: pointer;
    min-width: calc(20% - 80px / 5);

    &:last-child {
      margin: 0;
    }

    .label {
      line-height: 30px;
      color: #6ba1ff;
      text-align: left;
    }

    .value {
      text-align: left;
    }
  }
}
.bx-card-list {
  .swiper-container {
    position: relative;
    ::v-deep .el-carousel__indicators.el-carousel__indicators--horizontal {
      bottom: 20px;
    }
    .swiper-title {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 30px;
      line-height: 30px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      background: rgba($color: #000, $alpha: 0.3);
      padding: 0 10px;
      font-size: 14px;
      color: #fff;
    }
  }
}

.pagination-box {
  text-align: center;
  padding: 10px;
  :deep(.el-pagination) {
    &.is-background {
      .el-pager li:not(.disabled).active {
        background-color: var(--primary-color, #2196f3);
      }
    }
  }
}
</style>
