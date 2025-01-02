<template>
  <el-form ref="form" :model="form" :rules="rules" label-width="80px">
    <el-row
      type="flex"
      class="el-row"
      justify="start"
      v-if="procResult"
      :class="{ 'is-approve': type === 'approve' }"
    >
      <!-- :xs="24"
        :sm="10"
        :md="8"
        :lg="6"
        :xl="4" -->
      <el-col :span="24" v-if="stepOptions && stepOptions.length">
        <el-form-item
          label="下一步"
          label-width="10rem"
          v-if="stepOptions && stepOptions.length"
          prop="next_step"
        >
          <el-select
            v-model="form.next_step"
            placeholder="请选择下一步操作"
            style="width: 100%"
          >
            <el-option
              :label="item.label"
              :value="item.value"
              v-for="(item, index) in stepOptions"
              :key="index"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-col>
      <el-col
        :span="24"
        v-if="
          procResult.next_handle_user && procResult.next_handle_user.serviceName
        "
      >
        <el-form-item
          label="处理人"
          label-width="10rem"
          v-if="
            procResult.next_handle_user &&
            procResult.next_handle_user.serviceName
          "
          prop="next_handle_user"
        >
          <el-select
            v-model="form.next_handle_user"
            multiple
            placeholder="请选择处理人"
            style="width: 100%"
          >
            <el-option
              :label="item.label"
              :value="item.value"
              v-for="(item, index) in handleUserList"
              :key="index"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-col>
      <el-col
        :span="24"
        v-if="procResult.cc_user && procResult.cc_user.serviceName"
      >
        <el-form-item
          label="抄送人"
          label-width="10rem"
          v-if="procResult.cc_user && procResult.cc_user.serviceName"
          prop="cc_user"
        >
          <el-select
            v-model="form.cc_user"
            multiple
            placeholder="请选择抄送人"
            style="width: 100%"
          >
            <el-option
              :label="item.label"
              :value="item.value"
              v-for="(item, index) in ccUserList"
              :key="index"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-col>
    </el-row>
  </el-form>
</template>

<script>
export default {
  props: {
    type: {
      type: String,
      default: "apply", //apply-申请||approve-审批
    },
    procResult: {
      type: Object,
      default: () => {
        return {};
      },
    },
  },
  data() {
    return {
      form: {
        next_step: "",
        next_handle_user: "",
        cc_user: "",
      },
      stepOptions: [],
      handleUserList: [],
      handleUserPage: {
        pageNo: 1,
        rownumber: 20,
        total: 0,
      },
      ccUserList: [],
      ccUserPage: {
        pageNo: 1,
        rownumber: 20,
        total: 0,
      },
      rules: {},
    };
  },
  methods: {
    getFormData() {
      return new Promise((resolve) => {
        this.$refs["form"].validate((valid) => {
          if (valid) {
            let result = {};
            if (this.form.next_step) {
              result.next_step = this.form.next_step;
            }
            if (
              Array.isArray(this.form.next_handle_user) &&
              this.form.next_handle_user.length
            ) {
              result.next_handle_user = this.handleUserList
                .filter((item) =>
                  this.form.next_handle_user.includes(item.value)
                )
                ?.map?.((item) => item._raw_value);
            }
            if (Array.isArray(this.form.cc_user) && this.form.cc_user.length) {
              result.cc_user = this.ccUserList
                .filter((item) => this.form.cc_user.includes(item.value))
                ?.map?.((item) => item._raw_value);
            }
            resolve(result);
          } else {
            console.error("error submit!!");
            return false;
          }
        });
      });
    },
    // {
    //   "refed_col": "dept_no",
    //   "show_as_pair": false,
    //   "unlimited": true,
    //   "srv_app": "auth",
    //   "serviceName": "srvauth_dept_select",
    //   "key_disp_col": "dept_name",
    //   "is_tree": true
    // }
    /** 获取待处理人列表 */
    async getHandleUserList() {
      const cfg = this.procResult.next_handle_user;
      const app =
        cfg.srv_app ||
        sessionStorage.getItem("current_app") ||
        this.$route.query.srvApp ||
        "idm";
      const url = `/${app}/select/${cfg.serviceName}`;
      const req = {
        serviceName: cfg.serviceName,
        queryMethod: "select",
        colNames: ["*"],
        condition: [],
        page: {
          pageNo: this.handleUserPage.pageNo,
          rownumber: this.handleUserPage.rownumber,
        },
      };
      const res = await this.$http.post(url, req);
      if (res.data.state === "SUCCESS") {
        this.handleUserPage.total = res.data.page.total;
        this.handleUserList = res.data.data.map((item) => {
          return {
            _raw_value: { ...item }, //保存原始值
            label: item[cfg.key_disp_col || "disp"],
            value: item[cfg.refed_col || "value"],
          };
        });
      }
    },
    async getCCUserList() {
      const cfg = this.procResult.cc_user;
      const app =
        cfg.srv_app ||
        sessionStorage.getItem("current_app") ||
        this.$route.query.srvApp ||
        "idm";
      const url = `/${app}/select/${cfg.serviceName}`;
      const req = {
        serviceName: cfg.serviceName,
        queryMethod: "select",
        colNames: ["*"],
        condition: [],
        page: {
          pageNo: this.ccUserPage.pageNo,
          rownumber: this.ccUserPage.rownumber,
        },
      };
      const res = await this.$http.post(url, req);
      if (res.data.state === "SUCCESS") {
        this.ccUserPage.total = res.data.page.total;
        this.ccUserList = res.data.data.map((item) => {
          return {
            _raw_value: { ...item }, //保存原始值
            label: item[cfg.key_disp_col || "disp"],
            value: item[cfg.refed_col || "value"],
          };
        });
      }
    },
  },
  created() {
    let rules = {};
    if (this.procResult?.next_step?.length) {
      this.stepOptions = this.procResult.next_step.map((item) => {
        if (item.default_val === true) {
          this.form.next_step = item.step_no;
        }
        return {
          _raw_value: { ...item },
          label: item.step_name,
          value: item.step_no,
        };
      });
      rules.next_step = [
        {
          required: true,
          message: "请选择下一节点",
          trigger: "blur",
        },
      ];
    }
    if (this.procResult?.next_handle_user?.serviceName) {
      this.getHandleUserList();
      rules.next_handle_user = [
        {
          required: true,
          message: "请选择下一处理人",
          trigger: "blur",
        },
      ];
    }
    if (this.procResult?.cc_user?.serviceName) {
      this.getCCUserList();
      rules.cc_user = [
        {
          // required: true,
          message: "请选择抄送人",
          trigger: "blur",
        },
      ];
    }
    this.rules = rules;
  },
};
</script>

<style lang="scss" scoped>
.el-form > .el-row {
  &.is-approve {
    border: none;
  }
}

.el-row {
  flex-wrap: wrap;
  // padding-top: 20px;
  // padding-bottom: 20px;
  ::v-deep .el-form-item {
    // margin-bottom: 0;
  }
}
</style>
