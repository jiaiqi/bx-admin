<template>
  <div class="map_content" id="base_map"></div>
</template>
<script>
import MapUtils from "@/pages/audit/workdistribution/map/mapUtils";

import { HandleMapClick, AutoDrivingLineSearch,handleMakePoint,setPlanRoute, makeFeature, makeFeatureCollection,drwIconLineLayer } from "@/pages/audit/workdistribution/map/layerPage";
import 'core-js/features/url';
export default {
  name: "mine-map",
  data(){
    return {
      userMap:null,
      handleMap:null
    }
  },
  methods: {

    asyncLoadMap() {
      return new Promise(function (resolve, reject) {
        if (typeof (BMapGL) !== 'undefined') return resolve(BMapGL)
        var script = document.createElement('script')
        script.type = 'text/javascript'
        script.src = `https://api.map.baidu.com/api?v=1.0&&type=webgl&ak=${window.APP_CONFIG.serverUrl}&callback=init`
        script.onerror = reject
        document.head.appendChild(script)
        const timer = setInterval(() => {
          if (BMapGL) {
            resolve(BMapGL)
            clearInterval(timer)
          }
        }, 500)
      })
    },
    initMineMap() {
      let options = {
        container: 'base_map',
        center: [108.9459227350201, 34.34493397633217],
      }
      this.userMap = new MapUtils(options);
    },

    async initDrawingRoute() {
      let start = handleMakePoint(this.handleMap, 108.93030832876782, 34.2861377065923);
      let end = handleMakePoint(this.handleMap, 108.93522197694989, 34.298609825499)
      // [108.92899978014819,34.287680060799346]
      // [108.92881328287827,34.29320166130973]
      // [108.92970735322832,34.2985474624636]
      let ways = [handleMakePoint(this.handleMap, 108.92899978014819, 34.287680060799346)]
      AutoDrivingLineSearch(this.handleMap, start, end, ways);

      let line = await setPlanRoute()
      if (line) {
        this.handleDrawLine(line)
      }
    },
    getImgSrc(name){
      return require(`@/assets/mapIcon/${name}`);
    },
    handleDrawLine(list) {
      if (!list) return;
      let features = []
      features.push(makeFeature('LineString', list, {"name": "linIcon"}))
      let source = makeFeatureCollection(features)
      console.log(source)
      drwIconLineLayer(this.handleMap,source,'linIcon',this.getImgSrc('up-two.png'))
     },
  },
  mounted(){
    this.$nextTick(() => {
      this.asyncLoadMap().then(res => {
        this.initMineMap();
        this.handleMap = this.userMap.initMap();
        if(this.handleMap){
          HandleMapClick(this.handleMap);
          this.initDrawingRoute()
        }
      })
    })
  },
  unmounted() {
    this.userMap.destroyMap()
    this.userMap = null
    this.handleMap=null
  }
}
</script>

<style scoped lang="scss">
.map_content{
  width: 100%;
  height: 100%;
  position: relative;
}
</style>