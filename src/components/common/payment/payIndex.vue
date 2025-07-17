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
       <payment-popup :buttonInfo="buttonInfo"  :orders="multipleSelection" @close-dialog="closeDialog"   v-if="activeForm"></payment-popup>
     </el-dialog>
  </div>
</template>

<script>
import paymentPopup from "@/components/common/payment/payment-popup.vue";
export default{
  name: "payIndex",
  data() {
      return {
        buttonInfo:{
          operate_service:"srvbank_xa_pay_scode_order",
          operate_params:JSON.stringify({
            condition:[
              {
                colName:"su_order_no",
                value:{
                  value_key:"su_order_no"
                }
              }
            ]
          })
        },
        multipleSelection:[
          {
            "total_fee": 0.01,
            "item_name": "茅台",
            "su_order_no": "ZJ202506240001_2025-05-01"
          },
          {
            "total_fee": 0.01,
            "item_name": "西风六年",
            "su_order_no": "WY202506240001_2025-05-01"
          }

        ],
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