<template>
  <div class="work_flow">
    <el-form :model="ruleForm" ref="ruleForm" label-width="auto" class="demo-ruleForm">
      <el-row>
        <el-col   style="color: #00a0e9;border-bottom: 1px solid #d8e6f5;margin-bottom:5px">嫌疑车辆信息</el-col>

        <el-col :span="12">
          <el-form-item label="通行标识" prop="pass_id">
            <el-input v-model="ruleForm.pass_id" show-word-limit maxlength="128" placeholder="请输入..." clearable
                      style="width:85%"></el-input>
          </el-form-item>
        </el-col>

        <el-col :span="12" style="display: flex">
          <el-form-item label="疑似逃费类型" prop="sus_escape_type">
            <el-select v-model="ruleForm.sus_escape_type" placeholder="请选择" clearable>
              <el-option
                  v-for="item in optionsPage.sus_escape_type"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="嫌疑车辆ID" prop="sus_vehicle_id">
            <el-input v-model="ruleForm.sus_vehicle_id" clearable placeholder="请输入..."></el-input>
          </el-form-item>
        </el-col>

        <el-col :span="12" style="display: flex;width:43.76%;justify-content: space-between">
          <el-form-item label="嫌疑车辆车牌颜色" prop="sus_plate_color">
            <el-select v-model="ruleForm.sus_plate_color" placeholder="请选择" clearable>
              <el-option
                  v-for="item in optionsPage.sus_plate_color"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="交易通行时间" prop="pass_time" style="margin-left: 14%">
            <el-input v-model="ruleForm.pass_time" clearable placeholder="请输入..."></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12" style="padding-left:6.28%">
          <el-form-item label="确认逃费类型" prop="escape_type">
            <el-select v-model="ruleForm.escape_type" placeholder="请选择" clearable>
              <el-option
                  v-for="item in optionsPage.escape_type"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="经营管理单位" prop="relevant_org">
            <el-input v-model="ruleForm.relevant_org" clearable placeholder="请输入..." style="width:85%"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12" style="display: flex">
          <el-form-item label="通行介质类型" prop="media_type">
            <el-select v-model="ruleForm.media_type" placeholder="请选择" clearable>
              <el-option
                  v-for="item in optionsPage.media_type"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="通行介质编号" prop="media_no">
            <el-input v-model="ruleForm.media_no" clearable show-word-limit placeholder="请输入..."
                      maxlength="510"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col style="color: #00a0e9;border-bottom: 1px solid #d8e6f5;margin-bottom:5px">工单信息</el-col>

        <el-col :span="24" style="display: flex;width: 76%;justify-content: space-between">
          <el-form-item label="工单类型" prop="order_type">
            <el-select v-model="ruleForm.order_type" placeholder="请选择" clearable>
              <el-option
                  v-for="item in optionsPage.order_type"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="工单标题" prop="title" style="width:67.3%">
            <el-input v-model="ruleForm.title" show-word-limit maxlength="510" style="width:  87.5%;" placeholder="请输入..."
                      clearable></el-input>
          </el-form-item>
        </el-col>

        <el-col :span="24" style="margin-bottom:5px">
          <el-form-item label="工单描述" prop="order_desc">
            <el-input v-model="ruleForm.order_desc" placeholder="请输入..."
                      maxlength="20000"
                      :autosize="{ minRows: 4, maxRows: 8}"
                      show-word-limit type="textarea" clearable></el-input>
          </el-form-item>
        </el-col>

        <el-col :span="12" style="display: flex;width:43.5%;justify-content: space-between">
          <el-form-item label="人工审核车牌号" prop="vehicle_id">
            <el-input v-model="ruleForm.vehicle_id" clearable show-word-limit placeholder="请输入..."
                      maxlength="64"></el-input>
          </el-form-item>
          <el-form-item label="人工审核车牌颜色" prop="plate_color">
            <el-select v-model="ruleForm.plate_color" placeholder="请选择" clearable>
              <el-option
                  v-for="item in optionsPage.plate_color"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12" style="display: flex;padding-left: 6.42%">
          <el-form-item label="稽核车型" prop="trade_vehicle_type">
            <el-select v-model="ruleForm.trade_vehicle_type" placeholder="请选择" clearable>
              <el-option
                  v-for="item in optionsPage.trade_vehicle_type"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="通行收费" prop="orginal_fee">
            <el-input v-model="ruleForm.orginal_fee" clearable placeholder="请输入..."></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12" style="display: flex;width:43.5%;justify-content: space-between">
          <el-form-item label="实际费用" prop="real_fee">
            <el-input v-model="ruleForm.real_fee" clearable placeholder="请输入..."></el-input>
          </el-form-item>
          <el-form-item label="补缴费用" prop="owe_fee">
            <el-input v-model="ruleForm.owe_fee" clearable placeholder="请输入..."></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col style="color: #00a0e9;border-bottom: 1px solid #d8e6f5;margin-bottom:5px">嫌疑流水</el-col>
        <div class="suspected">
          <el-table :data="suspectedData">
            <el-table-column v-for="column in supColums" :key="column.prop" :prop="column.prop" :label="column.title"></el-table-column>
          </el-table>
        </div>
      </el-row>
      <el-row>
        <el-col style="color: #00a0e9;border-bottom: 1px solid #d8e6f5;margin-bottom:5px">发起人信息</el-col>
        <el-col :span="12" style="display: flex;justify-content: space-between;width: 43.5%">
          <el-form-item label="发起人" prop="operator_name">
             <div style="display: flex">
               <el-select clear v-model="ruleForm.operator_name"  clearable placeholder="请选择" @change="setOperInfo">
                 <el-option
                     v-for="item in operatorName"
                     :key="item.id"
                     :label="item.user_name"
                     :value="item.user_id">
                 </el-option>
               </el-select>
               <el-button  type="primary" icon="el-icon-search" size="mini" @click="setPromoter"></el-button>
             </div>
          </el-form-item>
          <el-form-item label="发起人id" prop="operator_id">
            <el-input v-model="ruleForm.operator_id" clearable placeholder="请输入..."></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12" style="display: flex;padding-left: 6.42%">
          <el-form-item label="机构编号" prop="org_no">
            <div style="display: flex">
              <el-select v-model="ruleForm.org_no"  @clear="getPutOrgAll" clearable placeholder="请选择"  @change="setDepOrd">
                <el-option
                    v-for="item in optionsPageOrg"
                    :key="item.user_id"
                    :label="item.dept_name"
                    :value="item.dept_no"
                >
                </el-option>
              </el-select>
              <el-button  type="primary" icon="el-icon-search" size="mini" @click="setInstituion"></el-button>
            </div>
          </el-form-item>
          <el-form-item label="发起机构" prop="org_name">
            <el-input v-model="ruleForm.org_name" clearable placeholder="请输入..."></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12" style="display: flex;justify-content: space-between; width: 43.5%;">
          <el-form-item label="机构类型" prop="org_type">
            <el-select v-model="ruleForm.org_type" placeholder="请选择" clearable>
              <el-option
                  v-for="item in optionsPage.org_type"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="发起省份" prop="province">
            <el-input v-model="ruleForm.province" clearable placeholder="请输入..."></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12" style="padding-left: 6.42%;">
          <el-form-item label="责任主体" prop="province">
            <el-select v-model="ruleForm.responsibility" clearable placeholder="请选择" style="width:100%;">
              <el-option
                  v-for="item in optionsPage.responsibility"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="是否欠费" prop="is_owe_fee">
            <el-select v-model="ruleForm.is_owe_fee" clearable placeholder="请选择" style="width:84.3%">
              <el-option
                  v-for="item in optionsPage.is_owe_fee"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="证据是否充足" prop="is_sufficient_evidence">
            <el-select v-model="ruleForm.is_sufficient_evidence" clearable placeholder="请选择" style="width:84.5%;">
              <el-option
                  v-for="item in optionsPage.is_sufficient_evidence"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="稽核车型" prop="is_owe_fee">
            <el-select v-model="ruleForm.vehicle_type" clearable placeholder="请选择" style="width:84.3%">
              <el-option
                  v-for="item in optionsPage.vehicle_type"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="是否是发起方提交证据" prop="is_initiator_evidence">
            <el-select v-model="ruleForm.is_initiator_evidence" clearable placeholder="请选择" style="width:84.5%;">
              <el-option
                  v-for="item in optionsPage.is_initiator_evidence"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="是否与发行数据一致" prop="is_match_issue">
            <el-select v-model="ruleForm.is_match_issue" clearable placeholder="请选择" style="width:84.3%;">
              <el-option
                  v-for="item in optionsPage.is_match_issue"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="欠费类型" prop="owe_fee_type">
            <el-select v-model="ruleForm.owe_fee_type" clearable placeholder="请选择" style="width:84.5%">
              <el-option
                  v-for="item in optionsPage.owe_fee_type"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="是否为大件车辆" prop="isnormel">
            <el-select v-model="ruleForm.isnormel" clearable placeholder="请选择" style="width:84.3%;">
              <el-option
                  v-for="item in optionsPage.isnormel"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="车轴数" prop="axlecount">
            <el-input v-model="ruleForm.axlecount" clearable style="width:84.5%" placeholder="请输入..."></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="车辆用户类型" prop="vehicleusertype">
            <el-select v-model="ruleForm.vehicleusertype" clearable placeholder="请选择" style="width:84.3%;">
              <el-option
                  v-for="item in optionsPage.vehicleusertype"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="车种" prop="vehicleclass">
            <el-select v-model="ruleForm.vehicleclass" clearable placeholder="请选择" style="width:84.5%">
              <el-option
                  v-for="item in optionsPage.vehicleclass"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="证据附件" prop="order_evidence">
            <el-input v-model="ruleForm.order_evidence" clearable style="width:84.3%;" placeholder="请输入..."></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col style="color: #00a0e9;border-bottom: 1px solid #d8e6f5;margin-bottom:5px">
          <span>证据上传</span><span style="font-size: 1.125rem;margin-left:0.5rem;cursor: pointer" @click="setPicMod"><i class="el-icon-upload"></i></span>
        </el-col>
        <div class="pic_up" v-if="evidencePic.length>0">
          <div class="img_list">
            <!-- 使用element-ui自带样式 -->
            <ul class="el-upload-list el-upload-list--picture-card">
              <transition-group style="display: flex; flex-wrap: wrap;width: 100%">
                <li
                    v-for="(item, index) in evidencePic"
                    :key="item.fileurl"
                    class="el-upload-list__item is-success animated"
                    style="position: relative"
                >
                  <el-image
                      class="el-upload-list__item-thumbnail pre_pic"
                      :src="item.url"
                      :preview-src-list="preList"
                  >
                  </el-image>
                  <div class="img_bts">
                <span
                    class="el-upload-list__item-preview"
                    title="下载"
                    @click="dowmlaodUrl(item.url)"
                >
                  <i class="el-icon-download"></i>
                </span>
                  </div>
                </li>
              </transition-group>
            </ul>
          </div>
        </div>
      </el-row>
      <el-row>
            <el-col :span="24" style="display: flex;justify-content: center" class="cl_bts">
              <el-button type="primary" icon="el-icon-check" size="mini" @click="handleSubmit">提交</el-button>
              <el-button type="primary" icon="el-icon-refresh-left" size="mini">重置</el-button>
            </el-col>
      </el-row>
    </el-form>
    <promoterMod ref="proRef" :visible.sync="showModal" @getProMoterRow="getPromoterRow"/>
    <institutionMod :inVisible.sync="showInsMod" @getInsRow="getInsTableRow"/>
    <uploadPic  :picVisible.sync="showPicMod" :objId="picIds" :files="evidencePic"  @getSavePicInfo="getSavePicInfo"/>
  </div>
</template>

<script>
import {$http} from '@/common/http';
import {filterListByOption, formDataByGetInfo, formDataByInitText, SuspectedColumn} from './filterList'
import OrderApi from '@/pages/audit/api/order'
import promoterMod from "@/pages/audit/workdistribution/workFlow/promoter-mod.vue";
import institutionMod from "@/pages/audit/workdistribution/workFlow/institution-mod.vue";
import uploadPic from "@/pages/audit/workdistribution/workFlow/upload-pic.vue";
const orderUtils = new OrderApi()
export default {
  name: "order-form",
  components: {
    promoterMod,
    institutionMod,
    uploadPic
  },
  data() {
    return {
      evidencePic:[],
      supColums:[],
      suspectedData:[],
      showInsMod:false,
      showModal: false,
      showPicMod:false,
      operatorName:[],
      optionsPageOrg:[], //机构编号
      optionsPage:{
        sus_escape_type:[],
        sus_plate_color:[],
        escape_type:[],
        media_type:[],
        order_type:[],
        plate_color:[],
        trade_vehicle_type:[],
        process_state:[], //工单处理状态
        recover_state:[], //追缴状态
        org_type:[],
        responsibility:[],
        is_owe_fee:[],
        is_sufficient_evidence:[],
        vehicle_type:[],
        is_initiator_evidence:[],
        is_match_issue:[],
        owe_fee_type:[],
        isnormel:[],
        has_evidence:[],
        vehicleusertype:[],
        vehicleclass:[],
        operator_name:[],
        org_no:[]
      },
      pageNo:'',
      ruleForm: {
        owe_fee:'',                         //补缴费用
        axlecount: "",                     //车轴数
        escape_type: "",	               // 确认逃费类型
        is_initiator_evidence: "",       //是否是发起方提交证据
        is_match_issue: "",             //是否与发行数据一致
        is_other_province_order: '',	    //是否省外工单
        is_owe_fee: "",                  //是否欠费
        is_sufficient_evidence: "",	     //证据是否充足
        isnormel: "",	                //是否为大件车辆
        issueids: '',	                 //发行方ID
        media_no: "",                    //通行介质编号
        media_type: "",	                //通行介质类型
        operator_id:'',                     //发起人id
        operator_name: "",                  //发起人姓名
        order_desc: "",                  //工单描述
        order_evidence: "",              //证据附件
        order_type: "",                   //工单类型
        org_id:'',                    //发起机构id
        org_name: "",                //发起机构名称
        org_no: "",                //机构编号
        org_type: "",              //机构类型
        orginal_fee: "",             //通行收费
        owe_fee_type: "",              //欠费类型
        pass_id: "",                  //通行标识
        pass_time: "",              //交易通行时间
        plate_color: "",            //人工审核车牌颜色
        province: "",               //发起省份
        real_fee:'',  //实际费用
        relevant_org: "",  //经营管理单位
        responsibility: "",  //责任主体
        sus_escape_type: "",  //疑似逃费类型
        sus_plate_color: "",  //嫌疑车辆车牌颜色
        sus_vehicle_id: "",  //嫌疑车辆ID
        suspicion_id: "",  //嫌疑流水id
        title: "",           //工单标题
        trade_vehicle_type: "",  //稽核车型
        // user_no: "",  //发起人信息
        vehicle_id: "",  //人工审核车牌号
        vehicle_type: "",  //稽核车型
        vehicleclass: "",  //车种
        vehicleusertype: "",  //车辆用户类型
      },
      restaurants:[],
      resDep:[],
      prUrl:'',
      preList:[],
      picIds:''
    }
  },
  methods: {
    setPicMod(){
      this.showPicMod = true
    },
    /**
     * @Description:获取所有信息下拉数据
     * @Author:Eirice
     * @Date: 2025-05-23 09:25:14
     */
   async getAllOptionsList(){
     let _this=this;
      let url=window.APP_CONFIG.API_URL+`/aud/select/srvsys_service_columnex_v2_select?colsel_v2=srvaud_ads_workorder_add`
      const req = {
        serviceName:"srvsys_service_columnex_v2_select",
        colNames: ["*"],
        condition: [
           {colName: "service_name", value: "srvaud_ads_workorder_add", ruleType: "eq"},
           {colName: "use_type", value: "add", ruleType: "eq"}
        ],
        order: [{colName: "seq", orderType: "asc"}],
      };
      const res = await $http.post(url, req)
      if(!res || res.data.state !== "SUCCESS") return
      let ls = res.data.data

      _this.pageNo = ls.vpage_no;
      let ops = ls.srv_cols
      _this.optionsPage=filterListByOption(ops,_this.optionsPage)
      _this.ruleForm=formDataByInitText(this.ruleForm,ops,'init_expr')
      console.log('123123',_this.ruleForm.user_no)
    },
    handleSelect(item) {
      this.ruleForm.operator_name=item.user_name;
      this.ruleForm.operator_id=item.user_id;
    },

      //机构编号切换
       setDepOrd(){
         console.log(this.ruleForm.org_no);
         this.handleFilterPutOrg()
       },

     //发起人切换
     setOperInfo(){
        let dep=this.operatorName.map(k=>{
          if(k.user_id===this.ruleForm.operator_name&&this.ruleForm.operator_name!==''){
             this.ruleForm.user_no=k.user_no
            console.log('这里的user_no',this.ruleForm.user_no)
            return k.dept_no
          }else {
            return false
          }
        })

        this.getDepSelelctInfo(dep[0])
       if(this.ruleForm.operator_name===''){
         this.ruleForm.org_no=''
         this.ruleForm.org_name=''
       }
     },
    /**
     * @Description:过滤获取当前选择机构的发起机构名称
     * @Author:Eirice
     * @Date: 2025-05-23 17:31:31
     */
     handleFilterPutOrg() {
       if(this.ruleForm.org_no===''){
         {this.ruleForm.org_name=''}
       }
         this.optionsPageOrg.map(d=>{
           if(d.dept_no===this.ruleForm.org_no){
              this.ruleForm.org_name=d.org_name?d.org_name:d.dept_full_name;
           }
         })
     },

    /**
     * @Description:发起机构单独处理
     * @Author:Eirice
     * @Date: 2025-05-24 18:30:29
     */
     getPutOrgAll(){
       let _this=this;
      orderUtils.getMoirDepList().then(res => {
        if(res.data.state !== 'SUCCESS') return;
        let ls = res.data.data
        _this.ruleForm.org_type=ls[0].org_type?(ls[0].org_type).toString():"";
        _this.optionsPageOrg = res.data.data
        if(dep){
          _this.ruleForm.org_no= _this.optionsPageOrg[0].dept_no;
        }else {
          _this.ruleForm.org_no=''
        }
        _this.handleFilterPutOrg()

      }).catch(err=>{})
    },
    /**
     * @Description:根据发起人信息获取的组织代码获取发起人组织信息
     * @Author:Eirice
     * @Date: 2025-05-23 15:54:36
     */
    getDepSelelctInfo(dep){
      let _this = this;
       let fnc=this.ruleForm.operator_name!==''?orderUtils.postPromoterInfo(dep):orderUtils.getMoirDepList()
         fnc.then(res => {
        if(res.data.state !== 'SUCCESS') return;
        let ls = res.data.data
        _this.ruleForm.org_type=ls[0].org_type?(ls[0].org_type).toString():"";
        _this.optionsPageOrg = res.data.data
         if(dep){
           _this.ruleForm.org_no= _this.optionsPageOrg[0].dept_no;
         }else {
           _this.ruleForm.org_no=''
         }
         _this.handleFilterPutOrg()

      }).catch(err=>{})
    },
    initQuerySearch(){
     let _this = this;
      orderUtils.getPromoterInfo().then(res => {
        if(res.data.state !== 'SUCCESS') {
          return;
        }
        _this.operatorName = res.data.data;
        _this.ruleForm.operator_name= _this.operatorName[0].user_id;
        _this.ruleForm.operator_id=_this.operatorName[0].user_id;
        _this.ruleForm.user_no=_this.operatorName[0].user_no;
        _this.getDepSelelctInfo(_this.operatorName[0].dept_no)
        console.log('这里的user_no',this.ruleForm.user_no)
      }).catch(err => {
      });
    },
    initForm() {
      let operate_params = this.getOperateParams();
          operate_params=JSON.parse(operate_params).data;
      if(operate_params){
        this.ruleForm=formDataByGetInfo(this.ruleForm,operate_params[0])
        console.log('这里的user_no3',this.ruleForm.user_no)
        console.log('--',this.ruleForm);
      }
    },
    //打开发起人弹窗
    setPromoter(){
      this.showModal=true;
    },
    //打开机构编号
    setInstituion(){
      this.showInsMod=true;
    },
    //获取发起人弹窗表格被双击数据
    getPromoterRow(row){
      this.operatorName=[row];
      this.ruleForm.operator_name= this.operatorName[0].user_id;
      this.ruleForm.operator_id=this.operatorName[0].user_id;
      this.setOperInfo();
    },
    //机构编码弹窗双击获取数据
    getInsTableRow(row){
      this.optionsPageOrg=[row];
      this.ruleForm.org_no= this.optionsPageOrg[0].dept_no;
      this.handleFilterPutOrg();
    },
    //参数去空
    handleSetEmpty(){
      const result = Object.keys(this.ruleForm).reduce((acc, key) => {
        if (this.ruleForm[key] !== null && this.ruleForm[key] !== undefined && this.ruleForm[key] !== '') {
          acc[key] = this.ruleForm[key];
        }
        return acc;
      }, {});
      return result;
    },
    handleSubmit(){
       orderUtils.handleSubmitOrder([this.handleSetEmpty()]).then(res => {
         if(res.data.state !== 'SUCCESS') return;
         this.$message.success('工单保存成功');
       }).catch(err=>{
         this.$message.error('提交异常，请检查');
       })
      console.log('当前表单提交信息',this.handleSetEmpty());
    },
    //获取上传图片信息
    getPicList(list){
     console.log('获取到了上传的图',list);
     // this.evidencePic(list)
    },
    /**
     * @Description:针对保存后的证据图片进行二次获取校验
     * @Author:Eirice
     * @Date: 2025-05-27 16:08:43
     */
    getSavePicInfo(list){
      let _this=this;
      _this.evidencePic=[]
      _this.picIds='';
      let fle_no=list?list.effect_data[0].icon_att:_this.ruleForm.order_evidence.length>0?_this.ruleForm.order_evidence:'';
      _this.ruleForm.order_evidence=fle_no;
      _this.picIds=list?list.effect_data[0].id:''
      if(_this.picIds&&typeof _this.picIds==="number"){
         _this.picIds=_this.picIds.toString();
      }
      let option={
        relation_condition:{},
        condition:[{colName: "is_delete", value: "1", ruleType: "eq"},{colName: "file_no", value: fle_no, ruleType: "eq"}]
      }
      orderUtils.getCurrentPicInfo(option).then(res => {
        if(res.data.state!=='SUCCESS') return
        let ls = res.data.data
         ls.map(d=>{
           d.url = _this.prUrl + d.fileurl;
         })
        _this.evidencePic=[...ls];
        _this.evidencePic.map(item=>{_this.preList.push(item.url)})
        console.log('组装好了',this.preList);
      }).catch(err=>{});
    },
    //下载
    dowmlaodUrl(item) {
      window.open(item);
    },

  },
  created(){
    this.prUrl=orderUtils.dowPicInfoUrl()
  },
  mounted() {
    this.supColums=SuspectedColumn()
    this.getAllOptionsList()
    this.initForm()
    this.initQuerySearch()
    this.getSavePicInfo(null)
    console.log('--22',this.ruleForm);

    // 组件挂载后默认调用一次
  }
}
</script>


<style scoped lang="scss">
.work_flow {
  width: 100%;
  height: 100%;
  overflow: auto;
  padding:1.5625rem 0;
}
.pic_up{
  padding:0.625rem;
}
</style>
<style>
.work_flow .el-form-item {
  margin-bottom: 0.3125rem !important;
}
@media screen and (min-width: 768px) and (max-width: 1250px) {
  .work_flow .el-col{
    display: block !important;
    padding-left:0 !important;
    width:100% !important;
  }
  .work_flow .el-form-item{
     margin-left:0 !important;
     width:100% !important;
  }
  .work_flow .el-form-item .el-select{
    width:100% !important;
  }
  .work_flow .el-form-item .el-input{
    width:100% !important;
  }
  .work_flow .cl_bts{
    display: flex !important;
    justify-content:center !important;
  }
}
.el-upload-list{
  border:none !important;
}
.el-upload-list__item:hover{
  .img_bts{
    display: flex;
    transition: all .3s;
  }
}
.img_bts{
  transition:all .3s;
  opacity: 0;
  display: none;
  width: 100%;
  height:2.1875rem;
  position: absolute;
  z-index:20;
  background: #212122;
  top: 75%;
  opacity: .5;
  color: #fff;
  font-size: 1.125rem;
  padding:0 0.625rem;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  >span{
    margin:0 0.5rem;
  }
}
</style>