<template>
  <div class="data-view-list">
    <div
      class="map-card-container"
      v-if="listOptions && listOptions.includes('关联地图筛选')"
    >
      <map-card
        class="map-card"
        :tree-req="listConfig && listConfig.map_tree_req_json"
        :pageItem="{
          map_json: listConfig && listConfig.map_json,
        }"
        @select="onSelect"
      ></map-card>
    </div>
    <div class="list-container">
      <div
        class="list-title"
        v-if="
          isMapList &&
          pageItem &&
          pageItem.show_label === '是' &&
          pageItem.com_label
        "
      >
        {{ pageItem.com_label }}
      </div>
      <div
        class="statistic-box"
        v-if="stasticData.length"
      >
        <div
          class="statistic-item"
          v-for="(item, index) in stasticData"
          :key="index"
        >
          <div class="label">{{ item.label }}</div>
          <div class="value">
            {{ item.value || "0" }}
            <span v-if="
              v2Data &&
              v2Data.cfgJson &&
              v2Data.cfgJson.statistics_card_col_unit
            ">{{ v2Data.cfgJson.statistics_card_col_unit }}</span>
          </div>
        </div>
      </div>
      <div
        class="handler-bar"
        v-if="showSearchBar"
      >
        <div></div>
        <div class="flex items-center">
          <el-input
            placeholder="搜索"
            class="search-input mr-2"
            clearable
            v-model="searchKey"
            size="mini"
          ></el-input>
          <el-button
            type="primary"
            class="search-btn"
            @click="onSearch"
            size="mini"
          >搜索</el-button>
          <el-button
            type="primary"
            class="search-btn"
            v-if="addBtn"
            plain
            size="mini"
            @click="showAddDialog = true"
          >{{ addBtn.button_name }}</el-button>
        </div>
      </div>
      <div class="list-view">
        <!-- 多行列宫格 -->
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
          ref="cardListRef"
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
            :active-cell-layout="activeCardJson"
            :cellData="tableData"
            :comColMap="comColMapJson"
            :cardLayout="layoutJson"
            :rowButtons="listV2RowButtons"
            :list-config="listConfig"
            @on-click-cell="onClickCell"
            @on-click-block="onClickBlock"
            @on-row-button-click="onRowButtonClick"
            @on-click-icon="onClickBlock"
            @setPageParams="setPageParams"
          >
          </cardGroupCell>
        </div>
        <!-- 表格 -->
        <div
          class="bx-table"
          v-else
          :style="setTableStyle"
          :class="{
            'scroll-animation': isVerticalScroll,
          }"
        >
          <div class="table-head">
            <div
              class="table-column"
              v-for="col in tableColumn"
              :key="col.columns"
              :style="{
                color: setStyle && setStyle.color,
                'font-size': setStyle && setStyle['font-size'],
              }"
              :title="col.label"
            >
              {{ col.label }}
            </div>
            <div
              class="table-column row-button-box"
              :style="rowButtonBoxStyle"
              v-if="showRowButtons"
            >
              操作
            </div>
          </div>
          <div
            class="table-body-wrap"
            :style="{
              height: isVerticalScroll ? `${displayRowLimit * 40}px` : 'auto',
            }"
          >
            <div class="table-body">
              <div
                class="table-row"
                v-for="(item, index) in displayTableData"
                :key="index"
                :class="{ stripe: striped && index % 2 === 1 }"
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
                  <el-image
                    class="td-img"
                    :src="getImagePath(formatValue(item, col))"
                    :preview-src-list="[getImagePath(formatValue(item, col))]"
                    v-if="col.col_type === 'Image' && formatValue(item, col)"
                  >
                  </el-image>
                  <span v-else>
                    {{ formatValue(item, col) }}
                  </span>
                </div>
                <div
                  class="table-column row-button-box"
                  :style="rowButtonBoxStyle"
                  v-if="showRowButtons"
                >
                  <el-button
                    type="text"
                    size="mini"
                    v-for="btn in setRowButtons"
                    :key="btn.button_type"
                    @click="onRowButtonClick(btn, item)"
                  >{{ btn.button_name }}</el-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        class="pagination-box"
        v-if="showPagination"
      >
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

    <el-dialog
      class="customDialogClass"
      title="添加"
      width="90%"
      :close-on-click-modal="1 == 2"
      append-to-body
      :visible="showAddDialog"
      @close="showAddDialog = false"
    >
      <simple-add
        v-if="showAddDialog"
        :service="getAddService"
        :navAfterSubmit="false"
        :submit2-db="true"
        :$srvApp="addBtn.application"
        @action-complete="onActionComplete"
        @form-loaded="onFormLoaded"
      >
      </simple-add>
    </el-dialog>
  </div>
</template>

<script>
import { $http } from "@/common/http";
import cardGroupCell from "@/pages/datav/component/page-item/card-group-cell/card-group-cell.vue";
import { formatStyleData } from "../../../common/index";
import GridList from "./grid-list.vue";
import SimpleAdd from "@/components/common/simple-add.vue";
import MapCard from "../map-card/index.vue";
export default {
  name: "data-view-list",
  components: {
    cardGroupCell,
    GridList,
    SimpleAdd,
    MapCard,
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
    isMapList: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      stasticData: [],
      v2Data: null,
      tableData: [],
      pageInfo: { pageNo: 1, rownumber: 10, total: 0 },
      searchKey: "",
      mapSearchKey: "",
      showAddDialog: false,
      // 滚动相关数据
      scrollTimer: null,
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
      const o = this.listOptions || "";
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
      return this.listConfig.list_options || "";
    },
    showPagination() {
      return this.listConfig?.list_options?.includes("分页");
    },
    showRowButtons() {
      let show = false;
      if (
        (this.listConfig?.list_options?.includes("单元按钮") || this.listConfig?.list_options?.includes("表格按钮")) &&
        this.setRowButtons.length > 0
      ) {
        show = true;
      }
      return show;
    },
    showSearchBar() {
      return (
        this.listConfig?.list_options?.includes("快捷筛选") &&
        this.listConfig?.filter_cols
      );
    },
    setRowButtons() {
      let buttons = this.listV2RowButtons || [];
      const ignoreBtns = ["duplicate", "delete", "edit"];
      return buttons.filter(
        (item) => item.permission && !ignoreBtns.includes(item.button_type)
      );
    },
    tableColumn() {
      if (
        this.listOptions?.includes("自定义表头") &&
        this.listConfig?.custom_table_head_cols &&
        this.listConfig?.custom_table_head_label
      ) {
        const cols = this.listConfig?.custom_table_head_cols.split(",");
        const labels = this.listConfig?.custom_table_head_label.split(",");
        return labels?.map((label, index) => {
          return {
            label,
            columns: cols[index],
          };
        });
      }
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
    activeCardJson() {
      return this.listConfig?.active_card_list_json || null;
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
    addBtn() {
      let btn = this.listV2GridButtons.find(
        (item) => item.button_type === "add"
      );
      return this.listOptions?.includes("添加") && btn;
    },
    getAddService() {
      return this.addBtn?.service_name;
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
    // 滚动方向
    scrollDirection() {
      return this.listConfig.animation_direction === "由上至下" ? "down" : "up";
    },
    // 是否为纵向滚动
    isVerticalScroll() {
      const displayLimit = this.listConfig.data_disp_limit || 5;
      return (
        this.listConfig.animation_type === "纵向滚动" &&
        this.tableData.length > displayLimit
      );
    },
    // 显示行数限制
    displayRowLimit() {
      return this.listConfig.data_disp_limit || 5;
    },
    // 显示的表格数据（用于滚动）
    displayTableData() {
      // 直接返回原始数据，不进行数据操作
      return this.tableData;
    },
    setTableStyle() {
      return {
        "--tbl_head_bg":
          this.listConfig?.tbl_head_bg ||
          this.setStyle?.["--tbl_head_bg"] ||
          null,
        "--cell_bg":
          this.listConfig?.cell_bg || this.setStyle?.["--cell_bg"] || null,
        "--cell_color":
          this.listConfig?.cell_color ||
          this.setStyle?.["--cell_color"] ||
          null,
        "--cell_bg2":
          this.listConfig?.cell_bg2 || this.setStyle?.["--cell_bg2"] || null,
        "--cell_color2":
          this.listConfig?.cell_color2 ||
          this.setStyle?.["--cell_color2"] ||
          null,
      };
    },
    // 动态计算操作列宽度
    rowButtonBoxWidth() {
      if (!this.showRowButtons || !this.setRowButtons.length) {
        return '0px';
      }

      // 基础按钮宽度（包含padding、margin等）
      const baseButtonWidth = 60; // mini按钮基础宽度
      const buttonMargin = 8; // 按钮间距
      const containerPadding = 16; // 容器内边距
      const buttonPadding = 10; // 按钮内边距

      // 计算所有按钮文字的总长度
      let totalTextWidth = 0;
      this.setRowButtons.forEach(btn => {
        const textWidth = this.measureTextWidth(btn.button_name || '', '12px');
        const buttonWidth = textWidth + buttonPadding;
        totalTextWidth += buttonWidth
      });

      // 计算总宽度：按钮数量 * 基础宽度 + 文字宽度 + 间距
      const totalWidth =
        this.setRowButtons.length * baseButtonWidth +
        totalTextWidth +
        (this.setRowButtons.length - 1) * buttonMargin +
        containerPadding;

      // 设置最小和最大宽度限制
      const minWidth = 80;
      const maxWidth = 200;

      return Math.min(Math.max(totalWidth, minWidth), maxWidth) + 'px';
    },

    // 操作列样式
    rowButtonBoxStyle() {
      return {
        width: this.rowButtonBoxWidth,
        minWidth: this.rowButtonBoxWidth,
        maxWidth: this.rowButtonBoxWidth,
        color: this.setStyle && this.setStyle.color,
        'font-size': this.setStyle && this.setStyle['font-size'],
      };
    },
  },
  methods: {
    // 精确测量文字宽度
    measureTextWidth(text, fontSize = '12px', fontFamily = 'Arial') {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      context.font = `${fontSize} ${fontFamily}`;
      return context.measureText(text).width;
    },
    onSelect(item) {
      console.log("onSelect", item);
      if (
        this.listConfig?.map_filter_val_field &&
        item[this.listConfig?.map_filter_val_field]
      ) {
        // this.mapSearchKey = item[this.listConfig?.map_filter_val_field];
        this.mapSearchKey = item.path;
        this.onSearch();
      }
    },
    onActionComplete(event) {
      console.log("onActionComplete", event);
      this.showAddDialog = false;
      this.onSearch();
    },
    onFormLoaded(event) {
      console.log("onFormLoaded", event);
    },
    onSearch() {
      this.pageInfo.pageNo = 1;
      let itemReqJson = this.pageItem.srv_req_json
        ? this.bxDeepClone(this.pageItem.srv_req_json)
        : null;
      // 组件请求
      if (itemReqJson) {
        itemReqJson.condition = itemReqJson.condition || [];
        if (this.listConfig?.filter_cols && this.searchKey) {
          itemReqJson.condition.push({
            colName: this.listConfig?.filter_cols,
            ruleType: "like",
            value: this.searchKey,
          });
        }
        if (this.listConfig?.map_filter_field && this.mapSearchKey) {
          // itemReqJson.condition.push({
          //   colName: this.listConfig?.map_filter_field,
          //   ruleType: "eq",
          //   value: this.mapSearchKey,
          // });
          itemReqJson.condition.push({
            colName: "path",
            ruleType: "[like]",
            value: this.mapSearchKey,
          });
        }
        const req = this.buildRequestParams(itemReqJson);
        this.getListData(req);
      }
    },
    toMore() {
      const { jump_page_json: jumpJson } = this.listConfig || {};
      if (
        jumpJson?.click_jump_option?.includes("先登录") ||
        jumpJson.auth_type === "注册用户" ||
        jumpJson.auth_type === "指定用户"
      ) {
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
            const currentUrl = window.location.pathname + window.location.hash;
            sessionStorage.setItem("login_redirect_url", currentUrl);
            const loginUrl = window.location.origin + "/main/login.html";
            window.location.href = loginUrl;
          });
          return;
        }
      }
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
      if (itemReqJson?.page) {
        itemReqJson.page.pageNo = val;
      } else if (itemReqJson) {
        itemReqJson.page = {
          pageNo: val,
          rownumber: this.pageInfo.rownumber || 10,
        };
      }
      const req = itemReqJson
        ? this.buildRequestParams(itemReqJson)
        : itemReqJson;
      // console.log("列表请求", req);
      this.getListData(req);
    },
    async getListData(req) {
      const url = `/${req.mapp}/select/${req.serviceName}`;
      if (Array.isArray(req.condition) && req.condition.length) {
        const data = Object.keys(this.pageParamsModel).reduce((res, key) => {
          res[key] = this.pageParamsModel[key]?.value;
          return res;
        }, {});
        req.condition.forEach((item) => {
          item.value = this.renderStr(item.value, data);
        });
      }
      const res = await $http.post(url, req);
      if (res.data.state === "SUCCESS") {
        this.tableData = res.data.data;
        if (res.data.page) {
          this.pageInfo = res.data.page;
        }
        // 数据更新后重新启动滚动
        if (this.isVerticalScroll) {
          this.$nextTick(() => {
            this.startVerticalScroll();
          });
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
          } catch (error) { }
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
      return row?.[col.columns];
    },
    onClickBlock(e) {
      console.log("onClickBlock", e);
    },
    onRowButtonClick(e, data) {
      console.log(e, data);
      if (e?.button_type === 'detail') {
        if (e.service_name && data?.id) {
          let address = `/vpages/#/detail/${e.service_name}/${data.id}`
          if (e.application) {
            address += `?srvApp=${e.application}`
          }
          let title = `${e.service_view_name}[${data.id}]`
          if (this.v2Data?.key_disp_col && data[this.v2Data?.key_disp_col]) {
            title = `${data[this.v2Data?.key_disp_col]}(${e.service_view_name})`
          }
          this.addTabByUrl(address, title)
        }
      } else if (e?.operate_mode === "跳转") {
        if (e.operate_type === "URL跳转") {
          const result = this.pre_data_handle(e, [data]);
          if (result) {
            window.open(result);
          }
        }
      }
    },
    pre_data_handle(butinfo, operateData) {
      var me = this;
      var pre_data_handle = butinfo.pre_data_handle;
      if (
        pre_data_handle != undefined &&
        pre_data_handle != null &&
        pre_data_handle != ""
      ) {
        if (operateData) {
          if (operateData.length == 0) {
            operateData = [{}];
          }
        }
        const url = eval("var zz=" + pre_data_handle + "(operateData,me); zz");
        return url;
      }
      return operateData;
    },
    onClickCell(e = {}) {
      console.log("onClickCell", e);
      const { cellsLayout, data } = e;
      if (data && cellsLayout?.jump_json) {
        const jumpJson = cellsLayout.jump_json;
        return this.jumpAction(jumpJson, data);
      }
    },
    buildRequestParams(e) {
      // 处理请求中变量 根据参数关系 获取动态值
      let condition = this.bxDeepClone(e.condition);
      let mapsJonss = this.colsMapDetailJson || [];

      if (Array.isArray(condition)) {
        for (let cond of condition) {
          // console.log("buildRequestParams", cond.colName, cond.value);
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
    // 开始纵向滚动 - 性能优化版本
    startVerticalScroll() {
      if (!this.isVerticalScroll) return;
      this.stopVerticalScroll();

      const interval = Math.max(
        (this.listConfig.animation_interval ||
          this.$options.CONSTANTS.DEFAULT_INTERVAL / 1000) * 1000,
        2000
      );

      this.scrollTimer = setInterval(() => {
        this.performScrollStep();
      }, interval);
    },

    // 执行单步滚动 - 使用transform优化性能
    performScrollStep() {
      const tableBody = this.$el?.querySelector(".table-body");
      if (!tableBody || !tableBody.children.length) return;

      const rows = Array.from(tableBody.children);
      const rowHeight = rows[0]?.offsetHeight || 0;

      if (rowHeight === 0) return;

      // 使用transform实现平滑滚动，避免DOM重排
      // 向下滚动时内容向上移动（负值），向上滚动时内容向下移动（正值）
      const translateY =
        this.scrollDirection === "down" ? rowHeight : -rowHeight;
      const ANIMATION_DURATION = this.listConfig?.animation_duration || 2000;
      // 添加过渡效果
      tableBody.style.transition = `transform ${ANIMATION_DURATION}ms cubic-bezier(0.55, -0.55, 0.5, 1.2)`;
      tableBody.style.transform = `translateY(${translateY}px)`;

      // 动画完成后重置位置并调整DOM结构
      setTimeout(() => {
        this.resetScrollPosition(tableBody, rows);
      }, ANIMATION_DURATION);
    },

    // 重置滚动位置并调整DOM结构
    resetScrollPosition(tableBody, rows) {
      // 移除过渡效果，立即重置transform
      tableBody.style.transition = "none";
      tableBody.style.transform = "translateY(0)";

      // 使用DocumentFragment批量操作DOM，减少重排
      const fragment = document.createDocumentFragment();

      if (this.scrollDirection === "down") {
        // 向下滚动：将最后一行移到第一行（显示新的内容）
        const lastRow = rows[rows.length - 1];
        fragment.appendChild(lastRow);
        rows.slice(0, -1).forEach((row) => fragment.appendChild(row));
      } else {
        // 向上滚动：将第一行移到最后（显示之前的内容）
        const firstRow = rows[0];
        rows.slice(1).forEach((row) => fragment.appendChild(row));
        fragment.appendChild(firstRow);
      }

      // 一次性更新DOM
      tableBody.innerHTML = "";
      tableBody.appendChild(fragment);
    },
    // 停止纵向滚动
    stopVerticalScroll() {
      if (this.scrollTimer) {
        clearInterval(this.scrollTimer);
        this.scrollTimer = null;
      }
      // 清理滚动相关样式
      this.cleanupScrollStyles();
    },

    // 清理滚动样式，防止内存泄漏
    cleanupScrollStyles() {
      const tableBody = this.$el?.querySelector(".table-body");
      if (tableBody) {
        tableBody.style.transition = "";
        tableBody.style.transform = "";
        tableBody.style.willChange = "auto";
      }
    },

    // 错误处理包装器
    safeExecute(fn, errorMessage = "操作执行失败") {
      try {
        return fn();
      } catch (error) {
        console.error(errorMessage, error);
        this.error = errorMessage;
        return null;
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
      // console.log("列表请求", req);
      this.getListData(req);
      if (
        this.listConfig?.list_options?.includes("自定义表头") ||
        this.listType !== "表格"
      ) {
        // 不请求v2
      } else {
        this.getV2Data(req).then((_) => {
          this.getStatisticData(req);
        });
      }
    }
    // else if(Array.isArray(this.pageItem.list_json?.mock_data_json)&&this.pageItem.list_json?.mock_data_json.length){
    //   this.tableData = this.pageItem.list_json?.mock_data_json;
    // }
    // 组件挂载后启动滚动
    if (this.isVerticalScroll) {
      this.$nextTick(() => {
        this.startVerticalScroll();
      });
    }
  },
  beforeDestroy() {
    // 组件销毁前清理所有资源
    this.stopVerticalScroll();
    this.cleanupScrollStyles();

    // 清理可能的事件监听器
    if (this.$el) {
      const tableBody = this.$el.querySelector(".table-body");
      if (tableBody) {
        tableBody.removeEventListener(
          "transitionend",
          this.handleTransitionEnd
        );
      }
    }
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
    // 监听滚动配置变化
    "listConfig.animation_type": {
      handler(newVal, oldVal) {
        if (newVal === "纵向滚动") {
          this.$nextTick(() => {
            this.startVerticalScroll();
          });
        } else {
          this.stopVerticalScroll();
        }
      },
    },
    "listConfig.animation_direction": {
      handler(newVal, oldVal) {
        if (this.isVerticalScroll) {
          this.stopVerticalScroll();
          this.$nextTick(() => {
            this.startVerticalScroll();
          });
        }
      },
    },
    tableData: {
      handler(newVal, oldVal) {
        if (this.isVerticalScroll) {
          this.scrollIndex = 0;
          this.$nextTick(() => {
            this.startVerticalScroll();
          });
        }
      },
    },
  },
};
</script>

<style lang="scss" scoped>
.data-view-list {
  width: 100%;
  display: flex;
  overflow: hidden;
  flex: 1;

  .map-card-container {
    width: 70%;
  }

  .list-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow-x: hidden;

    .list-title {
      font-size: 18px;
      padding: 10px 20px;
      font-weight: bold;
    }

    .list-view {
      flex: 1;
      overflow-y: auto;
      scrollbar-width: none;
      scrollbar-width: thin;
      scrollbar-color: rgba(0, 0, 0, 0.1) transparent;
      &::-webkit-scrollbar {
        width: 3px;
        height: 3px;
      }

      &::-webkit-scrollbar-thumb {
        background-color: rgba(0, 0, 0, 0.1);
        border-radius: 4px;
      }
    }
  }
}

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

.handler-bar {
  display: flex;
  justify-content: space-between;

  .search-input {
    min-width: 300px;
  }

  .search-btn {
    min-width: 80px;
  }
}

.bx-table {
  // overflow: hidden;
  color: var(--cell_color, #fff);
  // display: table;
  .table-head,
  .table-row {
    display: flex;
    background-color: var(--cell_bg);
    &.stripe {
      background-color: var(--cell_bg2, rgba($color: #fff, $alpha: 0.1));
      color: var(--cell_color2);
    }

    .table-column {
      flex: 1;
      padding: 8px;
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
      cursor: pointer;
      // display: flex;
      // align-items: center;

      span {
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
      }

      .td-img {
        width: 100%;
        height: 100%;
        min-height: 50px;
        object-fit: cover;
        width: 120px;
        border-radius: 8px;
      }

      &.row-button-box {
        flex: 1.5;

        .el-button {
          min-width: 50px;
        }
      }
    }
  }

  .table-head {
    background-color: var(--tbl_head_bg, rgba($color: #999, $alpha: 0.2));
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

// 滚动动画样式 - 性能优化版本
.scroll-animation {
  .table-body-wrap {
    overflow: hidden;
  }

  .table-body {
    position: relative;
    // 启用硬件加速
    transform: translateZ(0);
    will-change: transform;

    .table-row {
      transition: opacity 0.3s ease-out;
      opacity: 1;
      // 启用硬件加速
      transform: translateZ(0);

      // 顶部即将滚出视口的元素渐隐效果
      &:first-child {
        opacity: 0.8;
      }

      &:nth-child(2) {
        opacity: 0.9;
      }

      // 底部即将滚出视口的元素渐隐效果
      &:last-child {
        opacity: 0.8;
      }

      &:nth-last-child(2) {
        opacity: 0.9;
      }

      // 中间完全可见区域保持完全不透明
      &:nth-child(n + 3):nth-last-child(n + 3) {
        opacity: 1;
      }
    }
  }
}
</style>