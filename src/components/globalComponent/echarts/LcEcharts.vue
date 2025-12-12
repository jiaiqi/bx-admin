<template>
  <div ref="echart" :class="dom.class || ''" :style="dom.style || ''"></div>
</template>

<style>
.ll {
  position: fixed;
}
</style>
  
<script>
import "@/assets/common.scss";
let $ = require("jquery");
import commonMixin from "@/components/mixin/global-page-mixin";
// import echarts from "echarts"; // 改为异步加载

// import "bootstrap/js/dist/tooltip";
// import "bootstrap/js/dist/popover";

export default {
  components: {},
  name: "low-code-echarts",
  props: {
    option: {
      type: Object,
    },
  },
  data() {
    return {
      prop_options: this.option,
      data: {},
      echarts: null, // echarts 实例
      echartsLib: null, // 异步加载的 echarts 库
      dom: {
        style: "width:100%;height:500px",
        class: "name-kk-pp",
      },
      watch: {
        item(val) {
          this.prop_options = this.option;
        },
      },
      option: {
        title: {
          text: "123$<title>455", //图表顶部的标题
          formatter: "",
          show: true,
          x: "20px",
          y: "10px",
          textStyle: {
            //文字颜色
            color: `rgba(50, 66, 116, 1)`,
            //字体风格,'normal','italic','oblique'
            fontStyle: "normal",
            //字体粗细 'normal','bold','bolder','lighter',100 | 200 | 300 | 400...
            fontWeight: "510",
            //字体系列
            fontFamily: "sans-serif",
            //字体大小
            fontSize: 16,
          },
        },
        color: ["#4D5FCC", "#F77A50"],
        tooltip: {
          //鼠标悬浮框的提示文字
          trigger: "axis",
        },
        legend: {
          data: ["实时温度", "最高标准线"],
          icon: "square",
          x: "center",
          y: "10px",
        },
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
        xAxis: [
          {
            //x轴坐标数据
            type: "category",
            // boundaryGap: false,
            data: "$<data_time>",
            dataFormatter: "$<data_time>",
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
        series: [
          {
            name: "温度",
            type: "line",
            column: "$<report_temperature>",
            areaStyle: {
              color: "#DBDFF5",
            },
          },
          {
            name: "湿度",
            type: "line",
            column: "$<report_humidity>",
          },
        ],
      },
    };
  },

  methods: {
    getV2TableInfo(url) {},
    getEchats(echarts, item) {
      if (echarts.xAxis) {
        if (echarts.xAxis instanceof Array) {
          echarts.xAxis.forEach((itemX, indexX) => {
            if (itemX.dataFormatter) {
              if (!(itemX.data instanceof Array)) {
                itemX.data = [];
              }

              let dataStr = this.getTemplateInfo(
                itemX.dataFormatter
              ).setColumns({
                ...item,
              });
              itemX.data.push(dataStr);
            }
          });
        } else {
          if (echarts.xAxis.dataFormatter) {
            if (!(echarts.xAxis.data instanceof Array)) {
              echarts.xAxis.data = [];
            }

            let dataStr = this.getTemplateInfo(
              echarts.xAxis.dataFormatter
            ).setColumns({
              ...item,
            });
            echarts.xAxis.data.push(dataStr);
          }
        }
      }

      if (echarts.yAxis) {
        if (echarts.yAxis instanceof Array) {
          echarts.yAxis.forEach((itemX, indexX) => {
            if (itemX.dataFormatter) {
              if (!(itemX.data instanceof Array)) {
                itemX.data = [];
              }
              let dataStr = this.getTemplateInfo(
                itemX.dataFormatter
              ).setColumns({
                ...item,
              });
              itemX.data.push(dataStr);
            }
          });
        } else {
          if (echarts.yAxis.dataFormatter) {
            if (!(echarts.yAxis.data instanceof Array)) {
              echarts.yAxis.data = [];
            }

            let dataStr = this.getTemplateInfo(itemX.dataFormatter).setColumns({
              ...item,
            });
            echarts.yAxis.data.push(dataStr);
          }
        }
      }

      if (echarts.series) {
        echarts.series.forEach((itemX, index) => {
          if (!(itemX.data instanceof Array)) {
            itemX.data = [];
          }
          console.log(
            itemX.column,
            "-------------itemX.column--------------itemX.column-------------itemX.column"
          );
          let dataStr = this.getTemplateInfo(itemX.column).setColumns({
            ...item,
          });

          itemX.data.push(dataStr);
        });
      }
    },
    getMainTableInfo(sucessData) {},
    legend(str) {},
    recursionParent(instance, strObj) {
      if (instance.$vnode.tag.indexof("low-code") != -1) {
        // 以后变成链表优化
        if (strObj.variables) {
          let nowNode = strObj.variables;
          while (nowNode) {
            if (nowNode.isObject) {
              //此时colum是 hh.jj.kk
              //其实是instance[`hh`]['jj']['kk']
              let array = nowNode.variableName.split(".");

              let nowObj = instance;
              for (let i = 0; i < array.length; i++) {
                let str = array[i];
                if (nowObj[`${str}`]) {
                  nowObj = nowObj[`${str}`];
                } else {
                  break;
                }
              }

              //此时已经模板拿到了值

              if (nowObj) {
                nowNode.replaceStr(nowObj);
                nowNode.pop();
                nowNode = nowNode.nextNode();
              }
            } else {
              let variableName = nowNode.variableName;
              if (instance[`${variableName}`]) {
                nowNode.replaceStr(nowObj);
                nowNode.pop();
                nowNode = nowNode.nextNode();
              }
            }
          }
        } else {
          return;
        }
      } else {
        if (!strObj.variables) {
          return;
        }
        recursionParent(instance.$parent);
      }
      //  let instance
      //  if(this.$parent){

      //  }
    },
    makeStr(obj, strObj) {
      let { key, map } = strObj;
      let strInstance = this.getTemplateInfo(obj[`${key}`]);

      this.recursionParent(this, strInstance);
      if (map) {
        obj[map] = strInstance.str;
      } else {
        obj[key] = strInstance.str;
      }
    },
    parseOption() {
      this.makeStr(this.prop_options.title, {
        key: "textFormatter",
        map: "text",
      });

      this.prop_options.series.forEach((item) => {
        this.makeStr(this.prop_options.title, {
          key: "textFormatter",
          map: "text",
        });
      });

    //   this.makeStr(this.prop_options.title, {
    //     key: "textFormatter",
    //     map: "text",
    //   });
    },
    resize() {},
  },

  created: function () {},

  async mounted() {
    // 异步加载 echarts 和 bootstrap 工具提示
    const [echartsModule] = await Promise.all([
      import(/* webpackChunkName: "echarts-vendor" */ "echarts"),
      import(/* webpackChunkName: "bootstrap-vendor" */ "bootstrap/js/dist/tooltip"),
      import(/* webpackChunkName: "bootstrap-vendor" */ "bootstrap/js/dist/popover"),
    ]);
    
    this.echartsLib = echartsModule.default || echartsModule;
    
    // 初始化 echarts 实例
    this.echarts = this.echartsLib.init(this.$refs.echart);
    this.parseOption();
  },
};
</script>
  
<style scoped>
.custom-input-box /deep/ .el-input__prefix {
  left: 7px;
  top: 5px;
  -webkit-transition: all 0.3s;
  transition: all 0.3s;
}

.custom-input-box /deep/ input {
  background-color: rgba(248, 248, 251, 1);
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
.zx-block {
}

.echarts-container {
  height: 250px;
  width: 100%;
  border: 1px solid rgba(241, 242, 247, 1);
}

.custom-title {
  position: relative;
  background: linear-gradient(
    103.21deg,
    rgba(222, 228, 249, 1) 7.85%,
    rgba(222, 228, 249, 0) 81.76%
  );
  height: 30px;
  display: flex;
  align-items: center;
  font-weight: 800;
  box-sizing: border-box;
  padding-left: 16px;
}

.custom-title::before {
  content: "";
  display: inline-block;
  position: absolute;
  height: 30px;
  width: 6px;
  left: 0px;
  line-height: 20px;
  background-color: rgba(75, 75, 232, 1);
}

.left-row {
  padding: 10px 20px;
  color: #a1a8bf;
  background-color: rgba(241, 242, 247, 0.5);
  cursor: pointer;
}

.left-row:hover {
  background-color: rgba(222, 228, 249, 1);
  color: #5e6ed1;
}

.left.isActive {
  background-color: rgba(222, 228, 249, 1);
  color: #5e6ed1;
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
  