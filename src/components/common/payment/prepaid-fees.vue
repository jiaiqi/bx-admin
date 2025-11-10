<template>
  <div class="page-wrapper">
    <div class="pay_container">
    <!-- 账户信息区域 -->
    <div class="account-info">
      <div class="info-header">
        <h2>{{rowDetails.type_name==='水表'?'水费':'电费'}}</h2>
      </div>
      
      <div class="info-content">
        <div class="info-row">
          <div class="field-item">
            <span class="label">编号：</span>
            <span class="value">{{rowDetails.no}}</span>
          </div>
          <div class="field-item">
            <span class="label">房间：</span>
            <span class="value">{{rowDetails.dev_path_name}}</span>
          </div>
        </div>
        <div class="info-row highlight">
          <span class="label">剩余{{rowDetails.type_name==='水表'?'水量':'电量'}}：</span>
          <div class="value-wrapper">
            <span class="value remaining">{{rowDetails.total_remain_amount}}</span>
            <span class="unit">{{rowDetails.type_name==='水表'?'立方':'度'}}</span>
          </div>
          <div class="info-tip">
            <i class="info-icon">ℹ</i>
            <span>非实时数据</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 用量详情区域 -->
    <div class="usage-details">
      <h3>用量详情</h3>
      <div class="details-grid">
        <div class="detail-item">
          <span class="detail-label">总使用{{rowDetails.type_name==='水表'?'水量':'电量'}}</span>
          <span class="detail-value">{{rowDetails.total_use_amount}}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">单价</span>
          <span class="detail-value">{{rowDetails.unit_price+'元'}}</span>
          <span>{{rowDetails.type_name==='水表'?'/立方':'/度'}}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">抄表时间</span>
          <span class="detail-value">{{rowDetails.modify_time}}</span>
        </div>
      </div>
    </div>

    <!-- 缴费选项区域 -->
    <div class="payment-options" v-if="!handleStatus">
      <h3>缴费金额</h3>
      
      <div class="payment-options-content">
        <!-- 左侧：缴费金额选择区域 -->
        <div class="payment-left">
          <!-- 预设金额按钮 -->
          <div class="preset-amounts">
            <button 
              v-for="item in feesList" 
              :key="item.code"
              class="amount-btn"
              :class="{ active: selectedAmount === item.amount }"
              @click="selectAmount(item.amount)"
            >
              {{ item.amount }}元
            </button>
          </div>

          <!-- 自定义金额输入 -->
          <div class="custom-amount">
            <label>其他金额：</label>
            <div class="input-wrapper" :class="{ 'error': hasInputError }">
              <span class="currency-symbol">¥</span>
              <input 
                type="text" 
                v-model="customAmount"
                placeholder="请输入"
                class="amount-input"
                @input="onCustomAmountInput"
                @focus="onCustomAmountFocus"
                @blur="onCustomAmountBlur"
                maxlength="10"
              />
            </div>
            <div v-if="hasInputError" class="error-message">
              {{ errorMessage }}
            </div>
          </div>
        </div>
        
        <!-- 右侧：二维码容器 -->
        <div class="payment-right" v-if="paymentMethod === 'qrcode'">
          <div class="qrcode-container">
            <div v-if="showLoading" class="loading-overlay">
              <div class="loading-spinner"></div>
              <div class="loading-text">{{ loadingText }}</div>
            </div>
                         <div v-else-if="isShowQrcode && qrcodeInfo.qrCd" class="qrcode-display">
               <qr-code :text="qrcodeInfo.qrCd" :size="110"/>
               <div class="qc_cot22" v-if="isPayed" style="background: #f5f7fa;opacity: 0.9;position: absolute;top: 32.5%;left: 50%;transform: translate(-50.5%, -50%);">
              <img src="../../../assets/image/pay.png" style="width: 124px;height: 110px;" alt="">
              </div>
               <div class="qrcode-info">
                 <p>订单号：{{ qrcodeInfo.odrNo }}</p>
                 <p>请使用手机扫码支付</p>
               </div>
             </div>
            <div v-else class="qrcode-placeholder">
              <p>选择二维码支付后点击立即缴费生成二维码</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 缴费按钮 -->
    <div class="payment-action" v-if="!handleStatus">
      <!-- 支付方式选择 -->
      <div class="payment-method">
        <h3>支付类型</h3>
        <div class="method-tabs">
          <div 
            class="method-tab" 
            :class="{ active: paymentMethod === 'pubilc' }"
            @click="selectPaymentMethod('pubilc')"
          >
            <i class="method-icon"></i>
            <span>对公转账</span>
          </div>
          <div 
            class="method-tab" 
            :class="{ active: paymentMethod === 'qrcode' }"
            @click="selectPaymentMethod('qrcode')"
          >
            <i class="method-icon"></i>
            <span>扫码支付</span>
          </div>
          <div 
            class="method-tab" 
            :class="{ active: paymentMethod === 'cash' }"
            @click="selectPaymentMethod('cash')"
          >
            <i class="method-icon"></i>
            <span>个人支付</span>
          </div>
        </div>
      </div>

       <div
       class="payment-method"
        v-if="isChangePay"
      >
        <h3
        >支付方式：</h3>
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
      </div>
      
      <button v-if="submitvisible" class="pay-btn" @click="handlePayment">
        立即缴费
      </button>
    </div>
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
    <!-- 支付结果容器 -->
    <div class="payment-result" v-if="handleStatus">
      <div class="result-content">
        <div class="result-icon" :class="{ 'success': stepStatus, 'failed': !stepStatus }">
          <i v-if="stepStatus" class="success-icon">✓</i>
          <i v-else class="failed-icon">✗</i>
        </div>
        <h3 class="result-title" :class="{ 'success': stepStatus, 'failed': !stepStatus }">
          {{ stepStatus ? '支付成功' : '失败' }}
        </h3>
        <p class="result-message">{{ statusText }}</p>
        <button class="back-btn" @click="backToPayment">
          返回支付界面
        </button>
      </div>
    </div>
  </div>
  </div>
</template>

<script>
import Payment from "./payment";
const payUtils = new Payment();
import QrCode from "@/pages/datav/component/page-item/qr-code/qr-code.vue";
export default{
  name: "prepaid-fees",
  components: {
    QrCode
  },
  data() {
    return {
      feesList: [
        {
          amount:50,
          code:1
        },
        {
          amount:100,
          code:2
        },
        {
          amount:200,
          code:3
        },
        {
          amount:300,
          code:4
        }
      ],
      selectedAmount: 0,
      customAmount: '',
      routeInfo:{},
      rowDetails:{},
      isPayed:false,
      isChangePay:true,
      payType:1,
      submitvisible:true,
      PayPublicOrder:{},
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
      hasInputError: false,
      errorMessage: '',
      paymentMethod: 'pubilc', // 默认选择对公转账
      finalAmount: 0, // 最终金额值
      qrcodeInfo:{
        qrCd:null,     //二维码地址
        odrNo:null,    //订单编号
        transAddnInfo:null //附加信息
      },
      statusText: "",
      handleStatus:false,
      stepStatus:false,
      showLoading:false,
      loadingText:'支付码生成中....',
      isShowQrcode:false,
      payTimer:null,
    }
  },
  beforeDestroy () {
    clearInterval(this.payTimer);
    this.payTimer=null;
  },
  mounted() {
    if(this.$route.query.no||this.$route.query.type_name){
      this.routeInfo={
        no:this.$route.query.no,
        type_name:this.$route.query.type_name,
      }
    }
    this.getInitPayInfo()
  },
  methods: {
     chengPayType(val) {
      this.payType = val;
    },
    //获取初始跳转后的原始订单信息
    getInitPayInfo(){
      let obj={
        no:this.routeInfo.no,
      }
      payUtils.getPayPrepaidInfo(obj).then(res=>{
        if(res.data.state!=='SUCCESS')return;
        let ls = res.data.data[0];
        this.rowDetails=ls
      }).catch(err=>{
        console.log(err)
      })
    },
    selectAmount(amount) {
      this.selectedAmount = amount;
      this.customAmount = '';
      this.hasInputError = false;
      this.errorMessage = '';
    },
    onCustomAmountInput() {
      // 实时验证输入内容，但不过滤字符
      this.validateCustomAmount();
      
      if (this.customAmount) {
        this.selectedAmount = 0;
      }
    },
    onCustomAmountFocus() {
      this.selectedAmount = 0;
      this.hasInputError = false;
      this.errorMessage = '';
    },
    selectPaymentMethod(method) {
      if(method === 'pubilc'){
        this.isChangePay = true;
      }else{
        this.isChangePay = false;
      }
      this.paymentMethod = method;
      this.clearQrcodeInfo();
    },
    
    // 清空二维码信息
    clearQrcodeInfo() {
      this.qrcodeInfo.qrCd = null;
      this.qrcodeInfo.odrNo = null;
      this.qrcodeInfo.transAddnInfo = null;
      this.isShowQrcode = false;
      this.showLoading = false;
    },
    
    // 返回支付界面
    backToPayment() {
      this.handleStatus = false;
      this.stepStatus = false;
      this.statusText = '';
      this.showLoading = false;
      this.clearQrcodeInfo();
      // 清空金额选择
      this.selectedAmount = 0;
      this.customAmount = '';
      this.hasInputError = false;
      this.errorMessage = '';
    },
    
    //默认支付前默认添加信息入库
     async handleAddInfoIntoPayment() {
       let condition={
         dev_no:this.rowDetails.no,     //表号（水表或者电表）
         bill_money:this.finalAmount,   //金额
         bill_type:this.rowDetails.type_name==='水表'?'水费':'电费', //付费类型
       }
       try {
         const res = await payUtils.getAddPayInfo([condition]);
         if(res.data.state!=='SUCCESS') {
           return null;
         }
         let ls = res.data.response;
         let deps = ls[0].response.effect_data[0];
         let nos = deps ? deps.bill_no : null;
         if(!nos) {
           return null;
         }
         let payInfoParam = {
           pay_amount: deps.bill_money,
           order_details: [
             {
               su_order_no: nos
             }
           ]
         }
         return payInfoParam;
       } catch(err) {
         return null;
       }
     },

     //二维码支付接口
     async getOnlinePayQrcode(payInfoParam) {
      try {
        const res = await payUtils.getQrcodeInfo(payInfoParam);
        if(res.data.state!=='SUCCESS') return null;
        let ls = res.data.response[0].response;
        return ls;
      } catch(err) {
        return null;
      }
    },
    //现金线下支付提交
    handlePayCashInfo(payInfoParam){
      this.showLoading = true;
      payUtils.handlePayCash(payInfoParam).then((res) => {
        this.showLoading = false;
        let ls=res.data
        if(res.data.state==='SUCCESS'){
          this.handleStatus = true;
          this.stepStatus=true;
          this.statusText=ls.resultMessage
        }else {
          this.handleStatus =true;
          this.stepStatus=false;
          this.statusText=ls.resultMessage
        }
      }).catch((err) => {})
    },
    //获取线上支付二维码信息
    getOnlinePayQrcode(payInfoParam){
      this.showLoading=true;
      this.loadingText='支付码生成中....'
      payUtils.getQrcodeInfo(payInfoParam).then(res=>{
        if(res.data.state!=='SUCCESS') return;
        let ls =res.data.response[0].response;
        if(ls){
          this.showLoading=false;
          this.qrcodeInfo.odrNo=ls.odrNo;
          this.qrcodeInfo.qrCd=ls.qrCd;
          this.qrcodeInfo.transAddnInfo=ls.transAddnInfo;
          this.isShowQrcode=true;
          this.order_no=ls.order_no;
          //5s后启动查询
          setTimeout(()=>{
            this.keepStatusInfo()
          },1000*5)

        }
      }).catch(err=>{})
    },
    keepStatusInfo(){
      let that = this;
      if(that.payTimer){
        clearTimeout(that.payTimer);
      }
      this.payTimer=setInterval(()=>{
        that.handelStatusInfo()
      },2000)
    },
    //获取二维码支付后状态信息
    handelStatusInfo(status){
      payUtils.getPayStatus(this.order_no).then(res => {
        if(res.data.state!=='SUCCESS') return;
        // this.handleStatus=true;
        if(res.data.data[0].state==='已支付'){
          this.isPayed = true
           let ls =res.data.data[0];
         this.statusText=ls.state
          this.stepStatus=ls.state==='已支付'||ls.state==='已退款'?true:!(ls.state === '支付失败' || ls.state === '待支付')
          if(this.payTimer){
          clearTimeout(that.payTimer);
        }
        this.payTimer = null
        }
       

      }).catch(err => {})
    },
    validateCustomAmount() {
      if (!this.customAmount) {
        this.hasInputError = false;
        this.errorMessage = '';
        return;
      }
      if (!/^[0-9.]+$/.test(this.customAmount)) {
        this.hasInputError = true;
        this.errorMessage = '请输入正确的金额格式（仅支持数字和小数点）';
        return;
      }
      if (this.customAmount.startsWith('.')) {
        this.hasInputError = true;
        this.errorMessage = '金额不能以小数点开头';
        return;
      }
      if ((this.customAmount.match(/\./g) || []).length > 1) {
        this.hasInputError = true;
        this.errorMessage = '金额格式不正确（不能包含多个小数点）';
        return;
      }
      this.hasInputError = false;
      this.errorMessage = '';
    },
    onCustomAmountBlur() {
      if (this.customAmount) {
        const amount = parseFloat(this.customAmount);
        if (amount < 0.01) {
          this.hasInputError = true;
          this.errorMessage = '金额不能少于0.01元';
        } else if (amount > 999999.99) {
          this.hasInputError = true;
          this.errorMessage = '金额不能超过999999.99元';
        } else {
          if (!isNaN(amount)) {
            this.customAmount = amount.toFixed(2);
            this.hasInputError = false;
            this.errorMessage = '';
          }
        }
      } else {
        this.hasInputError = false;
        this.errorMessage = '';
      }
    },
    async handlePayment() {
      if (!this.customAmount && !this.selectedAmount) {
        this.$message.warning('请选择或输入缴费金额');
        return;
      }
      if (this.customAmount && this.selectedAmount) {
        this.$message.warning('请选择一种缴费方式：预设金额或自定义金额');
        return;
      }
      this.clearQrcodeInfo();
      this.finalAmount = this.customAmount || this.selectedAmount;
      if (this.paymentMethod === 'cash') {
        await this.handleCashPayment(this.finalAmount);
      }else if (this.paymentMethod === 'qrcode') {
        await this.handleQRCodePayment(this.finalAmount);
      }else if (this.paymentMethod === 'pubilc') {
        if(this.payType===1){
          await this.handlePubilcPayment(this.finalAmount);
        }else{
           await this.handleCashPayment(this.finalAmount);
        }
        
      }
    },
   async handlePubilcPayment(){
      try {
        const payInfoParam = await this.handleAddInfoIntoPayment();
        if (payInfoParam) {
          this.handlePayType(payInfoParam);
        } else {
          this.$message.error('获取支付参数失败');
        }
      } catch (error) {
        this.$message.error('现金缴费处理失败');
      }
    },
      // 新线上提交方法
    handlePayType(payInfoParam){
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
    async handleCashPayment(amount) {
      try {
        const payInfoParam = await this.handleAddInfoIntoPayment();
        if (payInfoParam) {
          this.handlePayCashInfo(payInfoParam);
        } else {
          this.$message.error('获取支付参数失败');
        }
      } catch (error) {
        this.$message.error('现金缴费处理失败');
      }
    },
       async handleQRCodePayment(amount) {
      this.showLoading = true;
      this.loadingText = '支付码生成中....';
      try {
        const payInfoParam = await this.handleAddInfoIntoPayment(amount);
        if (payInfoParam) {
          this.getOnlinePayQrcode(payInfoParam)
        } else {
          this.$message.error('获取支付参数失败');
          this.showLoading = false;
        }
      } catch (error) {
        this.$message.error('二维码支付处理失败');
        this.showLoading = false;
      }
    }
  }
}
</script>

<style scoped lang="scss">
.page-wrapper {
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  background: #f5f5f5;
  overflow-y: auto;
  padding: 20px 0;
}

.pay_container {
  width: 100%;
  max-width: 1000px;
  margin: 0;
  padding: 25px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  min-height: auto;
}

.account-info {
  margin-bottom: 25px;
  
  .info-header {
    margin-bottom: 15px;
    
    h2 {
      color: #333;
      font-size: 24px;
      font-weight: 600;
      margin: 0;
    }
  }
  
  .info-content {
    background: #f8f9fa;
    padding: 15px;
    border-radius: 6px;
    
    .info-row {
      display: flex;
      align-items: center;
      margin-bottom: 15px;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      &.highlight {
        .value-wrapper {
          display: flex;
          align-items: center;
          flex: 1;
          
          .value.remaining {
            color: #1890ff;
            font-size: 20px;
            font-weight: 600;
            margin-right: 8px;
          }
          
          .unit {
            color: #333;
            font-size: 16px;
          }
        }
        
        .info-tip {
          margin-left: 15px;
          display: flex;
          align-items: center;
          color: #666;
          font-size: 14px;
          
          .info-icon {
            margin-right: 5px;
            color: #00bfff;
            background: #00bfff;
            color: white;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: bold;
            line-height: 1;
          }
        }
      }
      
      .field-item {
        display: flex;
        align-items: center;
        flex: 1;
        
        .label {
          color: #666;
          font-size: 16px;
          margin-right: 8px;
          white-space: nowrap;
        }
        
        .value {
          color: #333;
          font-size: 16px;
        }
      }
    }
  }
}

.usage-details {
  margin-bottom: 25px;
  
  h3 {
    color: #333;
    font-size: 18px;
    font-weight: 600;
    margin: 0 0 12px 0;
  }
  
  .details-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    
    .detail-item {
      background: #f8f9fa;
      padding: 10px;
      border-radius: 6px;
      text-align: center;
      
      .detail-label {
        display: block;
        color: #666;
        font-size: 14px;
        margin-bottom: 8px;
        font-weight: 600;
      }
      
      .detail-value {
        display: inline;
        color: #333;
        font-size: 16px;
        font-weight: 600;
      }
    }
  }
}

.payment-options {
  margin-bottom: 25px;
  
  h3 {
    color: #333;
    font-size: 18px;
    font-weight: 600;
    margin: 0 0 12px 0;
  }
  
  .payment-options-content {
    display: flex;
    gap: 30px;
    align-items: flex-start;
    
    .payment-left {
      flex: 1;
      min-width: 0; // 防止内容溢出
      
      // 当没有右侧容器时，占满整个宽度
      &:only-child {
        flex: 1;
        max-width: 100%;
      }
    }
    
    .payment-right {
      width: 200px;
      flex-shrink: 0; // 防止右侧容器被压缩
      
      .qrcode-container {
        width: 220px;
        height: 220px;
        background: #ffffff;
        border: 2px solid #e8e8e8;
        border-radius: 12px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        position: relative;
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
         
         .loading-overlay {
           position: absolute;
           top: 0;
           left: 0;
           right: 0;
           bottom: 0;
           background: rgba(255, 255, 255, 0.98);
           display: flex;
           flex-direction: column;
           align-items: center;
           justify-content: center;
           z-index: 10;
           border-radius: 10px;
           
           .loading-spinner {
             width: 40px;
             height: 40px;
             border: 4px solid #f3f3f3;
             border-top: 4px solid #1890ff;
             border-radius: 50%;
             animation: spin 1s linear infinite;
             margin-bottom: 15px;
           }
           
           .loading-text {
             color: #666;
             font-size: 14px;
             text-align: center;
             font-weight: 500;
           }
         }
         
         .qrcode-display {
           display: flex;
           flex-direction: column;
           align-items: center;
           justify-content: flex-start;
           padding: 15px 10px;
           width: 100%;
           height: 100%;
           
           .qrcode-info {
             margin-top: 15px;
             text-align: center;
             width: 100%;
             
             p {
               margin: 4px 0;
               color: #666;
               font-size: 12px;
               line-height: 1.4;
               
               &:first-child {
                 color: #333;
                 font-weight: 600;
                 font-size: 13px;
                 margin-bottom: 6px;
               }
               
               &:last-child {
                 color: #1890ff;
                 font-size: 11px;
               }
             }
           }
         }
         
         .qrcode-placeholder {
           text-align: center;
           padding: 20px;
           color: #999;
           
           p {
             color: #999;
             font-size: 13px;
             margin: 0;
             line-height: 1.4;
           }
         }
       }
    }
  }
  
  .preset-amounts {
    display: flex;
    gap: 15px;
    margin-bottom: 20px;
    
    .amount-btn {
      padding: 12px 24px;
      border: 2px solid #e8e8e8;
      background: #fff;
      color: #666;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.3s;
      font-size: 14px;
      
      &:hover {
        border-color: #1890ff;
        color: #1890ff;
      }
      
      &.active {
        border-color: #1890ff;
        background: #1890ff;
        color: #fff;
      }
    }
  }
  
  .custom-amount {
    display: flex;
    align-items: center;
    
    label {
      color: #666;
      font-size: 14px;
      margin-right: 15px;
      white-space: nowrap;
    }
    
    .input-wrapper {
      display: flex;
      align-items: center;
      border: 2px solid #e8e8e8;
      border-radius: 6px;
      padding: 0 15px;
      background: #fff;
      
      &.error {
        border-color: #ff4d4f;
      }

      .currency-symbol {
        color: #666;
        font-size: 16px;
        margin-right: 8px;
      }
      
      .amount-input {
        border: none;
        outline: none;
        padding: 12px 0;
        font-size: 14px;
        width: 150px;
        background: transparent;
        
        &::placeholder {
          color: #ccc;
        }
      }
    }

    .error-message {
      color: #ff4d4f;
      font-size: 12px;
      margin-top: 8px;
    }
  }
}

.payment-action {
  text-align: center;
  
  .payment-method {
    margin-bottom: 20px;
    text-align: left;
    h3 {
      color: #333;
      font-size: 18px;
      font-weight: 600;
      margin: 0 0 15px 0;
    }
    .method-tabs {
      display: flex;
      gap: 15px;
      .method-tab {
        display: flex;
        align-items: center;
        padding: 10px 20px;
        border: 2px solid #e8e8e8;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.3s;
        font-size: 14px;
        &.active {
          border-color: #1890ff;
          background: #1890ff;
          color: #fff;
        }
        .method-icon {
          font-size: 20px;
          margin-right: 8px;
        }
      }
    }
  }

  .pay-btn {
    background: #1890ff;
    color: #fff;
    border: none;
    padding: 15px 60px;
    font-size: 16px;
    font-weight: 600;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.3s;
    
    &:hover {
      background: #40a9ff;
    }
    
    &:active {
      background: #096dd9;
    }
  }
}

// 添加loading动画关键帧
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

// 支付结果容器样式
.payment-result {
  text-align: center;
  padding: 40px 20px;
  
  .result-content {
    max-width: 400px;
    margin: 0 auto;
    
    .result-icon {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      margin: 0 auto 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      
      &.success {
        background: #f6ffed;
        border: 3px solid #52c41a;
        
        .success-icon {
          color: #52c41a;
          font-size: 40px;
          font-weight: bold;
        }
      }
      
      &.failed {
        background: #fff2f0;
        border: 3px solid #ff4d4f;
        
        .failed-icon {
          color: #ff4d4f;
          font-size: 40px;
          font-weight: bold;
        }
      }
    }
    
    .result-title {
      font-size: 24px;
      font-weight: 600;
      margin: 0 0 15px 0;
      
      &.success {
        color: #52c41a;
      }
      
      &.failed {
        color: #ff4d4f;
      }
    }
    
    .result-message {
      color: #666;
      font-size: 16px;
      margin: 0 0 30px 0;
      line-height: 1.5;
    }
    
    .back-btn {
      background: #1890ff;
      color: #fff;
      border: none;
      padding: 12px 30px;
      font-size: 16px;
      font-weight: 600;
      border-radius: 6px;
      cursor: pointer;
      transition: background 0.3s;
      
      &:hover {
        background: #40a9ff;
      }
      
      &:active {
        background: #096dd9;
      }
    }
  }
}
</style>