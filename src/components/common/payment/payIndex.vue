<template>
  <div class="pay_cl">
    <div class="tex">
<!--      <el-button type="primary" size="mini" @click="activeForm=true">订单支付</el-button>-->
          <el-button type="primary" size="mini" @click="activeChart=true"></el-button>
    </div>
    <el-dialog
        width="40%"
        append-to-body
        :close-on-click-modal=false
        :visible="activeChart"
        @close="closeDialog"
    >
     <div style="height: 500px">
       <iframe width="100%" height="100%" src="http://192.168.0.191:8081/#/chart-info"></iframe>
     </div>
    </el-dialog>
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
     <div class="sid_info">
       <el-button type="primary" size="mini" @click="activeChart=true">在线咨询</el-button>
       <div class="info_cls" @click="activeChart=true">
         <iframe width="100%" height="100%" src="http://192.168.0.191:8088/#/msg-info"></iframe>
       </div>
     </div>
  </div>
</template>

<script>
import paymentPopup from "@/components/common/payment/payment-popup.vue";
export default{
  name: "payIndex",
  data() {
      return {
        activeChart:false,
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
      this.activeChart = false;
    }
  }
}
</script>



<style scoped lang="scss">
.pay_cl{
  position: relative;
  width: 100%;
  height: 100%;
}
.sid_info{
  width:150px;
  height:6.25rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: absolute;
  right:3.125rem;
  bottom:3.125rem;
}
.info_cls{
  width:100%;
  height:2.1875rem;
}
</style>