<template>
     <div class="pay_status">
       <div class="pay_img">
         <img src="../../../assets/image/suc.png" alt="" v-if="status">
         <img src="../../../assets/image/fall.png" alt="" v-if="!status">
       </div>
       <div class="pa_info_status">
         <div class="pay_cots" v-if="status">
           <li class="pay_des">订单支付成功:</li>
           <li class="pay_des">{{payAmount+'元'}}</li>
           <li>
             <el-button @click="closePayment">取消</el-button>
             <el-button type="primary" size="mini" @click="handleBack">返回支付页面</el-button>
           </li>
         </div>
         <div class="pay_cots" v-if="!status">
           <li class="pay_des">支付失败：{{statusText}}</li>
           <li class="pay_des">{{payAmount+'元'}}</li>
           <li>
             <el-button size="mini" @click="closePayment">取消</el-button>
             <el-button type="primary" size="mini" @click="handleBack">返回支付页面</el-button>
           </li>
         </div>
       </div>
     </div>
</template>

<script>
export default {
  name: "pay-status",
  props: {
    statusText:{
      type: String,
    },
    status: {
      type:Boolean,
      default:true
    },
    order_no:{
      type:String,
    },
    payAmount:{
      type:Number|String,
    }
  },
  methods: {
    closePayment(){
      this.$emit("closePayment");
    },
    handleBack(){
      this.$emit("handleBack");
    }
  }
}
</script>
<style scoped lang="less">
@import "payment.less";
</style>