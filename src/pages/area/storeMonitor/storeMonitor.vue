<template>
  <div class="ll-content">
    <el-card shadow="always">
      <div class="parent-content">
        <div style="box-sizing: border-box; padding-bottom: 19px">
          <el-select
            @change="onChange"
            size="mini"
            v-model="areaValue"
            placeholder="请选择"
          >
            <el-option
              v-for="item in area"
              :key="item.value"
              :label="item.label"
              :value="item.value"
              :disabled="item.disabled"
            >
            </el-option>
          </el-select>
          <span
            style="
              font-weight: 800;
              color: rgb(57, 69, 171);
              font-size: 14px;
              text-align: left;
              margin-left: 10px;
              font-family: SourceHanSansSC-regular;
            "
            >仓库态势图</span
          >
        </div>

        <div style="display: flex; background: white">
          <div
            style="width: 260px; border: 1px solid rgba(241, 242, 247, 1)"
            class="left"
          >
            <div style="padding: 10px 20px" class="header custom-input-box">
              <el-input
                v-model="searchValue"
                size="mini"
                placeholder="请输入内容"
              >
                <template #prefix>
                  <div @click="searchChange" style="cursor: pointer">
                    <i class="el-icon-search"></i>
                  </div>
                </template>
              </el-input>
            </div>
            <div class="bottom-content">
              <div class="custom-title">选择楼层</div>
              <div
                style="box-sizing: border-box; padding-top: 20px"
                class="tree-content"
              >
                <el-tree
                  :data="treeData"
                  :props="defaultProps"
                  @node-click="handleNodeClick"
                  :key="treeKey"
                  :default-checked-keys="checkedItems"
                ></el-tree>
                <!-- <div
                  v-for="(item, index) in layers"
                  :class="item.isActive ? 'left-row' : 'left-row isActive'"
                >
                  {{ item.name }}
                </div> -->
              </div>
            </div>
          </div>
          <div
            style="flex: 1; box-sizing: border-box; padding-left: 22px"
            class="right"
          >
            <div class="zxt">
              <div class="custom-title flex-between">
                <span>仓库温度监控</span>

                <el-date-picker
                  v-model="dateValue"
                  type="datetimerange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  @change="dateChange"
                  end-placeholder="结束日期"
                >
                </el-date-picker>
              </div>

              <!-- device_nodeid: 
              device_sn: -->
              <div v-if="device.length > 0">
                <div
                  :ref="`echarts${item.device_sn}${item.device_nodeid}`"
                  :key="`${item.device_sn}${item.device_nodeid}`"
                  style="width: 100%; height: 300px"
                  v-for="item in device"
                ></div>
              </div>
              <div v-if="device.length == 0">
                <el-empty :image-size="200"></el-empty>
              </div>
            </div>
            <!-- <div class="vedio">
              <div class="custom-title flex-between">
                <span>仓库视频监控</span>

                <el-date-picker
                  size="mini "
                  v-model="value1"
                  type="date"
                  placeholder="选择日期"
                >
                </el-date-picker>
              </div>

              <div
                style="box-sizing: border-box; padding-top: 15px"
                class="vedio-content"
              >
                <el-row :gutter="24">
                  <el-col :span="6">
                    <div
                      style="border: 1px solid rgba(241, 242, 247, 1)"
                      class="vedio-card"
                    >
                      <video controls style="height: 130px; width: 100%">
                        <source src="./changan.mp4" type="video/mp4" />
                      </video>
                      <div
                        style="
                          font-weight: 500;
                          border-top: 1px solid rgba(241, 242, 247, 1);
                          padding: 10px 20px;
                          color: rgba(50, 66, 116, 1);
                          font-size: 14px;
                          text-align: left;
                          font-family: SourceHanSansSC-regular;
                        "
                        class="bottom-font"
                      >
                        监控1
                      </div>
                    </div>
                  </el-col>

                  <el-col :span="6">
                    <div
                      style="border: 1px solid rgba(241, 242, 247, 1)"
                      class="vedio-card"
                    >
                      <video controls style="height: 130px; width: 100%">
                        <source src="./changan.mp4" type="video/mp4" />
                      </video>
                      <div
                        style="
                          font-weight: 500;
                          border-top: 1px solid rgba(241, 242, 247, 1);
                          padding: 10px 20px;
                          color: rgba(50, 66, 116, 1);
                          font-size: 14px;
                          text-align: left;
                          font-family: SourceHanSansSC-regular;
                        "
                        class="bottom-font"
                      >
                        监控1
                      </div>
                    </div>
                  </el-col>

                  <el-col :span="6">
                    <div
                      style="border: 1px solid rgba(241, 242, 247, 1)"
                      class="vedio-card"
                    >
                      <video controls style="height: 130px; width: 100%">
                        <source src="./changan.mp4" type="video/mp4" />
                      </video>
                      <div
                        style="
                          font-weight: 500;
                          border-top: 1px solid rgba(241, 242, 247, 1);
                          padding: 10px 20px;
                          color: rgba(50, 66, 116, 1);
                          font-size: 14px;
                          text-align: left;
                          font-family: SourceHanSansSC-regular;
                        "
                        class="bottom-font"
                      >
                        监控1
                      </div>
                    </div>
                  </el-col>

                  <el-col :span="6">
                    <div
                      style="border: 1px solid rgba(241, 242, 247, 1)"
                      class="vedio-card"
                    >
                      <video controls style="height: 130px; width: 100%">
                        <source src="./changan.mp4" type="video/mp4" />
                      </video>
                      <div
                        style="
                          font-weight: 500;
                          border-top: 1px solid rgba(241, 242, 247, 1);
                          padding: 10px 20px;
                          color: rgba(50, 66, 116, 1);
                          font-size: 14px;
                          text-align: left;
                          font-family: SourceHanSansSC-regular;
                        "
                        class="bottom-font"
                      >
                        监控1
                      </div>
                    </div>
                  </el-col>
                </el-row>
              </div>
            </div> -->
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<style>
.ll {
  position: fixed;
}
</style>
  
<script>
import _ from "lodash";
import "@/assets/common.scss";
let $ = require("jquery");
import commonMixin from "@/components/mixin/global-page-mixin2";

import "bootstrap/js/dist/tooltip";
import "bootstrap/js/dist/popover";

$(function () {
  $('[data-toggle="tooltip"]').tooltip();
  $('[data-toggle="tooltip"]').popover();
});

export default {
  components: {},
  mixins: [commonMixin],
  props: {},
  name: "filter-ooooooooooooooooooooooooooooooooooo",
  tree: null,
  data() {
    return {
      treeKey: "",
      checkedItems: [],
      treeData: [],
      areaValue: "",
      dateValue: "",
      searchValue: "",
      dateRange: {
        start: null,
        end: null,
      },
      options: {},
      area: [],
      device: [],
      defaultProps: {
        children: "children",
        label: "label",
      },
    };
  },

  methods: {
    dateChange() {
      if (!this.dateValue) {
        this.dateRange.start = null;
        this.dateRange.end = null;
        this.getEchartsData();
        return
      }
      let startTime = new Date(this.dateValue[0]);
      let endTime = new Date(this.dateValue[1]);
      let time1 = this.formatDateTime(startTime);
      let time2 = this.formatDateTime(endTime);
      this.dateRange.start = time1;
      this.dateRange.end = time2;
      this.getEchartsData();

      // console.log(time1, "==time1==");
      // console.log(time2, "-time2-");
    },
    onChange() {
      this.getTree();
    },
    searchChange() {
      this.getTree();
    },
    handleNodeClick(data) {
      console.log(data);
      if (data.is_leaf == "是") {
        // data.device_sn
        // data.device_nodeid
        this.getTableData(data.area_no);
      }
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
    getEchartsData() {
      this.device.forEach(async (item, index) => {
        let innerCondition = {
          serviceName: "srvpark_temp_hum_record_select",
          colNames: ["*"],
          condition: [
            { colName: "sn", ruleType: "like", value: item.device_sn },
            {
              colName: "nodeid",
              ruleType: "like",
              value: item.device_nodeid,
            },
          ],
          relation_condition: {},
          order: [],
          draft: false,
          query_source: "list_page",
        };

        // dateRange: {
        //   start: null,
        //   end: null,
        // }

        console.log("你是谁我是谁我兄弟姐妹和爱人---");
        if (this.dateRange) {
          if (this.dateRange.start && this.dateRange.end) {
            innerCondition.condition.push({
              colName: "occur_date",
              ruleType: "between",
              value: [this.dateRange.start, this.dateRange.end],
            });
          }
        }

        let res = await this.$axios.post(
          `/lpark/select/srvpark_temp_hum_record_select?srvpark_temp_hum_record_select`,
          innerCondition
        );
        item.echartOption = {
          tem: [],
          hum: [],
          categories: [],
        };
        res.data.data.forEach((temItem, temIndex) => {
          item.echartOption.tem.push(temItem.tem);
          item.echartOption.hum.push(temItem.hum);
          item.echartOption.categories.push(temItem.occur_date);
        });

        this.$nextTick(() => {
          let dom =
            this.$refs[`echarts${item.device_sn}${item.device_nodeid}`][0];
          let echart = this.$echarts.init(dom);
          let options = {
            title: {
              text: `${item.device_addr}传感器A（门口）`, //图表顶部的标题
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
            dataZoom: [
              {
                type: "slider",
                start: 0,
                end: 10,
                height: 20,
                backgroundColor: "rgba(2,96,171,0.5)",
                dataBackground: {
                  lineStyle: {
                    color: "#fff9c1",
                    width: 1,
                  },
                },
                fillerColor: "rgba(53,204,251,0.2)",
                borderColor: "rgba(53,204,251,0.9)",
                //handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
                handleSize: "80%",
                handleStyle: {
                  color: "#a0f1fb",
                  shadowBlur: 3,
                  shadowColor: "rgba(0, 0, 0, 0.6)",
                  shadowOffsetX: 2,
                  shadowOffsetY: 2,
                },
                textStyle: {
                  color: "#fff",
                },
                bottom: 5,
              },
            ],
            color: ["#4D5FCC", "#F77A50"],
            tooltip: {
              //鼠标悬浮框的提示文字
              trigger: "axis",
            },
            legend: {
              data: ["温度", "湿度"],
              icon: "square",
              x: "center",
              y: "10px",
            },
            xAxis: [
              {
                //x轴坐标数据
                type: "category",
                // boundaryGap: false,
                data: [...item.echartOption.categories],
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
              },
            ],
            series: [
              //驱动图表生成的数据内容数组，几条折现，数组中就会有几个对应对象，来表示对应的折线
              {
                name: "温度",
                type: "line", //pie->饼状图  line->折线图  bar->柱状图
                data: [...item.echartOption.tem],
                areaStyle: {
                  color: "#DBDFF5",
                },
              },
              {
                name: "湿度",
                type: "line", //pie->饼状图  line->折线图  bar->柱状图
                data: [...item.echartOption.hum],
              },
            ],
          };

          echart.setOption(options);

          // console.log(this.$refs, "--refs---refs-refs");
        });
      });
    },
    getTableData(area_no) {
      let condition = {
        serviceName: "srvpark_temperature_device_select",
        colNames: ["*"],
        condition: [{ colName: "area_no", ruleType: "like", value: area_no }],
        relation_condition: {},
        page: { pageNo: 1, rownumber: 10 },
        order: [],
        draft: false,
        query_source: "list_page",
      };
      this.$axios
        .post(
          `/lpark/select/srvpark_temperature_device_select?srvpark_temperature_device_select`,
          condition
        )
        .then((res) => {
          this.device = res.data.data;
          this.getEchartsData();
          // console.log(this.device, "==this.device==this.device==this.device");
        });
    },
    getTree() {
      let _this = this;
      let conditionArray = [];
      if (conditionArray) {
        if (this.areaValue != "") {
          conditionArray.push({
            colName: "park_no",
            ruleType: "like",
            value: this.areaValue,
          });
        }

        if (this.searchValue != "") {
          conditionArray.push({
            colName: "area_name",
            ruleType: "like",
            value: this.searchValue,
          });
        }
      }
      let condition = {
        serviceName: "srvpark_park_area_select",
        colNames: ["*"],
        condition: [
          { colName: "parent_no", ruleType: "isnull" },
          ...conditionArray,
        ],
        relation_condition: {},
        // page: { pageNo: 1, rownumber: 10 },
        order: [],
      };
      this.$axios
        .post(
          `/lpark/select/srvpark_park_area_select?srvpark_park_area_select`,
          condition
        )
        .then(async (res) => {
          if (res.data.data.length == 0) {
            this.device = [];
            this.treeData = [];
            return;
          }
          let recursion = function (array) {
            return new Promise(async (resolve) => {
              for (let i = 0; i < array.length; i++) {
                let item = array[i];

                item.label = item.area_name;
                item.value = item.area_no;

                if (item.is_leaf == "否") {
                  let findContion = {
                    serviceName: "srvpark_park_area_select",
                    colNames: ["*"],
                    condition: [
                      {
                        colName: "parent_no",
                        value: item.area_no,
                        ruleType: "eq",
                      },
                    ],
                    relation_condition: {},
                    page: { pageNo: 1, rownumber: 300 },
                    order: [],
                  };
                  let res = await _this.$axios.post(
                    `/lpark/select/srvpark_park_area_select?srvpark_park_area_select`,
                    findContion
                  );
                  // recursion
                  item.children = res.data.data;
                  await recursion(item.children);
                }
              }

              resolve();
            });
          };

          let ff = await recursion(res.data.data);

          this.treeKey = this.getUuid();
          this.treeData = res.data.data;

          let leafItem = { result: null };

          let findLeaf = function (item, leafItem) {
            if (item.is_leaf == "是") {
              leafItem.result = item;
              return leafItem;
            } else {
              let nowItem = item.children[0];
              return findLeaf(nowItem, leafItem);
            }
          };

          findLeaf(this.treeData[0], leafItem);
          let obj = leafItem.result;

          this.checkedItems = [obj.area_no];
          // this.treeKey = this.getUuid();
          this.getTableData(obj.area_no);
          // console.log(res,"到底什么是res啊--什么是res啊说话啊？？？")
        });
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

  created: function () {},

  mounted: async function () {
    // console.log("我晕=======")
    let tree = await this.getArrayList("lpark", "srvpark_park_area_select", [
      {
        key: "park_no",
      },
    ]);

    this.area = tree.park_no.array.map((item, index) => {
      return {
        ...item,
        label: item.park_name,
        value: item.park_no,
      };
    });
    this.getTree();
    console.log(this.area, "什么是this.area");
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
  