<template>
  <div class="ll-content">
    <div class="parent-content">
      <el-card class="height-percent" shadow="always">
        <div style="width: 100%; height: 100%" id="map-box"></div>
      </el-card>
    </div>
  </div>
</template>

<script>
import _ from "lodash";
let $ = require("jquery");
import "@/assets/common.scss";
import "bootstrap/js/dist/tooltip";
import "bootstrap/js/dist/popover";
import "bootstrap/js/dist/button";


$(function () {
  $('[data-toggle="tooltip"]').tooltip();
  $('[data-toggle="tooltip"]').popover();
});
export default {
  components: {},

  mixins: [],

  props: {},

  data() {
    return {};
  },

  methods: {},

  created: function () {},

  mounted: function () {
    var map = new MapPlus.Map("map-box");
    let JackMap = {};
    //  $('#id2').popover({
    //     template:`<div class="popover" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>`,
    //     trigger:'click',

    //  })
    // JackMap.Collection

    var cityCtrl = new BMapGL.LocationControl(); // 添加城市列表控件
    map.addControl(cityCtrl);

    // map.addEventListener("click", function (e) {
    //   // alert("点击的经纬度：" + e.latlng.lng + ", " + e.latlng.lat);
    //   // var mercator = map.lnglatToMercator(e.latlng.lng, e.latlng.lat);
    //   // alert("点的墨卡托坐标：" + mercator[0] + ", " + mercator[1]);
    // });

    let data = [
      {
        name: "jd",
        path: "shallowBlue1",
        mapJd: "jd",
        mapWd: "wd",
        jd: "108.948024",
        wd: "34.263161",
        text: "接单",
        driver: "李明",
      },
      {
        name: "gz",
        path: "orange1",
        jd: "114.341447",
        wd: "34.797049",
        text: "故障",
        driver: "任龙",
      },
    ];

    let covers = new MapPlus.Covers({
      points: data,

      callBack: {
        render(item, index, data) {
          let img = require(`@/assets/image/${item.path}.png`);
          let className = "";
          if (item.text == "接单") {
            className = "shallowBlueB";
          } else if (item.text == "休闲") {
            className = "deepBlueB";
          } else if (item.text == "故障") {
            className = "orangeB";
          }
          let overlay = new MapPlus.Cover({
            point: item,
            size: 2,
            str: `<div style="margin-top:-15px;margin-left:-13px;cursor:pointer" class="image-jack ${item.name}-icon">
             <img src="${img}" />
      </div>`,
            callBack: {
              click: ({ cover }) => {
                console.log(cover, "===map==");

                var opts = {
                  width: 120, // 信息窗口宽度
                  height: 100, // 信息窗口高度
                  // title: "Hello", // 信息窗口标题
                };

                let infoWindow = new BMapGL.InfoWindow(
                  `<div  class="ll-map-info">
                           <div class="ll-map-left">
                              <img src="${img}" />
                           </div>
                           <div class="ll-map-right">
                              <div class="ll-map-row">
                                 <div>${item.driver}</div>
                                 <div style="color:white" class="ll-map-jd ${className}">${item.text}</div>
                              </div>
                              <div class="ll-map-row">
                                    陕Au702
                              </div>

                                <div class="ll-map-gray">
                                   订单：20
                              </div>

                           </div>
             </div>`,
                  opts
                ); // 创建信息窗口对象
                console.log(infoWindow, "==infoWindow==");
                let point = cover.viewDatas[0];
                console.log(point);
                map.openInfoWindow(infoWindow, point);
              },
            },
          });

          return overlay;
        },
      },
    });
    covers.autoView = true;
    // map.addOverlay(covers);

    var polyline = new BMapGL.Polyline(covers.viewDatas, {
      strokeColor: "blue",
      strokeWeight: 6,
      strokeOpacity: 0.5,
    });

    // map.addOverlay(polyline);
    let img = require(`@/assets/image/orange1.png`);
    let cover = BMapGL.Icon({
      url: img,
    });

    let carImg = require(`@/assets/image/car2.png`);

    let lushu2 = new MapPlus.Lusu({
      map,
      speed: 400,
      cover: new MapPlus.Cover({
        point: covers.viewDatas[0],
        str: `<div class="testCover" style="
        width: 53px;
        height: 56px;
        margin-left: -10px;
        margin-top: -21px;
">
         <img style="width:100%;height:100%" src="${carImg}" />
        
        </div>`,
        callBack: {
          click(cover) {
            console.log("啊哈哈");
            let dom = cover.cover.dom;

            $(dom).popover("toggle");
          },
        },
      }),
      points: covers.viewDatas,
    });

   
    // map.addOverlay(lushu2.cover);
  

    let doubleArrow = require(`@/assets/image/doubleArrow.png`);
    let headerimg = require(`@/assets/image/header.png`);
   lushu2.start();
    $(lushu2.cover.dom).popover({
      trigger: "manual",
      container: lushu2.cover.dom,
      title: `123`,
      html: true,
      content: `<div>
            <div style="font-weight:800" class="flex-between">
               <div style="margin-bottom:10px" class="flex" class="left">
                     <div>西安</div>
                    <img style="margin-left:4px;margin-right:4px" src="${doubleArrow}"/>
                      <div>宝鸡</div>
               </div>

                <div  class="right">
                    运输中
               </div>
             
            </div>

            <div  class="ll-map-info">
                           <div class="ll-map-left">
                              <img src="${headerimg}" />
                           </div>
                           <div class="ll-map-right">
                              <div class="ll-map-row">
                                 <div>李面</div>
                                 <div style="color:white" class="ll-map-jd yellowBlueB">接单</div>
                              </div>
                              <div class="ll-map-row">
                                    陕Au702
                              </div>

                               <div class="ll-map-row">
                                   联系电话15225468005
                              </div>

                           </div>
             </div>
             <div style="width:100%" class="btn-group btn-group-toggle" data-toggle="buttons">
                     <label style="background-color: rgba(255, 255, 255, 1);border:1px solid #F8F8F8;
color: rgba(32, 46, 100, 1);" class="btn btn-secondary">
                            <input type="radio" name="options" id="option1" checked> 监控
                          </label>
                          <label style="background-color: rgba(255, 255, 255, 1);border:1px solid #F8F8F8;
" class="btn btn-secondary shallowBlueCI" >
                            <input type="radio" name="options" id="option2"> 温度~10度
                          </label>
                         
                      
                    </div>
      </div>`,
      template:
        '<div style="width:300px" class="popover" role="tooltip"><div class="arrow"></div><h3 style="display:none" class="popover-header"></h3><div class="popover-body"></div></div>',
      placement: "top",
      sanitize: false,
    });

    $(lushu2.cover.dom).popover("show");

    map.addEventListener("zoomstart", function (e) {
      let point = new BMapGL.Point(100, 60);
      let a = map.pointToPixel(point);

      let returnPoint = map.pointToOverlayPixel(point);
      console.log(returnPoint, "=returnPoint=returnPoint=");
      console.log(a, "what is a===--a==");
    });

    //  let isPoint=map.pixelToPoint(new BMapGL.Pixel(274, 253));

    // let obj = {
    //   icon: cover,
    //   speed: 10,
    //   "autoView":true,
    //  "enableRotation":true
    // };
    // let lushu = new BMapLib.LuShu(map, covers.viewDatas, obj);
   
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
