
import mapStyle from './mapStyle.json'

// import { getBaiduMapApi} from '@/api/api.js'
export default {
    data(){
        return {
            BMap:null,
            map:null,
            polylines:[],
            activeLine:null,
            activePoint:null,
            zoom: 3,
            center: '',  //  {lng: 0, lat: 0}
            reqRoutes:[],
            reqPaths:[],
            lineColors:[{
                type:'red',
                color:'#f30e0e',
                selectedColor:'#ffee0b',
              },{
                type:'green',
                color:'#089d0d',
                selectedColor:'#ffee0b',
              },{
                type:'blue',
                color:'#32bafd',
                selectedColor:'#ffee0b',
              }],
        }
    },
    computed:{
        config(){
            let self = this
            let authConfig = self.$config
            let config = {
                ak:'',
                mapStyle:mapStyle
            }
            if(authConfig){
                config.ak = authConfig.baiduMap.ak
            }
            return config
        },
        buildResLine:{
            get:function(){
                let lines = []
                let loadLineData = this.bxDeepClone(this.mockLines)
                if(Array.isArray(loadLineData) && loadLineData.length > 0){
                    for(let iIndex in loadLineData){
                        let item =  this.bxDeepClone(loadLineData[iIndex])
                        let line = {}
                        line = {...item}
                        
                        line['start'] = line.points.filter((p,index) => {
                            if(p.id == '000'){
                                return p
                            }
                        })
                        line['uid'] = `${line.id}@${ Number(iIndex) +1}`
                        line['type'] = 'line'
                        line['points'] = line.points.map((p,index) => {
                            p['uid'] = `${line.uid}@${p.id}`
                            return p
                        })
                        if(line['start'].length > 0){
                            line['start'] = line['start'][0]
                        }
                        line['end'] = line.points.filter((p,index) => {
                            if(p.id == '00x'){
                                return p
                            }
                        })
                        if(line['end'].length > 0){
                            line['end'] = line['end'][0]
                        }
                        line['waypoints'] = line.points.filter((p,index) => {
                            if(p.id  !== '000' && p.id !== '00x'){
                                return p
                            }
                        })
                        line['params'] = {
                            // 路线规划参数
                            origin:``,  // 起点经纬度 40.056878,116.30815 小数点后不超过6位，
                            destination:``,  // 终点 40.056878,116.30815
                            waypoints:'', // 途径点 40.465,116.314|40.232,116.352|40.121,116.453
                            tactics:4    // 4 高速有限
                        }
                        line['params']['origin'] = `${line.start.lat},${line.start.lng}`  // 起点参数
                        line['params']['destination'] = `${line.end.lat},${line.end.lng}` // 终点
                        if(Array.isArray(line.waypoints) && line.waypoints.length > 0){
                            // 途径点参数
                            line['params']['waypoints_str'] = ''
                            for(let i in line.waypoints){
                                let p = line.waypoints[i]
                                if(i == 0){
                                    line['params']['waypoints_str'] += `${p.lat},${p.lng}`
                                }else{
                                    line['params']['waypoints_str'] += `|${p.lat},${p.lng}`
                                }
                                
                            }
                        }
                        line['params']['ak'] = this.config.ak  // 地图票据
                        lines.push(line)
                    }
                }
                return lines
            },
            set:function(point){

            }
        
            
        }
    },
    methods: {
        initMap(){
            const map = new BMap.Map("mapContainer"); // 创建地图实例
            
            
            map.enableScrollWheelZoom(true);     //开启鼠标滚轮缩放
            // 设置地图中心点和缩放级别  
            const point = new BMap.Point(116.404, 39.915); // lng表示经度，lat表示纬度
            map.centerAndZoom(point, 12); // zoomLevel表示缩放级别
            // map.setDisplayOptions({
            //     poiIcon: false,
            //     poiText: false
            // })
            this.BMap = map
        },
        updateLine(line){
            let self = this
            let overlays = self.BMap.getOverlays()
            overlays = overlays.filter(o => o.hasOwnProperty('_data') && o['_data'] && o['_data']['type'] == 'line')
            console.log('updateLine',overlays)
            let selectedColor = 'blue';
            if(Array.isArray(overlays) && overlays.length>0){
                for(let overlay of overlays){

                    if(overlay['_data']['id'] == line.id){
                        overlay.setStrokeColor(selectedColor);
                        overlay.setStrokeOpacity(1);
                    }else{
                        overlay.setStrokeColor(overlay['_data'].strokeColor);
                        overlay.setStrokeOpacity(overlay['_data'].strokeOpacity);
                    }
                   
                }
                
            }
        },
        updateActivePoint(point){
            let self = this
            let overlays = self.BMap.getOverlays()
            console.log('updateActivePoint',overlays)
            overlays = overlays.filter(o => o.hasOwnProperty('_data') && o['_data'] && (o['_data']['type'] == 'label' || o['_data']['type'] == 'label'))
            console.log('updateActivePoint',overlays)
            let selectedColor = 'blue';
            if(Array.isArray(overlays) && overlays.length>0){
                for(let overlay of overlays){

                    if(overlay['_data'].uid == point.uid){

                        overlay.setStyle({                              // 设置选中label的样式
                            color: 'red',
                            fontSize: '12px',
                            border: '1px solid red',
                            borderRadius:'4px'
                        })
                    }else{
                        overlay.setStyle({                              // 设置label的样式
                            color: '#323232',
                            fontSize: '12px',
                            border: '1px solid #ddd',
                            borderRadius:'4px'
                        })
                    }
                   
                }
                
            }
        },
        addLines(line){
            // 绘制线
            let self = this
            let linePoints = []
            let points = line['points']
            let selectedColor = 'blue';
            // 判断是否已经绘制 
            console.log('添加线条',line.id,line)
            let overlays = self.BMap.getOverlays()
            overlays = overlays.filter(o => o.hasOwnProperty('_data') && o['_data'] && o['_data']['type'] == 'line' && o['_data']['id'] == line.id)
            if(Array.isArray(overlays) && overlays.length == 1){
                self.BMap.removeOverlay(overlays[0]); // 从地图上移除覆盖物
                console.log('移除已经存在的线',overlays,line.id)
            }

            // 开始绘制逻辑
            if(points && points.length > 0){
                for(let point of points){
                    linePoints.push(new BMap.Point(point.lng,point.lat))
                }
            }
            let polyline = new BMap.Polyline(linePoints, 
                {strokeColor:line.strokeColor, 
                strokeWeight:line.strokeWeight, 
                strokeOpacity:line.strokeOpacity
                });
                if(self.activeLine && self.activeLine.id == line.id){
                    polyline = new BMap.Polyline(linePoints, 
                    {   strokeColor:selectedColor, 
                        strokeWeight:line.strokeWeight, 
                        strokeOpacity:1
                    });

                    
                    self.removeOverlays(line)
                    
                }
            this.BMap.addOverlay(polyline);
            // polyline.setTitle("Custom Data");
            polyline['_data'] = this.bxDeepClone(line) 
            this.BMap.addEventListener("click", function (e) {
                    let overlay = e.overlay
                    let title = ''
                    
                    if(overlay && overlay.hasOwnProperty('_data') && overlay['_data'] && overlay['_data'].type == 'line'){
                        
                        console.log('点击线',overlay['_data'])
                        self.$set(self,'activeLine',overlay['_data'])
                        title = overlay['_data'].id
                        
                        self.removeOverlays(overlay['_data'])
                        if (polyline && e.overlay === polyline) {
                            // 修改线的样式
                            polyline.setStrokeColor(selectedColor);
                            polyline.setStrokeOpacity(1);
                        } else {
                            // 清除之前选中的线
                            if (polyline) {
                              polyline.setStrokeColor(polyline['_data'].strokeColor);
                              polyline.setStrokeOpacity(polyline['_data'].strokeOpacity);
                            }
                        }
    
                         
                        if(overlay){
                            let opts = {
                                width: 80,     // 信息窗口宽度
                                height: 60,    // 信息窗口高度
                                title: "线"  // 信息窗口标题
                            }   
                            // 获取线的中心点
                            
                            let center = {lng:`e.point.lng`,lat:`e.point.lat`}
                            let point = new BMap.Point(e.point.lng, e.point.lat);  
                            // let infoWindow = new BMap.InfoWindow(title, opts);  // 创建信息窗口对象
                            // self.BMap.openInfoWindow(infoWindow, point);        // 打开信息窗口
                        }
                    }
                    
                    
              });
            this.initViewport(points)

        },
        removeOverlays(line){
            console.log('移除覆盖物',line,line.id,line.waypoints_points)
            let self = this
            // console.log('移除覆盖物0',self.BMap.getOverlays())
            let overlays = self.BMap.getOverlays()
            let removeOverlays = overlays.filter(o => o.hasOwnProperty('_data') && o['_data'] && (o['_data']['type'] == 'point' || o['_data']['type'] == 'label'))
                    
            for(let o of removeOverlays){
                self.BMap.removeOverlay(o); // 从地图上移除覆盖物
            }
            // console.log('移除覆盖物1',self.BMap.getOverlays())
            self.addMarkers(line)
        },
        
        addMarkers(line){
            // 绘制标点
            let self = this
            console.log()
            let waypoints = line['waypoints_points']
            if(Array.isArray(waypoints) && waypoints.length > 0){
                for(let p of waypoints){
                    var point = new BMap.Point(p.lng, p.lat);
                    var content = p.id;
                    var label = new BMap.Label(content, {       // 创建文本标注
                        position: point,
                        offset: new BMap.Size(32, 0)
                    })  
                    var myIcon = new BMap.Icon(p.icon, new BMap.Size(32, 32), {   
                        // 指定定位位置。  
                        // 当标注显示在地图上时，其所指向的地理位置距离图标左上   
                        // 角各偏移10像素和25像素。您可以看到在本例中该位置即是  
                        // 图标中央下端的尖角位置。   
                        anchor: new BMap.Size(0, 0),   
                        // 设置图片偏移。  
                        // 当您需要从一幅较大的图片中截取某部分作为标注图标时，您  
                        // 需要指定大图的偏移位置，此做法与css sprites技术类似。   
                        imageOffset: new BMap.Size(0, 0)   // 设置图片偏移   
                    });     
                        // 创建标注对象并添加到地图  
                        
                    var marker = new BMap.Marker(point, {icon: myIcon,title:p.id,enableDragging: true});   
                    marker['_data'] = p
                    let labelData = self.bxDeepClone(p)
                    labelData['type'] = 'label'
                    label['_data'] = labelData
                    
                    label.setStyle({                              // 设置label的样式
                        color: '#323232',
                        fontSize: '12px',
                        border: '1px solid #ddd',
                        borderRadius:'4px'
                    })
                    marker.addEventListener("click", function(e){  
                        let overlay = e.currentTarget
                        let overlays = self.BMap.getOverlays()
                        
                        if(overlay.hasOwnProperty('_data') && overlay['_data'] && overlay['_data'].type == 'point'){
                            self.$set(self,'activePoint',overlay['_data'])
                            overlays = overlays.filter(o => o.hasOwnProperty('_data') && o['_data'].type == 'label' )
                            // overlays = overlays.filter(o => o.hasOwnProperty('_data') && o['_data'].type == 'point' && o['_data'].uid == overlay.uid)

                            if(Array.isArray(overlays) ){
                                for(let l of overlays){
                                    if(l['_data'].uid == overlay['_data'].uid){

                                        l.setStyle({                              // 设置选中label的样式
                                            color: 'red',
                                            fontSize: '12px',
                                            border: '1px solid red',
                                            borderRadius:'4px'
                                        })
                                    }else{
                                        l.setStyle({                              // 设置label的样式
                                            color: '#323232',
                                            fontSize: '12px',
                                            border: '1px solid #ddd',
                                            borderRadius:'4px'
                                        })
                                    }
                                }
                            }
                            console.log("您点击了标注",e,overlay, overlays);  
                        }
                        
                    });
                    marker.enableDragging() // 开启拖动 dragend
                    marker.addEventListener('dragend', function (event) {
                        console.log('标注已移动至：' + event.point.lng + ', ' + event.point.lat,event.target['_data'].uid);
                        let point = self.bxDeepClone(event.target['_data'])
                        point['lng'] = event.point.lng
                        point['lat'] = event.point.lat
                        self.$nextTick(() => {
                
                            
                                self.updatePoint(point)
                        })
                        
                    });
                    self.BMap.addOverlay(marker); 
                    self.BMap.addOverlay(label);                        // 将标注添加到地图中
                }
            }
            
        },
        updatePoint(p,l){
            let i = null
            let idsArr = p.uid.split('@')
            console.log(p,idsArr)
            
            for(let initLine of this.mockLines){
                if(initLine.id == `${idsArr[0]}`){
                    console.log('更新线条下的点位置',p)
                    let ps = this.bxDeepClone(initLine.points)
                    for(let point of initLine.points){
                        console.log('0:',JSON.stringify(point),p.id)
                        if(`${idsArr[idsArr.length - 1]}` == point.id){
                            point['lat'] = `${p.lat}`
                            point['lng'] = `${p.lng}`
                            console.log('1:',JSON.stringify(point))
                        }
                        
                    }
                    // initLine.points = ps.map(item => item)
                }
            }
            
        },
         //初始化地图
		initViewport: function (pointsArray) {
            // let BMap = this.BMap;
            // let map = this.map;
            let centerPoint = this.BMap.getViewport(eval(pointsArray))  // this.pathArr 是我们知道的经纬度。可以有多个。全部以数组形式放在里面。
              //进入显示的百分比
              //打开地图时的位置
              
            console.log('初始化',centerPoint,centerPoint.center)
            // 初始化地图，设置中心点坐标和地图级别
            this.BMap.centerAndZoom(centerPoint.center, centerPoint.zoom)
          },
        getDriving(){
            let self = this
            let url = '/baiduApi/direction/v2/driving';
            let params = {
                origin:``,  // 起点经纬度 40.056878,116.30815 小数点后不超过6位，
                destination:``,  // 终点 40.056878,116.30815
                waypoints:'', // 途径点 40.465,116.314|40.232,116.352|40.121,116.453
                tactics:4    // 4 高速有限
            }
            
            let loadLines = this.buildResLine
            if(Array.isArray(loadLines) && loadLines.length > 0){
                self.polylines = [].map(item => item)
                for(let i in loadLines){
                    let loadLine = this.bxDeepClone(loadLines[i])
                    let id = loadLine.id
                    // 循环规划路径 
                    
                    params = {
                        origin:``,  // 起点经纬度 40.056878,116.30815 小数点后不超过6位，
                        destination:``,  // 终点 40.056878,116.30815
                        waypoints:'', // 途径点 40.465,116.314|40.232,116.352|40.121,116.453
                        tactics:4    // 4 高速有限
                    }
                    params['origin'] = `${loadLine.params['origin']}`
                    params['destination'] = `${loadLine.params['destination']}`
                    params['waypoints'] = `${loadLine.params['waypoints_str']}`
                    params['ak'] = `${loadLine.params['ak']}`
                    getBaiduMapApi(url,params).then(res => {
                        console.log('/direction/v2/driving res',res)
                        let routes = []
                        if(res.status === 0){
                            this.reqRoutes = res.result.routes
                            for(let route of res.result.routes){
                                
                                let steps = []
                                for(let step of route.steps){
                                    let path = step.path.split(';')
                                    path = path.map(item => {
                                        // let ipoint = item.split(',')
                                        let point= {
                                            lat:`${item.split(',')[1]}`,
                                            lng:`${item.split(',')[0]}`,
                                        }
                                        return point
                                    })
                                    steps = steps.concat(path)
                                    // steps.push(path)
                                }
                                routes = routes.concat(steps)
                            }
                            this.reqPaths = routes.map(item => item)
                            // console.log('routes',routes)
                            let points = []
                            for(let p of routes){
                                // points.push(new BMap.Point(p.lng, p.lat));
                                points.push(p);

                            }
                            let line = {
                                    enableEditing: false, // 是否启用线编辑，默认为false
                                    // 设置折线颜色,可以设置不同颜色线路，需要自己定义
                                    strokeColor:self.lineColors[i].color,  // linear-gradient(#ff0000 0%, #ffff00 50%, #0000ff 100%)
                                    // strokeColor:'linear-gradient(#ff0000 0%, #ffff00 50%, #0000ff 100%)',  // linear-gradient(#ff0000 0%, #ffff00 50%, #0000ff 100%)
                                    strokeWeight: 6, // 折线宽度
                                    strokeOpacity: 0.4, // 折线透明度
                                    strokeStyle:'折线的样式，solid',  //折线的样式，solid 或 dashed
                                    selectedColor: self.lineColors[i].selectedColor,
                                    uid:`${loadLine.uid}`
                                    
                            }
                            line['points'] = points.map(item => item)
                            line['id'] = id
                            line['waypoints'] =  this.bxDeepClone(loadLine.waypoints)
                            line['waypoints_points'] =  this.bxDeepClone(loadLine.points)
                            line['start'] = this.bxDeepClone(loadLine.start)
                            line['end'] = this.bxDeepClone(loadLine.end)
                            
                            line['waypoints_points'] = line['waypoints_points'].map((item,pIndex) => {
                                // item['uid'] = `${line.lineId}-${pIndex}`
                                item['type'] = 'point'
                                return item
                            })
                            line['type'] = 'line'
                            // for(let pIndex in self.polylines){
                            //     let pLine = self.polylines[pIndex]  // 已经存在的线 更新
                            //     if(pLine.id == line.id){
                            //         self.$set(self.polylines,pIndex,self.bxDeepClone(pLine))
                            //     }
                            // }
                            self.polylines.push(self.bxDeepClone(line))
                            self.addLines(self.bxDeepClone(line))  // 添加路线
                            // self.addMarkers(line) // 添加标点
                            // self.addPolyline(BMap, map, null, points)
                        }
                    })
                }
                
            }
            
            
            
            
        },
        onLineList(line){
            let self = this
            if(this.activeLine && this.activeLine.uid !== line.uid){
                this.$set(this,'activeLine',line)
                this.$set(this,'activePoint',null);
            }else if(!this.activeLine){
                this.$set(this,'activeLine',line)
            }
            self.$nextTick(() => {
                self.updateLine(line)
            })
            
        },
        onPointList(e){
            let self = this
            if(this.activeLine && e){
                self.$set(self,'activePoint',e);
                self.$nextTick(() => {
                    self.updateActivePoint(e)
                })
                
                // this.$set(this.activePoint,'uid',`${index}-${j}`);
            }
        },
    }
  
  };
  