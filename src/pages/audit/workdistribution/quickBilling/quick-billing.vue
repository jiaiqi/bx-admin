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
      <!-- 三个门架列表容器 -->
      <div style="height: 70%; overflow-y: auto;">
        <!-- 序列1组门架列表 -->
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

        <!-- 序列2组门架列表 -->
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

        <!-- 序列3组门架列表 -->
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

      <!-- 计费按钮和结果显示区域 -->
      <div style="height: 30%; border-top: 1px solid #eee; padding-top: 0.5rem;" class="flw_rest">
        <!-- 稽核计费按钮 -->
        <div class="handle_sub" style="margin-bottom: 0.5rem;">
          <el-button style="width:100%" type="primary" plain size="mini" @click="handleSubmitQuick()">稽核计费</el-button>
        </div>
        
        <!-- 计费结果显示 -->
        <div style="display: flex; flex-direction: row; gap: 0.5rem; height: calc(100% - 60px);">
          <!-- 序列1计费结果 -->
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

          <!-- 序列2计费结果 -->
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

          <!-- 序列3计费结果 -->
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
      currentGroupIndex: 1, // 当前选中的组索引
      selectedGroups: {
        1: false,
        2: false,
        3: false
      },
      // feeInfo:{
      //   fee:0,    // 实收金额
      //   discountFee:0, //优惠金额
      //   payFee:0, //应收金额
      // },
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
      pendingStationList: [], // 新增：暂存待更新的门架列表
      debounceTimer: null, // 添加防抖定时器
      debouncedHandleGantryGroupInput: null, // 添加防抖处理后的方法声明
      debouncedHandleHexGroupInput: null, // 添加hex输入框的防抖处理后的方法声明
      storedGantryGroup: '', // 存储textGantryGroup的值
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
        mediaType:'', //通行介质
        vehicleType:'',//稽核车型
        vehicleUserType:'', //车辆用户类型
        vehicleClass:'', //车种
        rateProgramVer:'', //计费模块版本号
        rateVer:'' // 费率版本号
      },
      quickForm1:{
        textGantryGroup:'', //人录入门架序列
        textGantryHexGroup:'', //人录入门架序列hex
        gantryCount:0,
        gantryGroup:'',    //门架集合
        gantryHexGroup:'', //hex
        dataSource:'', //数据源集合
      },
      quickForm2:{
        textGantryGroup:'', //人录入门架序列
        textGantryHexGroup:'', //人录入门架序列hex
        gantryCount:0,
        gantryGroup:'',    //门架集合
        gantryHexGroup:'', //hex
        dataSource:'', //数据源集合
      },
      quickForm3:{
        textGantryGroup:'', //人录入门架序列
        textGantryHexGroup:'', //人录入门架序列hex
        gantryCount:0,
        gantryGroup:'',    //门架集合
        gantryHexGroup:'', //hex
        dataSource:'', //数据源集合
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
    //绘制路线
     handleDrawLine(list,grindex){
       const colorIdx=['#3af584','#235ef1','#8d49f5']
      if (!list || !this.handleMap) {
        console.warn('无效的路线数据或地图对象未初始化')
        return
      }
      try {
        let features = []
        features.push(makeFeature('LineString', list, {"name": "linIcon"}))
        let source = makeFeatureCollection(features)
        setColorLine(this.handleMap,colorIdx[grindex-1],list,grindex)
      } catch (error) {
        console.error('绘制路线时发生错误:', error)
      }
    },

    /**
     * @Description:获取百度路径规划数据信息
     * @Author:Eirice
     * @Date: 2025-06-06 14:29:34
     */
    async getRoutesByBaiDu(customParams = null){
      if (!this.handleMap) {
        console.warn('地图对象未初始化')
        return []
      }

      let ak=window.APP_CONFIG.RouteAK?window.APP_CONFIG.RouteAK:''
      let urls=window.APP_CONFIG.viRoute;

      // 如果没有传入参数，则从drivingPoint构建参数
      const params = customParams

      let line= await orderUtils.getBaiduMapRoute(ak,urls,params);
      const lines= this.handleFilterLine(line)
      return lines
    },

    //路线数据过滤
    handleFilterLine(line){
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
    },
    //途径点多个分隔及多段路查询
   async handleSpliceWayPoints(groupIndex) {
      this.lineLoading=true
      if (!this.handleMap) {
        console.warn('地图对象未初始化')
        return
      }
      const stationListKey = `stationList${groupIndex}`;
      const MAX_WAYPOINTS = 5
      const allPoints =[... this[stationListKey]]
       if(allPoints.length ===0){
         return
       }
      const splitInfo = window.APP_CONFIG.splitType

      // 如果总点数小于等于最大值+2（起点和终点），直接规划
      if (allPoints.length <= MAX_WAYPOINTS + 2) {
        // 直接使用getRoutesByBaiDu进行规划
        const params = {
          origin: `${allPoints[0].lat},${allPoints[0].lng}`,
          destination: `${allPoints[allPoints.length - 1].lat},${allPoints[allPoints.length - 1].lng}`,
          tactics: 0,
          waypoints: allPoints.slice(1, -1).map(point => `${point.lat},${point.lng}`).join(splitInfo),
          inputCrs: 'wgs84ll',
          outputCrs: 'wgs84ll'
        }

        const lines = await this.getRoutesByBaiDu(params)

        // 绘制路线
        if (lines && lines.length > 0) {
          this.lineLoading=false
          const linePoints = lines.map(point => new BMap.Point(point.lng, point.lat))
          this.handleDrawLine(linePoints,groupIndex)
        }
        return
      }

      const segments = []
      let currentSegment = []

      // 将点分组，每个分段最多包含MAX_WAYPOINTS个途径点,由于起点，终点不算在途径点数量中，
     // 所以步长的总量时途径点+2的数量
      for (let i = 0; i < allPoints.length; i++) {
        currentSegment.push(allPoints[i])
        if (currentSegment.length === MAX_WAYPOINTS + 2) {
          segments.push([...currentSegment])
         //todo 为了保证数据的连续性，使用前一段数据的最后一个点作为下一段数据的起点使用
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

        const lines = await this.getRoutesByBaiDu(params)

        if (lines && lines.length > 0) {
          const currentRoute = lines.map(point => [point.lng, point.lat])

          // 合并路线（除了最后一段，其他段需要去掉最后一个点，避免重复）
          if (i < segments.length - 1) {
            allRoutes = allRoutes.concat(currentRoute.slice(0, -1))
          } else {
            allRoutes = allRoutes.concat(currentRoute)
          }
        }
        //最后一次并发接受且结果回来后
        if(i=segments.length-1&&lines){
          this.lineLoading=false
        }
      }

      // 绘制完整路线
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

    //门架序列数据处理
    handleGantryGroupInput(value, groupIndex) {
      this.handlePublicTest(groupIndex);
      const formKey = `quickForm${groupIndex}`;
      if (!value) {
        // 清空hex值
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

      // 使用 | 分割字符串并去重
      const gantryArray = value.split('|').filter(item => item.trim());
      const uniqueGantryArray = [...new Set(gantryArray)];

      // 更新输入框的值和存储值
      this[formKey].textGantryGroup = uniqueGantryArray.join('|');
      this.storedGantryGroup = this[formKey].textGantryGroup;

      // 将|替换为英文逗号后传递给handleByTextGantryGroup
      let ids = this[formKey].textGantryGroup.replace(/\|/g, ',');

      // 获取新的门架数据，但只暂存，不直接更新stationList
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
        // 新查回的数据加fromTextGantry: true
        let ls = res.data.data.map(item => ({ ...item, fromTextGantry: true }));
        // 按输入顺序排序
        const inputOrder = uniqueGantryArray.map(x => String(x).trim());
        console.log('工人录入textGantryGroup:', inputOrder);
        console.log('排序前的textGantryGroup:', ls.map(x => String(x.id).trim()));
        ls.sort((a, b) => inputOrder.indexOf(String(a.id).trim()) - inputOrder.indexOf(String(b.id).trim()));
        console.log('排序后的获数据:', ls.map(x => String(x.id).trim()));
        this.pendingStationList = ls;
        // 根据查询返回的数据更新textGantryHexGroup
        const hexValues = ls.map(item => item.gantryhex).filter(hex => hex);
        this[formKey].textGantryHexGroup = hexValues.join('|');

      }).catch(err => { this.pendingStationList = []; });
    },
    //更新门架按钮点击按钮时触发门架查询
    handleUpdateGantryList(groupIndex) {
      // 添加安全检查
      if (!groupIndex || ![1, 2, 3].includes(groupIndex)) {
        console.error('无效的groupIndex:', groupIndex);
        return;
      }
      
      const formKey = `quickForm${groupIndex}`;
      if (!this[formKey]) {
        console.error(`选择的表单${formKey} 不存在`);
        return;
      }

      // 如果没有输入门架序列，清除所有人工录入门架
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

      // 获取非人工录入门架ID
      const stationListKey = `stationList${groupIndex}`;
      const existIds = new Set(this[stationListKey].filter(item => !item.fromTextGantry).map(item => String(item.id)));

      // 根据当前的textGantryGroup重新查询数据
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

        // 新查回的数据加fromTextGantry: true
        let ls = res.data.data.map(item => ({ ...item, fromTextGantry: true }));

        // 过滤新门架，找出未重复的
        const filtered = [];
        const removedIds = [];
        ls.forEach(item => {
          if (!existIds.has(String(item.id))) {
            filtered.push({ ...item, fromTextGantry: true });
          } else {
            removedIds.push(String(item.id));
          }
        });

        // 移除原有人工录入门架
        this[stationListKey] = this[stationListKey].filter(item => !item.fromTextGantry);
        this[stationListKey] = [...this[stationListKey], ...filtered];
        // 对人工录入门架排序，并放在stationList后面
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

        // 同步textGantryGroup
        if (removedIds.length > 0) {
          const arr = this[formKey].textGantryGroup.split('|').filter(id => id && !removedIds.includes(id));
          this[formKey].textGantryGroup = arr.join('|');
          // 同步textGantryHexGroup门架
          const groupIds = this[formKey].textGantryGroup.split('|').filter(Boolean);
          const idToHex = {};
          this[stationListKey].forEach(item => {
            if (item.fromTextGantry) idToHex[String(item.id)] = item.gantryhex;
          });
          const hexArr = groupIds.map(id => idToHex[id]).filter(Boolean);
          this[formKey].textGantryHexGroup = hexArr.join('|');
          // 记录重复信息
          this[`repeatedInformation${groupIndex}`] = removedIds.join(',');
        } else {
          this[`repeatedInformation${groupIndex}`] = '';
        }

        // 更新pendingStationList为空，因为已经处理完了
        this.pendingStationList = [];
      }).catch(err => {
        this.pendingStationList = [];
      });
    },
    //门架序列点击清除
    handleClearGantry(groupIndex){
      // 添加安全检查
      if (!groupIndex || ![1, 2, 3].includes(groupIndex)) {
        console.error('无效的groupIndex:', groupIndex);
        return;
      }
      
      const formKey = `quickForm${groupIndex}`;
      if (!this[formKey]) {
        console.error(`表单对象 ${formKey} 不存在`);
        return;
      }

      // 只移除人工录入门架
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
        //第一条数据
        const firstItem = list[0];
        if (firstItem.grantry_type === "虚拟门架") {
          firstItem.dataSource = 1;
        } else if (firstItem.grantry_type === "省界门架") {
          firstItem.dataSource = 2;
        } else if (firstItem.grantry_type === "路段门架") {
          firstItem.dataSource = 3;
        }

        //中间的数据
        for (let i = 1; i < list.length - 1; i++) {
          list[i].dataSource = 3;
        }

        //最后一条数据
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
      // 添加安全检查
      if (!groupIndex || ![1, 2, 3].includes(groupIndex)) {
        console.error('无效的groupIndex:', groupIndex);
        return;
      }
      
      const stationListKey = `stationList${groupIndex}`;
      if (!this[stationListKey]) {
        console.error(`门架列表 ${stationListKey} 不存在`);
        return;
      }

      // 构建点位配置
      const pointConfig = {
        icon: require(`@/assets/mapIcon/point_ico.png`),
        select: true
      };
      // 构建最终的点位数组
      const additionalMarkers = this[stationListKey].map((item, index) => ({
        ...pointConfig,
        name: item.tollgrantry_name?item.tollgrantry_name:item.tradenodename,
        point: handleMakePoint('', item.lng, item.lat),
        seq_id: index + 1,  // 添加 seq 字段，从 1 开始
        ...item
      }));
      // 重新绘制地图标记
      drewMarkerKinds(this.handleMap, additionalMarkers,groupIndex);
      setTimeout(()=>{
        this.handleSpliceWayPoints(groupIndex)
      },500)
    },
    handleClear(groupIndex = 1){
      // 添加安全检查
      if (!groupIndex || ![1, 2, 3].includes(groupIndex)) {
        console.error('无效的groupIndex:', groupIndex);
        return;
      }
      
      const formKey = `quickForm${groupIndex}`;
      if (!this[formKey]) {
        console.error(`表单对象 ${formKey} 不存在`);
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

     //清空门架后主动清除被清空门架的计费数据
    handleClearFeeByIndex(groupIndex){
      const feeInfoKey = `feeInfo${groupIndex}`;
      Object.keys(this[feeInfoKey]).forEach(key=>{
        this[feeInfoKey][key]=0;
      })
    },

    //人工录入门架子序列后查询们门架子
    handleByTextGantryGroup(ids, groupIndex = 1){
      // 添加安全检查
      if (!groupIndex || ![1, 2, 3].includes(groupIndex)) {
        console.error('无效的groupIndex:', groupIndex);
        return;
      }
      
      const formKey = `quickForm${groupIndex}`;
      if (!this[formKey]) {
        console.error(`表单对象 ${formKey} 不存在`);
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
        // 新查回的数据加fromTextGantry: true
        let ls = res.data.data.map(item => ({ ...item, fromTextGantry: true }));
        // 只移除通过textGantryGroup查询回来的门架
        const stationListKey = `stationList${groupIndex}`;
        this[stationListKey] = this[stationListKey].filter(station => !station.fromTextGantry);
        // 合并新查回的数据和原有的（fromTextGantry: false），用id去重
        const map = new Map();
        [...this[stationListKey], ...ls].forEach(item => {
          map.set(item.id, item);
        });
        this[stationListKey] = Array.from(map.values());
        // 处理数据源
        this[stationListKey] = this.handleStationDataSource(this[stationListKey]);
        // 更新地图标记
        this.handleDrawMarkers(groupIndex);
        this.handleFly(this[stationListKey][0])
        // 根据查询返回的数据更新textGantryHexGroup
        const hexValues = ls.map(item => item.gantryhex).filter(hex => hex);
        this[formKey].textGantryHexGroup = hexValues.join('|');
      }).catch(err => {})
    },
    //门架选择
    handleFilterStation(list, groupIndex = 1){
      // 添加安全检查
      if (!groupIndex || ![1, 2, 3].includes(groupIndex)) {
        console.error('无效的groupIndex:', groupIndex);
        return;
      }
      
      const stationListKey = `stationList${groupIndex}`;
      const repeatedInfoKey = `repeatedInformation${groupIndex}`;
      
      if (!this[stationListKey]) {
        console.error(`门架列表 ${stationListKey} 不存在`);
        return;
      }

      // 现有门架ID集合
      const existIds = new Set(this[stationListKey].map(item => String(item.id)));
      // 过滤新门架，只保留未存在的
      const filtered = list.filter(item => !existIds.has(String(item.id)));
      // 记录被去重掉的ID
      const repeated = list.filter(item => existIds.has(String(item.id))).map(item => item.id);
      this[repeatedInfoKey] = repeated.length > 0 ? repeated.join(',') : '';
      // 合并
      this[stationListKey] = [...this[stationListKey], ...filtered];
      this[stationListKey] = this.handleStationDataSource(this[stationListKey]);
      this.handleDrawMarkers(groupIndex);
      if(this[stationListKey].length > 0) {
        this.handleFly(this[stationListKey][0]);
      }
      console.log('处理后的门架列表：', this[stationListKey]);
    },

    //选择的门架子删除
    handleDelete(item, groupIndex = 1){
      // 添加安全检查
      if (!groupIndex || ![1, 2, 3].includes(groupIndex)) {
        console.error('无效的groupIndex:', groupIndex);
        return;
      }
      
      const formKey = `quickForm${groupIndex}`;
      if (!this[formKey]) {
        console.error(`表单对象 ${formKey} 不存在`);
        return;
      }

      const stationListKey = `stationList${groupIndex}`;
      const index = this[stationListKey].findIndex(i => i.id === item.id);
      if (index > -1) {
        this[stationListKey].splice(index, 1);
        this[stationListKey] = this.handleStationDataSource(this[stationListKey]);
        //todo 获取存在于人工序列中的被删除门架序列号
        const gantryIds = this[formKey].textGantryGroup.split('|').filter(id => id.trim());
        if (gantryIds.includes(item.id.toString())) {
          // 如果存在，则从textGantryGroup中移除该ID
          const updatedIds = gantryIds.filter(id => id !== item.id.toString());
          this[formKey].textGantryGroup = updatedIds.join('|');
          this.storedGantryGroup = this[formKey].textGantryGroup;

          if (this[formKey].textGantryGroup) {
            let queryIds = this[formKey].textGantryGroup.replace(/\|/g, ',');
            this.handleByTextGantryGroup(queryIds, groupIndex);
          } else {
            // 如果textGantryGroup为空，则清空textGantryHexGroup
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
    //拖拽结束后的回调
    onDragEnd(groupIndex) {
      // 添加安全检查
      if (!groupIndex || ![1, 2, 3].includes(groupIndex)) {
        console.error('无效的groupIndex:', groupIndex);
        return;
      }
      
      const stationListKey = `stationList${groupIndex}`;
      if (!this[stationListKey]) {
        console.error(`门架列表 ${stationListKey} 不存在`);
        return;
      }

      this[stationListKey] = this.handleStationDataSource(this[stationListKey]);
      console.log('排序后的门架列表：', this[stationListKey]);
    },
    initMineMap(){
      let options = {
        container: 'qck_map',
        center: [108.9459227350201, 34.34493397633217],
      }
      baseMap = new MapUtils(options);
      this.handleMap = baseMap.initMap();
    },
    //获取公共提交时表单参数匹配选项
    getPublicColNames(){
      orderUtils.getOrderFormList().then(res=>{
        if(res.data.state!=='SUCCESS') return
        let ls= res.data.data
        let ops = ls.srv_cols
        this.useOptions={...filterListByOption(ops,this.useOptions)}
        console.log(this.useOptions)
      }).catch(err => {})
    },
    //加载地图资源
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


    //处理公共校验规则信息
    handlePublicTest(groupIndex){
      // 添加安全检查
      if (!groupIndex || ![1, 2, 3].includes(groupIndex)) {
        console.error('无效的groupIndex:', groupIndex);
        return;
      }

      const formKey = `quickForm${groupIndex}`;
      if (!this[formKey]) {
        console.error(`不存在的人工 ${formKey}`);
        return;
      }
    },

    //处理携带hex文本进入时查询出对应的门架序列数据
    handleHexGroupInput(value, groupIndex = 1) {
      this.handlePublicTest(groupIndex);
      const formKey = `quickForm${groupIndex}`;
      if (!value) {
        // 清空指定列的人工序列
        this[formKey].textGantryGroup = '';
        this.pendingStationList = [];
        // 当指定列的HEX被清除时，对应加入到指定列表的数据也需要被清除
        const stationListKey = `stationList${groupIndex}`;
        this[stationListKey] = this[stationListKey].filter(item => !item.fromTextGantry);
        this[stationListKey] = this.handleStationDataSource(this[stationListKey]);
        this.handleDrawMarkers(groupIndex);
        if(this[stationListKey].length > 0) {
          this.handleFly(this[stationListKey][0]);
        }
        return;
      }

      // 使用 | 分割字符串并去重
      const hexArray = value.split('|').filter(item => item.trim());
      const uniqueHexArray = [...new Set(hexArray)];

      // 更新输入框的值
      this[formKey].textGantryHexGroup = uniqueHexArray.join('|');

      // 将|替换为英文逗号后传递给handleGetStationByHex
      let ids = this[formKey].textGantryHexGroup.replace(/\|/g, ',');
      // 查询HEX对应的门架，查回数据只暂存，不直接更新stationList

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

        // 按输入顺序排序
        const inputOrder = uniqueHexArray.map(x => String(x).trim());
        console.log('人工录入:', inputOrder);
        console.log('排序前:', ls.map(x => String(x.gantryhex).trim()));
        ls.sort((a, b) => inputOrder.indexOf(String(a.gantryhex).trim()) - inputOrder.indexOf(String(b.gantryhex).trim()));
        console.log('排序后:', ls.map(x => String(x.gantryhex).trim()));
        this.pendingStationList = ls;
        // 将获取到的门架ID拼接到textGantryGroup
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
          //检查是否有门架列表被选择
          const check=Object.values(this.selectedGroups).filter(d=>{return d});
          if(!check||check.length===0){
            Message({
              type: 'warning',
              message: '请至少选择一个门架列表进行计费'
            });
            return;
          }
          // 检查是否有门架数据
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
          
          // 为每个有门架数据的序列组进行计费
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
              console.log(`序列${groupNum}计费参数`,obj)
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
      console.log(`<UNK>${groupIndex}<UNK>`,this.selectedGroups)
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
    // 处理选择框变化
    handleGroupSelect(groupIndex) {
      // 添加安全检查
      if (!groupIndex || ![1, 2, 3].includes(groupIndex)) {
        console.error('无效的groupIndex:', groupIndex);
        return;
      }
      
      if (!this.selectedGroups) {
        console.error('selectedGroups 对象不存在');
        return;
      }

      console.log(`序列${groupIndex}选择状态:`, this.selectedGroups[groupIndex]);
    },
  },
  created() {
    // 创建防抖处理后的方法
    this.debouncedHandleGantryGroupInput = this.debounce(this.handleGantryGroupInput);
    this.debouncedHandleHexGroupInput = this.debounce(this.handleHexGroupInput);
  },
  mounted(){
    // sessionStorage.removeItem('bx_auth_ticket');
    // sessionStorage.setItem('bx_auth_ticket','xabxdzkj-15d289bb-a896-4fc4-b2ed-2a47861c8084');
    this.getPublicColNames();
    this.asyncLoadMap();
    setTimeout(()=>{this.initMineMap()},500)
  }
}
</script>


<style scoped lang="scss">
@use "./quick";

</style>