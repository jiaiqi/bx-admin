import mapStyle from './mapStyle.json'

import cameraIcon from '../assets/icon/camera.png'
import gantry from '../assets/icon/gantry.png'
import gantryActive from '../assets/icon/gantry-active.png'
import startIcon from '../assets/icon/start.png'
import endIcon from '../assets/icon/end.png'
import toll from '../assets/icon/toll.png'
import tollActive from '../assets/icon/toll-active.png'
import custom from '../assets/icon/custom.png'
import bludArrow from '../assets/icon/Icon_road_blue_arrow.png'

import car from '../assets/icon/car.png'

import {geoconv, getBaiduMapApi} from './api.js'
import {over} from 'lodash'

let activeLineColor = 'rgb(40, 189, 108)'
// let bMapApi = 'http://192.168.0.151/bxmap/direction/v2/driving'  //https://api.map.baidu.com/direction/v2/driving   //'/baiduApi/direction/v2/driving'
// let bMapApi = 'http://192.168.0.151/bxmap/direction/v2/driving'  //https://api.map.baidu.com/direction/v2/driving   //'/baiduApi/direction/v2/driving'
let bMapApi = sessionStorage.getItem('bMapApi')

if (!bMapApi) {
  bMapApi = 'http://30.61.1.37:8519/route/v1/route'
  // bMapApi = '/route/v1/route'
//   bMapApi = '/baiduApi/direction/v2/driving'
  // bMapApi = 'http://192.168.0.151/bxmap/direction/v2/driving'
  // bMapApi = 'https://api.map.baidu.com/direction/v2/driving'
  sessionStorage.setItem('bMapApi', bMapApi)
}

import {getpassconvpath, getroute, getpassconvdetail, getpassconv} from "../assets/mockData";

export default {
  props: {
    modeUrl: {
      type: String,
      default: ''
    },
    no: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      carIconUrl: car,
      lineTemplate: {
        enableEditing: false, // 是否启用线编辑，默认为false
        strokeWeight: 6, // 折线宽度
        strokeOpacity: 0.6, // 折线透明度 strokeOpacity
        strokeStyle: 'solid',  //折线的样式，solid 或 dashed
      },
      BMap: null,
      map: null,
      polylines: [],
      activeLine: null,
      activePoint: null,
      zoom: 3,
      center: '西安',  //  {lng: 0, lat: 0}
      reqRoutes: [],
      reqPaths: [],
      lineColors: [{
        label: '行驶路径',
        type: 'driving',
        color: '#fd503e',
        selectedColor: activeLineColor,
      }, {
        label: '收费路径',
        type: 'driving_pay',
        color: '#409eff',
        selectedColor: activeLineColor,
      }, {
        label: '最小路径',
        type: 'driving_min',
        color: '#eb2df7',
        selectedColor: activeLineColor,
      }, {
        label: '其它',
        type: 'none',
        color: 'rgb(60 189 166)',
        selectedColor: activeLineColor,
      },

      ],
      pointsColors: [{
        label: '交易点',
        type: 'driving',
        color: 'rgb(253 226 19)',
        selectedColor: activeLineColor,
      }, {
        label: '车牌识别',
        type: 'driving',
        color: '#409eff',
        selectedColor: activeLineColor,
      }, {
        label: '拟合点',
        type: 'driving',
        color: 'rgb(224 31 225)',
        selectedColor: activeLineColor,
      }, {
        label: '人工校准',
        type: 'driving',
        color: 'rgb(40 189 108)',
        selectedColor: activeLineColor,
      },

      ],
    }
  },
  computed: {
    waypointsSeparator() {
      if (sessionStorage.getItem('bMapApi')?.includes('/route/v1/route')) {
        // 百度地图专网接口 waypoints使用分号作为分隔符
        return ';'
      } else {
        // 百度地图开放平台 waypoints使用竖线作为分隔符
        // https://lbs.baidu.com/faq/api?title=webapi/webservice-direction/dirve
        return '|'
      }
    },
    config() {
      let self = this
      let authConfig = self.$config
      let config = {
        ak: '',
        mapStyle: mapStyle
      }
      if (authConfig) {
        config.ak = authConfig.baiduMap.ak
      }
      return config
    },
    buildResLine: {
      // 初始化所有 需要绘制路径的路径点 起止点，途径点等
      get: function () {
        let lines = []
        let loadLineData = this.bxDeepClone(this.mockLines)

        if (Array.isArray(this.initLinks) && this.initLinks.length > 0) {
          lines = [].map(item => item)
          loadLineData = this.bxDeepClone(this.initLinks)
          for (let iIndex in loadLineData) {
            let item = this.bxDeepClone(loadLineData[iIndex])
            let line = {}
            line = {...item}

            // line['start'] = line.points.filter((p,index) => {
            //     if(p.id == '000'){
            //         return p
            //     }
            // })
            line['uid'] = `${line.id}@${Number(iIndex) + 1}`
            line['_type'] = 'line'
            line['points'] = line.points.map((p, index) => {
              p['uid'] = `${line.uid}@${p.id || index}`
              return p
            })
            line['waypoints_points'] = line.points.map(p => p)
            // line['waypoints'] = []
            // line['params'] = {
            //     // 路线规划参数
            //     origin:``,  // 起点经纬度 40.056878,116.30815 小数点后不超过6位，
            //     destination:``,  // 终点 40.056878,116.30815
            //     waypoints:'', // 途径点 40.465,116.314|40.232,116.352|40.121,116.453
            //     tactics:4    // 4 高速有限
            // }
            line['params']['origin'] = `${line.start.lat},${line.start.lng}`  // 起点参数
            line['params']['destination'] = `${line.end.lat},${line.end.lng}` // 终点
            // line['params']['waypoints_str'] = ''
            if (Array.isArray(line.waypoints) && line.waypoints.length > 0) {
              // 途径点参数
              for (let i in line.waypoints) {
                let p = line.waypoints[i]
                if (i == 0) {
                  line['params']['waypoints_str'] += `${p.lat},${p.lng}`
                } else {
                  line['params']['waypoints_str'] += `|${p.lat},${p.lng}`
                }

              }
            }
            line.start['icon'] = startIcon
            line.end['icon'] = endIcon
            line.start['icon_active'] = startIcon
            line.end['icon_active'] = endIcon
            line['params']['ak'] = 'FC190506b9b4fa8b366db9f78cb5e93e'  // 地图票据


            lines.push(this.bxDeepClone(line))
          }
        }


        return lines
      },
      set: function (point) {

      }


    }
  },
  methods: {
    initMap() {
      let self = this
      if (!window.BMap && window.BMapGL) {
        window.BMap = BMapGL
      }
      const map = new BMap.Map("mapContainer"); // 创建地图实例

      let scaleCtrl = new BMap.ScaleControl();  // 添加比例尺控件
      map.addControl(scaleCtrl);
      map.addControl(new BMap.NavigationControl(
        {
          type: BMAP_NAVIGATION_CONTROL_ZOOM, //缩放控件类型 仅包含缩放按钮
          anchor: BMAP_ANCHOR_BOTTOM_LEFT, //右下角
          offset: new BMap.Size(1, 1) //进一步控制缩放按钮的水平竖直偏移量
        }
      ));
      map.enableScrollWheelZoom(true);     //开启鼠标滚轮缩放
      // 设置地图中心点和缩放级别
      const point = new BMap.Point(108.950615, 34.346415); // lng表示经度，lat表示纬度
      // const point = new BMap.Point(116.404, 39.915); // lng表示经度，lat表示纬度
      map.centerAndZoom(point, 12); // zoomLevel表示缩放级别
      // map.setDisplayOptions({
      //     poiIcon: false,
      //     poiText: false
      // })
      // if(map.setMapStyleV2){
      //     map.setMapStyleV2({styleJson: mapStyle.styleJson});
      // }else if(map.setMapStyle){
      //     map.setMapStyle({styleJson: mapStyle.styleJson});
      // }

      this.BMap = map
      this.BMap.addEventListener("click", function (e) {
        console.log(e.point)
        if (self.activeNewPoint && self.isEditorNews) {
          let p = self.bxDeepClone(self.activeNewPoint)
          if (e.point.lat && e.point.lng) {
            p['lat'] = `${e.point.lat}`
            p['lng'] = `${e.point.lng}`
            self.newPointRequestUpdatePoint(p)
          }

        }
      })
    },
    openIsEditor() {
      this.isEditor = true
      this.$nextTick(() => {
        this.getDriving()
      })
    },
    onClickNewPoint(e) {
      console.log(e)
      debugger
      let self = this
      this.$set(this, 'activeNewPoint', e)
      let BMap = this.BMap
      let defaultCursor = ''
      if (BMap && this.activeNewPoint) {
        if (!e.lng || !e.lat) {
          // if(BMap &&( !e.lng || !e.lat)){
          defaultCursor = BMap.getDefaultCursor()
          console.log(defaultCursor)
          BMap.setDefaultCursor('crosshair')
        } else if (BMap && (e.lng && e.lat)) {
          console.log(defaultCursor)
          BMap.setDefaultCursor('url(http://api.map.baidu.com/images/openhand.cur) 8 8,default')
          self.$nextTick(() => {


            self.updateActivePoint(e)
          })

        }
      }
    },
    submitNewPoint(point) {
      console.log('新位置', point)
    },
    updateLine(line) {
      let self = this
      let overlays = self.BMap.getOverlays()
      overlays = overlays.filter(o => o.hasOwnProperty('_data') && o['_data'] && o['_data']['_type'] == 'line')
      console.log('updateLine', overlays)
      let selectedColor = activeLineColor;
      if (self.BMap && Array.isArray(overlays) && overlays.length > 0) {
        for (let overlay of overlays) {

          if (overlay['_data']['id'] == line.id && line['_editor_type'] == overlay['_data']['_editor_type']) {
            // self.BMap.removeOverlay(overlay); // 从地图上移除覆盖物
            //  self.addLines(overlay)
            overlay.setStrokeColor(selectedColor);
            overlay.setStrokeOpacity(1);
            self.$nextTick(() => {


              self.initViewport(overlay['_data'].points)
            })
          } else {
            overlay.setStrokeColor(overlay['_data'].strokeColor);
            overlay.setStrokeOpacity(overlay['_data'].strokeOpacity);
          }

        }

      }
      console.log('更新', overlays)
    },
    updateActivePoint(point) {
      let self = this
      let overlays = self.BMap.getOverlays()
      overlays = overlays.filter(o => o.hasOwnProperty('_data') && o['_data'] && (o['_data']['_type'] == 'label' || o['_data']['_type'] == 'point'))
      console.log('updateActivePoint', point)
      let selectedColor = activeLineColor;
      if (Array.isArray(overlays) && overlays.length > 0 && !point.hasOwnProperty('_editor')) {
        for (let oIndex in overlays) {
          let overlay = overlays[oIndex]
          let zIndex = Number(oIndex) + 2
          switch (overlay['_data']['_type']) {
            case 'point':
              let iconPath = overlay['_data']['icon']
              let label = overlay.getLabel()
              if (overlay) {
                if (overlay['_data'].id == point.id) {
                  zIndex = 999
                  // 更新 marker 图标
                  iconPath = overlay['_data']['icon_active']
                  console.log('更新选中marker', overlay, zIndex)
                  label.setStyle({                              // 设置选中label的样式
                    color: 'red',
                    fontSize: '12px',
                    border: '1px solid red',
                    borderRadius: '4px',
                    zIndex: 999
                  })
                  overlay.setTop(true)
                } else {
                  label.setStyle({                              // 设置label的样式
                    color: '#323232',
                    fontSize: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    zIndex: zIndex
                  })
                  overlay.setTop(false)
                }
                let icon = new BMap.Icon(iconPath, new BMap.Size(overlay['_data']['icon_size'].w, overlay['_data']['icon_size'].h), {
                  anchor: new BMap.Size(overlay['_data']['icon_anchor'].w, overlay['_data']['icon_anchor'].h),
                  imageOffset: new BMap.Size(0, 0),   // 设置图片偏移
                  zIndex: zIndex
                })
                overlay.setIcon(icon)
                overlay.setLabel(label)  // 更新标注label
                // overlay.setZIndex(zIndex)

              }


              break;


            default:
              break;
          }


        }

      } else if (Array.isArray(overlays) && overlays.length > 0 && point.hasOwnProperty('_editor')) {
        overlays = overlays.filter(o => o.hasOwnProperty('_data') && o['_data'] && o['_data']['_type'] == 'point' && o['_data'].hasOwnProperty('_editor') && o['_data']['_editor'] == 'add')

        for (let oIndex in overlays) {
          let overlay = overlays[oIndex]
          let zIndex = Number(oIndex) + 2
          switch (overlay['_data']['_type']) {
            case 'point':
              let iconPath = overlay['_data']['icon']
              let label = overlay.getLabel()
              if (overlay) {
                if (overlay['_data'].id == point.id && overlay['_data']['_editor'] == point['_editor']) {
                  zIndex = 999
                  // 更新 marker 图标
                  iconPath = overlay['_data']['icon_active']
                  console.log('更新选中marker', overlay, zIndex)
                  label.setStyle({                              // 设置选中label的样式
                    color: 'red',
                    fontSize: '12px',
                    border: '1px solid red',
                    borderRadius: '4px',
                    zIndex: 999
                  })
                  overlay.setTop(true)
                } else if (overlay['_data']['_editor']) {
                  label.setStyle({                              // 设置label的样式
                    color: '#323232',
                    fontSize: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    zIndex: zIndex
                  })
                  overlay.setTop(false)
                }
                let icon = new BMap.Icon(iconPath, new BMap.Size(overlay['_data']['icon_size'].w, overlay['_data']['icon_size'].h), {
                  anchor: new BMap.Size(overlay['_data']['icon_anchor'].w, overlay['_data']['icon_anchor'].h),
                  imageOffset: new BMap.Size(0, 0),   // 设置图片偏移
                  zIndex: zIndex
                })
                overlay.setIcon(icon)
                overlay.setLabel(label)  // 更新标注label
                // overlay.setZIndex(zIndex)

              }


              break;


            default:
              break;
          }


        }
      }
      self.$nextTick(() => {


        self.initViewport([point])
      })

    },
    addLines(line) {
      // 绘制线
      let self = this
      let linePoints = []
      let points = line['points']
      let selectedColor = activeLineColor;
      // 判断是否已经绘制
      // console.log('添加线条',line.id,line)
      let overlays = self.BMap.getOverlays()
      overlays = overlays.filter(o => o.hasOwnProperty('_data') && o['_data'])
      if (this.modeUrl == '/bmap/check') {
        // 门架 编辑时 移除重绘线
        if (Array.isArray(overlays) && overlays.filter(o => o.hasOwnProperty('_data') && o['_data']['_type'] == 'line' && o['_data']['id'] == line.id).length == 1) {
          let lines = overlays.filter(o => o.hasOwnProperty('_data') && o['_data']['_type'] == 'line' && o['_data']['id'] == line.id)
          self.BMap.removeOverlay(lines[0]); // 从地图上移除覆盖物
          console.log('移除已经存在的线', lines, line.id)
        } else if (Array.isArray(overlays) && overlays.filter(o => o.hasOwnProperty('_data')).length > 0) {
          let oldpoints = overlays.filter(o => o.hasOwnProperty('_data') && (o['_data']['_type'] == 'point' || o['_data']['_type'] == 'label'))
          console.log('oldpoints', oldpoints, overlays)
          for (let oldo of oldpoints) {
            // self.BMap.removeOverlay(oldo); // 从地图上移除覆盖物
          }
        }
        // if(this.initCheckPointId && this.activeDeptNo && this.initCheckPoint && line.id == this.initCheckPoint['road_no']){

        //      this.onTollLink(line)
        // }

      }


      // 开始绘制逻辑
      if (points && points.length > 0) {
        for (let point of points) {
          linePoints.push(new BMap.Point(point.lng, point.lat))
        }
      }
      let strokeStyle = line.strokeStyle
      if (line['_editor_type'] == 'driving_min') {
        // strokeStyle = 'dashed'
      }

      let polyline = new BMap.Polyline(
        linePoints,
        {
          strokeColor: line.strokeColor,
          strokeWeight: line.strokeWeight,
          strokeOpacity: line.strokeOpacity,
          strokeStyle: strokeStyle,
          enableClicking: true,
          // strokeTexture: {
          //   // url: bludArrow,
          //   width: 16,
          //   height: 64
          // },
        });
      if (self.activeLine && self.activeLine.id == line.id && self.activeLine['_editor_type'] == line['_editor_type']) {

        polyline = new BMap.Polyline(linePoints,
          {
            strokeColor: selectedColor,
            strokeWeight: line.strokeWeight,
            strokeOpacity: 1,
            strokeStyle: strokeStyle,
            enableClicking: true,
            // strokeTexture: {
            //   // url: bludArrow,
            //   width: 16,
            //   height: 64
            // },
          });

        // 如果是选中线的时候 进入线 标点绘制逻辑
        self.removeOverlays(line)

      }
      debugger
      this.BMap.addOverlay(polyline);
      // polyline.setTitle("Custom Data");
      polyline['_data'] = this.bxDeepClone(line)
      // click
      // this.BMap.addEventListener("click", function (e) {
      polyline.addEventListener("click", function (type, target, point, pixel) {
        console.log(type.point, type.target)
        let overlay = type.target

        let title = ''
        console.log('点击线', type, target, point, pixel)
        if (overlay && overlay.hasOwnProperty('_data') && overlay['_data'] && overlay['_data']['_type'] == 'line') {


          // self.$set(self,'activeLine',overlay['_data'])
          self.$set(self, 'activePoint', null)  // 避免视口缩放冲突，清除已选中的点
          self.onTollLink(overlay['_data'])
          title = overlay['_data'].id

          console.log(overlay['_data'], overlay['_data']['_editor_type'], polyline['_data']['_editor_type'], overlay['_data']['_editor_type'] == polyline['_data']['_editor_type'])
          if (polyline && overlay === polyline && overlay['_data'] && polyline['_data'] && overlay['_data']['_editor_type'] == polyline['_data']['_editor_type'] && overlay['_data']['id'] == polyline['_data']['id']) {
            // 修改线的样式
            console.log(overlay)
            polyline.setStrokeColor(selectedColor);
            polyline.setStrokeOpacity(1);
            self.removeOverlays(overlay['_data'])
          } else {
            // 清除之前选中的线
            if (polyline) {
              polyline.setStrokeColor(polyline['_data'].strokeColor);
              polyline.setStrokeOpacity(polyline['_data'].strokeOpacity);
              console.log(polyline)
            }
          }

        }


      });

      //   console.log('addline 初始化',this.activePoint,this.activeLine,this.polylines)
      if (this.activePoint) {
        this.initViewport([this.activePoint])
      } else if (this.activeLine) {
        this.initViewport(this.activeLine.points)
      } else if (Array.isArray(this.polylines) && this.polylines.length > 0) {
        // console.log('addline 初始化 none active',this.polylines)
        let wps = []
        for (let pLine of this.polylines) {
          wps = wps.concat(pLine.waypoints_points)
        }
        this.initViewport(wps)
      }


    },
    removeOverlays(line) {
      // 重绘线上覆盖物，标点
      // console.log('移除覆盖物',line,line.id,line.waypoints_points)
      let self = this
      if (self.BMap) {

        let overlays = self.BMap.getOverlays()
        let removeOverlays = []
        console.log('需要清除的点', self.BMap.getOverlays(), removeOverlays)
        if (line) {
          removeOverlays = overlays.filter(o => o.hasOwnProperty('_data') && o['_data'] && (o['_data']['_type'] == 'point' || o['_data']['_type'] == 'label'))
        }
        for (let o of removeOverlays) {

          self.BMap.removeOverlay(o); // 从地图上移除覆盖物
        }
        if (line) {

          self.addMarkers(line)
        }
      }


    },

    addMarkers(line) {
      // 绘制标点
      let self = this
      if (self.BMap) {
        let overlays = self.BMap.getOverlays() // 地图覆盖物

        // overlays = overlays.filter(item => item.hasOwnProperty('_data') && item['_data']['_type'] == 'point')
        console.log('已有标点', overlays)
        // for(let overlay of overlays){
        //     self.BMap.removeOverlay(overlay);
        // }
      }

      console.log('绘制标点', line, line['waypoints_points'])
      let waypoints = line['waypoints_points']
      if (this.modeUrl == '/bmap/editor/') {
        // 如果时路径校准地图时 ， marker 使用全部点 all_points  存在拆线情况
        waypoints = line['all_points']

      }
      if (Array.isArray(waypoints) && waypoints.length > 0) {
        for (let pIndex in waypoints) {
          let p = waypoints[pIndex]
          let point = new BMap.Point(p.lng, p.lat);
          let content = `${p.name}`; // label 显示内容
          if (self.modeUrl == '/bmap/editor/') {
            content = `${p['_seq']}.${p.name}`; // label 显示内容
          }
          let label = new BMap.Label(content, {       // 创建文本标注
            position: point,
            offset: new BMap.Size(p["icon_size"].w, 0)
          })

          let zIndex = pIndex + 2
          let iconPath = p.icon
          if (self.activePoint && p.id == self.activePoint.id) {
            iconPath = p.icon_active
            zIndex = 999
          }
          let myIcon = new BMap.Icon(iconPath || cameraIcon, new BMap.Size(p["icon_size"].w, p["icon_size"].h), {
            // 指定定位位置。
            // 当标注显示在地图上时，其所指向的地理位置距离图标左上
            // 角各偏移10像素和25像素。您可以看到在本例中该位置即是
            // 图标中央下端的尖角位置。
            anchor: new BMap.Size(p["icon_anchor"].w, p["icon_anchor"].h),
            // 设置图片偏移。
            // 当您需要从一幅较大的图片中截取某部分作为标注图标时，您
            // 需要指定大图的偏移位置，此做法与css sprites技术类似。
            imageOffset: new BMap.Size(0, 0),   // 设置图片偏移
            zIndex: zIndex
          });
          // 创建标注对象并添加到地图
          let marker = new BMap.Marker(point, {icon: myIcon, title: p.name, enableDragging: this.isEditor});

          marker['_data'] = p
          let labelData = self.bxDeepClone(p)
          labelData['_type'] = 'label'
          label['_data'] = labelData
          if (this.activePoint && this.activePoint.id == p.id) {
            label.setStyle({                              // 设置label的样式
              color: 'red',
              fontSize: '12px',
              border: '1px solid red',
              borderRadius: '4px',
              zIndex: 999
            })
          } else {
            label.setStyle({                              // 设置label的样式
              color: '#323232',
              fontSize: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px'
            })
          }
          marker.setLabel(label)  // 设置标注
          marker.addEventListener("click", function (e) {
            let overlay = e.currentTarget
            let overlays = self.BMap.getOverlays()

            if (overlay.hasOwnProperty('_data') && overlay['_data'] && overlay['_data']['_type'] == 'point') {
              self.$set(self, 'activePoint', overlay['_data'])

              let pointOverlays = overlays.filter(o => o.hasOwnProperty('_data') && o['_data']['_type'] == 'point')

              if (Array.isArray(pointOverlays)) {
                // 更新点图标
                for (let pointIndex in pointOverlays) {
                  let l = pointOverlays[pointIndex]
                  let zIndex = pointIndex + 2
                  let label = l.getLabel()
                  // console.log('dianji',label)
                  if (l['_data'].id == overlay['_data'].id) {
                    // 更新 marker 图标
                    label.setStyle({                              // 设置选中label的样式
                      color: 'red',
                      fontSize: '12px',
                      border: '1px solid red',
                      borderRadius: '4px',
                      zIndex: 999
                    })
                    let activeIconPath = l['_data']['icon_active']
                    // console.log('activeIconPath 1',overlay['_data'],activeIconPath)
                    let activeIcon = new BMap.Icon(activeIconPath, new BMap.Size(l['_data']["icon_size"].w, l['_data']["icon_size"].h), {
                      anchor: new BMap.Size(l['_data']["icon_anchor"].w, l['_data']["icon_anchor"].h),
                      imageOffset: new BMap.Size(0, 0),   // 设置图片偏移
                      zIndex: 999
                    })
                    l.setIcon(activeIcon)
                    // l.setZIndex(999)
                    l.setTop(true)
                  } else {
                    label.setStyle({                              // 设置label的样式
                      color: '#323232',
                      fontSize: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      zIndex: zIndex
                    })
                    // 更新 marker 图标
                    let activeIconPath = l['_data']['icon']
                    // console.log('activeIconPath 0',overlay['_data'],activeIconPath)
                    let activeIcon = new BMap.Icon(activeIconPath, new BMap.Size(l['_data']["icon_size"].w, l['_data']["icon_size"].h), {
                      anchor: new BMap.Size(l['_data']["icon_anchor"].w, l['_data']["icon_anchor"].h),
                      imageOffset: new BMap.Size(0, 0),   // 设置图片偏移
                      zIndex: zIndex
                    })
                    l.setIcon(activeIcon)
                    // l.setZIndex(zIndex)
                    l.setTop(false)

                  }

                  l.setLabel(label)  // 更新标注label
                }
              }
              console.log("您点击了标注：", overlay);
            } else {

            }

          });
          if (this.isEditor) {
            marker.enableDragging() // 开启拖动 dragend
          }

          marker.addEventListener('dragend', function (event) {
            console.log('标注已移动至：' + event.point.lng + ', ' + event.point.lat, event.target['_data'].uid);
            let point = self.bxDeepClone(event.target['_data'])
            debugger
            if (event.latLng) {
              event.point = event.latLng
            }
            point['lng'] = event.point.lng
            point['lat'] = event.point.lat
            self.$nextTick(() => {


              self.updatePoint(point)
            })

          });
          marker.addEventListener('dragstart', function (event) {
            console.log('标注开始拖拽：' + event.point.lng + ', ' + event.point.lat, event.target['_data'].uid);
            // let point = self.bxDeepClone(event.target['_data'])
            // point['lng'] = event.point.lng
            // point['lat'] = event.point.lat
            // self.$nextTick(() => {
            //         self.updatePoint(point)
            // })

          });
          marker.addEventListener('dragging', function (event) {
            let pid = event.target['_data'].id
            let overlays = self.BMap.getOverlays()
            overlays = overlays.filter(o => o.hasOwnProperty('_data') && o['_data']['_type'] == 'label' && o['_data']['id'] == pid)
            if (Array.isArray(overlays) && overlays.length == 1) {

              console.log('拖拽：' + event.point.lng + ', ' + event.point.lat, overlays);
              let label = overlays[0]
              let nPoint = new BMap.Point(event.point.lng, event.point.lat);
              label.setPosition(nPoint)
            }
          });

          self.BMap.addOverlay(marker);
          // self.BMap.addOverlay(label);                        // 将标注添加到地图中
        }
      }

    },

    addNewPointMarkers(points) {
      // 绘制标点
      let self = this
      console.log('绘制标点', points)
      let waypoints = points
      // if(this.modeUrl == '/bmap/editor/'){
      //     // 如果时路径校准地图时 ， marker 使用全部点 all_points  存在拆线情况
      //     waypoints = line['all_points']

      // }
      if (!self.BMap) {
        return
      }
      let overlays = self.BMap.getOverlays() // 地图覆盖物

      overlays = overlays.filter(item => item.hasOwnProperty('_data') && item['_data']['_type'] == 'point' && item['_data'].hasOwnProperty('_editor') && item['_data']['_editor'] == 'add')
      for (let overlay of overlays) {
        self.BMap.removeOverlay(overlay);
      }
      overlays = self.BMap.getOverlays() // 地图覆盖物
      if (Array.isArray(waypoints) && waypoints.length > 0) {
        debugger
        let oldIds = []
        for (let pIndex in waypoints) {

          let p = waypoints[pIndex]
          if (oldIds.includes(p.id)) {

            // console.log('绘制门架点,已存在',p,oldIds,overlays)
            continue
          }
          let point = new BMap.Point(p.lng, p.lat);
          let content = p.name; // label 显示内容
          p['icon_size'] = p['icon_size'] || {w: 25, h: 38}
          p['icon_anchor'] = p['icon_anchor'] || {w: p['icon_size'] / 2, h: p['icon_size'].h}
          p['icon'] = custom
          p['icon_active'] = custom
          p['_type'] = 'point'
          p['_editor'] = 'add'
          p['_dev_point_type'] = p['category']

          let label = new BMap.Label(content, {       // 创建文本标注
            position: point,
            offset: new BMap.Size(p["icon_size"].w, 0)
          })

          let zIndex = pIndex + 2
          let iconPath = p.icon
          if (self.activePoint && p.id == self.activePoint.id) {
            iconPath = p.icon_active
            zIndex = 999
          }
          let myIcon = new BMap.Icon(iconPath || custom, new BMap.Size(p["icon_size"].w, p["icon_size"].h), {
            // 指定定位位置。
            // 当标注显示在地图上时，其所指向的地理位置距离图标左上
            // 角各偏移10像素和25像素。您可以看到在本例中该位置即是
            // 图标中央下端的尖角位置。
            anchor: new BMap.Size(p["icon_anchor"].w, p["icon_anchor"].h),
            // 设置图片偏移。
            // 当您需要从一幅较大的图片中截取某部分作为标注图标时，您
            // 需要指定大图的偏移位置，此做法与css sprites技术类似。
            imageOffset: new BMap.Size(0, 0),   // 设置图片偏移
            zIndex: zIndex
          });
          // 创建标注对象并添加到地图
          let marker = new BMap.Marker(point, {icon: myIcon, title: p.name, enableDragging: this.isEditor});

          marker['_data'] = p
          let labelData = self.bxDeepClone(p)
          labelData['_type'] = 'label'
          label['_data'] = labelData
          if (this.activeNewPoint && this.activeNewPoint.id == p.id) {
            label.setStyle({                              // 设置label的样式
              color: 'red',
              fontSize: '12px',
              border: '1px solid red',
              borderRadius: '4px',
              zIndex: 999
            })
          } else {
            label.setStyle({                              // 设置label的样式
              color: '#323232',
              fontSize: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px'
            })
          }
          marker.setLabel(label)  // 设置标注
          marker.addEventListener("click", function (e) {
            let overlay = e.currentTarget
            let overlays = self.BMap.getOverlays()

            if (overlay.hasOwnProperty('_data') && overlay['_data'] && overlay['_data']['_type'] == 'point') {
              self.$set(self, 'activePoint', overlay['_data'])

              let pointOverlays = overlays.filter(o => o.hasOwnProperty('_data') && o['_data']['_type'] == 'point' && o['_data'].hasOwnProperty('_editor') && o['_data']['_editor'] == 'add')

              if (Array.isArray(pointOverlays)) {
                // 更新点图标
                for (let pointIndex in pointOverlays) {
                  let l = pointOverlays[pointIndex]
                  let zIndex = pointIndex + 2
                  let label = l.getLabel()
                  // console.log('dianji',label)
                  if (l['_data'].id == overlay['_data'].id) {
                    // 更新 marker 图标
                    label.setStyle({                              // 设置选中label的样式
                      color: 'red',
                      fontSize: '12px',
                      border: '1px solid red',
                      borderRadius: '4px',
                      zIndex: 999
                    })
                    let activeIconPath = l['_data']['icon_active']
                    // console.log('activeIconPath 1',overlay['_data'],activeIconPath)
                    let activeIcon = new BMap.Icon(activeIconPath, new BMap.Size(l['_data']["icon_size"].w, l['_data']["icon_size"].h), {
                      anchor: new BMap.Size(l['_data']["icon_anchor"].w, l['_data']["icon_anchor"].h),
                      imageOffset: new BMap.Size(0, 0),   // 设置图片偏移
                      zIndex: 999
                    })
                    l.setIcon(activeIcon)
                    // l.setZIndex(999)
                    l.setTop(true)
                  } else {
                    label.setStyle({                              // 设置label的样式
                      color: '#323232',
                      fontSize: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      zIndex: zIndex
                    })
                    // 更新 marker 图标
                    let activeIconPath = l['_data']['icon']
                    // console.log('activeIconPath 0',overlay['_data'],activeIconPath)
                    let activeIcon = new BMap.Icon(activeIconPath, new BMap.Size(l['_data']["icon_size"].w, l['_data']["icon_size"].h), {
                      anchor: new BMap.Size(l['_data']["icon_anchor"].w, l['_data']["icon_anchor"].h),
                      imageOffset: new BMap.Size(0, 0),   // 设置图片偏移
                      zIndex: zIndex
                    })
                    l.setIcon(activeIcon)
                    // l.setZIndex(zIndex)
                    l.setTop(false)

                  }

                  l.setLabel(label)  // 更新标注label
                }
              }
              console.log("您点击了标注：", overlay);
            } else {

            }

          });
          if (this.isEditor) {
            marker.enableDragging() // 开启拖动 dragend
          }

          marker.addEventListener('dragend', function (event) {
            console.log('新门架点校准' + event.point.lng + ', ' + event.point.lat, event.target['_data']);
            let point = self.bxDeepClone(event.target['_data'])
            point['lng'] = event.point.lng
            point['lat'] = event.point.lat
            if (point && point.hasOwnProperty('_editor') && point['_editor'] == 'add') {
              self.$nextTick(() => {


                self.newPointRequestUpdatePoint(point)
              })
            }


          });
          marker.addEventListener('dragstart', function (event) {
            console.log('标注开始拖拽：' + event.point.lng + ', ' + event.point.lat, event.target['_data'].uid);
            // let point = self.bxDeepClone(event.target['_data'])
            // point['lng'] = event.point.lng
            // point['lat'] = event.point.lat
            // self.$nextTick(() => {
            //         self.updatePoint(point)
            // })

          });
          marker.addEventListener('dragging', function (event) {
            let pid = event.target['_data'].id
            let overlays = self.BMap.getOverlays()
            overlays = overlays.filter(o => o.hasOwnProperty('_data') && o['_data']['_type'] == 'label' && o['_data']['id'] == pid)
            if (Array.isArray(overlays) && overlays.length == 1) {

              console.log('拖拽：' + event.point.lng + ', ' + event.point.lat, overlays);
              let label = overlays[0]
              let nPoint = new BMap.Point(event.point.lng, event.point.lat);
              label.setPosition(nPoint)
            }
            // let point = self.bxDeepClone(event.target['_data'])
            // point['lng'] = event.point.lng
            // point['lat'] = event.point.lat
            // self.$nextTick(() => {
            //         self.updatePoint(point)
            // })
            // setPosition(position: Point)
          });

          self.BMap.addOverlay(marker);
          // self.BMap.addOverlay(label);                        // 将标注添加到地图中
        }
      } else if (self.BMap) {
        for (let overlay of overlays) {
          self.BMap.removeOverlay(overlay);
        }
      }

      self.$nextTick(() => {


        self.initViewport(points)
      })

    },
    updatePoint(p, l) {
      let self = this
      let i = null
      let idsArr = p.uid.split('@')
      console.log(p, idsArr)
      let isUpdate = false
      let newLatAndLng = null
      let loadLines = this.initLinks || this.mockLines

      for (let initLine of loadLines) {
        if (initLine.id == `${idsArr[0]}`) {
          // console.log('更新线条下的点位置',p)
          let ps = this.bxDeepClone(initLine.points)
          for (let point of initLine.points) {
            // console.log('0:',JSON.stringify(point),p.id)
            if (`${idsArr[idsArr.length - 1]}` == point.id && (`${p.lat}` !== `${point['lat']}` || `${p.lng}` !== `${point['lng']}`)) {
              isUpdate = true
              newLatAndLng = point
              // point['lat'] = `${p.lat}`
              // point['lng'] = `${p.lng}`
              // console.log('1:',JSON.stringify(point))
            }

          }
          // initLine.points = ps.map(item => item)
        }
      }
      if (isUpdate) {
        this.$confirm(`[${p.name}]位置已更新, 立即保存?`, '提示', {
          confirmButtonText: '确定',
          type: 'warning'
        }).then(() => {
          newLatAndLng['lat'] = `${p.lat}`
          newLatAndLng['lng'] = `${p.lng}`
          this.requestUpdatePoint(p)
          self.updatePoints = self.updatePoints.filter(item => item.id !== p.id) // 保存后清空该点未保存的 记录
        }).catch((er) => {
          console.log(er)
          let ids = self.updatePoints.map(item => item.id)
          console.log(ids)
          if (ids.includes(p.id)) {
            for (let up of self.updatePoints) {
              if (up.id == p.id) {
                up['lng'] = `${p.lng}`
                up['lag'] = `${p.lag}`
              }
            }
          } else {
            self.updatePoints.push(p)
          }

        })
      }


    },
    //初始化地图
    initViewport: function (pointsArray) {
      // let BMap = this.BMap;
      // let map = this.map;
      let centerPoint = this.BMap.getViewport(eval(pointsArray))  // this.pathArr 是我们知道的经纬度。可以有多个。全部以数组形式放在里面。
      //进入显示的百分比
      //打开地图时的位置
      if (!centerPoint?.center?.lat || !centerPoint?.center?.lng) {
        return
      }
      // console.log('初始化',centerPoint,centerPoint.center,centerPoint.zoom)
      // 初始化地图，设置中心点坐标和地图级别
      if (this.activePoint) {
        this.BMap.centerAndZoom(centerPoint.center, 14)
      } else if (this.activeLine) {
        this.BMap.centerAndZoom(centerPoint.center, centerPoint.zoom)
      } else {
        this.BMap.centerAndZoom(centerPoint.center, centerPoint.zoom)
      }

    },
    async getDriving(type) {
      let self = this
      let mapApi = bMapApi;
      let url = ''
      let params = {
        origin: ``,  // 起点经纬度 40.056878,116.30815 小数点后不超过6位，
        destination: ``,  // 终点 40.056878,116.30815
        waypoints: '', // 途径点 40.465,116.314|40.232,116.352|40.121,116.453
        tactics: 4    // 4 高速有限
      }
      // 清除所有线
      if (self.BMap) {
        self.BMap.clearOverlays();
      }

      let loadLines = self.bxDeepClone(self.buildResLine)
      if (Array.isArray(loadLines) && self.activeLine?._editor_type) {
        // 只显示当前选中的路径
        const currentLineIndex = loadLines.findIndex(item => item._editor_type === self.activeLine?._editor_type)
        const currentLine = {...loadLines[currentLineIndex]}
        loadLines = [currentLine]
      }
      console.log('getDriving 重新绘制', self.polylines, loadLines)
      if ((this.modeUrl == '/bmap/check' && Array.isArray(loadLines) && loadLines.length > 0) || (this.modeUrl == '/bmap/editor/' && Array.isArray(loadLines) && loadLines.length > 0)) {
        self.polylines = []
        self.polylines = self.polylines.map(item => item)
        for (let i in loadLines) {
          console.log('绘制line', i)
          let loadLine = this.bxDeepClone(loadLines[i])

          let id = loadLine.id
          // 循环规划路径

          params = {
            origin: ``,  // 起点经纬度 40.056878,116.30815 小数点后不超过6位，
            destination: ``,  // 终点 40.056878,116.30815
            waypoints: '', // 途径点 40.465,116.314|40.232,116.352|40.121,116.453
            tactics: 0    // 4 高速有限
            // tactics:4    // 4 高速有限
          }
          params['origin'] = `${loadLine.params['origin']}`
          params['destination'] = `${loadLine.params['destination']}`
          params['waypoints'] = `${loadLine.params['waypoints_str']}`
          if (this.waypointsSeparator === ';') {
            // 百度地图专网接口 waypoints使用分号作为分隔符
            // 百度地图开放平台 waypoints使用竖线作为分隔符
            // // https://lbs.baidu.com/faq/api?title=webapi/webservice-direction/dirve
            params['waypoints'] = params['waypoints'].replaceAll('|', ';')
            // debugger
            // const point1= await geoconv(params.origin.split(',').reverse().toString())
            // const point2= await geoconv(params.destination.split(',').reverse().toString())
            // debugger
            // if(point1?.length){
            //     params.origin = `${point1[0].y},${point1[0].x}`
            // }
            // if(point2?.length){
            //     params.destination = `${point2[0].y},${point2[0].x}`
            // }
            // params.inputCrs = 'gcj02ll'
            params.outputCrs='wgs84ll'
          }
          url = `${mapApi}`
          if (url?.includes('route/v1/route')) {
            // 专网接口
            params['ApiAuthorization'] = 'USER_AK'
          } else {
            params['ak'] = `${loadLine.params['ak']}`
          }
          if (Array.isArray(loadLine['points']) && loadLine['points'].length > 0) {
            // getroute(url,params).then(res => { //mockdata
            getBaiduMapApi(url, params).then(res => {
              // console.log('/direction/v2/driving res',res.data)
              let routes = []
              res = res.data || null
              if (res && res.status === 0) {
                this.reqRoutes = res.result.routes
                if (!res.result?.routes && res.result?.steps) {
                  // 专网接口
                  let steps = []
                  let points = res.result.points.split(';')
                // if(points?.length){
                //     for (const path of points) {
                //         const arr = path.split(',')
                //         steps.push({
                //             lat:arr[1],
                //             lng:arr[0]
                //         })
                //     }
                // }
                  for (let step of res.result?.steps) {
                    // let path = step.path.split(';')
                    let path = step.path.split(',')
                    path = path.reduce((pre, cur, index) => {
                      if (index % 2 === 0) {
                        pre.push(cur)
                      } else {
                        pre[pre.length - 1] += `,${cur}`
                      }
                      return pre
                    }, [])
                    path = path.map(item => {
                      let point = {
                        lat: `${item.split(',')[1]}`,
                        lng: `${item.split(',')[0]}`,
                      }
                      return point
                    })
                    steps = steps.concat(path)
                  }
                  routes = routes.concat(steps)
                } else if (res.result?.routes) {
                  for (let route of res.result.routes) {
                    let steps = []
                    for (let step of route.steps) {
                      let path = step.path.split(';')
                      path = path.map(item => {
                        let point = {
                          lat: `${item.split(',')[1]}`,
                          lng: `${item.split(',')[0]}`,
                        }
                        return point
                      })
                      steps = steps.concat(path)
                    }
                    routes = routes.concat(steps)
                  }
                }

                this.reqPaths = routes.map(item => item)
                // console.log('routes',routes)
                let points = []
                for (let p of routes) {
                  points.push(p);

                }
                let color = self.lineColors[i % 4]
                if (self.modeUrl == '/bmap/editor/') {
                  color = self.lineColors.filter(item => item.type == loadLine['_editor_type'])
                  if (Array.isArray(color) && color.length > 0) {
                    color = color[0]
                  }
                }
                let line = {
                  strokeColor: color.color,  // linear-gradient(#ff0000 0%, #ffff00 50%, #0000ff 100%)
                  selectedColor: color.selectedColor,
                  uid: `${loadLine.uid}`,
                  strokeStyle: 'solid',
                  ...self.lineTemplate

                }
                line['points'] = points.map(item => item)
                line['id'] = id
                line['waypoints'] = this.bxDeepClone(loadLine.waypoints)
                line['waypoints_points'] = this.bxDeepClone(loadLine.points)
                line['start'] = this.bxDeepClone(loadLine.start)
                line['end'] = this.bxDeepClone(loadLine.end)
                if (this.modeUrl == '/bmap/editor/') {
                  // 如果时路径校准地图时 ， marker 使用全部点 all_points  存在拆线情况
                  debugger
                  line['all_points'] = this.bxDeepClone(loadLine.all_points)

                }

                line['waypoints_points'] = line['waypoints_points'].map((item, pIndex) => {
                  // item['uid'] = `${line.lineId}-${pIndex}`
                  item['_type'] = 'point'
                  return item
                })
                line['_type'] = 'line'
                line['_editor_type'] = loadLine['_editor_type']
                self.polylines.push(self.bxDeepClone(line))
                console.log('画线', self.bxDeepClone(line))
                self.addLines(self.bxDeepClone(line))  // 添加路线
              } else {
                if (res) {
                  this.$message.error(JSON.stringify(res));
                } else {
                  this.$message.error('路线规划接口无响应！');
                }

              }
            })
          }

        }

      }
    },
    onEditorType(type) {
      if (this.BMap) {
        //
        console.log('type', type)
        let lines = this.buildResLine.filter(item => item['_editor_type'] == type)
        console.log('lines', lines)
        if (Array.isArray(lines) && lines.length > 0) {
          this.onLineList(lines[0], type)
        }
      }

    },
    onLineList(line, type) {
      let self = this
      let oldActive = self.bxDeepClone(self.activeLine)
      if (type && oldActive && oldActive['_editor_type'] === type) {
        // 点击当前路径 取消选中状态
        self.$set(self, 'activeLine', null)
      } else if (self.activeLine && line && JSON.stringify(self.activeLine) !== JSON.stringify(line)) {
        self.$set(self, 'activeLine', line)
        self.$set(self, 'activePoint', null);
      } else if (!self.activeLine && line) {
        self.$set(self, 'activeLine', line)
      }
      self.$nextTick(() => {
        // self.updateLine(line)
        if (this.modeUrl == '/bmap/editor/' && (line['_editor_type'] == 'driving' || JSON.stringify(self.activeLine) !== JSON.stringify(oldActive))) {
          this.$nextTick(() => {
            // this.polylines = []
            this.getDriving()
          })
        }
      })
    },
    onPointList(e) {
      let self = this
      if (this.activeLine && e) {
        console.log(e)
        if (self.activePoint && e.id !== self.activePoint.id) {
          self.$set(self, 'activePoint', e);
          self.$nextTick(() => {


            self.updateActivePoint(e)
          })
        } else if (!self.activePoint) {

          self.$set(self, 'activePoint', e);
          self.$nextTick(() => {
            self.updateActivePoint(e)
          })
        }


      }
    },
    getAllStation() {
      // category取值：门架、收费站
      // grantry_type取值：路段门架、虚拟门架、省界门架、收费站
      // company_no：分公司，可通过该字段进行过滤，分公司用户登录时，使用用户的dept_no进行过滤
      let srv = 'srvaud_tollgrantry_station_select';
      let srvAuth = 'aud'
      let conds = []
      let relationCondition = {}
      let page = null
      let order = null
      self.select(
        srv,
        conds,
        page,
        order,
        null,
        null,
        null,
        null,
        null,
        relationCondition,
        false,
        null,
        srvAuth
      ).then(res => {
        console.log(res)
        if (res.state == "SUCCESS") {

        }
      })
    }
  },
  watch: {}

};
  