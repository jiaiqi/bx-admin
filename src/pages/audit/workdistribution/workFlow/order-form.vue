<template>
  <div class="work_flow">
    <el-form
      :model="ruleForm"
      :rules="ruleFormRules"
      ref="ruleForm"
      label-width="auto"
      class="demo-ruleForm"
      :disabled="isDetail === true"
    >
      <el-row>
        <el-col style="color: #00a0e9;border-bottom: 1px solid #d8e6f5;margin-bottom:5px">嫌疑车辆信息</el-col>

        <el-col :span="12">
          <el-form-item
            label="通行标识"
            prop="pass_id"
          >
            <el-input
              disabled
              v-model="ruleForm.pass_id"
              show-word-limit
              maxlength="128"
              placeholder="请输入..."
              clearable
              style="width:85%"
            ></el-input>
          </el-form-item>
        </el-col>

        <el-col
          :span="12"
          style="display: flex"
        >
          <el-form-item
            label="疑似逃费类型"
            prop="sus_escape_type"
          >
            <el-select
              v-model="ruleForm.sus_escape_type"
              placeholder="请选择"
              clearable
              disabled
            >
              <el-option
                v-for="item in optionsPage.sus_escape_type"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item
            label="嫌疑车辆ID"
            prop="sus_vehicle_id"
          >
            <el-input
              disabled
              v-model="ruleForm.sus_vehicle_id"
              clearable
              placeholder="请输入..."
            ></el-input>
          </el-form-item>
        </el-col>

        <el-col
          :span="12"
          style="display: flex;width:43.76%;justify-content: space-between"
        >
          <el-form-item
            label="嫌疑车辆车牌颜色"
            prop="sus_plate_color"
          >
            <el-select
              disabled
              v-model="ruleForm.sus_plate_color"
              placeholder="请选择"
              clearable
            >
              <el-option
                v-for="item in optionsPage.sus_plate_color"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item
            label="交易通行时间"
            prop="pass_time"
          >
            <el-input
              disabled
              v-model="ruleForm.pass_time"
              clearable
              placeholder="请输入..."
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col
          :span="12"
          style="padding-left:6.28%;display: flex;"
        >
          <el-form-item
            label="收费车型"
            prop="trade_vehicle_type"
          >
            <el-select
              v-model="ruleForm.trade_vehicle_type"
              placeholder="请选择"
              clearable
            >
              <el-option
                v-for="item in optionsPage.trade_vehicle_type"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </el-form-item>

        </el-col>
        <el-col :span="12">
          <el-form-item
            label="经营管理单位"
            prop="relevant_org"
          >
            <div class="vant_org">
              <el-tag
                v-for="(item, index) in relevantList"
                :key="item.id"
                :closable="!isDetail"
                size="mini"
                style="margin:0 0.1875rem"
                @close="handleClose(item)"
              >
                {{ item.organ_name }}
              </el-tag>
            </div>
            <!--            <el-input v-model="ruleForm.relevant_org" clearable placeholder="请输入..." style="width:85%"></el-input>-->
          </el-form-item>
        </el-col>
        <el-col
          :span="12"
          style="display: flex"
        >
          <el-form-item
            label="通行介质类型"
            prop="media_type"
          >
            <el-select
              v-model="ruleForm.media_type"
              placeholder="请选择"
              clearable
              @change="handleSetMedia"
            >
              <el-option
                v-for="item in optionsPage.media_type"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item
            label="通行介质编号"
            prop="media_no"
          >
            <el-input
              v-model="ruleForm.media_no"
              clearable
              show-word-limit
              placeholder="请输入..."
              maxlength="510"
            ></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col style="color: #00a0e9;border-bottom: 1px solid #d8e6f5;margin-bottom:5px">工单信息</el-col>

        <el-col
          :span="24"
          style="display: flex;width: 76%;justify-content: space-between"
        >
          <el-form-item
            label="工单类型"
            prop="order_type"
          >
            <el-select
              v-model="ruleForm.order_type"
              placeholder="请选择"
              clearable
            >
              <el-option
                v-for="item in optionsPage.order_type"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item
            label="工单标题"
            prop="title"
            style="width:67.3%"
          >
            <el-input
              v-model="ruleForm.title"
              show-word-limit
              maxlength="510"
              style="width:  87.5%;"
              placeholder="请输入..."
              clearable
            ></el-input>
          </el-form-item>
        </el-col>

        <el-col
          :span="24"
          style="margin-bottom:5px"
        >
          <el-form-item
            label="工单描述"
            prop="order_desc"
          >
            <el-input
              v-model="ruleForm.order_desc"
              placeholder="请输入..."
              maxlength="20000"
              :autosize="{ minRows: 4, maxRows: 8 }"
              show-word-limit
              type="textarea"
              clearable
            ></el-input>
          </el-form-item>
        </el-col>

        <el-col
          :span="24"
          style="display: grid;grid-template-columns: 1fr 1fr 1fr 1fr;margin-bottom:10px;"
        >
          <el-form-item
            label="确认逃费类型"
            prop="escape_type"
          >
            <el-select
              v-model="ruleForm.escape_type"
              placeholder="请选择"
              clearable
              style="width: 100%;"
            >
              <el-option
                v-for="item in optionsPage.escape_type"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item
            label="人工审核车牌号"
            prop="vehicle_id"
          >
            <el-input
              v-model="ruleForm.vehicle_id"
              clearable
              show-word-limit
              placeholder="请输入..."
              maxlength="64"
            ></el-input>
          </el-form-item>
          <el-form-item
            label="人工审核车牌颜色"
            prop="plate_color"
          >
            <el-select
              v-model="ruleForm.plate_color"
              placeholder="请选择"
              clearable
            >
              <el-option
                v-for="item in optionsPage.plate_color"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item
            label="稽核车型"
            prop="vehicle_type"
            required
          >
            <el-select
              v-model="ruleForm.vehicle_type"
              clearable
              disabled
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
          :span="24"
          style="display: grid;grid-template-columns: repeat(4,1fr);gap: 10px;"
        >
          <el-form-item
            label="是否为大件车辆"
            prop="isnormel"
          >
            <el-select
              v-model="ruleForm.isnormel"
              clearable
              disabled
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
          <el-form-item
            label="车轴数"
            prop="axlecount"
          >
            <el-input
              v-model="ruleForm.axlecount"
              clearable
              disabled
              placeholder="请输入..."
            ></el-input>
          </el-form-item>
          <el-form-item
            label="通行收费(元)"
            prop="orginal_fee"
          >
            <li style="display: flex">
              <el-input
                v-model="ruleForm.orginal_fee"
                clearable
                disabled
                placeholder="请输入..."
              ></el-input>
              <el-button
                type="primary"
                size="mini"
                icon="el-icon-edit"
                @click="handleGetCurrentFree"
              >计费查询</el-button>
            </li>
          </el-form-item>
          <el-form-item
            label="实际费用(元)"
            prop="real_fee"
          >
            <el-input
              disabled
              v-model="ruleForm.real_fee"
              clearable
              placeholder="请输入..."
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col
          :span="12"
          style="display:grid;grid-template-columns: 1fr 1fr;"
        >
          <el-form-item
            label="补缴费用(元)"
            prop="owe_fee"
          >
            <el-input
              v-model="ruleForm.owe_fee"
              clearable
              placeholder="请输入..."
            ></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col style="color: #00a0e9;border-bottom: 1px solid #d8e6f5;margin-bottom:5px">车辆通行流水
          <el-button
            style="margin-left:0.9375rem"
            icon="el-icon-search"
            type="primary"
            plain
            size="mini"
            @click="getTrafficFlow"
          >查询</el-button></el-col>
        <div class="suspected">
          <el-table :data="suspectedData">
            <el-table-column
              v-for="column in supColums"
              :key="column.prop"
              :prop="column.prop"
              :label="column.title"
            ></el-table-column>
          </el-table>
        </div>
      </el-row>
      <el-row>
        <el-col style="color: #00a0e9;border-bottom: 1px solid #d8e6f5;margin-bottom:5px">发起人信息</el-col>
        <el-col
          :span="12"
          style="display: flex;justify-content: space-between;width: 43.5%"
        >
          <el-form-item
            label="发起人"
            prop="operator_name"
          >
            <div style="display: flex">
              <el-select
                clear
                v-model="ruleForm.operator_name"
                clearable
                required
                placeholder="请选择"
                @change="setOperInfo"
              >
                <el-option
                  v-for="item in operatorName"
                  :key="item.id"
                  :label="item.user_name"
                  :value="item.user_id"
                >
                </el-option>
              </el-select>
              <el-button
                type="primary"
                icon="el-icon-search"
                size="mini"
                @click="setPromoter"
              ></el-button>
            </div>
          </el-form-item>
           <el-form-item
            label="机构编号"
            prop="org_no"
          >
            <div style="display: flex">
              <el-select
                v-model="ruleForm.org_no"
                @clear="getPutOrgAll"
                clearable
                placeholder="请选择"
                @change="setDepOrd"
              >
                <el-option
                  v-for="item in optionsPageOrg"
                  :key="item.user_id"
                  :label="item.dept_name"
                  :value="item.dept_no"
                >
                </el-option>
              </el-select>
              <el-button
                type="primary"
                icon="el-icon-search"
                size="mini"
                @click="setInstituion"
              ></el-button>
            </div>
          </el-form-item>
          <!-- <el-form-item
            label="发起人id"
            prop="operator_id"
          >
            <el-input
              v-model="ruleForm.operator_id"
              clearable
              placeholder="请输入..."
            ></el-input>
          </el-form-item> -->
        </el-col>
        <!-- <el-col
          :span="12"
          style="display: flex;padding-left: 6.42%"
        >
         
          <el-form-item
            label="发起机构"
            prop="org_name"
          >
            <el-input
              v-model="ruleForm.org_name"
              clearable
              placeholder="请输入..."
            ></el-input>
          </el-form-item>
        </el-col> -->
        <!-- <el-col
          :span="12"
          style="display: flex;justify-content: space-between; width: 43.5%;"
        >
          <el-form-item
            label="机构类型"
            prop="org_type"
          >
            <el-select
              v-model="ruleForm.org_type"
              placeholder="请选择"
              clearable
            >
              <el-option
                v-for="item in optionsPage.org_type"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item
            label="发起省份"
            prop="province"
          >
            <el-input
              v-model="ruleForm.province"
              clearable
              placeholder="请输入..."
            ></el-input>
          </el-form-item>
        </el-col> -->
        <el-col
          :span="12"
          style="padding-left: 6.42%;"
        >
          <el-form-item
            label="责任主体"
            prop="province"
          >
            <el-select
              v-model="ruleForm.responsibility"
              clearable
              placeholder="请选择"
              style="width:100%;"
            >
              <el-option
                v-for="item in optionsPage.responsibility"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="是否欠费"
            prop="is_owe_fee"
          >
            <el-select
              v-model="ruleForm.is_owe_fee"
              clearable
              placeholder="请选择"
              style="width:84.3%"
            >
              <el-option
                v-for="item in optionsPage.is_owe_fee"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="证据是否充足"
            prop="is_sufficient_evidence"
          >
            <el-select
              v-model="ruleForm.is_sufficient_evidence"
              clearable
              placeholder="请选择"
              style="width:84.5%;"
            >
              <el-option
                v-for="item in optionsPage.is_sufficient_evidence"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <!-- <el-col :span="12">
          <el-form-item
            label="稽核车型"
            prop="vehicle_type"
            required
          >
            <el-select
              v-model="ruleForm.vehicle_type"
              clearable
              placeholder="请选择"
              style="width:84.3%"
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
        </el-col> -->
        <el-col :span="12">
          <el-form-item
            label="是否是发起方提交证据"
            prop="is_initiator_evidence"
          >
            <el-select
              v-model="ruleForm.is_initiator_evidence"
              clearable
              placeholder="请选择"
              style="width:84.5%;"
            >
              <el-option
                v-for="item in optionsPage.is_initiator_evidence"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="是否与发行数据一致"
            prop="is_match_issue"
          >
            <el-select
              v-model="ruleForm.is_match_issue"
              clearable
              placeholder="请选择"
              style="width:84.3%;"
            >
              <el-option
                v-for="item in optionsPage.is_match_issue"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="欠费类型"
            prop="owe_fee_type"
          >
            <el-select
              v-model="ruleForm.owe_fee_type"
              clearable
              placeholder="请选择"
              style="width:84.5%"
            >
              <el-option
                v-for="item in optionsPage.owe_fee_type"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>

        <el-col
          :span="12"
          v-if="false"
        >
          <el-form-item
            label="车辆用户类型"
            prop="vehicleusertype"
          >
            <el-select
              v-model="ruleForm.vehicleusertype"
              clearable
              placeholder="请选择"
              style="width:84.3%;"
              disabled
            >
              <el-option
                v-for="item in optionsPage.vehicleusertype"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col
          :span="12"
          v-if="false"
        >
          <el-form-item
            label="车种"
            prop="vehicleclass"
          >
            <el-select
              v-model="ruleForm.vehicleclass"
              clearable
              placeholder="请选择"
              style="width:84.5%"
              disabled
            >
              <el-option
                v-for="item in optionsPage.vehicleclass"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="证据附件编号"
            prop="order_evidence"
          >
            <el-input
              disabled
              v-model="ruleForm.order_evidence"
              clearable
              style="width:84.3%;"
              placeholder="请输入..."
            ></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col style="color: #00a0e9;border-bottom: 1px solid #d8e6f5;margin-bottom:5px">
          <span>证据上传</span><span
            style="font-size: 1.125rem;margin-left:0.5rem;cursor: pointer"
            @click="setPicMod"
          ><i class="el-icon-upload"></i></span>
        </el-col>
        <div
          class="pic_up"
          v-if="evidencePic.length > 0"
        >
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
      <el-row v-if="!isDetail">
        <el-col
          :span="24"
          style="display: flex;justify-content: center"
          class="cl_bts"
        >
          <el-button
            type="primary"
            icon="el-icon-check"
            size="mini"
            @click="handleSubmit"
          >提交</el-button>
          <el-button
            type="primary"
            icon="el-icon-refresh-left"
            size="mini"
            @click="restForm"
          >重置</el-button>
        </el-col>
      </el-row>
    </el-form>
    <promoterMod
      ref="proRef"
      :visible.sync="showModal"
      @getProMoterRow="getPromoterRow"
    />
    <institutionMod
      :inVisible.sync="showInsMod"
      @getInsRow="getInsTableRow"
    />
    <uploadPic
      :picVisible.sync="showPicMod"
      :objId="picIds"
      :files="evidencePic"
      @getSavePicInfo="getSavePicInfo"
    />

    <!-- 工单已存在覆盖层 -->
    <div
      v-if="showOrderExistOverlay"
      class="order-exist-overlay"
    >
      <div class="overlay-content">
        <div class="icon-container">
          <i
            class="el-icon-warning"
            style="font-size: 48px; color: #E6A23C;"
          ></i>
        </div>
        <h2 class="title">工单已存在</h2>
        <p class="message">该通行标识已经发起过工单，请勿重复提交</p>
        <div class="button-container">
          <el-button
            type="primary"
            size="medium"
            @click="closeCurrentPage"
            style="padding: 12px 24px; font-size: 14px;"
          >
            关闭页面
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { filterListByOption, formDataByGetInfo, formDataByInitText, SuspectedColumn, createOrderNo, formatFeeToYuan, formatFeeToFen } from './filterList'
import OrderApi from '@/pages/audit/api/order'
import promoterMod from "@/pages/audit/workdistribution/workFlow/promoter-mod.vue";
import institutionMod from "@/pages/audit/workdistribution/workFlow/institution-mod.vue";
import uploadPic from "@/pages/audit/workdistribution/workFlow/upload-pic.vue";
import moment from 'dayjs'
const orderUtils = new OrderApi()
import { mapGetters } from 'vuex';
import eventBus from '@/common/eventBus';

export default {
  name: "order-form",
  components: {
    promoterMod,
    institutionMod,
    uploadPic
  },
  data() {
    return {
      addV2: null,
      evidencePic: [],
      supColums: [],
      suspectedData: [],
      showInsMod: false,
      showModal: false,
      showPicMod: false,
      showOrderExistOverlay: false, // 控制工单已存在覆盖层的显示
      operatorName: [],
      optionsPageOrg: [], //机构编号
      optionsPage: {
        sus_escape_type: [],
        sus_plate_color: [],
        escape_type: [],
        media_type: [],
        order_type: [],
        plate_color: [],
        trade_vehicle_type: [],
        process_state: [], //工单处理状态
        recover_state: [], //追缴状态
        org_type: [],
        responsibility: [],
        is_owe_fee: [],
        is_sufficient_evidence: [],
        vehicle_type: [],
        is_initiator_evidence: [],
        is_match_issue: [],
        owe_fee_type: [],
        isnormel: [],
        has_evidence: [],
        vehicleusertype: [],
        vehicleclass: [],
        operator_name: [],
        org_no: []
      },
      pageNo: '',
      ruleForm: {
        owe_fee: '',                         //补缴费用
        axlecount: 0,                     //车轴数
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
        operator_id: '',                     //发起人id
        operator_name: "",                  //发起人姓名
        order_desc: "",
        order_no: '',//工单描述
        order_evidence: "",              //证据附件
        order_type: "",                   //工单类型
        org_id: '',                    //发起机构id
        org_name: "",                //发起机构名称
        org_no: "",                //机构编号
        org_type: "",              //机构类型
        orginal_fee: "",             //通行收费
        owe_fee_type: "",              //欠费类型
        pass_id: "",                  //通行标识
        pass_time: "",              //交易通行时间
        plate_color: "",            //人工审核车牌颜色
        province: "",               //发起省份
        real_fee: '',  //实际费用
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
      ruleFormRules: {
        vehicle_type: [
          { required: true, message: '请选择稽核车型', trigger: 'blur' }
        ],
      },
      restaurants: [],
      resDep: [],
      prUrl: '',
      preList: [],
      picIds: '',
      strTime: '',
      endTime: '',
      order_no: '',//工单编号
      operate_params: {},
      relevantList: []
    }
  },
  computed: {
    ...mapGetters('orderForm', [
      'getOrderForm'
    ]),
    isDetail() {
      return this.$route.query?.pageType === 'detail'
    },
  },
  methods: {
    handleUpdateOrderForm(ruleForm) {
    console.log('Received eventBus data:', ruleForm);
    if (!ruleForm) return;
    try {
      // 逐个属性设置确保响应式
      for (const key in ruleForm) {
        if (ruleForm.hasOwnProperty(key)) {
          // 处理axlecount类型转换和空值
          if (key === 'axlecount') {
            const value = ruleForm[key];
            // 空字符串或null时保持当前值，否则转换为数字
            const finalValue = value === '' || value === null ? this.ruleForm.axlecount : Number(value) || 0;
            // this.$set(this.ruleForm, key, finalValue);
            this.ruleForm = Object.assign(this.ruleForm, { axlecount: finalValue })
            console.log(`axlecount processed: ${value} → ${finalValue}`);
          } else {
            this.ruleForm = Object.assign(this.ruleForm, ruleForm)
            // this.$set(this.ruleForm, key, ruleForm[key]);
          }
        }
      }
      console.log('ruleForm updated:', this.ruleForm);
    } catch (error) {
      console.error('Error updating ruleForm:', error);
    }
  },
    //通行介质变化检测
    handleSetMedia() {
      this.initSpecialType()
    },
    //大件车辆类型判断
    handleSetBigCar() {
      this.initSpecialType()
    },
    setPicMod() {
      if(this.isDetail) return
      this.showPicMod = true
    },
    /**
     * @Description:获取所有信息下拉数据
     * @Author:Eirice
     * @Date: 2025-05-23 09:25:14
     */
    async getAllOptionsList() {
      let _this = this;
      orderUtils.getOrderFormList().then(res => {
        if (!res || res.data.state !== "SUCCESS") return
        this.addV2 = res.data.data
        let ls = res.data.data
        _this.pageNo = ls.vpage_no;
        let ops = ls.srv_cols
        _this.optionsPage = filterListByOption(ops, _this.optionsPage)
        window.sessionStorage.setItem('optionsPage', JSON.stringify(_this.optionsPage))
        _this.ruleForm = formDataByInitText(this.ruleForm, ops, 'init_expr')
        console.log('这里的ruleForm4444444444', _this.ruleForm)
         const cachedData = eventBus.getLatestData('updateOrderForm');
    if (cachedData) {
      this.handleUpdateOrderForm(cachedData);
    }
        console.log('123123', _this.ruleForm.user_no)
      }).catch(err => { })
    },
    handleSelect(item) {
      this.ruleForm.operator_name = item.user_name;
      this.ruleForm.operator_id = item.user_id;
    },

    //机构编号切换
    setDepOrd() {
      console.log(this.ruleForm.org_no);
      this.handleFilterPutOrg()
    },

    //发起人切换
    setOperInfo() {
      let dep = this.operatorName.map(k => {
        if (k.user_id === this.ruleForm.operator_id && this.ruleForm.operator_id !== '') {
          this.ruleForm.user_no = k.user_no
          console.log('这里的user_no', this.ruleForm.user_no)
          return k.dept_no
        } else {
          return false
        }
      })

      this.getDepSelectInfo(dep[0])
      if (this.ruleForm.operator_id === '') {
        this.ruleForm.org_no = ''
        this.ruleForm.org_name = ''
      }
    },
    /**
     * @Description:过滤获取当前选择机构的发起机构名称
     * @Author:Eirice
     * @Date: 2025-05-23 17:31:31
     */
    handleFilterPutOrg() {
      if (this.ruleForm.org_no === '') {
        { this.ruleForm.org_name = '' }
      }
      this.optionsPageOrg.map(d => {
        if (d.dept_no === this.ruleForm.org_no) {
          this.ruleForm.org_name = d.org_name ? d.org_name : d.dept_full_name;
        }
      })
    },

    /**
     * @Description:发起机构单独处理
     * @Author:Eirice
     * @Date: 2025-05-24 18:30:29
     */
    getPutOrgAll() {
      let _this = this;
      orderUtils.getMoirDepList().then(res => {
        if (res.data.state !== 'SUCCESS') return;
        let ls = res.data.data
        _this.ruleForm.org_type = ls[0].org_type ? (ls[0].org_type).toString() : "";
        _this.optionsPageOrg = res.data.data
        _this.ruleForm.org_no = ''
        _this.handleFilterPutOrg()

      }).catch(err => { })
    },

    /**
     * @Description:根据发起人信息获取的组织代码获取发起人组织信息
     * @Author:Eirice
     * @Date: 2025-05-23 15:54:36
     */
    getDepSelectInfo(dep) {
      let _this = this;
      let fnc = this.ruleForm.operator_id !== '' ? orderUtils.postPromoterInfo(dep) : orderUtils.getMoirDepList()
      fnc.then(res => {
        if (res.data.state !== 'SUCCESS') return;
        let ls = res.data.data
        _this.ruleForm.org_type = ls[0].org_type ? (ls[0].org_type).toString() : "";
        _this.optionsPageOrg = res.data.data
        _this.ruleForm.org_id = ls[0].org_id;
        if (dep) {
          _this.ruleForm.org_no = _this.optionsPageOrg[0].dept_no;
        } else {
          _this.ruleForm.org_no = ''
        }
        _this.ruleForm.order_no = createOrderNo(_this.ruleForm.org_id)
        console.log('生成的工单编号', _this.ruleForm.order_no)
        _this.handleFilterPutOrg()

      }).catch(err => { })
    },
    initQuerySearch() {
      let _this = this;
      orderUtils.getPromoterInfo().then(res => {
        if (res.data.state !== 'SUCCESS') {
          return;
        }
        _this.operatorName = res.data.data;
        _this.ruleForm.operator_name = _this.operatorName[0].user_name;
        _this.ruleForm.operator_id = _this.operatorName[0].user_id;
        _this.ruleForm.user_no = _this.operatorName[0].user_no;
        _this.getDepSelectInfo(_this.operatorName[0].dept_no)
        console.log('这里的user_no', this.ruleForm.user_no)
      }).catch(err => {
      });
    },
    // 20251014调整取值逻辑，通过passid去调用接口去获取初始化参数
    async initForm() {
      if(this.isDetail){
        this.order_no = this.$route.query?.order_no
        const resOrder = await this.getWorkOrderDetail()
        if(resOrder){
           console.log(resOrder, 3333333)
           this.ruleForm = formDataByGetInfo(this.ruleForm, resOrder[0])
           this.ruleForm.vehicle_type = resOrder[0]._trade_vehicle_type_disp
           this.initSpecialType()
        this.handleChangeFee()
        this.ruleForm.owe_fee = formatFeeToYuan(this.ruleForm.owe_fee);
        this.ruleForm.orginal_fee = formatFeeToYuan(this.ruleForm.orginal_fee)
        this.ruleForm.real_fee = formatFeeToYuan(this.ruleForm.real_fee);
        this.getTrafficFlow()
        const pass_time2 = this.ruleForm.pass_id.slice(22, 30)
        const formattedDate2 = pass_time2.slice(0, 4) + '-' + pass_time2.slice(4, 6) + '-' + pass_time2.slice(6, 8);
        
        this.strTime = moment(formattedDate2).subtract(1, 'days').format('YYYY-MM-DD HH:mm:ss');
          this.endTime = moment(formattedDate2).add(1, 'days').format('YYYY-MM-DD HH:mm:ss');
        this.getRelevantInfo()
        }
      }else{
         let operate_params = this.getOperateParams();
      if(operate_params){
        operate_params = JSON.parse(operate_params).data;
        console.log(operate_params, 999999)
      if (operate_params) {
        // 处理时间参数
        const passTime = operate_params[0].pass_time;
        if (passTime) {
          this.strTime = moment(passTime).subtract(10, 'days').format('YYYY-MM-DD HH:mm:ss');
          this.endTime = moment(passTime).add(60, 'days').format('YYYY-MM-DD HH:mm:ss');
          console.log('计算的时间范围：', { startTime: this.strTime, endTime: this.endTime });
        }
        // this.ruleForm = formDataByGetInfo(this.ruleForm, operate_params[0])
        this.initSpecialType()
        this.handleChangeFee()
        this.ruleForm.owe_fee = formatFeeToYuan(this.ruleForm.owe_fee);
        this.ruleForm.orginal_fee = formatFeeToYuan(this.ruleForm.orginal_fee)
        this.ruleForm.real_fee = formatFeeToYuan(this.ruleForm.real_fee);
        this.getTrafficFlow()
      }
      }else{
        let pass_id = this.$route.query.pass_id;
        this.ruleForm.pass_id = pass_id
        if(pass_id){
        
        const pass_time = pass_id.slice(22, 30)
        const formattedDate = pass_time.slice(0, 4) + '-' + pass_time.slice(4, 6) + '-' + pass_time.slice(6, 8);
        
        this.strTime = moment(formattedDate).subtract(1, 'year').format('YYYY-MM-DD HH:mm:ss');
        this.endTime = moment(formattedDate).format('YYYY-MM-DD HH:mm:ss');
        const res = await this.getSusvehPassInfo()
        console.log(this.ruleForm.pass_id, 2222222222)
        if(res&&res.length>0){
          this.operate_params = res[0]
          this.ruleForm = formDataByGetInfo(this.ruleForm, resdata[0])
          this.ruleForm.media_no = res[0].obusn
          this.ruleForm.media_type = res[0].mediatype
          this.ruleForm.pass_time = res[0].extime
          // this.ruleForm.sus_escape_type = res[0].escape_type
          this.ruleForm.sus_plate_color = res[0].vehicleplate_color
          this.ruleForm.sus_vehicle_id = res[0].vehicleplate_no
          this.ruleForm.suspicion_id = res[0].suspectid
          this.ruleForm.vehicleclass = res[0].envehicleclass
          this.ruleForm.vehicleusertype = res[0].vehicleusertype
        this.initSpecialType()
        this.handleChangeFee()
        this.ruleForm.owe_fee = formatFeeToYuan(this.ruleForm.owe_fee);
        this.ruleForm.orginal_fee = formatFeeToYuan(this.ruleForm.orginal_fee)
        this.getTrafficFlow()
        }else{
          console.log('这里的pass_id', pass_id)
          this.strTime = moment(formattedDate).subtract(1, 'days').format('YYYY-MM-DD HH:mm:ss');
        this.endTime = moment(formattedDate).add(1, 'days').format('YYYY-MM-DD HH:mm:ss');
        const resdata = await this.getPassconvInfo()
        if(resdata&&resdata.length>0){
          this.operate_params = resdata[0]
          // this.ruleForm = formDataByGetInfo(this.ruleForm, resdata[0])
          this.ruleForm.media_no = resdata[0].obusn
          this.ruleForm.media_type = resdata[0].mediatype
          this.ruleForm.pass_time = resdata[0].extime
          const realfee = await this.getWorkorderFeeInfo()
        console.log(realfee, 1111111)
        if(realfee&&realfee.length>0){
          this.ruleForm.real_fee = formatFeeToYuan(realfee[0].real_fee)
        }else{
          this.ruleForm.real_fee = resdata[0].fee
        }
          
          // this.ruleForm.sus_escape_type = resdata[0].escape_type
          this.ruleForm.sus_plate_color = resdata[0].vehicleplate_color
          this.ruleForm.sus_vehicle_id = resdata[0].vehicleplate_no
          // this.ruleForm.suspicion_id = resdata[0].suspectid
          // this.ruleForm.vehicleclass = resdata[0].envehicleclass
          this.ruleForm.vehicleusertype = resdata[0].vehicleusertype
          this.initSpecialType()
        this.handleChangeFee()
        this.ruleForm.owe_fee = formatFeeToYuan(this.ruleForm.owe_fee);
        this.ruleForm.orginal_fee = formatFeeToYuan(this.ruleForm.orginal_fee)
        // this.ruleForm.real_fee = formatFeeToYuan(this.ruleForm.real_fee);
        this.getTrafficFlow()
        }
        }
      }
    }
      }
     
    },
    setPromoter() {
      this.showModal = true;
    },
    setInstituion() {
      this.showInsMod = true;
    },
    getPromoterRow(row) {
      this.operatorName = [row];
      // this.ruleForm.operator_name= this.operatorName[0].user_id;
      this.ruleForm.operator_name = this.operatorName[0].user_name;
      this.ruleForm.operator_id = this.operatorName[0].user_id;
      this.setOperInfo();
    },
    getInsTableRow(row) {
      this.optionsPageOrg = [row];
      this.ruleForm.org_no = this.optionsPageOrg[0].dept_no;
      this.handleFilterPutOrg();
    },
    handleSetEmpty() {
      this.handleChangeFee()
      const result = Object.keys(this.ruleForm).reduce((acc, key) => {
        if (this.ruleForm[key] !== null && this.ruleForm[key] !== undefined && this.ruleForm[key] !== '') {
          acc[key] = this.ruleForm[key];
        }
        return acc;
      }, {});
      return result;
    },
    async handleSubmit() {
      let isValid = await this.$refs.ruleForm.validate();
      console.log(isValid, 1111111)
      if (!isValid) return;
      this.handleTest()
    },
    //提交工单前进行通行测试，当返回有数据时不允许提交，无返回数据时可以正常走下一步提交
    handleTest() {
      console.log('当前表单提交信息', this.handleSetEmpty());
      let obj = this.handleSetEmpty()
      obj.owe_fee = formatFeeToFen(this.ruleForm.owe_fee);
      obj.orginal_fee = formatFeeToFen(this.ruleForm.orginal_fee)
      obj.real_fee = formatFeeToFen(this.ruleForm.real_fee);
      console.log('转换后的表单提交信息', obj);
      orderUtils.handleTestOrder({ pass_id: this.ruleForm.pass_id }).then(res => {
        if (res.data.state !== 'SUCCESS') return;
        let ls = res.data.data
        if (ls && ls.length === 0) {
          orderUtils.handleSubmitOrder([obj]).then(res => {
            if (res.data.state !== 'SUCCESS') {
              if(res.data.resultMessage.indexOf('组织ID不能为空')>-1){
                this.$message.error('请选择发起人');
                return;
              }
              this.$message.error('工单保存失败:' + res.data.resultMessage);
              return;
            };
            this.$message.success('工单保存成功');
          }).catch(err => {
            this.$message.error('提交异常，请检查');
          })
        } else {
          this.$message.error('当前工单已存在提交记录，请无重复提交');
        }
        console.log('当前表单提交信息', obj);
      }).catch(err => { })
    },
    //获取上传图片信息
    getPicList(list) {
      console.log('获取到了上传的图', list);
      // this.evidencePic(list)
    },
    /**
     * @Description:针对保存后的证据图片进行二次获取校验
     * @Author:Eirice
     * @Date: 2025-05-27 16:08:43
     */
    getSavePicInfo(list) {
      let _this = this;
      _this.evidencePic = []
      _this.picIds = '';
      _this.preList = [];
      let fle_no = list ? list.effect_data[0].icon_att : _this.ruleForm.order_evidence.length > 0 ? _this.ruleForm.order_evidence : '';
      _this.ruleForm.order_evidence = fle_no;
      // _this.picIds=list?list.effect_data[0].id:''
      // if(_this.picIds&&typeof _this.picIds==="number"){
      //    _this.picIds=_this.picIds.toString();
      // }
      let option = {
        relation_condition: {},
        condition: [{ colName: "is_delete", value: "1", ruleType: "eq" }, { colName: "file_no", value: fle_no, ruleType: "eq" }]
      }
      orderUtils.getCurrentPicInfo(option).then(res => {
        if (res.data.state !== 'SUCCESS') return
        let ls = res.data.data
        ls.map(d => {
          d.url = _this.prUrl + d.fileurl;
        })
        _this.evidencePic = [...ls];
        _this.evidencePic.map(item => { _this.preList.push(item.url) })
        console.log('组装好了', this.preList);
      }).catch(err => { });
    },
    //下载
    dowmlaodUrl(item) {
      window.open(item);
    },
    /**
     * @Description:根据携带进入的passid进行车辆通行流水查询
     * @Author:Eirice
     * @Date: 2025-05-30 10:32:53
     */
    getTrafficFlow() {
      this.suspectedData = [];
      let cadn = {
        condition: [{ colName: "passid", ruleType: "like", value: this.ruleForm.pass_id }],
        divCond: [{ colName: "createtime", ruleType: "between", value: [this.strTime, this.endTime] },]
      }
      orderUtils.getCarWaysInfo(cadn).then(res => {
        if (res.data.state !== 'SUCCESS') return;
        this.suspectedData = res.data.data ? res.data.data : []
        console.log('获取到流水', this.suspectedData)
        if (this.suspectedData?.[0]?.vehicletype) {
          this.ruleForm.trade_vehicle_type = this.suspectedData[0].vehicletype + ''
        }
      }).catch(err => { })
    },

    //20251014 调整逻辑由页面路由直接获取数据改为通过passid调接口获取
    //根据passid获取页面多字段数据
    async getSusPassconvInfo() {
      let obj = {
        condition: [{ colName: "passid",ruleType: "eq", value: this.ruleForm.pass_id }],
        divCond: [{ colName: "createtime", ruleType: "between", value: [this.strTime, this.endTime] },]
      }
      const res = await orderUtils.getSusPassconvInfo(obj)
      if(res.data){
        return res.data.data ? res.data.data : []
      }
    },
    //根据订单id去查询工单详情
    async getWorkOrderDetail() {
      let obj = {
        condition: [{ colName: "order_no",ruleType: "eq", value: "BO202504251528555470001" }],
      }
      const res = await orderUtils.getWorkOrderDetail(obj)
      if(res.data){
        return res.data.data ? res.data.data : []
      }
    },
    //根据passid查询年表，分表查询条件为当前年和上一年获取页面多字段数据
     async getSusvehPassInfo() {
      let obj = {
        condition: [{ colName: "passid",ruleType: "eq", value: this.ruleForm.pass_id }],
        divCond: [{ colName: "createtime", ruleType: "between", value: [this.strTime, this.endTime] },]
      }
      try {
        const res = await orderUtils.getSusvehPassInfo(obj)
        if(res.data){
          return res.data.data ? res.data.data : []
        }
      } catch (error) {
        const pass_time = this.ruleForm.pass_id.slice(22, 30)
        const formattedDate = pass_time.slice(0, 4) + '-' + pass_time.slice(4, 6) + '-' + pass_time.slice(6, 8);
        
        this.strTime = moment(formattedDate).subtract(1, 'days').format('YYYY-MM-DD HH:mm:ss');
        this.endTime = moment(formattedDate).add(1, 'days').format('YYYY-MM-DD HH:mm:ss');
        return await this.getPassconvInfo()
      }
    },
    //根据passid查询日表，分表查询条件为前后一天获取页面多字段数据
     async getPassconvInfo() {
      let obj = {
        condition: [{ colName: "passid",ruleType: "eq", value: this.ruleForm.pass_id }],
        divCond: [{ colName: "entime", ruleType: "between", value: [this.strTime, this.endTime] },]
      }
      const res = await orderUtils.getPassconvInfo(obj)
      if(res.data){
        return res.data.data ? res.data.data : []
      }
    },
     //根据passid查询实际费用
     async getWorkorderFeeInfo() {
      let obj = {
        condition: [{ colName: "passid",ruleType: "eq", value: this.ruleForm.pass_id }],
        divCond: [{ colName: "createtime", ruleType: "between", value: [this.strTime, this.endTime] },]
      }
      const res = await orderUtils.getWorkorderFeeInfo(obj)
      if(res.data){
        return res.data.data ? res.data.data : []
      }
    },
    /**
     * @Description:计费查询使用
     * @Author:Eirice
     * @Date: 2025-06-06 17:23:48
     */
    handleGetCurrentFree() {

      if (this.ruleForm.vehicle_type === '') {
        this.$message.error('请在下方发起人信息栏，选择稽核车型后再进行计费查询！');
      }
      let obj = {
        pass_id: this.ruleForm.pass_id,
        vehicleusertype: this.ruleForm.vehicleusertype,
        vehicleclass: this.ruleForm.vehicleclass,
        vehicle_type: this.ruleForm.vehicle_type,
        axleCount: this.ruleForm.axlecount
      }
      orderUtils.getDriverFreeDetails(obj).then(res => {
        if (res.data.code !== 0) return;
        if (res.data.messageInfo && res.data.messageInfo.tollDetail) {
          let ls = res.data.messageInfo.tollDetail[0]
          this.ruleForm.orginal_fee = formatFeeToYuan(ls.fee)
          this.handleChangeFee()
        }
      }).catch(err => { })
      console.log('查询计费使用的passid', this.ruleForm.pass_id)
    },

    /**
     * @Description:计费查询后续处理
     * @Author:Eirice
     * @Date: 2025-06-10 09:45:17
     */
    handleChangeFee() {
      const originalFee = typeof this.ruleForm.orginal_fee === 'string' ? parseFloat(this.ruleForm.orginal_fee) : this.ruleForm.orginal_fee;
      const realFee = typeof this.ruleForm.real_fee === 'string' ? parseFloat(this.ruleForm.real_fee) : this.ruleForm.real_fee;
      if (!isNaN(originalFee) && !isNaN(realFee)) {
        const diff = originalFee - realFee;
        this.ruleForm.owe_fee = diff > 0 ? diff : 0;
      } else {
        this.ruleForm.owe_fee = 0; // 如果任一费用无效，补缴费用设为0
      }
    },
    //通过通行介质类型及是否为大件车辆设置默认的车辆用户类型及车种
    initSpecialType() {
      let eclass = null;
      let sertype = null
      let operate_params = this.getOperateParams();
      operate_params = JSON.parse(operate_params).data;
      if (operate_params) {
        eclass = operate_params[0]?.vehicleclass
        sertype = operate_params[0]?.vehicleusertype
      }else{
        eclass = this.operate_params.vehicleclass
        sertype = this.operate_params.vehicleusertype
      }
      if (this.ruleForm.media_type !== '' && this.ruleForm.isnormel !== '') {
        if (this.ruleForm.media_type === '1' && this.ruleForm.isnormel === '1') {
          this.ruleForm.vehicleusertype = '25';
        }
        else if (this.ruleForm.media_type === '2' && this.ruleForm.isnormel === '1') {
          this.ruleForm.vehicleclass = '25';
        }
        else {
          this.ruleForm.vehicleusertype = sertype ? sertype : '0';
          this.ruleForm.vehicleclass = eclass ? eclass : '0';
        }
      } else {
        this.ruleForm.vehicleusertype = sertype ? sertype : '0';
        this.ruleForm.vehicleclass = eclass ? eclass : '0';
      }
    },
    //重置条件
    restForm() {
      const sel = ['sus_vehicle_id', 'sus_escape_type', 'pass_time', 'sus_plate_color', 'pass_id', 'real_fee', 'org_id', 'org_name', 'org_no', 'org_type', 'province', 'operator_name', 'operator_id', 'order_no']
      Object.keys(this.ruleForm).forEach(key => {
        if (!sel.includes(key)) {
          this.ruleForm[key] = ''
        }
        if (key === 'axlecount') {
          this.ruleForm[key] = 0
        }
      })
      this.evidencePic = []
      this.preList = []
      this.picIds = ''
    },
    //获取经营管理单位列列表数据
    getRelevantInfo() {
      let obj = {
        condition: [{ colName: "passid", ruleType: "eq", value: this.ruleForm.pass_id }],
        divCond: [{ colName: "create_time", ruleType: "between", value: [this.strTime, this.endTime] }],

      }
      orderUtils.getRelevantList(obj).then(res => {
        if (res.data.state !== 'SUCCESS') return;
        let ls = res.data.data;
        let ids = []
        if (ls) {
          ls.map(d => {
            d.select = true
            ids.push(d.id)
          })
        }
        this.relevantList = ls
        this.ruleForm.relevant_org = ids.join(',')
        console.log('经营单位id', this.ruleForm.relevant_org)

      }).catch(err => { })
    },
    //经营单位删除后数据更新
    handleClose(item) {
      const index = this.relevantList.findIndex(i => i.id === item.id);
      if (index > -1) {
        this.relevantList.splice(index, 1);
      }
      let ids = [];
      if (this.relevantList.length === 0) {
        this.ruleForm.relevant_org = '';
      } else {
        this.relevantList.map(k => {
          ids.push(k.id);
        });
        this.ruleForm.relevant_org = ids.join(',');
      }
    },

    // 关闭当前页面
    closeCurrentPage() {
      const tab = top.window?.tab
      if (tab && tab.closeCurrentTab && tab.getCurrentTab) {
        tab.closeCurrentTab(tab.getCurrentTab())
      } else {
        this.$message.error('关闭失败,请尝试手动关闭标签页')
      }
    }
  },

  created() {
    try {
      this.prUrl = orderUtils.dowPicInfoUrl();
      
    } catch (error) {
    }
  },
  mounted() {
    // Check for cached event data
    this.supColums = SuspectedColumn()
    this.getAllOptionsList()
    this.initForm()
    this.initQuerySearch()
    this.getSavePicInfo(null)
    this.getRelevantInfo();
    //从如果store有存储，从store 中获取一次填入到表单中
    let base = this.getOrderForm;
    if (base) {
      this.ruleForm = { ...base }
    }
    orderUtils.checkOrderExist(this.ruleForm.pass_id).then(res => {
      if (res === true) {
        // 工单已经发起过了
        if(this.isDetail) return
        this.showOrderExistOverlay = true;
      }
    })
  },
  beforeDestroy() {
    eventBus.$off('updateOrderForm', this.handleUpdateOrderForm);
    this.$store.commit('orderForm/handleSetOrderForm', this.ruleForm)
  }
}
</script>


<style scoped lang="scss">
.work_flow {
  width: 100%;
  height: 100%;
  overflow: auto;
  padding: 1.5625rem 0;
}

.pic_up {
  padding: 0.625rem;
}

.vant_org {
  width: 85%;
  height: 4.6875rem;
  border: 1px solid #ace;
  overflow: auto;
}
</style>
<style>
.work_flow .el-form-item {
  margin-bottom: 0.3125rem !important;
}

@media screen and (min-width: 768px) and (max-width: 1250px) {
  .work_flow .el-col {
    display: block !important;
    padding-left: 0 !important;
    width: 100% !important;

    .vant_org {
      width: 100%;
    }
  }

  .work_flow .el-form-item {
    margin-left: 0 !important;
    width: 100% !important;
  }

  .work_flow .el-form-item .el-select {
    width: 100% !important;
  }

  .work_flow .el-form-item .el-input {
    width: 100% !important;
  }

  .work_flow .cl_bts {
    display: flex !important;
    justify-content: center !important;
  }
}

.el-upload-list {
  border: none !important;
}

.el-upload-list__item:hover {
  .img_bts {
    display: flex;
    transition: all .3s;
  }
}

.img_bts {
  transition: all .3s;
  opacity: 0;
  display: none;
  width: 100%;
  height: 2.1875rem;
  position: absolute;
  z-index: 20;
  background: #212122;
  top: 75%;
  opacity: .5;
  color: #fff;
  font-size: 1.125rem;
  padding: 0 0.625rem;
  justify-content: center;
  align-items: center;
  cursor: pointer;

  >span {
    margin: 0 0.5rem;
  }
}

.el-form-item__content .el-select {
  width: 100%;
}

/* 工单已存在覆盖层样式 */
.order-exist-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(2px);
  z-index: 99;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s ease-in-out;
}

.overlay-content {
  background: #ffffff;
  border-radius: 12px;
  padding: 40px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 400px;
  width: 90%;
  animation: slideUp 0.3s ease-out;
}

.icon-container {
  margin-bottom: 20px;
}

.title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 16px 0;
  line-height: 1.4;
}

.message {
  font-size: 16px;
  color: #606266;
  margin: 0 0 30px 0;
  line-height: 1.6;
}

.button-container {
  display: flex;
  justify-content: center;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(30px);
    opacity: 0;
  }

  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>