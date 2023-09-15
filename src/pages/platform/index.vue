<template>
  <div class="page-bg">
    <div class="platform-home-wrap">
      <div class="static-box">
        <div class="static-item" v-for="item in tabs" :key="item.name">
          <img
            src="@/pages/platform/static/riFill-hotel-fill@1x.png"
            alt=""
            class="icon"
          />
          <div class="name">{{ item.name }}</div>
          <div class="num">
            {{ item.count || "-" }}
            <!-- <el-statistic :value="item.count"> </el-statistic> -->
          </div>
          <div class="unit">{{ item.unit || "家" }}</div>
        </div>
      </div>
      <div class="list-box">
        <el-tabs v-model="activeTab" @tab-click="handleClick">
          <el-tab-pane
            :label="'入驻' + item.name + '列表'"
            :name="item.name"
            v-for="item in tabs"
            :key="item.name"
          >
            <el-table
              :header-cell-style="{
                background: '#f0f3f9',
                padding: '4px 8px!important',
              }"
              :cell-style="{ padding: '4px!important' }"
              class="el-table"
              :data="item.data"
              style="width: 100%"
            >
              <el-table-column
                :prop="column.columns"
                :label="column.label"
                v-for="column in item.columns || []"
              >
                <template slot-scope="scope">
                  <div class="table-cell">
                    <span v-if="isFkJson(scope.row, column)">
                      <el-tag
                        style="margin-right: 4px; margin-bottom: 2px"
                        size="mini"
                        :type="['', 'success', 'warning', 'danger'][tIndex % 4]"
                        v-for="(tag, tIndex) in getFkJson(scope.row, column)"
                        :key="tIndex"
                        >{{ tag || "" }}</el-tag
                      >
                    </span>
                    <span v-else>
                      {{ scope.row[column.columns] }}
                    </span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column width="120" label="操作">
                <template slot-scope="scope">
                  <el-button
                    size="mini"
                    type="info"
                    v-if="curDetailBtn"
                    @click="toDetail(scope.row)"
                    >详情</el-button
                  >
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </div>
      <el-pagination
        background
        layout="prev, pager, next"
        :total="currentPage.total"
        @current-change="changePage"
      >
      </el-pagination>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      tableData: [
        {
          date: "2016-05-02",
          name: "王小虎",
          address: "上海市普陀区金沙江路 1518 弄",
        },
        {
          date: "2016-05-04",
          name: "王小虎",
          address: "上海市普陀区金沙江路 1517 弄",
        },
        {
          date: "2016-05-01",
          name: "王小虎",
          address: "上海市普陀区金沙江路 1519 弄",
        },
        {
          date: "2016-05-03",
          name: "王小虎",
          address: "上海市普陀区金沙江路 1516 弄",
        },
      ],
      activeTab: "园区",
      tabs: [
        {
          name: "园区",
          unit: "家",
          app: "lpark",
          service: "srvpark_park_info_all_select",
          countService: "srvpark_park_info_count_select",
          data: [],
          columns: [],
          page: {
            pageNo: 1,
            total: 0,
            rownumber: 10,
          },
          count: 0,
        },
        {
          name: "商家",
          unit: "家",
          app: "mer",
          service: "srvbu_store_info_all_select",
          countService: "srvbu_store_info_count_select",
          columns: [],
          data: [],
          page: {
            pageNo: 1,
            total: 0,
            rownumber: 10,
          },
          count: 0,
        },
        {
          name: "物流",
          unit: "家",
          app: "lgs",
          service: "srvwuliu_carrier_all_select",
          countService: "srvwuliu_carrier_count_select",
          columns: [],
          data: [],
          page: {
            pageNo: 1,
            total: 0,
            rownumber: 10,
          },
          count: 0,
        },
        {
          name: "政府",
          unit: "家",
          app: "govt",
          service: "srvgov_organ_all_select",
          countService: "srvgov_organ_count_select",
          columns: [],
          data: [],
          page: {
            pageNo: 1,
            total: 0,
            rownumber: 10,
          },
          count: 0,
        },
        {
          name: "金融",
          unit: "家",
          app: "fin",
          service: "srvfin_service_provider_select",
          columns: [],
          data: [],
          page: {
            pageNo: 1,
            total: 0,
            rownumber: 10,
          },
          count: 0,
        },
      ],
    };
  },
  computed: {
    currentTabIndex() {
      return this.tabs.findIndex((item) => item.name === this.activeTab);
    },
    currentTab() {
      return this.currentTabIndex > -1 ? this.tabs[this.currentTabIndex] : {};
    },
    currentPage() {
      return this.currentTab?.page || {};
    },
    curDetailBtn() {
      return this.currentTab.rowButton?.find((item) => item.button_type == "detail");
    },
  },
  mounted() {
    this.getAllCount();
  },
  methods: {
    toDetail(row) {
      if (this.curDetailBtn) {
        const url = `/vpages/index.html#/detail/${this.currentTab.service}/${row.id}?srvApp=${this.currentTab.app}`;
        var exeservice = this.curDetailBtn?.operate_service || this.curDetailBtn.service_name;
        var tab_title = this.curDetailBtn.service_view_name;
        var urlParams =
          "/" + exeservice + "/" + row.id + "?srvApp=" + this.currentTab.app; //跳转
        var disp_col = this.curDetailBtn?._disp_col;
        var disp_value = row[disp_col]; //详情页面上的标签
        tab_title = tab_title.replace("查询", "");
        if (disp_value != null && disp_value != undefined && disp_value != "") {
          tab_title = disp_value + "(" + tab_title + "详情)";
        } else {
          tab_title = tab_title + "详情";
        }
        this.addTab("detail", urlParams, tab_title, null, this.curDetailBtn);
      }

      // this.addTabByUrl(url,`${this.currentTab}`)
    },
    changePage(num) {
      const item = this.tabs[this.currentTabIndex];
      item.page.pageNo = num;
      this.$set(this.tabs, this.currentTabIndex, item);
      this.getTableData(item, this.currentTabIndex).then((res) => {
        if (res?.data) {
          this.$set(item, "data", res.data);
          this.$set(item, "page", res.page);
        }
      });
    },
    isFkJson(row, col) {
      let isFkJson = false;
      if (col && col && col.col_type) {
        isFkJson = ["fks", "fkjson", "fkjsons"].includes(col.col_type);
      }
      return isFkJson;
    },
    getFkJson(row, col) {
      let val = "";
      let result = [];
      if (row && col && col.columns && row[col.columns]) {
        val = row[col.columns];
      }
      let colType = "";
      if (col && col && col.col_type) {
        colType = col.col_type;
      }
      let fmt = col && col && col.fmt;
      let valueCol = fmt && fmt.primary_col;
      let dispCol = fmt && fmt.disp_col;
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
          } catch (error) {}
          if (Array.isArray(result) && result.length > 0) {
            result = result.map((item) => item[dispCol] || item[valueCol]);
          }
          break;
      }
      return result;
    },
    getTableData(item) {
      const req = {
        serviceName: item.service,
        colNames: ["*"],
        page: { pageNo: item.page.pageNo, rownumber: item.page.rownumber },
      };
      const url = `${window.backendIpAddr}/${item.app}/select/${item.service}`;
      return this.$http.post(url, req).then((res) => {
        if (res?.data?.state === "SUCCESS") {
          return res.data;
        }
      });
    },
    async getAllCount() {
      for (let i = 0; i < this.tabs.length; i++) {
        let item = this.tabs[i];
        if (item.countService) {
          const req = {
            serviceName: item.countService,
            colNames: ["*"],
            page: { pageNo: 1, rownumber: 10 },
          };
          const url = `${window.backendIpAddr}/${item.app}/select/${item.countService}`;
          const res = await this.$http.post(url, req);
          if (res?.data?.data?.length) {
            const resData = res.data.data[0];
            item = { ...item, ...resData };
            this.$set(this.tabs, i, item);
          }
        }
        if (item.service) {
          const res = await this.getTableData(item, i);
          if (res?.data) {
            this.$set(item, "data", res.data);
            this.$set(item, "page", res.page);
          }
          const v2Req = {
            serviceName: "srvsys_service_columnex_v2_select",
            colNames: ["*"],
            condition: [
              {
                colName: "service_name",
                value: item.service,
                ruleType: "eq",
              },
              { colName: "use_type", value: "list", ruleType: "eq" },
            ],
            order: [{ colName: "seq", orderType: "asc" }],
          };
          const v2Url = `${window.backendIpAddr}/${item.app}/select/srvsys_service_columnex_v2_select?colsel_v2=${item.service}`;
          this.$http.post(v2Url, v2Req).then((res) => {
            if (res?.data?.data?.srv_cols?.length) {
              this.$set(
                item,
                "columns",
                res.data.data.srv_cols.filter((col) => col.in_list === 1)
              );
              this.$set(item, "rowButton", res.data.data.rowButton);
              this.$set(item, "gridButton", res.data.data.gridButton);
            }
          });
        }
      }
    },
    handleClick(e) {},
  },
};
</script>

<style lang="scss" scoped>
.page-bg {
  background-color: #f1f2f7;
  padding: 32px;
  width: 100vw;
  height: 100vh;
  overflow-y: auto;
}
.platform-home-wrap {
  border-radius: 8px;
  padding: 28px;
  background-color: #ffffff;
  //   height: 100%;
  min-height: 100%;
  //   overflow-y: auto;
  display: flex;
  flex-direction: column;
  text-align: right;
  .static-box {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    .static-item {
      flex: 1;
      margin: 0 8px;
      background-color: #f4f6f9;
      display: flex;
      align-items: center;
      padding: 25px 23px;
      border-radius: 8px;
      min-width: 240px;
      max-width: 20%;
      margin-bottom: 20px;

      // &:first-child {
      //   margin-left: 0;
      // }
      .name {
        flex: 1;
        padding: 0 20px;
        font-size: 20px;
        color: #000;
        text-align: left;
      }
      .icon {
        background-color: #007aff;
        width: 40px;
        height: 40px;
        padding: 10px;
        border-radius: 50%;
      }
      .num {
        color: #007aff;
        margin: 0 12px;
        font-size: 20px;
        font-weight: bold;
      }
      .unit {
        color: #8e8e93;
      }
    }
  }
  .list-box {
    flex: 1;
    padding-bottom: 20px;
    .table-cell {
      //   min-height: 32px;
      display: flex;
      align-items: center;
    }
  }

  .el-table {
    border: 1px solid #ebeef5;
    border-bottom: none;
  }
  ::v-deep .el-pagination.is-background .el-pager {
    li:not(.disabled):hover {
      color: #333;
      font-weight: bold;
      font-size: 18px;
    }
    li:not(.disabled).active {
      background-color: #333;
      color: #fff;
    }
  }
}
</style>
