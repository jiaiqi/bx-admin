<template>
  <div class="ll-content">
    <el-card class="height-percent" shadow="always">
      <div class="parent-content">
        <div class="ll-card-block">
          <div class="card-row">
            <el-row :gutter="24">
              <el-col :key="val.label" v-for="val in tagsObj"  :span="6">
                <div class="ll-custom-card flex-between">
                  <div class="left flex">
                    <div class="top-title number">{{val.label}}</div>
                  </div>

    
                  <div class="right flex">
                    <div class="number deepBlueC">{{ val.time }}</div>
                  </div>
                </div>
              </el-col>

             
            </el-row>
          </div>
        </div>
        <div class="ll-bottom-content">
          <filterColumn
            v-if="tableInfo"
            :filterColumn="filterColumn"
            :tableInfo="tableInfo"
            @search="search"
          ></filterColumn>

          <div class="map-container">
            <div style="height: 100%" id="map-box"></div>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.form-handle /deep/ .el-form-item {
  margin-bottom: 0px !important;
}
</style>

<script>
import _ from "lodash";
import "@/assets/common.scss";
let $ = require("jquery");

import "bootstrap/js/dist/tooltip";
import "bootstrap/js/dist/popover";
import commonMixin from "@/components/mixin/global-page-mixin";
$(function () {
  $('[data-toggle="tooltip"]').tooltip();
  $('[data-toggle="tooltip"]').popover();
});

export default {
  components: {},

  mixins: [commonMixin],
  props: {},
  data() {
    return {
      map: null,
      serviceName: "srvwuliu_car_select",
      applicationUrl: "lgs",
      filterColumn: [
        {
          key: "trans_status",
        },
      ],
      tagsObj:[],
      tagsObjTemplate:{},
      transitionStatus:[],
      tableInfo: null,
      getArray:[],
      legends:[],
      mapData: {
        working: 0,
        rest: 0,
        fault: 0,
        driver: 0,
        covers: [],
      },
    };
  },

  methods: {
    search(sucessList) {
        this.map.clearOverlays();
      
      this.renderMap(sucessList);
    },
    renderMap(data) {
      this.map.clearOverlays();
      this.covers = data;
      
      let tagsObj=JSON.parse(JSON.stringify(this.tagsObjTemplate))

      
      let mapData = data.filter((item, index) => {
         if (tagsObj[item.trans_status]) {
            tagsObj[item.trans_status].time++;
          }


        if (!item.last_lat) {
          return false;
        } else {
          return true;
        }
      });

      this.tagsObj=tagsObj;
      console.log(mapData,"什么是mapData----")
      let covers = new MapPlus.Covers({
        points: mapData,
        mapJd: "last_lon",
        mapWd: "last_lat",
        callBack: {
          render: (item, index, data) => {
            console.log(item, "===item==item==");
            let headImg = `${this.service_api.imageUrl}${item.driver_image}`;
            let poinImage;
            let className = "";
            let name = "";
            if (item.trans_status == this.transitionStatus[0].value) {
              className = "shallowBlueB";
              name = "jd";
              poinImage = require(`@/assets/image/shallowBlue1.png`);
            } else if (item.trans_status == this.transitionStatus[1].value) {
              className = "deepBlueB";
              name = "xx";
              poinImage = require(`@/assets/image/deepBlue1.png`);
            } else{
              className = "orangeB";
              name = "gz";
              poinImage = require(`@/assets/image/orange1.png`);
            }

            let overlay = new MapPlus.Cover({
              point: item.truePoint,
              size: 2,
              str: `<div style="margin-top:-15px;margin-left:-13px;cursor:pointer" class="image-jack ${name}-icon">
             <img src="${poinImage}" />
      </div>`,
              callBack: {
                click: ({ cover }) => {
                  $(cover.dom).popover("toggle");
                },
              },
            });

            $(overlay.dom).popover({
              trigger: "manual",
              container: overlay.dom,
              title: `123`,
              html: true,
              content: `<div>
            <div style="font-weight:800" class="flex-between">
              

            <div  class="ll-map-info">
                           <div class="ll-map-left">
                              <img  style="width:76px;height:55px" src="${headImg}" />
                           </div>
                           <div class="ll-map-right">
                              <div class="ll-map-row">
                                 <div>${item.driver_name}</div>
                                 <div style="color:white" class="ll-map-jd ${className}">${item.order_rcv_status}</div>
                              </div>
                              <div class="ll-map-row">
                                    ${item.car_no}
                              </div>

                               <div class="ll-map-row">
                                   未完成订单数${item.order_count_in_transit}
                              </div>

                           </div>
             </div>
     
      </div>`,
              template:
                '<div style="width:246px" class="popover" role="tooltip"><div class="arrow"></div><h3 style="display:none" class="popover-header"></h3><div class="popover-body"></div></div>',
              placement: "top",
              sanitize: false,
            });

            return overlay;
          },
        },
      });
      
      this.map.addOverlay(covers);
    },
    async getMapData() {
      // /lgs/select/srvwuliu_driver_select?srvwuliu_driver_select
      // this.$http()

      /**他是什么？？？ */
      let url = this.tableInfo.mainTableInfo.select.url;

      let conditions = {
        serviceName: this.tableInfo.mainTableInfo.select.serviceName,
        colNames: ["*"],
        condition: [],
        relation_condition: {},
        // "page": { "pageNo": 1, "rownumber": 10 },
        order: [],
        draft: false,
        query_source: "list_page",
      };

      let _this = this;

      this.$axios.post(url, conditions).then((res) => {
        this.renderMap(res.data.data);
      });
    },
    async getV2TableInfo() {
      let getData = await this.getArrayList("srvwuliu_car_select", [
        {
          key: "trans_status",
        },
      ]);
      let obj = {};
      getData.trans_status.array.forEach((item) => {
        if (!obj[item.value]) {
          obj[item.value] = {
            time: 0,
            label: item.label,
          };
        }
      });
      this.transitionStatus=getData.trans_status.array;
      this.tagsObjTemplate=obj;
     
      this.getMapData();
    },
  },

  created: function () {
    window.h = this.$createElement;
    let a = <div></div>;

    let formatter = (data) => {
      let h = this.$createElement;
      return (
        <el-tooltip
          class="item"
          effect="light"
          content={data.one}
          placement="left-start"
        >
          <div>{data.one}</div>;
        </el-tooltip>
      );
    };

    this.tableHeaders = [
      {
        label: "first",
        formatter: (one, two, thee) => {
          let tail;
          if (one.index > 2) {
            tail = "last";
          } else {
            tail = one.index;
          }
          return (
            <div class={`ll-circle color${tail}`}>
              <span>{one.index + 1}</span>
            </div>
          );
        },
        prop: "first",
        width: "36",
        label: "",
      },
      {
        label: "地区",
        props: "one",
        width: "80",
        formatter,
      },
      {
        label: "路线",
        prop: "one",
        width: "80",
        formatter,
      },
      {
        label: "云次",
        prop: "one",
        width: "100",
        formatter,
      },
      {
        label: "货运量",
        prop: "one",
        width: "120",
        formatter,
      },
    ];

    console.log(this.tableHeaders, "==tableHeaders==");
  },

  mounted: function () {
    var map = new MapPlus.Map("map-box");
    this.map = map;
    // this.getV2Columns();
    // this.getMapData();
  },
};
</script>

<style lang="scss" scoped>
.height-percent {
  height: 100% !important;
}

.echart-title-row {
  display: flex;
  justify-content: space-between;
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
    display: flex;
    color: rgba(50, 66, 116, 1);
    font-size: 16px;
    text-align: left;
    font-family: SourceHanSansSC-bold;
    justify-content: space-between;
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
  flex-direction: column;
  flex: 1;

  .handle-row {
    height: 62px;
  }

  .map-container {
    flex: 1;

    #map-box {
      height: 200px;
      // width: 600px;
    }
  }
}

.card-row {
  //   display: flex;
  width: 100%;
  //   justify-content: space-between;

  .number {
    font-size: 20px;
    text-align: left;
    font-family: SourceHanSansSC-bold;
    font-weight: 800;
  }

  .ll-custom-card {
    padding: 23px 30px;
    border-radius: 8px;
    background-color: rgb(241, 242, 247);
    display: flex;
    justify-content: space-between;

    .left {
      //   margin-right: 50px;
      .top-title {
        color: rgb(50, 66, 116);
        font-size: 16px;
        font-family: SourceHanSansSC-regular;
        margin-bottom: 4px;
      }
    }

    .right {
      width: 50px;
      height: 50px;
    }
  }
}

.parent-content {
  display: flex;
  flex-direction: column;
  height: 100%;

  .ll-card-block {
    box-sizing: border-box;
    // padding-bottom: 20px;
  }
}
</style>
