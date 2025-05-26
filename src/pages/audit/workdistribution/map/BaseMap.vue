<template>
  <div class="map_content">
    <div id="base_map" class="map_cot"></div>
    <div class="driving_tab">
      <li class="dr_t">
        <span class="dr_bts" @click="setTabColes"><i class="el-icon-d-arrow-right"></i></span>
        <span style="display: block;width:80%;text-align:center">路径行驶点</span>
      </li>
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
  setPlanRoute
} from "@/pages/audit/workdistribution/map/layerPage";
const drivingPath=ref([])
const userMap = ref(null);
const handleMap = ref(null);
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
  coles
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
  // [108.92899978014819,34.287680060799346]
  // [108.92881328287827,34.29320166130973]
  // [108.92970735322832,34.2985474624636]
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
  console.log(source)
  drwIconLineLayer(handleMap.value, source, 'linIcon', 'up-two.png');
  handleDrawMarker(list)
  let code=list[(list.length)/2]
  FlyTo(handleMap.value,handleMakePoint('',code[0],code[1]));
}
const handleDrawMarker=(list)=> {
  //数据被反转过一次
  let tep = [
    {
      name: '起点',
      icon: require(`@/assets/mapIcon/start.png`),
      point: handleMakePoint('', list[list.length - 1][0], list[list.length - 1][1])
    },
    {
      name: '终点',
      icon: require(`@/assets/mapIcon/end.png`),
      point: handleMakePoint('', list[0][0], list[0][1])
    },
    {
      name: '经过点1',
      icon: require(`@/assets/mapIcon/point_ico.png`),
      point: handleMakePoint('', 108.92899978014819, 34.287680060799346),
      info:'这里被拍到了1次'
    },
    {
      name: '经过点2',
      icon: require(`@/assets/mapIcon/point_ico.png`),
      point: handleMakePoint('', 108.92881328287827, 34.29320166130973),
      info:'这里被拍到了次'
    },
    {
      name: '经过点3',
      icon: require(`@/assets/mapIcon/point_ico.png`),
      point: handleMakePoint('', 108.92970735322832, 34.2985474624636),
      info:'这里被拍到了2次'
    }
  ]
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
    height:60%;
    overflow: auto;
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
    justify-content: space-between;
  }
  .dr_bts{
    cursor: pointer;
    color: #0e77ea;
    font-size:1.125rem;
  }
}
</style>