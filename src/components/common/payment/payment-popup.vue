<template>
 <div class="pay_info"
      v-loading="showLoading"
      :element-loading-text="loadingText"
      element-loading-spinner="el-icon-loading"
 >
   <div class="pay_tep" v-if="!handleStatus">
     <el-row :gutter="20" style="margin:5px 0">
       <el-col :span="6" style="text-align: right;"><span class="col_t">支付方式：</span></el-col>
       <el-col :span="16">
         <div>
           <el-radio-group v-model="payStep" @change="chengPayWay">
             <el-radio v-for="(item,index) in payWays" :key="item.code" :label="item.code">
               {{item.label}}
             </el-radio>
           </el-radio-group>
         </div>
       </el-col>
     </el-row>
     <el-row :gutter="20" style="margin:5px 0">
       <el-col :span="6" style="text-align: right;">
         <span class="col_t">费用明细：</span>
       </el-col>
       <el-col :span="16">
         <div class="info_list">
           <div class="info_t">
             <span>费用项</span>
             <span>金额(元)</span>
           </div>
           <div class="info_row_pay" v-if="orderList.length>0">
             <div class="pay_col" v-for="(item,index) in orderList" :key="item.su_order_no">
               <span class="des_pay">{{item.item_name}}</span>
               <span class="count_pay">{{item.total_fee}}</span>
             </div>
           </div>
         </div>
       </el-col>
     </el-row>
     <el-row :gutter="20" style="margin:5px 0">
       <el-col :span="6" style="text-align: right;"><span class="col_t">待支付金额：</span></el-col>
       <el-col :span="16"><span class="ped_pay">{{'￥'+payInfo.pending_amount}}</span></el-col>
     </el-row>
     <el-row :gutter="20" style="margin:5px 0">
       <el-col :span="6" style="text-align: right;"><span class="col_t">确认支付金额：</span></el-col>
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
         <div v-if="validationError" class="validation-error">{{validationError}}</div>
       </span>
       </el-col>
     </el-row>
     <el-row :gutter="20" style="margin:5px 0">
       <el-col :span="6" style="text-align: right;"><span class="col_t">支付备注信息：</span></el-col>
       <el-col :span="16">
       <span>
        <el-input
            type="textarea"
            :rows="4"
            placeholder="请输入内容"
            v-model="payInfo.pay_remark">
       </el-input>
      </span>
       </el-col>
     </el-row>
     <el-row :gutter="20" style="margin:5px 0">
       <el-col :span="6" style="text-align: right;"><span class="col_t">付款人姓名：</span></el-col>
       <el-col :span="16"><span><el-input placeholder="请输入...." v-model="payInfo.pay_user"></el-input></span></el-col>
     </el-row>
     <!--二维码生成区域-->
     <div class="qrcode_info" v-if="isShowQrcode">
       <div class="qr_text">
         请尽快扫描二维码完成支付
       </div>
       <div class="qc_cot" v-if="qrcodeInfo.qrCd">
         <qr-code :text="qrcodeInfo.qrCd" :size="130"/>
       </div>
     </div>
     <div class="pay_bts">
       <el-button size="mini" style="margin:0 0.5rem" v-if="!qrcodeInfo.qrCd" @click="closePayment">取消</el-button>
       <el-button type="primary" size="mini" v-if="!qrcodeInfo.qrCd" @click="handleSubmit">提交</el-button>
       <el-button type="primary" size="mini" v-if="qrcodeInfo.qrCd" @click="closePayment">关闭</el-button>
     </div>
   </div >
   <div class="pay_status" v-if="handleStatus">
     <pay-status :status="stepStatus" :statusText="statusText" :payAmount="payInfo.pay_amount" @handleBack="handleBack" @closePayment="closePayment"></pay-status>
   </div>
 </div>
</template>

<script>
import payment from './payment';
const  payUtils = new payment();
import QrCode from "@/pages/datav/component/page-item/qr-code/qr-code.vue";
import payStatus from "@/components/common/payment/pay-status.vue";
export default{
  name: "payment-popup",
  components: {
    QrCode,
    payStatus
  },
  data(){
    return {
      statusText: "",
      handleStatus:false,
      stepStatus:false,
      showLoading:false,
      loadingText:'支付码生成中....',
      isShowQrcode:false,
      payStep:2,
      payWays:[
        {
          code:2,
          label:"线上支付",
        },
        {
          code:1,
          label:"线下支付",
        }
      ],
      qrcodeInfo:{
        qrCd:null,     //二维码地址
        odrNo:null,    //订单编号
        transAddnInfo:null //附加信息
      },
      orderList:[],
      payInfo:{
        pending_amount:0,  //待支付金额
        pay_amount:'',  //付款金额
        pay_user:'',  //付款人
        pay_remark:'', //付款备注,
        order_details:[] //支付详情项
      },
      validationError: '', // 验证错误信息
      debounceTimer: null, // 防抖定时器,
      order_no:'',
      payTimer:null,
      keyNames:''
    }
  },
  props: {
    orders:{
      type:Array,
      default:[]
    },
    moreConfig:{
      type:Object,
    },
    serviceName:{
      type:String,
    },
    buttonInfo:{
      type:Object,
    },

  },
  watch: {
    buttonInfo:{
      handler(newVal) {
        debugger
        if(newVal && newVal.operate_service ==='srvbank_xa_pay_scode_order') {
          this.payStep = 1;
          this.payWays=[
            {
              code:1,
              label:"线下支付",
            }
          ]
        }else {
          this.payStep = 2;
          this.payWays=[
            {
              code:2,
              label:"线上支付",
            },
            {
              code:1,
              label:"线下支付",
            }
          ]
        }
        if (newVal && newVal.operate_params&&typeof(newVal.operate_params) === 'string') {
          let tep = JSON.parse(newVal.operate_params).condition
          this.keyNames=tep[0].colName
        }
      },
      immediate: true,
      deep: true
    },
    orders: {
      handler(newVal) {
        if (Array.isArray(newVal) && newVal.length > 0) {
          // 提取 su_order_no 并拼接
          const orderNos = newVal.map(item => item[this.keyNames]).join(',');
          let obj ={
            ids:orderNos,
            keyName:this.keyNames,
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
  methods:{
    keepStatusInfo(){
      let that = this;
      if(that.payTimer){
        clearTimeout(that.payTimer);
      }
     this.payTimer=setInterval(()=>{
       that.handelStatusInfo()
     },200)
    },
    //获取二维码支付后状态信息
    handelStatusInfo(status){
      this.showLoading=true
      payUtils.getPayStatus(this.order_no).then(res => {
        if(res.data.state!=='SUCCESS') return;
        this.showLoading=false
        this.handleStatus=true;
        let ls =res.data.data[0];
        this.statusText=ls.state
        this.stepStatus=ls.state==='已支付'||ls.state==='已退款'?true:ls.state==='支付失败'||ls.state=='待支付'?false:true
        clearInterval(this.payTimer);
        this.payTimer=null;

      }).catch(err => {})
    },
    closePayment(){
      this.$emit('close-dialog')
    },
    // 处理输入变化，添加防抖
    handleInputChange() {
      // 清除之前的定时器
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
      }
      
      // 清除验证错误信息
      this.validationError = '';
      
      // 设置新的防抖定时器，500ms后执行验证
      this.debounceTimer = setTimeout(() => {
        this.validatePayAmount();
      }, 500);
    },
    // 验证支付金额
    validatePayAmount() {
      const payAmount = parseFloat(this.payInfo.pay_amount);
      const pendingAmount = parseFloat(this.payInfo.pending_amount);
      
      // 检查是否为空
      if (!this.payInfo.pay_amount || this.payInfo.pay_amount.trim() === '') {
        this.validationError = '请输入支付金额';
        return false;
      }
      
      // 检查是否为有效数字
      if (isNaN(payAmount) || payAmount <= 0) {
        this.validationError = '请输入有效的支付金额';
        return false;
      }
      
      // 使用精确比较，将金额转换为分为单位进行比较
      const payAmountInCents = Math.round(payAmount * 100);
      const pendingAmountInCents = Math.round(pendingAmount * 100);
      
      // 检查是否与待支付金额相等
      if (payAmountInCents !== pendingAmountInCents) {
        this.validationError = '支付金额必须与待支付金额相等';
        return false;
      }
      
      // 验证通过，清除错误信息
      this.validationError = '';
      return true;
    },
    // 清除验证错误信息
    clearValidationError() {
      this.validationError = '';
    },

    //确认支付金额与待支付进行比较校准
    handleGetPendingPayAmount(){
      // 计算待支付金额 - 使用精确计算避免浮点数精度问题
      this.payInfo.pending_amount = this.orderList.reduce((total, item) => {
        // 将金额转换为分为单位进行计算，避免浮点数精度问题
        const itemAmountInCents = Math.round(parseFloat(item.total_fee) * 100);
        const totalInCents = Math.round(total * 100);
        const newTotalInCents = totalInCents + itemAmountInCents;
        return newTotalInCents / 100;
      }, 0);
    },
    //手动提交
    handleSubmit() {
      // 校验确认支付金额
      if (!this.payInfo.pay_amount || this.payInfo.pay_amount.trim() === '') {
        this.$message.error('请输入确认支付金额');
        return false;
      }

      // 校验付款人姓名
      if (!this.payInfo.pay_user || this.payInfo.pay_user.trim() === '') {
        this.$message.error('请输入付款人姓名');
        return false;
      }

      // 校验支付金额是否正确
      if (!this.validatePayAmount()) {
        this.$message.error('支付金额验证失败，请检查输入');
        return false;
      }
      
      // 构建订单详情数组
      this.payInfo.order_details = this.orderList.map(item => ({
        su_order_no: item.su_order_no
      }));

      console.log('提交数据：', this.payInfo);
      // 深拷贝 payInfo 并去除 pending_amount 字段
      let payInfoParam = JSON.parse(JSON.stringify(this.payInfo));
      delete payInfoParam.pending_amount;
      if(this.payStep===1){
        this.getOnlinePayQrcode(payInfoParam);
      }else {
        this.handlePayCashInfo(payInfoParam)
      }
      return true;
    },
    //现金线下支付提交
    handlePayCashInfo(payInfoParam){
      this.showLoading = true;
      payUtils.handlePayCash(payInfoParam).then((res) => {
        this.showLoading = false;
        let ls=res.data
        if(res.data.state==='SUCCESS'){
         this.handleStatus = true;
         this.stepStatus =true;
         this.statusText=ls.resultMessage
        }else {
          this.handleStatus =true;
          this.stepStatus =false;
          this.statusText=ls.resultMessage
        }
      }).catch((err) => {})
    },
    //获取订单列表信息
    getOrderDetails(orderNos) {
      if (!orderNos) {
        this.orderList = [];
        return;
      }
      payUtils.getOrderListByNo(orderNos).then(res => {
        if(res.data.state!=='SUCCESS') return;
        this.orderList = res.data.data ? res.data.data : [];
        this.handleGetPendingPayAmount();
      }).catch(err => {})
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
             //10s后启动查询
             setTimeout(()=>{
               this.keepStatusInfo()
             },10*1000)

           }
      }).catch(err=>{})
     },
    chengPayWay(){
      if(this.payStep!==1){
        this.loadingText='交易支付中请稍等...';
        this.isShowQrcode=false;
        this.qrcodeInfo.qrCd=null
      }
    },
    handleBack(){
      this.handleStatus=false;
    }
  },
  mounted() {
    // sessionStorage.removeItem('bx_auth_ticket');
    // sessionStorage.setItem('bx_auth_ticket','xabxdzkj-7942739b-31ef-49ee-9add-a146e6172097');
  },
  beforeDestroy() {
    // 组件销毁前清除定时器
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
  }
}
</script>

<style scoped lang="less">
@import "payment.less";


</style>