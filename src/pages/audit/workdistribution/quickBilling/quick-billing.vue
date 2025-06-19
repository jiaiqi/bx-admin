<template>
  <div class="quick_content">
    <div class="quick_row" style="width:80%">
      <div class="quick_map" id="qck_map"></div>
      <div class="quick_form">
        <div class="qk_row" style="height:51%">
          <el-form :model="quickForm" ref="quickForm"  :rules="quickRules"  label-width="auto" class="qk_ruleForm">
            <el-row style="border:none">
              <el-col :span="6">
                <el-form-item label="车型" prop="vehicleType">
                  <el-select v-model="quickForm.vehicleType" clearable placeholder="请选择" size="mini" style="width: 100%">
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
                <el-select v-model="quickForm.vehicleClass" clearable placeholder="请选择" size="mini" style="width: 100%">
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
                  <el-select v-model="quickForm.vehicleUserType" clearable placeholder="请选择" size="mini" style="width: 100%">
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
                  <el-select v-model="quickForm.mediaType" placeholder="请选择" clearable size="mini" style="width: 100%">
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
                  <el-input v-model="quickForm.rateProgramVer" placeholder="请输入" clearable size="mini"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="费率版本号" prop="rateVer">
                   <el-input v-model="quickForm.rateVer" placeholder="请输入" clearable size="mini"></el-input>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </div>
        <div class="qk_row" style="height:48%;margin-top:0.625rem">
          <div class="qk_tl">人工录入门架序列：</div>
           <el-form label-width="auto" class="text_ruleForm" style="height: auto">
             <el-row>
               <el-col :span="6">
                 <el-form-item label="门架序列">
                   <el-input type="textarea"  @clear="handleClearGantry" v-model="quickForm.textGantryGroup" size="mini" style="width:100%" clearable placeholder="输入的多个序列使用|分隔" @input="debouncedHandleGantryGroupInput"></el-input>
                 </el-form-item>
               </el-col>
               <el-col :span="6">
                 <el-form-item label="门架序列(HEX)">
                   <el-input type="textarea" v-model="quickForm.textGantryHexGroup" size="mini" style="width:100%" clearable placeholder="输入的多个hex使用|分隔" @input="debouncedHandleHexGroupInput" @clear="handleClearGantry"></el-input>
                 </el-form-item>
               </el-col>
               <el-col :span="6">
                 <el-form-item>
                   <el-button type="primary" plain size="mini" @click="handleUpdateGantryList">更新门架列表</el-button>
                 </el-form-item>
               </el-col>
             </el-row>
<!-- 重复信息提示-->
             <el-row v-if="repeatedInformation.length>0">
               <div class="repeat_info">
               <span>
                 已经去掉重复数据：
               </span>
                 <span>
                 {{repeatedInformation}}
               </span>
               </div>
             </el-row>
           </el-form>
        </div>
      </div>
    </div>
    <div class="quick_row st_list_cot" style="width: 19.5%">
      <div class="st_list" style="height:80%;margin-bottom:0.625rem">
        <div class="st_tl_info">
          <span>已选门架列表{{'('+stationList.length+')'+'个'}}</span>
          <span> <el-button type="primary" plain size="mini" @click="listVisible=true">添加门架</el-button></span>
          <span> <el-button type="primary" plain size="mini" @click="handleClear">清空门架</el-button></span>
        </div>
        <div class="chose_lise">
          <draggable v-model="stationList" handle=".st_tran" @end="onDragEnd">
            <div class="ch_row" v-for="(item,index) in stationList" :key="item.id" @click="handleFly(item)">
              <span class="st_tran"><i class="el-icon-rank"></i></span>
              <div>
                <span class="st_cl">{{index+1}}</span>
                <span class="st_title">{{item.name?item.name:item.tradenodename}}</span>
              </div>
              <span class="st_del" style="cursor: pointer" @click="handleDelete(item)"><i class="el-icon-delete"></i></span>
            </div>
          </draggable>
        </div>
      </div>
      <div class="st_list" style="height:16%">
        <div class="handle_sub">
          <el-button style="width:70%" type="primary" plain size="mini" @click="handleSubmitQuick">稽核计费</el-button>
        </div>
        <div class="des_tl">
          <span style="margin-right:0.625rem">应收金额：</span>
          <span>{{feeInfo.payFee}}</span>
        </div>
        <div class="des_tl">
          <span style="margin-right:0.625rem">实收金额：</span>
          <span>{{feeInfo.fee}}</span>
        </div>
        <div class="des_tl">
          <span style="margin-right:0.625rem">优惠金额：</span>
          <span>{{feeInfo.discountFee}}</span>
        </div>
      </div>
    </div>
    <StationList :stVisible.sync="listVisible" @getChoseStations="handleFilterStation"/>
  </div>
</template>

<script>
import StationList from "@/pages/audit/workdistribution/map/stationList.vue";
import MapUtils from "@/pages/audit/workdistribution/map/mapUtils";
import {filterListByOption} from "@/pages/audit/workdistribution/workFlow/filterList";
import {handleFilterParams} from '@/pages/audit/workdistribution/map/filterServiceCol'
import {
  drawMapMarkersAndLabel,
  FlyTo,
  removeOverlay,
  handleMakePoint,
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
      repeatedInformation:'',
      feeInfo:{
        fee:0,    // 实收金额
        discountFee:0, //优惠金额
        payFee:0, //应收金额
      },
      listVisible:false,
      stationList:[],
      pendingStationList: [], // 新增：暂存待更新的门架列表
      debounceTimer: null, // 添加防抖定时器
      debouncedHandleGantryGroupInput: null, // 添加防抖处理后的方法声明
      debouncedHandleHexGroupInput: null, // 添加hex输入框的防抖处理后的方法声明
      storedGantryGroup: '', // 存储textGantryGroup的值
      quickRules:{
        vehicleType: [
          { required: true, message: '车型不能为空', trigger: 'change' },
        ],
        vehicleClass: [
          { required: true, message: '车辆种类不能为空', trigger: 'change' },
        ],
        vehicleUserType: [
          { required: true, message: '车辆用户类型', trigger: 'change' },
        ],
      },
      handleMap:null,
      quickForm:{
        textGantryGroup:'', //人录入门架序列
        textGantryHexGroup:'', //人录入门架序列hex
        gantryCount:0,
        gantryGroup:'',    //门架集合
        gantryHexGroup:'', //hex
        dataSource:'', //数据源集合
        mediaType:'', //通行介质
        vehicleType:'',//稽核车型
        vehicleUserType:'', //车辆用户类型
        vehicleClass:'', //车种
        rateProgramVer:'', //计费模块版本号
        rateVer:'' // 费率版本号
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
    handleGantryGroupInput(value) {
      if (!value) {
        // 清空hex值
        this.quickForm.textGantryHexGroup = '';
        this.pendingStationList = [];
        return;
      }
      
      // 使用 | 分割字符串并去重
      const gantryArray = value.split('|').filter(item => item.trim());
      const uniqueGantryArray = [...new Set(gantryArray)];
      
      // 更新输入框的值和存储值
      this.quickForm.textGantryGroup = uniqueGantryArray.join('|');
      this.storedGantryGroup = this.quickForm.textGantryGroup;
      
      // 将|替换为英文逗号后传递给handleByTextGantryGroup
      let ids = this.quickForm.textGantryGroup.replace(/\|/g, ',');
      
      // 获取新的门架数据，但只暂存，不直接更新stationList
      let info={
            page:{
              pageNo:1,
              rownumber:10,
            },
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
        this.pendingStationList = ls;
        // 根据查询返回的数据更新textGantryHexGroup
        const hexValues = ls.map(item => item.gantryhex).filter(hex => hex);
        this.quickForm.textGantryHexGroup = hexValues.join('|');
      }).catch(err => { this.pendingStationList = []; });
    },
    //更新门架按钮点击按钮时触发门架查询
    handleUpdateGantryList() {
      //  获取非人工录入门架ID
      const existIds = new Set(this.stationList.filter(item => !item.fromTextGantry).map(item => String(item.id)));
      //  过滤pendingStationList，找出未重复的
      const filtered = [];
      const removedIds = [];
      this.pendingStationList.forEach(item => {
        if (!existIds.has(String(item.id))) {
          filtered.push({ ...item, fromTextGantry: true });
        } else {
          removedIds.push(String(item.id));
        }
      });
      // 移除原有人工录入门架
      this.stationList = this.stationList.filter(item => !item.fromTextGantry);
      this.stationList = [...this.stationList, ...filtered];
      this.stationList = this.handleStationDataSource(this.stationList);
      this.handleDrawMarkers();
      if(this.stationList.length > 0) {
        this.handleFly(this.stationList[0]);
      }
      this.pendingStationList = [];
      // 同步textGantryGroup
      if (removedIds.length > 0) {
        const arr = this.quickForm.textGantryGroup.split('|').filter(id => id && !removedIds.includes(id));
        this.quickForm.textGantryGroup = arr.join('|');
        // 同步textGantryHexGroup门架
        const groupIds = this.quickForm.textGantryGroup.split('|').filter(Boolean);
        const idToHex = {};
        this.stationList.forEach(item => {
          if (item.fromTextGantry) idToHex[String(item.id)] = item.gantryhex;
        });
        const hexArr = groupIds.map(id => idToHex[id]).filter(Boolean);
        this.quickForm.textGantryHexGroup = hexArr.join('|');
        // 记录重复信息
        this.repeatedInformation = removedIds.join(',');
      } else {
        this.repeatedInformation = '';
      }
    },
    //门架序列点击清除
    handleClearGantry(){
      // 只移除人工录入门架
      this.stationList = this.stationList.filter(item => !item.fromTextGantry);
      this.stationList = this.handleStationDataSource(this.stationList);
      this.handleDrawMarkers();
      this.storedGantryGroup = '';
      this.quickForm.textGantryGroup = '';
      this.quickForm.textGantryHexGroup = '';
      this.repeatedInformation = '';
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
    handleDrawMarkers(){
      // 构建点位配置
      const pointConfig = {
        icon: require(`@/assets/mapIcon/point_ico.png`),
        select: true
      };
      // 构建最终的点位数组
      const additionalMarkers = this.stationList.map((item, index) => ({
        ...pointConfig,
        name: item.tollgrantry_name?item.tollgrantry_name:item.tradenodename,
        point: handleMakePoint('', item.lng, item.lat),
        seq_id: index + 1,  // 添加 seq 字段，从 1 开始
        ...item
      }));
      // 重新绘制地图标记
      drawMapMarkersAndLabel(this.handleMap, additionalMarkers);
    },
    handleClear(){
      this.stationList = [];
      removeOverlay(this.handleMap)
      this.repeatedInformation = '';
      this.quickForm.textGantryGroup = '';
      this.quickForm.textGantryHexGroup = '';
      this.storedGantryGroup = '';
    },

    //人工录入门架子序列后查询们门架子
    handleByTextGantryGroup(ids){
      let info={
            page:{
              pageNo:1,
              rownumber:10,
            },
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
        this.stationList = this.stationList.filter(station => !station.fromTextGantry);
        // 合并新查回的数据和原有的（fromTextGantry: false），用id去重
        const map = new Map();
        [...this.stationList, ...ls].forEach(item => {
          map.set(item.id, item);
        });
        this.stationList = Array.from(map.values());
        // 处理数据源
        this.stationList = this.handleStationDataSource(this.stationList);
        // 更新地图标记
        this.handleDrawMarkers();
        this.handleFly(this.stationList[0])
        // 根据查询返回的数据更新textGantryHexGroup
        const hexValues = ls.map(item => item.gantryhex).filter(hex => hex);
        this.quickForm.textGantryHexGroup = hexValues.join('|');
      }).catch(err => {})
    },
    //门架选择
    handleFilterStation(list){
      // 现有门架ID集合
      const existIds = new Set(this.stationList.map(item => String(item.id)));
      // 过滤新门架，只保留未存在的
      const filtered = list.filter(item => !existIds.has(String(item.id)));
      // 记录被去重掉的ID
      const repeated = list.filter(item => existIds.has(String(item.id))).map(item => item.id);
      this.repeatedInformation = repeated.length > 0 ? repeated.join(',') : '';
      // 合并
      this.stationList = [...this.stationList, ...filtered];
      this.stationList = this.handleStationDataSource(this.stationList);
      this.handleDrawMarkers();
      if(this.stationList.length > 0) {
        this.handleFly(this.stationList[0]);
      }
      console.log('处理后的门架列表：', this.stationList);
    },

    //选择的门架子删除
    handleDelete(item){
      const index = this.stationList.findIndex(i => i.id === item.id);
      if (index > -1) {
        this.stationList.splice(index, 1);
        this.stationList = this.handleStationDataSource(this.stationList);
        
        // 检查删除的门架ID是否存在于textGantryGroup中
        const gantryIds = this.quickForm.textGantryGroup.split('|').filter(id => id.trim());
        if (gantryIds.includes(item.id.toString())) {
          // 如果存在，则从textGantryGroup中移除该ID
          const updatedIds = gantryIds.filter(id => id !== item.id.toString());
          this.quickForm.textGantryGroup = updatedIds.join('|');
          this.storedGantryGroup = this.quickForm.textGantryGroup;
          
          // 触发查询更新textGantryHexGroup
          if (this.quickForm.textGantryGroup) {
            let queryIds = this.quickForm.textGantryGroup.replace(/\|/g, ',');
            this.handleByTextGantryGroup(queryIds);
          } else {
            // 如果textGantryGroup为空，则清空textGantryHexGroup
            this.quickForm.textGantryHexGroup = '';
          }
        }
        this.handleDrawMarkers()
        if (this.stationList.length === 0) {
          this.repeatedInformation = '';
        }
      }
      this.handleDrawMarkers()
    },
    //拖拽结束后的回调
    onDragEnd(evt) {
      this.stationList = this.handleStationDataSource(this.stationList);
      console.log('排序后的门架列表：', this.stationList);
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

    //处理携带hex文本进入时查询出对应的门架序列数据
    handleHexGroupInput(value) {
      if (!value) {
        // 清空textGantryGroup
        this.quickForm.textGantryGroup = '';
        this.pendingStationList = [];
        return;
      }
      
      // 使用 | 分割字符串并去重
      const hexArray = value.split('|').filter(item => item.trim());
      const uniqueHexArray = [...new Set(hexArray)];
      
      // 更新输入框的值
      this.quickForm.textGantryHexGroup = uniqueHexArray.join('|');
      
      // 将|替换为英文逗号后传递给handleGetStationByHex
      let ids = this.quickForm.textGantryHexGroup.replace(/\|/g, ',');
      // 查询HEX对应的门架，查回数据只暂存，不直接更新stationList
      let info={
        page:{
          pageNo:1,
          rownumber:10,
        },
        condition:[{colName: "gantryhex", ruleType: "in", value:ids}],
        relation_condition:{
          relation: "AND",
          data:[{colName: "gantryhex", ruleType: "in", value:ids}]
        }
      }
      orderUtils.getAllStationByInfo(info).then(res => {
        if(res.data.state !== 'SUCCESS') { this.pendingStationList = []; return; }
        let ls = res.data.data;
        this.pendingStationList = ls;
        // 将获取到的门架ID拼接到textGantryGroup
        const gantryIds = ls.map(item => item.id).filter(id => id);
        this.quickForm.textGantryGroup = gantryIds.join('|');
      }).catch(err => { this.pendingStationList = []; });
    },

    //处理携带hex文本进入时查询出对应的门架序列数据
    handleGetStationByHex(ids){
      let info={
        page:{
          pageNo:1,
          rownumber:10,
        },
        condition:[{colName: "gantryhex", ruleType: "in", value:ids}],
        relation_condition:{
          relation: "AND",
          data:[{colName: "gantryhex", ruleType: "in", value:ids}]
        }
      }
      orderUtils.getAllStationByInfo(info).then(res => {
        if(res.data.state !== 'SUCCESS') return;
        let ls = res.data.data;
        
        // 先清除之前通过textGantryGroup添加的门架
        const oldGantryIds = this.storedGantryGroup.split('|').filter(id => id.trim());
        this.stationList = this.stationList.filter(station => !oldGantryIds.includes(station.id.toString()));
        
        // 将获取到的门架ID拼接到textGantryGroup
        const gantryIds = ls.map(item => item.id).filter(id => id);
        this.quickForm.textGantryGroup = gantryIds.join('|');
        this.storedGantryGroup = this.quickForm.textGantryGroup;
        
        // 触发textGantryGroup的查询操作
        let queryIds = this.quickForm.textGantryGroup.replace(/\|/g, ',');
        this.handleByTextGantryGroup(queryIds);
      }).catch(err => {})
    },


    /**
     * @Description:快速计费提交校验
     * @Author:Eirice
     * @Date: 2025-06-19 09:21:20
     */
    handleSubmitQuick(){
      this.$refs.quickForm.validate((valid) => {
        if (valid) {
        if(this.stationList.length===0) return Message({type:'error',message:'门架不能为空'});
         let obj={
           gantryCount:this.stationList.length,
           gantryGroup:handleFilterParams('id',this.stationList,'|'),
           gantryHexGroup:handleFilterParams('gantryhex',this.stationList,'|'),
           dataSource: handleFilterParams('dataSource',this.stationList,'|'),
           mediaType:this.quickForm.mediaType,
           vehicleType:this.quickForm.vehicleType,
           vehicleUserType:this.quickForm.vehicleUserType,
           vehicleClass:this.quickForm.vehicleClass,
           rateProgramVer:this.quickForm.rateProgramVer,
           rateVer:this.quickForm.rateVer,
         }
         console.log('这是计费参数',obj)
         this.quickBillingSubmit(obj)
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
     * @Description:快速计费信息提交
     * @Author:Eirice
     * @Date: 2025-06-19 09:26:20
     */
    quickBillingSubmit(obj){
     orderUtils.handleQuickBilling(obj).then(res => {
       if(res.data.code !== 0) return;
       Message({
         type: 'success',
         message: '计费查询成功'
       });
       if(res.data.messageInfo && res.data.messageInfo.tollDetail){
         let ls=res.data.messageInfo.tollDetail[0]
          this.feeInfo.fee=ls?.fee;
          this.feeInfo.payFee=ls?.payFee;
          this.feeInfo.discountFee=ls?.discountFee;
       }
     }).catch(err => {})
    }
  },
  created() {
    // 创建防抖处理后的方法
    this.debouncedHandleGantryGroupInput = this.debounce(this.handleGantryGroupInput);
    this.debouncedHandleHexGroupInput = this.debounce(this.handleHexGroupInput);
  },
  mounted(){
    sessionStorage.removeItem('bx_auth_ticket');
    sessionStorage.setItem('bx_auth_ticket','xabxdzkj-48929a84-efda-494a-a6ad-700ffb40ec58');
    this.getPublicColNames();
    this.asyncLoadMap();
    setTimeout(()=>{this.initMineMap()},500)
  }
}
</script>


<style scoped lang="scss">
@use "./quick";

</style>