export const useBuildOption = (type, pageItem, cellData = []) => {
  let chartJson = pageItem?.chart_json || {
    chart_no: "CT2212240005",
    chart_type: "折线图",
    legend_disp: "下",
    series_value: "列数据",
    series_value_cols: "index1,index2,index3",
    series_name_cfg: "收入,订单数,费用",
    sort_axis: "某列数据值",
    sort_axis_col: "sort1",
  };
  let ecOptions = {
    grid: {
      // 这里可以防止Y轴显示不全
      top: "15%",
      left: "8%",
      right: "8%",
      bottom: "8%",
      containLabel: true,
    },
    legend: {
      data: [],
      itemStyle: {
        color: pageItem?.style_json?.color || "#848EAC",
      },
      textStyle: {
        color: pageItem?.style_json?.color || "#848EAC",
      },
    }, //展示的折线图标题
    xAxis: {
      type: "category", // 还有其他的type，可以去官网喵两眼哦
      data: [], // x轴数据
      axisTick: {
        show: true, //是否显示刻度
        // alignWithLabel: true, //对齐文字
        // interval: '0',
        // length: 5, //标度标尺的长度
        inside: false, //刻度尺 标记 朝内 朝外
      },
      axisLabel: {
        show: true,
        // interval: 0, //刻度显示间隔 0代表 全部显示 1代表这个 隔一个显示一个
        rotate: chartJson.sort_label_ccw_rotation, //对刻度进行角度旋转 竖着显示
        textStyle: {
          fontWeight: 400,
          fontSize: 10,
          color: pageItem?.style_json?.color || "#848EAC",
        },
      },
      axisLine: {
        lineStyle: {
          color: pageItem?.style_json?.color || "#848EAC",
        },
      },
    },
    yAxis: [
      {
        type: "value",
        min: pageItem.min,
        max: pageItem.max,
        // min: chartJson.index_min,
        // max: chartJson.index_max,
        name: chartJson.y1_unit,
        //坐标轴最大值、最小值、强制设置数据的步长间隔
        // interval: chartJson.interval,

        axisLabel: {
          textStyle: {
            fontWeight: 400,
            fontSize: 10,
            color: pageItem?.style_json?.color || "#848EAC",
          },
          formatter: "{value}",
        },
        axisLine: {
          show: true,
          lineStyle: {
            color: pageItem?.style_json?.color || "#848EAC",
          },
        },
        splitLine: {
          //修改背景线条样式
          show: false, //是否展示
          lineStyle: {
            color: "#E8E8E8", //线条颜色
            type: "dashed", //线条样式，默认是实现，dashed是虚线
          },
        },
      },
    ],
    tooltip: {
      trigger: "item", // axis 代表着同列的所有项的值  item  单个项的值  none 什么都不展示 三个值
    }, //点击折点 展示的样式
    series: [], //y轴展示的数据
  };

  if (
    chartJson?.more_option &&
    chartJson.more_option.indexOf("副坐标轴") > -1
  ) {
    ecOptions.yAxis.push({
      type: "value",
      name: chartJson.y2_unit,
      axisLabel: {
        formatter: "{value}",
      },
      axisLine: {
        show: true,
        lineStyle: {
          color: "#848EAC",
        },
      },
      splitLine: {
        //修改背景线条样式
        show: false, //是否展示
        lineStyle: {
          color: "#E8E8E8", //线条颜色
          type: "dashed", //线条样式，默认是实现，dashed是虚线
        },
      },
    });
  }
  let datas = cellData;
  let seriesName = chartJson?.series_name_cfg || "";
  seriesName = seriesName.split(",");

  let seriesValueCols = chartJson?.series_value_cols || "";
  seriesValueCols = seriesValueCols.split(",");

  const mapJson =
    pageItem.cols_map_json?.cols_map_json ||
    pageItem?.page_com_cols_map_json?.cols_map_json;
  let arr = [];
  seriesValueCols.forEach((item) => {
    for (let k in mapJson) {
      if (k === item) {
        arr.push(mapJson[k]);
      }
    }
  });
  seriesValueCols = arr;

  let sortAxisCol = chartJson?.sort_axis_col || "";
  let lineVal1 = chartJson?.refer_line1 || "none";
  let lineVal2 = chartJson?.refer_line2 || "none";

  switch (type) {
    case "line":
    case "bar":
    case "lineBar":
      for (let sIndex in seriesName) {
        let dataColName = seriesValueCols[sIndex];
        let series = {
          name: seriesName[sIndex],
          data: [],
          // color: this.color,
          // type: type,
          markLine: {
            symbol: "none",
            label: {
              show: true,
              position: "middle",
              // formatter: '{b}'      // 注释掉显示值，放开不显示值
            },
            data: [
              {
                // name: '阈值',
                yAxis: lineVal1,
                // lineStyle: {
                // 	color: '#FF7A42'
                // }
              },
              {
                yAxis: lineVal2,
                // lineStyle: {
                // 	color: '#FF7A42'
                // },
              },
            ],
            lineStyle: {
              color: "#FF7A42",
              type: "solid",
            },
          },
        };

        if (seriesName.length <= 2) {
          series.yAxisIndex = sIndex;
        }

        // 处理x轴变量映射
        for (let k in mapJson) {
          if (k === sortAxisCol) {
            sortAxisCol = mapJson[k];
          }
        }

        for (let data of datas) {
          if (chartJson.more_option && chartJson.more_option === "x轴反序") {
            series["data"].unshift(data[dataColName]);
            ecOptions["xAxis"]["data"].unshift(data[sortAxisCol]);
          } else {
            series["data"].push(data[dataColName]);
            ecOptions["xAxis"]["data"].push(data[sortAxisCol]);
          }
        }
        series["smooth"] = true;
        if (chartJson.data_label === "值") {
          series.itemStyle = {
            normal: {
              label: {
                show: true,
              },
            },
          };
        }

        ecOptions["legend"]["data"].push(seriesName[sIndex]);

        if (type === "lineBar") {
          let barCols = chartJson?.bar_cols || "";
          barCols = barCols.split(",");
          let lineCols = chartJson?.line_cols || "";
          lineCols = lineCols.split(",");

          if (barCols.includes(series.name)) {
            series["type"] = "bar";
          } else if (lineCols.includes(series.name)) {
            series["type"] = "line";
          }
        } else {
          series["type"] = type;
        }
        ecOptions["series"].push(series);
        if (chartJson?.series_value === "单列多行分组" && cellData?.length) {
          const nOption = buildMultiColSeries(pageItem, cellData);
          ecOptions["series"] = nOption?.series || [];
          if (nOption?.series?.length > 5) {
            ecOptions.grid = {
              // 这里可以防止Y轴显示不全
              top: "35%",
              // top: '15%',
              left: "5%",
              // right: '30%',
              right: "8%",
              bottom: "8%",
              containLabel: true,
            };
          }
          ecOptions.legend.data = nOption?.legend || [];

          const val =
            Math.abs(nOption.max - nOption.min) / nOption.legend.length;

          ecOptions.yAxis[0].min = (
            pageItem.min ||
            nOption.min - val ||
            0
          ).toFixed(2);

          ecOptions.yAxis[0].max = (pageItem.max || nOption.max + val).toFixed(
            2
          );

          // option.yAxis = [{

          // }]
        }
      }
      ecOptions["xAxis"]["data"] = [
        ...new Set(ecOptions["xAxis"]["data"] || []),
      ];
      break;
    case "pie":
    case "ring":
      for (let sIndex in seriesName) {
        let dataColName = seriesValueCols[sIndex];
        let series = {
          name: seriesName[sIndex], // 名称
          type: "pie", // 类型 饼图
          //   color: color,
          // radius: ["45%", "65%"], // 饼图的半径 `50, 250 => 内半径 外半径`
          center: ["35%", "50%"], // 饼图的中心（圆心）坐标，数组的第一项是横坐标，第二项是纵坐标。
          // roseType: "area", // 是否展示成南丁格尔图，通过半径区分数据大小
          itemStyle: {
            normal: {
              label: {
                position: "outer",
                alignTo: "labelLine",
                show: false,
                formatter: "{b} : {c} ({d}%)",
                bleedMargin: 5,
              },
              labelLine: {
                show: false,
              },
            },
          },
          data: [],
        };
        if (type === "ring") {
          series.radius = ["50%", "55%"];
        }
        for (let data of datas) {
          // option['xAxis']['data'].push(data[sortAxisCol])
          let dataItem = {
            value: data[dataColName],
            name: data[sortAxisCol],
          };
          series["data"].push(dataItem);
          let legendItem = {
            name: data[sortAxisCol],
            icon: "circle",
          };
          ecOptions["legend"]["data"].push(legendItem);
        }
        ecOptions["series"].push(series);
      }
      ecOptions["legend"]["orient"] = "vertical";
      ecOptions["legend"]["y"] = "center";
      ecOptions["legend"]["x"] = "65%";
      ecOptions["legend"]["align"] = "left";

      ecOptions["text"] = "总数";
      let pieDatas = ecOptions["series"][0]["data"];
      ecOptions["legend"]["formatter"] = function (name) {
        let v;
        for (var i = 0, n = pieDatas.length; i < n; i++) {
          if (name == pieDatas[i].name) {
            v = pieDatas[i].value;
          }
        }
        return `${name}(${v})`;
      };
      ecOptions["title"] = {
        // 主标题样式
        textAlign: "center", //整体水平对齐（包括text和subtext）
        textStyle: {
          color: "#666",
          fontSize: 12,
          align: "center",
        },
        itemGap: 10,
        text: "总数",
        subtext: pieDatas.reduce(function (prev, cur) {
          return cur.value + prev;
        }, 0),
        // 副标题样式
        subtextStyle: {
          color: "#0055ff",
          fontSize: 18,
          align: "center", //文字水平对齐方式（left/right）
        },
        left: "33.3%",
        top: "40%",
      };
      delete ecOptions.xAxis;
      delete ecOptions.yAxis;
      break;
    case "radar":
      ecOptions = {
        tooltip: {},
        legend: {
          data: ["预算分配", "实际开销"],
        },
        radar: {
          indicator: [
            {
              name: "销售",
              max: 6500,
            },
            {
              name: "管理",
              max: 16000,
            },
            {
              name: "信息技术",
              max: 30000,
            },
            {
              name: "客服",
              max: 38000,
            },
            {
              name: "研发",
              max: 52000,
            },
            {
              name: "市场",
              max: 25000,
            },
          ],
        },
        series: [
          {
            type: "radar",
            // areaStyle: {},
            data: [
              {
                value: [4300, 10000, 28000, 35000, 50000, 19000],
                name: "预算分配",
              },
              {
                value: [5000, 14000, 28000, 31000, 42000, 21000],
                name: "实际开销",
              },
            ],
          },
        ],
      };
      break;
    case "map":
      delete ecOptions.xAxis;
      delete ecOptions.yAxis;
      ecOptions.series = [
        // {
        //   type: "map",
        //   map: "mapName",
        // },
      ];
      console.log(pageItem);
      let datas = [];
      if (cellData?.length) {
        const mapJson = pageItem?.chart_json?.map_json;
        if (mapJson?.col_label && mapJson?.col_lon && mapJson.col_lat) {
          for (let i = 0; i < cellData.length; i++) {
            datas.push({
              name: cellData[i][mapJson.col_label],
              value: [
                cellData[i][mapJson.col_lat],
                cellData[i][mapJson.col_lon],
              ],
            });
          }
        }
      }
      ecOptions.tooltip = {
        trigger: "item",
        formatter: function (params) {
          if (typeof params.value[2] == "undefined") {
            return params.name;
            // return params.name + " : " + params.value;
          } else {
            return params.name + " : " + params.value[2];
          }
        },
      };
      if (datas?.length) {
        let serie = {
          name: "",
          type: "scatter",
          coordinateSystem: "geo",
          data: datas,
          symbol: "circle",
          // symbol: 'pin',
          symbolSize: [30, 30],
          itemStyle: {
            normal: {
              color: "#c83f24", //标志颜色
            },
          },
          label: {
            show: true,
            formatter: function (params) {
              return `${params.name}`;
            },
            textStyle: {
              color: "#fff",
              borderColor: "transparent",
            },
            // normal: {
            //   show: true, //显示标签
            //   textStyle: { color: "#c71585" }, //省份标签字体颜色
            // },
            emphasis: {
              //对应的鼠标悬浮效果
              show: true, //关闭文字 （这东西有问题得关）
              // textStyle: { color: "#800080" },
              label: {
                formatter: "{b}: {@number}",
              },
            },
          },
        };
        ecOptions.series.push(serie);
      }
      break;
    default:
      break;
  }
  return ecOptions;
};

const buildMultiColSeries = (pageItem, cellData = []) => {
  let chartJson = pageItem?.chart_json || {};
  let datas = cellData;
  let seriesName = chartJson?.series_name_cfg || "";

  let lineVal1 = chartJson?.refer_line1 || "none";
  let lineVal2 = chartJson?.refer_line2 || "none";
  if (seriesName && Array.isArray(datas) && datas.length > 0) {
    let seriesNames = datas.reduce((pre, cur) => {
      if (!pre.includes(cur[seriesName])) {
        pre.push(cur[seriesName]);
      }
      return pre;
    }, []);
    let series = seriesNames.map((name) => {
      let obj = {
        name: name,
        type: "line",
        data: datas
          .filter((e) => e[seriesName] === name)
          .map((item) => item[chartJson.series_value_cols]),
        symbol: "circle",
        smooth: true,
        // yAxisIndex: 0,
        showSymbol: true,
        // tooltip: {
        //   trigger: 'item' // axis 代表着同列的所有项的值  item  单个项的值  none 什么都不展示 三个值
        // }, //点击折点 展示的样式
        markLine: {
          symbol: "none",
          label: {
            show: true,
            // position: 'right',
            // formatter: '{b}'      // 注释掉显示值，放开不显示值
          },
          data: [
            {
              // name: '阈值',
              yAxis: lineVal1,
            },
            {
              yAxis: lineVal2,
            },
          ],
          lineStyle: {
            color: "#FF7A42",
            type: "solid",
          },
        },
      };

      if (
        chartJson.more_option &&
        chartJson.more_option.indexOf("x轴反序") > -1
      ) {
        obj["data"] = obj["data"].reverse();
      }
      return obj;
    });
    let sortData = datas.sort(
      (a, b) => a[chartJson.series_value_cols] - b[chartJson.series_value_cols]
    );
    return {
      series: series,
      legend: seriesNames,
      min: sortData[0][chartJson.series_value_cols],
      max: sortData[sortData.length - 1][chartJson.series_value_cols],
    };
  }
};
/**
 * 生成图表默认配置
 * @param {*} chartType 图表类型
 * @param {*} chartJson 图表配置
 */
export const setDefaultChartOption = (chartType, chartJson, eCharts) => {
  const option = {
    color: ["#007AFF", "#66E1DF", "#34C758", "#FFCB01", "#FF9502"],
    tooltip: {},
    legend: {
      itemStyle: {
        color: "#E8E8E8",
      },
      textStyle: {
        color: "#E8E8E8",
      },
    },
    series: [],
  };
  switch (chartType) {
    case "line":
    case "bar":
      option.series = [
        {
          name: "销量",
          type: chartType || "bar",
          data: [5, 20, 36, 10, 10, 20],
        },
      ];
      option.xAxis = {
        data: ["衬衫", "羊毛衫", "雪纺衫", "裤子", "高跟鞋", "袜子"],
        axisLine: {
          lineStyle: {
            color: "#E8E8E8",
          },
        },
        axisLabel: {
          textStyle: {
            fontWeight: 400,
            fontSize: 10,
            color: "#E8E8E8",
          },
        },
      };
      option.yAxis = {
        axisLabel: {
          textStyle: {
            fontWeight: 400,
            fontSize: 10,
            color: "#E8E8E8",
          },
          formatter: "{value}",
        },
        axisLine: {
          show: true,
          lineStyle: {
            color: "#E8E8E8",
          },
        },
        splitLine: {
          //修改背景线条样式
          show: false, //是否展示
          lineStyle: {
            color: "#E8E8E8", //线条颜色
            type: "dashed", //线条样式，默认是实现，dashed是虚线
          },
        },
      };
      option.legend.data = ["销量"];
      break;
    case "pie":
      break;
    case "ring":
      option.legend = {
        show: false,
      };
      console.log(chartJson);
      var scale = 1;
      var scaleData = [
        {
          name: "工程建设",
          value: 10,
        },
        {
          name: "产权交易",
          value: 10,
        },
        {
          name: "土地交易",
          value: 10,
        },
        {
          name: "其他交易",
          value: 10,
        },
        {
          name: "土地交易",
          value: 10,
        },
        {
          name: "其他交易",
          value: 10,
        },
      ];
      var total = scaleData.reduce((pre, cur) => {
        return pre + cur.value;
      }, 0);
      var rich = {
        total: {
          color: "#ffc72b",
          fontSize: 40 * scale,
          align: "center",
        },
        white: {
          color: "#ddd",
          align: "center",
          padding: [3, 0],
        },
      };
      // let title = `{total|${total}\r\n${
      //   chartJson?.ring_sum_label || "总考生数"
      // }`;
      const title = chartJson?.ring_sum_label || "总考生数";
      option.title = {
        text: title,
        left: "center",
        top: "35%",
        padding: [24, 0],
        textStyle: {
          color: "#fff",
          fontSize: 18 * scale,
          align: "center",
        },
      };

      // option.legend = {
      //   selectedMode: false,
      //   formatter: function (name) {
      //     var total = 0;
      //     scaleData.forEach(function (value, index, array) {
      //       total += value.value;
      //     });
      //     return "{total|" + total + "}";
      //   },
      //   data: [scaleData[0].name],
      //   // data: ['高等教育学'],
      //   // itemGap: 50,
      //   left: "center",
      //   top: "center",
      //   icon: "none",
      //   align: "center",
      //   textStyle: {
      //     color: "#fff",
      //     fontSize: 16 * scale,
      //     rich: {
      //       total: {
      //         color: "#ffc72b",
      //         fontSize: 40 * scale,
      //         align: "center",
      //       },
      //     },
      //   },
      // };

      var placeHolderStyle = {
        normal: {
          label: {
            show: false,
          },
          labelLine: {
            show: false,
          },
          color: "rgba(0, 0, 0, 0)",
          borderColor: "rgba(0, 0, 0, 0)",
          borderWidth: 0,
        },
      };
      var data = [];
      var color = [
        "#00ffff",
        "#00cfff",
        "#006ced",
        "#ffe000",
        "#ffa800",
        "#ff5b00",
        "#ff3000",
      ];
      for (var i = 0; i < scaleData.length; i++) {
        data.push(
          {
            value: scaleData[i].value,
            name: scaleData[i].name,
            itemStyle: {
              normal: {
                borderWidth: 5,
                shadowBlur: 20,
                borderColor: color[i],
                shadowColor: color[i],
              },
            },
          },
          {
            value: 2,
            name: "",
            itemStyle: placeHolderStyle,
          }
        );
      }
      option.series = [
        {
          name: "",
          type: "pie",
          clockWise: false,
          radius: ["50%", "55%"],
          hoverAnimation: false,
          itemStyle: {
            normal: {
              label: {
                show: true,
                position: "outside",
                color: "#ddd",
                formatter: function (params) {
                  var percent = 0;
                  var total = 0;
                  for (var i = 0; i < scaleData.length; i++) {
                    total += scaleData[i].value;
                  }
                  percent = ((params.value / total) * 100).toFixed(0);
                  if (params.name !== "") {
                    return params.name + "\n{white|" + "占比" + percent + "%}";
                  } else {
                    return "";
                  }
                },
                rich: rich,
              },
              labelLine: {
                length: 30,
                length2: 100,
                show: true,
                color: "#00ffff",
              },
            },
          },
          data: data,
        },
      ];
      break;
    case "map":
      if (chartJson?.map_base_geojson && eCharts) {
        eCharts.registerMap("mapName", chartJson?.map_base_geojson);
      }
      option.legend = {
        show: false,
      };
      option.tooltip = {
        trigger: "item",
        formatter: function (params) {
          if (typeof params.value[2] == "undefined") {
            return params.name + " : " + params.value;
          } else {
            return params.name + " : " + params.value[2];
          }
        },
      };
      option.geo = {
        map: "mapName",
        roam: true,
        // top:'3%',
        label: {
          normal: {
            show: false,
          },
          emphasis: {
            show: false,
          },
        },

        itemStyle: {
          normal: {
            areaColor: "#1180c7",
          },
          emphasis: {
            areaColor: "#1180c7",
          },
        }
      };
      option.series = [
      ];
      break;
  }
  return option;
};

export const setCustomLayerMapOption = (data) => {
  let itemArr = [];
  if (data && Array.isArray(data)) {
    data = JSON.parse(JSON.stringify(data));
    let datas = data.map((d, i) => {
      if (item.chart_settings?.appName) {
        d.appName = item.chart_settings?.appName;
      }
      if (d.lon_width && d.lat_height) {
        d.chart_width =
          (parseFloat(d.lon_width) *
            parseFloat(self.contentData.dashboard_width)) /
          parseFloat(gis_info_cfg.width_lon);
        d.chart_height =
          (parseFloat(d.lat_height) *
            parseFloat(self.contentData.dashboard_height)) /
          parseFloat(gis_info_cfg.height_lat);
        d.chart_left = 0;
        d.chart_top = 0;
      }
      d.use_flag = item.use_flag;
      if (d.use_flag === "否") {
      }
      d.z_order = item.z_order;
      d.objType = item.chart_settings.type;
      d.targetParams = item.chart_settings.targetParams;
      d.targetUrl = item.chart_settings.targetUrl;
      d.chart_type = item.chart_type;
      d.showTitle = item.chart_settings.showTitle;
      d.titleCol = item.chart_settings.titleCol;
      d.titleColor = item.chart_settings.titleColor;
      d.idCol = item.chart_settings.idCol;
      if (!d.rotation_angle) {
        d.rotation_angle = 0;
      }
      if (d.idCol && d[d.idCol]) {
        d.id = d[d.idCol];
      }
      if (
        item.chart_settings.imgUrl &&
        item.chart_settings.imgUrl.indexOf("&bx_auth_ticket") === -1 &&
        item.chart_settings.imgUrl.indexOf(top.pathConfig.gateway) === -1
      ) {
        d.imgUrl =
          top.pathConfig.gateway +
          item.chart_settings.imgUrl +
          "&bx_auth_ticket=" +
          sessionStorage.getItem("bx_auth_ticket");
      } else if (
        item.chart_settings.imgUrl &&
        item.chart_settings.imgUrl.indexOf("&bx_auth_ticket") !== -1 &&
        item.chart_settings.imgUrl.indexOf(top.pathConfig.gateway) !== -1
      ) {
        let params = item.chart_settings.imgUrl.split("&bx_auth_ticket");
        params = params.length > 1 ? params[1] : "";
        if (params) {
          params = params.split("&");
          params = params.length > 0 ? params[0] : "";
          if (params) {
            item.chart_settings.imgUrl = item.chart_settings.imgUrl.replace(
              params,
              sessionStorage.getItem("bx_auth_ticket")
            );
          }
        }
        d.imgUrl =
          item.chart_settings.imgUrl +
          "&bx_auth_ticket=" +
          sessionStorage.getItem("bx_auth_ticket");
      }
      d.linkUrl = item.chart_settings.linkUrl;
      d.chart_request_payload = item.chart_request_payload;
      if (item.chart_settings.type === "tower") {
        d.chart_top = Math.abs(
          ((parseFloat(d.lat) -
            -d.lat_height / 2 -
            (parseFloat(gis_info_cfg.center_lat) +
              parseFloat(gis_info_cfg.height_lat) / 2)) /
            parseFloat(gis_info_cfg.height_lat)) *
            parseFloat(self.contentData.dashboard_height)
        );
        d.chart_left = Math.abs(
          ((parseFloat(d.lon) -
            parseFloat(d.lon_width) / 2 -
            (parseFloat(gis_info_cfg.center_lon) -
              gis_info_cfg.width_lon / 2)) /
            parseFloat(gis_info_cfg.width_lon)) *
            parseFloat(self.contentData.dashboard_width)
        );
      }
      if (item.chart_settings.type === "camera") {
        d.chart_width = item.chart_width;
        d.chart_height = item.chart_height;
        d.chart_top = Math.abs(
          ((parseFloat(d.lat) -
            (parseFloat(gis_info_cfg.center_lat) +
              parseFloat(gis_info_cfg.height_lat) / 2)) /
            parseFloat(gis_info_cfg.height_lat)) *
            parseFloat(self.contentData.dashboard_height)
        );
        d.chart_left = Math.abs(
          ((parseFloat(d.lon) -
            (parseFloat(gis_info_cfg.center_lon) -
              parseFloat(gis_info_cfg.width_lon) / 2)) /
            parseFloat(gis_info_cfg.width_lon)) *
            parseFloat(self.contentData.dashboard_width)
        );
      }
      return d;
    });
    if (self.chartConfig[index] && self.chartConfig[index].chart_no) {
      self.chartConfig.splice(index, 1);
    }

    self.chartConfig = self.deepClone(self.chartConfig.concat(data));
    self.chartConfigOld = self.deepClone(self.chartConfig);
  }
};
