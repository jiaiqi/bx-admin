<template>
  <div
    class="pay_info"
    v-loading="showLoading"
    :element-loading-text="loadingText"
    element-loading-spinner="el-icon-loading"
  >
    <div
      class="pay_tep"
      v-if="!handleStatus"
    >
    <form :model="payInfo">
      <el-row
        :gutter="20"
        style="margin:5px 0"
      >
        <el-col
          :span="6"
          style="text-align: right;"
        ><span class="col_t">支付类型：</span></el-col>
        <el-col :span="16">
          <div>
            <el-radio-group
              v-model="payStep"
              @change="chengPayWay"
            >
              <el-radio 
                 v-for="(item, index) in payWays"
                 :key="item.code"
                 :label="item.code"
                 :disabled="disabledIndexes.includes(index)"
               >
                 {{ item.label }}
               </el-radio>
            </el-radio-group>
          </div>
        </el-col>
      </el-row>
      <el-row
        :gutter="20"
        style="margin:5px 0"
      >
        <el-col
          :span="6"
          style="text-align: right;"
        >
          <span class="col_t">费用明细：</span>
        </el-col>
        <el-col :span="16">
          <div class="info_list">
            <div class="info_t">
              <span>费用项</span>
              <span>金额(元)</span>
            </div>
            <div
              class="info_row_pay"
              v-if="orderList.length > 0"
            >
              <div
                class="pay_col"
                v-for="(item, index) in orderList"
                :key="item.su_order_no"
              >
                <span
                  class="des_pay"
                  :title="item.item_name"
                >{{ item.item_name }}</span>
                <span class="count_pay">{{ item.total_fee }}</span>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
      <el-row
        :gutter="20"
        style="margin:5px 0"
      >
        <el-col
          :span="6"
          style="text-align: right;"
        ><span class="col_t">待支付金额：</span></el-col>
        <el-col :span="16"><span class="ped_pay">{{ '￥' + formatAmount(payInfo.pending_amount) }}</span></el-col>
      </el-row>
       <el-row
        :gutter="20"
        style="margin:5px 0"
        v-if="payStep === 1"
      >
        <el-col
          :span="6"
          style="text-align: right;"
        ><span class="col_t">支付方式：</span></el-col>
        <el-col :span="16">
          <div>
            <el-radio-group
              v-model="payType"
              @change="chengPayType"
            >
              <el-radio
                v-for="(item, index) in payOption"
                :key="item.code"
                :label="item.code"
              >
                {{ item.label }}
              </el-radio>
            </el-radio-group>
          </div>
        </el-col>
      </el-row>
      <template v-if="payType === 2||payStep !== 1">
        <el-row
        :gutter="20"
        style="margin:5px 0"
        v-if="payStep !== 2"
      >
        <el-col
          :span="6"
          style="text-align: right;"
        >
        <span class="requireds">*</span>
        <span class="col_t">确认支付金额：</span></el-col>
        <el-col :span="16">
          <span>
            <el-input
              size="mini"
              placeholder="请输入支付金额"
              v-model="payInfo.pay_amount"
              @blur="validatePayAmount"
              @input="handleInputChange"
              required
              style="width:95%"
            ></el-input>
            元
            <div
              v-if="validationError"
              class="validation-error"
            >{{ validationError }}</div>
          </span>
        </el-col>
      </el-row>
      <el-row
        :gutter="20"
        style="margin:5px 0"
      >
        <el-col
          :span="6"
          style="text-align: right;"
        ><span class="col_t">支付备注信息：</span></el-col>
        <el-col :span="16">
          <span>
            <el-input
              type="textarea"
              :rows="4"
              placeholder="请输入内容"
              v-model="payInfo.pay_remark"
            >
            </el-input>
          </span>
        </el-col>
      </el-row>
      <el-row
        :gutter="20"
        style="margin:5px 0"
      >
        <el-col
          :span="6"
          style="text-align: right;"
        >
        <span class="requiredss">*</span>
        <span class="col_t">付款人姓名：</span></el-col>
        <el-col :span="16"><span><el-input
              required
              @blur="validatePayUser"
              placeholder="请输入...."
              v-model="payInfo.pay_user"
            ></el-input>
          <div
              v-if="validationError1"
              class="validation-error"
            >{{ validationError1 }}</div>
          </span></el-col>
      </el-row>
      <el-row
        :gutter="20"
        style="margin:5px 0"
        v-if="payStep !== 2"
      >
        <el-col
          :span="6"
          style="text-align: right;"
        ><span class="col_t">支付凭证：</span></el-col>
        <el-col :span="16">
           <upload-image
              ref="uploadImages"
              :field="getUploadField(payInfo)"
              @change="imgChange($event, payInfo.pay_voucher)"
            />
        </el-col>
      </el-row>
      </template>
      <!-- <el-row>
        <el-col :span="8"
          style="text-align: right;">
           <el-button
          type="primary"
          size="mini"
          v-if="payType === 1&&payStep === 1&&submitvisible"
          @click="handlePayType"
        >提交</el-button>
        </el-col>
      </el-row> -->
      </form>
      <div v-if="!submitvisible&&payStep === 1&&payType === 1">
         <el-row
        :gutter="20"
        style="margin:5px 0"
      >
        <el-col
          :span="6"
          style="text-align: right;"
        >
        <span class="col_t">订单号：</span></el-col>
        <el-col :span="16">
          <span class="col_t">{{ PayPublicOrder?.order_no || '' }}  </span>
         <el-tooltip v-if="PayPublicOrder?.order_no" effect="light" content="复制成功" placement="top" v-model="copyTooltipVisible['order_no']" manual>
       <el-button
        icon="el-icon-copy-document"
        size="mini"
        type="text"
        @click="handleCopy(PayPublicOrder?.order_no, 'order_no')">
        </el-button>
        </el-tooltip>
        </el-col>
      </el-row>
       <el-row
        :gutter="20"
        style="margin:5px 0"
      >
        <el-col
          :span="6"
          style="text-align: right;"
        >
        <span class="col_t">匹配码：</span></el-col>
        <el-col :span="16">
          <span class="col_t">{{ PayPublicOrder?.mtchCd || '' }}
          </span>
         <el-tooltip v-if="PayPublicOrder?.mtchCd" effect="light" content="复制成功" placement="top" v-model="copyTooltipVisible['mtchCd']" manual>
       <el-button
        icon="el-icon-copy-document"
        size="mini"
        type="text"
        @click="handleCopy(PayPublicOrder?.mtchCd, 'mtchCd')">
        </el-button>
        </el-tooltip>
        </el-col>
      </el-row>
       <el-row
        :gutter="20"
        style="margin:5px 0"
      >
        <el-col
          :span="6"
          style="text-align: right;"
        >
        <span class="col_t">商户结算户账号：</span></el-col>
        <el-col :span="16">
          <span class="col_t">{{ PayPublicOrder?.mrchStlAcctNo || '' }}
          </span>
        <el-tooltip v-if="PayPublicOrder?.mrchStlAcctNo" effect="light" content="复制成功" placement="top" v-model="copyTooltipVisible['mrchStlAcctNo']" manual>
       <el-button
        icon="el-icon-copy-document"
        size="mini"
        type="text"
        @click="handleCopy(PayPublicOrder?.mrchStlAcctNo, 'mrchStlAcctNo')">
        </el-button>
        </el-tooltip>
        </el-col>
      </el-row>
       <el-row
        :gutter="20"
        style="margin:5px 0"
      >
        <el-col
          :span="6"
          style="text-align: right;"
        >
        <span class="col_t">商户结算户户名：</span></el-col>
        <el-col :span="16">
          <span class="col_t">{{ PayPublicOrder?.mrchStlAcctNm || '' }}
          </span>
         <el-tooltip v-if="PayPublicOrder?.mrchStlAcctNm" effect="light" content="复制成功" placement="top" v-model="copyTooltipVisible['mrchStlAcctNm']" manual>
       <el-button
        icon="el-icon-copy-document"
        size="mini"
        type="text"
        @click="handleCopy(PayPublicOrder?.mrchStlAcctNm, 'mrchStlAcctNm')">
        </el-button>
        </el-tooltip>
        </el-col>
      </el-row>
       <el-row
        :gutter="20"
        style="margin:5px 0"
      >
        <el-col
          :span="6"
          style="text-align: right;"
        >
        <span class="col_t">总行行号：</span></el-col>
        <el-col :span="16">
          <span class="col_t">{{ PayPublicOrder?.recBnkNo || '313791000015' }}
          </span>
         <el-tooltip effect="light" content="复制成功" placement="top" v-model="copyTooltipVisible['recBnkNo']" manual>
       <el-button
        icon="el-icon-copy-document"
        size="mini"
        type="text"
        @click="handleCopy(PayPublicOrder?.recBnkNo, 'recBnkNo')">
        </el-button>
        </el-tooltip>
        </el-col>
      </el-row>
       <el-row
        :gutter="20"
        style="margin:5px 0"
      >
        <el-col
          :span="6"
          style="text-align: right;"
        >
        <span class="col_t">总行行名：</span></el-col>
        <el-col :span="16">
          <span class="col_t">{{ PayPublicOrder?.recBnkNm || '西安银行股份有限公司' }}
          </span>
         <el-tooltip effect="light" content="复制成功" placement="top" v-model="copyTooltipVisible['recBnkNm']" manual>
       <el-button
        icon="el-icon-copy-document"
        size="mini"
        type="text"
        @click="handleCopy(PayPublicOrder?.recBnkNm, 'recBnkNm')">
        </el-button>
        </el-tooltip>
        </el-col>
      </el-row>
      <div class="tips-container">
          <el-icon class="tips-icon el-icon-info"></el-icon>
          <div class="tips-content">请您通过企业对公账户完成转账，务必在转账附言中填写匹配码，
            系统会根据匹配码自动匹配您的订单。若转账后 24 小时内订单状态未更新，
            可联系客服提供匹配码查询进度。</div>
        </div>
      </div>
     
      <!--二维码生成区域-->
      <div
        class="qrcode_info"
        v-if="isShowQrcode"
      >
        <div class="qr_text">
          请尽快扫描二维码完成支付
        </div>
        <div
          class="qc_cot"
          v-if="qrcodeInfo.qrCd"
        >
          <qr-code
            :text="qrcodeInfo.qrCd"
            :size="130"
          />
        </div>
      </div>
      <div class="pay_bts">
        <el-button
          size="mini"
          style="margin:0 0.5rem"
          v-if="!qrcodeInfo.qrCd"
          @click="closePayment"
        >取消</el-button>
          <el-button
          type="primary"
          size="mini"
          v-if="payType === 1&&payStep === 1&&submitvisible"
          @click="handlePayType"
        >提交</el-button>
        <el-button
          type="primary"
          size="mini"
          v-if="!qrcodeInfo.qrCd&&(payType === 2||payStep===2||payStep===3)"
          @click="handleSubmit"
        >提交</el-button>
        <el-button
          type="primary"
          size="mini"
          v-if="payStep===1&&payType === 1&&!submitvisible"
          @click="closePayment"
        >关闭</el-button>
      </div>
    </div>
    <div
      class="pay_status"
      v-if="handleStatus"
    >
      <pay-status
        :status="stepStatus"
        :statusText="statusText"
        :payAmount="payInfo.pay_amount"
        @handleBack="handleBack"
        @closePayment="closePayment"
      ></pay-status>
    </div>
  </div>
</template>

<script>
import payment from './payment';
const payUtils = new payment();
import QrCode from "@/pages/datav/component/page-item/qr-code/qr-code.vue";
import payStatus from "@/components/common/payment/pay-status.vue";
import UploadImage from '../../ui/upload-image.vue';
export default {
  name: "payment-popup",
  components: {
    QrCode,
    payStatus,
    UploadImage
  },
  data() {
    return {
      disabledIndexes: [],
      statusText: "",
      copyTooltipVisible: {},
      handleStatus: false,
      stepStatus: false,
      submitvisible: true,
      showLoading: false,
      loadingText: '支付码生成中....',
      isShowQrcode: false,
      payStep: 2,
      payType:1,
      payOption:[
        {
          code: 1,
          label: "线上",
        },
        {
          code: 2,
          label: "线下",
        },
      ],
      PayPublicOrder:null,
      payWays: [
        {
          code: 1,
          label: "公户转账",
        },
        {
          code: 2,
          label: "扫描支付",
        },
        {
          code: 3,
          label: "个人支付",
        },
      ],
      qrcodeInfo: {
        qrCd: null,     //二维码地址
        odrNo: null,    //订单编号
        transAddnInfo: null //附加信息
      },
      orderList: [],
      parkList: [],
      payInfo: {
        pending_amount: 0,  //待支付金额
        pay_amount: '',  //付款金额
        pay_user: '',  //付款人
        pay_remark: '', //付款备注,
        pay_voucher: '', //支付凭证
        pay_method:'', //支付方式
        order_details: [] //支付详情项
      },
      validationError: '', // 验证错误信息
      validationError1: '', // 验证错误信息
      debounceTimer: null, // 防抖定时器,
      order_no: '',
      payTimer: null,
      keyNames: '',
      rowKeys: '',
      ruleTypes: ''
    }
  },
  props: {
    orders: {
      type: Array,
      default: []
    },
    moreConfig: {
      type: Object,
    },
    serviceName: {
      type: String,
    },
    buttonInfo: {
      type: Object,
    },

  },
  watch: {
    buttonInfo: {
      handler(newVal) {
        if (newVal && newVal.operate_service === 'srvbank_xa_pay_scode_order') {
          this.payStep = 2;
          this.payWays = [
            {
              code: 2,
              label: "扫码支付",
            }
          ]
        } else {
          this.payStep = 1;
          this.payWays = [
            {
              code: 1,
              label: "公户转账",
            },
            {
              code: 2,
              label: "扫码支付",
            },
            {
              code: 3,
              label: "个人支付",
            },
          ]
        }
        if (newVal && newVal.operate_params && typeof (newVal.operate_params) === 'string') {
          let tep = JSON.parse(newVal.operate_params).condition
          this.keyNames = tep[0].colName;
          this.rowKeys = tep[0].value.value_key;
          this.ruleTypes = tep[0].ruleType;

          const isdisable = JSON.parse(newVal.operate_params).isdisable;
          if(isdisable&&isdisable=='1'){
            this.disabledIndexes = [1,2];
          }
        }
      },
      immediate: true,
      deep: true
    },
    orders: {
      handler(newVal) {
        if (Array.isArray(newVal) && newVal.length > 0) {
          // 提取 su_order_no 并拼接
          const orderNos = newVal.map(item => item[this.rowKeys]).join(',');
          this.parkList = newVal.map(item => item['park_no_sub']);
          console.log(this.parkList, 999999999)
          let obj = {
            ids: orderNos,
            keyName: this.keyNames,
            ruleType: this.ruleTypes
          }
          this.getOrderDetails(obj);
        } else {
          this.orderList = [];
        }
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
  handleCopy(text, index) {
       if (typeof index === 'undefined') return;
       // 确保copyTooltipVisible始终是对象
       if (typeof this.copyTooltipVisible !== 'object' || this.copyTooltipVisible === null) {
         this.copyTooltipVisible = {};
       }
      this.$set(this.copyTooltipVisible, index, true);
        setTimeout(() => this.$set(this.copyTooltipVisible, index, false), 2000);
    if (!text) {
      this.$message.warning('没有可复制的内容');
      return;
    }
    // 尝试使用Clipboard API复制文本
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
         this.$set(this.copyTooltipVisible, index, true);
        setTimeout(() => this.$set(this.copyTooltipVisible, index, false), 2000);
      }).catch(err => {
        this.fallbackCopy(text, index);
      });
    } else {
      this.fallbackCopy(text);
    }
  },
  fallbackCopy(text, index) {
    // 创建临时文本区域用于复制
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    try {
      const successful = document.execCommand('copy');
      if (successful && typeof index !== 'undefined') {
        this.$set(this.copyTooltipVisible, index, true);
      setTimeout(() => this.$set(this.copyTooltipVisible, index, false), 2000);
      } else {
        this.$message.error('复制失败，请手动复制');
      }
    } catch (err) {
      this.$message.error('复制失败，请手动复制');
    } finally {
      document.body.removeChild(textarea);
    }
  },
    // 新线上提交方法
    handlePayType(type){
       this.payInfo.order_details = this.orderList.map(item => ({
        su_order_no: item.su_order_no
      }));
      const payInfoParam = JSON.parse(JSON.stringify(this.payInfo));
       this.showLoading = true;
      payUtils.handlePayPublicOrder(payInfoParam).then((res) => {
        this.showLoading = false;
        console.log(res, 222222222)
        if(res.data.state !=='SUCCESS'){
          this.$message.error(res.data.resultMessage || '支付失败');
          return;
        }
        this.PayPublicOrder= res?.data?.response?.[0]?.response || {}
        if(this.PayPublicOrder){
          this.submitvisible = false;
        }
        
       console.log(this.PayPublicOrder, 999999999)
      }).catch((err) => { })
    },
     // 获取上传组件的field配置
    getUploadField(item) {
        // 创建一个配置对象，支持图片上传和预览
        const field = {
          info: {
            editor: 'upload-image',
            label: '上传图片',
            type: 'Image',
            visible: true,
            name: 'pay_voucher',
            bodyVisible: true,
            editable: true,
            srvCol: {
              service_name: 'srvpark_contract_rent_bill_select',
              columns: 'pay_voucher',
              table_name: 'bxpark_contract_rent_bill',
              label: '上传图片'
            },
            moreConfig: {
              fileMaxSize: 10 // 10MB
            }
          },
          // 模拟必要的方法
          getAnyValidateError: function() { return ''; },
          serviceApi: function() {
            // 返回实际的上传下载URL
            return {
              uploadFile: '/file/upload',
              downloadFile: '/file/download?filePath='
            };
          },
          // 添加fileType和fileSize配置
          fileType: "jpg/png/svg/PNG/JPG/JPEG/jpeg/gif/GIF/bmp",
          fileSize: 10 * 1024 ,
          // 添加自定义处理上传成功的逻辑
          handleSuccess: function(response) {
            // 直接使用fileurl构建完整的图片URL
            if (response.fileurl) {
              // 构建完整的图片URL并设置到model中
              const fullUrl = '/file/download?filePath=' + response.fileurl;
            }
            return response.file_no || '';
          }
        };
        
        // 使用Object.defineProperty创建model属性，确保与upload-image组件正确配合
        Object.defineProperty(field, 'model', {
          get: function() {
            console.log('get image', item.pay_voucher);
            // 如果是数组，取第一个元素；否则返回原值
            return item && typeof item === 'object' ? (item.pay_voucher || '') : '';
          },
          set: function(value) {
              // 确保item是对象类型再设置属性
              if (item && typeof item === 'object') {
                item.pay_voucher = value;
              }
          }
        });
        
        return field;
      },
    chengPayType(val) {
      this.payType = val;
    },
    validatePayUser() {
      if (!this.payInfo.pay_user || this.payInfo.pay_user.trim() === '') {
        this.validationError1 = '请输入付款人姓名';
        return false;
      }
      return true;
    },
    // 处理图片变化事件
    imgChange(value, item) {
        console.log('imgChange4444444', value, item);
        // 确保item是对象类型再设置属性
        if (item && typeof item === 'object') {
          item.image = value;
        }
      },
    
    keepStatusInfo() {
      let that = this;
      if (that.payTimer) {
        clearTimeout(that.payTimer);
      }
      this.payTimer = setInterval(() => {
        that.handelStatusInfo()
      }, 2000)
    },
    //获取二维码支付后状态信息
    handelStatusInfo(status) {
      this.showLoading = true
      payUtils.getPayStatus(this.order_no).then(res => {
        if (res.data.state !== 'SUCCESS'){
           this.showLoading = false
        };
        this.showLoading = false
        this.handleStatus = true;
        let ls = res.data.data[0];
        this.statusText = ls.state
        this.stepStatus = ls.state === '已支付' || ls.state === '已退款' ? true : !(ls.state === '支付失败' || ls.state === '待支付')
        clearInterval(this.payTimer);
        this.payTimer = null;

      }).catch(err => { 
        
      })
    },
    closePayment() {
      this.$emit('close-payment')
       clearInterval(this.payTimer);
      this.payTimer = null;
    },
    // 处理输入变化，添加防抖
    handleInputChange() {
      // 清除之前的定时器
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
      }

      // 清除验证错误信息
      this.validationError = '';
      this.debounceTimer = setTimeout(() => {
        this.validatePayAmount();
      }, 500);
    },
    validatePayAmount() {
      const payAmount = parseFloat(this.payInfo.pay_amount);
      const pendingAmount = parseFloat(this.payInfo.pending_amount);
      if (!this.payInfo.pay_amount || this.payInfo.pay_amount.trim() === '') {
        this.validationError = '请输入支付金额';
        return false;
      }
      if (isNaN(payAmount) || payAmount <= 0) {
        this.validationError = '请输入有效的支付金额';
        return false;
      }
      const payAmountInCents = Math.round(payAmount * 100);
      const pendingAmountInCents = Math.round(pendingAmount * 100);
      if (payAmountInCents !== pendingAmountInCents) {
        this.validationError = '支付金额必须与待支付金额相等';
        return false;
      }
      this.validationError = '';
      return true;
    },
    clearValidationError() {
      this.validationError = '';
    },

    handleGetPendingPayAmount() {
      this.payInfo.pending_amount = this.orderList.reduce((total, item) => {
        const itemAmountInCents = Math.round(parseFloat(item.total_fee) * 100);
        const totalInCents = Math.round(total * 100);
        const newTotalInCents = totalInCents + itemAmountInCents;
        return newTotalInCents / 100;
      }, 0);
    },
    //手动提交
    handleSubmit() {
      if (this.payStep === 1||this.payStep === 3) {
       if (!this.payInfo.pay_amount || this.payInfo.pay_amount.trim() === '') {
        this.$message.error('请输入确认支付金额');
        return false;
      }
      if (!this.payInfo.pay_user || this.payInfo.pay_user.trim() === '') {
        this.$message.error('请输入付款人姓名');
        return false;
      }
      if (!this.validatePayAmount()) {
        this.$message.error('支付金额验证失败，请检查输入');
        return false;
      }
      }else if(this.payStep === 2){
        if (!this.payInfo.pay_user || this.payInfo.pay_user.trim() === '') {
        this.$message.error('请输入付款人姓名');
        return false;
      }
      }
      
      this.payInfo.order_details = []
      this.orderList.forEach((item) => 
         {
          const obj = {
            su_order_no: item.su_order_no,
            park_no_sub: '',
          }
          this.parkList.forEach((park) => {
            obj.park_no_sub = park
          })
          this.payInfo.order_details.push(obj)
        });
      this.payInfo.pay_method = this.payWays.find(item => item.code === this.payStep).label;
      let payInfoParam = JSON.parse(JSON.stringify(this.payInfo));
      delete payInfoParam.pending_amount;
      if (this.payStep === 2) {
        this.getOnlinePayQrcode(payInfoParam);
      } else {
        this.handlePayCashInfo(payInfoParam)
      }
      return true;
    },
    //现金线下支付提交
    handlePayCashInfo(payInfoParam) {
      this.showLoading = true;
      payUtils.handlePayCash(payInfoParam).then((res) => {
        this.showLoading = false;
        let ls = res.data
        if (res.data.state === 'SUCCESS') {
          this.handleStatus = true;
          this.stepStatus = true;
          this.statusText = ls.resultMessage
        } else {
          this.handleStatus = true;
          this.stepStatus = false;
          this.statusText = ls.resultMessage
        }
      }).catch((err) => { })
    },
    //获取订单列表信息
    getOrderDetails(orderNos) {
      if (!orderNos) {
        this.orderList = [];
        return;
      }
      payUtils.getOrderListByNo(orderNos).then(res => {
        if (res.data.state !== 'SUCCESS') {
          if (res.data.resultMessage) {
            this.closePayment();
            this.$alert(res.data.resultMessage,'提示',{
              confirmButtonText: '确定',
            });
          }
          return
        };
        this.orderList = res.data.data ? res.data.data : [];
        this.handleGetPendingPayAmount();
      }).catch(err => { })
    },
    //获取线上支付二维码信息
    getOnlinePayQrcode(payInfoParam) {
      this.showLoading = true;
      this.loadingText = '支付码生成中....'
      payUtils.getQrcodeInfo(payInfoParam).then(res => {
        if (res.data.state !== 'SUCCESS') {
          this.showLoading = false;
          this.$message.error(res.data.resultMessage);
          return
        };
        let ls = res.data.response[0].response;
        if (ls) {
          this.showLoading = false;
          this.qrcodeInfo.odrNo = ls.odrNo;
          this.qrcodeInfo.qrCd = ls.qrCd;
          this.qrcodeInfo.transAddnInfo = ls.transAddnInfo;
          this.isShowQrcode = true;
          this.order_no = ls.order_no;
          //10s后启动查询
          setTimeout(() => {
            this.keepStatusInfo()
          }, 10 * 1000)

        }
      }).catch(err => { })
    },
    chengPayWay() {
      if (this.payStep !== 1) {
        this.loadingText = '交易支付中请稍等...';
        this.isShowQrcode = false;
        this.qrcodeInfo.qrCd = null
      }
      this.payInfo.pay_user = ''
      this.payInfo.pay_amount=''  //付款金额
       if (that.payTimer) {
        clearTimeout(that.payTimer);
      }
        this.payInfo.pay_remark= ''
      if(this.$refs.uploadImages){
        this.$refs.uploadImages.fileLists = [];
      }
      
    },
    handleBack() {
      this.handleStatus = false;
      if(this.payTimer){
        clearInterval(this.payTimer);
        this.payTimer = null;
      }
    },

    /**
     * @Description:金额千分位格式化，保留小数点后数字
     * @Author:Eirice
     * @Date: 2025-07-17 14:23:36
     */
    formatAmount(amount) {
      if (amount === null || amount === undefined || amount === '') return '';
      const parts = amount.toString().split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return parts.join('.');
    }
  },
  beforeDestroy() {
    // 组件销毁前清除定时器
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    if (this.payTimer) {
      clearInterval(this.payTimer);
      this.payTimer = null;
    }
  }
}
</script>

<style scoped lang="less">
@import "payment.less";
.requireds{
  color: red;
  position: absolute;
  top: 5px;
  left: 40px;
}
.requiredss{
  color: red;
  position: absolute;
  top: 5px;
  left: 57px;
}
.tips-container {
  background-color: #ECF5FF;
  padding: 12px 16px;
  border-radius: 4px;
  display: flex;
  align-items: flex-start;
  margin-top: 16px;
}

.tips-icon {
  color: #409EFF;
  margin-right: 8px;
  margin-top: 3px;
  font-size: 16px;
}

.tips-content {
  color: #303133;
  line-height: 1.5;
}

</style>