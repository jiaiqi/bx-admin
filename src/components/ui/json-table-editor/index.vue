<template>
  <div class="spreadsheet" ref="spreadsheetRef">
    <div class="flex items-center text-sm p-x-2">
      <div class="flex items-center text-sm p-2">
        <div class="mr-2">添加</div>
        <el-input-number size="mini" v-model="insertRowNumber" />
        <div class="mx-2">行</div>
        <el-button
          class="icon-button"
          title="添加(ctrl + 加号键)"
          size="mini"
          type="primary"
          @click="batchInsertRows"
          :disabled="insertRowNumber === 0"
        >
          <i class="el-icon-plus"></i>
        </el-button>
        <el-button
          class="icon-button"
          :title="isFullScreen ? '退出全屏' : '全屏编辑'"
          size="mini"
          @click="fullScreenEdit"
          :icon="isFullScreen ? 'el-icon-close' : 'el-icon-full-screen'"
        >
        </el-button>
      </div>
      <!-- <div class="flex items-center text-sm p-x-2 ml-5">
        <div class="mr-2">添加</div>
        <el-input-number size="mini" v-model="insertColumnNumber" />
        <div class="mx-2">列</div>
        <el-button
          class="icon-button"
          title="添加(ctrl + 加号键)"
          size="mini"
          type="primary"
          @click="batchInsertCols"
          :disabled="insertColumnNumber === 0"
        >
          <i class="el-icon-plus"></i>
        </el-button>
      </div> -->
    </div>
    <ve-table
      style="word-break: break-word; flex: 1"
      :cellStyleOption="cellStyleOption"
      :scroll-width="0"
      :show-header="false"
      :max-height="maxHeight"
      border-y
      :columns="columns"
      :table-data="tableData"
      row-key-field-name="rowKey"
      :virtual-scroll-option="virtualScrollOption"
      :cell-autofill-option="cellAutofillOption"
      :edit-option="editOption"
      :row-style-option="rowStyleOption"
      :column-width-resize-option="columnWidthResizeOption"
    />
  </div>
</template>

<script>
import Vue from "vue";
import cloneDeep from "lodash/cloneDeep";
// 引入样式
import "vue-easytable/libs/theme-default/index.css";
// 引入组件库
import VueEasytable from "vue-easytable";

Vue.use(VueEasytable);
const ALL_COLUMN_KEYS = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
];
const COLUMN_KEYS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
export default {
  props: {
    maxHeight: {
      type: Number,
      default: 300,
    },
    field: {
      type: Object,
      default: () => {
        return {};
      },
    },
    value: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      isFullScreen: false,
      insertRowNumber: 1,
      insertColumnNumber: 1,
      // start row index
      startRowIndex: 0,
      cellStyleOption: {
        bodyCellClass: ({ row, column, rowIndex }) => {
          if (rowIndex === 0) {
            return "first-row";
          }
        },
      },
      columnWidthResizeOption: {
        enable: true,
      },
      virtualScrollOption: {
        // 是否开启
        enable: false,
        scrolling: this.scrolling,
      },
      cellAutofillOption: {
        directionX: true,
        directionY: true,
        beforeAutofill: ({
          direction,
          sourceSelectionRangeIndexes,
          targetSelectionRangeIndexes,
          sourceSelectionData,
          targetSelectionData,
        }) => {},
        afterAutofill: ({
          direction,
          sourceSelectionRangeIndexes,
          targetSelectionRangeIndexes,
          sourceSelectionData,
          targetSelectionData,
        }) => {},
      },
      // edit option 可控单元格编辑
      editOption: {
        beforeCellValueChange: ({ row, column, changeValue }) => {},
        afterCellValueChange: ({ row, column, changeValue }) => {
          let json = this.tableData2json();
          this.$emit("input", JSON.stringify(json));
          this.$emit("change");
        },
      },
      // contextmenu header option
      contextmenuHeaderOption: {
        /*
                  before contextmenu show.
                  In this function,You can change the `contextmenu` options
                  */
        beforeShow: ({
          isWholeColSelection,
          selectionRangeKeys,
          selectionRangeIndexes,
        }) => {
          //
        },
        // after menu click
        afterMenuClick: ({
          type,
          selectionRangeKeys,
          selectionRangeIndexes,
        }) => {
          //
        },

        // contextmenus
        contextmenus: [
          {
            type: "CUT",
          },
          {
            type: "COPY",
          },
          {
            type: "SEPARATOR",
          },
          {
            type: "EMPTY_COLUMN",
          },
          {
            type: "SEPARATOR",
          },
          {
            type: "LEFT_FIXED_COLUMN_TO",
          },
          {
            type: "CANCEL_LEFT_FIXED_COLUMN_TO",
          },
          {
            type: "RIGHT_FIXED_COLUMN_TO",
          },
          {
            type: "CANCEL_RIGHT_FIXED_COLUMN_TO",
          },
        ],
      },

      // contextmenu body option
      contextmenuBodyOption: {
        /*
                  before contextmenu show.
                  In this function,You can change the `contextmenu` options
                  */
        beforeShow: ({
          isWholeRowSelection,
          selectionRangeKeys,
          selectionRangeIndexes,
        }) => {
          console.log("---contextmenu body beforeShow--");
          console.log("isWholeRowSelection::", isWholeRowSelection);
          console.log("selectionRangeKeys::", selectionRangeKeys);
          console.log("selectionRangeIndexes::", selectionRangeIndexes);
        },
        // after menu click
        afterMenuClick: ({
          type,
          selectionRangeKeys,
          selectionRangeIndexes,
        }) => {
          console.log("---contextmenu body afterMenuClick--");
          console.log("type::", type);
          console.log("selectionRangeKeys::", selectionRangeKeys);
          console.log("selectionRangeIndexes::", selectionRangeIndexes);
        },

        contextmenus: [
          {
            type: "CUT",
          },
          {
            type: "COPY",
          },
          {
            type: "SEPARATOR",
          },
          {
            type: "INSERT_ROW_ABOVE",
          },
          {
            type: "INSERT_ROW_BELOW",
          },
          {
            type: "SEPARATOR",
          },
          {
            type: "REMOVE_ROW",
          },
          {
            type: "EMPTY_ROW",
          },
          {
            type: "EMPTY_CELL",
          },
        ],
      },
      rowStyleOption: {
        clickHighlight: false,
        hoverHighlight: false,
      },
      tableData: [],
    };
  },
  computed: {
    columns() {
      let columns = [
        {
          field: "index",
          key: "index",
          // is operation column
          operationColumn: true,
          title: "",
          width: 55,
          fixed: "left",
          renderBodyCell: this.renderRowIndex,
        },
      ];
      columns = columns.concat(
        COLUMN_KEYS.map((keyValue) => {
          return {
            title: keyValue,
            field: keyValue,
            key: keyValue,
            width: 150,
            edit: true,
          };
        })
      );

      return columns;
    },
    getTableData() {
      return this.tableData2json(this.tableData);
    },
  },
  watch: {
    value: {
      immediate: true,
      deep: true,
      handler(newValue, oldValue) {},
    },
  },
  methods: {
    fullScreenEdit() {
      console.log("fullScreenEdit");
      const element = this.$refs.spreadsheetRef;
      if (element) {
        // 调用全屏接口
        if (document.fullscreenElement === null) {
          console.log("全屏");
          this.maxHeight = 9999;
          this.isFullScreen = true;
          element.requestFullscreen();
        } else {
          console.log("退出全屏");
          this.maxHeight = 300;
          this.isFullScreen = false;
          document.exitFullscreen();
        }
      }
    },
    tableData2json() {
      // 提取第一行作为 key
      const data = cloneDeep(this.tableData);
      if (!data || data.length === 0) return [];
      const firstRow = data[0];
      const columns = [];
      COLUMN_KEYS.forEach((key) => {
        if (firstRow[key]) {
          columns.push({
            column: firstRow[key],
            key: key,
          });
        }
      });
      const otherData = data.slice(1);
      const jsonData = otherData.map((row) => {
        const rowData = {};
        columns.forEach(({ column, key }) => {
          rowData[column] = row[key];
        });
        return rowData;
      });
      return jsonData;
    },
    json2tableData(data) {
      if (Array.isArray(data) && data.length > 0) {
        const columns = Object.keys(data[0]);
        const firstRow = {
          rowKey: new Date().getTime(),
        };
        columns.forEach((column, index) => {
          firstRow[COLUMN_KEYS[index]] = column;
        });
        const otherData = data.map((row, index) => {
          const rowData = {
            rowKey: index,
          };
          columns.forEach((column, index) => {
            rowData[COLUMN_KEYS[index]] = row[column];
          });
          return rowData;
        });
        const tableData = [firstRow, ...otherData];
        console.log("json2tableData", tableData);

        return tableData;
      }
    },
    batchInsertCols() {
      console.log("batchInsertCols");
      if (this.insertColumnNumber === 0) return;
      let columnLength = this.columns.length;
      for (let i = 0; i < this.insertColumnNumber; i++) {
        let columnKey = ALL_COLUMN_KEYS[columnLength - 1 + i];
        COLUMN_KEYS.push(columnKey);
        this.columns.push({
          title: columnKey,
          field: columnKey,
          key: columnKey,
          width: 150,
          edit: true,
        });
        this.tableData.forEach((item) => {
          item[columnKey] = "";
        });
      }
    },
    batchInsertRows() {
      if (this.insertRowNumber === 0) return;
      let tableLength = this.tableData.length;
      for (let i = 0; i < this.insertRowNumber; i++) {
        let dataItem = {
          rowKey: tableLength + i,
        };

        COLUMN_KEYS.forEach((keyValue) => {
          dataItem[keyValue] = "";
        });

        this.tableData.push(dataItem);
      }
    },
    // render row index
    renderRowIndex({ row, column, rowIndex }) {
      if (rowIndex === 0) {
        return <span></span>;
      }
      return <span>{rowIndex + this.startRowIndex}</span>;
    },
    scrolling({
      startRowIndex,
      visibleStartIndex,
      visibleEndIndex,
      visibleAboveCount,
      visibleBelowCount,
    }) {
      this.startRowIndex = startRowIndex;
    },
    initTableData() {
      let tableData = [];
      for (let i = 0; i < 30; i++) {
        let dataItem = {
          rowKey: i,
        };

        COLUMN_KEYS.forEach((keyValue) => {
          dataItem[keyValue] = "";
        });

        tableData.push(dataItem);
      }

      this.tableData = tableData;
    },
  },
  created() {
    // this.initTableData();
    if (this.value) {
      if (JSON.stringify(this.value) !== JSON.stringify(this.tableData)) {
        this.tableData = this.json2tableData(JSON.parse(this.value));
      }
    } else if (!this.value) {
      this.initTableData();
    }
  },
};
</script>
<style lang="scss">
.spreadsheet {
  padding: 0;
  margin: 0;
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  background-color: #fff;
  .el-input.el-input--mini input {
    padding: 0 35px !important;
  }
  .ve-table {
    .ve-table-body-td {
      padding: 2px 5px !important;
      // height: unset !important;
      // line-height: unset !important;
      &.first-row {
        background-color: #fafafa !important;
      }
    }
    .ve-table-body-tr {
      // height: unset !important;
    }
  }
}
</style>
