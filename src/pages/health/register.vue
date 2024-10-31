<template>
  <div class="app-container">
    <div style="width: 600px;margin: 0 auto;">
      <el-row style="color: #409EFF;font-size: 24px;text-align: center;margin: 30px 0;">专家注册</el-row>
      <el-form label-width="120px" ref="form" :model="form" :rules="formRules">
        <el-form-item label="真实姓名" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="工作单位名称" prop="work_unit">
          <el-input v-model="form.work_unit" />
        </el-form-item>
        <el-form-item label="推荐单位" prop="organ_name">
          <el-input v-model="form.organ_name" :readonly="true">
            <template slot="append">
              <el-button @click="openOrgList">选择机构</el-button>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="登录账号" prop="log_name">
          <el-input v-model="form.log_name" />
        </el-form-item>
        <el-form-item label="登录密码" prop="pwd">
          <el-input v-model="form.pwd" type="password" />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirm_pwd">
          <el-input v-model="form.confirm_pwd" type="password" />
        </el-form-item>
        <el-form-item label="手机号" prop="tel_num">
          <el-input v-model="form.tel_num" />
        </el-form-item>
        <el-form-item label="手机验证码" prop="verify_code">
          <div style="display: flex;align-items: center;justify-content: center;">
            <el-input v-model="form.verify_code" placeholder="" />
            <el-button @click="sendCode" :disabled="isSending || countdown > 0">
              {{ isSending ? '发送中...' : countdown > 0 ? `${countdown}秒后重试` : '发送验证码' }}
            </el-button>
          </div>

        </el-form-item>
      </el-form>
    </div>
    <div style="text-align: center;">
      <el-button type="primary" @click="handleRegister">立即注册</el-button>
    </div>

    <el-dialog title="推荐单位信息" :visible.sync="dialogTableVisible" width="85%">
      <el-card shadow="never" v-loading="loading">
        <el-row :gutter="5">
          <el-col :span="24" class="main-card-view">
            <el-row>
              <el-card shadow="never" class="top-search-card">
                <el-row>
                  <el-form :inline="true" :model="searchOrgForm" class="demo-form-inline search-view">
                    <el-form-item label="单位名称">
                      <el-input v-model="searchOrgForm.organ_name" placeholder="请输入单位名称"></el-input>
                    </el-form-item>
                    <el-form-item label="等级">
                      <el-input v-model="searchOrgForm.grade" placeholder="请输入等级"></el-input>
                    </el-form-item>
                    <!-- <el-form-item label="单位信息">
                        <el-input v-model="searchOrgForm.business_scope" placeholder="请输入单位信息"></el-input>
                      </el-form-item> -->
                    <el-form-item label="区域">
                      <el-input v-model="searchOrgForm.area_name" placeholder="请输入区域"></el-input>
                    </el-form-item>
                    <el-form-item>
                      <el-button type="primary" @click="handleOrgSearch" class="search-button">
                        查询
                      </el-button>
                    </el-form-item>
                  </el-form>
                </el-row>
              </el-card>
            </el-row>

            <el-row>
              <el-card shadow="never">
                <el-table :data="tableOrgData" :cell-style="{ height: '50px', overflow: 'hidden' }" :stripe="true"
                  style="width: 100%">
                  <el-table-column prop="classification" align="center" label="单位分类" />
                  <el-table-column prop="organ_name" align="center" label="单位名称" />
                  <el-table-column prop="grade" align="center" label="等级" />
                  <!-- <el-table-column prop="business_scope" align="center" label="单位信息" /> -->
                  <el-table-column prop="phone" align="center" label="电话" />
                  <el-table-column prop="area_name" align="center" label="区域">
                    <!-- <template slot-scope="scope">
                        {{ [scope.row.province, scope.row.city, scope.row.area].join(">") }}
                      </template> -->
                  </el-table-column>
                  <el-table-column align="center" label="操作" width="200">
                    <template slot-scope="scope">
                      <el-button type="text" @click="selectOrg(scope.$index, scope.row)">选择
                      </el-button><!--编辑-->
                    </template>
                  </el-table-column>
                </el-table>
                <div style="text-align: center;">
                  <el-pagination @current-change="handleCurrentChange" :current-page="orgPageInfo.pageNo"
                    :page-size="orgPageInfo.rownumber" :total="orgTotal" />
                </div>
                <!-- <XPagination ref="orgPageInfo" :total="orgTotal" :get-data="getOrgList" /> -->
              </el-card>
            </el-row>
          </el-col>
        </el-row>
      </el-card>
    </el-dialog>
  </div>
</template>

<script>
import * as organInfo from "./api/organInfo";
import * as expertInfo from "./api/expertInfo"
// import XPagination from "./components/xpagination/XPagination";
import * as sms from "./api/sms"
export default {
  name: "register",
  // components: { XPagination },
  data() {
    return {
      //手机验证码
      isSending: false,
      countdown: 0,

      dialogTableVisible: false,
      searchOrgForm: {
        grade: "",
        organ_name: "",
        area_name: "",
      },
      tableOrgData: [],
      orgPageInfo: {
        pageNo: 1,
        rownumber: 10,
      },
      orgTotal: 0,
      loading: false,
      searchForm: {
        name: "",
        organ_name: "",
        department_name: "",
      },

      form: {
        name: '',
        work_unit: '',
        organ_name: '',
        log_name: '',
        pwd: '',
        confirm_pwd: '',
        tel_num: '',
        verify_code: '',
        // area_uid:'',
        // dependency:'',
      },
      formRules: {
        name: [
          { required: true, message: '真实姓名不能为空', trigger: ['change', 'blur'], },
        ],
        work_unit: [
          { required: true, message: '单位名称不能为空', trigger: ['change', 'blur'], },
        ],
        organ_name: [
          { required: true, message: '推荐单位不能为空', trigger: ['blur', 'change'] },
        ],
        log_name: [
          { required: true, message: '登录账号不能为空', trigger: ['change', 'blur'], },
        ],
        pwd: [
          { required: true, message: '登录密码不能为空', trigger: ['change', 'blur'], },
          {
            trigger: ['change', 'blur'],
            message: '密码必须由数字、字母、特殊字符组合,请输入6-16位',
            validator: (rule, value, callback) => {
              var passwordreg = /(?=.*\d)(?=.*[a-zA-Z])(?=.*[^a-zA-Z0-9]).{6,16}/
              if (!passwordreg.test(value)) {
                callback(new Error('密码必须由数字、字母、特殊字符组合,请输入6-16位'))
              } else {
                callback()
              }
            }
          }
        ],
        confirm_pwd: [
          {
            required: true,
            message: '请输入确认密码',
            trigger: ['change', 'blur'],
          },
          {
            trigger: ['change', 'blur'],
            message: '确认密码和登录密码不一致',
            validator: (rule, value, callback) => {
              if (value != this.form.pwd) {
                callback(new Error('确认密码和登录密码不一致'))
              } else {
                callback()
              }
            },
          }
        ],
        tel_num: [
          { required: true, message: '手机号不能为空', trigger: ['change', 'blur'], },
          {
            trigger: ['change', 'blur'],
            message: '手机号码格式不正确',
            validator: (rule, value, callback) => {
              var tel = /^1[3456789]\d{9}$/
              if (!tel.test(value)) {
                callback(new Error('手机号码格式不正确'))
              } else {
                callback()
              }
            }
          }
        ],
        verify_code: [
          { required: true, message: '手机验证码不能为空', trigger: ['change', 'blur'], },
        ],
      },
    }
  },
  methods: {
    sendCode() {
      if (!this.form.tel_num) {
        this.$message.error("请填写手机号")
        return;
      }
      if (this.countdown > 0 || this.isSending) {
        return; // 防止重复点击发送
      }
      this.isSending = true;
      this.startCountdown();
      sms.getSmsCaptcha(this.form.tel_num).then(res => {
        if (res.data.state === 'SUCCESS') {
          this.$message.success("验证码发送成功")
        } else {
          this.$message.error(res.data.resultMessage)
        }
        this.isSending = false;
      })
    },

    startCountdown() {
      this.countdown = 60;
      const timer = setInterval(() => {
        this.countdown--;
        if (this.countdown <= 0) {
          clearInterval(timer);
        }
      }, 1000);
    },
    openOrgList() {
      this.getOrgList();
      this.dialogTableVisible = true;
    },
    handleCurrentChange(page) {
      this.orgPageInfo.pageNo = page
      this.getOrgList()
    },
    getOrgList() {
      let data = []
      if (this.searchOrgForm.organ_name) {
        data.push({
          colName: "organ_name",
          ruleType: 'like',
          value: this.searchOrgForm.organ_name
        })
      }
      if (this.searchOrgForm.grade) {
        data.push({
          colName: "grade",
          ruleType: 'like]',
          value: this.searchOrgForm.grade
        })
      }
      if (this.searchOrgForm.area_name) {
        data.push({
          colName: "area_name",
          ruleType: 'like]',
          value: this.searchOrgForm.area_name
        })
      }
      console.log(data, this.searchOrgForm)
      const param = {
        condition: data,
        page: this.orgPageInfo
      }
      this.loading = true
      organInfo.queryByPage(param).then(response => {
        console.log(response)
        if (response.data.state === 'SUCCESS') {
          this.tableOrgData = response.data.data
          this.orgTotal = response.data.page.total
        }
        this.loading = false
      }).catch(error => {
        console.log(error)
      })
    },
    selectOrg(index, data) {
      console.log(data)
      this.form.organ_name = data.organ_name;
      this.form.organ_uid = data.uid;
      // this.form.organ_classify = data.classification;
      // this.form.grade = data.grade;
      // this.form.area_uid=data.area_uid;
      // this.form.dependency=data.dependency
      this.dialogTableVisible = false;
    },
    handleOrgSearch() {
      this.orgPageInfo.pageNo = 1
      this.getOrgList()
      // this.$refs.orgPageInfo.loadData()
    },
    handleRegister() {
      this.$refs["form"].validate((valid) => {
        if (!valid) {
          return false
        }
        const param = Object.assign({}, this.form)
        // param.expert_type=this.form.area_uid
        // param.dependency=this.form.dependency
        expertInfo.insert(param).then(result => {
          if (result.data.state === 'SUCCESS') {
            this.$message.success("注册成功，请重新登录")
            let login_page = "/main/login.html"
            if (top.getLoginAddress) {
              login_page = "/" + top.getLoginAddress();
            }
            window.location.href = window.location.origin + login_page;
          } else {
            this.$message.error(result.data.resultMessage)
          }
        }).catch(error => {
          // this.$message.error(error.msg)
          console.log(error)
        })

      })
    },
  },
}
</script>

<style
  scoped
  lang="scss"
></style>