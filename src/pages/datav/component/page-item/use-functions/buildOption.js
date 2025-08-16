import * as echarts from "echarts";
import "echarts-wordcloud"; // echarts-wordcloud@1.1.3
// import "echarts-gl"; //echarts-gl@1.1.2

let __colors = [
  "#007AFF",
  "#66E1DF",
  "#34C758",
  "#FFCB01",
  "#FF9502",
  "#FF3A30",
  "#A8071A",
  "#EB2F96",
  "#AF52DE",
  "#5756D7",
  "#D0DEEE",
  "#82B6F7",
];

function hex2rgb(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  if (alpha) {
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return `rgb(${r}, ${g}, ${b})`;
}

function addAlphaToRGB(rgb, alpha) {
  const [r, g, b] = rgb.match(/\d+/g);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// 初始化 必须传入dom节点 建议使用vue的ref获取
export const initChart = (domRef) => {
  return echarts.init(domRef);
};

// 构建桑基图配置
/**
 * 构建桑基图配置选项
 * @description 根据传入的数据生成ECharts桑基图的配置对象，支持多层级节点和连接关系的可视化
 * 
 * @param {Array} data - 原始数据数组，每个元素包含节点信息和层级关系
 * @param {Object} keyMap - 字段映射配置，用于指定数据中各字段的键名
 * @param {string} keyMap.idKey - 节点唯一标识字段名，默认为 "area_no"
 * @param {string} keyMap.pidKey - 父节点标识字段名，默认为 "parent_no"
 * @param {string} keyMap.nameKey - 节点显示名称字段名，默认为 "name"
 * @param {string} keyMap.subNameKey - 子名称字段名（用于tooltip显示），默认为 "rec_time"
 * @param {string} keyMap.valueKey - 节点数值字段名，默认为 "day_use_quantity"
 * @param {string} keyMap.levelKey - 节点层级字段名，默认为 "level"
 * @param {Object} options - 可选配置项
 * @param {Array} options.colors - 自定义颜色数组
 * @param {number} options.minValue - 最小值过滤阈值，默认为0
 * @param {boolean} options.showTitle - 是否显示标题，默认为false
 * @param {string} options.title - 图表标题
 * @param {boolean} options.showTooltip - 是否显示提示框，默认为true
 * @param {number} options.animationDuration - 动画持续时间，默认为1000ms
 * @param {number} options.curveness - 连线弯曲度，默认为0.2
 * @param {number} options.labelFontSize - 标签字体大小，默认为12
 * 
 * @returns {Object} ECharts桑基图配置对象
 * 
 * @example
 * const data = [
 *   { area_no: '1', parent_no: null, name: '总部', day_use_quantity: 100, level: 0 },
 *   { area_no: '2', parent_no: '1', name: '分部A', day_use_quantity: 60, level: 1 }
 * ];
 * const option = buildSankeyOption(data);
 */
const buildSankeyOption = (
  data,
  keyMap = {
    idKey: "area_no", // 节点唯一标识字段名

    pidKey: "parent_no", // 父节点标识字段名

    nameKey: "name", // 节点显示名称字段名

    subNameKey: "rec_time", 

    valueKey: "day_use_quantity", // 节点数值字段名

    levelKey: "level"
  },
  options = {}
) => {
  // 参数验证：检查数据是否为有效的非空数组
  if (!Array.isArray(data) || data.length === 0) {
    console.warn('buildSankeyOption: 数据为空或格式不正确');
    return { series: [{ type: 'sankey', data: [], links: [] }] };
  }

  // 默认配置：定义桑基图的基础样式和行为配置
  const defaultOptions = {
    // title: '能耗分布桑基图',
    colors: __colors,           // 使用全局颜色配置
    minValue: 0,               // 最小值过滤，小于此值的连接将被忽略
    showTitle: false,          // 是否显示图表标题
    showTooltip: true,         // 是否显示鼠标悬停提示框
    animationDuration: 1000,   // 动画持续时间（毫秒）
    curveness: 0.2,           // 连线弯曲度，0为直线，1为最弯曲
    labelFontSize: 12         // 节点标签字体大小
  };

  // 合并用户配置和默认配置
  const config = { ...defaultOptions, ...options };

  // 初始化数据结构
  const nodeMap = new Map();  // 用于快速查找节点的映射表
  const nodes = [];           // 桑基图节点数组
  const links = [];           // 桑基图连接关系数组

  // 第一遍遍历：创建所有唯一节点
  // 从原始数据中提取节点信息，确保每个节点只创建一次
  data.forEach(item => {
    const nodeId = item[keyMap.idKey];        // 获取节点ID
    const nodeName = item[keyMap.nameKey];    // 获取节点显示名称
    const nodeValue = Number(item[keyMap.valueKey]) || 0;  // 获取节点数值，确保为数字类型

    // 检查节点是否已存在，且ID和名称都有效
    if (!nodeMap.has(nodeId) && nodeId && nodeName) {
      const node = {
        id: nodeId,                                    // 节点唯一标识
        name: nodeName,                               // 节点显示名称
        value: nodeValue,                             // 节点数值（用于计算节点大小）
        // level: item[keyMap.levelKey] || 0             // 节点层级（用于布局和颜色配置）
      };
      nodeMap.set(nodeId, node);  // 添加到映射表中便于后续查找
      nodes.push(node);           // 添加到节点数组中
    }
  });
  // 第二遍遍历：创建节点间的连接关系
  // 根据父子关系建立桑基图的流向连接
  data.forEach(item => {
    const parentId = item[keyMap.pidKey];     // 获取父节点ID
    const currentId = item[keyMap.idKey];     // 获取当前节点ID
    const value = Number(item[keyMap.valueKey]) || 0;  // 获取连接的数值权重

    // 只有当父节点存在、当前节点存在且数值大于最小阈值时才创建连接
    if (parentId && currentId && value > config.minValue) {
      const parentNode = nodeMap.get(parentId);   // 从映射表中获取父节点
      const currentNode = nodeMap.get(currentId); // 从映射表中获取当前节点

      // 确保两个节点都存在才创建连接
      if (parentNode && currentNode) {
        links.push({
          source: parentNode.id,              // 连接起始节点ID
          target: currentNode.id,             // 连接目标节点ID
          sourceName: parentNode.name,        // 起始节点名称（用于tooltip）
          targetName: currentNode.name,       // 目标节点名称（用于tooltip）
          subName: item[keyMap.subNameKey],   // 附加信息（如时间等）
          value: value                        // 连接的数值权重（决定连线粗细）
        });
      }
    }
  });

  // 动态生成层级颜色配置
  // 根据节点的最大层级数，为每个层级分配不同的颜色和样式
  const levels = [];
  const maxLevel = Math.max(...nodes.map(n => n.level || 5));  // 找出最大层级数
  
  // 为每个层级创建样式配置
  for (let i = 0; i <= maxLevel; i++) {
    levels.push({
      depth: i,                                           // 层级深度
      itemStyle: {
        color: config.colors[i % config.colors.length]   // 循环使用颜色数组中的颜色
      },
      lineStyle: {
        color: 'source',                                  // 连线颜色跟随起始节点
        opacity: 0.2                                     // 连线透明度
      }
    });
  }

  // 构建桑基图的核心配置对象
  const option = {
    series: [{
      type: 'sankey',                    // 图表类型：桑基图
      data: nodes,                       // 节点数据数组
      links: links,                      // 连接关系数组
      emphasis: {
        focus: 'adjacency'               // 鼠标悬停时高亮相邻的节点和连线
      },
      draggable: true,                   // 允许拖拽节点调整位置
      focusNodeAdjacency: 'allEdges',    // 鼠标划上时高亮的节点和连线，allEdges表示高亮所有相关连线和节点
      layoutIterations: 0,               // 布局迭代次数，0表示按数据原始顺序排列，不进行自动优化
      levels: levels,                    // 层级样式配置数组
      lineStyle: {
        color: 'gradient',               // 连线颜色使用渐变效果
        curveness: config.curveness      // 连线弯曲度
      },
      itemStyle: {
        borderWidth: 1,                  // 节点边框宽度
        borderColor: '#aaa'              // 节点边框颜色
      },
      label: {
        show: true,                      // 显示节点标签
        position: 'right',               // 标签位置在节点右侧
        formatter: '{b}',                // 标签格式，{b}表示显示节点名称
        fontSize: config.labelFontSize   // 标签字体大小
      },
      animationDuration: config.animationDuration,  // 动画持续时间
      animationEasing: 'cubicInOut'                  // 动画缓动函数
    }]
  };

  // 可选的标题配置
  // 只有当启用标题显示且提供了标题文本时才添加标题配置
  if (config.showTitle && config.title) {
    option.title = {
      text: config.title,              // 标题文本
      left: 'center',                  // 标题水平居中
      textStyle: {
        color: '#333',                 // 标题文字颜色
        fontSize: 16                   // 标题字体大小
      }
    };
  }

  // 可选的提示框配置
  // 为节点和连线提供详细的悬停提示信息
  if (config.showTooltip) {
    option.tooltip = {
      trigger: 'item',                 // 触发类型：数据项图形触发
      triggerOn: 'mousemove',          // 触发条件：鼠标移动时触发
      formatter: function (params) {
        // 根据数据类型（节点或连线）显示不同的提示内容
        if (params.dataType === 'node') {
          // 节点提示：显示节点名称和数值
          return `${params.data.name}<br/>用量: ${params.data.value}`;
        } else if (params.dataType === 'edge') {
          // 连线提示：显示起始节点到目标节点的流向信息
          let tip = `${params.data.sourceName || params.data.source} → ${params.data.targetName || params.data.target}`
          // 如果有附加信息（如时间），则显示
          if (params.data.subName) {
            tip += `<br/>时间: ${params.data.subName}`
          }
          tip += `<br/>用量: ${params.data.value}`

          return tip;
        }
      }
    };
  }

  return option;
};

export const useBuildOption = (type, pageItem, cellData = [], layout) => {
  let colors = [...__colors];
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

  if (chartJson?.legend_color_seq) {
    colors = chartJson?.legend_color_seq.split(",");
  }

  const showLabel = chartJson?.more_option?.includes('隐藏标签') ? false : true;
  const showLegend = chartJson?.more_option?.includes('隐藏图例') ? false : true;

  let ecOptions = {
    // 初始动画延迟
    // animationDelay: function (idx) {
    //   // 越往后的数据延迟越大
    //   return idx * 1000;
    // },
    // animationEasing: "quinticOut",
    animationEasing: "cubicInOut",
    animationDelay: 200,
    animationDuration: 3000, // 初始动画的时长
    color: colors,
    grid: {
      // 这里可以防止Y轴显示不全
      top: 40,
      left: 10,
      right: 10,
      bottom: 0,
      containLabel: true,
    },
    legend: {
      data: [],
      itemStyle: {
        // color: pageItem?.style_json?.color || "#848EAC",
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
      trigger: "axis", // axis 代表着同列的所有项的值  item  单个项的值  none 什么都不展示 三个值
    }, //点击折点 展示的样式
    series: [], //y轴展示的数据
  };
  //生成图表默认配置
  let defaultOptions = setDefaultChartOption(
    type,
    pageItem?.chart_json,
    echarts
  );
  ecOptions = { ...defaultOptions, ...ecOptions };

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
  let y2seriesValueCols = []
  let y2SeriesNames = []
  if (chartJson?.y2_name_cfg && chartJson?.y2_cols) {
    y2SeriesNames = chartJson?.y2_name_cfg.split(',')
    y2seriesValueCols = chartJson?.y2_cols.split(',')
  }
  seriesValueCols = seriesValueCols.concat(y2seriesValueCols)
  seriesName = seriesName.concat(y2SeriesNames)
  // const mapJson =
  //   pageItem.cols_map_json?.cols_map_json ||
  //   pageItem?.page_com_cols_map_json?.cols_map_json;
  // let arr = [];
  // if (mapJson) {
  //   seriesValueCols.forEach((item) => {
  //     for (let k in mapJson) {
  //       if (k === item) {
  //         arr.push(mapJson[k]);
  //       }
  //     }
  //   });
  //   seriesValueCols = arr;
  // }

  let sortAxisCol = chartJson?.sort_axis_col || "";
  let lineVal1 = chartJson?.refer_line1 || "none";
  let lineVal2 = chartJson?.refer_line2 || "none";
  debugger
  switch (type) {
    case "sankey": //桑基图
      // 使用传入的cellData生成桑基图配置
      const sankeyOption = buildSankeyOption(cellData);
      ecOptions = { ...sankeyOption };
      break;
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
        };

        if (y2seriesValueCols.includes(dataColName)) {
          // 副坐标轴
          series.yAxisIndex = 1
        }

        if (
          lineVal1 &&
          lineVal2 &&
          lineVal1 !== "none" &&
          lineVal2 !== "none"
        ) {
          series.markLine = {
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
          };
        }

        if (seriesName.length <= 2) {
          // series.yAxisIndex = sIndex;
        }
        const mapJson =
          pageItem.cols_map_json?.cols_map_json ||
          pageItem?.page_com_cols_map_json?.cols_map_json;
        // 处理x轴变量映射
        if (mapJson) {
          for (let k in mapJson) {
            if (k === sortAxisCol) {
              sortAxisCol = mapJson[k];
            }
          }
        }
        const xAxisData = cellData.map((item) => item[sortAxisCol]);
        ecOptions["xAxis"]["data"] = [...new Set(xAxisData)];
        series["data"] = new Array(ecOptions["xAxis"]["data"].length).fill(
          null
        );
        if (chartJson.more_option && chartJson.more_option === "x轴反序") {
          ecOptions["xAxis"]["data"] = xAxisData.reverse();
        }
        if (
          chartJson.more_option &&
          chartJson.more_option.includes("序列堆叠")
        ) {
          series.stack = sortAxisCol;
        }

        // for (let data of cellData) {
        //   if (chartJson.more_option && chartJson.more_option === "x轴反序") {
        //     // series["data"].unshift(data[dataColName]);
        //     // ecOptions["xAxis"]["data"].unshift(data[sortAxisCol]);
        //     ecOptions["xAxis"]["data"] = xAxisData.reverse();
        //   } else {
        //     // series["data"].push(data[dataColName]);
        //     // ecOptions["xAxis"]["data"].push(data[sortAxisCol]);
        //   }
        // }
        series["data"] = series["data"].map((item, index) => {
          const data = cellData.find(
            (e) => e[sortAxisCol] === ecOptions["xAxis"]["data"][index]
          );
          return data?.[dataColName];
        });
        series["smooth"] = true;
        if (typeof chartJson?.smooth === "number") {
          series.smooth = chartJson?.smooth;
        }
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
          const nOption = buildMultiColSeries(pageItem, cellData, type);
          ecOptions["series"] = nOption?.series || [];
          if (nOption?.series?.length > 5) {
            ecOptions.grid = {
              // 这里可以防止Y轴显示不全
              top: 45,
              left: 10,
              right: 10,
              bottom: 0,
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
          if (ecOptions.yAxis[0].min < 0) {
            ecOptions.yAxis[0].min = 0;
          }

          ecOptions.yAxis[0].max = (
            (pageItem.max || nOption.max) + val
          ).toFixed(2);

          ecOptions.tooltip.trigger = "axis";
        }
      }
      if (chartJson?.more_option?.includes('折线面积图')) {
        ecOptions.series.forEach((item, index) => {
          item.areaStyle = {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [{
                offset: 0, color: __colors[index]  // 0% 处的颜色
              }, {
                offset: 0.6, color: hex2rgb(__colors[index], 0.1) // 80% 处的颜色
              }],
              global: false // 缺省为 false
            },
            shadowColor: 'rgba(0, 0, 0, 0.1)',
            shadowBlur: 10
          }
        })
        if (chartJson?.more_option?.includes('序列堆叠')) {
          ecOptions.series.forEach((item, index) => {
            item.stack = sortAxisCol;
          })
        }
      }
      // ecOptions["xAxis"]["data"] = [
      //   ...new Set(ecOptions["xAxis"]["data"] || []),
      // ];
      if (chartJson?.chart_type === "条形图") {
        let xAxis = JSON.parse(JSON.stringify(ecOptions.yAxis));
        ecOptions.yAxis = JSON.parse(JSON.stringify(ecOptions.xAxis));
        ecOptions.xAxis = xAxis;
      }
      break;
    case "pie":
    case "ring":
      for (let sIndex in seriesName) {
        var scale = 1
        var rich = {
          yellow: {
            color: "#ffc72b",
            fontSize: 12 * scale,
            padding: [5, 4],
            align: 'center'
          },
          total: {
            color: "#ffc72b",
            fontSize: 18 * scale,
            align: 'center'
          },
          white: {
            color: "#fff",
            align: 'center',
            fontSize: 12 * scale,
            padding: [21, 0]
          },
          blue: {
            color: '#49dff0',
            fontSize: 12 * scale,
            align: 'center'
          },
          hr: {
            borderColor: '#0b5263',
            width: '100%',
            borderWidth: 1,
            height: 0,
          }
        }
        let dataColName = seriesValueCols[sIndex];

        let series = {
          name: "", // 名称
          type: "pie", // 类型 饼图
          //   color: color,
          // radius: ["45%", "65%"], // 饼图的半径 `50, 250 => 内半径 外半径`
          center: ["50%", "50%"], // 饼图的中心（圆心）坐标，数组的第一项是横坐标，第二项是纵坐标。
          // roseType: "area", // 是否展示成南丁格尔图，通过半径区分数据大小
          itemStyle: {
            normal: {
              label: {
                position: "outside",
                alignTo: "labelLine",
                show: true,
                // formatter: `{b} \r\n {c}${chartJson?.y1_unit || ""}`,
                // bleedMargin: 3,
                formatter: function (params, ticket, callback) {
                  var total = 0; //考生总数量
                  var percent = 0; //考生占比
                  cellData.forEach(function (value, index, array) {
                    const num = value[chartJson.series_value_cols || 'value'];
                    if (!isNaN(Number(num))) {
                      total += Number(num)
                    }
                  });
                  percent = ((params.value / total) * 100).toFixed(1);
                  return '{yellow|' + params.name + '}{blue|' + percent + '%}';
                },
                rich: rich,
              },
              labelLine: {
                show: true,
                length: 10,
                length2: 15,
              },
            },
          },
          tooltip: {
            trigger: 'item',
            formatter: `{b}<br/>{c}${chartJson?.y1_unit || ""} ({d}%)`
          },
          data: [],
        };
        if (type === "ring") {
          series.radius = ["45%", "60%"]
        }
        series.itemStyle.normal.label.show = showLabel;
        for (let data of cellData) {
          // option['xAxis']['data'].push(data[sortAxisCol])
          let dataItem = {
            value: parseFloat(data[dataColName]),
            name: data[chartJson?.series_name_cfg || sortAxisCol],
            itemStyle: {
              normal: {
                borderWidth: 5,
              },
            },
          };
          series["data"].push(dataItem);
          // series["data"].push(parseFloat(data[dataColName]))
          // series["data"].push(data[dataColName])
          // series["data"].push({
          //   value: 5,
          //   name: "",
          //   itemStyle: {
          //     normal: {
          //       label: {
          //         show: false,
          //       },
          //       labelLine: {
          //         show: false,
          //       },
          //       color: "rgba(0, 0, 0, 0)",
          //       borderColor: "rgba(0, 0, 0, 0)",
          //       borderWidth: 0,
          //     },
          //   },
          // });
          let legendItem = {
            name: data[chartJson?.series_name_cfg || sortAxisCol],
            icon: "circle",
          };
          ecOptions["legend"]["data"].push(legendItem);
        }
        ecOptions["series"].push(series);
      }
      console.log(ecOptions);
      ecOptions["legend"]["orient"] = "vertical";
      ecOptions["legend"]["y"] = "center";
      ecOptions["legend"]["x"] = "65%";
      ecOptions["legend"]["align"] = "left";

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
      ecOptions.legend.show = false;
      if (type === "ring") {
        const title = chartJson?.ring_sum_label || "总数";
        ecOptions.title = {
          text: pieDatas.reduce(function (prev, cur) {
            return cur.value + prev;
          }, 0),
          left: "center",
          top: "center",
          padding: [24, 0],
          subtext: title,
          subtextStyle: {
            color: pageItem?.style_json?.color || "#fff",
            fontSize: 14,
            align: "center", //文字水平对齐方式（left/right）
          },
          textStyle: {
            color: "#ffc97a",
            fontSize: 18,
            align: "center",
          },
        };
      }
      delete ecOptions.xAxis;
      delete ecOptions.yAxis;
      break;
    case "radar":
      // 默认配置
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
      if (
        chartJson?.series_name_cfg &&
        chartJson.series_value_cols &&
        cellData?.length
      ) {
        // 有配置名称字段跟值字段
        if (chartJson.series_value === "列数据") {
          // 单指标雷达图
          let datas = cellData.map((item) => item[chartJson.series_value_cols]);
          let max = Math.max(...datas) + "";
          max = Number(max) + Math.pow(10, max.length - 1);
          ecOptions.radar.indicator = cellData.map((item) => {
            return {
              name: item[chartJson.series_name_cfg],
              max: max,
            };
          });
          ecOptions.series = [
            {
              type: "radar",
              areaStyle: {
                normal: {
                  color: colors[0],
                },
              },
              symbolSize: 0,
              data: [
                {
                  value: datas,
                  name: "radar",
                },
              ],
            },
          ];
        }
      }

      break;
    case "wordcloud":
      let list = [
        {
          value: "50",
          name: "华为",
          textStyle: {
            shadowBlur: 4,
            shadowColor: "#ECEFFF",
            shadowOffsetY: 14,
            color: "#73DDFF",
          },
        }, // 50
        { value: "30", name: "VIVO" },
        { value: "29", name: "OPPO" },
        { value: "28", name: "HONOR" },
        { value: "27", name: "红米" },
        { value: "26", name: "小米" },
        { value: "25", name: "美图" },
        { value: "24", name: "ONEPLUS" },
        { value: "23", name: "魅族" },
      ];
      if (
        cellData?.length &&
        chartJson.series_value === "列数据" &&
        chartJson?.series_name_cfg &&
        chartJson.series_value_cols
      ) {
        list = cellData.map((item) => {
          return {
            name: item[chartJson?.series_name_cfg],
            value: item[chartJson?.series_value_cols],
          };
        });
      }
      ecOptions = {
        series: [
          {
            type: "wordCloud",
            // The shape of the "cloud" to draw. Can be any polar equation represented as a
            // callback function, or a keyword present. Available presents are circle (default),
            // cardioid (apple or heart shape curve, the most known polar equation), diamond (
            // alias of square), triangle-forward, triangle, (alias of triangle-upright, pentagon, and star.

            shape: "pentagon",

            // A silhouette image which the white area will be excluded from drawing texts.
            // The shape option will continue to apply as the shape of the cloud to grow.

            // Folllowing left/top/width/height/right/bottom are used for positioning the word cloud
            // Default to be put in the center and has 75% x 80% size.

            width: "100%",
            height: "100%",
            left: "0",
            top: "0",
            right: "0",
            bottom: "0",

            // Text size range which the value in data will be mapped to.
            // Default to have minimum 12px and maximum 60px size.

            sizeRange: [12, 40],

            // Text rotation range and step in degree. Text will be rotated randomly in range [-90, 90] by rotationStep 45

            rotationRange: [0, 0],
            rotationStep: 0,

            // size of the grid in pixels for marking the availability of the canvas
            // the larger the grid size, the bigger the gap between words.
            gridSize: 20,

            // set to true to allow word being draw partly outside of the canvas.
            // Allow word bigger than the size of the canvas to be drawn
            drawOutOfBound: false,

            // If perform layout animation.
            // NOTE disable it will lead to UI blocking when there is lots of words.
            layoutAnimation: true,

            // Global text style
            textStyle: {
              normal: {
                color: (v) => `${__colors[v.dataIndex]}`,
              },
              emphasis: {
                shadowBlur: 10,
                shadowColor: "#2ac",
              },
            },
            emphasis: {
              focus: "none",
            },

            // Data is an array. Each array item must have name and value property.
            data: list,
          },
        ],
      };
      break;
    case "map":
      delete ecOptions.xAxis;
      delete ecOptions.yAxis;
      ecOptions.series = [];
      console.log(pageItem);
      const mapJson = pageItem?.chart_json?.map_json;
      let datas = [];
      if (cellData?.length) {
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
      // ecOptions.geo3D= {
      //   map: "mapName", //注册地图的名字
      //   roam: true, //开启鼠标缩放和平移漫游。默认不开启
      //   itemStyle: {
      //     color: "#0057c7", // 背景
      //     opacity: 1, //透明度
      //     borderWidth: .1, // 边框宽度
      //     borderColor: "#eee", // 边框颜色
      //     fontSize: .1, //
      //   },
      //   viewControl: {
      //     distance: 120,
      //     alpha: 50, // 上下旋转的角度
      //     beta: 0, // 左右旋转的角度
      //   },

      // }
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
        let iconSize = 5;
        if (mapJson?.icon_scale) {
          let iconScale = mapJson?.icon_scale || 1;
          console.log(layout);
          if (layout?.w) {
            iconSize = (layout?.w * iconScale) / 100;
            if (layout.colNum === 100) {
              iconSize = (layout?.w * 12 * iconScale) / 100;
            }
          }
        }
        let serie = {
          name: "",
          // type: "scatter3D",
          type: "scatter",
          coordinateSystem: "geo",
          // coordinateSystem: "geo3D",
          // type: 'bar3D',
          data: datas,
          symbol: "circle",
          // symbol: 'pin',
          symbolSize: iconSize,
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
              backgroundColor: "transparent",
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
  if (showLegend === false) {
    ecOptions.legend = {
      show: false,
    }
  }
  return ecOptions;
};

const buildMultiColSeries = (pageItem, cellData = [], type) => {
  let chartJson = pageItem?.chart_json || {};
  let datas = cellData;
  let seriesName = chartJson?.series_name_cfg || "";
  const sortAxisCol = chartJson?.sort_axis_col;
  let xAxisData = cellData.map((item) => item[sortAxisCol]);
  xAxisData = [...new Set(xAxisData)];
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
        type: type || "line",
        // data: datas
        //   .filter((e) => e[seriesName] === name)
        //   .map((item) => item[chartJson.series_value_cols]),
        data: xAxisData.map((a, index) => {
          const data = datas.find(
            (e) => e[seriesName] === name && e[sortAxisCol] === a
          );
          return data?.[chartJson.series_value_cols] || undefined;
        }),
        symbol: "circle",
        smooth: true,
        // yAxisIndex: 0,
        showSymbol: true,
        // tooltip: {
        //   trigger: 'item' // axis 代表着同列的所有项的值  item  单个项的值  none 什么都不展示 三个值
        // }, //点击折点 展示的样式
      };
      if (lineVal1 && lineVal2 && lineVal1 !== "none" && lineVal2 !== "none") {
        obj.markLine = {
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
        };
      }
      if (chartJson?.more_option?.indexOf("stack")) {
        obj.stack = "stack";
      }
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
  const colors = [...__colors];
  const option = {
    color: colors,
    tooltip: {},
    legend: {
      itemStyle: {
        // color: "#E8E8E8",
      },
      textStyle: {
        color: "#E8E8E8",
      },
    },
    series: [],
  };
  const datas = [0, 1, 2, 3, 4, 5].map((item) => {
    return Math.random() * 100;
  });
  switch (chartType) {
    case "line":
    case "bar":
      option.series = [
        {
          name: "销量",
          type: chartType || "bar",
          data: datas,
        },
      ];
      if (chartJson?.more_option?.includes('折线面积图')) {
        option.series[0].areaStyle = {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [{
              offset: 0, color: 'rgba(255, 199, 43, 0.3)' // 0% 处的颜色
            }, {
              offset: 1, color: 'rgba(255, 199, 43, 0)' // 100% 处的颜色
            }],
            global: false // 缺省为 false
          }
        }
      }
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
      if (chartJson?.chart_type === "条形图") {
        let xAxis = JSON.parse(JSON.stringify(option.yAxis));
        option.yAxis = JSON.parse(JSON.stringify(option.xAxis));
        option.xAxis = xAxis;
      }
      break;
    case "pie":
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
      if (chartType === "ring") {
        const title = chartJson?.ring_sum_label || "总数";
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
      }

      var data = [];
      for (var i = 0; i < scaleData.length; i++) {
        data.push({
          value: scaleData[i].value,
          name: scaleData[i].name,
          itemStyle: {
            // normal: {
            //   borderWidth: 0,
            //   shadowBlur: 20,
            //   borderColor: color[i],
            //   shadowColor: color[i],
            // },
          },
        });
      }
      option.series = [
        {
          name: "",
          type: "pie",
          clockWise: false,
          // radius: ["50%", "52%"],
          radius: chartType === "ring" ? ["50%", "52%"] : "50%",
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
                length2: 30,
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
        top: "0",
        // left:'0%',
        // right:'0%',
        bottom: "0",
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
        },
      };
      option.series = [];
      break;
  }
  return option;
};
