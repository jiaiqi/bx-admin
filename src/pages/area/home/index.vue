<template>
  <div class="ll-content">
    <div class="parent-content">
      <div class="ll-card-block">
        <el-card style="height: 306px" shadow="always">
          <el-row class="height-percent" gutter="24">
            <el-col class="height-percent" :span="11">
              <div class="height-percent flex-column">
                <div style="width: 100%" class="title-row">我的工作</div>
                <div style="flex: 1; width: 100%" class="bottom-container flex">
                  <div style="flex:1; height: 100%" class="left">
                    <div
                      ref="twoEcharts"
                      style="height: 100%; position: relative; flex: 1"
                      class="content zx echarts"
                    ></div>
                  </div>

                  <div style="width:160px" class="right height-percent flex-column">
                    <div
                      style="
                        color: white;
                        font-weight: 800;
                        height: 37px;
                        border-radius: 3px;
                      "
                      class="deepBlueB flex-center-percent"
                    >
                      历史积累
                    </div>
                    <div
                      style="background: rgba(241, 242, 247, 70); flex: 1"
                      class="bottom flex-column-percent"
                    >
                      <div
                        style="
                          border-bottom: 1px solid white;
                          width: 100%;
                          font-weight: 800;
                          flex: 1;
                        "
                        class="block flex-column"
                      >
                        <div class="flex-center">34</div>
                        <div class="flex-center">处理中</div>
                      </div>

                      <div
                        style="
                          border-bottom: 1px solid white;
                          width: 100%;
                          font-weight: 800;
                          flex: 1;
                        "
                        class="block deepBlueC flex-column-percent"
                      >
                        <div class="flex-center">34</div>
                        <div class="flex-center">处理中</div>
                      </div>
                      <div
                        style="
                          border-bottom: 1px solid white;
                          width: 100%;
                          font-weight: 800;
                          flex: 1;
                        "
                        class="block orangeC flex-column-percent"
                      >
                        <div class="flex-center">34</div>
                        <div class="flex-center">处理中</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </el-col>

            <el-col :span="8">
              <div class="ll-custom-card">
                <div class="title-row hasBorder">
                  我的工作
                  <more :isAbsolute="true"></more>
                </div>
              </div>
              <div style="padding-top: 10px">
                <div class="flex-between gg-row">
                  <div class="left flex">
                    <img src="../../../assets/staff/grayMessage2.png" />
                    <div class="middle">显示公告信息</div>
                    <small-button-tag
                      color="orange"
                      text="未读"
                    ></small-button-tag>
                  </div>
                  <div class="right deepGrayC">2011-01-02</div>
                </div>
                <div class="flex-between gg-row">
                  <div class="left flex">
                    <img src="../../../assets/staff/grayMessage2.png" />
                    <div class="middle">显示公告信息</div>
                    <small-button-tag
                      color="orange"
                      text="未读"
                    ></small-button-tag>
                  </div>
                  <div class="right deepGrayC">2011-01-02</div>
                </div>
                <div class="flex-between gg-row">
                  <div class="left flex">
                    <img src="../../../assets/staff/grayMessage2.png" />
                    <div class="middle">显示公告信息</div>
                    <small-button-tag
                      color="orange"
                      text="未读"
                    ></small-button-tag>
                  </div>
                  <div class="right deepGrayC">2011-01-02</div>
                </div>

                <div class="flex-between gg-row">
                  <div class="left flex">
                    <img src="../../../assets/staff/grayMessage2.png" />
                    <div class="middle">显示公告信息</div>
                    <small-button-tag
                      color="orange"
                      text="未读"
                    ></small-button-tag>
                  </div>
                  <div class="right deepGrayC">2011-01-02</div>
                </div>
                <div class="flex-between gg-row">
                  <div class="left flex">
                    <img src="../../../assets/staff/grayMessage2.png" />
                    <div class="middle">显示公告信息</div>
                    <small-button-tag
                      color="orange"
                      text="未读"
                    ></small-button-tag>
                  </div>
                  <div class="right deepGrayC">2011-01-02</div>
                </div>
              </div>
            </el-col>

            <el-col :span="5">
              <div class="ll-custom-card">
                <div class="title-row hasBorder">
                  常用功能
                  <more :isAbsolute="true"></more>
                </div>
                <div style="padding-top: 15px">
                  <el-row gutter="24">
                    <el-col :span="6">
                      <div class="flex-column image-block">
                        <img :src="require('@/assets/staff/yhxx1.png')" />
                        <div>用户信息</div>
                      </div>
                    </el-col>
                    <el-col :span="6">
                      <div class="flex-column image-block">
                        <img :src="require('@/assets/staff/swsb1.png')" />
                        <div>个人绩效</div>
                      </div>
                    </el-col>
                    <el-col :span="6">
                      <div class="flex-column image-block">
                        <img :src="require('@/assets/staff/zzsq1.png')" />
                        <div>收款管理</div>
                      </div>
                    </el-col>
                    <el-col :span="6">
                      <div class="flex-column image-block">
                        <img :src="require('@/assets/staff/wdht1.png')" />
                        <div>付款管理</div>
                      </div>
                    </el-col>
                  </el-row>

                  <el-row style="padding-top: 10px" gutter="24">
                    <el-col :span="6">
                      <div class="flex-column image-block">
                        <img :src="require('@/assets/staff/oa1.png')" />
                        <div>费用报销</div>
                      </div>
                    </el-col>
                    <el-col :span="6">
                      <div class="flex-column image-block">
                        <img :src="require('@/assets/staff/zcgl1.png')" />
                        <div>自助开票</div>
                      </div>
                    </el-col>
                    <el-col :span="6">
                      <div class="flex-column image-block">
                        <img :src="require('@/assets/staff/zcgl1.png')" />
                        <div>学习计划</div>
                      </div>
                    </el-col>
                    <el-col :span="6">
                      <div class="flex-column image-block">
                        <img :src="require('@/assets/staff/swsb1.png')" />
                        <div>预算审核</div>
                      </div>
                    </el-col>
                  </el-row>
                </div>
              </div>
            </el-col>
          </el-row>
        </el-card>
      </div>
      <div class="ll-bottom-content">
        <el-card style="width: 100%" shadow="always" class="height-percent">
          <div class="rank-table-parent">
            <div class="title-row">
              <span class="left-title">待办任务</span>
              <more :isAbsolute="true"></more>

            </div>

            <div class="rank-table">
              <el-table   ref="tables" :data="tableData" >
                <el-table-column
                  :formatter="item.formatter"
                  :key="item.key"
                  v-for="item in tableHeaders"
                  :prop="item.prop"
                  :label="item.label"
                  :width="item.width"
                >
                </el-table-column>
              </el-table>
            </div>
          </div>
        </el-card>
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
        {
          date: "2016-05-02",
          name: "王小虎",
          one: "上海市普陀区金沙江路 1518 弄",
          index: 0,
        },
        {
          date: "2016-05-04",
          name: "王小虎",
          one: "上海市普陀区金沙江路 1517 弄",
          index: 1,
        },
        {
          date: "2016-05-01",
          name: "王小虎",
          one: "上海市普陀区金沙江路 1519 弄",
          index: 2,
        },
        {
          date: "2016-05-03",
          name: "王小虎",
          one: "上海市普陀区金沙江路 1516 弄",
          index: 3,
        },
      ],
    };
  },

  methods: {
    initEchats() {
      console.log();
      this.myCharts1 = this.$echarts.init(this.$refs.oneEcharts);
      let options = {
        title: {
          text: "车辆管理", //图表顶部的标题
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
            data: [
              "11-01",
              "11-02",
              "11-03",
              "11-04",
              "11-05",
              "11-06",
              "11-07",
            ],
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
            data: [50, 120, 130, 150, 160, 200, 250],
            areaStyle: {
              color: "#DBDFF5",
            },
          },
          {
            name: "整发",
            type: "line", //pie->饼状图  line->折线图  bar->柱状图
            data: [50, 120, 130, 50, 60, 400, 750],
            areaStyle: {
              color: "#E1CBD4",
            },
          },
        ],
      };

      this.myCharts1.setOption(options);
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
      console.log(this.$refs, "==this.$refs===");
      this.myCharts2 = this.$echarts.init(this.$refs.twoEcharts);
      let arrayData = [
        { value: 80, name: "今日已处理", perncent: "50" },
        { value: 20, name: "今日待处理", perncent: "20" },
      ];
      var options = {
        tooltip: {
          trigger: "item",
          formatter: "{a} <br/>{b}: {c} ({d}%)",
        },
        color: ["rgba(77, 95, 204, 100)", "#F77A50"],
        legend: {
          data: ["今日已处理", "今日待处理"],
        //   icon: "circle",
          x: "23%",
          y: "90%",
          orient: "align",
          formatter(...array) {
            let findItem = arrayData.find((item, index) => {
              if (item.name == array[0]) {
                return true;
              } else {
                return false;
              }
            });
            return `${findItem.name}2`;
          },
        },
        title: {
          text: "20%",
          left: "33%",
          top: "38%",
          textStyle: {
            color: "rgba(50, 66, 116, 1)",
            fontSize: 36,
            align: "center",
          },
        },
        // graphic: {
        //   type: "text",
        //   left: "24%",
        //   top: "35%",
        //   style: {
        //     text: "总运次",
        //     textAlign: "center",
        //     fill: "rgba(193, 198, 213, 1)",
        //     fontSize: 18,
        //     fontWeight: 700,
        //   },
        // },
        series: [
          {
            name: "运动情况",
            type: "pie",
            radius: ["75%", "65%"],
            center: ["38%", "46%"],
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
  },

  created: function () {
    console.log("云死");
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
        label: "业务名称",
        props: "one",
        width: "180",
        formatter,
      },
      {
        label: "摘要",
        prop: "one",
        width: "320",
        formatter,
      },
      {
        label: "流程状态",
        prop: "one",
        width: "160",
        formatter,
      },
      {
        label: "申请人",
        prop: "one",
        width: "160",
        formatter,
      },
      {
        label: "申请时间",
        prop: "one",
        formatter,
      },
    ];

    console.log(this.tableHeaders, "==tableHeaders==");
  },

  mounted: function () {
    this.$refs.twoEcharts.addEventListener("resize", () => {
      console.log(this.myCharts1, "==this.myCharts1==");

      this.myCharts2.resize();
      // this.resize();
      // let element=document.getElementsByTagName("body");

      // element.style.cssText = 'height: 100px !important';
    });

    this.initEchats2();
  },
};
</script>

<style scoped>
  .ll-bottom-content  /deep/ thead th {
    background-color: rgba(239, 242, 252, 1);
color: rgba(16, 16, 16, 1);


}  


 .ll-bottom-content  /deep/  tbody .cell {
    padding: 8px;
    line-height: 30px;
}
</style>

<style lang="scss" scoped>
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
