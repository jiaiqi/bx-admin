<template>
  <div class="ll-content">
    <div class="parent-content">
      <div class="ll-card-block">
        <el-card shadow="always">
          <div class="card-row">
            <el-row gutter="24">
              <el-col :span="6">
                <div class="ll-custom-card">
                  <div class="left">
                    <div class="top-title">
                      接单量
                      <i style="margin-left: 10px" class="el-icon-info"></i>
                    </div>
                    <div class="number deepBlueC">{{ (topData.waybill_count || 0) }}</div>
                  </div>
                  <div class="right">
                    <img src="./static/riFill-todo.png" />
                  </div>
                </div>
              </el-col>

              <el-col :span="6">
                <div class="ll-custom-card">
                  <div class="left">
                    <div class="top-title">
                      成交金额
                      <i style="margin-left: 10px" class="el-icon-info"></i>
                    </div>
                    <div class="number orangeC">¥{{ (topData.waybill_amount || 0) }}</div>
                  </div>
                  <div class="right">
                    <img src="./static/riFill-money.png" />
                  </div>
                </div>
              </el-col>

              <el-col :span="6">
                <div class="ll-custom-card">
                  <div class="left">
                    <div class="top-title">
                      货车数量
                      <i style="margin-left: 10px" class="el-icon-info"></i>
                    </div>
                    <div class="number shallowBlueC">{{ (topData.car_count || 0) }}</div>
                  </div>
                  <div class="right">
                    <img src="./static/riFill-bus.png" />
                  </div>
                </div>
              </el-col>

              <el-col :span="6">
                <div class="ll-custom-card">
                  <div class="left">
                    <div class="top-title">
                      货运量
                      <i style="margin-left: 10px" class="el-icon-info"></i>
                    </div>
                    <div class="number greenC">{{ (topData.trans_goods_weight_t || 0) }}T</div>
                  </div>
                  <div class="right">
                    <img src="./static/riFill-database.png" />
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>
        </el-card>
      </div>
      <div class="ll-bottom-content">
        <div class="left">
          <el-card shadow="always">
            <div style="position: relative" class="map-container">
              <div style="position: relative" class="title">
                <span class="left-title">车辆管理</span>
                <div class="top-button">
                  <span>接单车辆</span>
                  <span class="blue flex-center">{{ mapData.working }}</span>
                </div>

                <div class="top-button">
                  <span>休闲车辆</span>
                  <span class="blue flex-center">{{ mapData.rest }}</span>
                </div>

                <div class="top-button">
                  <span>故障车辆</span>
                  <span class="blue flex-center">{{ mapData.fault }}</span>
                </div>

                <div class="top-button">
                  <span>司机数量</span>
                  <span class="blue flex-center">{{ mapData.driver }}</span>
                </div>

                <div @click="$router.push({
                  path: 'allLine'
                })" style="
                    display: flex;
                    align-items: center;
                    position: absolute;
                    cursor: pointer;
                    right: 0;
                  ">
                  <div class="ll-more">更多</div>
                  <img style="
                      width: 23px;
                      height: 20px;
                      position: relative;
                      left: -5px;
                    " src="./static/moreIcon.png" />
                </div>
              </div>

              <div style="
                  position: absolute;
                  right: 10px;
                  bottom: 0px;
                  z-index: 10000;
                  width: 300px;
                " class="ll-map-legend">
                <div @click="legend('jd')" class="ll-block">
                  <div class="ll-icon shallowBlueB"></div>
                  接单车辆
                </div>

                <div @click="legend('xx')" class="ll-block">
                  <div class="ll-icon deepBlueB"></div>
                  休闲车辆
                </div>

                <div @click="legend('gz')" class="ll-block">
                  <div class="ll-icon orangeB"></div>
                  故障车辆
                </div>
              </div>
              <div id="map-box"></div>
            </div>
          </el-card>

          <div style="display: flex; justify-content: " class="echarts-container">
            <div class="zx echarts percent">
              <el-card class="height-percent" shadow="always">
                <div style="
                    position: relative;
                    height: 100%;
                    overflow: hidden;
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                  ">
                  <div style="display: flex" class="handle-row">
                    <div style="
                        font-weight: 800;
                        color: rgb(50, 66, 116);
                        margin-right: 16px;
                      ">
                      车辆管理
                    </div>
                    <!-- <div>
                      <el-date-picker
                        size="mini"
                        style="width: 166px"
                        type="date"
                        placeholder="选择日期"
                      >
                      </el-date-picker>
                    </div> -->
                  </div>
                  <div ref="oneEcharts" style="position: relative; width: 100%; flex: 1" class="content zx"></div>
                </div>
              </el-card>
            </div>

            <div class="zx echarts">
              <el-card class="height-percent" shadow="always">
                <div style="
                    position: relative;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                  ">
                  <div style="display: flex" class="handle-row">
                    <div style="
                        font-weight: 800;
                        color: rgb(50, 66, 116);
                        margin-right: 16px;
                      ">
                      运输方式
                    </div>

                    <div>
                      <el-date-picker size="mini" style="width: 166px" type="date" placeholder="选择日期">
                      </el-date-picker>
                    </div>
                    <div style="
                        display: flex;
                        align-items: center;
                        position: absolute;
                        right: 0;
                      ">
                      <div class="ll-more">更多</div>
                      <img style="
                          width: 23px;
                          height: 20px;
                          position: relative;
                          left: -5px;
                        " src="./static/moreIcon.png" />
                    </div>
                  </div>
                  <div ref="twoEcharts" style="height: 100%; position: relative; flex: 1" class="content zx echarts">
                  </div>
                </div>
              </el-card>
            </div>
          </div>
        </div>

        <div class="right">
          <el-card shadow="always" class="height-percent">
            <div class="rank-table-parent">
              <div class="title-row">
                <span class="left-title">物流路线排名</span>
                <div class="ll-more">更多：</div>
              </div>

              <div class="rank-table">
                <el-table ref="tables" :data="tableData" fit="{false}">
                  <el-table-column :formatter="item.formatter" :key="item.key" v-for="item in tableHeaders"
                    :prop="item.prop" :label="item.label" :width="item.width">
                  </el-table-column>
                </el-table>
              </div>
            </div>
          </el-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import _ from "lodash";
import "@/assets/common.scss";
let $ = require("jquery");

import "bootstrap/js/dist/tooltip";
import "bootstrap/js/dist/popover";

$(function () {
  $('[data-toggle="tooltip"]').tooltip();
  $('[data-toggle="tooltip"]').popover();
});

export default {
  components: {},

  mixins: [],

  props: {},

  data() {
    return {
      testHa: <div>21321</div>,
      tableHeaders: [],
      myCharts1: null,
      myCharts2: null,
      map: null,
      topData: {},
      mapData: {
        working: 0,
        rest: 0,
        fault: 0,
        driver: 0,
        covers: []

      },

      contentData: {
        dashboard_no: "0001",
        dashboard_width: "1920",
        dashboard_height: "969",
        dashboard_title: "",
        dashboard_background_image: "",
        background_size: "100% 100%",
        background_color: "transparent",
      },
      tableData: [

      ],
    };
  },

  methods: {
    async initEchats() {


      let passData = {
        "serviceName": "srvwuliu_waybill_select",
        "colNames": ["*"], "condition": [],
        "relation_condition": {},

        "order": [], "draft": false, "query_source": "list_page"
      }
      let returnData = await this.$http2.post("/select/srvwuliu_waybill_select?srvwuliu_waybill_select", passData);


      let obj = {

      };

      returnData.data.data.forEach((item, index) => {

        let date = this.parseDate2(new Date(item.create_time));

        let key = `${date.month}-${date.date}`;

        if (!obj.hasOwnProperty(key)) {
          obj[key] = {
            "整车": 0,
            "零担": 0,
            "专线": 0
          }

          obj[key][`${item.depart_type}`]++
        } else {

          obj[key][`${item.depart_type}`]++
        }
      });
      console.log(obj, "--------------------------------------------------------------")
      let valueArray1 = [];
      let valueArray2 = [];
      let categoryArray = [];
      for (let key in obj) {
        categoryArray.push(key);
        valueArray1.push(obj[key]["整车"])
        valueArray2.push(obj[key]["零担"])
      }

      this.myCharts1 = this.$echarts.init(this.$refs.oneEcharts);
      let options = {
        title: {
          text: "运单量统计", //图表顶部的标题
          show: false,
        },
        color: ["#4D5FCC", "#F77A50"],
        tooltip: {
          //鼠标悬浮框的提示文字
          trigger: "axis",
        },
        legend: {
          data: ["零担", "整发"],
          icon: "circle",
          x: "center",
        },
        xAxis: [
          {
            //x轴坐标数据
            type: "category",
            // boundaryGap: false,
            data: categoryArray,
            dataZoom: [
              {
                type: "slider",
                show: true,
                xAxisIndex: [0],
                left: "9%",
                bottom: -5,
                start: 10,
                end: 90, //初始化滚动条
              },
            ],

            axisTick: {
              lineStyle: {
                color: "#837884", //x轴轴线颜色
              },
            },

            axisLabel: {
              textStyle: {
                // color: "#837884",
                color: "#837884",
              },
            },
            axisLine: {
              lineStyle: {
                color: "#837884", //x轴轴线颜色
              },
            },
          },
        ],
        yAxis: [
          {
            //y轴坐标数据
            type: "value",
            axisLabel: {
              textStyle: {
                // color: "#837884",
                color: "#837884",
              },
            },
            axisTick: {
              show: false,
            },
            axisLine: {
              show: false,
            },
            textStyle: {
              color: "#837884",
            },
            // axisLabel: {
            //   formatter: "{value} °C",
            // },
          },
        ],
        series: [
          //驱动图表生成的数据内容数组，几条折现，数组中就会有几个对应对象，来表示对应的折线
          {
            name: "零担",
            type: "line", //pie->饼状图  line->折线图  bar->柱状图
            data: valueArray1,
            areaStyle: {
              color: "#DBDFF5",
            },
          },
          {
            name: "整发",
            type: "line", //pie->饼状图  line->折线图  bar->柱状图
            data: valueArray2,
            areaStyle: {
              color: "#E1CBD4",
            },
          },
        ],
      };

      this.myCharts1.setOption(options);
    },
    async renderTop() {
      let condition = {
        "serviceName": "srvwuliu_waybill_statistics_select",
        "colNames": ["*"], "condition": [],
        "relation_condition": {},
        "order": [], "draft": false, "query_source": "list_page"
      };

      let returnData = await this.$http2.post("/select/srvwuliu_waybill_statistics_select?srvwuliu_waybill_statistics_select", condition)
      console.log(returnData, "==returnData==returnData")

      this.topData = returnData.data.data[0];

    },
    legend(str) {
      if (str == "jd") {
        $(".jd-icon").toggleClass("hide");
      } else if (str == "xx") {
        $(".xx-icon").toggleClass("hide");
      } else if (str == "gz") {
        $(".gz-icon").toggleClass("hide");
      }
    },
    initEchats2() {
      this.myCharts2 = this.$echarts.init(this.$refs.twoEcharts);
      let arrayData = [
        { value: 80, name: "零担", perncent: "50" },
        { value: 20, name: "整发", perncent: "20" },
      ];
      var options = {
        tooltip: {
          trigger: "item",
          formatter: "{a} <br/>{b}: {c} ({d}%)",
        },
        color: ["rgba(77, 95, 204, 100)", "#F77A50"],
        legend: {
          data: ["零担", "整发"],
          icon: "circle",
          x: "400",
          y: "center",
          orient: "align",
          formatter(...array) {
            let findItem = arrayData.find((item, index) => {
              if (item.name == array[0]) {
                return true;
              } else {
                return false;
              }
            });
            return `${findItem.name}  ${findItem.perncent}% ${findItem.value}次`;
          },
        },
        title: {
          text: "20%",
          left: "22%",
          top: "48%",
          textStyle: {
            color: "rgba(50, 66, 116, 1)",
            fontSize: 36,
            align: "center",
          },
        },
        graphic: {
          type: "text",
          left: "24%",
          top: "35%",
          style: {
            text: "总运次",
            textAlign: "center",
            fill: "rgba(193, 198, 213, 1)",
            fontSize: 18,
            fontWeight: 700,
          },
        },
        series: [
          {
            name: "运动情况",
            type: "pie",
            radius: ["70%", "88%"],
            center: ["28%", "50%"],
            avoidLabelOverlap: false,
            label: {
              normal: {
                show: false,
                position: "center",
              },
            },

            data: arrayData,
          },
        ],
      };

      this.myCharts2.setOption(options);
    },
    resize() {
      // 自适应缩放
      let resizeFull = () => {
        if (!window.screen.height || !window.screen.width)
          return resizeFullBak();
        let ratioX = $(window).width() / window.screen.width;
        let ratioY = $(window).height() / window.screen.height;
        let contentData = this.contentData;

        let dashboard_width = Number(contentData.dashboard_width);
        let dashboard_height = Number(contentData.dashboard_height);
        if (window.screen.width / dashboard_width < 1) {
          ratioX = (ratioX * window.screen.width) / dashboard_width;
        }
        if (window.screen.height / dashboard_height < 1) {
          ratioY = (ratioY * window.screen.height) / dashboard_height;
        }
        $("body").css({
          "overflow-y": "hidden",
          transform: "scale(" + ratioX + ", " + ratioY + ")",
          transformOrigin: "left top",
          backgroundSize: "100% 100%",
        });
      };
      let resizeFullBak = () => {
        let ratioX = $(window).width() / $("body").width();
        let ratioY = $(window).height() / $("body").height();
        let dashboard_width = Number(contentData.dashboard_width);
        let dashboard_height = Number(contentData.dashboard_height);
        if (window.screen.width / dashboard_width < 1) {
          ratiox = (ratio * window.screen.width) / dashboard_width;
        }
        if (window.screen.height / dashboard_height < 1) {
          ratiox = (ratio * window.screen.height) / dashboard_height;
        }
        $("body").css({
          transform: "scale(" + ratioX + ", " + ratioY + ")",
          transformOrigin: "left top",
          backgroundSize: "100% " + ratioY * 100 + "%",
        });
      };
      // if (this.isPcEnv) {
      resizeFull();
      // }
    },
    async getMapData() {
      // /lgs/select/srvwuliu_driver_select?srvwuliu_driver_select
      // this.$http()


      let url = "/select/srvwuliu_car_select?srvwuliu_car_select";

      let conditions = {
        "serviceName": "srvwuliu_car_select",
        "colNames": ["*"],
        "condition": [],
        "relation_condition": {},
        // "page": { "pageNo": 1, "rownumber": 10 },
        "order": [],
        "draft": false, "query_source": "list_page"
      }
      console.log(this, "===this.$http2==this.$http2==")
      // mapData:{
      //      working:0,
      //      rest:0,
      //      fault:0,
      //      driver:0,

      // },
      let _this = this;
      this.$http2.post(url, conditions).then((res) => {
        console.log(res, "---what is res-----")
        this.covers = res.data.data;
        let mapData = res.data.data.filter((item, index) => {
          this.mapData.driver++
          if (item.trans_status == '空闲') {
            this.mapData.rest++
          } else if (item.trans_status == '在途') {
            this.mapData.working++
          } else if (item.trans_status == '故障') {
            this.mapData.fault++
          }

          if (!item.last_lat) {
            return false
          } else {
            return true;
          }
        });


        // let data = [
        //   {
        //     name: "jd",
        //     path: "shallowBlue1",
        //     mapJd: "jd",
        //     mapWd: "wd",
        //     jd: "108.94526962065048",
        //     wd: "34.38151803718951",
        //     text: "接单",
        //     driver: "李明",
        //   },
        //   {
        //     name: "xx",
        //     path: "deepBlue1",
        //     jd: "108.94526962065048",
        //     wd: "34.37151803718951",
        //     text: "休闲",
        //     driver: "王帅",
        //   },
        //   {
        //     name: "gz",
        //     path: "orange1",
        //     jd: "108.94526962065048",
        //     wd: "35.37151803718951",
        //     text: "故障",
        //     driver: "任龙",
        //   },
        // ];
        //         last_lat
        // : 
        // 34.291815
        // last_lon
        // : 
        // 108.902502
        // let headerimg = require(`@/assets/image/header.png`);
        let covers = new MapPlus.Covers({
          points: mapData,
          mapJd: 'last_lon',
          mapWd: 'last_lat',
          callBack: {
            render(item, index, data) {
              console.log(item, "===item==item==")
              let headImg = `${_this.service_api.imageUrl}${item.driver_image}`
              let poinImage
              let className = "";
              let name = ""
              if (item.trans_status == "在途") {
                className = "shallowBlueB";
                name = "jd";
                poinImage = require(`@/assets/image/shallowBlue1.png`);;
              } else if (item.trans_status == "空闲") {
                className = "deepBlueB";
                name = "xx";
                poinImage = require(`@/assets/image/deepBlue1.png`);
              } else if (item.trans_status == "故障") {
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


      })
    },
    async renderTable() {
      let condition = {
        "serviceName": "srvwuliu_trans_line_select",
        "colNames": ["*"], "condition": [], "relation_condition": {},
        // "page":{"pageNo":1,"rownumber":10},
        "order": [], "draft": false, "query_source": "list_page"
      }

      let returnData = await this.$http2.post("/select/srvwuliu_trans_line_select?srvwuliu_trans_line_select", condition);


      this.tableData = returnData.data.data.sort((item, item2) => {
        return item.trans_goods_weight_t - item2.trans_goods_weight_t;
      }).map((item, index) => {
        item.index = index;
        item.key = this.guid();
        return item
      })
      console.log(this.tableData, "==this.tableData===this.tableData")
    }
  },

  created: function () {
    window.h = this.$createElement;
    let a = <div></div>;

    let formatter = (data, ll) => {
      let h = this.$createElement;
      console.log(data, "data");
      console.log(ll, "--ll--")
      let obj = this.tableHeaders.find((item) => {
        if (item.label == ll.label) {
          return true
        } else {
          return false
        }
      })

      return (
        <el-tooltip
          class="item"
          effect="light"
          content={data[`${obj.prop}`]}
          placement="left-start"
        >
          <div>{data[`${obj.prop}`]}</div>;
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
        prop: "ln_name",
        width: "80",
        formatter,
      },
      {
        label: "路线",
        prop: "ln_name",
        width: "80",
        formatter,
      },
      {
        label: "运次",
        prop: "depart_count",
        width: "100",
        formatter,
      },
      {
        label: "货运量（t）",
        prop: "trans_goods_weight_t",
        width: "120",
        formatter,
      },
    ];

    console.log(this.tableHeaders, "==tableHeaders==");
  },

  mounted: async function () {
    this.getMapData();
    this.renderTop();
    this.renderTable();
    var map = new MapPlus.Map("map-box");
    this.map = map;


    // $(overlay.dom).popover("show");
    //  this.myCharts1.resize();
    //   this.myCharts2.resize();
    // this.resize();
    this.$refs.oneEcharts.addEventListener("resize", () => {
      console.log(this.myCharts1, "==this.myCharts1==");
      // this.myCharts1.resize();
      // this.resize();
      // let element=document.getElementsByTagName("body");

      // element.style.cssText = 'height: 100px !important';
    });

    this.$refs.twoEcharts.addEventListener("resize", () => {
      console.log(this.myCharts1, "==this.myCharts1==");

      this.myCharts2.resize();
      // this.resize();
      // let element=document.getElementsByTagName("body");

      // element.style.cssText = 'height: 100px !important';
    });

    this.initEchats();
    this.initEchats2();
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

    .right-button {}
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

      .number {
        font-size: 20px;
        text-align: left;
        font-family: SourceHanSansSC-bold;
        font-weight: 800;
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
    padding-bottom: 20px;
  }
}
</style>
