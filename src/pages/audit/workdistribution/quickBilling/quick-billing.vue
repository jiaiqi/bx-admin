<template>
  <div class="quick_content">
    <div class="quick_row" style="width:80%">
      <div class="quick_map" id="qck_map"></div>
      <div class="flow_ct">
         <div class="flow_dsp" v-for="(item,index) in flowGroup" :key="item.code">
           <span class="flow_color" :style="[{backgroundColor:item.color}]"></span>
           <span>路径{{item.code}}</span>
         </div>
      </div>
      <div class="quick_form">
        <div class="qk_row" style="height:40%">
          <el-form :model="baseForm" ref="baseForm"  :rules="baseRules"  label-width="auto" class="qk_ruleForm">
            <el-row style="border:none">
              <el-col :span="6">
                <el-form-item label="车型" prop="vehicleType">
                  <el-select v-model="baseForm.vehicleType" clearable placeholder="请选择" size="mini" style="width: 100%">
                    <el-option
                        v-for="item in useOptions.vehicle_type"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value">
                    </el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="车种" prop="vehicleClass">
                  <el-select v-model="baseForm.vehicleClass" clearable placeholder="请选择" size="mini" style="width: 100%">
                    <el-option
                        v-for="item in useOptions.vehicleclass"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value">
                    </el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="车辆用户类型" prop="vehicleUserType">
                  <el-select v-model="baseForm.vehicleUserType" clearable placeholder="请选择" size="mini" style="width: 100%">
                    <el-option
                        v-for="item in useOptions.vehicleusertype"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value">
                    </el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="通行介" prop="media_type">
                  <el-select v-model="baseForm.mediaType" placeholder="请选择" clearable size="mini" style="width: 100%">
                    <el-option
                        v-for="item in useOptions.media_type"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value">
                    </el-option>
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row style="border: none">
              <el-col :span="6">
                <el-form-item label="计费模块版本号" prop="rateProgramVer">
                  <el-input v-model="baseForm.rateProgramVer" placeholder="请输入" clearable size="mini"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="费率版本号" prop="rateVer">
                  <el-input v-model="baseForm.rateVer" placeholder="请输入" clearable size="mini"></el-input>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </div>
        <div class="qk_row" style="height:48%;margin-top:0.625rem">
          <div class="qk_tl">人工录入门架序列：</div>
          <!--序列一组-->
          <el-form label-width="auto" class="text_ruleForm" style="height: auto">
            <el-row>
              <el-col :span="2">
                <el-form-item label="路径分组1:">
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="门架序列">
                  <el-input type="textarea"  @clear="handleClearGantry(1)" v-model="quickForm1.textGantryGroup" size="mini" style="width:100%" clearable placeholder="输入的多个序列使用|分隔" @input="(value) => debouncedHandleGantryGroupInput(value, 1)"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="6" style="margin-left:0.625rem">
                <el-form-item label="门架序列(HEX)">
                  <el-input type="textarea" v-model="quickForm1.textGantryHexGroup" size="mini" style="width:100%" clearable placeholder="输入的多个hex使用|分隔" @input="(value) => debouncedHandleHexGroupInput(value, 1)" @clear="handleClearGantry(1)"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item>
                  <el-button type="primary" plain size="mini" @click="handleUpdateGantryList(1)">更新门架列表</el-button>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
         <!--序列2组-->
          <el-form label-width="auto" class="text_ruleForm" style="height: auto">
            <el-row>
              <el-col :span="2">
                <el-form-item label="路径分组2:">
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="门架序列">
                  <el-input type="textarea"  @clear="handleClearGantry(2)" v-model="quickForm2.textGantryGroup" size="mini" style="width:100%" clearable placeholder="输入的多个序列使用|分隔" @input="(value) => debouncedHandleGantryGroupInput(value, 2)"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="6" style="margin-left:0.625rem">
                <el-form-item label="门架序列(HEX)">
                  <el-input type="textarea" v-model="quickForm2.textGantryHexGroup" size="mini" style="width:100%" clearable placeholder="输入的多个hex使用|分隔" @input="(value) => debouncedHandleHexGroupInput(value, 2)" @clear="handleClearGantry(2)"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item>
                  <el-button type="primary" plain size="mini" @click="handleUpdateGantryList(2)">更新门架列表</el-button>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
          <!--序列3组-->
          <el-form label-width="auto" class="text_ruleForm" style="height: auto">
            <el-row>
              <el-col :span="2">
                <el-form-item label="路径分组3:">
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="门架序列">
                  <el-input type="textarea"  @clear="handleClearGantry(3)" v-model="quickForm3.textGantryGroup" size="mini" style="width:100%" clearable placeholder="输入的多个序列使用|分隔" @input="(value) => debouncedHandleGantryGroupInput(value, 3)"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="6" style="margin-left:0.625rem">
                <el-form-item label="门架序列(HEX)">
                  <el-input type="textarea" v-model="quickForm3.textGantryHexGroup" size="mini" style="width:100%" clearable placeholder="输入的多个hex使用|分隔" @input="(value) => debouncedHandleHexGroupInput(value, 3)" @clear="handleClearGantry(3)"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item>
                  <el-button type="primary" plain size="mini" @click="handleUpdateGantryList(3)">更新门架列表</el-button>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </div>
      </div>
    </div>
    <div class="quick_row st_list_cot" style="width: 19.5%"
         v-loading="lineLoading"
         element-loading-text="路径数据加载中....."
         element-loading-spinner="el-icon-loading"
         element-loading-background="rgba(0, 0, 0, 0.8)"
    >
      <div style="height: 70%; overflow-y: auto;">
        <div class="st_list" :style="[{height:stationList2.length>0&&stationList3.length>0?'30%'
        :stationList2.length>0|stationList3.length>0?'40%':'70%'}]">
          <div class="st_tl_info">
            <span>
              <el-checkbox v-model="selectedGroups[1]" @change="handleGroupSelect(1)">路径组1</el-checkbox>
              已选{{'('+stationList1.length+')'+'个'}}
            </span>
            <span> <el-button type="primary" plain size="mini" @click="listVisible=true; currentGroupIndex=1">添加门架</el-button></span>
            <span> <el-button type="primary" plain size="mini" @click="handleClear(1)">清空门架</el-button></span>
          </div>
          <div class="chose_lise">
            <draggable v-model="stationList1" handle=".st_tran" @end="onDragEnd(1)">
              <div class="ch_row" v-for="(item,index) in stationList1" :key="item.id" @click="handleFly(item)">
                <span class="st_tran"><i class="el-icon-rank"></i></span>
                <div>
                  <span class="st_cl">{{index+1}}</span>
                  <span class="st_title">{{item.name?item.name:item.tradenodename}}</span>
                </div>
                <span class="st_del" style="cursor: pointer" @click.stop="handleDelete(item, 1)"><i class="el-icon-delete"></i></span>
              </div>
            </draggable>
          </div>
        </div>

        <div class="st_list" :style="[{height:stationList2.length>0?'30%':'5%'}]">
          <div class="st_tl_info">
            <span>
              <el-checkbox v-model="selectedGroups[2]" @change="handleGroupSelect(2)">路径组2</el-checkbox>
              已选{{'('+stationList2.length+')'+'个'}}
            </span>
            <span> <el-button type="primary" plain size="mini" @click="listVisible=true; currentGroupIndex=2">添加门架</el-button></span>
            <span> <el-button type="primary" plain size="mini" @click="handleClear(2)">清空门架</el-button></span>
          </div>
          <div class="chose_lise" v-if="stationList2.length>0">
            <draggable v-model="stationList2" handle=".st_tran" @end="onDragEnd(2)">
              <div class="ch_row" v-for="(item,index) in stationList2" :key="item.id" @click="handleFly(item)">
                <span class="st_tran"><i class="el-icon-rank"></i></span>
                <div>
                  <span class="st_cl">{{index+1}}</span>
                  <span class="st_title">{{item.name?item.name:item.tradenodename}}</span>
                </div>
                <span class="st_del" style="cursor: pointer" @click.stop="handleDelete(item, 2)"><i class="el-icon-delete"></i></span>
              </div>
            </draggable>
          </div>
        </div>

        <div class="st_list" :style="[{height:stationList3.length>0?'30%':'5%'}]">
          <div class="st_tl_info">
            <span>
              <el-checkbox v-model="selectedGroups[3]" @change="handleGroupSelect(3)">路径组3</el-checkbox>
              已选{{'('+stationList3.length+')'+'个'}}
            </span>
            <span> <el-button type="primary" plain size="mini" @click="listVisible=true; currentGroupIndex=3">添加门架</el-button></span>
            <span> <el-button type="primary" plain size="mini" @click="handleClear(3)">清空门架</el-button></span>
          </div>
          <div class="chose_lise" v-if="stationList3.length>0">
            <draggable v-model="stationList3" handle=".st_tran" @end="onDragEnd(3)">
              <div class="ch_row" v-for="(item,index) in stationList3" :key="item.id" @click="handleFly(item)">
                <span class="st_tran"><i class="el-icon-rank"></i></span>
                <div>
                  <span class="st_cl">{{index+1}}</span>
                  <span class="st_title">{{item.name?item.name:item.tradenodename}}</span>
                </div>
                <span class="st_del" style="cursor: pointer" @click.stop="handleDelete(item, 3)"><i class="el-icon-delete"></i></span>
              </div>
            </draggable>
          </div>
        </div>
      </div>

      <div style="height: 30%; border-top: 1px solid #eee; padding-top: 0.5rem;" class="flw_rest">
        <div class="handle_sub" style="margin-bottom: 0.5rem;">
          <el-button style="width:100%" type="primary" plain size="mini" @click="handleSubmitQuick()">稽核计费</el-button>
        </div>
        
        <div style="display: flex; flex-direction: row; gap: 0.5rem; height: calc(100% - 60px);">
          <div class="fee-result-group" style="min-width: 180px; flex-shrink: 0;">
            <div style="font-weight: bold; margin-bottom: 0.5rem; text-align: center; border-bottom: 1px solid #ddd; padding-bottom: 0.25rem;">分组1计费</div>
            <div class="des_tl">
              <span style="margin-right:0.625rem">应收金额：</span>
              <span>{{formatFeeToYuan(feeInfo1.payFee)}}元</span>
            </div>
            <div class="des_tl">
              <span style="margin-right:0.625rem">实收金额：</span>
              <span>{{formatFeeToYuan(feeInfo1.fee)}}元</span>
            </div>
            <div class="des_tl">
              <span style="margin-right:0.625rem">优惠金额：</span>
              <span>{{formatFeeToYuan(feeInfo1.discountFee)}}元</span>
            </div>
          </div>

          <div class="fee-result-group" style="min-width: 180px; flex-shrink: 0;">
            <div style="font-weight: bold; margin-bottom: 0.5rem; text-align: center; border-bottom: 1px solid #ddd; padding-bottom: 0.25rem;">分组2计费</div>
            <div class="des_tl">
              <span style="margin-right:0.625rem">应收金额：</span>
              <span>{{formatFeeToYuan(feeInfo2.payFee)}}元</span>
            </div>
            <div class="des_tl">
              <span style="margin-right:0.625rem">实收金额：</span>
              <span>{{formatFeeToYuan(feeInfo2.fee)}}元</span>
            </div>
            <div class="des_tl">
              <span style="margin-right:0.625rem">优惠金额：</span>
              <span>{{formatFeeToYuan(feeInfo2.discountFee)}}元</span>
            </div>
          </div>

          <div class="fee-result-group" style="min-width: 180px; flex-shrink: 0;">
            <div style="font-weight: bold; margin-bottom: 0.5rem; text-align: center; border-bottom: 1px solid #ddd; padding-bottom: 0.25rem;">分组3计费：</div>
            <div class="des_tl">
              <span style="margin-right:0.625rem">应收金额：</span>
              <span>{{formatFeeToYuan(feeInfo3.payFee)}}元</span>
            </div>
            <div class="des_tl">
              <span style="margin-right:0.625rem">实收金额：</span>
              <span>{{formatFeeToYuan(feeInfo3.fee)}}元</span>
            </div>
            <div class="des_tl">
              <span style="margin-right:0.625rem">优惠金额：</span>
              <span>{{formatFeeToYuan(feeInfo3.discountFee)}}元</span>
            </div>
          </div>
        </div>
      </div>

      <StationList :stVisible.sync="listVisible" @getChoseStations="(list) => handleFilterStation(list, currentGroupIndex)"/>
    </div>
  </div>
</template>

<script>
import StationList from "@/pages/audit/workdistribution/map/stationList.vue";
import MapUtils from "@/pages/audit/workdistribution/map/mapUtils";
import {filterListByOption,formatFeeToYuan} from "@/pages/audit/workdistribution/workFlow/filterList";
import {handleFilterParams} from '@/pages/audit/workdistribution/map/filterServiceCol'
import {
  drewMarkerKinds,
  FlyTo,
  clearMarkersByKind,
  handleMakePoint,
  makeFeature,
  makeFeatureCollection, setColorLine
} from "@/pages/audit/workdistribution/map/layerPage";
import OrderApi from "@/pages/audit/api/order";
import draggable from 'vuedraggable'
import { Message } from 'element-ui';
let baseMap=null
let orderUtils = new OrderApi();
export default {
  name: "quick-billing-s",
  components: {
    StationList,
    draggable
  },
  data(){
    return{
      lineLoading:false,
      flowGroup:[
        {
          name:'路径分组1',
          code:1,
          select:false,
          color:'#3af584',
        },
        {
          name:'路径分组2',
          code:2,
          select:false,
          color:'#235ef1'
        },
        {
          name:'路径分组3',
          code:3,
          select:false,
          color:'#8d49f5'
        }
      ],
      formatFeeToYuan:formatFeeToYuan,
      currentGroupIndex: 1,
      selectedGroups: {
        1: false,
        2: false,
        3: false
      },

      feeInfo1: {
        fee: 0,
        discountFee: 0,
        payFee: 0,
      },
      feeInfo2: {
        fee: 0,
        discountFee: 0,
        payFee: 0,
      },
      feeInfo3: {
        fee: 0,
        discountFee: 0,
        payFee: 0,
      },
      listVisible:false,
      stationList:[],
      stationList1: [],
      stationList2: [],
      stationList3: [],
      pendingStationList: [],
      debounceTimer: null,
      debouncedHandleGantryGroupInput: null,
      debouncedHandleHexGroupInput: null,
      storedGantryGroup: '',
      baseRules:{
        vehicleType: [
          { required: true, message: '车型不能为空', trigger: 'change' },
        ],
        vehicleClass: [
          { required: true, message: '车辆种类不能为空', trigger: 'change' },
        ],
        vehicleUserType: [
          { required: true, message: '车辆用户类型不能为空', trigger: 'change' },
        ],
        rateProgramVer: [
          { required: true, message: '计费模块版本号不能为空', trigger: 'blur' },
        ],
        rateVer: [
          { required: true, message: '费率版本号不能为空', trigger: 'blur' },
        ],

      },
      handleMap:null,
      baseForm:{
        mediaType:'',
        vehicleType:'',
        vehicleUserType:'',
        vehicleClass:'',
        rateProgramVer:0,
        rateVer:0
      },
      quickForm1:{
        textGantryGroup:'',
        textGantryHexGroup:'',
        gantryCount:0,
        gantryGroup:'',
        gantryHexGroup:'',
        dataSource:'',
      },
      quickForm2:{
        textGantryGroup:'',
        textGantryHexGroup:'',
        gantryCount:0,
        gantryGroup:'',
        gantryHexGroup:'',
        dataSource:'',
      },
      quickForm3:{
        textGantryGroup:'',
        textGantryHexGroup:'',
        gantryCount:0,
        gantryGroup:'',
        gantryHexGroup:'',
        dataSource:'',
      },
      useOptions:{
        vehicleclass:[],
        vehicleusertype:[],
        media_type:[],
        vehicle_type:[]
      }
    }
  },
  methods:{
    /**
     * @Description:绘制路线
     * @Author:Eirice
     * @Date: 2025-06-06 14:29:34
     */
    handleDrawLine(list,grindex){
       const colorIdx=['#3af584','#235ef1','#8d49f5']
      if (!list || !this.handleMap) {
        return
      }
      try {
        let features = []
        features.push(makeFeature('LineString', list, {"name": "linIcon"}))
        let source = makeFeatureCollection(features)
        setColorLine(this.handleMap,colorIdx[grindex-1],list,grindex)
      } catch (error) {
      }
    },

    /**
     * @Description:获取百度路径规划数据信息
     * @Author:Eirice
     * @Date: 2025-06-06 14:29:34
     */
    async getRoutesByBaiDu(customParams = null){
      if (!this.handleMap) {
        return []
      }

      let ak=window.APP_CONFIG.RouteAK?window.APP_CONFIG.RouteAK:''
      let urls=window.APP_CONFIG.viRoute;

      const params = customParams

      let line= await orderUtils.getBaiduMapRoute(ak,urls,params);
      const lines= this.handleFilterLine(line)
      return lines
    },

    /**
     * @Description:路线数据过滤
     * @Author:Eirice
     * @Date: 2025-06-06 14:29:34
     */
    handleFilterLine(line){
      try {
        if (!line?.data) {
          return [];
        }

        const { data } = line;
        if (data.status !== 0) {
          return [];
        }

        const routes = [];
        const { result } = data;

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
        return [];
      }
    },
    /**
     * @Description:途径点多个分隔及多段路查询
     * @Author:Eirice
     * @Date: 2025-06-06 14:29:34
     */
    async handleSpliceWayPoints(groupIndex) {
      this.lineLoading=true
      if (!this.handleMap) {
        return
      }
      const stationListKey = `stationList${groupIndex}`;
      const MAX_WAYPOINTS = 5
      const allPoints =[... this[stationListKey]]
       if(allPoints.length ===0){
         return
       }
      const splitInfo = window.APP_CONFIG.splitType

      if (allPoints.length <= MAX_WAYPOINTS + 2) {
        const params = {
          origin: `${allPoints[0].lat},${allPoints[0].lng}`,
          destination: `${allPoints[allPoints.length - 1].lat},${allPoints[allPoints.length - 1].lng}`,
          tactics: 0,
          waypoints: allPoints.slice(1, -1).map(point => `${point.lat},${point.lng}`).join(splitInfo),
          inputCrs: 'wgs84ll',
          outputCrs: 'wgs84ll'
        }

        const lines = await this.getRoutesByBaiDu(params)

        if (lines && lines.length > 0) {
          this.lineLoading=false
          const linePoints = lines.map(point => new BMap.Point(point.lng, point.lat))
          this.handleDrawLine(linePoints,groupIndex)
        }
        return
      }

      const segments = []
      let currentSegment = []

      for (let i = 0; i < allPoints.length; i++) {
        currentSegment.push(allPoints[i])
        if (currentSegment.length === MAX_WAYPOINTS + 2) {
          segments.push([...currentSegment])
          currentSegment = [allPoints[i]]
        }
      }

      if (currentSegment.length > 1) {
        segments.push(currentSegment)
      }

      let allRoutes = []
      for (let i = 0; i < segments.length; i++) {
        const segment = segments[i]

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

        const lines = await this.getRoutesByBaiDu(params)

        if (lines && lines.length > 0) {
          const currentRoute = lines.map(point => [point.lng, point.lat])

                  if (i < segments.length - 1) {
          allRoutes = allRoutes.concat(currentRoute.slice(0, -1))
        } else {
          allRoutes = allRoutes.concat(currentRoute)
        }
      }
      if(i=segments.length-1&&lines){
        this.lineLoading=false
      }
    }

      if (allRoutes.length > 0) {
        const linePoints = allRoutes.map(point => new BMap.Point(point[0], point[1]))
        this.handleDrawLine(linePoints,groupIndex)
      }
    },

    /**
     * @Description:门架点位地图聚焦
     * @Author:Eirice
     * @Date: 2025-06-19 09:06:21
     */
    handleFly(item){
      let code = handleMakePoint('', item.lng, item.lat)
      FlyTo(this.handleMap, code,12.8)
    },
    /**
     * @Description:防抖
     * @Author:Eirice
     * @Date: 2025-06-18 15:16:12
     */
    debounce(fn, delay = 300) {
      return (...args) => {
        if (this.debounceTimer) {
          clearTimeout(this.debounceTimer);
        }
        this.debounceTimer = setTimeout(() => {
          fn.apply(this, args);
        }, delay);
      };
    },

    /**
     * @Description:门架序列数据处理
     * @Author:Eirice
     * @Date: 2025-06-18 15:16:12
     */
    handleGantryGroupInput(value, groupIndex) {
      this.handlePublicTest(groupIndex);
      const formKey = `quickForm${groupIndex}`;
      if (!value) {
        this[formKey].textGantryHexGroup = '';
        const stationListKey = `stationList${groupIndex}`;
        this[stationListKey] = this[stationListKey].filter(item => !item.fromTextGantry);
        this[stationListKey] = this.handleStationDataSource(this[stationListKey]);
        this.handleDrawMarkers(groupIndex);
        if(this[stationListKey].length > 0) {
          this.handleFly(this[stationListKey][0]);
        }
        return;
      }
      const gantryArray = value.split('|').filter(item => item.trim());
      const uniqueGantryArray = [...new Set(gantryArray)];
      this[formKey].textGantryGroup = uniqueGantryArray.join('|');
      this.storedGantryGroup = this[formKey].textGantryGroup;
      let ids = this[formKey].textGantryGroup.replace(/\|/g, ',');
      let info={
        page:{},
        condition:[{colName: "id", ruleType: "in", value:ids}],
        relation_condition:{
          relation: "AND",
          data:[{colName: "id", ruleType: "in", value:ids}]
        }
      }
      orderUtils.getAllStationByInfo(info).then(res => {
        if(res.data.state !== 'SUCCESS') { this.pendingStationList = []; return; }
        let ls = res.data.data.map(item => ({ ...item, fromTextGantry: true }));
        const inputOrder = uniqueGantryArray.map(x => String(x).trim());
        ls.sort((a, b) => inputOrder.indexOf(String(a.id).trim()) - inputOrder.indexOf(String(b.id).trim()));
        this.pendingStationList = ls;
        const hexValues = ls.map(item => item.gantryhex).filter(hex => hex);
        this[formKey].textGantryHexGroup = hexValues.join('|');
      }).catch(err => { this.pendingStationList = []; });
    },
    /**
     * @Description:更新门架按钮点击按钮时触发门架查询
     * @Author:Eirice
     * @Date: 2025-06-18 15:16:12
     */
    handleUpdateGantryList(groupIndex) {
      if (!groupIndex || ![1, 2, 3].includes(groupIndex)) {
        return;
      }
      
      const formKey = `quickForm${groupIndex}`;
      if (!this[formKey]) {
        return;
      }

      if (!this[formKey].textGantryGroup) {
        const stationListKey = `stationList${groupIndex}`;
        this[stationListKey] = this[stationListKey].filter(item => !item.fromTextGantry);
        this[stationListKey] = this.handleStationDataSource(this[stationListKey]);
        this.handleDrawMarkers(groupIndex);
        if(this[stationListKey].length > 0) {
          this.handleFly(this[stationListKey][0]);
        }
        this.pendingStationList = [];
        this[`repeatedInformation${groupIndex}`] = '';
        return;
      }

      const stationListKey = `stationList${groupIndex}`;
      const existIds = new Set(this[stationListKey].filter(item => !item.fromTextGantry).map(item => String(item.id)));

      let ids = this[formKey].textGantryGroup.replace(/\|/g, ',');
      let info = {
        page: {},
        condition: [{colName: "id", ruleType: "in", value: ids}],
        relation_condition: {
          relation: "AND",
          data: [{colName: "id", ruleType: "in", value: ids}]
        }
      };

      orderUtils.getAllStationByInfo(info).then(res => {
        if(res.data.state !== 'SUCCESS') return;
        let ls = res.data.data.map(item => ({ ...item, fromTextGantry: true }));
        const filtered = [];
        const removedIds = [];
        ls.forEach(item => {
          if (!existIds.has(String(item.id))) {
            filtered.push({ ...item, fromTextGantry: true });
          } else {
            removedIds.push(String(item.id));
          }
        });
        this[stationListKey] = this[stationListKey].filter(item => !item.fromTextGantry);
        this[stationListKey] = [...this[stationListKey], ...filtered];
        const manualList = this[stationListKey].filter(item => item.fromTextGantry);
        const otherList = this[stationListKey].filter(item => !item.fromTextGantry);
        const inputOrder = this[formKey].textGantryGroup.split('|').map(x => String(x).trim());
        manualList.sort((a, b) => inputOrder.indexOf(String(a.id).trim()) - inputOrder.indexOf(String(b.id).trim()));
        this[stationListKey] = [...otherList, ...manualList];
        this[stationListKey] = this.handleStationDataSource(this[stationListKey]);
        this.handleDrawMarkers(groupIndex);
        if(this[stationListKey].length > 0) {
          this.handleFly(this[stationListKey][0]);
        }

        if (removedIds.length > 0) {
          const arr = this[formKey].textGantryGroup.split('|').filter(id => id && !removedIds.includes(id));
          this[formKey].textGantryGroup = arr.join('|');
          const groupIds = this[formKey].textGantryGroup.split('|').filter(Boolean);
          const idToHex = {};
          this[stationListKey].forEach(item => {
            if (item.fromTextGantry) idToHex[String(item.id)] = item.gantryhex;
          });
          const hexArr = groupIds.map(id => idToHex[id]).filter(Boolean);
          this[formKey].textGantryHexGroup = hexArr.join('|');
          this[`repeatedInformation${groupIndex}`] = removedIds.join(',');
        } else {
          this[`repeatedInformation${groupIndex}`] = '';
        }
        this.pendingStationList = [];
      }).catch(err => {
        this.pendingStationList = [];
      });
    },
    handleClearGantry(groupIndex){
      if (!groupIndex || ![1, 2, 3].includes(groupIndex)) {
        return;
      }
      const formKey = `quickForm${groupIndex}`;
      if (!this[formKey]) {
        return;
      }
      const stationListKey = `stationList${groupIndex}`;
      this[stationListKey] = this[stationListKey].filter(item => !item.fromTextGantry);
      this[stationListKey] = this.handleStationDataSource(this[stationListKey]);
      this.handleDrawMarkers(groupIndex);
      this.storedGantryGroup = '';
      this[formKey].textGantryGroup = '';
      this[formKey].textGantryHexGroup = '';
      this[`repeatedInformation${groupIndex}`] = '';
    },
    /**
     * @Description:处理门架字段
     * @Author:Eirice
     * @Date: 2025-06-18 11:58:42
     */
    handleStationDataSource(list) {
      if (list.length > 0) {
        const firstItem = list[0];
        if (firstItem.grantry_type === "虚拟门架") {
          firstItem.dataSource = 1;
        } else if (firstItem.grantry_type === "省界门架") {
          firstItem.dataSource = 2;
        } else if (firstItem.grantry_type === "路段门架") {
          firstItem.dataSource = 3;
        }
        for (let i = 1; i < list.length - 1; i++) {
          list[i].dataSource = 3;
        }
        const lastItem = list[list.length - 1];
        if (lastItem.grantry_type === "虚拟门架") {
          lastItem.dataSource = 5;
        } else if (lastItem.grantry_type === "省界门架") {
          lastItem.dataSource = 4;
        } else if (lastItem.grantry_type === "路段门架") {
          lastItem.dataSource = 3;
        }
      }
      return list;
    },
    /**
     * @Description:门架点位上图
     * @Author:Eirice
     * @Date: 2025-06-18 14:03:05
     */
    handleDrawMarkers(groupIndex){
      if (!groupIndex || ![1, 2, 3].includes(groupIndex)) {
        return;
      }
      const stationListKey = `stationList${groupIndex}`;
      if (!this[stationListKey]) {
        return;
      }

      const pointConfig = {
        icon: require(`@/assets/mapIcon/point_ico.png`),
        select: true
      };
      const additionalMarkers = this[stationListKey].map((item, index) => ({
        ...pointConfig,
        name: item.tollgrantry_name?item.tollgrantry_name:item.tradenodename,
        point: handleMakePoint('', item.lng, item.lat),
        seq_id: index + 1,
        ...item
      }));
      drewMarkerKinds(this.handleMap, additionalMarkers,groupIndex);
      setTimeout(()=>{
        this.handleSpliceWayPoints(groupIndex)
      },500)
    },
    handleClear(groupIndex = 1){
      if (!groupIndex || ![1, 2, 3].includes(groupIndex)) {
        return;
      }
      const formKey = `quickForm${groupIndex}`;
      if (!this[formKey]) {
        return;
      }
      const stationListKey = `stationList${groupIndex}`;
      const repeatedInfoKey = `repeatedInformation${groupIndex}`;
      this[stationListKey] = [];
      clearMarkersByKind(this.handleMap,groupIndex)
      this[repeatedInfoKey] = '';
      this[formKey].textGantryGroup = '';
      this[formKey].textGantryHexGroup = '';
      this.storedGantryGroup = '';
      this.selectedGroups[groupIndex] = false;
      this.handleClearFeeByIndex(groupIndex);
    },
    handleClearFeeByIndex(groupIndex){
      const feeInfoKey = `feeInfo${groupIndex}`;
      Object.keys(this[feeInfoKey]).forEach(key=>{
        this[feeInfoKey][key]=0;
      })
    },

    /**
     * @Description:根据文本门架组查询门架信息
     * @Author:Eirice
     * @Date: 2025-06-18 15:16:12
     */
    handleByTextGantryGroup(ids, groupIndex = 1){
      if (!groupIndex || ![1, 2, 3].includes(groupIndex)) {
        return;
      }
      const formKey = `quickForm${groupIndex}`;
      if (!this[formKey]) {
        return;
      }
      let info={
        page:{},
        condition:[{colName: "id", ruleType: "in", value:ids}],
        relation_condition:{
          relation: "AND",
          data:[{colName: "id", ruleType: "in", value:ids}]
        }
      }
      orderUtils.getAllStationByInfo(info).then(res => {
        if(res.data.state !== 'SUCCESS') return;
        let ls = res.data.data.map(item => ({ ...item, fromTextGantry: true }));
        const stationListKey = `stationList${groupIndex}`;
        this[stationListKey] = this[stationListKey].filter(station => !station.fromTextGantry);
        const map = new Map();
        [...this[stationListKey], ...ls].forEach(item => {
          map.set(item.id, item);
        });
        this[stationListKey] = Array.from(map.values());
        this[stationListKey] = this.handleStationDataSource(this[stationListKey]);
        this.handleDrawMarkers(groupIndex);
        this.handleFly(this[stationListKey][0])
        const hexValues = ls.map(item => item.gantryhex).filter(hex => hex);
        this[formKey].textGantryHexGroup = hexValues.join('|');
      }).catch(err => {})
    },
    /**
     * @Description:门架选择
     * @Author:Eirice
     * @Date: 2025-06-18 15:16:12
     */
    handleFilterStation(list, groupIndex = 1){
      if (!groupIndex || ![1, 2, 3].includes(groupIndex)) {
        return;
      }

      const stationListKey = `stationList${groupIndex}`;
      const repeatedInfoKey = `repeatedInformation${groupIndex}`;

      if (!this[stationListKey]) {
        return;
      }

      const existIds = new Set(this[stationListKey].map(item => String(item.id)));
      const filtered = list.filter(item => !existIds.has(String(item.id)));
      const repeated = list.filter(item => existIds.has(String(item.id))).map(item => item.id);
      this[repeatedInfoKey] = repeated.length > 0 ? repeated.join(',') : '';
      this[stationListKey] = [...this[stationListKey], ...filtered];
      this[stationListKey] = this.handleStationDataSource(this[stationListKey]);
      this.handleDrawMarkers(groupIndex);
      if(this[stationListKey].length > 0) {
        this.handleFly(this[stationListKey][0]);
      }
    },

    /**
     * @Description:选择的门架子删除
     * @Author:Eirice
     * @Date: 2025-06-18 15:16:12
     */
    handleDelete(item, groupIndex = 1){
      if (!groupIndex || ![1, 2, 3].includes(groupIndex)) {
        return;
      }

      const formKey = `quickForm${groupIndex}`;
      if (!this[formKey]) {
        return;
      }

      const stationListKey = `stationList${groupIndex}`;
      const index = this[stationListKey].findIndex(i => i.id === item.id);
      if (index > -1) {
        this[stationListKey].splice(index, 1);
        this[stationListKey] = this.handleStationDataSource(this[stationListKey]);
        const gantryIds = this[formKey].textGantryGroup.split('|').filter(id => id.trim());
        if (gantryIds.includes(item.id.toString())) {
          const updatedIds = gantryIds.filter(id => id !== item.id.toString());
          this[formKey].textGantryGroup = updatedIds.join('|');
          this.storedGantryGroup = this[formKey].textGantryGroup;

          if (this[formKey].textGantryGroup) {
            let queryIds = this[formKey].textGantryGroup.replace(/\|/g, ',');
            this.handleByTextGantryGroup(queryIds, groupIndex);
          } else {
            this[formKey].textGantryHexGroup = '';
          }
        }
        this.handleDrawMarkers(groupIndex)
        if (this[stationListKey].length === 0) {
          this[`repeatedInformation${groupIndex}`] = '';
        }
      }
      this.handleDrawMarkers(groupIndex)
    },
    /**
     * @Description:拖拽结束后的回调
     * @Author:Eirice
     * @Date: 2025-06-18 15:16:12
     */
    onDragEnd(groupIndex) {
      if (!groupIndex || ![1, 2, 3].includes(groupIndex)) {
        return;
      }

      const stationListKey = `stationList${groupIndex}`;
      if (!this[stationListKey]) {
        return;
      }

      this[stationListKey] = this.handleStationDataSource(this[stationListKey]);
    },
    initMineMap(){
      let options = {
        container: 'qck_map',
        center: [108.9459227350201, 34.34493397633217],
      }
      baseMap = new MapUtils(options);
      this.handleMap = baseMap.initMap();
    },
    /**
     * @Description:获取公共提交时表单参数匹配选项
     * @Author:Eirice
     * @Date: 2025-06-18 15:16:12
     */
    getPublicColNames(){
      orderUtils.getOrderFormList().then(res=>{
        if(res.data.state!=='SUCCESS') return
        let ls= res.data.data
        let ops = ls.srv_cols
        this.useOptions={...filterListByOption(ops,this.useOptions)}
      }).catch(err => {})
    },
    /**
     * @Description:加载地图资源
     * @Author:Eirice
     * @Date: 2025-06-18 15:16:12
     */
    asyncLoadMap(){
      return new Promise(function (resolve, reject) {
        if (typeof (BMapGL) !== 'undefined') return resolve(BMapGL)
        if (typeof (BMap) !== "undefined") {return  resolve(BMap)}
        let script = document.createElement('script')
        script.type = 'text/javascript'
        script.src = `${window.APP_CONFIG.serverUrl}&callback=init`
        script.onerror = reject
        document.head.appendChild(script)
        const timer = setInterval(() => {
          if (BMapGL||BMap) {
            BMapGL ? resolve(BMapGL) : resolve(BMap)
            clearInterval(timer)
          }
        }, 500)
      })
    },


    /**
     * @Description:处理公共校验规则信息
     * @Author:Eirice
     * @Date: 2025-06-18 15:16:12
     */
    handlePublicTest(groupIndex){
      if (!groupIndex || ![1, 2, 3].includes(groupIndex)) {
        return;
      }

      const formKey = `quickForm${groupIndex}`;
      if (!this[formKey]) {
        return;
      }
    },

    /**
     * @Description:处理携带hex文本进入时查询出对应的门架序列数据
     * @Author:Eirice
     * @Date: 2025-06-18 15:16:12
     */
    handleHexGroupInput(value, groupIndex = 1) {
      this.handlePublicTest(groupIndex);
      const formKey = `quickForm${groupIndex}`;
      if (!value) {
        this[formKey].textGantryGroup = '';
        this.pendingStationList = [];
        const stationListKey = `stationList${groupIndex}`;
        this[stationListKey] = this[stationListKey].filter(item => !item.fromTextGantry);
        this[stationListKey] = this.handleStationDataSource(this[stationListKey]);
        this.handleDrawMarkers(groupIndex);
        if(this[stationListKey].length > 0) {
          this.handleFly(this[stationListKey][0]);
        }
        return;
      }

      const hexArray = value.split('|').filter(item => item.trim());
      const uniqueHexArray = [...new Set(hexArray)];

      this[formKey].textGantryHexGroup = uniqueHexArray.join('|');

      let ids = this[formKey].textGantryHexGroup.replace(/\|/g, ',');

      let info={
        page:{},
        condition:[{colName: "gantryhex", ruleType: "in", value:ids}],
        relation_condition:{
          relation: "AND",
          data:[{colName: "gantryhex", ruleType: "in", value:ids}]
        }
      }
      orderUtils.getAllStationByInfo(info).then(res => {
        if(res.data.state !== 'SUCCESS') { this.pendingStationList = []; return; }
        let ls = res.data.data;

        const inputOrder = uniqueHexArray.map(x => String(x).trim());
        ls.sort((a, b) => inputOrder.indexOf(String(a.gantryhex).trim()) - inputOrder.indexOf(String(b.gantryhex).trim()));
        this.pendingStationList = ls;
        const gantryIds = ls.map(item => item.id).filter(id => id);
        this[formKey].textGantryGroup = gantryIds.join('|');
      }).catch(err => { this.pendingStationList = []; });
    },


    /**
     * @Description:快速计费提交校验
     * @Author:Eirice
     * @Date: 2025-06-19 09:21:20
     */
    handleSubmitQuick(){
      this.$refs.baseForm.validate((valid) => {
        if (valid) {
          const check=Object.values(this.selectedGroups).filter(d=>{return d});
          if(!check||check.length===0){
            Message({
              type: 'warning',
              message: '请至少选择一个门架列表进行计费'
            });
            return;
          }
          const hasStationData = [1, 2, 3].some(groupNum => {
            const stationListKey = `stationList${groupNum}`;
            return this[stationListKey] && this[stationListKey].length > 0;
          });

          if (!hasStationData) {
            Message({
              type: 'warning',
              message: '门架列表数据不能为空'
            });
            return;
          }

          [1, 2, 3].forEach(groupNum => {
            const stationListKey = `stationList${groupNum}`;
            if(this[stationListKey] && this[stationListKey].length > 0 && this.selectedGroups[groupNum]) {
              const inStation= this[stationListKey][0];
              const exStation= this[stationListKey][this[stationListKey].length-1];
              let obj={
                gantryCount:this[stationListKey].length,
                gantryGroup:handleFilterParams('id',this[stationListKey],'|'),
                gantryHexGroup:handleFilterParams('gantryhex',this[stationListKey],'|'),
                dataSource: handleFilterParams('dataSource',this[stationListKey],'|'),
                mediaType:this.baseForm.mediaType,
                vehicleType:this.baseForm.vehicleType,
                vehicleUserType:this.baseForm.vehicleUserType,
                vehicleClass:this.baseForm.vehicleClass,
                rateProgramVer:this.baseForm.rateProgramVer,
                rateVer:this.baseForm.rateVer,
                enStationId:inStation.grantry_type==='收费站'?inStation.id:'',
                exStationId:exStation.grantry_type==='收费站'?exStation.id:'',
              }
              this.quickBillingSubmit(obj, groupNum)
            }
          });
        } else {
          Message({
            type: 'error',
            message: '请检查必填参数信息'
          });
          return false;
        }
      });
    },
    /**
     * @Description:每次计费前手动清空所有计费结果
     * @Author:Eirice
     * @Date: 2025-07-11 15:20:32
     */
    handleCancelFeeInfo(){
      const base=['1','2','3']
      const selectKeys = Object.keys(this.selectedGroups).filter(key =>{ return Number(this.selectedGroups[key])});
      let uniKe= base.filter(key => {return !selectKeys.includes(key)});
       uniKe.map(item=>{
         const feeInfoKey = `feeInfo${item}`;
         Object.keys(this[feeInfoKey]).forEach(key=>{
           this[feeInfoKey][key]=0;
         })
       })
    },
    /**
     * @Description:快速计费信息提交
     * @Author:Eirice
     * @Date: 2025-06-19 09:26:20
     */
    quickBillingSubmit(obj, groupIndex){
      if (!groupIndex || ![1, 2, 3].includes(groupIndex)) {
        return;
      }
      const feeInfoKey = `feeInfo${groupIndex}`;
      if (!this[feeInfoKey]) {
        return;
      }
      this.handleCancelFeeInfo();
      orderUtils.handleQuickBilling(obj).then(res => {
        if(res.data.code !== 0) return;
        Message({
          type: 'success',
          message: '计费查询成功'
        });
        if(res.data.messageInfo && res.data.messageInfo.tollDetail){
          let ls=res.data.messageInfo.tollDetail[0]
          this[feeInfoKey].fee=ls?.fee;
          this[feeInfoKey].payFee=ls?.payFee;
          this[feeInfoKey].discountFee=ls?.discountFee;
        }
      }).catch(err => {})
    },
    /**
     * @Description:处理选择框变化
     * @Author:Eirice
     * @Date: 2025-06-18 15:16:12
     */
    handleGroupSelect(groupIndex) {
      if (!groupIndex || ![1, 2, 3].includes(groupIndex)) {
        return;
      }

      if (!this.selectedGroups) {
        return;
      }
    },
  },
  created() {
    this.debouncedHandleGantryGroupInput = this.debounce(this.handleGantryGroupInput);
    this.debouncedHandleHexGroupInput = this.debounce(this.handleHexGroupInput);
  },
  mounted(){
    this.getPublicColNames();
    this.asyncLoadMap();
    setTimeout(()=>{this.initMineMap()},500)
  }
}
</script>


<style scoped lang="scss">
@use "./quick";

</style>