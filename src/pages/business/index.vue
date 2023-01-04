<style lang="scss" scoped>
.backgroundGray {
    background-color: rgba(245, 246, 249, 1);
}

.up {
    position: relative;
    color: rgba(174, 174, 178, 1);
}

.up::after {
    content: "";
    display: inline-block;
    background-image: url("~@/pages/business/static/up2.png");
    background-size: 100% 100%;
    width: 19px;
    position: absolute;
    top: -5px;
    height: 26px;
    margin-right: 10px;
}

.down {
    position: relative;
    color: rgba(174, 174, 178, 1);
}

.down::after {
    content: "";
    display: inline-block;
    background-image: url("~@/pages/business/static/down2.png");
    background-size: 100% 100%;
    width: 19px;
    position: absolute;
    top: -5px;
    height: 26px;
    margin-right: 10px;

}

.card-block {
    width: 100%;
    background-color: rgba(245, 246, 249, 1);
    border-radius: 5px;
    padding: 26px 20px;
    display: flex;

    .left {
        flex: 1;
        border-right: 1px solid rgba(229, 229, 234, 1);
    }

    .top2 {
        font-size: 28px;
        font-weight: 700;
        height: 51px
    }

    .top3 {
        box-sizing: border-box;
        font-size: 14px;
        text-align: center;
        font-family: PingFangSC-regular;
        color: rgba(83, 83, 83, 1);
    }

    .isPadding {
        padding-bottom: 4px;
    }


}
</style>
<template>
    <div class="ll-content">
        <div class="parent-content">
            <div class="top-cards">
                <el-card shadow="always">
                    <div class="common-title">
                        商铺营业情况
                    </div>

                    <div class="cards-content">
                        <el-row gutter="24">
                            <el-col :span="8">
                                <div style="width:100%;background-color: rgba(245, 246, 249, 1);border-radius:5px;padding:26px 20px;display: flex;"
                                    class="card-block">
                                    <div style="flex: 1;border-right: 1px solid rgba(229, 229, 234, 1);" class="left">
                                        <div class="flex-center top">
                                            今日销售额(元)
                                        </div>
                                        <div class="flex-center top2">
                                            ¥1.22万
                                        </div>
                                        <div class="flex-center top3 isPadding">
                                            本周：¥6.83万
                                        </div>
                                        <div class="flex-center top3">
                                            本月：¥6.83万
                                        </div>

                                    </div>
                                    <div style="flex: 1;" class="right">

                                        <div class="flex-center top">
                                            今日订单数
                                        </div>
                                        <div class="flex-center top2">
                                            69
                                        </div>
                                        <div class="flex-center top3 isPadding">
                                            本周4
                                        </div>
                                        <div class="flex-center top3">
                                            本月：199
                                        </div>
                                    </div>

                                </div>
                            </el-col>

                            <el-col :span="8">
                                <div style="width:100%;background-color: rgba(245, 246, 249, 1);border-radius:5px;padding:26px 20px;display: flex;"
                                    class="card-block">
                                    <div style="flex: 1;border-right: 1px solid rgba(229, 229, 234, 1);" class="left">
                                        <div class="flex-center top">
                                            今日新增客户
                                        </div>
                                        <div class="flex-center top2">
                                            12
                                        </div>
                                        <div class="flex-center top3 isPadding">
                                            本周：5
                                        </div>
                                        <div class="flex-center top3">
                                            本月：77
                                        </div>

                                    </div>
                                    <div style="flex: 1;" class="right">

                                        <div class="flex-center top">
                                            今日回购用户
                                        </div>
                                        <div class="flex-center top2">
                                            69
                                        </div>
                                        <div class="flex-center top3 isPadding">
                                            本周3
                                        </div>
                                        <div class="flex-center top3">
                                            本月：199
                                        </div>
                                    </div>

                                </div>

                            </el-col>

                            <el-col :span="8">
                                <div style="width:100%;background-color: rgba(245, 246, 249, 1);border-radius:5px;padding:26px 20px;display: flex;"
                                    class="card-block">
                                    <div style="flex: 1;border-right: 1px solid rgba(229, 229, 234, 1);" class="left">
                                        <div class="flex-center top">
                                            今日入库订单
                                        </div>
                                        <div class="flex-center top2">
                                            12
                                        </div>
                                        <div class="flex-center top3 isPadding">
                                            本周：5
                                        </div>
                                        <div class="flex-center top3">
                                            本月：277
                                        </div>

                                    </div>
                                    <div style="flex: 1;" class="right">

                                        <div class="flex-center top">
                                            今日出库订单
                                        </div>
                                        <div class="flex-center top2">
                                            69
                                        </div>
                                        <div class="flex-center top3 isPadding">
                                            本周37
                                        </div>
                                        <div class="flex-center top3">
                                            本月：299
                                        </div>
                                    </div>

                                </div>


                            </el-col>


                        </el-row>
                    </div>



                </el-card>
            </div>

            <div style="padding-top: 20px;" class="middle-content">
                <el-row gutter="24">
                    <el-col :span="8">
                        <el-card shadow="always">
                            <div class="middle-card-box">
                                <div class="common-title">
                                    <span>商铺营业情况</span>
                                    <more></more>
                                </div>
                                <el-row gutter="24">
                                    <el-col :span="12">
                                        <div class="display:flex;align-items:center;justify-content:center;height:200px"
                                            style="background-color: rgba(245, 246, 249, 1);padding: 10px 20px;">
                                            <div style="font-weight:600;">2956</div>
                                            <div>累计客户数</div>

                                        </div>
                                    </el-col>

                                    <el-col :span="12">
                                        <div class="display:flex;align-items:center;justify-content:center;height:200px"
                                            style="background-color: rgba(245, 246, 249, 1);padding: 10px 20px;">
                                            <div style="font-weight:600;">2956</div>
                                            <div>累计客户数</div>

                                        </div>


                                    </el-col>



                                </el-row>
                                <div style="box-sizing: border-box;padding-top: 10px;flex: 1;overflow: hidden;">
                                    <div style="height: 100%;" ref="echartsOne">

                                    </div>
                                </div>


                            </div>
                        </el-card>
                    </el-col>

                    <el-col :span="8">
                        <el-card shadow="always">
                            <div class="middle-card-box">
                                <div class="common-title">
                                    <span>销量分析</span>
                                    <more></more>
                                </div>

                                <div style="height:50px;padding-bottom: 20px;box-sizing: border-box;"
                                    class="flex-center">
                                    <div class="flex-column">
                                        <div style="font-weight:800;box-sizing: border-box;padding-bottom: 5px;"
                                            class="flex-center">89.25</div>
                                        <div class="flex-center">当前总销售额(万元)</div>
                                    </div>
                                </div>
                                <div style="border-radius: 6px;box-sizing: border-box;padding-top: 20px;"
                                    class="backgroundGray">
                                    <el-row gutter="0">
                                        <el-col :span="8">
                                            <div style="padding: 10px 20px;" class="backgroundGray flex-between">
                                                <div style="height:46px" class="block flex-column-between">
                                                    <div class="top-content flex-center">
                                                        <span class="down">比上月</span>
                                                    </div>
                                                    <div class="flex-center" style="font-weight: 800;">
                                                        4.72
                                                    </div>

                                                </div>

                                            </div>


                                        </el-col>

                                        <el-col :span="8">
                                            <div style="padding: 10px 20px;" class="backgroundGray flex-between ">
                                                <div style="height:46px" class="block flex-column-between">
                                                    <div class="top-content flex-center">
                                                        <span class="up">比上月</span>
                                                    </div>
                                                    <div class="flex-center" style="font-weight: 800;">
                                                        4.72
                                                    </div>

                                                </div>

                                            </div>

                                        </el-col>

                                        <el-col :span="8">

                                            <div style="padding: 10px 20px;" class="backgroundGray flex-between">
                                                <div style="height:46px" class="block flex-column-between">
                                                    <div class="top-content flex-center">
                                                        <span class="down">比上月</span>
                                                    </div>
                                                    <div class="flex-center" style="font-weight: 800;">
                                                        4.72
                                                    </div>

                                                </div>

                                            </div>




                                        </el-col>


                                    </el-row>

                                </div>
                                <div
                                    style="display: flex;box-sizing:border-box;padding-top:15px;flex: 1;flex-direction: column;">

                                    <div class="line-title2 flex-between">
                                        <div style="
color: rgba(174, 174, 178, 1);
font-size: 14px;
text-align: left;
font-weight:550;
padding-bottom: 16px;
font-family: PingFangSC-regular;">销售趋势变化</div>
                                        <div>
                                            <el-date-picker size="mini" v-model="value1" type="datetime"
                                                placeholder="选择日期时间">
                                            </el-date-picker>
                                        </div>
                                    </div>
                                    <div style="flex:1" ref="echartsTwo">

                                    </div>

                                </div>


                            </div>
                        </el-card>
                    </el-col>

                    <el-col :span="8">
                        <el-card shadow="always">
                            <div class="middle-card-box">
                                <div class="common-title">
                                    <span>采购分析</span>
                                    <more></more>
                                </div>

                                <div style="height:80px;padding:10px 10px" class="flex-between backgroundGray">
                                    <div style="flex:1" class="block-box flex-center flex-column">
                                        <div style="font-weight:700">16</div>
                                        <div>供应商总数</div>
                                    </div>
                                    <div style="flex:1" class="block-box flex-center flex-column">
                                        <div style="font-weight:700">1208</div>
                                        <div>累计采购单</div>
                                    </div>
                                    <div style="flex:1" class="block-box flex-center flex-column">
                                        <div style="font-weight:700">¥7.43万</div>
                                        <div>采购订单总额</div>
                                    </div>


                                </div>

                                <div style="flex: 1;padding-top: 20px;box-sizing: border-box;" class="table-box">
                                    <div style="height:100%" ref="table">
                                        <el-table ref="tables" :data="tableData" fit="{false}">
                                            <el-table-column :formatter="item.formatter" :key="item.key"
                                                v-for="item in tableHeaders" :prop="item.prop" :label="item.label"
                                                :width="item.width">
                                            </el-table-column>
                                        </el-table>

                                    </div>
                                </div>




                            </div>
                        </el-card>
                    </el-col>


                </el-row>

            </div>
            <div style="padding-top:20px" class="final-content">
                <el-card shadow="always">
                    <div class="common-title">
                        <div>常用功能</div>
                        <div style="border-bottom:1px solid rgba(56, 148, 255, 100);">
                            设置
                        </div>
                    </div>

                    <div style="padding-top: 15px">
                        <el-row gutter="24">
                            <el-col :span="3">
                                <div class="flex-column image-block">
                                    <img :src="require('@/assets/staff/yhxx1.png')" />
                                    <div>用户信息</div>
                                </div>
                            </el-col>
                            <el-col :span="3">
                                <div class="flex-column image-block">
                                    <img :src="require('@/assets/staff/swsb1.png')" />
                                    <div>个人绩效</div>
                                </div>
                            </el-col>
                            <el-col :span="3">
                                <div class="flex-column image-block">
                                    <img :src="require('@/assets/staff/zzsq1.png')" />
                                    <div>转正申请</div>
                                </div>
                            </el-col>
                            <el-col :span="3">
                                <div class="flex-column image-block">
                                    <img :src="require('@/assets/staff/wdht1.png')" />
                                    <div>我的合同</div>
                                </div>
                            </el-col>

                            <el-col :span="3">
                                <div class="flex-column image-block">
                                    <img :src="require('@/assets/staff/oa1.png')" />
                                    <div>OA审核</div>
                                </div>
                            </el-col>
                            <el-col :span="3">
                                <div class="flex-column image-block">
                                    <img :src="require('@/assets/staff/zcgl1.png')" />
                                    <div>自主开票</div>
                                </div>
                            </el-col>
                            <el-col :span="3">
                                <div class="flex-column image-block">
                                    <img :src="require('@/assets/staff/zcgl1.png')" />
                                    <div>资产管理</div>
                                </div>
                            </el-col>
                            <el-col :span="3">
                                <div class="flex-column image-block">
                                    <img :src="require('@/assets/staff/swsb1.png')" />
                                    <div>税务申报</div>
                                </div>
                            </el-col>
                        </el-row>


                    </div>


                </el-card>

            </div>



        </div>
    </div>
</template>

<style scoped>
/* .#F1F2F7 */

.table-box /deep/ thead th {
    background-color: rgb(245, 246, 249);
    color: black;
    padding-left: 10px;


}
</style>

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
        initEchart1() {
            this.myCharts1 = this.$echarts.init(this.$refs.echartsOne);
            let options = {
                color: ["#007AFF", "#34C758"],
                tooltip: {
                    //鼠标悬浮框的提示文字
                    trigger: "axis",
                },
                legend: {
                    data: ["新增", "回购"],
                    // icon: "rectangle",
                    x: "center",

                },
                xAxis: {
                    type: 'category',
                    data: ["类型1", "类型2", "类型3", "类型4", "类型5", "类型6", "类型7"],
                    axisLine: {
                        show: false,
                        lineStyle: {
                            color: "#837884", //x轴轴线颜色
                        },
                    },
                },
                yAxis: {
                    type: 'value',
                    axisLine: {
                        show: false,
                        lineStyle: {
                            color: "#837884", //x轴轴线颜色
                        },
                    },
                },
                series: [{
                    data: [100, 150, 120, 90, 50, 130, 110],
                    type: 'bar',
                    name: '新增',
                    label: {
                        show: true,
                        position: 'top'
                    },
                },
                {
                    data: [100, 150, 120, 90, 50, 130, 110],
                    type: 'bar',
                    name: '回购',
                    label: {
                        show: true,
                        position: 'top'
                    },
                }
                ]
            };
            this.myCharts1.setOption(options);
        },
        async initEchart2() {
        
            
        

            this.myCharts2 = this.$echarts.init(this.$refs.echartsTwo);
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
                    show: false
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
                    // {
                    //     name: "零担",
                    //     type: "line", //pie->饼状图  line->折线图  bar->柱状图
                    //     data: [50, 120, 130, 150, 160, 200, 250],
                    //     areaStyle: {
                    //         color: "#DBDFF5",
                    //     },
                    // },
                    {
                        name: "整发",
                        type: "line", //pie->饼状图  line->折线图  bar->柱状图
                        data: [50, 120, 130, 50, 60, 400, 750],
                        areaStyle: {
                            color: "#DBDFF5",
                        },
                    },
                ],
            };

            this.myCharts2.setOption(options);
        },
        initTable() {

        }
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
            //   {
            //     label: "first",
            //     formatter: (one, two, thee) => {
            //       let tail;
            //       if (one.index > 2) {
            //         tail = "last";
            //       } else {
            //         tail = one.index;
            //       }
            //       return (
            //         <div class={`ll-circle color${tail}`}>
            //           <span>{one.index + 1}</span>
            //         </div>
            //       );
            //     },
            //     prop: "first",
            //     width: "36",
            //     label: "",
            //   },
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
                // width: "10",
                formatter,
            },
            {
                label: "摘要",
                prop: "one",
                // width: "320",
                formatter,
            },
            {
                label: "流程状态",
                prop: "one",
                // width: "160",
                formatter,
            }

        ];

        this.initEchart1();
        this.initEchart2();
        this.initTable();

        // this.$refs.twoEcharts.addEventListener("resize", () => {

        // });


    },
};
</script>

<style scoped>
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
.middle-card-box {
    height: 500px;
    display: flex;
    flex-direction: column;
}

.common-title {
    color: rgba(33, 33, 33, 1);
    font-size: 16px;
    text-align: left;
    font-family: SourceHanSansSC-bold;
    font-weight: 800;
    box-sizing: border-box;
    padding-bottom: 10px;
    display: flex;
    justify-content: space-between;

}


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
        background: #05C998 !important;

        .height-row.top {
            .left {
                span {
                    color: white !important;
                }

            }

            .right {
                .button-tag {
                    background: white !important;
                    color: #05C998 !important;
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
    background: linear-gradient(103.21deg, rgba(222, 228, 249, 1) 7.85%, rgba(222, 228, 249, 0) 81.76%);
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
