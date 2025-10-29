import { hotTableMetadata } from "@/components/model/Field";
import { createLinkUrlFunc } from "@/util/FieldUtil";
import { dispCol2ValCol } from "@/util/NameUtil";
import { GridInfo } from "@/components/model/GridInfo";
import {
  wrapButton,
  wrapHeader,
  getButtonPara,
} from "@/components/common/wrapper_util";
import { getUnitData } from "@/util/UnitUtil";
import * as DataUtil from "@/util/DataUtil";
import cloneDeep from "lodash/cloneDeep";
import isFunction from "lodash/isFunction";
import batchAddMixin from "@/components/mixin/batch-add-mixin";
import { onFetch } from "@/common/httpUtil";
import inlineEditListMixin from "@/components/mixin/inline-edit-list-mixin"; //行内编辑列表相关逻辑

export function MissRequiredConditionError(cond) {
  console.error("缺少条件：", cond);
}
let polling = null;
export default {
  mixins: [batchAddMixin, inlineEditListMixin],
  data() {
    return {
      tabsConfig: [
        {
          key: "norm",
          label: "正常",
          len: 0,
        },
        {
          key: "draft",
          label: "草稿",
          len: 0,
        },
      ],
      firstColumn: null,
      unfoldDataMap: {},
      treeNodeLoadingMap: {},
      _columnWidthCache: null, // 操作列宽度缓存
      initLoad: false,
      activeTabName: "norm",
      activeRowButton: null,
      rowButtonActiveServiceName: "",
      isDraft: false,
      visible: true,
      isMarker: true,
      service_name: this.service, //||this.$route.params.service_name,
      addService: null,
      importService: null,
      updateService: null,
      deleteService: null,
      card_no: this.card, //||this.$route.params.card_no,
      card_cfg: null,
      cardInstance: null,
      init_card_data: false,
      selectFormShow: false,
      defaultapi: "select",
      gridHeader: [],
      groupHeaders: [],
      noramlHeaders: [],
      header_view_model: "group",
      groupHeaderCols: {},
      selection: true,
      gridData: [],
      defGridData: [],
      gridButton: [],
      actionGridButton: null,
      rowButton: [],
      multipleSelection: [],
      condition: [],
      searchFormCondition: [],
      srv_cols: null,
      order: [],
      moneyCols: [],
      keyValueData: {},
      filterCondition: [],
      custCondition: [],
      gridPage: {
        pageSizes: [],
        pageSize:
          this.listType?.indexOf("list") !== -1 &&
            this.listType != "list" &&
            this.listType != "treelist" &&
            this.childForeignkey?.show_ui_model !== "tabs"
            ? 5
            : 10,
        currentPage: 1,
        total: 0,
      },
      moreConfig: null,
      activeForm: null,
      activeData: null,
      clickedRow: {},
      ifFlexTableHeader: false,
      inlineLists: [],
      uid: null,
      list_inner_add: false,
      scroll: 0,
      activeRow4PopupMemList: null,
      activePopupMemList: null,
      _encrypt_cols: [],
      approvalOptions: [
        {
          // 列表审批默认选项
          disp: "通过",
          value: "pass",
        },
      ],
      approvaList: [],
      orderColumn: "phone",
      srvAuthLogin: false,
      sumRowData: null,
      sumConfig: null,
      vpageNo: null,
      service_view_name: null,
      pub_field_map: null,
      originListData: null,
      listV2Data: null,
      isRefreshed: false,
      buttonInfo: null
    };
  },

  props: {
    name: {
      type: String,
      default: "main",
    },
    listMainFormDatas: {
      type: Object,
      default: function () {
        return null;
      },
    },
    service: {
      type: String,
    },
    card: {
      type: String,
    },
    pageSize: {
      type: Number,
      default: null,
    },
    searchForm: {
      type: Boolean,
      default: function () {
        return true;
      },
    },
    defDataPara: {
      type: Object,
      default: function () {
        return null;
      },
    },
    mainFormData: {
      type: Object,
      default: function () {
        return null;
      },
    },
    readOnly: {
      type: Boolean,
      default: function () {
        return false;
      },
    },

    listType: {
      type: String,
      default: function () {
        return "list";
      },
    },
    existsGridButton: {
      type: Boolean,
      default: function () {
        return true;
      },
    },
    existsRowButton: {
      type: Boolean,
      default: function () {
        return true;
      },
    },
    defaultCondition: {
      type: Array,
      default: function () {
        return [];
      },
    },
    defaultOrder: {
      type: Array,
      default: function () {
        return [];
      },
    },

    operate_params: {
      type: Object,
      default: function () {
        return null;
      },
    },
    hideButtons: {
      type: Boolean,
      default: false,
    },

    hidePagination: {
      type: Boolean,
      default: false,
    },

    mapcondition: {
      type: Object,
    },
    relationCondition: {
      type: Object,
    },
    childforeignkey: {
      type: Object,
    },
    childforeignvalue: {
      type: String,
    },
    mergeCol: {
      type: Boolean,
      default: true,
    },
    gridDataFilter: {
      type: Function,
      default: null,
    },
    tableHeight: {
      type: Number,
      default: null,
    },

    shouldLoadFromDb: {
      type: Boolean,
      default: true,
    },
    showPagination: {
      type: Boolean,
      default: true,
    },
    pageIsDraft: {
      type: String,
      default: "norm",
    },
  },

  watch: {
    gridHeader: {
      deep: true,
      handler(newVal, oldVal) {
        // console.log(
        //   "gridHeader changed",
        //   cloneDeep(newVal),
        //   cloneDeep(oldVal)
        // );
        // this.$nextTick(() => {
        //   if (
        //     newVal?.length &&
        //     JSON.stringify(newVal) != JSON.stringify(oldVal)
        //   ) {
        //     const tableColumns = this.$refs["bx-table-layout"]?.columns;
        //     let needRefresh = false;
        //     const filters = {};
        //     if (tableColumns?.length) {
        //       newVal.forEach((head) => {
        //         if (
        //           (head._default_value || head._default_value === "") &&
        //           Array.isArray(head.filters)
        //         ) {
        //           if (head._default_value === "") {
        //             this.$refs["bx-table-layout"]?.clearFilter?.([head.column]);
        //           }
        //           const index = tableColumns.findIndex(
        //             (col) => head.column && col.columnKey === head.column
        //           );
        //           if (index > -1) {
        //             needRefresh = true;
        //             if (head._default_value === "") {
        //               this.$refs["bx-table-layout"].columns[
        //                 index
        //               ].filteredValue = null;
        //             } else {
        //               this.$refs["bx-table-layout"].columns[
        //                 index
        //               ].filteredValue = head._default_value.split(",");
        //               filters[head.column] = head._default_value.split(",");
        //             }
        //           }
        //         }
        //       });
        //     }
        //     this.filterCondition = [];
        //     if (needRefresh) {
        //       for (var key in filters) {
        //         var cMap = {};
        //         if (filters[key].length > 0 && filters[key].toString()) {
        //           cMap["colName"] = key;
        //           cMap["value"] = filters[key].toString();
        //           cMap["ruleType"] = "in";
        //           this.filterCondition.push(cMap);
        //         }
        //       }
        //       this.gridPage.currentPage = 1;
        //     }
        //     // this.loadTableData();
        //   }
        //   // this.loadTableData();
        // });
      },
    },
    "$store.state.frontTableData": {
      deep: true,
      handler(newVal) {
        console.log("$store.state.frontTableData", newVal);
        const service = newVal.tables.service;
        if (this.service === service) {
          const from = newVal.tables.params.from;
          const to = newVal.tables.params.to;
          const data = newVal.tables.data;
          const cols = newVal.tables.params.cols;
          let addCols = [];
          if (Array.isArray(this.addSrvCols) && this.addSrvCols.length > 0) {
            addCols = this.addSrvCols
              .filter((item) => item.in_add !== 0 || item.in_update !== 0)
              .map((item) => item.columns);
          }
          if (data.length == 0) {
            this.gridData = [];
            return;
          }
          if (this.gridData.length == 0) {
            data.forEach((item) => {
              let obj = {};
              for (const index in addCols) {
                const key = addCols[index];
                if (item[key] !== undefined) {
                  obj[key] = item[key];
                } else {
                  obj[key] = null;
                }
              }
              obj["_guid"] = this.guid(); // 数据增加 唯一id
              obj["_dirtyFlags"] = "add";

              obj[to] = item[from];
              console.log("add", obj);
              this.gridData.push(obj);
            });
            return;
          }
          // 从当前list中删除内存中没有的数据
          this.gridData = this.gridData.filter(
            (x) => data.findIndex((y) => y[from] === x[to]) !== -1
          );
          // 内存中有list的数据，重新赋值；没有的为新增数据，添加到list中
          data.forEach((item) => {
            let sameVal = false;

            this.gridData.forEach((grid) => {
              if (item[from] === grid[to]) {
                cols.forEach((col) => {
                  grid[col] = item[col];
                  sameVal = true;
                });
              }
            });

            if (!sameVal) {
              let obj = {};
              for (const index in addCols) {
                const key = addCols[index];
                if (item[key] !== undefined) {
                  obj[key] = item[key];
                } else {
                  obj[key] = null;
                }
              }
              obj[to] = item[from];

              if (!obj["id"] && !obj["_dirtyFlags"]) {
                obj["_guid"] = this.guid(); // 数据增加 唯一id
                obj["_dirtyFlags"] = "add";
              }
              // item[to] = item[from]
              this.gridData.push(obj);
            }
          });
        }
      },
    },
    "$store.getters.tableButtonsPopup": {
      deep: true,
      handler(newVal, oldVal) {
        console.log("$store.state.tableButtonsPopup ::::::", newVal, oldVal);
        // let activeModel = null
        // if(newVal && newVal[this.service] == this.serviceName  && !activeModel){
        //   activeModel = newVal[this.service]
        //   console.log('$store.state.tableButtonsPopup',activeModel)
        // }
      },
    },
    // 监听按钮变化，清除宽度缓存
    sortedRowButtons: {
      handler() {
        // 清除缓存，触发重新计算
        this._columnWidthCache = null;
      },
      deep: true
    },
    // 监听数据变化，清除宽度缓存
    gridData: {
      handler() {
        // 数据变化可能影响按钮可见性，清除缓存
        this._columnWidthCache = null;
      },
      deep: true
    }
  },

  computed: {
    detailBtn() {
      return this.sortedRowButtons?.find(
        (item) => ['procdetail', 'detail'].includes(item.button_type)
      );
    },
    excelBtn() {
      if (this.customListType == 'popup') {
        // 列表在弹窗中不显示excel按钮
        return false
      }
      const attr = JSON.parse(
        sessionStorage.getItem("pages_attribute") || "{}"
      );
      let show = false;
      let operate_mode = "跳转";
      if (
        this.service_name?.indexOf("srvsys_") === 0 ||
        this.service_name?.indexOf("srvpage_cfg") === 0
      ) {
        if (attr?.list_excel_sys === "是") {
          show = true;
        }
        if (attr?.list_excel_sys === "新TAB") {
          show = true;
          operate_mode = "新TAB";
        }
      } else if (attr?.list_excel_biz === "是") {
        show = true;
      } else if (attr?.list_excel_biz === "新TAB") {
        show = true;
        operate_mode = "新TAB";
      }

      // tbl_options中有“EXCEl模式”则显示excel按钮
      if (this.listV2Data?.tbl_options?.includes('EXCEl模式')) {
        show = true;
      }

      if (show) {
        // let url = `/dataview/#/sheet/${this.service_name}?srvApp=${this.resolveDefaultSrvApp()}&listType=${this.listType}`;
        // if (this.defaultCondition?.length) {
        //   this.defaultCondition.forEach((col) => {
        //     if (col.ruleType === "eq") {
        //       url += `&${col.colName}=${col.value}`;
        //     }
        //   });
        //   // url += `&topTreeData=true`;
        // }
        // if (this.listV2Data?.is_tree === true) {
        //   url += `&topTreeData=true`;
        // }
        let url = this.excelUrl;
        let tabTitle = "";
        if (
          this.childForeignkey?.kedispcol &&
          this.listMainFormDatas[this.childForeignkey?.kedispcol]
        ) {
          tabTitle = `${this.listMainFormDatas[this.childForeignkey?.kedispcol]
            }`;
        }
        if (this.childForeignkey?.section_name) {
          tabTitle += `/${this.childForeignkey?.section_name}【excel】`;
        } else if (tabTitle && this.service_view_name) {
          tabTitle += `/${this.service_view_name}【excel】`;
        }
        if (!tabTitle && this.service_view_name) {
          tabTitle = `${this.service_view_name}【excel】`;
        }
        return {
          page_type: "列表",
          button_type: "customize",
          operate_mode: "跳转",
          // "operate_mode": "新TAB",
          client_type: "PC,APP,小程序,h5",
          pre_data_handle: `function (rowDatas,mainDetailData){\n    return '${url}'\n}`,
          id: 191,
          page_area: "表格按钮",
          operate_type: "URL跳转",
          // "operate_type": "URL跳转",
          visible: "是",
          button_name: "excel",
          tabTitle: tabTitle,
          tabIcon: "&#xe60a;",
          application: this.resolveDefaultSrvApp(),
          service: this.service_name,
          is_public: false,
          path_col: "是",
        };
      }
    },
    // 专门用于拼接Excel页面URL的计算属性
    excelUrl() {
      // 基础URL构建
      // let url = `/dataview/#/sheet/${this.service_name}?colSrv=${this.updateService}&srvApp=${this.resolveDefaultSrvApp()}&listType=${this.listType}`;
      let url = `/dataview/#/sheet/${this.service_name}?colSrv=${this.service_name}&srvApp=${this.resolveDefaultSrvApp()}&listType=${this.listType}`;
      
      // 添加默认条件参数
      if (this.defaultCondition?.length) {
        this.defaultCondition.forEach((col) => {
          if (col.ruleType === "eq") {
            url += `&${col.colName}=${col.value}`;
          }
        });
      }
      
      // 如果是树形结构，添加topTreeData参数
      if (this.listV2Data?.is_tree === true) {
        url += `&topTreeData=true`;
      }
      
      return url;
    },
    tableButtonsPopupRun() {
      let val = this.$store.getters.getTableButtonsPopup;
      let obj = null;
      console.log("按钮状态更新了：", val);
      if (val && val.hasOwnProperty(this.service)) {
        obj = val[this.service];
      }

      return obj; //需要监听的数据
    },
    listCellsTextDispWarp() {
      let config = false;
      if (
        this.cfgJson &&
        this.cfgJson.hasOwnProperty("list_style_json") &&
        this.cfgJson.list_style_json &&
        this.cfgJson.list_style_json.hasOwnProperty("list_cells_text_disp")
      ) {
        config =
          this.cfgJson.list_style_json.list_cells_text_disp == "自动换行";
      }

      return config;
    },

    groupByLayoutRun: function () {
      let req =
        this.moreConfig && this.moreConfig.hasOwnProperty("groupByLayout")
          ? this.moreConfig.groupByLayout
          : false;
      let groupConfig = req.group || [];

      let reqData = this.groupByLayoutData;
      for (let cfg of groupConfig) {
        for (let val in reqData) {
          if (val == cfg.aliasName || val == cfg.colName) {
            cfg["value"] = reqData[val];
          }
        }
      }
      return groupConfig;
    },
    draftRun: function () {
      if (
        this.activeTabName === "draft" ||
        ((this.listType === "updatechildlist" ||
          this.listType === "addchildlist" ||
          this.listType === "detaillist") &&
          this.pageIsDraft === "draft")
      ) {
        return true;
      } else {
        return false;
      }
    },
    gridDataRun: function () {
      // 重新构造 gridData 为了过滤内存表删除操作
      let self = this;
      let data = self.gridData;
      let colType = "string";
      let orderType = self.orderColumn;
      let columnName = null;
      if (self.orderColumn.indexOf(" ") !== -1) {
        orderType = self.orderColumn.split(" ");
        columnName = orderType[0];
        orderType = orderType[1]; // 排序类型默认为升序，未实现
      } else {
        columnName = self.orderColumn;
      }
      if (data) {
        data = data.filter((item) => {
          if (
            item.hasOwnProperty("_dirtyFlags") &&
            item._dirtyFlags !== "delete"
          ) {
            return item;
          } else if (!item.hasOwnProperty("_dirtyFlags")) {
            return item;
          }
        });

        if (columnName && this.storageType == "mem") {
          // 如果是内存表时 使用根据返回 排序字段 使用前端排序
          let colData = self.gridHeader;
          colData = colData.filter((item) => item.column === columnName);
          if (colData.length > 0) {
            colType = colData[0].col_type;

            if (
              colType == "int" ||
              colType == "Integer" ||
              colType == "Money"
            ) {
              data.sort(function (a, b) {
                return a[columnName] - b[columnName];
              });
            } else {
              data.sort();
            }

            // else if(colType == 'string' || colType == 'String'){
            // data.sort(function(a, b){
            //   var x = null
            //   var y = null
            //   if(isNaN(a[columnName]) ){
            //     x = a[columnName].toLowerCase()
            //   }else{
            //     x = a[columnName]
            //   }
            //   if(isNaN(b[columnName]) ){
            //     y = b[columnName].toLowerCase();
            //   }else{
            //     y = b[columnName]
            //   }
            //   // var x = a[self.orderColumn].toLowerCase() || 1;
            //   // var y = b[self.orderColumn].toLowerCase() || 2;
            //   if (x < y) {return -1;}
            //   if (x > y) {return 1;}
            //   return 0;
            // });
            // }else{
            //   data.sort()
            // }
          }
        }
        if (this.sumRowData) {
          data.push(this.sumRowData);
        }
        return data;
      } else {
        return [];
      }
    },
    sortedGridButtons() {
      let sorted = this.gridButton.slice();
      sorted.sort((a, b) => a.seq - b.seq);

      //处理草稿界面按钮
      if (this.draftRun) {
        sorted = sorted.filter(
          (item) =>
            item.button_type === "batch_delete" ||
            item.button_type === "add" ||
            item.button_type === "refresh" ||
            item.button_type === "select"
        );
      }
      return sorted;
    },
    sortedRowButtons() {
      let sorted = this.rowButton.slice();
      // if (Array.isArray(this.gridData) && this.gridData.length > 0) {
      //   this.gridData.forEach((item, index) => {
      //     if (item?._buttons?.length === sorted.length) {
      //       sorted = sorted.map((btn, bIndex) => {
      //         if (btn["_rowDisp"]) {
      //           btn["_rowDisp"][index] = item._buttons[bIndex];
      //         } else {
      //           btn["_rowDisp"] = { [index]: item._buttons[bIndex] };
      //         }
      //         return btn;
      //       });
      //     }
      //   });
      // }
      sorted = sorted.map((item, index) => {
        item._btn_index = index;
        return item
      })
      sorted.sort((a, b) => a.seq - b.seq);

      if (Array.isArray(this.gridData) && this.gridData.length > 0) {
        // 至少某一行要能显示出来 才返回这个按钮
        sorted = sorted.filter((btn) =>
          this.gridData.some((item, index) =>
            this.getDispExps(btn, item, index)
          )
        );
      }

      sorted = getButtonPara(sorted); // 封装按钮分组数据
      //处理草稿界面按钮
      if (this.draftRun) {
        let buts = [];
        sorted.forEach((item) => {
          if (item.button_type !== "_btn_group") {
            buts.push(item);
          } else if (item.buttons.length > 0) {
            buts.push.apply(buts, item.buttons);
          }
        });
        sorted = buts.filter((item) => {
          if (
            item.button_type === "delete" ||
            item.button_type === "detail" ||
            item.button_type === "edit"
          ) {
            let i = (sorted = this.bxDeepClone(item));
            i.permission = true;
            return i;
          }
        });
      }
      sorted = sorted.map((item) => {
        if (item.button_type === "_btn_group" && item.buttons?.length === 1) {
          // 操作按钮中只有一个按钮 直接展示 不收纳在操作按钮中
          item = item.buttons[0];
        }
        return item;
      });
      return sorted;
    },

    columnHeaders() {
      return this.gridHeader.filter((item) => item.col_type !== "InlineList");
    },


    maxTableHeight() {
      let ratio = 0.8;
      let h = Math.max(
        document.documentElement.clientHeight,
        window.innerHeight || 0
      );
      h = h <= 1 ? 800 : h;
      console.info("max table height: " + h);
      return this.tableHeight || h * ratio;
    },
    // showPagination(){
    // let self = this
    // let isShow = self.showPagination
    // let type = self.listType
    // if(type === '')
    // }
  },
  beforeDestroy() {
    console.log("列表销毁");
    clearInterval(polling);
  },
  methods: {
    isDetailLink(column = "", data = {}, rowIndex) {
      if (
        column !== "id" &&
        this.detailBtn &&
        this.listV2Data?.key_disp_col &&
        column === this.listV2Data.key_disp_col
      ) {
        return (
          this.getDispExps(this.detailBtn, data, rowIndex) &&
          this.isRowButtonVisible(this.detailBtn, data, rowIndex)
        );
      }
    },
    toDetail(column = "", data = {}, rowIndex) {
      if (this.isDetailLink(column, data, rowIndex)) {
        this.rowButtonClick(this.detailBtn, data);
        // let address = `/vpages/#/detail/${this.serviceName}/${this.row.id}?srvApp=${this.app}`;
        // let tab_title = this.detailButton.service_view_name;
        // let disp_col = this.detailButton._disp_col;
        // let disp_value = this.row[disp_col]; //详情页面上的标签
        // tab_title = tab_title.replace("查询", "");
        // if (disp_value != null && disp_value != undefined && disp_value != "") {
        //   tab_title = disp_value + "(" + tab_title + "详情)";
        // } else {
        //   tab_title = tab_title + "详情";
        // }
        // let page = {
        //   title: tab_title,
        //   url: address,
        //   icon: "",
        //   app: this.app,
        // };
        // if (window.top.tab) {
        //   window.top.tab.addTab(page);
        // } else {
        //   // 没有tab实例，在浏览器中打开新标签页
        //   const page = window.open(address);
        //   setTimeout(() => {
        //     page.document.title = tab_title;
        //   }, 500);
        // }
      }
    },
    setPolling() {
      let self = this;
      let time = 0;
      if (this.cfgJson && this.cfgJson.list_refresh_cfg) {
        let config = this.cfgJson.list_refresh_cfg;
        if (config.type.indexOf("data") !== -1) {
          time = config.cycle;
          console.log("我是定时执行"); //我是定时执行
          polling = setInterval(function () {
            // Loading.service({ fullscreen: true });
            // self.$message({
            //   message: '数据更新成功.',
            //   type: 'success'
            // });
            self.refresh();
          }, time * 1000);
        }
      }
    },
    cellStyle() {
      let style = {};
      if (this.listCellsTextDispWarp) {
        //  style = {
        //   'overflow': 'auto',
        //   'text-overflow': 'ellipsis',
        //   '-webkit-line-clamp': 'initial',
        //     'line-clamp': 'initial'
        //  }
      }
      return style;
    },
    arraySpanMethod({ row, column, rowIndex, columnIndex }) {
      if (row.hasOwnProperty("_data_type") && row["_data_type"] == "sumRow") {
        let colspan = this.sumConfig.sum_text_col_span;
        // 尾行合计 配置 需要跨列，进行动态处理。
        if (
          column.hasOwnProperty("property") &&
          this.sumConfig &&
          column.property == this.sumConfig.sum_text_col &&
          row[column.property] == this.sumConfig.sum_text &&
          !isNaN(Number(this.sumConfig.sum_text_col_span))
        ) {
          return {
            rowspan: 1,
            colspan: colspan,
          };
        } else if (columnIndex < colspan) {
          return {
            rowspan: 0,
            colspan: 0,
          };
        }
      } else {
        let rowspan = 1;
        let colspan = 1;
        let rowSpanCols = [];
        let colName = column.property;
        if (colName && this.cfgJson?.list_style_json?.list_auto_row_span_cols) {
          rowSpanCols = this.cfgJson.list_style_json.list_auto_row_span_cols.split(",");
        }
        let iValue = this.gridDataRun?.[rowIndex]?.[colName]; // 值
        if (iValue) {
          iValue += ""
        }
        if (rowSpanCols && rowSpanCols.indexOf(colName) !== -1) {
          let lastValue = "";
          let firstValue = "";
          if (rowIndex !== 0 && rowIndex < this.gridDataRun.length - 1) {
            firstValue = this.gridDataRun[rowIndex - 1][colName] + ""; // 前一行
            lastValue = this.gridDataRun[rowIndex + 1][colName] + ""; // 前一行
          } else if (rowIndex == 0) {
            // 当前是第一行数据
            firstValue = undefined; // 前一行
            lastValue = this.gridDataRun[rowIndex + 1][colName] + ""; // 前一行
          } else if (rowIndex == this.gridDataRun.length - 1) {
            // 当前是最后一行
            firstValue = this.gridDataRun[rowIndex - 1][colName] + ""; // 前一行
            lastValue = undefined; // 前一行
          }
          if (iValue && firstValue !== iValue) {
            let allRows = 1;
            let isNext = true;
            for (let i in this.gridDataRun) {
              if (
                Number(i) > rowIndex &&
                isNext &&
                this.gridDataRun[i][colName] + "" == iValue + ""
              ) {
                // console.log('rowIndex',colName,iValue,this.gridDataRun[i][colName]+'',allRows)
                allRows = allRows + 1;
              } else if (Number(i) > rowIndex) {
                isNext = false;
              }

              // console.log(i,rowIndex,Number(i) > rowIndex,allRows,(iValue+''),(this.gridDataRun[i][colName] +'') == (iValue+''))
            }
            rowspan = allRows;
            colspan = 1;
          } else if (iValue && firstValue == iValue) {
            rowspan = 0;
            colspan = 0;
          }
          console.log('span Method:', rowIndex, colName, iValue, '跨行：', rowspan)
          return {
            rowspan: rowspan,
            colspan: colspan,
          };
        }
      }
    },
    getColumnsShow(row) {
      if (row.hasOwnProperty("_data_type") && row["_data_type"] == "sumRow") {
        // console.log(row,false)
        return false;
      } else {
        // console.log(row,true)
        return true;
      }
    },
    getButtonOptSrv(btn, row, type) {
      let self = this;
      let serviceName = "";
      let serviceViewName = "";
      let permission = false;
      let operateList = [];
      let isBtnOptShow = false;
      let isBtnExpShow = false;
      let data = row;
      let mainData = self.listMainFormDatas;
      if (
        btn.permission &&
        btn.operate_service &&
        Object.prototype.toString.call(btn.operate_service) !==
        "[object String]"
      ) {
        for (let key in btn.operate_service) {
          let config = btn.operate_service[key];
          //  let funBody = `let data=e;let mainData=b;return ${config.disp_exps}`
          let args = ["e", "b"];
          //  let testFun = new Function(...args, funBody)
          //  let mainData = listMainFormDatas || {}
          //  let isValid = testFun(row,mainData)
          let isValid = eval(config.disp_exps);

          if (config.permission) {
            operateList.push({
              serviceName: key,
              serviceViewName: config.service_view_name,
              permission: config.permission,
              isValid: isValid,
            });
          }
        }
      }
      let dispExps = btn.disp_exps;
      if (btn.permission && dispExps) {
        // let funBody = `let data = e;let mainData=b ;return ${dispExps}`
        // console.log('funBody',funBody)
        let args = ["e", "b"];
        // let testFun = new Function(...args, funBody)
        // let mainData = listMainFormDatas || {}
        // isBtnExpShow = testFun(row,mainData)
        isBtnExpShow = eval(dispExps);
      } else {
        isBtnExpShow = btn.permission;
      }
      if (type && type == "isShow" && isBtnExpShow) {
        let optionsList = operateList.filter((item) => item.isValid);
        if (btn.permission) {
          if (!btn.operate_service) {
            isBtnOptShow = true;
          } else if (typeof btn.operate_service === 'string' && btn.operate_service) {
            isBtnOptShow = true;
          } else if (Array.isArray(optionsList) && optionsList.length) {
            isBtnOptShow = true;
          }
        } else {
          isBtnOptShow = false;
        }
        // if (
        //   btn.permission && (optionsList.length !== 0 || (btn.operate_service && typeof btn.operate_service === 'string') || !btn.operate_service)
        // ) {
        //   isBtnOptShow = true;
        // } else {
        //   isBtnOptShow = false;
        // }
        // console.log('getButtonOptSrv isshow',btn.button_name ,isBtnExpShow && isBtnOptShow,isBtnExpShow,isBtnOptShow)
        return isBtnExpShow && isBtnOptShow;
      } else if (type && type == "active") {
        let opIsShow = operateList.filter((item) => item.isValid);
        return opIsShow;
      } else {
        let opIsShow = operateList.filter((item) => item.isValid);
        return opIsShow;
      }

      //"[object String]"
    },
    // showPagination(e){
    //    let listType = this.listType
    //    let isShow = e
    //    if((listType === 'addchildlist' || listType === 'updatechildlist' || listType === 'detaillist')){
    //       return e? e : false
    //    }
    // },
    onTabshandleClick(e) {
      console.log("handle Click", e);
      this.loadTableData();
    },
    actionSuccess() {
      this.refresh();
      this.activeForm = "xx";
    },
    filterHandler(value, row, column) {
      // console.log("filterHandler",value, row, column)
      return true;
    },
    setVisible(value) {
      this.visible = value;
    },

    evalVisible() {
      return this.evalVersatileFlagVar(this.visible);
    },

    getButtonName(button, row) {
      return (
        (button.button_name_expr &&
          this.evalBxExpr(button.button_name_expr, row, this)) ||
        button.button_name
      );
    },
    getRows() {
      return this.gridData;
    },

    getSelectedRows() {
      return this.multipleSelection;
    },

    formModelDecorator(formModel) {
      this.$set(formModel, "_gridData", this.gridData);
    },

    filterChange(filters) {
      let _filters = this.$refs?.["bx-table-layout"]?.columns
        ?.filter((item) => item.filteredValue?.length)
        .reduce((res, cur) => {
          res[cur.columnKey] = cur.filteredValue;
          return res;
        }, {});

      this.filterCondition = [];
      const headersMap = this.gridHeader.reduce((res, cur) => {
        res[cur.column] = cloneDeep(cur);
        return res;
      }, {});
      for (var key in _filters) {
        if (filters[key]?.length > 0) {
          _filters[key] = filters[key];
        }
        var cMap = {};
        if (_filters[key].length > 0) {
          cMap["colName"] = key;
          cMap["value"] = _filters[key].toString();
          cMap["ruleType"] = "in";
          if (headersMap[key]?.col_type === "Set") {
            cMap["ruleType"] = "inset";
          }
          this.filterCondition.push(cMap);
        }
      }
      this.gridPage.currentPage = 1;

      this.buildGridHeaders(this.srv_cols, null, this.filterCondition);
      this.loadTableData();
    },
    cardLoadinit(card) {
      this.cardInstance = card;
    },

    getshowAlign(item) {
      if (item.col_type == "Money") {
        return "right";
      } else {
        return "left";
      }
    },

    formatValue(row, header) {
      let key_col = header.column;
      let value = row.hasOwnProperty(key_col) ? row[key_col] : null;
      // 西高子表显示 数据没有的列 数字显示无效值问题。
      // let value = row[key_col] ;
      // console.log("formatValue",row, key_col)
      let self = this;
      let ops = "";
      if (this.header_view_model == "group" && this.groupHeaderCols[key_col]) {
        var str = "";
        var gheaders = this.groupHeaderCols[key_col];
        if (gheaders.length == 1) {
          str = value;
          let resultValue = "";
          if (
            header.col_type == "Dict" &&
            self.keyValueData[header.column] &&
            value !== null &&
            value !== ""
          ) {
            let keyValueData = self.keyValueData[header.column];
            if (keyValueData && Array.isArray(keyValueData)) {
              for (let i = 0; i < keyValueData.length; i++) {
                if (keyValueData[i].value == value) {
                  resultValue = keyValueData[i].text;
                } else {
                  // resultValue = keyValueData[i].value
                }
              }
            }
          }
          if (
            header.srvcol.col_type &&
            header.srvcol.col_type.toLowerCase() === "datetime" &&
            header.format &&
            value !== "" &&
            value !== null
          ) {
            // 根据日期的格式配置 格式化日期值
            resultValue = DataUtil.formatDate(
              value,
              header.srvcol.col_type.toLowerCase(),
              header.format
            );
          } else if (
            header.srvcol.col_type &&
            header.srvcol.col_type.toLowerCase() === "date" &&
            value !== "" &&
            value !== null
          ) {
            resultValue = DataUtil.formatDate(
              value,
              header.srvcol.col_type.toLowerCase(),
              header.format || ""
            );
          } else if (
            header.srvcol.col_type &&
            header.srvcol.col_type.toLowerCase() === "month" &&
            header.format &&
            value !== "" &&
            value !== null
          ) {
            resultValue = DataUtil.formatDate(
              value,
              header.srvcol.col_type.toLowerCase(),
              header.format
            );
          } else if (
            header.col_type == "Money" &&
            value !== null &&
            value !== "null" &&
            value !== "******"
          ) {
            // 格式化 Money
            resultValue = DataUtil.formatMoney(value + "");
          }

          if (resultValue) {
            str = resultValue;
          } else {
            str = this.singleFormatValue(value, header, null, row);
          }
        } else {
          for (var gHeader of gheaders) {
            if (gHeader["in_list"] === 1) {
              var gcol = gHeader["columns"];
              let gvalue = row[gcol];
              var label = gHeader["label"];

              gvalue = this.singleFormatValue(gvalue, gHeader, key_col);
              if (str == "") {
                str = label + ": " + gvalue;
              } else {
                str = str + "\n" + label + ": " + gvalue;
              }
            }
          }
        }
        // return str;

        ops = str;
      } else {
        let resultValue = "";
        if (
          header.col_type == "Dict" &&
          self.keyValueData[header.column] &&
          value !== null &&
          value !== ""
        ) {
          let keyValueData = self.keyValueData[header.column];
          if (keyValueData && Array.isArray(keyValueData)) {
            for (let i = 0; i < keyValueData.length; i++) {
              if (keyValueData[i].value == value) {
                resultValue = keyValueData[i].text;
                // console.log("格式化值1:" +header.column ,value,keyValueData[i].text,value==keyValueData[i].value)
              } else {
                // resultValue = keyValueData[i].value
                // console.log("格式化值2:" +header.column ,value,keyValueData[i].text,value==keyValueData[i].value)
              }
            }
          }
          // console.log("格式化值:" +header.column ,resultValue,value,Array.isArray(keyValueData),keyValueData,self.keyValueData,header.column)
        }

        if (
          header.srvcol.col_type &&
          header.srvcol.col_type.toLowerCase() === "datetime" &&
          header.format &&
          value !== "" &&
          value !== null
        ) {
          // 根据日期的格式配置 格式化日期值
          resultValue = DataUtil.formatDate(
            value,
            header.srvcol.col_type.toLowerCase(),
            header.format
          );
        } else if (
          header.srvcol.col_type &&
          header.srvcol.col_type.toLowerCase() === "date" &&
          value !== "" &&
          value !== null
        ) {
          resultValue = DataUtil.formatDate(
            value,
            header.srvcol.col_type.toLowerCase(),
            header.format || ""
          );
        } else if (
          header.srvcol.col_type &&
          header.srvcol.col_type.toLowerCase() === "month" &&
          header.format &&
          value !== "" &&
          value !== null
        ) {
          resultValue = DataUtil.formatDate(
            value,
            header.srvcol.col_type.toLowerCase(),
            header.format
          );
        } else if (
          header.col_type == "Money" &&
          value !== null &&
          value !== "null" &&
          value !== "******"
        ) {
          // 格式化 Money
          resultValue = DataUtil.formatMoney(value + "");
        }

        if (resultValue) {
          // return resultValue
          ops = resultValue;
        } else {
          // return this.singleFormatValue(value, header, null, row);
          ops = this.singleFormatValue(value, header, null, row);
        }
      }
      let moreTempl =
        header.srvcol && header.srvcol.more_config
          ? header.srvcol.more_config
          : "{}";
      let moreSte = moreTempl ? JSON.parse(moreTempl) : null;
      if (moreSte && moreSte.hasOwnProperty("format_display")) {
        moreTempl = moreSte.format_display;
        ops = self.templateToString(row, moreTempl);
      }

      // let more
      // if(header)
      // if(key_col == 'waybill_amount_to_pay'){
      //   console.log('--',key_col,row[key_col],ops,str)
      // }else{
      //   console.log(key_col,row[key_col],ops,str)
      // }
      if (typeof ops === 'string' && ops.indexOf('$bxFileAddress$') != -1) {
        ops = self.recoverFileAddress(ops)
      }
      return ops;
    },
    recoverFileAddress(val = "") {
      // 替换文件前缀
      const prefix = this.serviceApi().downloadFilePrefix;
      val = val?.replaceAll?.("$bxFileAddress$", prefix) || "";
      // 使用正则表达式来匹配 bx_auth_ticket 的值，并使用sessionStorage.bx_auth_ticket替换它
      const ticketStr = `bx_auth_ticket=${sessionStorage.bx_auth_ticket}`;
      val = val.replace(/(bx_auth_ticket=)[^&]+/ig, ticketStr);
      return val;
    },
    singleFormatValue(value, header, key_col, row) {
      // 从方法中那个取到值  res后面可以根据复杂程度改为对象
      value = getUnitData(value, header);
      const bxColType = header.srvcol?.bx_col_type;
      let userDeptTypes = ["User", "Dept", "bxsys_user", "bxsys_dept"];
      if (this.moneyCols.indexOf(key_col) != -1) {
        return this.formartMoney(value + "");
      } else {
        let type = header.col_type;
        if (type === "UserList" && value) {
          let items = null;
          try {
            items = JSON.parse(value);
          } catch (error) {
            items = [items];
            console.log(error);
          }
          if (items && items.length) {
            return items.map((item) => item.disp).join(",");
          }
        } else if (type === "Boolean") {
          return !!value ? "是" : "否";
        } else if (['fk', 'Dict'].includes(type) || ['fk', 'Dict'].includes(bxColType)) {
          // 增加 支持 fk时 显示 _xx_disp 字段
          let dispColName = `_${header.column}_disp`;
          return !!row[dispColName] ? row[dispColName] : value;
        } else if (userDeptTypes.includes(type)) {
          // 尝试从row 寻找 _disp
          let dispColName = `_${header.column}_disp`;
          if (row.hasOwnProperty(dispColName)) {
            return row[dispColName];
          }
        } else if (hotTableMetadata[type] && this.$store) {
          // 尝试从hottable 寻找 _disp
          // 废弃
          let table = hotTableMetadata[type].table;
          let valueCol = hotTableMetadata[type].valueCol;
          let dispCol = hotTableMetadata[type].dispCol;
          let tableData = this.$store.getters.getTableData(table);
          if (tableData && tableData.length > 0) {
            let target = tableData.filter((item) => item[valueCol] === value);
            return target && target.length && target[0][dispCol];
          } else {
            return value;
          }
        }
        return value;
      }
    },
    getDispExps(item, data, rowIndex) {
      var result = true;
      let mainData = null;
      if (this.listMainFormDatas) {
        mainData = this.listMainFormDatas;
      }

      //催办按钮只在 我的申请页面显示
      if (this.listType != "mine" && item.button_type == "urge") {
        return false;
      }

      try {
        var disp_exps = item.disp_exps;
        if (disp_exps != undefined && disp_exps != "" && disp_exps != null) {
          result = eval(disp_exps);
        }
      } catch (err) { }

      // 使用后端返回的参数控制按钮显示隐藏
      if (typeof item?._btn_index === 'number' && Array.isArray(data?._buttons)) {
        if (data._buttons[item._btn_index] === 1) {
          result = true
        } else {
          result = false
        }
      }
      // if (
      //   item._rowDisp &&
      //   typeof rowIndex === "number" &&
      //   [0, 1].includes(item._rowDisp[rowIndex])
      // ) {
      //   result = item._rowDisp[rowIndex];
      // }

      if (
        item.button_type === "batchupdate" &&
        this.showBatchEditButton !== true
      ) {
        result = false;
      }
      return result;
    },
    getButtonDispExps(btns, data, index) {
      var result = true;
      let mainData = null;
      if (this.listMainFormDatas) {
        mainData = this.listMainFormDatas;
      }
      let isShow = [];
      if (btns.length > 0) {
        for (let item of btns) {
          if (typeof item._btn_index === 'number' && Array.isArray(data._buttons)) {
            if (data._buttons[item._btn_index] === 1) {
              isShow.push(item);
            }
          } else if (item["_rowDisp"]) {
            if (item["_rowDisp"][index] === 1) {
              isShow.push(item);
            }
          } else {
            try {
              var disp_exps = item.disp_exps;
              if (
                disp_exps != undefined &&
                disp_exps != "" &&
                disp_exps != null
              ) {
                result = eval(disp_exps);
                if (result !== false) {
                  isShow.push(item);
                }
              } else if (item.permission) {
                isShow.push(item);
              }
            } catch (err) { }
          }
        }

        if (isShow.length !== 0) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    },
    getGridHeaderDispExps(item, listMainFormDatas) {
      // 获取表格列显示
      let result = item.show;
      var disp_exps = item.showListExp;
      if (result && item.hasOwnProperty("showListExp")) {
        let mainFormData = listMainFormDatas;
        // result = eval(disp_exps);
        result = eval("(" + disp_exps + ")(mainFormData)");
      }
      return result;
    },
    handleSortChange(column) {
      this.order = [];

      if (column["column"] != null) {
        if ("ascending" == column["order"]) {
          this.order.push({ colName: column["prop"], orderType: "asc" });
        } else {
          this.order.push({ colName: column["prop"], orderType: "desc" });
        }
      }

      this.loadTableData();
    },

    deleteRowData(rowData, exeservice) {
      var dataArray = [rowData];
      this.deleteData(dataArray, exeservice);
    },

    batchDeleteData(exeservice) {
      if (this.multipleSelection.length == 0) {
        this.$alert("请选择删除数据", "提示", {
          confirmButtonText: "确定",
        });
      } else {
        this.deleteData(this.multipleSelection, exeservice);
      }
    },

    deleteDataAndSave(deleteRowData, exeservice) {
      this.$confirm("此操作将永久删除该数据, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "info",
      })
        .then(() => {
          var deleteRequests = [];
          var request = {};
          request["serviceName"] = exeservice;
          if (this.activeTabName === "draft") {
            request["reqType"] = "deleteDraft";
          }
          var cMap = { colName: "id", ruleType: "in" };
          if (this.pub_field_map?.id) {
            // 删除时 如果列表配置了id的映射字段 则使用映射的字段作为colName
            cMap.colName = this.pub_field_map.id;
          }
          var cVule = [];
          for (var item of deleteRowData) {
            cVule.push(item[cMap.colName]);
          }
          cMap["value"] = cVule.toString();
          request["condition"] = [cMap];

          deleteRequests.push(request);

          this.operate(deleteRequests).then((response) => {
            var state = response.body.state;

            if ("SUCCESS" == state) {
              this.$message({
                type: "success",
                message: "删除成功!",
              });
              if (this.gridData.length == cVule.length) {
                if (this.gridPage.currentPage > 1) {
                  this.gridPage.currentPage = this.gridPage.currentPage - 1;
                }
              }
              this.loadTableData();
            } else {
              this.$message({
                type: "error",
                message: response.body.resultMessage,
              });
            }
          });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除",
          });
        });
    },

    gridButtonClick(button) {
      //　列表头部按钮
      //console.log("gridButtonClick",this,this.$parent)
      console.log("gridButtonClick", button);
      this.$emit("extend-change", button);
      let self = this;
      var type = button.button_type;
      var exeservice = button.service_name;
      var tab_title = button.service_view_name;
      var operate_type = button.operate_type;
      var moreConfig = null;
      if (button.more_config && typeof button.more_config === "string") {
        try {
          moreConfig = JSON.parse(button.more_config);
        } catch (error) {
          console.log(error);
        }
      }

      if (
        button.hasOwnProperty("always_show") &&
        button.always_show &&
        !button.permission
      ) {
        // 无权限的按钮永久显示，操作弹出配置提示信息
        this.$alert(
          button.tip_msg ? button.tip_msg : "您无法进行该操作",
          "提示",
          {
            confirmButtonText: "确定",
          }
        );
        return;
      }
      if (
        button.action_validate &&
        this.evalActionValidator(button.action_validate, this.gridData) !== true
      ) {
        return;
      }

      if ("select" == type) {
        self.toggleFilters(button);
      } else if ("extjs" === type) {
        button.handlerFunc && button.handlerFunc();
      } else if ("shrink" == type) {
        self.selectFormShow = false;
      } else if ("refresh" == type) {
        self.refresh();
      } else if ("batch_delete" == type) {
        self.batchDeleteData(exeservice);
      } else if (type === 'pay') {
        if(this.multipleSelection.length == 0) {
          return this.$message.warning("请选择需要支付的数据", "提示");
        }
        this.buttonInfo = button
        this.activeForm = 'pay';
      } else if ("add" == type) {
        if (operate_type == "页内添加") {
          if (this.list_inner_add) {
            self.list_inner_add = false;
          } else {
            self.list_inner_add = true;
          }
        } else {
          self.onAddClicked();
        }
      } else if ("confirmadd" == type) {
        if (this.multipleSelection.length == 0) {
          this.$alert("请选择需要添加的数据", "提示", {
            confirmButtonText: "确定",
          });
        } else {
          var relation_col = "";
          var referenced_column_name = "";
          let map_table = this.mapcondition.map_table;
          var table_col_realtion = button.table_col_realtion;
          for (var item of table_col_realtion) {
            if (item.table_name == map_table) {
              relation_col = item["column_name"];
              referenced_column_name = item["referenced_column_name"];
              break;
            }
          }

          if (relation_col != "") {
            let bxRequests = [];
            let bxRequest = {};
            bxRequests.push(bxRequest);
            bxRequest.serviceName = this.mapcondition.addservice;
            bxRequest.data = [];

            for (var item of this.multipleSelection) {
              var dataMap = {};
              dataMap[this.mapcondition.input_col_name] =
                this.mapcondition.input_col_value;
              dataMap[relation_col] = item[referenced_column_name];
              bxRequest.data.push(dataMap);
            }

            this.operate(bxRequests).then((response) => {
              var state = response.body.state;

              if ("SUCCESS" == state) {
                this.$message({
                  type: "success",
                  message: "添加成功!",
                });

                // this.loadTableData()
                this.$emit("action-complete");
              } else {
                this.$message({
                  type: "error",
                  message: response.body.resultMessage,
                });
              }
            });
          }
        }
      } else if ("batchadd" == type) {
        console.log("batchadd", button);
        if (button.hasOwnProperty("btn_cfg_json")) {
          this.buildBatchConfig(button);
        } else {
          console.error(button);
        }

        /**旧版老代码 */
        // var select_optionlist = ""
        // var child_column_name = this.childforeignkey.column_name;
        // var map_table_name = "";
        // for (var item of this.srv_cols) {
        //   let columns = item.columns;

        //   let option_list_v2 = item.option_list_v2;
        //   if (option_list_v2 != undefined && option_list_v2 != null && option_list_v2 != '') {
        //     if (columns != child_column_name) {
        //       select_optionlist = option_list_v2;
        //       map_table_name = item.table_name;
        //     }

        //   }
        // }
        // if (select_optionlist != '') {

        //   var mapcondition = {};
        //   mapcondition.map_table = map_table_name;
        //   mapcondition.input_col_name = child_column_name;
        //   mapcondition.input_col_value = this.childforeignvalue;
        //   mapcondition.addservice = exeservice;
        //   var service = select_optionlist.serviceName;
        //   var condition = [];
        //   this.addListpoup(service, condition, mapcondition);
        // }

        //批量添加
      } else if ("batchupdate" == type) {
        if (this.header_view_model != "normal") {
          this.header_view_model = "normal";
          this.gridHeader = this.noramlHeaders;
        }
        this.onBatchUpdateClick();
        // this.onInplaceEditClicked();
      } else if ("saveall" == type) {
        this.onSaveAllClicked();
      } else if ("apply" == type) {
        // var urlParams = `/${exeservice}?time=${(new Date()).getTime()}`;
        var urlParams = `/${exeservice}`;
        this.addTab(
          "start-proc",
          urlParams,
          tab_title,
          null,
          button,
          button.application
        );
      } else if ("export" == type) {
        this.onExportClicked(null, button);
        // this.activeForm = "export"   // 显示导出配置
      } else if ("import" == type) {
        this.onImportClicked(button);
      } else if ("customize" == type) {
        var operate_params_cfg = button.operate_params;
        var select_data = button.select_data;
        if (
          (select_data == null ||
            select_data == undefined ||
            select_data == "是") &&
          this.multipleSelection <= 0 &&
          operate_params_cfg != undefined &&
          operate_params_cfg != "" &&
          operate_params_cfg != null
        ) {
          this.$alert("请选择操作数据", "提示", {
            confirmButtonText: "确定",
          });
        } else {
          var me = this;

          if (button.operate_type == "修改") {
            this.customize_update(button, this.multipleSelection);
          } else if (button.operate_type == "删除") {
            this.customize_delete(operate_item, this.multipleSelection);
          } else if (button.operate_type == "增加") {
            this.customize_add(button, this.multipleSelection);
          } else if (button.operate_type == "增加弹出") {
            console.log("customize button", button);
            this.customizeOperate(button, this.multipleSelection, (e) => {
              // dialog操作完成之后的回调 刷新列表
              this.loadTableData();
              this.$emit('customize-action-complete', e, button);
            });
            // this.customize_add(button, this.multipleSelection);
          }
          else {
            button.listservice = this.service;
            this.customizeOperate(button, this.multipleSelection, (e) => {
              // dialog操作完成之后的回调 刷新列表
              this.loadTableData();
              this.$emit('customize-action-complete', e, button);
            });
          }
        }
      } else if ("batch_approve" == type) {
        this.onBatchApprove(this.multipleSelection, button);
      }
    },

    rowButtonClick(operate_item, row) {
      let self = this;
      let button = operate_item;
      var type = operate_item.button_type;
      // console.log(type)
      var exeservice = operate_item.service_name;
      var tab_title = operate_item.service_view_name;
      // this.clickedRow = row
      this.activeRowButton = operate_item;
      this.rowButtonActiveServiceName = "";
      if (
        button.hasOwnProperty("always_show") &&
        button.always_show &&
        !button.permission
      ) {
        // 无权限的按钮永久显示，操作弹出配置提示信息
        this.$alert(
          button.tip_msg ? button.tip_msg : "您无法进行该操作",
          "提示",
          {
            confirmButtonText: "确定",
          }
        );
        return;
      }
      if (
        button.action_validate &&
        this.evalActionValidator(button.action_validate, row) !== true
      ) {
        return;
      }

      var operate_service = operate_item.operate_service;
      if (operate_service) {
        exeservice = operate_service;
      }

      if ("delete" == type) {
        this.deleteRowData(row, exeservice);
      } else if ("edit" == type) {
        if (
          button.operate_service &&
          Object.prototype.toString.call(button.operate_service) !==
          "[object String]"
        ) {
          let srv = this.getButtonOptSrv(button, row, "active");
          if (srv.length > 0) {
            this.rowButtonActiveServiceName = srv[0].serviceName;
          } else {
          }
        } else {
          this.rowButtonActiveServiceName =
            button.operate_service || button.service_name;
        }
        let actionConfig = this.getButtonOptSrv(button, row, "active");
        console.log("getButtonOptSrv", actionConfig);
        self.onUpdateClicked(row);
      } else if ("detail" == type) {
        var urlParams =
          "/" +
          exeservice +
          "/" +
          row.id +
          "?srvApp=" +
          this.resolveDefaultSrvApp() +
          "&isdraft=" +
          this.draftRun; //跳转
        if (this.pub_field_map?.id) {
          urlParams =
            "/" +
            exeservice +
            "/" +
            row[this.pub_field_map.id] +
            "?srvApp=" +
            this.resolveDefaultSrvApp() +
            "&isdraft=" +
            this.draftRun; //跳转
        }
        // 公共详情按钮传分表参数规则
        let divCond = this.searchFormCondition
          .filter((item) => item.use_div_calc === "是")
          .map((item) => {
            return {
              colName: item.colName,
              ruleType: item.ruleType,
              value: item.value,
            };
          });
        if (button?.more_config?.includes("divCond")) {
          try {
            const moreConfig = JSON.parse(button.more_config);
            if (moreConfig?.divCond?.colName) {
              const evalCondValue = (value, row = {}, mainData = {}) => {
                if (!value || typeof value === "string") {
                  return value;
                } else if (value?.value_type === "rowData" && value.value_key) {
                  return row[value.value_key];
                } else if (
                  value?.value_type === "mainData" &&
                  value.value_key
                ) {
                  return mainData[value.value_key];
                } else if (value?.value_type === "constant" && value.value) {
                  return value.value;
                }
              };
              const mainDetailData = this.listMainFormDatas || {};

              divCond = [
                {
                  colName: moreConfig.divCond.colName,
                  ruleType: "between",
                  value: [
                    evalCondValue(
                      moreConfig.divCond.start_value,
                      row,
                      mainDetailData
                    ),
                    evalCondValue(
                      moreConfig.divCond.end_value,
                      row,
                      mainDetailData
                    ),
                  ],
                },
              ];
            }
          } catch (error) {
            console.error(error);
          }
        }
        if (!divCond?.length && this.buildDivCond?.()?.length) {
          divCond = this.buildDivCond();
        }
        if (divCond?.length) {
          // 分表查询条件 2024.1.12新增，传到详情页面
          const divObj = divCond[0];
          if (
            divCond?.length === 1 &&
            Array.isArray(divObj?.value) &&
            divObj.value.length > 1
          ) {
            // 直接将分表参数拼接到url上
            urlParams += `&divCol=${divObj.colName}&divStartVal=${divObj.value[0]}&divEndVal=${divObj.value[1]}`;
          } else {
            // 分表参数以数组格式传到url上
            urlParams += `&divCond=${encodeURIComponent(
              JSON.stringify(divCond)
            )}`;
          }
        }
        let sharding_biz_cols = this.gridHeader.filter((item) => item.srvcol?.sharding_biz_col === true).map((item) => item.column);
        console.log('sharding_biz_cols:', sharding_biz_cols);

        if (sharding_biz_cols?.length) {
          // 分表查询条件 2025.4.1新增，传到详情页面
          let operate_params = {
            condition: [],
          }
          for (let col of sharding_biz_cols) {
            operate_params.condition.push({
              colName: col,
              ruleType: "eq",
              value: row[col],
            });
          }
          urlParams += `&operate_params=${encodeURIComponent(JSON.stringify(operate_params))}`;
        }
        var disp_col = operate_item._disp_col;
        var disp_value = row[disp_col]; //详情页面上的标签
        tab_title = tab_title.replace("查询", "");
        if (disp_value != null && disp_value != undefined && disp_value != "") {
          tab_title = disp_value + "(" + tab_title + "详情)";
        } else {
          tab_title = tab_title + "详情";
        }
        this.addTab("detail", urlParams, tab_title, null, button);
      } else if ("procdetail" == type) {
        var urlParams =
          "/" +
          row["proc_instance_no"] +
          "?srvApp=" +
          this.resolveDefaultSrvApp();
        this.addTab("procdetail", urlParams, tab_title, null, button);
      } else if ("addchild" == type) {
        this.onAddChildClicked(row);
      } else if ("duplicate" == type) {
        if (this.storageType === "mem") {
          this.activeData = row;
        } else {
          this.activeData = null;
        }

        this.onDuplicateClicked(row);
      } else if ("duplicatedeep" == type) {
        this.onDuplicateDeepClicked(row);
      } else if ("closeproc" == type) {
        this.procOperate(row, operate_item);
      } else if ("proccancel" == type) {
        this.procOperate(row, operate_item);
      } else if ("deleteproc" == type) {
        this.procOperate(row, operate_item);
      } else if ("startproc" == type) {
        //开启数据流程
        this.start_dataproc(row, operate_item);
      } else if ("deletedraft" == type) {
        this.procOperate(row, operate_item);
      } else if ("extjs" === type) {
        operate_item.handlerFunc && operate_item.handlerFunc(row);
      } else if ("manage_childlist" === type) {
        this.onPopupMemListClick(row, button);
      } else if ("urge" == type) {
        //催办
        this.procOperate(row, operate_item);
      } else if ("customize" == type) {
        if (button.hasOwnProperty("version") && button.version == "v2") {
          this.customButtonV2(button, row);
        } else {
          let data = [row];
          if (operate_item.operate_type == "修改") {
            this.customize_update(operate_item, data);
          } else if (operate_item.operate_type == "删除") {
            this.customize_delete(operate_item, data);
          } else if (operate_item.operate_type == "增加") {
            this.customize_add(operate_item, data);
          } else if(operate_item.operate_type == "申请弹出"){
            this.customize_popup(operate_item, data);
          }else {
            operate_item.listservice = this.service;
            this.customizeOperate(operate_item, data, (e) => {
              // dialog操作完成之后的回调 刷新列表
              this.loadTableData();
              this.$emit('customize-action-complete', e, operate_item);
            });
          }
        }

        let pageKey = {
          service: operate_item.service,
          buttonsKey: `${operate_item["operate_service"]}-${operate_item.id}`,
          buttonType: operate_item.operate_type,
          buttonMode: operate_item.servcie_type,
          submitState: false,
        };
        console.log(operate_item, 333333333);
        this.$store.commit("setTableButtonsPopup", {
          ...pageKey,
        });
        // 初始化弹出表单状态
      } else if ("batch_approve" == type) {
        // 流程批量审批
        this.onBatchApprove([row], button);
      } else if ("customize_import" == type) {
        // 自定义导入
        this.onCustomizeImport(row, button);
      }
    },
    //
    customPopup(operate_item, data) {
      // 2021 02 26
      //自定义弹出

      this.customizeOperate(operate_item, data, (e) => {
        // dialog操作完成之后的回调 刷新列表
        this.loadTableData();
        this.$emit('customize-action-complete', e, operate_item);

      });
      // if(data.operate_type.endsWith("弹出")){

      // }else{
      //   this.customizeOperate(operate_item, data);
      // }
    },
    //开启数据流程
    start_dataproc(row, buttinfo) {
      var me = this;

      var pre_confirm_msg = buttinfo.pre_confirm_msg;
      if (!pre_confirm_msg) {
        pre_confirm_msg = "您确定要执行此操作?";
      }
      this.$confirm(pre_confirm_msg, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "info",
      })
        .then(() => {
          var requests = [];
          var request = {};
          requests.push(request);

          let parent_proc_instance_no = row.parent_proc_instance_no;
          if (parent_proc_instance_no) {
            request["parent_proc_instance_no"] = parent_proc_instance_no;
          }
          request["proc_no"] = JSON.parse(buttinfo.operate_params).proc_no;
          let condition = [
            {
              colName: "id",
              value: row.id,
              ruleType: "eq",
            },
          ];
          request["condition"] = condition;

          this.startDataProc(requests).then((response) => {
            var state = response.body.state;

            if ("SUCCESS" == state) {
              var resultMessage = "操作成功!";

              if (
                resultMessage != "" &&
                resultMessage != null &&
                resultMessage != undefined
              ) {
                resultMessage = response.body.resultMessage;
              }

              this.$message({
                type: "success",
                message: resultMessage,
              });

              me.loadTableData();
            } else {
              this.$message({
                type: "error",
                message: response.body.resultMessage,
              });
            }
          });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消",
          });
        });
    },
    procOperate(row, buttinfo) {
      var me = this;
      var type = buttinfo.button_type;
      if ("closeproc" == type) {
        this.$prompt("", "请输入关闭原因", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          inputValidator: function (value) {
            if (value == "" || (value == undefined && value == null)) {
              return "请输入关闭原因";
            }
          },
        })
          .then(({ value }) => {
            if (value == "" || (value == undefined && value == null)) {
              this.$message({
                type: "info",
                message: "请输入关闭原因",
              });
            } else {
              me.procRelateOperate(row, buttinfo, value);
            }
          })
          .catch(() => {
            this.$message({
              type: "info",
              message: "取消操作",
            });
          });
      } else if ("proccancel" == type) {
        this.$prompt("", "请输入撤销原因", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          inputValidator: function (value) {
            if (value == "" || (value == undefined && value == null)) {
              return "请输入撤销原因";
            }
          },
        })
          .then(({ value }) => {
            if (value == "" || (value == undefined && value == null)) {
              this.$message({
                type: "info",
                message: "请输入撤销原因",
              });
            } else {
              me.procRelateOperate(row, buttinfo, value);
            }
          })
          .catch(() => {
            this.$message({
              type: "info",
              message: "取消操作",
            });
          });
      } else {
        this.$confirm("您确定要执行此操作?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "info",
        })
          .then(() => {
            me.procRelateOperate(row, buttinfo);
          })
          .catch(() => {
            this.$message({
              type: "info",
              message: "已取消",
            });
          });
      }
    },
    procRelateOperate(row, buttinfo, remark) {
      var me = this;

      var type = buttinfo.button_type;
      var requests = [];
      var request = {};
      request["serviceName"] = buttinfo.service_name;
      var cMap = {
        colName: "proc_instance_no",
        ruleType: "eq",
        value: row.proc_instance_no,
      };
      request["condition"] = [cMap];

      if (remark != undefined && remark != null && remark != "") {
        var dataMap = {
          remark: remark,
        };
        request["data"] = [dataMap];
      }

      requests.push(request);

      this.operate(requests).then((response) => {
        var state = response.body.state;

        if ("SUCCESS" == state) {
          var resultMessage = "操作成功!";

          if (
            resultMessage != "" &&
            resultMessage != null &&
            resultMessage != undefined
          ) {
            resultMessage = response.body.resultMessage;
          }

          this.$message({
            type: "success",
            message: resultMessage,
          });

          me.loadTableData();
        } else {
          this.$message({
            type: "error",
            message: response.body.resultMessage,
          });
        }
      });
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    handleCurrentChange(val) {
      this.gridPage.currentPage = val;
      this.loadTableData();
    },

    handleSizeChange(val) {
      this.gridPage.pageSize = val;
      // this.pageSize = val;
      this.loadTableData();
    },

    query(condtion) {
      this.searchFormCondition = condtion;
      this.gridPage.currentPage = 1;
      this.condition = [];
      this.buildGridHeaders(this.srv_cols, condtion);
      // console.log(cloneDeep(this.filterCondition));
      this.loadTableData();
    },

    buildQueryConditions() {
      this.condition = [];
      if (this.listType == "wait") {
      }
      for (var cMap of this.custCondition) {
        this.condition.push(cMap);
      }

      for (var cMap of this.filterCondition) {
        this.condition.push(cMap);
      }

      for (var cMap of this.searchFormCondition) {
        this.condition.push(cMap);
      }

      if (Array.isArray(this.defaultCondition)) {
        for (var cMap of this.defaultCondition) {
          this.condition.push(cMap);
        }
      }

      this.condition
        .filter((item) => item.dynamic === true)
        .forEach((item) => {
          let ctx = this;
          item.value = eval(item.value);
        });

      this.condition
        .filter((item) => item.valueFunc && isFunction(item.valueFunc))
        .forEach((item) => (item.value = item.valueFunc()));

      let hasEmptyRequiredCondition =
        this.condition.filter(
          (item) => item.required === true && this.isEmptyCondition(item)
        ).length > 0;
      if (hasEmptyRequiredCondition) {
        throw new MissRequiredConditionError(this.condition);
      }
      return this.condition;
    },
    loadDraftLength() {
      let self = this;
      this.buildQueryConditions();

      let pageSize = this.pageSize || this.gridPage.pageSize;
      var page =
        this.isMem() || (this.gridPage && pageSize < 0)
          ? null
          : {
            pageNo: this.gridPage.currentPage,
            rownumber: pageSize,
          };
      let relationCondition = self.relationCondition;
      console.log("loadDraftLength", cloneDeep(this.condition));
      // service_name, condition, page, order, group, mapcondition, app,isproc,columns,relationCondition
      return self
        .select(
          self.service_name,
          self.condition,
          self.showPagination ? page : null,
          self.order,
          null,
          self.mapcondition,
          null,
          null,
          null,
          relationCondition,
          true,
          "list_page"
        )
        .then((response) => {
          let gridData = response.body.data;
          let page = response.body.page;
          if (!page) {
            page = { total: response.body.data.length };
          }
          self.tabsConfig[1].len = page.total || 0;
        });
    },
    loadTableData(srvAuth) {
      let self = this;
      // if(this.listType == 'addchildlist'){
      //   return
      // }
      if (!this.vpageNo && !this.isRefreshed) {
        // 登录过期后刷新
        this.isRefreshed = true;
        return this.initGridData();
      }
      if (!this.shouldLoadFromDb) {
        return Promise.resolve(true);
      }

      const loading = this.$loading({
        lock: true,
        text: "加载中",
        spinner: "el-icon-loading",
        background: "rgba(0, 0, 0, 0.7)",
      });

      setTimeout(() => {
        loading.close();
      }, 5000);
      try {
        this.buildQueryConditions();
        console.log("loadTableData", cloneDeep(this.condition));
        let pageSize =
          this.setPageSize || this.pageSize || this.gridPage.pageSize;
        var page =
          this.isMem() || (this.gridPage && pageSize < 0)
            ? null
            : {
              pageNo: this.gridPage.currentPage,
              rownumber: pageSize,
            };

        if (
          this.listType == "wait" ||
          this.listType == "mine" ||
          this.listType == "myall" ||
          this.listType == "processed" ||
          this.listType == "all" ||
          this.listType == "userall" ||
          this.listType == "cc"
        ) {
          //加载表格数据
          return this.selectproc(
            this.service_name,
            this.condition,
            // page,
            this.showPagination ? page : null,
            this.order,
            this.listType,
            "list_page",
            this.vpageNo
          )
            .then((response) => {
              if (response.body.resultCode == "0011") {
                // 登录过期
                this.$store.commit("clearSrvCols");
                this.vpageNo = null;
                return;
              }
              // console.log("responseresponse",response)
              var listData = response.body.data;
              this.originListData = JSON.parse(JSON.stringify(listData));
              for (var row in listData) {
                for (var key in this.keyValueData) {
                  var dicts = this.keyValueData[key];
                  for (var map in dicts) {
                    if (listData[row][key] == dicts[map]["value"]) {
                      listData[row][key] = dicts[map]["text"];
                      break;
                    }
                  }
                }
              }

              this.gridData = listData;

              if (
                this.gridData &&
                this.gridData.length > 0 &&
                this.gridData[0].hasOwnProperty("_encrypt_cols")
              ) {
                this._encrypt_cols = this.gridData[0]["_encrypt_cols"]; // 加密的字段
                // this.gridData.splice(0, this.gridData.length - 1)
              } else {
                this._encrypt_cols = []; // 加密的字段
                // this.gridData.splice(0, this.gridData.length - 1)
              }
              if (response.body["page"] != undefined) {
                this.gridPage.currentPage = response.body["page"]["pageNo"];
                this.gridPage.total = response.body["page"]["total"];
              }
              this.init_card_data = true;
              if (this.cardInstance != null) {
                this.cardInstance.setCardData(this.gridData);
              }

              // this.
              this.$nextTick((_) => {
                this.$emit("gridData-change", response.body, this.listType);
              });
              loading.close();
            })
            .catch((err) => {
              loading.close();
              console.log("err", err);
            });
        } else {
          //加载表格数据
          if (this.defaultapi == "select") {
            let relationCondition = cloneDeep(this.relationCondition);
            const simpleFilterRelationCondition =
              this.$refs?.["filter-form"]?.buildRelationConditions?.();
            if (simpleFilterRelationCondition?.data?.length) {
              if (relationCondition?.data) {
                relationCondition.data.push(simpleFilterRelationCondition);
              } else {
                relationCondition = simpleFilterRelationCondition;
              }
            }
            let condition = cloneDeep(this.condition) || [];
            let rdt = null;
            if (this.listType === "treelist") {
              //树列表，没有搜索条件的时候，默认只查找父节点为空的数据
              const noCol = this.listV2Data["no_col"];
              const parentCol = this.listV2Data["parent_no_col"];
              if (this.searchFormCondition.length == 0) {
                if (!condition.find((item) => item.colName === parentCol)) {
                  var initCondition = {
                    colName: parentCol,
                    ruleType: "isnull",
                  };
                  condition.push(initCondition);
                }
              }
              rdt = this.childForeignkey?.constraint_name ? "ttd" : null; //是子表 使用ttd特性 2023年11月13日jiaqi
              if (this.$route?.query?.topTreeData === "true") {
                rdt = "ttd";
              }
            }

            //加载表格数据
            const divCond = this.buildDivCond?.();
            return onFetch({
              service: this.service_name,
              condition: condition,
              page: this.showPagination ? page : null,
              order: this.order,
              group: this.group,
              mapcondition: this.mapcondition,
              app: this.resolveDefaultSrvApp(),
              isproc: this.isproc,
              columns: this.columns,
              relationCondition: relationCondition,
              isDraft: this.draftRun,
              divCond: divCond,
              rdt: rdt,
              pageType: "list_page",
              vpageNo: this.vpageNo,
              srvAuth: srvAuth,
            }, this)
              .then((response) => {
                console.log('divCond', divCond);

                if (response.resultCode == "0011") {
                  // 登录过期
                  this.$store.commit("clearSrvCols");
                  this.vpageNo = null;
                } else if (response.resultCode == "0111") {
                  console.log("response", response);
                  this.activeForm = "srv-auth-login";
                  this.srvAuthLogin = true;
                } else {
                  if (this.listType === "treelist") {
                    // 使用treegrid风格的树形结构处理
                    response.data.forEach((item) => {
                      item._children = item.children;
                      delete item.children;
                    });
                    this.buildTreeData(response.data, true);
                    this.gridData = this.setSpaceIcon(response.data, null);

                    // 设置firstColumn
                    if (this.gridHeader && this.gridHeader.length > 0) {
                      this.firstColumn = this.gridHeader.find(item =>
                        this.getGridHeaderDispExps(item, this.listMainFormDatas)
                      )?.column;
                    }

                    // 处理已展开的节点
                    if (this.gridData.length > 0) {
                      this.gridData.forEach((item) => {
                        if (this.unfoldDataMap[item.id] === true) {
                          this.toggle(item);
                        }
                      });
                    }
                  } else {
                    this.gridData = response.data;
                  }
                  this.originListData = JSON.parse(
                    JSON.stringify(response.data)
                  );
                  let page = response.page;

                  if (response.hasOwnProperty("stats_data")) {
                    self.statsData = response.stats_data;
                  }
                  if (self.statsData?.length) {
                    self.buildStatsData(); // 格式化金额数字格式
                    self.$emit("stats-data-load", self.statsData);
                  }
                  if (!page) {
                    page = { total: response.data.length };
                  }
                  // 草稿标前显示 数量
                  if (this.draftRun) {
                    this.tabsConfig[1].len = page.total || 0;
                  } else {
                    this.tabsConfig[0].len = page.total || 0;
                  }

                  if (this.listType?.indexOf("childlist") !== -1) {
                    // 汇聚子表数据
                    if (this.storageType === "mem" && this.inplaceEdit) {
                      this.gridData.forEach((row) => {
                        if (
                          !row._dirtyFlags &&
                          this.defaultDirtyFlags === "add"
                        ) {
                          // 如果没有 dirtyFlags，设置默认的flags
                          row["_guid"] = this.guid();
                          row["id"] = null;
                        }
                      });
                    }
                    let child = {
                      name: this.service,
                      data: this.gridData,
                      constraint_name: this.childforeignkey?.constraint_name,
                    };
                    this.$emit("child-loaded", child);
                  }
                  // console.log(_)
                  this.unmodifiedGridData = cloneDeep(this.gridData);
                  if (
                    this.gridData &&
                    this.gridData.length > 0 &&
                    this.gridData[0].hasOwnProperty("_encrypt_cols")
                  ) {
                    this._encrypt_cols = this.gridData[0]["_encrypt_cols"]; // 加密的字段
                  } else {
                    this._encrypt_cols = []; // 加密的字段
                  }

                  var listData = response.data;

                  if (this.gridDataFilter) {
                    let filter = this.gridDataFilter;
                    filter(listData);
                  }

                  listData.forEach((row) => {
                    // handle sth.
                    for (var key in this.keyValueData) {
                      var dictData = this.keyValueData[key];
                      for (var map in dictData) {
                        if (row[key] == dictData[map]["value"]) {
                          // row[key] = dictData[map]["text"];  // 0115+
                          break;
                        }
                      }
                    }

                    if (this.inlineLists) {
                      row._inlineLists = row._inlineLists || {};
                      this.inlineLists.forEach((inlineList) => {
                        let fk = inlineList.foreign_key;
                        if (!row[fk.referenced_column_name]) {
                          return;
                        }

                        let conditions = [
                          {
                            colName: fk.column_name,
                            ruleType: "eq",
                            value: row[fk.referenced_column_name],
                          },
                        ];
                        this.select(
                          inlineList.inline_list_select_service,
                          conditions
                        ).then((resp) => {
                          resp.data &&
                            resp.data.data &&
                            (row._inlineLists[fk.constraint_name] =
                              resp.data.data);
                        });
                      });
                    }
                  });

                  // 表格尾部合计行数据   sum_row_data

                  if (
                    response.hasOwnProperty("sum_row_data") &&
                    response.sum_row_data
                  ) {
                    this.sumRowData = this.bxDeepClone(response.sum_row_data);
                    this.sumRowData["_data_type"] = "sumRow";
                    if (
                      this.sumConfig &&
                      this.sumConfig.sum_text_col &&
                      this.sumConfig.sum_text
                    ) {
                      this.sumRowData[this.sumConfig.sum_text_col] =
                        this.sumConfig.sum_text;
                    }
                  }

                  if (response["page"]) {
                    this.gridPage.currentPage = response["page"]["pageNo"];
                    this.gridPage.total = response["page"]["total"];
                  }
                  this.init_card_data = true;
                  if (this.cardInstance != null) {
                    this.cardInstance.setCardData(this.gridData);
                  }


                  this.$emit("list-data-loaded", this);
                  loading.close();
                  this.$refs?.["bx-table-layout"]?.doLayout();
                }
              })
              .finally(() => {
                loading.close();
              });
            // console.log(this.showPagination)
            // service_name, condition, page, order, group, mapcondition, app,isproc,columns,relationCondition
            return this.select(
              this.service_name,
              this.condition,
              this.showPagination ? page : null,
              this.order,
              null,
              this.mapcondition,
              null,
              null,
              null,
              relationCondition,
              this.draftRun,
              "list_page",
              srvAuth,
              this.vpageNo,
              null,
              null,
              this.buildDivCond?.()
            )
              .then((response) => {
                if (response.body.resultCode == "0011") {
                  // 登录过期
                  this.$store.commit("clearSrvCols");
                  this.vpageNo = null;
                } else if (response.body.resultCode == "0111") {
                  console.log("response.body", response.body);
                  this.activeForm = "srv-auth-login";
                  this.srvAuthLogin = true;
                } else {
                  this.gridData = response.body.data;
                  this.originListData = JSON.parse(
                    JSON.stringify(response.body.data)
                  );
                  let page = response.body.page;

                  // self.statsData = response.body.stats_data? response.body.stats_data:[]
                  if (response.body.hasOwnProperty("stats_data")) {
                    self.statsData = response.body.stats_data;
                  }
                  if (self.statsData?.length) {
                    self.buildStatsData(); // 格式化金额数字格式
                    self.$emit("stats-data-load", self.statsData);
                  }
                  if (!page) {
                    page = { total: response.body.data.length };
                  }
                  // 草稿标前显示 数量
                  if (this.draftRun) {
                    this.tabsConfig[1].len = page.total || 0;
                  } else {
                    this.tabsConfig[0].len = page.total || 0;
                  }

                  if (this.listType.indexOf("childlist") !== -1) {
                    // 汇聚子表数据
                    if (this.storageType === "mem" && this.inplaceEdit) {
                      this.gridData.forEach((row) => {
                        if (
                          !row._dirtyFlags &&
                          this.defaultDirtyFlags === "add"
                        ) {
                          // 如果没有 dirtyFlags，设置默认的flags
                          row["_guid"] = this.guid();
                          row["id"] = null;
                          // this.$set(row, "_dirtyFlags", this.defaultDirtyFlags)
                          // if (this.defaultDirtyFlags === "add") {
                          //   this.$set(row, "_guid", this.guid())
                          //   this.$set(row, "id", null)
                          // }
                        }
                      });
                    }
                    let child = {
                      name: this.service,
                      data: this.gridData,
                      constraint_name: this.childforeignkey?.constraint_name,
                    };
                    this.$emit("child-loaded", child);
                  }
                  // console.log(_)
                  this.unmodifiedGridData = cloneDeep(this.gridData);
                  if (
                    this.gridData &&
                    this.gridData.length > 0 &&
                    this.gridData[0].hasOwnProperty("_encrypt_cols")
                  ) {
                    this._encrypt_cols = this.gridData[0]["_encrypt_cols"]; // 加密的字段
                    // this.gridData.splice(0, this.gridData.length - 1)
                  } else {
                    this._encrypt_cols = []; // 加密的字段
                    // this.gridData.splice(0, this.gridData.length - 1)
                  }

                  var listData = response.body.data;

                  if (this.gridDataFilter) {
                    let filter = this.gridDataFilter;
                    filter(listData);
                  }

                  listData.forEach((row) => {
                    // handle sth.
                    for (var key in this.keyValueData) {
                      var dictData = this.keyValueData[key];
                      for (var map in dictData) {
                        if (row[key] == dictData[map]["value"]) {
                          // row[key] = dictData[map]["text"];  // 0115+
                          break;
                        }
                      }
                    }

                    // load child list data for inline list
                    if (this.inlineLists) {
                      row._inlineLists = row._inlineLists || {};
                      this.inlineLists.forEach((inlineList) => {
                        let fk = inlineList.foreign_key;
                        if (!row[fk.referenced_column_name]) {
                          return;
                        }

                        let conditions = [
                          {
                            colName: fk.column_name,
                            ruleType: "eq",
                            value: row[fk.referenced_column_name],
                          },
                        ];
                        this.select(
                          inlineList.inline_list_select_service,
                          conditions
                        ).then((resp) => {
                          resp.data &&
                            resp.data.data &&
                            (row._inlineLists[fk.constraint_name] =
                              resp.data.data);
                        });
                      });
                    }
                  });

                  // 表格尾部合计行数据   sum_row_data

                  if (
                    response.body.hasOwnProperty("sum_row_data") &&
                    response.body.sum_row_data
                  ) {
                    this.sumRowData = this.bxDeepClone(
                      response.body.sum_row_data
                    );
                    this.sumRowData["_data_type"] = "sumRow";
                    if (
                      this.sumConfig &&
                      this.sumConfig.sum_text_col &&
                      this.sumConfig.sum_text
                    ) {
                      this.sumRowData[this.sumConfig.sum_text_col] =
                        this.sumConfig.sum_text;
                    }
                  }

                  if (response.body["page"]) {
                    this.gridPage.currentPage = response.body["page"]["pageNo"];
                    this.gridPage.total = response.body["page"]["total"];
                  }
                  this.init_card_data = true;
                  if (this.cardInstance != null) {
                    this.cardInstance.setCardData(this.gridData);
                  }


                  this.$emit("list-data-loaded", this);
                  loading.close();
                  this.$refs?.["bx-table-layout"]?.doLayout();
                }
              })
              .finally(() => {
                loading.close();
              });
          } else {
            return this.selectByUser(
              this.service_name,
              this.condition,
              this.showPagination ? page : null,
              this.order,
              null,
              this.mapcondition,
              "list_page"
            ).then((response) => {
              this.gridData = response.body.data;
              console.log(this.gridData);
              this.unmodifiedGridData = cloneDeep(this.gridData);
              // this.gridData.splice(0, this.gridData.length - 1)
              if (
                this.gridData &&
                this.gridData.length > 0 &&
                this.gridData[0].hasOwnProperty("_encrypt_cols")
              ) {
                this._encrypt_cols = this.gridData[0]["_encrypt_cols"]; // 加密的字段
                // this.gridData.splice(0, this.gridData.length - 1)
              } else {
                this._encrypt_cols = []; // 加密的字段
                // this.gridData.splice(0, this.gridData.length - 1)
              }
              var listData = response.body.data;
              // 转译字典
              for (var row in listData) {
                for (var key in this.keyValueData) {
                  var dictData = this.keyValueData[key];
                  for (var map of dictData) {
                    if (row[key] == dictData[map]["value"]) {
                      row[key] = dictData[map]["text"];
                      break;
                    }
                  }
                }
              }
              if (response.body["page"]) {
                this.gridPage.currentPage = response.body["page"]["pageNo"];
                this.gridPage.total = response.body["page"]["total"];
              }

              this.init_card_data = true;
              if (this.cardInstance != null) {
                this.cardInstance.setCardData(this.gridData);
              }


              this.$emit("list-data-loaded", this);

              loading.close();
            });
          }
        }
      } catch (e) {
        loading.close();
        throw e;
      }
    },

    createCustomLinkUrlFunc: function (linkUrlFunc) {
      return (data) => {
        let vm = this;
        let ret = eval("var zz=" + linkUrlFunc + "(data, vm); zz");
        return ret;
      };
    },

    addInlineListRowButton: function (srvcol) {
      let button = {
        button_name: srvcol.label,
        button_type: "manage_childlist",
        page_area: "表格行按钮",
        page_type: "修改子列表",
        permission: true,
      };

      button.service_name = srvcol.service_name;
      button.foreign_key = srvcol.foreign_key;
      button.inline_list_select_service = srvcol.inline_list_select_service;

      let fk = button.foreign_key;
      button.defaultCondition = (row) => {
        return [
          {
            colName: fk.column_name,
            ruleType: "eq",
            valueFunc: (_) => {
              return row[fk.referenced_column_name] || null;
            },
          },
        ];
      };

      this.inlineLists.push(button);

      this.rowButton.push(wrapButton(button, "row"));
    },

    getColAlign: function (colType) {
      if (
        ['Float', 'Money', 'int', 'Integer', 'Decimal', 'Email', 'TelNo'].includes(colType)
      ) {
        // return "right";
        return "center"; //2025.9.2改为居中
      } else if (
        ['Enum', 'Dict', 'Date', 'DateRange', 'DateTime'].includes(colType)
      ) {
        return "center";
      } else {
        return "left";
      }
    },
    buildGridHeaders: function (
      srv_cols,
      searchFormCondition,
      filterCondition
    ) {
      //sectionlist分组
      this.gridHeader = [];
      var cur_section_list = "";
      var exist_section_list = false;

      for (var serviceCol of srv_cols) {
        let colName = serviceCol["columns"];
        // if (colName == "id") {
        // continue;
        // }

        if (serviceCol.col_type === "InlineList") {
          this.addInlineListRowButton(serviceCol);
          continue;
        }

        let header = {};
        header.srvcol = serviceCol;
        const fkCols = ["FileList", "Image", "User", "fk", "fks", "fkjsons"]
        if (fkCols.includes(serviceCol["col_type"])) {
          if (serviceCol?.option_list_v2?.obj_info?.a_save_b_obj_col) {
            header._obj_info = serviceCol?.option_list_v2?.obj_info;
          }
        }
        let more_config =
          serviceCol["more_config"] !== null &&
            serviceCol["more_config"] !== undefined &&
            serviceCol["more_config"] !== ""
            ? JSON.parse(serviceCol["more_config"])
            : null;
        let colType = serviceCol["col_type"];
        header["column"] = colName;
        header["label"] = serviceCol["label"];
        header["width"] = "";
        header["show"] = serviceCol["in_list"] === 1;
        header["sortable"] = true;
        header["col_type"] = colType;
        header["list_min_width"] = serviceCol["list_min_width"];
        header["show_option_icon"] =
          serviceCol["more_config"] &&
            JSON.parse(serviceCol["more_config"]).option_icon &&
            JSON.parse(serviceCol["more_config"]).option_icon !== null
            ? JSON.parse(serviceCol["more_config"]).option_icon
            : false;
        header["align"] = this.getColAlign(colType);
        header["format"] =
          serviceCol["more_config"] &&
            JSON.parse(serviceCol["more_config"]).format &&
            JSON.parse(serviceCol["more_config"]).format !== null
            ? JSON.parse(serviceCol["more_config"]).format
            : null;
        header["more_config"] =
          serviceCol["more_config"] && JSON.parse(serviceCol["more_config"])
            ? JSON.parse(serviceCol["more_config"])
            : null;
        header["backgroundMap"] = header["more_config"]?.backgroundMap || false;
        header["styleMap"] = header["more_config"]?.styleMap || false;
        header["colorMap"] = header["more_config"]?.colorMap || false;
        if (more_config !== null && more_config.hasOwnProperty("list_width")) {
          header["width"] = more_config.list_width;
        }
        if (more_config !== null && more_config.hasOwnProperty("rowFixed")) {
          header["rowFixed"] = more_config.rowFixed;
        } else {
          header["rowFixed"] = false;
        }
        if (
          more_config !== null &&
          more_config.hasOwnProperty("onListShowExp")
        ) {
          header["showListExp"] = more_config.onListShowExp;
        }
        if (["Enum", "Dict", "Set"].includes(serviceCol["col_type"])) {
          let filters = [];
          const option_list_v2 = cloneDeep(
            serviceCol["option_list_v2"]?.options ||
            serviceCol["option_list_v2"]
          );
          if (option_list_v2 && Array.isArray(option_list_v2)) {
            for (var item of option_list_v2) {
              filters.push({ text: item["label"], value: item["value"] });
            }
          }
          this.keyValueData[header["column"]] = filters;
          header["filters"] = filters;
        } else if (serviceCol["col_type"] == "Money") {
          this.moneyCols.push(colName);
        } else if (hotTableMetadata[colType]) {
          // 现在会返回_disp字段，不需要查了
          // this.loadHotTableData(hotTableMetadata[colType]);
        }

        let isBuiltinFinder = hotTableMetadata[colType];
        if (!!isBuiltinFinder) {
          serviceCol.option_list_v2 = {
            serviceName: hotTableMetadata[colType].selectService,
            refed_col: hotTableMetadata[colType].valueCol,
            srv_app: hotTableMetadata[colType].srvApp,
          };
        }

        // make link url func
        let isFinder = colType && (colType.startsWith("bx") || isBuiltinFinder);
        let isDisp =
          colType && colType.startsWith("_") && colType.endsWith("_disp");
        let linkUrlFunc = serviceCol.link_url_func;
        if (linkUrlFunc) {
          header.linkUrlFunc = this.createCustomLinkUrlFunc(linkUrlFunc);
        } else if (isFinder || isDisp) {
          let dataColName = isDisp ? dispCol2ValCol(colName) : colName;
          header.linkUrlFunc = createLinkUrlFunc(
            serviceCol.option_list_v2,
            dataColName
          );
        }

        var section_list = serviceCol["section_list"];

        if (
          section_list != undefined &&
          section_list != null &&
          section_list != "" &&
          this.mergeCol
        ) {
          exist_section_list = true;
          var groupHeadr = {};
          cur_section_list = section_list;
          groupHeadr["column"] = section_list;
          groupHeadr["label"] = section_list;
          groupHeadr["width"] = "";
          groupHeadr["show"] = true;
          groupHeadr["sortable"] = false;
          groupHeadr["col_type"] = String;

          var gheaders = this.groupHeaderCols[section_list];

          if (gheaders == undefined || (gheaders == null && gheaders == "")) {
            this.groupHeaders.push(groupHeadr);
          }

          if (gheaders != undefined && gheaders != null && gheaders != "") {
            this.groupHeaderCols[section_list].push(serviceCol);
          } else {
            this.groupHeaderCols[section_list] = [];
            this.groupHeaderCols[section_list].push(serviceCol);
          }
        } else {
          var gheaders = this.groupHeaderCols[cur_section_list];
          if (gheaders != undefined && gheaders != null && gheaders != "") {
            this.groupHeaderCols[cur_section_list].push(serviceCol);
          } else {
            this.groupHeaders.push(header);
            this.groupHeaderCols[header["column"]] = [];
            this.groupHeaderCols[header["column"]].push(serviceCol);
          }
        }
        // 万像不需要这个特性 打包的时候去掉
        // if (
        //   ["Enum", "Set", "Dict"].includes(header.col_type) &&
        //   header?.srvcol?.init_expr
        // ) {
        //   try {
        //     header._default_value = eval(header?.srvcol?.init_expr);
        //     if (
        //       Array.isArray(searchFormCondition) ||
        //       Array.isArray(filterCondition)
        //     ) {
        //       const conditions = searchFormCondition || filterCondition;
        //       if (conditions?.length === 0) {
        //         header._default_value = "";
        //       } else {
        //         let condition = conditions.find(
        //           (item) =>
        //             item.colName === header["column"] &&
        //             ["in", "inset", "eq"].includes(item.ruleType)
        //         );
        //         if (condition?.colName) {
        //           header._default_value = condition?.value || "";
        //         }
        //       }
        //     }
        //   } catch (error) {
        //     console.log(error);
        //   }
        // }
        this.gridHeader.push(wrapHeader(header));
      }

      this.noramlHeaders = this.bxDeepClone(this.gridHeader);

      if (exist_section_list) {
        this.gridHeader = this.groupHeaders;
      } else {
        this.header_view_model = "normal";
      }
    },
    getIsBatchFun(e) {
      // 获取是否有 批量操作功能
      if (e && e.length > 0) {
        let batchs = [];
        batchs = e.filter((item) => {
          if (['batch_delete', 'batch_update', 'batch_approve', 'pay'].includes(item.button_type) &&
            item.permission === true
          ) {
            return item;
          }
        });
        if (batchs.length > 0) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    },
    /**
     *
     * @param forceRefreshV2 强制刷新v2
     * @returns {Promise<void>}
     */
    async initGridData(forceRefreshV2 = false) {
      // console.log("initGridData")
      let gidInfo = new GridInfo();

      this.gridPage.pageSizes = gidInfo.pageSizes;
      this.selection = gidInfo.selection;

      let use_type = this.listType;
      if (
        this.listType == "wait" ||
        this.listType == "mine" ||
        this.listType == "myall" ||
        this.listType == "processed" ||
        this.listType == "all" ||
        this.listType == "userall" ||
        this.listType == "cc"
      ) {
        use_type = "proclist";
      }

      if (this.listType == "procreadlist") {
        use_type = "procreadlist";
      }
      //加载serviceCols
      await this.loadColsV2(
        this.service_name,
        this.mode === 'selectlist' ? this.mode : use_type,
        null,
        this.mainService,
        forceRefreshV2,
      )
        .then((response) => {
          let respData = response.body.data;
          this.listV2Data = cloneDeep(respData);
          this.service_view_name = respData?.service_view_name;
          this.vpageNo = respData.vpage_no;
          let card_cfg_list = respData.card_cfg;
          // 列表的顺序
          if (
            respData.hasOwnProperty("order_columns") &&
            respData.order_columns
          ) {
            this.orderColumn = respData.order_columns;
          }
          // 列表的顺序
          if (respData.hasOwnProperty("cfg_json") && respData.cfg_json) {
            let config = null;
            try {
              config = JSON.parse(respData.cfg_json);
              if (config.hasOwnProperty("sum_row_json")) {
                config = config.sum_row_json;
                this.sumConfig = config;
              }
            } catch (error) {
              new Error("cfg_json" + error);
            }
          }

          // draft_support为true时表示上次操作有保存为草稿
          if (respData.hasOwnProperty("draft_support")) {
            // 获取草稿标记
            this.isDraft = respData["draft_support"];
            if (respData["draft_support"] && respData["draft_tab"]) {
              this.tabsConfig.forEach((item) => {
                if (item.key == "norm") {
                  //  待提交
                  item.label = respData["draft_tab"].normal || item.label;
                } else if (item.key == "draft") {
                  //草稿
                  item.label = respData["draft_tab"].temp || item.label;
                }
              });
            }
            if (this.isDraft) {
              this.loadDraftLength();
            }
            this.$emit("v2-loaded-isDraft", {
              isDraft: respData["draft_support"],
              tab: respData["draft_tab"],
            });
          }

          if (
            card_cfg_list != null &&
            card_cfg_list != undefined &&
            card_cfg_list != "" &&
            this.card_no != null &&
            this.card_no != undefined
          ) {
            for (var card_item of card_cfg_list) {
              let card_no = card_item["card_no"];
              if (card_no == this.card_no) {
                this.card_cfg = card_item;
                break;
              }
            }
          }
          let listData = respData["srv_cols"];
          this.mainTable = respData.main_table;

          //列表的操作按钮
          this.gridButton = respData.gridButton.map((button) =>
            wrapButton(button, "grid")
          );

          this.rowButton = respData.rowButton.map((button) =>
            wrapButton(button, "row")
          );

          if (respData.cfg_json) {
            this.handleCfgJson(respData.cfg_json);
          }
          if (respData.hasOwnProperty("stats_data")) {
            this.statsData = respData.stats_data;
          }

          if (respData.pub_field_map) {
            this.pub_field_map = respData.pub_field_map;
          }

          if (
            respData.more_config &&
            respData.more_config.length > 0 &&
            respData.more_config !== undefined
          ) {
            // service more config 配置 selection 是否为可选择列表，默认为 false
            let moreConfig = JSON.parse(respData.more_config);
            this.moreConfig = moreConfig;
            this.$emit("more-config-loaded", moreConfig);
            if (this.moreConfig.hasOwnProperty("selection")) {
              this.selection = this.moreConfig.selection; // moreConfig 配置有限批量操作 检查
            } else {
              this.selection = this.getIsBatchFun(this.gridButton); // 检查批量操作权限
            }
          } else {
            this.selection = this.getIsBatchFun(this.gridButton); // 检查批量操作权限
          }
          let addButton = this.gridButton.find(
            (item) => item.button_type === "add"
          );
          if (addButton) {
            this.addService = addButton.service_name;
          }

          if (!this.addService) {
            let importButton = this.gridButton.find(
              (item) => item.button_type === "import"
            );
            if (importButton) {
              this.addService = importButton.service_name;
            }
          }

          let updateButton = this.rowButton.find(
            (item) => item.button_type === "edit"
          );
          if (updateButton) {
            this.updateService = updateButton.service_name;
          }

          let deleteButton = this.rowButton.find(
            (item) =>
              item.button_type === "delete" ||
              item.button_type === "batch_delete"
          );

          if (!deleteButton) {
            deleteButton = this.gridButton.find(
              (item) =>
                item.button_type === "delete" ||
                item.button_type === "batch_delete"
            );
          }

          if (deleteButton) {
            this.deleteService = deleteButton.service_name;
          }

          this.srv_cols = listData;
          this.buildGridHeaders(listData);

          if (this.mode === "finder") {
            this.gridButton
              .filter((button) => button.name != "查询")
              .forEach((button) => (button.show = false));
            this.rowButton.forEach((button) => (button.show = false));
          }

          this.setPolling(); // 调用轮询逻辑
        })
        .then((_) => {
          this.listLoaded = true;
          this.initLoad = true;
          this.emitEvent("metadata-loaded", this);
          if (this.listType?.includes('childlist') && Array.isArray(this.memInitdatasAdd) && this.memInitdatasAdd.length) {
            // 子表并且有配置默认数据
            // 拿到列表v2之后重新加载新增、修改的服务列
            this.loadAddUpdateSrvCols?.()
          }
          this.$emit('metadata-loaded', this)
        });

      try {
        if (this.defaultOrder.length > 0) {
          this.order = this.order.concat(this.defaultOrder);
        }
        if (['addchildlist'].includes(this.listType) && Array.isArray(this.memInitdatasAdd) && this.memInitdatasAdd.length) {
          // 有默认数据，不发请求查找默认数据
          this.$emit("list-loaded", this);
        } else {
          this.loadTableData().finally((_) => {
            if (this.defaultInplaceEditMode) {
              this.onInplaceEditClicked();
            }
            this.$emit("list-loaded", this);
          });
        }

        // } else {
        //   this.$emit("list-loaded", this);
        // }

      } catch (e) {
        // handle case in add child list

        this.$emit("list-loaded", this);
        if (this.defaultInplaceEditMode) {
          this.onInplaceEditClicked();
        }
      }

      //默认数据参数填充
      if (this.defDataPara != null) {
        var tar_cfg = this.defDataPara.tar_cfg;
        if (tar_cfg != undefined && tar_cfg != null) {
          var tar_srv = tar_cfg.tar_srv;
          var col_rel = tar_cfg.col_rel;
          if (tar_srv == this.service) {
            let query_srv = this.defDataPara.serviceName;
            let query_condition = this.defDataPara.condition;
            let relationCondition = this.relationCondition;
            const divCond = this.buildDivCond?.();
            await this.select(
              query_srv,
              query_condition,
              null,
              null,
              null,
              null,
              null,
              null,
              null,
              relationCondition,
              null,
              null,
              null,
              null,
              null,
              null,
              divCond
            ).then((response) => {
              var dataResult = response.body.data;
              if (dataResult.length > 0) {
                var dataArray = [];
                for (var itemMap of dataResult) {
                  var temMap = {};
                  for (var key in itemMap) {
                    var tar_col = col_rel[key];
                    if (tar_col != undefined) {
                      temMap[tar_col] = itemMap[key];
                    }
                  }
                  if (this.storageType == "mem") {
                    temMap["_dirtyFlags"] = this.defaultDirtyFlags || add;
                    temMap["_guid"] = this.guid();
                  }
                  dataArray.push(temMap);
                }

                this.gridData = this.gridData.concat(dataArray);
              }


              this.$emit("list-data-loaded", this);
            });
          }
        }
      }
    },

    isLoaded: function () {
      return this.listLoaded;
    },

    getLinkUrl(row, header) {
      let data = row;
      let url = "";
      if (header.linkUrlFunc) {
        url = header.linkUrlFunc(data);
      }

      return url;
    },

    onLinkClicked(row, header) {
      const linkUrl = this.getLinkUrl(row, header)
      if (linkUrl) {
        let tabTitle =
          (header.srvcol &&
            header.srvcol.option_list_v2 &&
            header.srvcol.option_list_v2.service_label) ||
          row[header.column] + "详情";
        this.addTabByUrl(this.getLinkUrl(row, header), tabTitle);
      }
    },

    handleEdit(index, row) {
      let frontTableData = this.$store.getters.getFrontTableData();
      if (frontTableData && frontTableData.selectFillGrid) {
        frontTableData.selectFillGrid = frontTableData.selectFillGrid.map(
          (item) => {
            return item.id === row.id ? row : item;
          }
        );
        this.$store.commit("setFrontTableData", {
          table: "selectFillGrid",
          data: frontTableData.selectFillGrid,
        });
      }
    },

    onInlineListLoaded(row, inlineList) {
      if (this.isInplaceEdit()) {
        inlineList.onInplaceEditClicked();
      }

      // inline lists as map, key as inlinelist.fk, value inlineList.gridData
      let propName = "_inlineLists";
      if (!row.hasOwnProperty(propName)) {
        this.$set(row, propName, {});
      }

      let inlineListsData = row[propName];

      inlineListsData[inlineList.foreignKey.constraint_name] =
        inlineList.gridData;

      this.$emit("inline-list-loaded", inlineList, this);
    },
    getListShowFileList(col) {
      let colItem = col || null;
      if (colItem) {
        let moreConfig = colItem.more_config;
        return moreConfig &&
          moreConfig.hasOwnProperty("append_file_info") &&
          moreConfig.append_file_info
          ? true
          : false;
      } else {
        return false;
      }
    },
    getListFileDatas(col, row) {
      let dipsCol = "_" + col.column + "_disp";
      if (row.hasOwnProperty(dipsCol) && row[dipsCol]) {
        return row[dipsCol];
      } else {
        if (row[col.column]?.indexOf('http') === 0) {
          let file_type = row[col.column].split('.').pop()
          let src_name = row[col.column].split('/').pop()
          return [{ fileurl: row[col.column], file_type, src_name }]
        }
        return [];
      }
    },
    onInlineListaDataChanged: function (row, inlineList) {
      // sync inline list into row data
      let propName = "_inlineLists";
      if (!row.hasOwnProperty(propName)) {
        this.$set(row, propName, {});
      }

      let inlineListsData = row[propName];
      this.$set(
        inlineListsData,
        inlineList.foreignKey.constraint_name,
        inlineList.gridData
      );

      // set row data dirty flags = update
      if (!row._dirtyFlags || row._dirtyFlags === "pristine") {
        this.$set(row, "_dirtyFlags", "update");
      }
    },
    handleScroll: function () {
      let scrollTop = document.documentElement.scrollTop;
      this.scroll = scrollTop;
    },

    onImportClicked: function (e) {
      this.actionGridButton = e;
      this.activeForm = "import";
    },
    onBatchApprove(rows, item) {
      let self = this;
      this.activeForm = "batchApprove";
      if (rows && rows.length > 0) {
        self.approvaList = rows;
      }
      if (item && item.button_type === "batch_approve") {
        let config = item.more_config ? JSON.parse(item.more_config) : null;
        // console.log("more_config",item.more_config,JSON.parse(item.more_config))
        if (config && config.hasOwnProperty("approvalOptions")) {
          self.approvalOptions = config.approvalOptions;
        }
      }
      console.log("onBatchApprove", rows, item);
    },
    onExportClicked(columns, button) {
      // send req to generate excel
      // 导出操作
      console.log("onExportClicked", columns);

      let isProc = false;
      if (
        this.listType == "wait" ||
        this.listType == "mine" ||
        this.listType == "myall" ||
        this.listType == "processed" ||
        this.listType == "all" ||
        this.listType == "userall"
      ) {
        isProc = this.listType;
      }
      const relationCondition =
        this.$parent?.$refs?.filterTabs?.buildConditions?.();
      var loading = this.openLoading();
      const service = button?.operate_service || this.service_name
      this.genExportExcel(
        service,
        this.buildQueryConditions(),
        null,
        this.order,
        null,
        null,
        isProc,
        columns,
        relationCondition
      ).then((response) => {
        loading.close();
        var uuid = response.body.data.uuid;
        this.downloadexport(uuid);
      });
    },

    onImportDialogClosed() {
      this.activeForm = "xx";
      this.loadTableData();
    },
    onExportDialogClosed() {
      this.activeForm = "xx";
      this.loadTableData();
    },
    isRowButtonVisible(button, row, index) {
      // if(button['_rowDisp']){
      //   return button['_rowDisp'][index]===1
      // }
      if (button.button_type !== "_btn_group") {
        let notDeleteOnStandby = !(
          "standby" === row._dirtyFlags && "delete" === button.button_type
        );
        let noUpdateDetail4InplaceEdit = !(
          this.isInplaceEdit() &&
          (button.button_type === "update" || button.button_type === "detail")
        );
        return (
          notDeleteOnStandby &&
          noUpdateDetail4InplaceEdit &&
          button.evalVisible(row)
        );
      } else {
        return true;
      }
    },

    onPopupMemListClick(row, button) {
      this.activeForm = "manageChildList";
      this.activeRow4PopupMemList = row;
      this.activePopupMemList = button;
    },

    onPopupMemListLoaded(popupMemList) {
      let fk = this.activePopupMemList.foreign_key;
      popupMemList.setGridData(
        this.activeRow4PopupMemList._inlineLists[fk.constraint_name],
        this.activeRow4PopupMemList
      );
      popupMemList.setEditMode(true);
    },
    isFkJson(row, col) {
      let isFkJson = false;
      if (col && col.srvcol && col.srvcol.col_type) {
        isFkJson =
          ["fks", "fkjson", "fkjsons"].indexOf(col.srvcol.col_type) > -1;
      }
      return isFkJson;
    },
    getFkJson(row, col) {
      let val = "";
      let result = [];
      if (row && col && col.column && row[col.column]) {
        val = row[col.column];
      }
      let colType = "";
      if (col && col.srvcol && col.srvcol.col_type) {
        colType = col.srvcol.col_type;
      }
      let fmt = col && col.srvcol && col.srvcol.fmt;
      let valueCol = fmt && fmt.primary_col;
      let dispCol = fmt && fmt.disp_col;
      if (
        col?._obj_info?.a_save_b_obj_col &&
        row[col?._obj_info?.a_save_b_obj_col]
      ) {
        let str = row[col?._obj_info?.a_save_b_obj_col];
        try {
          let arr = JSON.parse(str);
          if (Array.isArray(arr)) {
            result = arr;
          } else {
            result = [arr];
          }
        } catch (error) {
          console.log(error);
        }
        if (Array.isArray(result) && result.length > 0) {
          result = result.map(item => {
            if (!item[dispCol] && !item[valueCol] && item.label && item.value) {
              item[dispCol] = item.label
              item[valueCol] = item.value
            }
            return item
          })
          result = result.map((item) => item[dispCol] || item[valueCol]);
        }
      }
      if (!result || (result && result.length === 0)) {
        switch (colType) {
          case "fks":
            result = val ? val.split(",") : [];
            break;
          case "fkjson":
            try {
              result = val ? JSON.parse(val) : {};
            } catch (error) {
              console.log(error);
            }
            if (result && result[dispCol]) {
              result = [result[dispCol] || result[valueCol]];
            }
            break;
          case "fkjsons":
            try {
              result = val ? JSON.parse(val) : [];
            } catch (error) { }
            if (Array.isArray(result) && result.length > 0) {
              result = result.map((item) => item[dispCol] || item[valueCol]);
            }
            break;
        }
      }
      return result;
    },
    buildStatsData(statsData) {
      let datas = statsData || [];
      let heads = this.gridData;
      for (let data of datas) {
        if (data.col_type == "Money") {
          // this.$set(data,'value',DataUtil.formatMoney(''+ data.value))
          // console.log(data.value,DataUtil.formatMoney(''+ data.value))
          data.value = DataUtil.formatMoney("" + data.value);
        }
      }
      return datas;
    },

    // 树形结构相关方法
    toggleIconShow(record) {
      return record.is_leaf === "否";
    },

    async toggle(rowData) {
      let me = this;
      const noCol = this.listV2Data["no_col"];
      const parentCol = this.listV2Data["parent_no_col"];

      let childLen = !rowData._children ? 0 : rowData._children.length;

      if (rowData._expanded) {
        this.removeChildValue(rowData);
      } else {
        if (rowData._children && rowData._children.length > 0) {
          for (var item of rowData._children) {
            if (!rowData["_checked"]) {
              item["_checked"] = false;
              item["_indeterminate"] = false;

              if (item.is_leaf == "否") {
                item._expanded = false;
              }
            }
            me.gridData.splice(me.gridData.indexOf(rowData) + 1, 0, item);
          }
        } else {
          // 设置loading状态
          this.$set(this.treeNodeLoadingMap, rowData.id + "", true);

          var childData = [];
          var childCondition = [
            {
              colName: parentCol,
              value: rowData[noCol],
              ruleType: "eq",
            },
          ];

          try {
            await this.select(
              this.service_name,
              childCondition,
              {
                pageNo: 1,
                rownumber: 300,
              },
              this.order,
              null,
              null,
              null,
              null,
              null,
              null,
              null,
              null,
              null,
              this.vpageNo,
              "treelist"
            ).then((response) => {
              if (response.body.resultCode == "0011") {
                this.$store.commit("clearSrvCols");
                this.vpageNo = null;
                return;
              }
              this.buildTreeData(response.body.data, false);
              childData = response.body.data;
            });

            var data = me.setSpaceIcon(childData, rowData._level);
            rowData._children = this.bxDeepClone(data);

            let i = 0;
            for (var item of rowData._children) {
              if (rowData["_checked"]) {
                item["_checked"] = true;
              }
              me.gridData.splice(me.gridData.indexOf(rowData) + i + 1, 0, item);
              i++;
            }
          } finally {
            // 清除loading状态
            this.$set(this.treeNodeLoadingMap, rowData.id + "", false);
          }
        }

        if (rowData._children && rowData._children.length > 0) {
          rowData._children.forEach((item) => {
            if (this.unfoldDataMap[item.id] === true) {
              this.toggle(item);
            }
          });
        }
      }

      rowData._expanded = !rowData._expanded;
      this.$set(this.unfoldDataMap, rowData.id + "", rowData._expanded);
    },

    removeChildValue(rowData) {
      const noCol = this.listV2Data["no_col"];
      const parentCol = this.listV2Data["parent_no_col"];
      var me = this;
      let dataArr = [];
      let childLen = rowData._children.length;
      dataArr.push(rowData);
      let arr = me.getChildFlowId(dataArr, []);

      for (let i = 0; i < childLen; i++) {
        if (rowData._children[i]._children != undefined) {
          var _len = rowData._children[i]._children.length;
          if (_len > 0) {
            this.removeChildValue(rowData._children[i]);
          }
        }

        me.gridData.map((value) => {
          if (
            arr.indexOf(value[parentCol]) > -1 &&
            !value["_level_node"]
          ) {
            this.$set(this.unfoldDataMap, value.id + "", false);
            this.removeByValue(me.gridData, value);
          }
        });
      }
    },

    getChildFlowId(data, emptyArr) {
      const noCol = this.listV2Data["no_col"];
      let me = this;
      Array.from(data).forEach((record) => {
        emptyArr.push(record[noCol]);
        if (record._children && record._children.length > 0) {
          let childFlowIdArr = me.getChildFlowId(record._children, emptyArr);
          emptyArr.concat(childFlowIdArr);
        }
      });
      return emptyArr;
    },

    setSpaceIcon(data, level) {
      let me = this;
      let _level = 0;
      data.forEach((value) => {
        value._expanded = false;
        if (level !== undefined && level !== null) {
          _level = level + 1;
        } else {
          _level = 1;
        }
        value._level = _level;
        if (value._children && value._children.length > 0) {
          me.setSpaceIcon(value._children, _level);
        }
      });
      return data;
    },

    buildTreeData(data, _level_node) {
      if (!data) {
        return;
      }
      for (var item of data) {
        item._checked = false;
        item._indeterminate = false;
        item._level_node = _level_node;
        if (item.is_leaf == "否") {
          item._children = [];
        }
        if (item._children && item._children.length > 0) {
          this.buildTreeData(item._children, false);
        }
      }
    },

    removeByValue(sourceData, val) {
      for (var i = 0; i < sourceData.length; i++) {
        if (sourceData[i] == val) {
          sourceData.splice(i, 1);
          break;
        }
      }
    },

    /**
     * 计算文本宽度（优化版本）
     * @param {string} text 文本内容
     * @param {string} fontSize 字体大小
     * @param {string} fontFamily 字体族
     * @returns {number} 文本宽度（像素）
     */
    getTextWidth(text, fontSize = '14px', fontFamily = 'Arial') {
      if (!text) return 0;

      // 使用更精确的字体配置
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      context.font = `${fontSize} ${fontFamily}`;

      // 考虑中文字符的宽度差异
      const width = context.measureText(text).width;

      // 为中文字符添加额外的宽度补偿
      const chineseCharCount = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
      const extraWidth = chineseCharCount * 2; // 中文字符通常更宽

      return Math.ceil(width + extraWidth);
    },

    /**
     * 获取实际可见的行按钮
     * @returns {Array} 可见的按钮数组
     */
    getVisibleRowButtons() {
      if (!this.sortedRowButtons || this.sortedRowButtons.length === 0) {
        return [];
      }

      // 如果没有数据，返回所有按钮
      if (!this.gridData || this.gridData.length === 0) {
        return this.sortedRowButtons;
      }

      // 只返回在当前数据中至少有一行可见的按钮
      return this.sortedRowButtons.filter(button => {
        return this.gridData.some((row, index) =>
          this.getDispExps(button, row, index) &&
          this.isRowButtonVisible(button, row, index)
        );
      });
    },
  },

  created: function () {
    if (this.$route && this.$route.params) {
      if (this.isListTopComp() && this.$route.params.service_name) {
        this.service_name = this.service || this.$route.params.service_name;
      }
      if (this.isListTopComp() && this.$route.params.card_no) {
        this.card_no = this.$route.params.card_no;
      }
    }
    /**
     * 1014 邓旭升需求，此处变更
     */
    if (this.isListTopComp() && this.$route && this.$route.query) {
      // if (this.$route && this.$route.query) {
      var operate_params = this.getOperateParams();
      if (
        operate_params != "" &&
        operate_params != null &&
        this.listType?.indexOf("childlist") === -1
      ) {
        var operate_Object = JSON.parse(operate_params);
        // this.service_name = operate_Object["serviceName"] ;
        if (typeof operate_Object === "object") {
          this.service_name =
            operate_Object?.serviceName ||
            this.service ||
            this.service_name ||
            this.$route.params.service_name;
          if (
            operate_Object["condition"] != undefined &&
            operate_Object["condition"] != null
          ) {
            this.custCondition = operate_Object["condition"];
          }
        }
      } else {
        this.service_name = this.service || this.service_name; // this.service list 组件 props service 优先使用
      }
      var selectType = this.$route.query.selectType;
      if (selectType != undefined && selectType != "" && selectType != null) {
        this.defaultapi = "selectByUser";
      }
    }
    // if (this.listType !== "treelist") {
    this.initGridData();
    // }

    if (this.card_no != undefined) {
      this.gridPage.pageSize = 12;
      this.gridPage.pageSizes.push(12);
    }
    if (this.pageSize != undefined) {
      this.gridPage.pageSize = this.pageSize;
    }

    this.uid = this._uid;
    window.list = window.list || {};
    window.list[this.service_name] = this;
  },
};
