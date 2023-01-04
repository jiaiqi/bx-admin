<template>
    <div class="ll-content">
        <div class="parent-content">

            <el-card shadow="always">


                <div style="padding-bottom: 17px;box-sizing: border-box;" class="handle-row flex-between">
                    <div class="left">
                        <el-select size="mini" v-model="value" placeholder="楼号楼层" style="width: 120px">
                            <el-option v-for="item in options" :key="item.value" :label="item.label"
                                :value="item.value">
                            </el-option>
                        </el-select>

                        <el-input size="mini" style="width: 160px; margin-right: 15px" v-model="input"
                            placeholder="请输入仓库编号"></el-input>

                        <el-select size="mini" v-model="value" style="width: 145px; margin-right: 15px"
                            placeholder="请选择仓库类型">
                            <el-option v-for="item in options" :key="item.value" :label="item.label"
                                :value="item.value">
                            </el-option>
                        </el-select>

                        <el-select size="mini" style="width: 145px; margin-right: 15px" v-model="value"
                            placeholder="请选择出租状态">
                            <el-option v-for="item in options" :key="item.value" :label="item.label"
                                :value="item.value">
                            </el-option>
                        </el-select>

                        <el-select size="mini" v-model="value" style="width: 145px; margin-right: 15px"
                            placeholder="请选择租金状态">
                            <el-option v-for="item in options" :key="item.value" :label="item.label"
                                :value="item.value">
                            </el-option>
                        </el-select>

                        <el-select size="mini" v-model="value" style="width: 145px; margin-right: 15px"
                            placeholder="请选择库存状态">
                            <el-option v-for="item in options" :key="item.value" :label="item.label"
                                :value="item.value">
                            </el-option>
                        </el-select>

                        <el-select size="mini" v-model="value" style="width: 145px; margin-right: 15px"
                            placeholder="请选择仓库面积">
                            <el-option v-for="item in options" :key="item.value" :label="item.label"
                                :value="item.value">
                            </el-option>
                        </el-select>
                    </div>

                    <div class="right">
                        <el-button size="mini" type="primary">搜索</el-button>
                    </div>
                </div>
                <div class="c-border">

                </div>

                <div :key="key" v-for=" (val, key , i) in objData" class="block-content">
                    <div style="height: 30px; display: flex;align-items: center;font-weight: 800;" class="custom-title">
                        <span style="margin-left: 17px;">{{key}}</span>
                    </div>
                    <div class="bottom-content">


                        <el-row :gutter="24">
                           

                            <el-col  v-if="item.category_name == '冷库'" :key="item.park_name"  v-for="(item , index) in val" :span="6">
                                <div style="color:white;border-radius: 4px;
background-color: rgba(99, 129, 234, 1);width:100%" class="custom-card flex-column-between isGray">
                                    <div class="height-row top flex-between">
                                        <div class="left">
                                            <span
                                                style="margin-right:15px;color: rgba(255, 255, 255, 1);font-size: 16px;text-align: right;font-family: SourceHanSansSC-regular;">
                                              {{item.category_name}}
                                            </span>
                                            <span
                                                style="color: rgba(255, 255, 255, 1);font-size: 19px;font-weight: 800;">
                                             {{item.category_no}}
                                            </span>

                                        </div>

                                        <div class="right">
                                            <div style="height: 22px;
    width: 28px;
    border-radius: 3px;height: 20px;width: 20px;background-color: rgba(255, 255, 255, 1);color: rgba(77, 95, 204, 1);"
                                                class="button-tag flex-center">
                                                {{item.rent_status}}
                                            </div>

                                        </div>
                                    </div>

                                    <div class="height-row middle flex-between">
                                        <div style="font-size: 20px;" class="left">
                                             {{item.rent_store_name}}
                                        </div>
                                        <div class="right over-progress">
                                            <el-progress color="white" text-color="black" define-back-color="yellow"
                                                style="width:80px" :text-inside="true" :stroke-width="26"
                                                :percentage="70">
                                            </el-progress>
                                        </div>
                                    </div>

                                    <div style="font-weight: 700;" class="height-row bottom flex-between">
                                        <div class="left">
                                             {{item.stockroom_extent}}m2
                                        </div>
                                        <div class="right">
                                            欠费{{item.rent_arrears}}元
                                        </div>
                                    </div>

                                </div>

                            </el-col>

                        </el-row>

                    </div>
                </div>

                <div class="block-content">
                    <div style="height: 30px; display: flex;align-items: center;font-weight: 800;" class="custom-title">
                        <span style="margin-left: 17px;">B座三楼仓库</span>
                    </div>
                    <div class="bottom-content">


                        <el-row :gutter="24">
                            <el-col :span="6">


                                <div style="color:white;border-radius: 4px;
background-color: rgba(99, 129, 234, 1);width:100%" class="custom-card flex-column-between">
                                    <div class="height-row top flex-between">
                                        <div class="left flex">
                                            <span
                                                style="margin-right:15px;color: rgba(255, 255, 255, 1);font-size: 16px;text-align: right;font-family: SourceHanSansSC-regular;">冷库</span>
                                            <span
                                                style="color: rgba(255, 255, 255, 1);font-size: 19px;font-weight: 800;">S2-01</span>
                                            <i style="color:red;margin-left: 12px;" class="el-icon-warning"></i>

                                        </div>

                                        <div class="right">
                                            <div style="height: 22px;
width: 28px;
border-radius: 3px;height: 20px;width: 20px;background-color: rgba(255, 255, 255, 1);color: rgba(77, 95, 204, 1);"
                                                class="button-tag flex-center">
                                                租
                                            </div>

                                        </div>
                                    </div>

                                    <div class="height-row middle flex-between">
                                        <div style="font-size: 20px;" class="left">
                                            双汇冷鲜食品2

                                        </div>
                                        <div class="right over-progress">
                                            <el-progress color="white" text-color="black" define-back-color="yellow"
                                                style="width:80px" :text-inside="true" :stroke-width="26"
                                                :percentage="70">
                                            </el-progress>
                                        </div>
                                    </div>

                                    <div style="font-weight: 700;" class="height-row bottom flex-between">
                                        <div class="left">
                                            4.5m2
                                        </div>
                                        <div class="right">
                                            欠费2572元
                                        </div>
                                    </div>

                                </div>


                            </el-col>

                            <el-col :span="6">
                                <div style="color:white;border-radius: 4px;
background-color: rgba(99, 129, 234, 1);width:100%" class="custom-card flex-column-between isGreen">
                                    <div class="height-row top flex-between">
                                        <div class="left">
                                            <span
                                                style="margin-right:15px;color: rgba(255, 255, 255, 1);font-size: 16px;text-align: right;font-family: SourceHanSansSC-regular;">冷库</span>
                                            <span
                                                style="color: rgba(255, 255, 255, 1);font-size: 19px;font-weight: 800;">S2-01</span>

                                        </div>

                                        <div class="right">
                                            <div style="height: 22px;
width: 28px;
border-radius: 3px;height: 20px;width: 20px;background-color: rgba(255, 255, 255, 1);color: rgba(77, 95, 204, 1);"
                                                class="button-tag flex-center">
                                                租
                                            </div>

                                        </div>
                                    </div>

                                    <div class="height-row middle flex-between">
                                        <div style="font-size: 20px;" class="left">
                                            双汇冷鲜食品
                                        </div>
                                        <div class="right over-progress">
                                            <el-progress color="white" text-color="black" define-back-color="yellow"
                                                style="width:80px" :text-inside="true" :stroke-width="26"
                                                :percentage="70">
                                            </el-progress>
                                        </div>
                                    </div>

                                    <div style="font-weight: 700;" class="height-row bottom flex-between">
                                        <div class="left">
                                            4.5m2
                                        </div>
                                        <div class="right">
                                            欠费2572元
                                        </div>
                                    </div>

                                </div>

                            </el-col>

                            <el-col :span="6">

                            </el-col>

                            <el-col :span="6">

                            </el-col>
                        </el-row>

                    </div>
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
           
            objData:{},
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
      async  initCard() {
            let condition = {"serviceName":"srvpark_stockroom_info_select",
            "colNames":["*"],"condition":[],
            "relation_condition":{},
            "order":[],"draft":false,
            "query_source":"list_page"}

            let returnData = await this.$httpYq.post("/select/srvpark_stockroom_info_select?srvpark_stockroom_info_select", condition);

            let obj={};
            
            returnData.data.data.forEach((item,index)=>{
                    if(!obj[`${item.area_name}`]){
                        obj[`${item.area_name}`]=[];
                    }else{
                        obj[`${item.area_name}`].push(item);
                    }
                    if(item.category_name == '干库'){
                        item.background='green';
                    }
                    if(item.category_name == '冷库'){
                        item.background='blue';
                    }
            });
            this.objData=obj;
            

          
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
        this.initCard()
        this.$refs.twoEcharts.addEventListener("resize", () => {


        });


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
