<template>
    <div class="ll-content">
        <el-card shadow="always">
            <div class="parent-content">
                <div style="box-sizing: border-box;
    padding-bottom: 19px;">
                    <el-select size="mini" v-model="value" placeholder="请选择">
                        <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"
                            :disabled="item.disabled">
                        </el-option>
                    </el-select>
                    <span style="font-weight: 800;
    color: rgb(57, 69, 171);
    font-size: 14px;
    text-align: left;
    margin-left: 10px;
    font-family: SourceHanSansSC-regular;">仓库态势图</span>


                </div>

                <div style="display:flex;background: white; ">


                    <div style="width: 260px;border: 1px solid rgba(241, 242, 247, 1);" class="left">
                        <div style="padding: 10px 20px;" class="header custom-input-box">
                            <el-input v-model="content" size="mini" placeholder="请输入内容">
                                <template #prefix>
                                    <div style="cursor: pointer;"> <i class="el-icon-search"></i></div>
                                </template>

                            </el-input>
                        </div>
                        <div class="bottom-content">
                            <div class="custom-title">选择楼层</div>
                            <div style="box-sizing: border-box;padding-top: 20px;" class="tree-content">
                                <div v-for="(item, index) in layers"
                                    :class="item.isActive ? 'left-row' : 'left-row isActive'">
                                    {{ item.name }}</div>

                            </div>

                        </div>

                    </div>
                    <div style="flex: 1;box-sizing: border-box;padding-left: 22px;" class="right">
                        <div class="zxt">
                            <div class="custom-title flex-between">
                                <span>选择楼层</span>

                                <el-date-picker size="mini " v-model="value1" type="date" placeholder="选择日期">
                                </el-date-picker>


                            </div>
                            <div style="box-sizing:border-box;padding-bottom:10px;padding-top: 20px;" class="zx-block">
                                <div ref="echarts1" class="echarts-container">

                                </div>

                            </div>
                            <div style="box-sizing:border-box;padding-bottom:10px" class="zx-block">
                                <div ref="echarts2" class="echarts-container">

                                </div>
                            </div>

                            <div style="box-sizing:border-box;padding-bottom:10px" class="zx-block">
                                <div ref="echarts3" class="echarts-container">

                                </div>
                            </div>
                        </div>
                        <div class="vedio">
                            <div class="custom-title flex-between">
                                <span>仓库视频监控</span>

                                <el-date-picker size="mini " v-model="value1" type="date" placeholder="选择日期">
                                </el-date-picker>


                            </div>
                            <div style="box-sizing: border-box;padding-top: 15px;" class="vedio-content">

                                <el-row :gutter="24">
                                    <el-col :span="6">

                                        <div style="border: 1px solid rgba(241, 242, 247, 1);" class="vedio-card">
                                            <video controls style="height:130px;width: 100%;">
                                                <source src="./changan.mp4" type="video/mp4">
                                            </video>
                                            <div style="font-weight:500;border-top:  1px solid rgba(241, 242, 247, 1);padding:10px 20px;color: rgba(50, 66, 116, 1);;font-size: 14px;text-align: left;font-family: SourceHanSansSC-regular;"
                                                class="bottom-font">
                                                监控1
                                            </div>
                                        </div>
                                    </el-col>

                                    <el-col :span="6">

                                        <div style="border: 1px solid rgba(241, 242, 247, 1);" class="vedio-card">
                                            <video controls style="height:130px;width: 100%;">
                                                <source src="./changan.mp4" type="video/mp4">
                                            </video>
                                            <div style="font-weight:500;border-top:  1px solid rgba(241, 242, 247, 1);padding:10px 20px;color: rgba(50, 66, 116, 1);;font-size: 14px;text-align: left;font-family: SourceHanSansSC-regular;"
                                                class="bottom-font">
                                                监控1
                                            </div>
                                        </div>
                                    </el-col>

                                    <el-col :span="6">

                                        <div style="border: 1px solid rgba(241, 242, 247, 1);" class="vedio-card">
                                            <video controls style="height:130px;width: 100%;">
                                                <source src="./changan.mp4" type="video/mp4">
                                            </video>
                                            <div style="font-weight:500;border-top:  1px solid rgba(241, 242, 247, 1);padding:10px 20px;color: rgba(50, 66, 116, 1);;font-size: 14px;text-align: left;font-family: SourceHanSansSC-regular;"
                                                class="bottom-font">
                                                监控1
                                            </div>
                                        </div>
                                    </el-col>

                                    <el-col :span="6">

                                        <div style="border: 1px solid rgba(241, 242, 247, 1);" class="vedio-card">
                                            <video controls style="height:130px;width: 100%;">
                                                <source src="./changan.mp4" type="video/mp4">
                                            </video>
                                            <div style="font-weight:500;border-top:  1px solid rgba(241, 242, 247, 1);padding:10px 20px;color: rgba(50, 66, 116, 1);;font-size: 14px;text-align: left;font-family: SourceHanSansSC-regular;"
                                                class="bottom-font">
                                                监控1
                                            </div>
                                        </div>
                                    </el-col>
                                </el-row>


                            </div>

                        </div>


                    </div>

                </div>
            </div>

        </el-card>


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
            content: '',
            myCharts1: null,
            myCharts2: null,
            value1: '',
            layers: [
                {
                    name: 'A座B01',
                    isActive: false
                },
                {
                    name: 'A座B02',
                    isActive: false
                },
                {
                    name: 'A座B03',
                    isActive: false
                },
                {
                    name: 'A座B03',
                    isActive: true
                }
            ],
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
            this.myCharts1 = this.$echarts.init(this.$refs.echarts1);
            let options = {
                title: {
                    text: "传感器A（门口）", //图表顶部的标题
                    show: true,
                    x: "20px",
                    y: '10px',
                    textStyle: {
                        //文字颜色
                        color: `rgba(50, 66, 116, 1)`,
                        //字体风格,'normal','italic','oblique'
                        fontStyle: 'normal',
                        //字体粗细 'normal','bold','bolder','lighter',100 | 200 | 300 | 400...
                        fontWeight: '510',
                        //字体系列
                        fontFamily: 'sans-serif',
                        //字体大小
                        fontSize: 16
                    }

                },
                color: ["#4D5FCC", "#F77A50"],
                tooltip: {
                    //鼠标悬浮框的提示文字
                    trigger: "axis",
                },
                legend: {
                    data: ["零担", "整发"],
                    icon: "square",
                    x: "center",
                    y: '10px'
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
                        // areaStyle: {
                        //     color: "#E1CBD4",
                        // },
                    },
                ],
            };

            this.myCharts1.setOption(options);
        },
        initEchats2() {
            console.log(this.$refs.echarts2, "===this.$refs.echarts2==this.$refs.echarts2");
            this.myCharts1 = this.$echarts.init(this.$refs.echarts2);
            let options = {
                title: {
                    text: "传感器A（门口）", //图表顶部的标题
                    show: true,
                    x: "20px",
                    y: '10px',
                    textStyle: {
                        //文字颜色
                        color: `rgba(50, 66, 116, 1)`,
                        //字体风格,'normal','italic','oblique'
                        fontStyle: 'normal',
                        //字体粗细 'normal','bold','bolder','lighter',100 | 200 | 300 | 400...
                        fontWeight: '510',
                        //字体系列
                        fontFamily: 'sans-serif',
                        //字体大小
                        fontSize: 16
                    }

                },
                color: ["#4D5FCC", "#F77A50"],
                tooltip: {
                    //鼠标悬浮框的提示文字
                    trigger: "axis",
                },
                legend: {
                    data: ["零担", "整发"],
                    icon: "square",
                    x: "center",
                    y: '10px'
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
                        // areaStyle: {
                        //     color: "#E1CBD4",
                        // },
                    },
                ],
            };

            this.myCharts1.setOption(options);
        },
        initEchats3() {
            console.log();
            this.myCharts1 = this.$echarts.init(this.$refs.echarts3);
            let options = {
                title: {
                    text: "传感器A（门口）", //图表顶部的标题
                    show: true,
                    x: "20px",
                    y: '10px',
                    textStyle: {
                        //文字颜色
                        color: `rgba(50, 66, 116, 1)`,
                        //字体风格,'normal','italic','oblique'
                        fontStyle: 'normal',
                        //字体粗细 'normal','bold','bolder','lighter',100 | 200 | 300 | 400...
                        fontWeight: '510',
                        //字体系列
                        fontFamily: 'sans-serif',
                        //字体大小
                        fontSize: 16
                    }

                },
                color: ["#4D5FCC", "#F77A50"],
                tooltip: {
                    //鼠标悬浮框的提示文字
                    trigger: "axis",
                },
                legend: {
                    data: ["零担", "整发"],
                    icon: "square",
                    x: "center",
                    y: '10px'
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
                        // areaStyle: {
                        //     color: "#E1CBD4",
                        // },
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

    },

    mounted: function () {
        this.initEchats();
        this.initEchats2();
        this.initEchats3();
        // this.$refs.twoEcharts.addEventListener("resize", () => {
        //     console.log(this.myCharts1, "==this.myCharts1==");

        //     this.myCharts2.resize();

        // });

        // this.initEchats2();
    },
};
</script>
  
<style scoped>
.custom-input-box /deep/ .el-input__prefix {
    left: 7px;
    top: 5px;
    -webkit-transition: all .3s;
    transition: all .3s;
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
.zx-block {}

.echarts-container {
    height: 250px;
    width: 100%;
    border: 1px solid rgba(241, 242, 247, 1);
}

.custom-title {
    position: relative;
    background: linear-gradient(103.21deg, rgba(222, 228, 249, 1) 7.85%, rgba(222, 228, 249, 0) 81.76%);
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
    color: #A1A8BF;
    background-color: rgba(241, 242, 247, 0.5);
    cursor: pointer;
}

.left-row:hover {
    background-color: rgba(222, 228, 249, 1);
    color: #5E6ED1;
}

.left.isActive {
    background-color: rgba(222, 228, 249, 1);
    color: #5E6ED1;
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
  