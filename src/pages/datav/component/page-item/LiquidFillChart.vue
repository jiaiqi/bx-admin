<template>
  <div class="liquid-chart-container">
    <div ref="chart" class="chart"></div>
  </div>
</template>

<script>
import * as echarts from "echarts";
import "echarts-liquidfill";

export default {
  props: {
    value: {
      type: Number,
      default: 0.5,
    },
    title: {
      type: String,
      default: "",
    },
    amount: {
      type: String,
      default: "",
    },
    color: {
      type: String,
      default: "#1890FF",
    },
  },
  data() {
    return {
      chart: null,
    };
  },
  mounted() {
    this.initChart();
  },
  methods: {
    initChart() {
      this.chart = echarts.init(this.$refs.chart);

      const option = {
        series: [
          {
            type: "liquidFill",
            radius: "80%",
            center: ["50%", "50%"],
            data: [this.value, this.value - 0.1, this.value - 0.2],
            backgroundStyle: {
              // color: "#fff",
              // borderWidth: 1,
              // borderColor: "#d9d9d9",
              color: "transparent",
            },
            outline: {
              show: true,
              borderDistance: 0,
              itemStyle: {
                borderWidth: 2,
                borderColor: {
                  type: "linear",
                  x: 0,
                  y: 0,
                  x2: 0,
                  y2: 1,
                  colorStops: [
                    {
                      offset: 0,
                      color: `${this.color}33`, // 30% opacity
                    },
                    {
                      offset: 1,
                      color: `${this.color}99`, // 60% opacity
                    },
                  ],
                },
              },
            },
            color: [
              {
                type: "linear",
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  {
                    offset: 0,
                    color: `${this.color}FF`, // 100% opacity
                  },
                  {
                    offset: 1,
                    color: `${this.color}99`, // 60% opacity
                  },
                ],
              },
            ],
            label: {
              normal: {
                formatter: Number((this.value * 100).toFixed(2)) + "%",
                textStyle: {
                  fontSize: 20,
                  color: this.color,
                },
              },
              // rich: {
              //   // title: {
              //   //   fontSize: 14,
              //   //   color: "#666",
              //   //   align: "left",
              //   //   lineHeight: 20,
              //   // },
              //   value: {
              //     fontSize: 24,
              //     color: this.color,
              //     fontWeight: "bold",
              //     align: "center",
              //     lineHeight: 30,
              //   },
              //   // amount: {
              //   //   fontSize: 12,
              //   //   color: "#999",
              //   //   align: "center",
              //   //   lineHeight: 18,
              //   // },
              // },
              position: ["50%", "50%"],
            },
            amplitude: 6,
            waveAnimation: true,
            animationDuration: 2000,
            animationEasing: "linear",
            animationDurationUpdate: 2000,
          },
        ],
      };

      this.chart.setOption(option);
    },
  },
  watch: {
    value() {
      this.initChart();
    },
  },
  beforeDestroy() {
    if (this.chart) {
      this.chart.dispose();
    }
  },
};
</script>

<style scoped lang="scss">
.liquid-chart-container {
  width: 100%;
  height: 100%;
  position: relative;
  .chart {
    width: 100%;
    height: 100%;
    min-width: 100px;
    min-height: 100px;
  }
}
</style>
