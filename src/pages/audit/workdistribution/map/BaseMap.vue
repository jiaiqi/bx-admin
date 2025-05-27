<template>
  <div class="map_content">
    <div id="base_map" class="map_cot"></div>
    <div class="driving_tab">
      <li class="dr_t">
        <span style="display: block;width:80%;text-align:center">路径门架列表</span>
        <span>
          <img  style="width:1.5625rem;cursor: pointer" @click="setTabColes" :src="getImgSrc(isColes?'down.png':'top.png')" alt="">
        </span>
      </li>
      <div :class="isColes?'dr_list_active':'dr_list'">
           <li v-for="(item,index) in drivingPoint" :key="index" class="dr_row_info" @click="handleSetPoint(item)">
             <span>{{item.name}}</span>
             <span class="dr_row_index" :style="[{backgroundColor:item.select?'#5fc9c9':'#e0e3e3'}]">{{index+1}}</span>
           </li>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref,onMounted,onBeforeUnmount} from "vue";
import MapUtils from "@/pages/audit/workdistribution/map/mapUtils";
import {
  AutoDrivingLineSearch, drawMapMarkersAndLabel, drwIconLineLayer, FlyTo,
  handleMakePoint,
  makeFeature, makeFeatureCollection,
  setPlanRoute,
  HandleMapClick
} from "@/pages/audit/workdistribution/map/layerPage";
const drivingPath=ref([])
const userMap = ref(null);
const handleMap = ref(null);
const isColes=ref(false);
const drivingPoint=ref([])
const getImgSrc=(name)=> {
  return require(`@/assets/mapIcon/${name}`);
}
const asyncLoadMap = () => {
  return new Promise(function (resolve, reject) {
    if (typeof (BMapGL) !== 'undefined') return resolve(BMapGL)
    var script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = `${window.APP_CONFIG.serverUrl}&callback=init`
    script.onerror = reject
    document.head.appendChild(script)
    const timer = setInterval(() => {
      if (BMapGL) {
        resolve(BMapGL)
        clearInterval(timer)
      }
    }, 500)
  })
}
const setTabColes=()=>{
  isColes.value = !isColes.value
}
const initMineMap = () => {
  let options = {
    container: 'base_map',
    center: [108.9459227350201, 34.34493397633217],
  }
  userMap.value = new MapUtils(options);
}
const initDrawingRoute = async () => {
  let start = handleMakePoint(handleMap.value, 108.93030832876782, 34.2861377065923);
  let end = handleMakePoint(handleMap.value, 108.93522197694989, 34.298609825499)
  let ways = [handleMakePoint(handleMap.value, 108.92899978014819, 34.287680060799346)]
  AutoDrivingLineSearch(handleMap.value, start, end, ways);

  let line = await setPlanRoute()
  if (line) {
    handleDrawLine(line)
  }
}
const handleDrawLine=(list)=> {
  if (!list) return;
  let features = []
  features.push(makeFeature('LineString', list, {"name": "linIcon"}))
  let source = makeFeatureCollection(features)
  drwIconLineLayer(handleMap.value, source, 'linIcon', 'up-two.png');
  handleDrawMarker(list)
  let code=list[(list.length)/2]
  FlyTo(handleMap.value,handleMakePoint('',code[0],code[1]));
}
const handleDrawMarker=(list)=> {
  //数据被反转过一次
  let tep = [
    {
      select:true,
      name: '陕西新筑收费站',
      icon: require(`@/assets/mapIcon/start.png`),
      point: handleMakePoint('', list[list.length - 1][0], list[list.length - 1][1])
    },
    {
      select:true,
      name: '新筑站-新筑_002车道',
      icon: require(`@/assets/mapIcon/end.png`),
      point: handleMakePoint('', list[0][0], list[0][1])
    },
    {
      select:true,
      name: '新筑匝道-杏园匝道',
      icon: require(`@/assets/mapIcon/point_ico.png`),
      point: handleMakePoint('', 108.92899978014819, 34.287680060799346),
      info:'这里被拍到了1次'
    },
    {
      select:true,
      name: '未央立交-汉城立交',
      icon: require(`@/assets/mapIcon/point_ico.png`),
      point: handleMakePoint('', 108.92881328287827, 34.29320166130973),
      info:'这里被拍到了次'
    },
    {
      select:true,
      name: '陕西经开收费站',
      icon: require(`@/assets/mapIcon/point_ico.png`),
      point: handleMakePoint('', 108.92970735322832, 34.2985474624636),
      info:'这里被拍到了2次'
    }
  ]
  filterPointList(tep)
}
const filterPointList = (list) => {
  try {
    if (!Array.isArray(list)) {
      console.warn('filterPointList: 输入参数必须是数组');
      return;
    }

    // 更新主要点位列表
    drivingPoint.value = list;

    // 定义额外的收费站点位
    const additionalPoints = [
      { name: "星火1收费", lng: 108.93138234411674, lat: 34.29239159871275 },
      { name: '星火2收费', lng: 108.92561761113238, lat: 34.29218558057651 }
    ];

    // 构建点位配置
    const pointConfig = {
      icon: require(`@/assets/mapIcon/point_ico.png`),
      select: true
    };

    // 处理额外点位
    const additionalMarkers = additionalPoints.map(item => ({
      ...pointConfig,
      name: item.name,
      point: handleMakePoint('', item.lng, item.lat)
    }));

    // 合并所有点位
    drivingPoint.value = [...drivingPoint.value, ...additionalMarkers];

    // 绘制地图标记
    drawMapMarkersAndLabel(handleMap.value, drivingPoint.value);
  } catch (error) {
    console.error('filterPointList 处理失败:', error);
  }
}
const handleSetPoint=(item)=>{
   let tep=[]
  drivingPoint.value.map(d=>{
     if(d.name===item.name){
       d.select=!item.select
      }
     if(d.select){
       tep.push(d)
     }
   })

   drawMapMarkersAndLabel(handleMap.value, tep)
 }
onMounted(()=>{
    asyncLoadMap().then(res => {
     initMineMap();
    handleMap.value = userMap.value.initMap();
    if (handleMap.value) {
      // HandleMapClick(handleMap.value);
      initDrawingRoute()
    }
  })
})
onBeforeUnmount(()=>{
  userMap.value.destroyMap()
  userMap.value = null
  handleMap.value = null
})
</script>


<style scoped lang="scss">
li{
  list-style: none;
}
.map_content {
  width: 100%;
  height: 100%;
  position: relative;
  .map_cot{
    width: 100%;
    height: 100%;
  }
  .driving_tab{
    width:10%;
    max-height:60%;
    background: #f6f8f8;
    position: absolute;
    top:1%;
    left:89%;
    z-index:200;
    box-shadow:0 0 8px rgba(232,237,250,0.6), 0 2px 4px rgba(232,237,250,0.5);
    opacity: .9;
    padding:0.3125rem;
  }
  .dr_t{
    width: 100%;
    height: 2.1875rem;
    display: flex;
    align-items: center;
    justify-content: space-around;
  }
  .dr_bts{
    cursor: pointer;
    color: #0e77ea;
    font-size:1.125rem;
  }
  .dr_list{
    width:100%;
    height:18.75rem;
    max-height:31.25rem;
    overflow: auto;
    transition: all .5s;
  }
  .dr_list_active{
    width:100%;
    height:0;
    overflow: auto;
    transition: all .5s;
  }
  .dr_row_info{
    box-sizing: border-box;
    padding:2px 1px;
    font-size:0.875rem;
    border-bottom:1px solid rgba(232,237,250,0.6);
    display:flex;
    justify-content: space-between;
    &:hover{
      color: #00a0e9;
    }
  }
  .dr_row_index{
    display: block;
    width:1.5625rem;
    height:1.5625rem;
    border-radius:50%;
    background:#e0e3e3;
    text-align: center;
    line-height:1.5625rem;
  }
}
</style>