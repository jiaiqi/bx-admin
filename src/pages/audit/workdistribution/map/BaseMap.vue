<template>
  <div class="map_content">
    <div
      id="base_map"
      class="map_cot"
    ></div>
    <div
      class="driving_tab"
      v-if="drivingPoint.length > 0"
    >
      <li class="dr_t">
        <span style="display: block;width:80%;text-align:left;padding-left:2.1875rem">路径门架列表</span>
        <span>
          <img
            style="width:1.5625rem;cursor: pointer"
            @click="setTabColes"
            :src="getImgSrc(isColes ? 'down.png' : 'top.png')"
            alt=""
          >
        </span>
      </li>
      <div :class="isColes ? 'dr_list_active' : 'dr_list'">
        <div
          v-for="(item, index) in drivingPoint"
          :key="index"
          :class="item.select ? 'dr_row_info' : 'dr_row_info_cl'"
          @click="handleSetPoint(item)"
        >
          <li
            class="hd_btns"
            v-if="!isDetail"
          >
            <span
              title="当前位置前加一个"
              @click="handleSetInfo('up', item)"
            ><i class="el-icon-caret-top"></i></span>
            <span
              title="当前位置后加一个"
              @click="handleSetInfo('dwn', item)"
            ><i class="el-icon-caret-bottom"></i></span>
          </li>
          <li
            class="st_name"
            :title="item.name ? item.name : item.tradenodename"
          >{{ item.name ? item.name : item.tradenodename }}</li>
          <li
            class="st_dl"
            v-if="!isDetail"
          >
            <span
              style="font-size: 1.125rem;cursor: pointer"
              @click="handleDelete(item)"
            >
              <i class="el-icon-delete"></i>
            </span>
          </li>
          <li
            class="dr_row_index"
            :style="[{ backgroundColor: '#e0e3e3' }]"
          >{{ index + 1 }}</li>
        </div>
      </div>
      <div
        class="hd_bs"
        v-if="!isDetail"
      >
        <el-button
          style="width:75%"
          size="mini"
          :disabled="!isEdit"
          type="primary"
          plain
          @click="handleSubmitStation"
        >确认修改</el-button>
      </div>
    </div>
    <div class="formlist-foot">
      <el-form
        :model="ruleForm"
        :rules="ruleFormRules"
        label-width="80px"
        class="demo-ruleForm"
        :disabled="isDetail === true"
      >
        <el-row
          :gutter="12"
          class="form-row"
        >
          <el-col
            :xs="24"
            :sm="12"
            :md="12"
            :lg="6"
            :xl="6"
          >
            <el-form-item
              label="稽核车型"
              prop="vehicle_type"
            >
              <el-select
                v-model="ruleForm.vehicle_type"
                clearable
                @change="handleSetVehicleType"
                placeholder="请选择"
              >
                <el-option
                  v-for="item in optionsPage.vehicle_type"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col
            :xs="24"
            :sm="12"
            :md="12"
            :lg="5"
            :xl="5"
          >
            <el-form-item
              label="是否为大件车辆"
              label-width="120px"
              prop="isnormel"
              class="item-narrow"
            >
              <el-select
                v-model="ruleForm.isnormel"
                clearable
                placeholder="请选择"
                @change="handleSetBigCar"
              >
                <el-option
                  v-for="item in optionsPage.isnormel"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col
            :xs="24"
            :sm="12"
            :md="12"
            :lg="5"
            :xl="5"
          >
            <el-form-item
              label="车轴数"
              prop="axlecount"
              class="item-narrow"
            >
              <el-input
                v-model="ruleForm.axlecount"
                clearable
                @input="handleSetAxleCount"
                placeholder="请输入..."
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col
            :xs="24"
            :sm="12"
            :md="12"
            :lg="8"
            :xl="8"
          >
            <el-form-item
              label="通行收费"
              prop="orginal_fee"
              class="item-fee"
            >
              <li class="fee-row">
                <el-input
                  v-model="ruleForm.orginal_fee"
                  @input="handleSetFee"
                  disabled
                  clearable
                  placeholder="请输入..."
                >
                  <template slot="append">元</template>
                </el-input>
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  @click="handleGetCurrentFree"
                >计费查询</el-button>
              </li>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

    </div>
    <StationList
      :stVisible.sync="listVisible"
      @getChoseStations="handleFilterStation"
    />
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, computed, reactive, watch } from "vue";
import { useRoute , useStore } from "@/common/vueApi";
import MapUtils from "@/pages/audit/workdistribution/map/mapUtils";
import OrderApi from "@/pages/audit/api/order";
import { filterListByOption, formDataByGetInfo, formDataByInitText, SuspectedColumn, createOrderNo, formatFeeToYuan, formatFeeToFen } from '../workFlow/filterList'
import StationList from "@/pages/audit/workdistribution/map/stationList.vue";
import { handleFilterCols } from "@/pages/audit/workdistribution/map/filterServiceCol";
import _ from "lodash";
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
import moment from 'dayjs'

const orderUtil = new OrderApi();
const store = useStore();
const route = useRoute()


const isDetail = computed(() => {
  return route.query?.pageType === 'detail'
})


const optionsPage = JSON.parse(window.sessionStorage.getItem('optionsPage')) || {}
const passId = route.query?.pass_id

const pass_time = passId.slice(22, 30)
const formattedDate = pass_time.slice(0, 4) + '-' + pass_time.slice(4, 6) + '-' + pass_time.slice(6, 8);


let strTime = route.query?.startTime || moment(formattedDate).subtract(1, 'days').format('YYYY-MM-DD HH:mm:ss');
let endTime = route.query?.endTime || moment(formattedDate).add(2, 'days').format('YYYY-MM-DD HH:mm:ss');
const listVisible = ref(false)
const drivingInfo = ref([])
const userMap = ref(null);
const handleMap = ref(null);
const isColes = ref(false);
const drivingPoint = ref([])
const addPass = ref({})
const addStation = ref({})
const isFirstSave = ref(false);
const isEdit = ref(false);
const getImgSrc = (name) => {
  return require(`@/assets/mapIcon/${name}`);
}

// 当未获取到通行流水时，从 Vuex 的 suspectedData 回填到 drivingInfo
const fillDrivingInfoFromSuspectedData = () => {
  try {
    const suspected = store.state?.orderForm?.suspectedData;
    // 优先处理数组结构
    if (Array.isArray(suspected) && suspected.length > 0) {
      drivingInfo.value = suspected;
      return true;
    }
    // 兼容对象结构（历史代码可能存单对象）
    if (suspected && typeof suspected === 'object' && Object.keys(suspected).length > 0) {
      drivingInfo.value = [suspected];
      return true;
    }
  } catch (e) {
    console.warn('读取 Vuex suspectedData 回退失败:', e);
  }
  return false;
}
const ruleForm = reactive({
  orginal_fee: "",             //通行收费
  axlecount: 0,                     //车轴数
  isnormel: "",	                //是否为大件车辆
  vehicle_type: "",  //稽核车型
  pass_id: passId,
  vehicleusertype: "", // 车辆用户类型
  vehicleclass: "", // 车种
  real_fee: 0,
  owe_fee: 0,
  media_type: ""
})
const ruleFormRules = {
  vehicle_type: [
    { required: true, message: '请选择稽核车型', trigger: 'blur' }
  ],
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
const handleSetAxleCount = (val) => {
  ruleForm.axlecount = val
  store.commit('orderForm/handleSetOrderForm', { axlecount: val })
}
const handleSetFee = (val) => {
  ruleForm.orginal_fee = val
  store.commit('orderForm/handleSetOrderForm', { orginal_fee: val })
}
const handleGetCurrentFree = () => {

  if (ruleForm.vehicle_type === '') {
    Message.error('请选择稽核车型后再进行计费查询！');
  }
  let obj = {
    pass_id: ruleForm.pass_id,
    vehicleusertype: ruleForm.vehicleusertype,
    vehicleclass: ruleForm.vehicleclass,
    vehicle_type: ruleForm.vehicle_type,
    axleCount: ruleForm.axlecount
  }
      orderUtil.getDriverFreeDetails(obj).then(res => {
        if (res.data.code !== 0) return;
        if (res.data.messageInfo && res.data.messageInfo.tollDetail) {
          let ls = res.data.messageInfo.tollDetail[0]
          ruleForm.orginal_fee = formatFeeToYuan(ls.fee)
          handleChangeFee()
          store.commit('orderForm/handleSetOrderForm', { orginal_fee: ruleForm.orginal_fee, real_fee: ruleForm.real_fee })
        }
      }).catch(err => { })
}
const handleChangeFee = () => {
  const originalFee = typeof ruleForm.orginal_fee === 'string' ? parseFloat(ruleForm.orginal_fee) : ruleForm.orginal_fee;
  const realFee = typeof ruleForm.real_fee === 'string' ? parseFloat(ruleForm.real_fee) : ruleForm.real_fee;
  if (!isNaN(originalFee) && !isNaN(realFee)) {
    const diff = originalFee - realFee;
    ruleForm.owe_fee = diff > 0 ? diff : 0;
  } else {
    ruleForm.owe_fee = 0; // 如果任一费用无效，补缴费用设为0
  }
}
//大件车辆类型判断
const handleSetBigCar = (val) => {
  ruleForm.isnormel = val
  store.commit('orderForm/handleSetOrderForm', { isnormel: val })
}
const handleSetVehicleType = (val) => {
  ruleForm.vehicle_type = val
  store.commit('orderForm/handleSetOrderForm', { vehicle_type: val })
}
// 订阅 Vuex 中的 orderForm 以同步关联字段
const orderFormFromStore = computed(() => store.getters['orderForm/getOrderForm'])
const linkedKeys = ['vehicle_type', 'isnormel', 'axlecount', 'orginal_fee', 'real_fee', 'owe_fee', 'vehicleusertype', 'vehicleclass']
watch(orderFormFromStore, (form) => {
  if (!form) return
  linkedKeys.forEach((k) => {
    if (Object.prototype.hasOwnProperty.call(form, k)) {
      ruleForm[k] = form[k]
    }
  })
}, { deep: true })
//通过通行介质类型及是否为大件车辆设置默认的车辆用户类型及车种
const initSpecialType = () => {
  let eclass = null;
  let sertype = null
  let operate_params = getOperateParams();
  operate_params = JSON.parse(operate_params).data;
  if (operate_params) {
    eclass = operate_params[0]?.vehicleclass
    sertype = operate_params[0]?.vehicleusertype
  } else {
    eclass = operate_params.vehicleclass
    sertype = operate_params.vehicleusertype
  }
  if (ruleForm.media_type !== '' && ruleForm.isnormel !== '') {
    if (ruleForm.media_type === '1' && ruleForm.isnormel === '1') {
      ruleForm.vehicleusertype = '25';
    }
    else if (ruleForm.media_type === '2' && ruleForm.isnormel === '1') {
      ruleForm.vehicleclass = '25';
    }
    else {
      ruleForm.vehicleusertype = sertype ? sertype : '0';
      ruleForm.vehicleclass = eclass ? eclass : '0';
    }
  } else {
    ruleForm.vehicleusertype = sertype ? sertype : '0';
    ruleForm.vehicleclass = eclass ? eclass : '0';
  }
}
const getAllOptionsList = () => {
  orderUtil.getOrderFormList().then(res => {
    if (!res || res.data.state !== "SUCCESS") return
    console.log('1111111111111', res.data)
    let ls = res.data.data
    let ops = ls.srv_cols
    Object.assign(optionsPage, filterListByOption(ops, optionsPage))
    console.log('123123', optionsPage)
  }).catch(err => { })
}


/**
 * @Description:获取百度路径规划数据信息
 * @Author:Eirice
 * @Date: 2025-06-06 14:29:34
 */
const getRoutesByBaiDu = async (customParams = null) => {
  if (!handleMap.value) {
    console.warn('地图对象未初始化')
    return []
  }

  let ak = window.APP_CONFIG.RouteAK ? window.APP_CONFIG.RouteAK : ''
  let urls = window.APP_CONFIG.viRoute;

  // 如果没有传入参数，则从drivingPoint构建参数
  const params = customParams || {
    origin: `${drivingPoint.value[0].lat},${drivingPoint.value[0].lng}`,
    destination: `${drivingPoint.value[drivingPoint.value.length - 1].lat},${drivingPoint.value[drivingPoint.value.length - 1].lng}`,
    tactics: 0,
    waypoints: drivingPoint.value.slice(1, -1).map(point => `${point.lat},${point.lng}`).join(window.APP_CONFIG.splitType),
    inputCrs: 'wgs84ll',
    outputCrs: 'wgs84ll'
  }

  let line = await orderUtil.getBaiduMapRoute(ak, urls, params);
  const lines = handleFilterLine(line)
  return lines
}
//途径点多个分隔及多段路查询
const handleSpliceWayPoints = async () => {
  if (!handleMap.value) {
    console.warn('地图对象未初始化')
    return
  }

  const MAX_WAYPOINTS = 5
  const allPoints = [...drivingPoint.value]
  const splitInfo = window.APP_CONFIG.splitType

  // 如果总点数小于等于最大值+2（起点和终点），直接规划
  if (allPoints.length <= MAX_WAYPOINTS + 2) {
    // 直接使用getRoutesByBaiDu进行规划，而不是递归调用handleSpliceWayPoints
    const params = {
      origin: `${allPoints[0].lat},${allPoints[0].lng}`,
      destination: `${allPoints[allPoints.length - 1].lat},${allPoints[allPoints.length - 1].lng}`,
      tactics: 0,
      waypoints: allPoints.slice(1, -1).map(point => `${point.lat},${point.lng}`).join(splitInfo),
      inputCrs: 'wgs84ll',
      outputCrs: 'wgs84ll'
    }
    const lines = await getRoutesByBaiDu(params)

    // 绘制路线
    if (lines && lines.length > 0) {
      const linePoints = lines.map(point => new BMap.Point(point.lng, point.lat))
      handleDrawLine(linePoints)
    }
    return
  }

  const segments = []
  let currentSegment = []

  // 将点分组，每个分段最多包含MAX_WAYPOINTS个途径点
  for (let i = 0; i < allPoints.length; i++) {
    currentSegment.push(allPoints[i])

    // 当达到最大途径点数量+2（起点和终点）时，创建新段
    if (currentSegment.length === MAX_WAYPOINTS + 2) {
      segments.push([...currentSegment])
      // 使用当前段的最后一个点作为下一段的起点
      currentSegment = [allPoints[i]]
    }
  }

  // 添加最后一段（如果还有剩余点）
  if (currentSegment.length > 1) {
    segments.push(currentSegment)
  }

  let allRoutes = []
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i]

    // 处理当前分段的起终点和途径点
    const segmentStart = segment[0]
    const segmentEnd = segment[segment.length - 1]
    const segmentWaypoints = segment.slice(1, -1)

    let waypointsStr = ''
    if (segmentWaypoints.length > 0) {
      waypointsStr = segmentWaypoints.map(point => `${point.lat},${point.lng}`).join(splitInfo)
    }

    const params = {
      origin: `${segmentStart.lat},${segmentStart.lng}`,
      destination: `${segmentEnd.lat},${segmentEnd.lng}`,
      tactics: 0,
      waypoints: waypointsStr,
      inputCrs: 'wgs84ll',
      outputCrs: 'wgs84ll'
    }

    const lines = await getRoutesByBaiDu(params)

    if (lines && lines.length > 0) {
      const currentRoute = lines.map(point => [point.lng, point.lat])

      // 合并路线（除了最后一段，其他段需要去掉最后一个点，避免重复）
      if (i < segments.length - 1) {
        allRoutes = allRoutes.concat(currentRoute.slice(0, -1))
      } else {
        allRoutes = allRoutes.concat(currentRoute)
      }
    }
  }

  // 绘制完整路线
  if (allRoutes.length > 0) {
    const linePoints = allRoutes.map(point => new BMap.Point(point[0], point[1]))
    handleDrawLine(linePoints)
  }
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
  if (!list || !handleMap.value) {
    console.warn('无效的路线数据或地图对象未初始化')
    return
  }

  try {
    let features = []
    features.push(makeFeature('LineString', list, { "name": "linIcon" }))
    let source = makeFeatureCollection(features)
    setLineLayer(handleMap.value, list)

    if (list.length > 0) {
      let code = list[0]
      FlyTo(handleMap.value, code)
    }
  } catch (error) {
    console.error('绘制路线时发生错误:', error)
  }
}
//点位数据组装
const filterPointList = (list, type) => {
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
      isNew: false,
      homes: type
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
      .sort((a, b) => {
        // 优先使用seq字段排序
        const seqA = a.seq || a.seq_id || 0;
        const seqB = b.seq || b.seq_id || 0;
        return seqA - seqB;
      });
    // 构建最终的点位数组
    const additionalMarkers = sortedPoints.map((item, index) => ({
      ...pointConfig,
      name: item.tollgrantry_name ? item.tollgrantry_name : item.tradenodename,
      point: handleMakePoint('', item.lng, item.lat),
      seq_id: index + 1,  // 添加 seq 字段，从 1 开始
      ...item
    }));

    // 合并所有点位
    drivingPoint.value = [...additionalMarkers];
    console.log(drivingPoint.value);
    // 绘制地图标记
    drawMapMarkersAndLabel(handleMap.value, drivingPoint.value);
    handleSpliceWayPoints()
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
    condition: [{ colName: "passid", ruleType: "like", value: passId }],
    divCond: [{ colName: "createtime", ruleType: "between", value: [strTime, endTime] }]
  }
  orderUtil.getCarWaysInfo(cadn).then(res => {
    if (res.data.state !== 'SUCCESS') {
      // 查询失败，尝试用 Vuex suspectedData 进行回退
      if (fillDrivingInfoFromSuspectedData()) {
        console.warn('getTrafficFlow 查询失败，已使用 Vuex suspectedData 作为通行信息');
      }
      return;
    }
    drivingInfo.value = res.data.data;
    // 未查到数据时，尝试回退使用 Vuex suspectedData
    if (!drivingInfo.value || !Array.isArray(drivingInfo.value) || drivingInfo.value.length === 0) {
      if (fillDrivingInfoFromSuspectedData()) {
        console.warn('getTrafficFlow 未查到数据，已使用 Vuex suspectedData 作为通行信息');
      }
    }
    console.log('获取到流水', res.data.data)
  }).catch(err => {
  })
}

/**
 * @Description:初次进入调用远端中心接口查询通行信息
 * @Author:Eirice
 * @Date: 2025-06-06 17:45:45
 */
const getPointByOriginCenter = () => {

  strTime = moment(formattedDate).format('YYYY-MM-DD HH:mm:ss');
  endTime = moment(formattedDate).add(1, 'month').format('YYYY-MM-DD HH:mm:ss');
  let cadn = {
    condition: [{ colName: "passid", ruleType: "like", value: passId }],
    divCond: [{ colName: "createtime", ruleType: "between", value: [strTime, endTime] }]
  }
  orderUtil.getOriginCenterDetails(cadn).then(res => {
    console.log(res.data, 999999999)
    if (res.data.state !== 'SUCCESS') return;
    if (res.data.data && res.data.data.length > 0) {
      handleCtrlSubmit(true)   //所有从远端中心回来的数据都是可以直接保存的
      filterPointList(res.data.data, 'ori')
      console.log(res.data.data, 88888888)
    } else {
      getPointByOriginCenterNew()
    }
  }).catch(err => { })
}

const getPointByOriginCenterNew = () => {
  strTime = moment(formattedDate).subtract(1, 'day').format('YYYY-MM-DD HH:mm:ss');
  endTime = moment(formattedDate).add(2, 'day').format('YYYY-MM-DD HH:mm:ss');
  let cadn = {
    condition: [{ colName: "passid", ruleType: "like", value: passId }],
    divCond: [{ colName: "createtime", ruleType: "between", value: [strTime, endTime] }]
  }
  console.log(cadn, 777777777)
  orderUtil.getOriginCenterDetailsNew(cadn).then(res => {
    if (res.data.state !== 'SUCCESS') return;
    if (res.data.data && res.data.data.length > 0) {
      handleCtrlSubmit(true)   //所有从远端中心回来的数据都是可以直接保存的
      filterPointList(res.data.data, 'ori')
    }
  }).catch(err => { })
}

/**
 * @Description:从本地服务中调用获取车辆通行信息
 * @Author:Eirice
 * @Date: 2025-06-06 17:48:49
 */
const getPointByLocation = () => {
  let cadn = {
    condition: [{ colName: "passid", ruleType: "like", value: passId }],
    // divCond: [{ colName: "createtime", ruleType: "between", value: [strTime, endTime] }]
  }
  orderUtil.getLocationCenterDetails(cadn).then(res => {
    if (res.data.data && res.data.data.length > 0) {
      //本地存储有数据
      handleCtrlSubmit(false)  //所有从本地回来的数据都是默认是不可以二次直接点击保存的
      filterPointList(res.data.data, 'loca')
    } else {
      getPointByOriginCenter()
    }
  }).catch(err => { })
}
//控制确认修改按是否可以点击
const handleCtrlSubmit = (flag) => {
  isEdit.value = flag;
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
  let selections = drivingPoint.value.filter(d => { return d.select })
  if (selections.length > 0 && selections.length === drivingPoint.value.length) {
    handleCtrlSubmit(false)
  } else {
    //删除动作切换按钮状态
    handleCtrlSubmit(true)
  }
  drawMapMarkersAndLabel(handleMap.value, tep);
  handleSpliceWayPoints()
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
    if (res.data.state !== 'SUCCESS') return;
  }).catch(err => { })
}
/**
 * @Description:手动开启向列表中加入一个 type 前，后 ，item 当前节点
 * @Author:Eirice
 * @Date: 2025-05-30 18:30:07
 */
const handleSetInfo = (type, item) => {
  listVisible.value = true;
  drivingPoint.value.map(k => {
    if (k.id === item.id) {
      type === 'up' ? k.setUp = true : k.setDwn = true
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
  //删除动作切换按钮状态
  handleCtrlSubmit(true)
  // 构建新的点位配置
  const pointConfig = {
    icon: require(`@/assets/mapIcon/point_ico.png`),
    select: true,
    setUp: false,
    setDwn: false,
    data_type: '新增',
    data_status: '正常',
    passid: passId,
  };

  // 处理新添加的点位数据
  const newPoints = list.map(item => ({
    isNew: true,
    ...pointConfig,
    tradenodename: item.tollgrantry_name ? item.tollgrantry_name : item.name,
    name: item.tollgrantry_name,
    point: handleMakePoint('', item.lng, item.lat),
    ...item,
    grantry_id: item.id
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
  console.log('----', drivingPoint.value);
  // 重新绘制地图标记
  drawMapMarkersAndLabel(handleMap.value, drivingPoint.value);
  handleSpliceWayPoints()
}

const filterDataInfo = (info) => {
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
    // 首次提交前尝试使用 Vuex suspectedData 作为回退
    const used = fillDrivingInfoFromSuspectedData();
    if (!used) {
      console.warn('没有可提交的通行信息');
      return;
    }
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
          ((typeof value === 'string' &&
            !value.toLowerCase().includes('null') &&
            !value.toLowerCase().includes('undefined')) ||
            typeof value === 'number')) {
          setInfo[key] = value;
        }
      });
    } else {
      console.warn('未获取到标准提交参数');
      return;
    }
    console.log('这是过滤后的字段的字段', setInfo)
    orderUtil.saveDriverDetails([setInfo]).then(res => {
      if (res.data.state !== 'SUCCESS') {
        console.warn('保存通行信息失败:', res.data);
        return;
      }
      isFirstSave.value = true
      console.log('通行信息保存成功');
    }).catch(err => {
      console.error('保存通行信息出错:', err);
    });
  } catch (error) {
    console.error('处理通行信息时发生错误:', error);
  }
}

//用户提交
const handleSubmitStation = () => {
  //只有第一保存且成功后就不再保存通行详情
  if (!isFirstSave.value) {
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
  let del = ['icon', 'isNew', 'select', 'setUp', 'setDwn', 'point', 'homes'];
  drivingPoint.value.forEach(item => {
    if ((item.homes === 'ori' && item.select) || (item.isNew && item.select)) {
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
  console.log('这是新加的', newList);
  console.log('这是旧的需要修改的', deleteList);
  if (newList && newList.length > 0) {
    handleAddStations(newList);
  }
  if (deleteList && deleteList.length > 0) {
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
          ((typeof value === 'string' &&
            !value.toLowerCase().includes('null') &&
            !value.toLowerCase().includes('undefined')) ||
            typeof value === 'number')) {
          setInfo[key] = value;
        }
      });
    }
    return setInfo;
  });
  console.log('过滤后的提交数据:', finalList);
  orderUtil.handleSubmitDoorAndStationDetails(finalList).then(res => {
    if (res.data.state !== 'SUCCESS') return
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
  if (list && list.length > 0) {
    // 当只有一项时直接取id，多项时转换为逗号分隔的字符串
    const ids = list.length === 1 ? list[0].id : list.map(item => item.id).join(',');
    let obj = [{ "colName": "id", "ruleType": "in", value: ids }]
    orderUtil.handleDeleteStationDetails(obj).then(res => {
      if (res.data.state !== 'SUCCESS') return
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
const getPublicColNames = (colName, type) => {
  orderUtil.getPublicColName(colName).then(res => {
    if (res.data.state !== 'SUCCESS') return
    let ls = res.data.data
    if (type === 'pass') {
      addPass.value = handleFilterCols(ls.srv_cols, 'columns')
    } else {
      addStation.value = handleFilterCols(ls.srv_cols, 'columns')
    }
    console.log('获取到单车信息表', addPass.value)
    console.log('获取到保存站点', addStation.value)
  }).catch(err => { })
}

function asyncLoadMap() {
  return new Promise(function (resolve, reject) {
    if (typeof (BMapGL) !== 'undefined') return resolve(BMapGL)
    if (typeof (BMap) !== "undefined") { return resolve(BMap) }
    let script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = `${window.APP_CONFIG.serverUrl}&callback=init`
    script.onerror = reject
    script.onload = function () {
      if (BMapGL || BMap) {
        BMapGL ? resolve(BMapGL) : resolve(BMap)
      }
    }
    document.head.appendChild(script)
    const timer = setInterval(() => {
      if (BMapGL || BMap) {
        BMapGL ? resolve(BMapGL) : resolve(BMap)
        clearInterval(timer)
      }
    }, 500)
  })
}


onMounted(async () => {
  await asyncLoadMap()
  await new Promise(resolve => setTimeout(resolve, 500))
  isFirstSave.value = false
  let passId = route.query.pass_id
  initMineMap();
  // getAllOptionsList()
  handleMap.value = userMap.value.initMap();
  if (handleMap.value) {
    // getPointByOriginCenter();
    getPointByLocation();
    getTrafficFlow(passId)
    getStationsAndDoor()
    getPublicColNames('srvaud_audit_passconv_add', 'pass')
    getPublicColNames('srvaud_audit_passconvdetail_add', 'sta')
    // HandleMapClick(handleMap.value);
  }
  // 已改为使用 Vuex store 同步，注释掉旧的 eventBus 订阅
  // eventBus.$on('updateOrderForm', handleUpdateOrderForm)
})

onBeforeUnmount(() => {
  userMap.value.destroyMap()
  userMap.value = null
  handleMap.value = null
  // 已改为使用 Vuex store 同步，注释掉旧的 eventBus 取消订阅
  // eventBus.$off('updateOrderForm', handleUpdateOrderForm)
})
</script>


<style scoped lang="scss">
li {
  list-style: none;
}

.formlist-foot {
  width: 100%;
  // position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background: #fff;
  z-index: 100;
  border-top: 1px solid #eaecef;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.06);
  // padding: 6px 10px;
  // max-height: 160px;
  overflow-y: auto;

  .demo-ruleForm {
    padding: 4px 8px;
  }
}

.map_content {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;

  .map_cot {
    width: 100%;
    // height: 100%;
    flex: 1;
  }

  .driving_tab {
    width: 15%;
    min-width: 200px;
    max-height: 60%;
    background: #f6f8f8;
    position: absolute;
    top: .5em;
    right: .5em;
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

  .dr_row_info_cl {
    box-sizing: border-box;
    padding: 2px 1px;
    font-size: 0.875rem;
    border-bottom: 1px solid rgba(232, 237, 250, 0.6);
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #fef0f0;
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

  .form-row {
    margin: 0;
  }
}

.hd_btns {
  width: 2.8125rem;
  display: flex;
  opacity: 0;
  flex-direction: column;
  color: #00a0e9;
  cursor: pointer;

  >span {
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

.hd_bs {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 2.5rem;
}

::v-deep .el-form-item {
  .el-form-item__label {
    margin-bottom: 0;
  }

  .el-select {
    width: 100%;
  }

  .el-form-item__content {
    display: flex;
    align-items: center;
    height: 40px;
  }
}

/* 更紧凑的标签与宽度控制 */
::v-deep .el-form-item__label {
  padding-right: 6px;
}

.item-narrow {
  // max-width: 180px;
}

.item-fee {
  // max-width: 320px;
}

.fee-row {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}
</style>