let markerList = [] //标记物
let lineList = []  //线图层

/**
 * 生成Feature
 */
export const makeFeature = (type, coordinates, properties) => {
    return {
        type: "Feature",
        geometry: {
            type,
            coordinates
        },
        properties
    };
};
/**
 * 生成FeatureCollection
 */
export const makeFeatureCollection = (features) => {
    return {
        type: "FeatureCollection",
        features
    };
};

//加载图标
export const markerIcon = (map, url) => {
    let icon = null
    return icon = map.Icon(url, map.Size(40, 40));
}

//加载标记图层
export const drwMapMarkers = (map, data, url) => {
    if (!map || !data.length) throw new Error('地图实例不存在或数据异常请检查');
    data.map((item) => {
        let pt = handleMakePoint(map,item.code[0],item.code[1]);
        let marker = map.Marker(pt, {
            icon: markerIcon(map, url)
        });
        map.addOverlay(marker);
        marker.addEventListener("click",  (e)=> {
            console.log('点击了marker', e)
            setMarkerClick(item)
        });
        markerList.push(marker);
    })
}

export const drawMapMarkersAndLabel = (_map,data) => {
       markerList=[]
    removeOverlay(_map)
    // 创建标记点和标签
    data.forEach(item => {
        // 创建图标
        const icon = new BMapGL.Icon(
            item.icon,
            new BMapGL.Size(32, 32),
            {
                anchor: new BMapGL.Size(16, 16)
            }
        );

        // 创建标记点
        const marker = new BMapGL.Marker(item.point, {
            icon: icon
        });

        // 创建标签
        const label = new BMapGL.Label(item.name, {
            offset: new BMapGL.Size(0, -45), // 标签偏移量
            position: item.point
        });

        // 设置标签样式
        label.setStyle({
            color: '#333',
            fontSize: '14px',
            backgroundColor: '#fff',
            padding: '5px 10px',
            borderRadius: '4px',
            border: '1px solid #ccc'
        });
        marker.addEventListener("click",  (e)=> {
            setMarkerClick(item)
        });
        // 添加标记点和标签
        _map.addOverlay(marker);
        _map.addOverlay(label);

        markerList.push({ marker, label });
    });
}

export const setMarkerClick = (item) => {
    console.log('标记被点击',item);
}
//清除marker标记
export const handleRemoveMarker = (map) => {
    if (!markerList || markerList.length === 0) throw new Error('地图实例不存或标记物不存在');
    markerList.map((item) => {
        item.remove();
    })
}
//清除所有图层
export const removeOverlay = (map) => {
    map.clearOverlays();
}
//清除线图层
export const handleRemoveLineLayer = (map) => {
    if (map&&lineList.length>0){
        lineList.map((item) => {
            map.removeNormalLayer(item);
        })
    }
}
//基础线图层
export const drwLineLayer = (map, source, stops) => {
    handleRemoveLineLayer(map)
    let lineLayer = new BMapGL.LineLayer({
        enablePicked: true, //是否允许鼠标点击
        autoSelect: true,  //是否允许鼠标悬浮
        pickWidth: 20, //点击拾取的宽带pX
        pickHeight: 20, //点击拾取的高度px
        selectedColor: 'yellow', // 选中项颜色
        style: {
            borderColor: 'rgba(27, 142, 236, .6)', //描边颜色
            borderWeight: 1, //描边宽带
            strokeWeight: 1, //描边线宽度
            strokeStyle: 'dashed', //描边类型 solid'、'dashed' 'dotted'
            strokeColor: [
                'case',
                ['boolean', ['feature-state', 'picked'], false],
                '#6704ff',  //基础颜色
                ['match', ['get', stops ? stops : 'name'],
                    'demo1', '#ce4848',
                    'demo2', '#6704ff',
                    'demo3', 'blue',
                    '#6704ff']
            ], //数据中properties字段识别的自定义颜色 类似于stops[[]],这里取字段可以传入
        }
    });
    map.addNormalLayer(lineLayer);
    lineLayer.setData(source);
    lineList.push(lineLayer)
}

export const drwIconLineLayer = (map, source, key,url) => {
    handleRemoveLineLayer(map)
    // 获取本地图标路径
    const icon = require(`@/assets/mapIcon/${url}`);
    let lineLayer = new BMapGL.LineLayer({
        enablePicked: true,
        autoSelect: true,
        pickWidth: 30,
        pickHeight: 30,
        opacity: 1,
        selectedColor: 'blue', // 选中项颜色
        style: {
            sequence: true, // 是否采用间隔填充纹理，默认false
            marginLength: 8, // 间隔距离，默认16，单位像素
            borderColor: 'rgba(0,125,125,1)',
            borderMask: true, // 是否受内部填充区域掩膜，默认true,如果存在borderWeight小于0，则自动切换false
            borderWeight: 2, // 描边宽度，可以设置负值
            strokeWeight: 6, // 描边线宽度，默认0
            strokeLineJoin: 'miter',//描边线连接处类型, 可选'miter', 'round', 'bevel'
            strokeLineCap: 'square',// 描边线端头类型，可选'round', 'butt', 'square'，默认round
            // 填充纹理图片地址，默认是空。图片需要是竖向表达，在填充时会自动横向处理。
            strokeTextureUrl:icon,
            strokeTextureWidth: ['match', ['get', 'name'], key, 32, 16],
            strokeTextureHeight: ['match', ['get', 'name'], key, 64, 64],
            strokeColor: ['case', ['boolean', ['feature-state', 'picked'], false], '#6704ff', ['match', ['get', 'name'], key, '#ce4848', '#6704ff']],
            strokeOpacity: .5,
        }
    });
    map.addNormalLayer(lineLayer);
    lineLayer.setData(source);
    lineList.push(lineLayer)
}
// 根据点集合设置视图范围
export const setViewportByPoints=(_map,points)=> {
    if (!points || points.length === 0) return;

    // 计算边界
    let minLat = points[0].lat;
    let maxLat = points[0].lat;
    let minLng = points[0].lng;
    let maxLng = points[0].lng;

    points.forEach(point => {
        minLat = Math.min(minLat, point.lat);
        maxLat = Math.max(maxLat, point.lat);
        minLng = Math.min(minLng, point.lng);
        maxLng = Math.max(maxLng, point.lng);
    });

    // 创建边界对象
    const bounds = new BMapGL.Bounds(
        new BMapGL.Point(minLng, minLat),
        new BMapGL.Point(maxLng, maxLat)
    );

    // 设置视图范围
    _map.setViewport(bounds, {
        enableAnimation: true,
        margins: [50, 50, 50, 50]
    });
}
let driving=null
let currentRoute = []
//路径规划信息
export const AutoDrivingLineSearch = (_map, start, end, ways) => {
      let route=[]
      DeleteDriving()
      driving = new BMapGL.DrivingRouteLine(_map, {
        renderOptions: {
            // map: _map,
            autoViewport: true,
            enableDragging: true,
        }
    })
    driving.search(start, end, {
        waypoints: ways //途径点数组
    });
}

export const setPlanRoute = () => {
     return new Promise((resolve,reject) => {
         driving.setSearchCompleteCallback((results)=>{
             let list=driving.getResults().getPlan(0).getRoute(0).getPath()
             if(!list||!list.length) return [];
             currentRoute=[]
             list.map((item) => {
                 currentRoute.push([item.lng, item.lat])
             })
             //获取的路径点确实是按照从终点到起点的顺序排列的，这是 API 的设计特点
             resolve(currentRoute.reverse())
         })
     })
}

export const DeleteDriving = (map, start, end) => {
    if(driving){
        driving=null
    }
}
//地图点击事件注册
export const HandleMapClick = (map) => {
    map.addEventListener('click', function (e) {
        alert('点击位置经纬度：' + e.latlng.lng + ',' + e.latlng.lat);
    });
}

export const handleMakePoint=(map,lng,lat)=>{
     return new BMapGL.Point(lng,lat)
}

export const FlyTo = (_map,point,zoom) => {
   const viewportOptions ={
            enableAnimation: true,
            duration: 1000,
            delay: 0,
            zoomFactor: 5
    }
    _map.centerAndZoom(point, zoom?zoom:16.5);
    // _map.panTo(point, {
    //     ...viewportOptions,
    // });
}