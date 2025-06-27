<template>
  <div class="pay_cl">
    <div class="tex">
      <el-button type="primary" size="mini" @click="activeForm=true">订单支付</el-button>
    </div>
     <el-dialog
         class="customDialogClass"
         title="订单支付"
         :visible="activeForm"
         @close="closeDialog"
         width="40%"
         append-to-body
         :close-on-click-modal=false
         :destroy-on-close="true"
     >
       <payment-popup @close-dialog="closeDialog" v-if="activeForm"></payment-popup>
     </el-dialog>
  </div>
</template>

<script>
import paymentPopup from "@/components/common/payment/payment-popup.vue";
export default{
  name: "payIndex",
  data() {
      return {
        activeForm:false,
      }
  },
  components: {
    paymentPopup
  },
  methods: {
    closeDialog(){
      this.activeForm = false;
    }
  }
}
</script>



<style scoped lang="scss">
.pay_cl{
  width: 100%;
  height: 100%;
}
</style>