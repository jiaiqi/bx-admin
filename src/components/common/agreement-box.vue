<template>
  <div
    class="agreement-box"
    v-if="
      agreementJson &&
      agreementJson.agreement_name &&
      agreementJson.agreement_no
    "
  >
    <el-checkbox
      :disabled="!isRead"
      v-model="agreementIsChecked"
      @click.native="clickText"
      @change="changeChecked"
      style="margin-right: 10px"
      >您已阅读并同意
    </el-checkbox>
    <span class="text-blue" @click.stop.prevent="showAgreementDialog"
      >《{{ agreementJson.agreement_name }}》</span
    >

    <el-dialog
      :title="agreementJson.agreement_name"
      :visible.sync="showAgreement"
      width="50%"
      modal
      append-to-body
      :before-close="closeAgreementDialog"
    >
      <div class="content-box">
        <div v-html="agreementContent"></div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showAgreement = false">取 消</el-button>
        <el-button type="primary" :disabled="agreeDisabled" @click="showAgreement = false; agreenAgreement()"
          >确 定<span v-if="agreeDisabledTimeout"
            >{{ agreeDisabledTimeout }}秒</span
          >
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  props: {
    agreementJson: Object,
    agreementChecked: Boolean,
  },
  data() {
    return {
      agreeDisabled: false,
      isRead: false,
      timer: null,
      agreeDisabledTimeout: 0,
      agreementIsChecked: false,
      showAgreement: false,
      agreementContent: "",
    };
  },
  watch: {},
  methods: {
    clickText() {
      if (!this.isRead) {
        uni.showToast({
          title: "请先阅读并同意协议",
          icon: "none",
        });
      }
    },
    changeChecked(e) {
      console.log(e);
      this.$emit("update:agreementChecked", e);
      this.agreementIsChecked = e
    },
    closeAgreementDialog() {
      this.isRead = false;
      this.agreeDisabled = true;
      this.$emit("update:agreementChecked", false);
      this.agreementIsChecked = false;
      this.showAgreement = false;
      this.agreeDisabledTimeout = 0;
      clearInterval(this.timer);
    },
    agreenAgreement() {
      if (!this.agreeDisabled) {
        this.showAgreement = false;
        this.$emit("update:agreementChecked", true);
        this.agreementIsChecked = true;
        this.agreeDisabledTimeout = 0;
        clearInterval(this.timer);
      } else {
        this.$message.error("请先阅读并同意协议");
      }
    },
    showAgreementDialog() {
      this.fetchAgreement();
      this.showAgreement = true;
      if (this.agreementJson.min_time && this.isRead !== true) {
        this.agreeDisabled = true;
        this.agreeDisabledTimeout = this.agreementJson.min_time;
        this.timer = setInterval(() => {
          this.agreeDisabledTimeout--;
          if (this.agreeDisabledTimeout <= 0) {
            clearInterval(this.timer);
          }
        }, 1000);
        setTimeout(() => {
          this.agreeDisabled = false;
          this.agreeDisabledTimeout = 0;
          this.isRead = true;
          clearInterval(this.timer);
        }, this.agreementJson.min_time * 1000);
      }
    },
    fetchAgreement() {
      // 查找协议内容
      if (this.agreementJson.agreement_no) {
        const req = {
          serviceName: "srvpage_cfg_page_agreement_select",
          colNames: ["*"],
          condition: [
            {
              colName: "agreement_no",
              ruleType: "eq",
              value: this.agreementJson.agreement_no,
            },
          ],
          page: {
            pageNo: 1,
            rownumber: 1,
          },
        };
        const url = this.getServiceUrl(
          "select",
          "srvpage_cfg_page_agreement_select",
          "config"
        );
        //  `/config/select/srvpage_cfg_page_agreement_select`;
        this.$http.post(url, req).then((res) => {
          if (Array.isArray(res?.data?.data) && res?.data?.data?.length > 0) {
            const data = res.data.data[0];
            if (data?.agreement_text) {
              this.agreementContent = data.agreement_text.replace(
                /\<img/gi,
                "<img width=100%"
              );
              //   this.$alert(
              //     `<div style="max-height:60vh;overflow-y:auto;">${this.agreementContent}</div>`,
              //     this.agreementJson.agreement_name,
              //     {
              //       dangerouslyUseHTMLString: true,
              //       showCancelButton: true,
              //       confirmButtonText: "确定",
              //       cancelButtonText: "取消",
              //       customClass: "msgbox",
              //       beforeClose: (action, instance, done) => {
              //         if (action === "confirm") {
              //           if (!agreeDisabled) {
              //             this.agreenAgreement();
              //           } else {
              //             this.$message.error("请先阅读协议");
              //           }
              //         } else {
              //           done();
              //         }
              //       },
              //     }
              //   )
              //     .then(() => {
              //       this.agreenAgreement();
              //     })
              //     .catch((action) => {
              //       this.closeAgreementDialog();
              //     });
            }
          }
        });
      }
    },
  },
};
</script>

<style lang="scss">
.agreement-box {
  padding: 20rpx;
}

.content-box {
  padding: 0 20rpx;
  max-height: 50vh;
  overflow-y: auto;
  .disabled {
    pointer-events: none;
  }
  // overflow-y: scroll;
}
// .el-message-box__wrapper {
//   .msgbox {
//     width: 100%;
//   }
//   @media screen and (min-width: 768px) {
//     .msgbox {
//       width: 60vw;
//     }
//   }
// }
.text-blue {
  color: #5fadff;
  cursor: pointer;
}
</style>
