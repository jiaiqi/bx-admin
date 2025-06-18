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
                   <el-input @clear="handleClearGantry" v-model="quickForm.textGantryGroup" size="mini" style="width:100%" clearable placeholder="请输入" @input="debouncedHandleGantryGroupInput"></el-input>
                 </el-form-item>
               </el-col>
               <el-col :span="6">
                 <el-form-item label="门架序列(HEX)">
                   <el-input v-model="quickForm.textGantryHexGroup" size="mini" style="width:100%" clearable placeholder="请输入"></el-input>
                 </el-form-item>
               </el-col>
               <el-col :span="6">
                 <el-form-item>
                   <el-button type="primary" plain size="mini">更新门架列表</el-button>
                 </el-form-item>
               </el-col>
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
            <div class="ch_row" v-for="(item,index) in stationList" :key="item.id">
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
          <el-button style="width:70%" type="primary" plain size="mini">稽核计费</el-button>
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
import {filterListByOption, formDataByInitText} from "@/pages/audit/workdistribution/workFlow/filterList";
import {
  drawMapMarkersAndLabel,
  FlyTo,
  removeOverlay,
  handleMakePoint,
} from "@/pages/audit/workdistribution/map/layerPage";
import OrderApi from "@/pages/audit/api/order";
import draggable from 'vuedraggable'
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
      feeInfo:{
        fee:0,    // 实收金额
        discountFee:0, //优惠金额
        payFee:0, //应收金额
      },
      listVisible:false,
      stationList:[],
      debounceTimer: null, // 添加防抖定时器
      debouncedHandleGantryGroupInput: null, // 添加防抖处理后的方法声明
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
     * @Description:
     * @Author:Eirice
     * @Date: 2025-06-18 15:16:25
     */
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

      }).catch(err => {})

    },
    //门架序列数据处理
    handleGantryGroupInput(value) {
      if (!value) {
        // 当输入框被清除时，移除通过textGantryGroup添加的门架
        const gantryIds = this.storedGantryGroup.split('|').filter(id => id.trim());
        this.stationList = this.stationList.filter(station => !gantryIds.includes(station.id.toString()));
        this.stationList = this.handleStationDataSource(this.stationList);
        this.handleDrawMarkers();
        return;
      }
      
      // 使用 | 分割字符串并去重
      const gantryArray = value.split('|').filter(item => item.trim());
      const uniqueGantryArray = [...new Set(gantryArray)];
      
      // 更新输入框的值和存储值
      this.quickForm.textGantryGroup = uniqueGantryArray.join('|');
      this.storedGantryGroup = this.quickForm.textGantryGroup;
      let ids = this.quickForm.textGantryGroup.replace(/\|/g, ',');
      this.handleByTextGantryGroup(ids)
    },
    //门架序列点击清除
    handleClearGantry(){
      // 使用存储的值来获取门架ID
      const gantryIds = this.storedGantryGroup.split('|').filter(id => id.trim());
      // 从stationList中移除这些门架
      this.stationList = this.stationList.filter(station => !gantryIds.includes(station.id.toString()));
      this.stationList = this.handleStationDataSource(this.stationList);
      this.handleDrawMarkers();
      this.storedGantryGroup = '';
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
        let ls = res.data.data;
        
        // 合并现有列表和新获取的数据，并使用id去重
        const mergedList = [...this.stationList, ...ls];
        const uniqueMap = new Map();
        mergedList.forEach(item => {
          if (!uniqueMap.has(item.id)) {
            uniqueMap.set(item.id, item);
          }
        });
        
        // 将去重后的数据转换回数组
        this.stationList = Array.from(uniqueMap.values());
        // 处理数据源
        this.stationList = this.handleStationDataSource(this.stationList);
        // 更新地图标记
        this.handleDrawMarkers();

        // 更新gantryHexGroup
        const hexValues = this.stationList
          .filter(station => station.gantryhex) // 过滤掉没有gantryhex的数据
          .map(station => station.gantryhex);
        this.quickForm.textGantryHexGroup = hexValues.join('|');
      }).catch(err => {})
    },
    //门夹选择
    handleFilterStation(list){
      this.stationList=[...this.stationList,...list];
      this.stationList = this.handleStationDataSource(this.stationList);
      this.handleDrawMarkers()
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
  },
  created() {
    // 创建防抖处理后的方法
    this.debouncedHandleGantryGroupInput = this.debounce(this.handleGantryGroupInput);
  },
  mounted(){
    // sessionStorage.removeItem('bx_auth_ticket');
    // sessionStorage.setItem('bx_auth_ticket','xabxdzkj-7cfd91f9-f9b7-4f15-a38f-a6d5d2c9e227');
    this.getPublicColNames();
    this.asyncLoadMap();
    setTimeout(()=>{this.initMineMap()},500)
  }
}
</script>


<style scoped lang="scss">
.quick_content{
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  justify-content: space-between;
  .quick_row{
    height:100%;
    box-shadow: 0 0 8px rgba(232, 237, 250, 0.6), 0 2px 4px rgba(232, 237, 250, 0.5);
  }
  .quick_map{
    width:100%;
    height:65%;
  }
  .qk_row{
    width:100%;
    overflow: auto;
  }
  .quick_form{
    margin:0.1875rem 0;
    width:100%;
    height:34%;
    background:#fff;
    border:1px solid #ececef;
    box-shadow: 0 0 8px rgba(232, 237, 250, 0.6), 0 2px 4px rgba(232, 237, 250, 0.5);
    .el-form {
      height: 100%;
      overflow-y: auto;
    }
  }
  .qk_tl{
    text-align: left;
    width: 100%;
    height: 2.1875rem;
    font-size:0.875rem;
    color: #424242;
    border-bottom:1px solid #efecec;
    padding: 0 1rem;
    margin: 0;
    box-sizing: border-box;
    display: block;
  }
  .st_list_cot{
    padding:0.625rem;
    box-sizing: border-box;
  }
}
</style>
<style>
.qk_row .qk_ruleForm .el-form-item{
  margin-bottom:0.625rem !important;
}
.qk_row .qk_ruleForm > .el-row{
  border:none !important;
}
.qk_row .text_ruleForm > .el-row{
  border:none !important;
}
.st_tl_info{
  width:100%;
  height:3.125rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom:1px solid rgba(232, 237, 250, 0.6);
}
.chose_lise{
  margin:0.5rem 0;
  width:100%;
  height:calc(100% - 4.0625rem);
  overflow: auto;
}
.ch_row{
  width:100%;
  height:2.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f5f7fa;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  margin-bottom: 8px;
  padding: 0 10px;
  box-sizing: border-box;
  transition: all 0.3s;
}

.ch_row > div {
  flex: 1;
  display: flex;
  align-items: center;
  margin: 0 10px;
  min-width: 0; /* 防止flex子元素溢出 */
}

.st_title {
  font-size: 13px;
  color: #606266;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.st_tran {
  cursor: move;
  color: #909399;
  transition: color 0.3s;
  flex-shrink: 0;
  width: 24px;
  text-align: center;
}

.st_del {
  color: #909399;
  transition: color 0.3s;
  flex-shrink: 0;
  width: 24px;
  text-align: center;
}

.ch_row:hover {
  background-color: #ecf5ff;
  border-color: #409EFF;
}

.ch_row .st_cl {
  border-radius: 50%;
  box-sizing: border-box;
  padding: 0.3125rem;
  background: #00b7ee;
  margin-right: 0.625rem;
  color: #fff;
  font-size: 12px;
  min-width: 20px;
  height: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.ch_row span:not(.st_cl):not(.st_tran):not(.st_del) {
  font-size: 13px;
  color: #606266;
  font-weight: 500;
}

.st_del:hover {
  color: #F56C6C;
}

.st_tran:hover {
  color: #409EFF;
}

.sortable-ghost {
  opacity: 0.5;
  background: #c8ebfb;
}

.sortable-drag {
  opacity: 0.8;
  background: #fff;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
}
.handle_sub{
  width:100%;
  height:2.8125rem;
  text-align: center;
}

.des_tl {
  width: 100%;
  height: 2rem;
  display: flex;
  align-items: center;
  padding: 0 1rem;
  box-sizing: border-box;
}

.des_tl span:first-child {
  font-size: 13px;
  color: #606266;
  font-weight: 500;
}

.des_tl span:last-child {
  font-size: 14px;
  color: #409EFF;
  font-weight: 600;
}
</style>