<script>
import AddForm from "../add.vue";
export default {
  name: "step-form",
  props: {
    step_no: {
      type: String,
      default: "",
    },
  },
  provide() {
    return {
      preventNav: false, //阻止默认的跳转行为
      isLastStep: this.isLastStep,
    };
  },
  data() {
    return {
      stepNo: "", //步骤编号
      stepInfo: {},
      currentStepIndex: 0,
      defaultCondition: [],
      stepState: {},
      // preventNav:false,//阻止默认的跳转行为
    };
  },
  computed: {
    currentStep() {
      if (this.currentStepIndex >= 0 && this.stepList.length) {
        return this.stepList[this.currentStepIndex];
      }
    },
    stepList() {
      const jsonStr = this.stepInfo?.step_sum_json;
      let list = [];
      if (jsonStr) {
        try {
          list = JSON.parse(jsonStr);
        } catch (error) {}
      }
      // console.log("stepJson:", json);
      return list;
    },
  },
  methods: {
    isLastStep() {
      return (
        this.stepList.length &&
        this.currentStepIndex === this.stepList.length - 1
      );
    },
    async init() {
      const service = "srvcps_page_flow_select";
      const url = `/datax/select/${service}`;
      const req = {
        serviceName: service,
        colNames: ["*"],
        condition: [
          {
            colName: "pageflow_no",
            rulyType: "eq",
            value: this.stepNo,
          },
        ],
        page: { pageNo: 1, rownumber: 1 },
      };
      const res = await this.$http.post(url, req);
      if (res?.data?.data?.length) {
        this.stepInfo = res.data.data[0];
        console.log(this.stepInfo);
      }
    },
    onAddFormExecutorComplete(event) {
      console.log("onAddFormExecutorComplete", event);
      if (event.data?.state === "SUCCESS") {
        // 提交成功
        const data = event.data.response?.[0]?.response?.effect_data;
        this.$set(this.stepState, this.currentStep.id + "", data);
        // setTimeout(() => {
        //   this.currentStepIndex++;
        // }, 500);
        if (this.currentStepIndex < this.stepList.length - 1) {
          console.log("stepState:", this.stepState);

          this.$nextTick(() => {
            this.currentStepIndex++;
          });
        } else {
          this.$emit("on-step-form-complete", event);
        }
      }
    },
    onAddFormActionComplete(event) {
      console.log("onAddFormActionComplete", event);
    },
    onAddFormLoaded(event) {
      console.log("onAddFormLoaded", event);
    },
    onAdd2MemSubmitted(event) {
      console.log("onAdd2MemSubmitted", event);
    },
  },
  mounted() {
    if (this.step_no) {
      this.stepNo = this.step_no;
    } else if (this.$route.query?.step_no) {
      this.stepNo = this.$route.query.step_no;
    } else if (this.$route.params?.step_no) {
      this.stepNo = this.$route.params.step_no;
    }
    if (this.stepNo) {
      this.init();
    }
  },
  components: {
    AddForm,
  },
};
</script>

<template>
  <div class="step-form-wrap">
    <div class="step-form">
      <div class="step-info">
        <div class="icon">
          <div class="circle"></div>
        </div>
        <div class="title">
          <div class="number" v-if="currentStep">
            第{{ currentStepIndex + 1 }}步
          </div>
          <div class="desc" v-if="currentStep && currentStep.step_desc">
            {{ currentStep.step_desc }}
          </div>
        </div>
      </div>
      <div class="step-list">
        <el-steps :active="currentStepIndex" align-center>
          <el-step
            :title="step.step_name"
            description=""
            v-for="(step, index) in stepList"
            :key="index"
          ></el-step>
        </el-steps>
      </div>
      <div class="step-content" v-if="currentStep && currentStep.step_page_srv">
        <AddForm
          name="list-add"
          ref="AddForm"
          :in-step="true"
          :last-step="
            stepList.length && currentStepIndex === stepList.length - 1
          "
          :$srvApp="currentStep.step_page_srv_mapp"
          :service="currentStep.step_page_srv"
          :submit2-db="true"
          :defaultCondition="defaultCondition"
          :haveDraft="false"
          @action-complete="onAddFormActionComplete"
          @executor-complete="onAddFormExecutorComplete"
          @form-loaded="onAddFormLoaded"
          @submitted2mem="onAdd2MemSubmitted"
          :key="currentStepIndex"
        >
        </AddForm>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.step-form-wrap {
  width: 100%;
  height: 100%;
  background: #f6f7fb;
  padding: 20px;
}
.step-form {
  background: #fff;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  min-height: 50vh;
  padding: 20px;
  border-radius: 10px;
}
.step-info {
  border-radius: 10px;
  background: linear-gradient(
    90deg,
    rgba(255, 240, 239, 1) 1.22%,
    rgba(255, 240, 240, 0) 40%
  );
  height: 100px;
  display: flex;
  align-items: center;
  padding: 10px 20px;
  .icon {
    background: #ff3a30;
    border-radius: 50%;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 20px;
    .circle {
      width: 20px;
      height: 20px;
      background: #fff;
      border-radius: 50%;
    }
  }
  .title {
    font-size: 20px;
    .number {
      font-size: 24px;
      font-weight: bold;
    }
    .desc {
      margin-top: 5px;
    }
  }
}
.step-list {
  margin: 20px 0;
  background: #f0f8ff;
  border-radius: 10px;
  padding: 20px;
}
</style>
