<template>
  <div class="map_content">
    <div id="base_map" class="map_cot"></div>
    <div class="driving_tab">
      <li class="dr_t">
        <span style="display: block;width:80%;text-align:left;padding-left:2.1875rem">路径门架列表</span>
        <span>
          <img style="width:1.5625rem;cursor: pointer" @click="setTabColes"
               :src="getImgSrc(isColes?'down.png':'top.png')" alt="">
        </span>
      </li>
      <div :class="isColes?'dr_list_active':'dr_list'">
        <div v-for="(item,index) in drivingPoint" :key="index" :class="item.select?'dr_row_info':'dr_row_info_cl'" @click="handleSetPoint(item)">
          <li class="hd_btns">
            <span title="当前位置前加一个" @click="handleSetInfo('up',item)"><i class="el-icon-caret-top"></i></span>
            <span title="当前位置后加一个" @click="handleSetInfo('dwn',item)"><i class="el-icon-caret-bottom"></i></span>
          </li>
          <li class="st_name" :title="item.name?item.name:item.tradenodename">{{ item.name?item.name:item.tradenodename }}</li>
          <li class="st_dl"><span style="font-size: 1.125rem;cursor: pointer" @click="handleDelete(item)"><i
              class="el-icon-delete"></i></span></li>
          <li class="dr_row_index" :style="[{backgroundColor:'#e0e3e3'}]">{{ index + 1 }}</li>
        </div>
      </div>
      <div class="hd_bs">
        <el-button style="width:75%" size="mini" type="primary" plain @click="handleSubmitStation">确认点位修改</el-button>
      </div>
    </div>
    <StationList :stVisible.sync="listVisible" @getChoseStations="handleFilterStation"/>
  </div>
</template>

<script setup>
import {onBeforeUnmount, onMounted, ref} from "vue";
import {useRoute} from "@/common/vueApi";
import MapUtils from "@/pages/audit/workdistribution/map/mapUtils";
import OrderApi from "@/pages/audit/api/order";
import StationList from "@/pages/audit/workdistribution/map/stationList.vue";
import {
  AutoDrivingLineSearch,
  drawMapMarkersAndLabel,
  drwIconLineLayer,
  setLineLayer,
  FlyTo,
  handleMakePoint,
  makeFeature,
  makeFeatureCollection,
  setPlanRoute
} from "@/pages/audit/workdistribution/map/layerPage";

const orderUtil = new OrderApi();
const route = useRoute()
const passId = route.query?.pass_id
const listVisible=ref(false)
const drivingPath = ref([])
const userMap = ref(null);
const handleMap = ref(null);
const isColes = ref(false);
const drivingPoint = ref([])
const getImgSrc = (name) => {
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
const setTabColes = () => {
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

  }
}

/**
 * @Description:获取百度路径规划数据信息
 * @Author:Eirice
 * @Date: 2025-06-06 14:29:34
 */
const getRoutesByBaiDu= async () =>{
  let last=drivingPoint.value[drivingPoint.value.length-1]
  let ways=drivingPoint.value[drivingPoint.value.length/2]
  let origin=drivingPoint.value[0].lat+","+drivingPoint.value[0].lng; //起点
  let destination=last.lat+","+last.lng;
  let ak='tkSgCpN7B73A76l9M7RExhcdu2ip8FEo'
  let urls=`/baiduApi/direction/v2/driving`;
  const params = {
    origin: origin, // 起点坐标
    destination:destination, // 终点坐标
    tactics: 0, // 导航策略
    inputCrs:'wgs84ll',
    outputCrs:'wgs84ll'
  }
 let line= await orderUtil.getBaiduMapRoute(ak,urls,params);
 let linePoints=[]
 const lines= handleFilterLine(line)
  // 开始绘制逻辑
  if (lines && lines.length > 0) {
    for (let point of lines) {
      linePoints.push(new BMap.Point(point.lng, point.lat))
    }
  }
  handleDrawLine(linePoints)
}
//路线数据过滤
const handleFilterLine = (line) => {
  let routes = []
  line = line.data || null
  if (line && line.status === 0) {
    if (!line.result?.routes && line.result?.steps) {
      // 专网接口
      let steps = []
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
    } else if (line.result?.routes) {
      for (let route of line.result.routes) {
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
   }
  return routes;
}
const handleDrawLine = (list) => {
  if (!list) return;
  let features = []
  features.push(makeFeature('LineString', list, {"name": "linIcon"}))
  let source = makeFeatureCollection(features)
  setLineLayer(handleMap.value,list);
  let code = list[(list.length) / 2]
  // FlyTo(handleMap.value,code);
}
const handleDrawMarker = (list) => {

}
const filterPointList = (list) => {
  try {
    if (!Array.isArray(list)) {
      console.warn('filterPointList: 输入参数必须是数组');
      return;
    }

    // 构建点位配置
    const pointConfig = {
      icon: require(`@/assets/mapIcon/point_ico.png`),
      select: true,
      setUp: false,
      steDwn: false,
      isNew:false,
    };

    // 使用 Map 来存储唯一的点位，以 lng,lat 作为键
    const uniquePoints = new Map();

    // 处理重复点位
    list.forEach(item => {
      const key = `${item.lng},${item.lat}`;
      if (!uniquePoints.has(key)) {
        uniquePoints.set(key, item);
      } else {
        // 如果已存在，且当前项是收费站，则跳过
        if (item.grantry_type === '收费站') {
          return;
        }
        // 如果已存在项是收费站，则替换为当前项
        const existingItem = uniquePoints.get(key);
        if (existingItem.grantry_type === '收费站') {
          uniquePoints.set(key, item);
        }
      }
    });

    // 转换为数组并排序
    const sortedPoints = Array.from(uniquePoints.values())
        .sort((a, b) => (a.seqid || 0) - (b.seqid || 0));

    // 构建最终的点位数组
    const additionalMarkers = sortedPoints.map((item, index) => ({
      ...pointConfig,
      name: item.tollgrantry_name?item.tollgrantry_name:item.tradenodename,
      point: handleMakePoint('', item.lng, item.lat),
      seqid: index + 1,  // 添加 seq 字段，从 1 开始
      ...item
    }));

    // 合并所有点位
    drivingPoint.value = [...additionalMarkers];
    console.log(drivingPoint.value);
    // 绘制地图标记
    drawMapMarkersAndLabel(handleMap.value, drivingPoint.value);
    getRoutesByBaiDu()
  } catch (error) {
    console.error('filterPointList 处理失败:', error);
  }
}
/**
 * @Description:根据携带进入的passid进行车辆通行流水查询
 * @Author:Eirice
 * @Date: 2025-05-30 10:32:53
 */
const getTrafficFlow = (id) => {
  let cadn = {
    condition: [{colName: "passid", ruleType: "like", value: id}]
  }
  orderUtil.getCarWaysInfo(cadn).then(res => {
    if (res.data.state !== 'SUCCESS') return;
    console.log('获取到流水', this.suspectedData)
  }).catch(err => {
  })
}
/**
 * @Description:初次进入调用远端中心接口查询通行信息
 * @Author:Eirice
 * @Date: 2025-06-06 17:45:45
 */
const getPointByOriginCenter=()=>{
  orderUtil.getOriginCenterDetails({passid:passId}).then(res=>{
    if(res.data.state !== 'SUCCESS') return;
    filterPointList(res.data.data)
  }).catch(err => {})
}
/**
 * @Description:从本地服务中调用获取车辆通行信息
 * @Author:Eirice
 * @Date: 2025-06-06 17:48:49
 */
const getPointByLocation=()=>{
  orderUtil.getLocationCenterDetails({passid:passId}).then(res=>{
    if(res.data.state !== 'SUCCESS') return;
    if(res.data.data&&res.data.data.length>0){
      //本地存储有数据
      filterPointList(res.data.data)

    }else {
      getPointByOriginCenter()
    }
  }).catch(err => {})
}

const getTimePoint = (info) => {
  let tep = info[0]
  if (tep) {
    let cadn = {
      condition: [
        {colName: "passid", value: tep.passid, ruleType: "eq"},
        {colName: "enid", value: tep.enpointid, ruleType: "eq"},
        {colName: "exid", value: tep.expointid, ruleType: "eq"},
        {colName: "vtype", value: 1, ruleType: "eq"}
      ],
      divCond: [{colName: "transtime", ruleType: "between", value: [tep.entime, tep.extime]}]
    }
    orderUtil.getCarPathPoint(cadn).then(res => {
      if (res.data.state !== 'SUCCESS') return;
      filterPointList(res.data.data)
    }).catch(err => {
    })
  }
}
const handleSetPoint = (item) => {
  // let tep = []
  // drivingPoint.value.map(d => {
  //   if (d.name === item.name) {
  //     d.select = !item.select
  //   }
  //   if (d.select) {
  //     tep.push(d)
  //   }
  // })

  // drawMapMarkersAndLabel(handleMap.value, tep)
}
//从默认列表删除该信息
const handleDelete = (item) => {
  let tep = []
  drivingPoint.value.map(d => {
    if (d.name === item.name) {
      d.select = !item.select
    }
    if (d.select) {
      tep.push(d)
    }
  })

  drawMapMarkersAndLabel(handleMap.value, tep);
  getRoutesByBaiDu()
}
/**
 * @Description:获取全量收费站及门架
 * @Author:Eirice
 * @Date: 2025-05-30 17:48:35
 */
const getStationsAndDoor = (info) => {
  orderUtil.getAllStations(info).then(res => {
    if(res.data.state !== 'SUCCESS') return;
  }).catch(err => {})
}
/**
 * @Description:手动开启向列表中加入一个 type 前，后 ，item 当前节点
 * @Author:Eirice
 * @Date: 2025-05-30 18:30:07
 */
const handleSetInfo=(type,item)=>{
  listVisible.value=true;
  drivingPoint.value.map(k=>{
    if(k.id===item.id){
      type==='up'? k.setUp=true : k.steDwn=true
    }
  })
  console.log(item)
}
/**
 * @Description:根据选择的站点数据进行重新过滤组装
 * @Author:Eirice
 * @Date: 2025-06-03 10:34:53
 */
const handleFilterStation = (list) => {
  if (!list || list.length === 0) return;
  // 构建新的点位配置
  const pointConfig = {
    icon: require(`@/assets/mapIcon/point_ico.png`),
    select: true,
    setUp: false,
    steDwn: false,
  };

  // 处理新添加的点位数据
  const newPoints = list.map(item => ({
    isNew:true,
    ...pointConfig,
    name: item.tollgrantry_name,
    point: handleMakePoint('', item.lng, item.lat),
    ...item
  }));

  // 找到需要插入的位置
  let insertIndex = -1;
  let insertType = '';
  
  for (let i = 0; i < drivingPoint.value.length; i++) {
    if (drivingPoint.value[i].setUp) {
      insertIndex = i;
      insertType = 'up';
      break;
    } else if (drivingPoint.value[i].steDwn) {
      insertIndex = i;
      insertType = 'down';
      break;
    }
  }

  // 根据找到的位置插入新数据
  if (insertIndex !== -1) {
    if (insertType === 'up') {
      drivingPoint.value.splice(insertIndex, 0, ...newPoints);
    } else {
      drivingPoint.value.splice(insertIndex + 1, 0, ...newPoints);
    }
    
    // 重置标志位并重新分配序号
    drivingPoint.value.forEach((point, index) => {
      point.setUp = false;
      point.steDwn = false;
      point.seqid = index + 1;  // 重新分配序号，从1开始
    });
  }
  console.log('----',drivingPoint.value);
  // 重新绘制地图标记
  drawMapMarkersAndLabel(handleMap.value, drivingPoint.value);
  getRoutesByBaiDu()
}

const handleSubmitStation=()=>{
  console.log(drivingPoint.value);
}

/**
 * @Description:根据标识符合过滤提交据类型，新增isNew，删除!isNew&&select=false，更新 !isNew&&select=true
 * @Author:Eirice
 * @Date: 2025-06-03 14:12:28
 */
const handleFilterDetail = () => {
  let newList = [];
  let deleteList = [];
  let UpdateList = [];
  
  drivingPoint.value.forEach(item => {
    if (item.isNew && item.select) {
      newList.push(item);
    } else if (!item.isNew && !item.select) {
      deleteList.push(item);
    } else if (item.isNew && item.select) {
      UpdateList.push(item);
    }
  });
}

onMounted(() => {
  let passId = route.query.pass_id
  asyncLoadMap().then(res => {
    initMineMap();
    handleMap.value = userMap.value.initMap();
    if (handleMap.value) {
      // getPointByOriginCenter();
      getPointByLocation();
      getTrafficFlow(passId)
      getStationsAndDoor()
      // HandleMapClick(handleMap.value);
    }
  })
})

onBeforeUnmount(() => {
  userMap.value.destroyMap()
  userMap.value = null
  handleMap.value = null
})
</script>


<style scoped lang="scss">
li {
  list-style: none;
}

.map_content {
  width: 100%;
  height: 100%;
  position: relative;

  .map_cot {
    width: 100%;
    height: 100%;
  }

  .driving_tab {
    width: 15%;
    max-height: 60%;
    background: #f6f8f8;
    position: absolute;
    top: 1%;
    left: 84%;
    z-index: 200;
    box-shadow: 0 0 8px rgba(232, 237, 250, 0.6), 0 2px 4px rgba(232, 237, 250, 0.5);
    opacity: .9;
    padding: 0.3125rem;
  }

  .dr_t {
    width: 100%;
    height: 2.1875rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .dr_bts {
    cursor: pointer;
    color: #0e77ea;
    font-size: 1.125rem;
  }

  .dr_list {
    width: 100%;
    height: 18.75rem;
    max-height: 31.25rem;
    overflow: auto;
    transition: all .5s;
  }

  .dr_list_active {
    width: 100%;
    height: 0;
    overflow: auto;
    transition: all .5s;
  }

  .dr_row_info {
    box-sizing: border-box;
    padding: 2px 1px;
    font-size: 0.875rem;
    border-bottom: 1px solid rgba(232, 237, 250, 0.6);
    display: flex;
    justify-content: space-between;
    align-items: center;
    &:hover {
      .hd_btns {
        opacity: 1;
      }
    }
  }
.dr_row_info_cl{
  box-sizing: border-box;
  padding: 2px 1px;
  font-size: 0.875rem;
  border-bottom: 1px solid rgba(232, 237, 250, 0.6);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background:#fef0f0;
  color: #f56c6c;
  &:hover {
    .hd_btns {
      opacity: 0;
    }
  }
}
  .dr_row_index {
    display: block;
    width: 1.5625rem;
    height: 1.5625rem;
    border-radius: 50%;
    background: #e0e3e3;
    text-align: center;
    line-height: 1.5625rem;
  }
}

.hd_btns {
  width: 2.8125rem;
  display: flex;
  opacity: 0;
  flex-direction: column;
  color: #00a0e9;
  cursor: pointer;

  > span {
    display: block;
    font-size: 1.125rem;
    height: 1.125rem;
  }
}

.st_name {
  width: 90%;
  text-align: left;
  line-height: 2.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.st_dl {
  width: 1.25rem;
  margin-right: 0.3125rem;
}
.hd_bs{
  display: flex;
  align-items: center;
  justify-content: center;
  width:100%;
  height:2.5rem;
}
</style>