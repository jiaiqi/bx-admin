<template>
  <b-container fluid class=" web-register p-0">
    <b-container class="h-100  d-flex flex-column justify-content-center">
      <div class="register-layout align-self-center  h-auto bg-white  rounded rounded-lg pt-2 pb-5">
        <b-row class="m-0 h-100 w-100 justify-content-center">
          <b-col cols="12" md="7" class="p-3  h-100 text-left">
            <div class="p-1 pb-3 d-flex justify-content-between" v-if="[0, 1].includes(currentStep)">
              <b-button size="sm" variant="orange" @click="toLogin">
                已有账号，立即登录
                <b-icon-box-arrow-up-right></b-icon-box-arrow-up-right>
              </b-button>
            </div>
            <div class="d-flex justify-content-between pt-2 pb-4">
              <div class="step-item" :class="{ active: [0, 1, 2].includes(currentStep) }">
                <span>1</span>
                <span>填写账号信息</span>
              </div>
              <div class="step-item" :class="{ active: [1, 2].includes(currentStep) }">
                <span>2</span>
                <span>完善基础信息</span>
              </div>
              <div class="step-item" :class="{ active: currentStep === 2 }">
                <span>3</span>
                <span>申请完成</span>
              </div>
            </div>
            <!-- @submit="onSubmit"-->
            <b-form @reset="onReset" novalidate v-if="[0, 1].includes(currentStep)">
              <template v-for="(field, index) in formFields">
                <b-form-group :id="`${field.column}-${field.type}`" :label="field.label"
                              :label-for="`${field.column}`" v-if="field.show && field.type !== 'radio'"
                              label-size="md" label-align="right" label-cols-lg="2" label-cols="3">
                  <b-form-select v-model="field.value" :options="field.options"
                                 v-if="field.type === 'select'" @change="change(field)"></b-form-select>
                  <b-form-datepicker v-model="field.value" class="mb-2" placeholder="选择日期"
                                     v-if="field.type === 'date'"></b-form-datepicker>
                  <b-input-group v-if="field.type == 'code'">
                    <b-form-input :id="`${field.column}`" v-model="field.value" required
                                  autocomplete="off" :placeholder="field.placeholder" :readonly="readonlyInput"
                                  @change="change(field)" :state="field.state" placeholder="验证码"
                                  description="验证码"></b-form-input>
                    <b-button variant="outline-primary" :disabled="codeState" @click="getCode">{{
                        codeState ? `剩余${codeTime}s` : `获取验证码`
                      }}
                    </b-button>
                  </b-input-group>
                  <upload :ref="field.column" v-if="field.type == 'image'" :initColumn="field.column"
                          :initTable="'bxledu_org'" :initNo="field.value" :appNo="'ledu'"
                          :initMax="field.column == 'head_image' ? 1 : field.column == 'card_no' ? 2 : '-'"
                          :mainProps="field.column == 'card_no' ? { width: 148, height: 100 } : { width: 100, height: 100 }">
                  </upload>
                  <b-form-input :id="`${field.column}`" v-model="field.value" v-if="field.type == 'text'"
                                :type="field.type" required autocomplete="off" :placeholder="field.placeholder"
                                :readonly="readonlyInput" @change="change(field)"
                                :state="field.state"></b-form-input>

                  <b-form-textarea v-if="field.type == 'textarea'" :id="`${field.column}`"
                                   v-model="field.value" :type="field.type" required autocomplete="off"
                                   :placeholder="field.placeholder" :readonly="readonlyInput" @change="change(field)"
                                   :state="field.state" rows="3" max-rows="6"></b-form-textarea>
                  <b-form-invalid-feedback :state="field.state">
                    {{ field.msg }}
                  </b-form-invalid-feedback>
                </b-form-group>
                <b-form-group :id="`${field.column}`" :label="field.label" :label-for="`${field.column}`"
                              v-if="field.show && field.type == 'radio'" label-size="md" label-align="right"
                              label-cols-lg="2" @change="change(field)" label-cols="3">
                  <b-form-radio-group size="lg" v-model="field.value" :options="field.options"
                                      :name="`${field.column}`">
                    <b-form-invalid-feedback :state="field.state">
                      {{ field.msg }}
                    </b-form-invalid-feedback>
                  </b-form-radio-group>
                </b-form-group>
              </template>
              <b-form-group label-cols="3" label-cols-lg="2">
                <b-button block variant="primary" size="lg" @click="nextStep" :disabled="currentStep >= 1"
                          v-if="currentStep === 0">下一步
                </b-button>
                <b-button block variant="primary" size="lg" @click="nextStep"
                          v-else-if="currentStep === 1">创建账号
                </b-button>
              </b-form-group>
            </b-form>
            <div v-else>
              <div class="d-flex justify-content-center p-4 text-icon">
                <b-icon-check2-circle></b-icon-check2-circle>
              </div>
              <div class="text-center">注册成功，初始密码为手机号后六位</div>
              <div class="text-center pt-5">
                <b-button variant="primary" @click="toLogin">
                  立即登录
                  <!-- <b-icon-box-arrow-up-right></b-icon-box-arrow-up-right> -->
                </b-button>
              </div>
            </div>
            <div class="p-5"></div>
          </b-col>
        </b-row>
      </div>
    </b-container>

  </b-container>
</template>

<script>

import formMixin from './form-mixin'
import {setRequest, sendCode} from './api'
import upload from './upload.vue'

var codeTime = null
export default {
  name: 'register',//机构注册
  components: {
    upload
  },
  mixins: [formMixin],
  props: {
    msg: String
  },
  computed: {
    authState() {
      let type = '未注册'
      if (this.info.memberInfo && this.info.memberInfo.auth_state) {
        type = this.info.memberInfo.auth_state
      }

      return type
    },
    info() {
      let state = {
        isLogin: sessionStorage.getItem('logined'),
        info: sessionStorage.getItem('current_login_user'),
        memberInfo: null
      }

      return state
    },
    register() {
      let config = {
        text: '注册',
        show: true,
        ayoutTitle: "个人会员注册",
        layoutMsg: "",
        loginPath: "/register",
        toHome: true
      }
      return config
    },
    formFields() {
      let fields = []
      if (this.currentStep === 0 && Array.isArray(this.fields)) {
        fields = this.fields.map(item => {
          if (item.column == 'member_type') {
            item.value = '个人'
          }
          if (this.authState == '不通过' && this.info.memberInfo && this.info.memberInfo.hasOwnProperty(item.column)) {
            item.value = this.info.memberInfo[item.column]
            item['updateed'] = 0
            if (['phone_no', 'member_type'].indexOf(item.column) == -1) {
              item['updateed'] = 1
            }
          }

          return item
        })
      } else if (this.currentStep === 1 && Array.isArray(this.step2Fields)) {
        fields = this.step2Fields.map(item => {
          return item
        })
      }
      return fields
    }
  },
  data() {
    return {
      currentStep: 0,
      smsIsSend: false, //短信已发送
      form: {
        "password": "",
        "passwordb": "",
        "checked": [],
        "phone": '',
        "code": ""
      },
      fields: [
        {
          "label": "联系人",
          "column": "contact_name",
          "type": "text",
          "value": null,
          "placeholder": "请填写机构联系人",
          "rules": [
            {
              "type": "required",
              "trigger": "change",
              "msg": "联系人不能为空"
            }
          ],
          "state": null,
          "msg": "",
          "show": true
        },
        {
          "label": "联系电话",
          "column": "phone_no",
          "subType": 'phone',
          "type": "text",
          "value": null,
          "placeholder": "请填写联系电话",
          "rules": [
            {
              "type": "required",
              "trigger": "change",
              "msg": "联系电话不能为空"
            },
            {
              type: 'regular',
              trigger: "change",
              value: /^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/,
              msg: '请输入正确的手机号'
            }
          ],
          "state": null,
          "msg": "",
          "show": true
        },

        {
          "label": "验证码",
          "column": "sms_code",
          "type": "code",
          "value": null,
          "placeholder": "验证码...",
          "rules": [
            {
              "type": "required",
              "trigger": "change",
              "msg": "请填写有效的验证码"
            }
          ],
          "state": null,
          "msg": "",
          "show": true
        },
        {
          "label": "机构类型",
          "column": "org_type",
          "type": "select",
          "value": null,
          "placeholder": "请选择机构类型",
          "options": [
            {
              "text": "有限责任公司",
              "value": "有限责任公司"
            },
            {
              "text": "股份有限公司",
              "value": "股份有限公司"
            },
            {
              "text": "个人独资企业",
              "value": "个人独资企业"
            },
            {
              "text": "合伙企业",
              "value": "合伙企业"
            },
            {
              "text": "全民所有制企业",
              "value": "全民所有制企业"
            },
            {
              "text": "集体所有制企业",
              "value": "集体所有制企业"
            },
            {
              "text": "农民专业合作社",
              "value": "农民专业合作社"
            },
            {
              "text": "其它",
              "value": "其它"
            }
          ],
          "rules": [
            {
              "type": "required",
              "trigger": "change",
              "msg": "机构类型不能为空"
            }
          ],
          "state": null,
          "msg": "",
          "show": true
        },
      ],
      step2Fields: [
        {
          "label": "机构名称",
          "column": "name",
          "type": "text",
          "value": null,
          "placeholder": "请填写机构名称",
          "rules": [
            {
              "type": "required",
              "trigger": "change",
              "msg": "机构名称不能为空"
            }
          ],
          "state": null,
          "msg": "",
          "show": true
        }
        ,
        {
          "label": "统一信用社会代码",
          "column": "uscc",
          "type": "text",
          "value": null,
          "placeholder": "请填写统一信用社会代码",
          "rules": [
            {
              "type": "required",
              "trigger": "change",
              "msg": "统一信用社会代码不能为空"
            }
          ],
          "state": null,
          "msg": "",
          "show": true
        }
        ,
        {
          "label": "成立日期",
          "column": "establish_date",
          "type": "date",
          "value": null,
          "placeholder": "请填写成立日期",
          "rules": [
            {
              "type": "required",
              "trigger": "change",
              "msg": "成立日期不能为空"
            }
          ],
          "state": null,
          "msg": "",
          "show": true
        }
        ,
        {
          "label": "营业执照",
          "column": "bus_license",
          "type": "image",
          "value": null,
          "placeholder": "请填写营业执照",
          "rules": [
            {
              "type": "required",
              "trigger": "change",
              "msg": "营业执照不能为空"
            }
          ],
          "state": null,
          "msg": "",
          "show": true
        }
        ,
        {
          "label": "注册地址",
          "column": "reg_address",
          "type": "text",
          "value": null,
          "placeholder": "请填写注册地址",
          "rules": [
            {
              "type": "required",
              "trigger": "change",
              "msg": "注册地址不能为空"
            }
          ],
          "state": null,
          "msg": "",
          "show": true
        }
        ,
        {
          "label": "经营范围",
          "column": "bus_scope",
          "type": "textarea",
          "value": null,
          "placeholder": "请填写经营范围",
          "rules": [
            {
              "type": "required",
              "trigger": "change",
              "msg": "经营范围不能为空"
            }
          ],
          "state": null,
          "msg": "",
          "show": true
        }
        ,
        {
          "label": "机构介绍",
          "column": "introduce",
          "type": "textarea",
          "value": null,
          "placeholder": "请填写机构介绍",
          "rules": [
            {
              "type": "required",
              "trigger": "change",
              "msg": "机构介绍不能为空"
            }
          ],
          "state": null,
          "msg": "",
          "show": true
        }
      ]
    }
  },
  created() {
    // console.log(this.webConfig)
  },
  methods: {
    toLogin() {
      window.location.href = "/main/login.html";
    },
    async nextStep() {
      if (this.currentStep === 0) {
        // 验证手机号
        if (!this.smsIsSend) {
          this.$bvModal.msgBoxOk('请先获取验证码')
          return
        }
        let values = {}
        let valids = []
        let isValid = true
        for (let field of this.formFields) {
          if (field.rules && field.rules.length > 0) {
            for (let rule of field.rules) {
              if (rule.type == 'required') {
                valids.push(field.column)
              }
            }
          }
          values[field.column] = field.value
          // field.state(field.value)
        }
        for (let key of valids) {
          if (!values[key]) {
            isValid = false
          }
        }
        this.validFeedback()
        if (!isValid) {
          return
        }
      }
      if (this.currentStep === 1) {
        // 提交注册信息
        let values = {}
        let valids = []
        let isValid = true
        for (let field of this.fields) {
          if (field.rules && field.rules.length > 0) {
            for (let rule of field.rules) {
              if (rule.type == 'required') {
                valids.push(field.column)
              }
            }
          }
          values[field.column] = field.value
          // field.state(field.value)
        }
        for (let key of valids) {
          if (!values[key]) {
            isValid = false
          }
        }

        for (let field of this.step2Fields) {
          values[field.column] = field.value
        }
        this.validFeedback()

        if (isValid) {
          let serviceName = 'srvledu_org_add'
          let app = 'ledu'
          let req = [
            {
              "serviceName": serviceName,
              "data": [
                values
              ]
            }
          ]
          const res = await setRequest(req, 'operate', serviceName, app)
          if (res?.state == 'SUCCESS') {
            this.submit = true
            let self = this
            // console.log(this)
            this.$bvModal.msgBoxConfirm('注册成功:初始密码是注册手机号后六位.', {
              title: '请确认',
              size: 'sm',
              buttonSize: 'sm',
              okVariant: 'primary',
              okTitle: '前往登录',
              cancelTitle: '取消',
              footerClass: 'p-2',
              hideHeaderClose: false,
              centered: true
            })
              .then(value => {
                console.log(value)
                if (value == true) {
                  if (self.webConfig.manage) {
                    window.location.href = self.webConfig.manage
                  }
                  // self.$router.replace({ path: '/login' })
                }
              })
              .catch(err => {
                // An error occurred
              })
          } else {
            this.$bvModal.msgBoxOk(res.resultMessage, {
              title: '请确认',
              size: 'sm',
              buttonSize: 'sm',
              okVariant: 'primary',
              okTitle: '确认',
              footerClass: 'p-2',
              hideHeaderClose: false,
              centered: true
            })
            return
          }
        }
        console.log(values)
      }
      this.currentStep++
    },
    onSubmit(evt) {
      let self = this
      let values = {}
      let valids = []
      let isValid = true
      for (let field of this.formFields) {
        if (field.rules && field.rules.length > 0) {
          for (let rule of field.rules) {
            if (rule.type == 'required') {
              valids.push(field.column)
            }
          }
        }
        values[field.column] = field.value
        // field.state(field.value)
      }
      for (let key of valids) {
        if (!values[key]) {
          isValid = false
        }
      }
      debugger

      for (let field of this.step2Fields) {
        values[field.column] = field.value
      }
      this.validFeedback()

      if (isValid) {
        let serviceName = 'srvledu_org_reg_add'
        let app = 'ledu'
        let req = [
          {
            "serviceName": serviceName,
            "data": [
              values
            ]
          }
        ]
        setRequest(req, 'operate', serviceName, app).then(res => {
          console.log(res.data)
          if (res.state == 'SUCCESS') {
            this.submit = true
            let self = this
            // console.log(this)
            this.$bvModal.msgBoxConfirm('注册成功:初始密码是注册手机号后六位.', {
              title: '请确认',
              size: 'sm',
              buttonSize: 'sm',
              okVariant: 'primary',
              okTitle: '前往登录',
              cancelTitle: '取消',
              footerClass: 'p-2',
              hideHeaderClose: false,
              centered: true
            })
              .then(value => {
                console.log(value)

                if (value == true) {
                  if (self.webConfig.manage) {
                    window.location.href = self.webConfig.manage
                    return
                  }
                  self.$router.replace({path: '/login'})
                }
              })
              .catch(err => {
                // An error occurred
              })
          } else {
            this.$bvModal.msgBoxOk(res.resultMessage, {
              title: '请确认',
              size: 'sm',
              buttonSize: 'sm',
              okVariant: 'primary',
              okTitle: '确认',
              footerClass: 'p-2',
              hideHeaderClose: false,
              centered: true
            })
              .then(value => {
                // this.boxOne = value
              })
              .catch(err => {
                // An error occurred
              })
          }
        })


      }
      console.log(values)
    },
    onReset(evt) {
      evt.preventDefault()
      // Reset our form values
      this.form.email = ''
      this.form.name = ''
      this.form.food = null
      this.form.checked = []
      // Trick to reset/clear native browser form validation state
      this.show = false
      this.$nextTick(() => {
        this.show = true
      })
    },
    goBack() {
      this.$router.go(-1)
    },
    getCode() {
      console.log('获取验证码')
      let phone = ''

      let self = this
      let values = {}
      let valids = []
      let isValid = true
      for (let field of this.formFields) {
        if (field.column == 'phone_no') {
          phone = field.value
          this.change(field)
        } else if (field.column !== 'code') {
          if (field.value && field.value.trim()) {
            console.log('--:', field.value, field.value.trim())

            self.$set(field, 'state', null)
            self.$set(field, 'msg', '')
          } else {
            self.$set(field, 'state', false)
            self.$set(field, 'msg', `请填写有效的${field.label}`)
            valids.push(false)
          }
        }
      }
      if (!phone || !this.regPhone.test(phone) || valids.length > 0) {
        return
      }

      let req = [{
        "serviceName": "srvmobile_note_send",
        "data": [{
          "mobile": phone
        }]
      }]

      sendCode(req).then(res => {
        if (res.state == "SUCCESS") {
          console.log('获取成功')
          let countdown = res.response[0].response.exp_time
          if (countdown) {
            this.codeState = true
            this.countdown(countdown)
          }
          this.smsIsSend = true

        } else {
          this.$bvModal.msgBoxOk(res.resultMessage, {
            title: '请确认',
            size: 'sm',
            buttonSize: 'sm',
            okVariant: 'primary',
            okTitle: '确认',
            footerClass: 'p-2',
            hideHeaderClose: false,
            centered: true
          })
            .then(value => {
              // this.boxOne = value
            })
            .catch(err => {
              // An error occurred
            })
        }
      })
    },
    countdown(countdown) {
      localStorage.setItem('codeTime', countdown)
      this.codeTime = countdown
      codeTime = setInterval(() => {
        let time = localStorage.getItem('codeTime')
        this.codeTime = time
        if (time && time >= 1) {
          time = (time - 1)
          localStorage.setItem('codeTime', time)
        } else {
          time = 0
          localStorage.setItem('codeTime', 0)
          clearInterval(codeTime);
          this.codeState = false
        }
      }, 1000);
      console.log('倒计时', countdown)
    }
  }

}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" >
body{
 #maxkb{
    display: none;
  }
}

.web-register {
  width: 100vw;
  height: 100vh;
  background: #0e77ea;

  .web-register-hander {
    .copyright {
      width: 100vw;
      justify-content: center;
    }

    .logo {
      height: 40px;
    }
  }

  .register-layout {
    // height: calc(100vh - 90px);
    width: 100%;

    .text-icon {
      font-size: 60px;
      color: #2892ea;
    }

    .step-item {
      position: relative;
      flex: 1;
      min-width: 150px;
      text-align: center;

      &:first-child {
        &::before {
          display: none;
        }
      }

      &::before {
        content: '';
        width: 50px;
        height: 0.5px;
        background-color: #ccc;
        position: absolute;
        left: calc(-5% - 10px);
        top: 50%;
        transform: translateY(-50%);
      }

      span:nth-child(1) {
        display: inline-block;
        width: 25px;
        height: 25px;
        border-radius: 25px;
        text-align: center;
        line-height: 25px;
        margin-right: 5px;
        border: 1px solid #ccc;
      }

      &.active {
        &::before {
          background-color: #2892ea;
        }

        span:nth-child(1) {
          background-color: #2892ea;
          color: #fff;
          border-color: #2892ea;
        }
      }
    }
  }
}
</style>
