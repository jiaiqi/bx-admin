<template>
  <!-- <div style="width:100px;height:100px;background:#fff;"> -->
  <cardGroupCell
    :key="pageItem.com_no"
    :queryOptions="queryOptions"
    ref="cardGroupCell"
    :pageItem="pageItem"
    :cellsLayout="cellsLayoutJson"
    :cellData="cellData"
    :comColMap="comColMapRun"
    :cardLayout="cardLayoutJson || null"
    @on-click-cell="onClickCell"
    @on-click-block="onClickBlock"
    @on-click-icon="onClickBlock"
    @data-updated="onDataUpdate"
    v-if="cellsLayoutJson && cellsLayoutJson.length"
  ></cardGroupCell>
  <div v-else-if="pageItem && pageItem.com_label">
    {{ pageItem.com_label }}
  </div>
  <!-- </div> -->
</template>

<script>
import pageItemComponentMixin from "../../../common/functions/pageItemComponentMixin.js";
import cardGroupCell from "../card-group-cell/card-group-cell.vue";
import cardPopup from "./card-popup.vue"
export default {
  data() {
    return {
      cellData: [],
    };
  },
  components: {
    cardGroupCell,
    cardPopup
  },
  mixins: [pageItemComponentMixin],
  props: {
    queryOptions: Object,
    pageItem: {
      type: Object,
      default: function () {
        return null;
      },
    },
  },
  computed: {
    comColMapRun: function () {
      let json =
        this.pageItem?.com_srv_col_map_json || this.pageItem?.cols_map_json;
      if (this.pageItem.hasOwnProperty("cols_map_json")) {
        // if(this.pageItem?.cols_map_json.hasOwnProperty('cols_map_json')){
        // 	json = this.pageItem?.cols_map_json?.cols_map_json
        // 	// return json
        // }
      }
      let maps = this.paramsBuild(json)?.target?.com || {};
      return maps || {};
    },

    cardLayoutJson: function () {
      let json = this.pageItem?.card_group_json?.card_layout_json || {};
      return json;
    },
    datasfromType: function () {
      let cfgfrom = this.pageItem?.srv_req_type;
      switch (cfgfrom) {
        case "模板动态加载":
          return this.pageItem?.srv_req_type;
          break;
        default:
          break;
      }
      return cfgfrom;
    },
    fromType: function () {
      let cfgfrom = this.pageItem.card_unit_cfg_from || "静态配置";
      return cfgfrom;
    },
    cellsLayoutJson: function () {
      let cfgfrom = this.pageItem.card_unit_cfg_from;
      let cells = [];
      switch (cfgfrom) {
        case "静态配置":
        case "静态自有配置":
          cells =
            this.pageItem?.card_unit_merge_json ||
            this.pageItem?.card_group_json?.card_unit_json
              ? [this.pageItem?.card_group_json?.card_unit_json]
              : [];
          break;
        case "模板动态加载":
          cells = this.pageItem?.card_group_json?.card_unit_json
            ? [this.pageItem?.card_group_json?.card_unit_json]
            : [];
          break;
        default:
          cells =
            this.pageItem?.card_unit_merge_json ||
            this.pageItem?.card_group_json?.card_unit_json
              ? [this.pageItem?.card_group_json?.card_unit_json]
              : [];
          break;
      }
      return cells;
    },
  },
  mounted() {
    this.getDatas();
  },
  methods: {
    navToPath(path) {
      uni.navigateTo({
        url: path,
      });
    },
    onClickCell(cell) {
      console.log(cell, "clickCell----------\r\n");
      if (cell?.cellsLayout?.jump_json?.page_auth_json) {
        // 执行自定义跳转
        this.jumpAction(cell?.cellsLayout?.jump_json, cell.data);
        return;
      }
      let pageNo = "";
      if (cell && cell.cellsLayout && cell.cellsLayout.jump_json) {
        pageNo = cell.cellsLayout?.jump_json?.dest_page_no;
        let path = "";
        if (cell.cellsLayout.jump_json?.tmpl_page_json.file_path) {
          path = `${cell.cellsLayout.jump_json?.tmpl_page_json.file_path}?page_no=${pageNo}`;
        } else {
          path = `/views/custom/index/index?page_no=${pageNo}`;
        }
        const colsMapJson =
          cell?.cellsLayout?.jump_json?.cols_map_json?.cols_map_detail_json ||
          [];
        if (colsMapJson?.length) {
          let data = {
            ...cell?.cellsLayout,
            ...(cell?.data || []),
          };
          colsMapJson.forEach((item) => {
            if (
              item.to_type === "URL" &&
              item.from_type === "当前数据" &&
              data[item.col_from]
            ) {
              path += `&${item.col_to}=${data[item.col_from]}`;
            } else if (
              item.to_type === "URL" &&
              item.from_type === "页面" &&
              this.componentParamsModels[item.col_from]
            ) {
              path += `&${item.col_to}=${
                this.componentParamsModels[item.col_from]
              }`;
            } else if (
              item.to_type === "URL" &&
              item.from_type !== "当前数据" &&
              item.col_from &&
              item.col_to
            ) {
              let val = this.renderStr(item.col_from, {
                data,
              });
              if (val) {
                path += `&${item.col_to}=${val}`;
              }
            }
          });
        }
        if (
          cell &&
          cell.hasOwnProperty("data") &&
          cell.data.hasOwnProperty("id")
        ) {
          // 如果有行数据默认携带 id
          if (path.indexOf("?") == -1) {
            path = `${path}?id=${cell.data.id}`;
          } else {
            path = `${path}&id=${cell.data.id}`;
          }
        }
        if (pageNo) {
          console.log(path);
          this.navToPath(path);
        }
      }
    },
    onClickBlock(cell) {
      console.log(cell, "clickBlock----------\r\n");
      let pageNo = "";
      if (cell && cell.cellsLayout && cell.cellsLayout.jump_json) {
        pageNo = cell.cellsLayout?.jump_json?.dest_page_no;
        let path = cell.cellsLayout.jump_json?.tmpl_page_json
          ? `${cell.cellsLayout.jump_json?.tmpl_page_json.file_path}?page_no=${pageNo}`
          : `/views/custom/index/index?page_no=${pageNo}`;

        if (
          cell &&
          cell.hasOwnProperty("data") &&
          cell.data.hasOwnProperty("id")
        ) {
          // 如果有行数据默认携带 id
          path = `${path}?id=${cell.data.id}`;
        }
        if (pageNo) {
          this.navToPath(path);
        }
      }
    },
    onDataUpdate() {
      this.refresh();
      console.log("clear-pageInstance:onDataUpdate");
      this.$store.commit("SET_PAGE_INSTANCE", null);
    },
    refresh() {
      this.getDatas();
    },
    async getDatas() {
      let req = this.srvReq;
      let datasfromType = this.datasfromType;
      if (datasfromType === "模拟数据") {
        let mock_srv_data_json = this.pageItem?.mock_srv_data_json || [];
        this.cellData = mock_srv_data_json.map((item) => item);
      } else if (req.serviceName) {
        const {condition,page,order,group} = req;
        const res = await this.select(
          req.serviceName,
          condition,
          page,
          order,
          group,
          null,
          req.mapp
        );
        if (res.data.state !== "FAILURE" && res.data.data.length > 0) {
          this.cellData = res.data.data;
        } else {
          console.log(res);
        }
      }
    },
  },
  created() {},
};
</script>

<style lang="scss">
.u-wrap {
  background-color: transparent !important;
}
</style>
