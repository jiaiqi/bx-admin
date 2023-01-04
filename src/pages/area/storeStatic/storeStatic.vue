<template>
  <div class="ll-content">
    <div class="parent-content">
      <slot name="name"></slot>
      <slot name="name2"></slot>

      <el-card shadow="always">
        <!-- allow_input: "下拉选择",
                is_tree: true,
                key_disp_col: "category_name",
                parent_col: "parent_no",
                refed_col: "category_no",
               serviceName: "srvpark_stockroom_category_select" -->

        <filterColumn
          v-if="tableInfo"
          :filterColumn="filterColumn"
          :tableInfo="tableInfo"
          @search="search"
        ></filterColumn>
        <div class="c-border"></div>

        <div v-if="Object.keys(objData).length > 0">
          <div :key="key" v-for="(val, key) in objData" class="block-content">
            <div
              style="
                height: 30px;
                display: flex;
                align-items: center;
                font-weight: 800;
              "
              class="custom-title"
            >
              <span style="margin-left: 17px">{{ key }}</span>
            </div>
            <div class="bottom-content">
              <el-row :gutter="24">
                <el-col :key="item.key" v-for="item in val" :span="6">
                  <div
                    style="
                      color: white;
                      border-radius: 4px;
                      background-color: rgba(99, 129, 234, 1);
                      width: 100%;
                    "
                    :class="`custom-card flex-column-between ${item.background}`"
                  >
                    <div class="height-row top flex-between">
                      <div class="left">
                        <span
                          style="
                            margin-right: 15px;
                            color: rgba(255, 255, 255, 1);
                            font-size: 16px;
                            text-align: right;
                            font-family: SourceHanSansSC-regular;
                          "
                        >
                          {{ item.category_name }}
                        </span>
                        <span
                          style="
                            color: rgba(255, 255, 255, 1);
                            font-size: 19px;
                            font-weight: 800;
                          "
                        >
                          {{ item.category_no }}
                        </span>
                      </div>

                      <div class="right">
                        <div
                          style="
                            height: 22px;
                            width: 28px;
                            border-radius: 3px;
                            height: 20px;
                            width: 20px;
                            background-color: rgba(255, 255, 255, 1);
                            color: rgba(77, 95, 204, 1);
                          "
                          class="button-tag flex-center"
                        >
                          {{ item.rent_status == "已租" ? "租" : "空" }}
                        </div>
                      </div>
                    </div>

                    <div class="height-row middle flex-between">
                      <div style="font-size: 20px" class="left">
                        <span v-if="item.rent_status != '空置'">
                          {{ item.rent_store_name }}</span
                        >
                        <span v-else> 未租售</span>
                      </div>
                      <div class="right over-progress">
                        <el-progress
                          v-if="item.rent_status != '空置'"
                          color="white"
                          text-color="black"
                          define-back-color="yellow"
                          style="width: 80px"
                          :text-inside="true"
                          :stroke-width="26"
                          :percentage="70"
                        >
                        </el-progress>
                      </div>
                    </div>

                    <div
                      style="font-weight: 700"
                      class="height-row bottom flex-between"
                    >
                      <div class="left">{{ item.stockroom_extent }}m2</div>
                      <div v-if="item.rent_status != '空置'" class="right">
                        欠费{{ item.rent_arrears }}元
                      </div>
                    </div>
                  </div>
                </el-col>
              </el-row>
            </div>
          </div>
        </div>
        <div v-else>
             <el-empty :image-size="200"></el-empty>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import _ from "lodash";

import "@/assets/common.scss";
let $ = require("jquery");

import "bootstrap/js/dist/tooltip";
import "bootstrap/js/dist/popover";
import commonMixin from "@/components/mixin/global-page-mixin";
import Vue from "vue";
$(function () {
  $('[data-toggle="tooltip"]').tooltip();
  $('[data-toggle="tooltip"]').popover();
});

export default {
  mixins: [commonMixin],

  props: {},

  data() {
    return {
      name: "123",
      objData: {},
      filterArrayList: [],
      appName: false,
      serviceName: "srvpark_stockroom_info_select",
      applicationUrl: "lpark",
      tableInfo: null,
      filterColumn: [
        {
          key: "stockroom_no",
        },
        {
          key: "category_no",
        },
        {
          key: "rent_status",
        },
        {
          key: "stockroom_extent",
        },
      ],
    };
  },

  methods: {
    async search(sucessList) {
      //  console.log(sucessList,"==sucessList==")
      this.renderCard(sucessList);
    },
    renderCard(passData) {
      let obj = {};
      passData.forEach((item, index) => {
        if (item.area_path_name.indexOf("/") != -1) {
          item.area_path_name = item.area_path_name.substring(
            1,
            item.area_path_name.length - 1
          );
        }
        if (!obj[`${item.area_path_name}`]) {
          obj[`${item.area_path_name}`] = [];
        } else {
          obj[`${item.area_path_name}`].push(item);
        }
        if (item.category_name == "干库") {
          item.background = "isGreen";
        }
        item.key = this.guid();
        if (item.rent_status == "空置") {
          item.background = "isGray";
        }
      });
      this.objData = obj;
    },
    async getV2TableInfo(tableInfo) {
      this.initCard();
    },
    async initCard() {
      let condition = {
        serviceName: this.tableInfo.mainTableInfo.select.serviceName,
        colNames: ["*"],
        condition: [],
        relation_condition: {},
        order: [],
        draft: false,
        query_source: "list_page",
      };

      let returnData = await this.$axios.post(
        this.tableInfo.mainTableInfo.select.url,
        condition
      );
      this.renderCard(returnData.data.data);
    },
    // async getColumns() {
    //   let condition = {
    //     serviceName: this.service_name,
    //     colNames: ["*"],
    //     condition: [
    //       {
    //         colName: "service_name",
    //         value: this.service_name,
    //         ruleType: "eq",
    //       },
    //       { colName: "use_type", value: "list", ruleType: "eq" },
    //     ],
    //     order: [{ colName: "seq", orderType: "asc" }],
    //   };
    //   let returnData = await this.$httpYq.post(
    //     `/select/srvsys_service_columnex_v2_select?colsel_v2=${this.service_name}`,
    //     condition
    //   );

    //   this.tableInfo = this.filterTableInfo(returnData.data.data);
    //   this.initCard();

    //   // let filterColumn =
    //   //     let columnArray = returnData.data.data.srv_cols;
    //   //     let appName=returnData.data.data.gridButton[0].application;

    //   //     this.appName=appName;
    //   //      console.log(this.appName,"==app===")

    //   //     let resultArray=this.getV2Columns(filterColumn,columnArray,(filterItem,dataItem)=>{
    //   //         if(filterItem.key ==  dataItem.columns){
    //   //              return true
    //   //         }else{
    //   //             return false;
    //   //         }
    //   //     });
    //   //     console.log(resultArray, "==resultArray==");
    //   //     let array2 = resultArray.sort((a, b) => a.souceSort < b.souceSort);

    //   //    this.filterArrayList=array2;
    // },
  },

  created: function () {
    window.h = this.$createElement;
  },

  mounted: function () {
    // this.getColumns();
  },
};
</script>

<style scoped>
/* .custom-form  */
.custom-card /deep/ .el-progress-bar__outer {
  background-color: rgba(33, 33, 33, 0.2) !important;
  height: 20px !important;
}

.custom-card /deep/ .el-progress-bar__innerText {
  color: black;
  font-weight: 700;
}

.c-border {
  background-color: rgba(241, 242, 247, 1);
  border-radius: 10px;
  width: 100%;
  height: 9px;
  box-sizing: border-box;
}

.ll-bottom-content /deep/ thead th {
  background-color: rgba(239, 242, 252, 1);
  color: rgba(16, 16, 16, 1);
}

.ll-bottom-content /deep/ tbody .cell {
  padding: 8px;
  line-height: 30px;
}
</style>

<style lang="scss" scoped>
.custom-card {
  color: white;
  border-radius: -30px;
  border-radius: 11px;
  background-color: rgb(99, 129, 234);
  width: 100%;
  padding: 10px 25px;
  height: 175px;
  margin-bottom: 20px;

  &.isGray {
    color: black !important;
    background: #33212121 !important;

    .height-row.top {
      .left {
        span {
          color: black !important;
        }
      }

      .right {
        .button-tag {
          background: rgba(186, 186, 211, 100) !important;
          color: white !important;
        }
      }
    }
  }

  &.isGreen {
    color: white !important;
    background: #05c998 !important;

    .height-row.top {
      .left {
        span {
          color: white !important;
        }
      }

      .right {
        .button-tag {
          background: white !important;
          color: #05c998 !important;
        }
      }
    }
  }
}

.block-content {
  .bottom-content {
    box-sizing: border-box;
    padding-top: 20px;

    .height-row {
      &.top {
        display: flex;
        position: relative;
      }
    }
  }
}

.custom-title {
  position: relative;
  background: linear-gradient(
    103.21deg,
    rgba(222, 228, 249, 1) 7.85%,
    rgba(222, 228, 249, 0) 81.76%
  );
}

.custom-title::before {
  content: "";
  display: inline-block;
  position: absolute;
  height: 30px;
  width: 10px;
  line-height: 20px;
  background-color: rgba(75, 75, 232, 1);
}

.hasBorder {
  border-bottom: 1px solid rgba(241, 242, 247, 1);
  padding-bottom: 14px;
}

.image-block {
  font-size: 14px;
  font-weight: 900;
  font-family: SourceHanSansSC-regular;

  img {
    margin-bottom: 7px;
    width: 40px;
    height: 40px;
  }
}

.gg-row {
  margin-bottom: 23px;

  img {
    width: 20px;
    height: 20px;
    margin-right: 8px;
  }

  .middle {
    font-weight: 600;
    margin-right: 8px;
    font-size: 15px;
    font-family: SourceHanSansSC-regular;
  }

  .right {
    width: 120px;
  }
}

.block {
  border-radius: 4px;
  font-size: 14px;
}

.title-row::before {
  content: "";
  display: inline-block;

  // background-image无法引用本地资源，故需要用网络地址
  background-image: url("~@/assets/staff/title-left2.png");
  background-size: 100% 100%;
  width: 15px;
  height: 15px;
  margin-right: 10px;
}

.title-row {
  color: rgba(50, 66, 116, 1);
  font-size: 16px;
  text-align: left;
  font-family: SourceHanSansSC-bold;
  font-weight: 800;
  font-family: SourceHanSansSC-bold;
  display: flex;
  position: relative;
}

.height-percent {
  height: 100% !important;
}

.echart-title-row {
  display: flex;
  justify-content: space-between;
}

#map-box {
  //  width:978px;
  width: 100%;
  height: 307px;
}

.ll-circle {
  width: 17px;
  height: 17px;
  border-radius: 8px;

  display: flex !important;
  justify-content: center;
  align-items: center;

  &.color0 {
    background: red;
    color: white;
  }

  &.color1 {
    background: rgba(255, 149, 2, 100);
    color: white;
  }

  &.color2 {
    background: #00bb7a;
    color: white;
  }

  &.colorlast {
    background: #c1c6d5;
    color: white;
  }
}

.ll-more {
  color: rgba(193, 198, 213, 1);
  font-size: 14px;
  text-align: right;
  font-family: PingFangSC-regular;
}

.flex-center {
  display: flex;
  align-items: center;
}

.blue {
  color: rgba(77, 95, 204, 1);
  font-size: 15px;
  text-align: left;
  font-family: SourceHanSansSC-bold;
  font-weight: 800;
}

.rank-table-parent {
  height: 100%;

  .title-row {
    color: rgba(50, 66, 116, 1);
    font-size: 16px;
    text-align: left;
    font-family: SourceHanSansSC-bold;

    margin-bottom: 20px;

    .left-title {
      font-weight: 800;
    }

    .right-button {
    }
  }
}

.height-percent {
  height: 100%;
}

.ll-bottom-content {
  height: 100%;
  display: flex;
  flex: 1;

  .left {
    // height: 100%;
    display: flex;
    flex-direction: column;
    padding-right: 20px;
    flex: 1;

    .map-container {
      // background: red;
      display: flex;
      flex-direction: column;

      .title {
        box-sizing: border-box;
        padding-bottom: 16px;
        display: flex;

        .left-title {
          color: black;
          font-weight: 800;
          font-size: 20px;
          text-align: left;
          display: flex;
          align-items: center;
          margin-right: 20px;
          font-family: SourceHanSansSC-bold;
        }

        .top-button {
          border-radius: 99px;
          margin-right: 10px;
          background-color: rgba(255, 255, 255, 1);
          display: flex;
          box-sizing: border-box;
          padding: 10px 20px;
          border: 1px solid rgba(241, 242, 247, 1);
        }
      }
    }

    .echarts-container {
      flex: 1;
      padding-top: 15px;
      display: flex;
      justify-content: space-between;

      .echarts {
        box-sizing: border-box;

        width: 594px;
        // height: 253px;
      }
    }
  }

  .right {
    height: 100%;
    // flex: 1;
  }
}

.card-row {
  //   display: flex;
  width: 100%;
  //   justify-content: space-between;

  .left {
    //   margin-right: 50px;
    .top-title {
      color: rgb(50, 66, 116);
      font-size: 16px;
      font-family: SourceHanSansSC-regular;
      margin-bottom: 4px;
    }

    .number {
      font-size: 20px;
      text-align: left;
      font-family: SourceHanSansSC-bold;
      font-weight: 800;
    }
  }

  .right {
    width: 127px;
    height: 50px;
  }
}

.parent-content {
  display: flex;
  flex-direction: column;
  height: 100%;

  .ll-card-block {
    box-sizing: border-box;
    padding-bottom: 20px;
  }
}
</style>
