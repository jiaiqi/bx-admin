<template>
  <div class="map_content">
    <div id="base_map" class="map_cot"></div>
    <div class="driving_tab" v-if="drivingPoint.length>0">
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
        <el-button style="width:75%" size="mini" type="primary" plain @click="handleSubmitStation">确认修改</el-button>
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
import { handleFilterCols } from "@/pages/audit/workdistribution/map/filterServiceCol";
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
import { Message } from 'element-ui';

const orderUtil = new OrderApi();
const route = useRoute()
const passId = route.query?.pass_id
const listVisible=ref(false)
const drivingInfo = ref([])
const userMap = ref(null);
const handleMap = ref(null);
const isColes = ref(false);
const drivingPoint = ref([])
const addPass=ref({})
const addStation=ref({})
const isFirstSave=ref(false);
const getImgSrc = (name) => {
  return require(`@/assets/mapIcon/${name}`);
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
  let ak=window.APP_CONFIG.RouteAK?window.APP_CONFIG.RouteAK:''
  let urls=window.APP_CONFIG.ROUTE_151?window.APP_CONFIG.ROUTE_151:window.APP_CONFIG.viRoute;
  const params = {
    origin: origin, // 起点坐标
    destination:destination, // 终点坐标
    tactics: 0, // 导航策略
    waypoints: ways.lat+","+ways.lng,
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
  try {
    // 验证输入数据
    if (!line?.data) {
      console.warn('路线数据为空');
      return [];
    }

    const { data } = line;
    if (data.status !== 0) {
      console.warn('路线数据状态异常:', data.status);
      return [];
    }

    const routes = [];
    const { result } = data;

    // 处理专网接口数据
    if (result?.steps && !result?.routes) {
      const steps = result.steps.reduce((acc, step) => {
        const path = step.path.split(',');
        const points = path.reduce((points, coord, index) => {
          if (index % 2 === 0) {
            points.push({
              lng: coord,
              lat: path[index + 1]
            });
          }
          return points;
        }, []);
        return [...acc, ...points];
      }, []);
      routes.push(...steps);
    }
    // 处理标准接口数据
    else if (result?.routes) {
      const routePoints = result.routes.reduce((acc, route) => {
        const steps = route.steps.reduce((stepAcc, step) => {
          const points = step.path.split(';').map(point => {
            const [lng, lat] = point.split(',');
            return { lng, lat };
          });
          return [...stepAcc, ...points];
        }, []);
        return [...acc, ...steps];
      }, []);
      routes.push(...routePoints);
    }

    return routes;
  } catch (error) {
    console.error('处理路线数据时发生错误:', error);
    return [];
  }
}
//绘制路线
const handleDrawLine = (list) => {
  if (!list) return;
  let features = []
  features.push(makeFeature('LineString', list, {"name": "linIcon"}))
  let source = makeFeatureCollection(features)
  setLineLayer(handleMap.value,list);
  let code = list[0]
  FlyTo(handleMap.value,code);
}
//点位数据组装
const filterPointList = (list,type) => {
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
      setDwn: false,
      isNew:false,
      homes:type
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
        .sort((a, b) => (a.seq_id || 0) - (b.seq_id || 0));

    // 构建最终的点位数组
    const additionalMarkers = sortedPoints.map((item, index) => ({
      ...pointConfig,
      name: item.tollgrantry_name?item.tollgrantry_name:item.tradenodename,
      point: handleMakePoint('', item.lng, item.lat),
      seq_id: index + 1,  // 添加 seq 字段，从 1 开始
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
    drivingInfo.value=res.data.data;
    console.log('获取到流水', res.data.data)
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
    if(res.data.data&&res.data.data.length>0){
      filterPointList(res.data.data,'ori')
    }
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
      filterPointList(res.data.data,'loca')
    }else {
      getPointByOriginCenter()
    }
  }).catch(err => {})
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
      type==='up'? k.setUp=true : k.setDwn=true
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
    setDwn: false,
    data_type:'新增',
    data_status:'正常',
    passid:passId,
  };

  // 处理新添加的点位数据
  const newPoints = list.map(item => ({
    isNew:true,
    ...pointConfig,
    tradenodename:item.tollgrantry_name?item.tollgrantry_name:item.name,
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
    } else if (drivingPoint.value[i].setDwn) {
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
      point.setDwn = false;
      point.seq_id = index + 1;  // 重新分配序号，从1开始
    });
  }
  console.log('----',drivingPoint.value);
  // 重新绘制地图标记
  drawMapMarkersAndLabel(handleMap.value, drivingPoint.value);
  getRoutesByBaiDu()
}

const filterDataInfo=(info)=>{
  if (!info) return null;
  try {
    const result = Object.keys(info).reduce((acc, key) => {
      // 只保留不是以下划线开头的字段
      if (!key.startsWith('_')) {
        acc[key] = info[key];
      }
      return acc;
    }, {});
    return result;
  } catch (error) {
    console.error('数据处理错误:', error);
    return null;
  }
}
//提交时一并提交通行信息
const handleSubmitDrivingInfo = () => {
  if (!drivingInfo.value || !Array.isArray(drivingInfo.value) || drivingInfo.value.length === 0) {
    console.warn('没有可提交的通行信息');
    return;
  }

  try {
    const info = filterDataInfo(drivingInfo.value[0]);
    if (!info) {
      console.warn('通行信息处理失败');
      return;
    }

    // 根据 addPass 过滤 info，排除 null、空字符串和包含 null/undefined 的值
    const setInfo = {};
    if (addPass.value && Object.keys(addPass.value).length > 0) {
      Object.keys(addPass.value).forEach(key => {
        const value = info[key];
        // 检查值是否有效：不是 null、undefined、空字符串，且不包含 'null' 或 'undefined' 字符串
        if (info.hasOwnProperty(key) && 
            value !== null && 
            value !== undefined && 
            value !== '' && 
            value !== ' ' && 
            key !== 'id' &&
            key !== 'create_time' &&
            typeof value === 'string' && 
            !value.toLowerCase().includes('null') && 
            !value.toLowerCase().includes('undefined')) {
          setInfo[key] = value;
        }
      });
    } else {
      console.warn('未获取到标准提交参数');
      return;
    }
    orderUtil.saveDriverDetails([setInfo]).then(res => {
      if (res.data.state !== 'SUCCESS') {
        console.warn('保存通行信息失败:', res.data);
        return;
      }
      isFirstSave.value=true
      console.log('通行信息保存成功');
    }).catch(err => {
      console.error('保存通行信息出错:', err);
    });
  } catch (error) {
    console.error('处理通行信息时发生错误:', error);
  }
}

//用户提交
const handleSubmitStation=()=>{
  //只有第一保存且成功后就不再保存通行详情
  if(!isFirstSave.value){
    handleSubmitDrivingInfo();
  }
  handleFilterDetail()
}


/**
 * @Description:根据标识符合过滤提交据类型，新增isNew，删除!isNew&&select=false，更新 !isNew&&select=true
 * @Author:Eirice
 * @Date: 2025-06-03 14:12:28
 */
const handleFilterDetail = () => {
  let newList = [];
  let deleteList = [];
  let del = ['icon', 'isNew', 'select', 'setUp', 'setDwn', 'point','homes'];
  drivingPoint.value.forEach(item => {
    if ((item.homes==='ori'&&item.select)|| (item.isNew&&item.select)) {
      const newItem = { ...item };
      del.forEach(field => {
        delete newItem[field];
      });
      newList.push(newItem);
    } else if (item.homes === 'loca' && !item.select && !item.isNew) {
      const deleteItem = { ...item };
      del.forEach(field => {
        delete deleteItem[field];
      });
      deleteList.push(deleteItem);
    }
  });
  console.log('这是新加的',newList);
  console.log('这是旧的需要修改的',deleteList);
  if(newList&&newList.length>0){
    handleAddStations(newList);
  }
  if(deleteList&&deleteList.length>0){
    handleDeleteStations(deleteList);
  }
}
//新增保存
const handleAddStations = (list) => {
  // 过滤掉以_开头的字段
  const filteredList = list.map(item => {
    return Object.keys(item).reduce((acc, key) => {
      if (!key.startsWith('_')) {
        acc[key] = item[key];
      }
      return acc;
    }, {});
  });

  // 使用addStation进行过滤
  const finalList = filteredList.map(item => {
    const setInfo = {};
    if (addStation.value && Object.keys(addStation.value).length > 0) {
      Object.keys(addStation.value).forEach(key => {
        const value = item[key];
        // 特殊处理seq_id字段
        if (key === 'seq_id') {
          setInfo[key] = value;
          return;
        }
        if (item.hasOwnProperty(key) && 
            value !== null && 
            value !== undefined && 
            value !== '' && 
            value !== ' ' && 
            key !== 'id' &&
            key !== 'create_time' &&
            typeof value === 'string' && 
            !value.toLowerCase().includes('null') && 
            !value.toLowerCase().includes('undefined')) {
          setInfo[key] = value;
        }
      });
    }
    return setInfo;
  });
  console.log('过滤后的提交数据:', finalList);
  orderUtil.handleSubmitDoorAndStationDetails(finalList).then(res => {
    if(res.data.state!=='SUCCESS') return
    Message({
      type: 'success',
      message: '保存成功'
    });
    console.log(res);
    getPointByLocation()
  }).catch(err => {
    Message({
      type: 'error',
      message: '保存失败'
    });
  })
}
//涉及删除的站点
const handleDeleteStations = (list) => {
  if(list&&list.length>0){
    // 当只有一项时直接取id，多项时转换为逗号分隔的字符串
    const ids = list.length === 1 ? list[0].id : list.map(item => item.id).join(',');
    let obj=[{"colName": "id", "ruleType": "in", value: ids}]
    orderUtil.handleDeleteStationDetails(obj).then(res => {
      if(res.data.state!=='SUCCESS') return
      Message({
        type: 'success',
        message: '保存成功'
      });
      getPointByLocation()
    }).catch(err => {
      Message({
        type: 'error',
        message: '保存失败'
      });
    })
  }
}
//获取公共提交时表单参数匹配选项
const getPublicColNames=(colName,type)=>{
  orderUtil.getPublicColName(colName).then(res=>{
    if(res.data.state!=='SUCCESS') return
    let ls= res.data.data
    if(type==='pass'){
      addPass.value = handleFilterCols(ls.srv_cols,'columns')
    }else{
      addStation.value = handleFilterCols(ls.srv_cols,'columns')
    }
    console.log('获取到单车信息表',addPass.value)
    console.log('获取到保存站点',addStation.value)
  }).catch(err => {})
}
onMounted(() => {
  isFirstSave.value=false
  let passId = route.query.pass_id
  initMineMap();
  handleMap.value = userMap.value.initMap();
  if (handleMap.value) {
    // getPointByOriginCenter();
    getPointByLocation();
    getTrafficFlow(passId)
    getStationsAndDoor()
    getPublicColNames('srvaud_audit_passconv_add','pass')
    getPublicColNames('srvaud_audit_passconvdetail_add','sta')
    // HandleMapClick(handleMap.value);
  }
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