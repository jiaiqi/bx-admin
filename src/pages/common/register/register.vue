<template>
  <b-container fluid class=" web-register p-0">
    <b-container class="h-100  d-flex flex-column justify-content-center">
      <div class="register-layout align-self-center  h-auto bg-white  rounded rounded-lg pt-2 pb-5">
        <b-row class="m-0 h-100 w-100 justify-content-center">
          <b-col cols="12" md="10" class="p-3  h-100 text-left">
            <div class="p-1 pb-3 d-flex justify-content-between" v-if="[0, 1].includes(currentStep)">
              <b-button size="sm" variant="orange" @click="toLogin">
                已有账号，立即登录
                <b-icon-box-arrow-up-right></b-icon-box-arrow-up-right>
              </b-button>
            </div>
            <div class="d-flex justify-content-between pt-2 pb-4">
              <div class="step-item" :class="{ active: [0, 1, 2, 3].includes(currentStep) }">
                <span>1</span>
                <span>选择注册类型</span>
              </div>
              <div class="step-item" :class="{ active: [1, 2, 3].includes(currentStep) }">
                <span>2</span>
                <span>填写账号信息</span>
              </div>
              <div class="step-item" :class="{ active: [2, 3].includes(currentStep) }">
                <span>3</span>
                <span>完善基础信息</span>
              </div>
              <div class="step-item" :class="{ active: currentStep === 3 }">
                <span>4</span>
                <span>申请完成</span>
              </div>
            </div>
            <!-- @submit="onSubmit"-->
            <b-form @reset="onReset" novalidate v-if="[1, 2].includes(currentStep)"
              style="max-height: 60vh;overflow-y: auto;overflow-x: hidden" :class="{
                twoColumn: currentStep === 2
              }">
              <template v-for="(field, index) in formFields">
                <b-form-group :style="{gridColumn:field.gridColumn}" :class="{'grid-column-1-3':field.gridColumn==='1/3'}" :id="`${field.column}-${field.type}`" :label="field.label" :label-for="`${field.column}`"
                  v-if="field.show && field.type !== 'radio'" label-size="md" label-align="right" label-cols-lg="3"
                  label-cols="3">
                  <location-picker v-if="field.type === 'location-picker'" :field="field" :current-selected="field.model"
                    @on-selected="onPickerSelected($event, field)"></location-picker>
                  <b-form-select v-model="field.value" :options="field.options" v-if="field.type === 'select'"
                    @change="change(field)"></b-form-select>
                  <!--                  <b-form-datepicker v-model="field.value" placeholder="选择日期"-->
                  <!--                                     v-if="field.type === 'date'"></b-form-datepicker>-->

                  <el-date-picker style="width: 100%;" value-format="yyyy-MM-dd" v-model="field.value" type="date"
                    v-if="field.type === 'date'" placeholder="选择日期">
                  </el-date-picker>
                  <b-input-group v-if="field.type == 'code'">
                    <b-form-input :id="`${field.column}`" v-model="field.value" required autocomplete="off"
                      :placeholder="field.placeholder" :readonly="readonlyInput" @change="change(field)"
                      :state="field.state" placeholder="验证码" description="验证码"></b-form-input>
                    <b-button variant="outline-primary" :disabled="codeState" @click="getCode">{{
                      codeState ? `剩余${codeTime}s` : `获取验证码`
                    }}
                    </b-button>
                  </b-input-group>
                  <upload :ref="field.column" v-if="field.type == 'image'" :initColumn="field.column"
                    :initTable="field.initTable || 'bxledu_org'" v-model="field.value" :appNo="'ledu'"
                    :initMax="field.column == 'head_image' ? 1 : field.column == 'card_no' ? 2 : '-'"
                    :mainProps="field.column == 'card_no' ? { width: 148, height: 100 } : { width: 100, height: 100 }">
                  </upload>
                  <fk-selector v-if="field.type === 'fk'" :config="field.config" v-model="field.value"
                    @change="change(field)" style="width: 100%"></fk-selector>
                  <b-form-input :id="`${field.column}`" v-model="field.value" v-if="field.type == 'text'"
                    :type="field.type" required autocomplete="off" :placeholder="field.placeholder"
                    :readonly="readonlyInput" @change="change(field)" :state="field.state"></b-form-input>

                  <b-form-textarea v-if="field.type == 'textarea'" :id="`${field.column}`" v-model="field.value"
                    :type="field.type" required autocomplete="off" :placeholder="field.placeholder"
                    :readonly="readonlyInput" @change="change(field)" :state="field.state" rows="3"
                    max-rows="6"></b-form-textarea>
                  <b-form-invalid-feedback :state="field.state">
                    {{ field.msg }}
                  </b-form-invalid-feedback>
                </b-form-group>
                <b-form-group :id="`${field.column}`" :label="field.label" :label-for="`${field.column}`"
                  v-if="field.show && field.type == 'radio'" label-size="md" label-align="right" label-cols-lg="2"
                  @change="change(field)" label-cols="3">
                  <b-form-radio-group size="lg" v-model="field.value" :options="field.options"
                    :name="`${field.column}`">
                    <b-form-invalid-feedback :state="field.state">
                      {{ field.msg }}
                    </b-form-invalid-feedback>
                  </b-form-radio-group>
                </b-form-group>
              </template>
            </b-form>
            <div class="select-box" v-if="currentStep === 0">
              <div class="select-box-item" :class="{ active: registerType === 0 }" @click="registerType = 0">注册基地</div>
              <div class="select-box-item" :class="{ active: registerType === 1 }" @click="registerType = 1">注册机构</div>
            </div>
            <div v-else-if="currentStep === 3">
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
            <div class="" style="margin-top: 50px;padding: 0 20%;display: flex;align-items: center">
              <b-button style="margin:0 10px" block variant="light" size="lg" @click="currentStep--"
                v-if="[1, 2].includes(currentStep)">上一步
              </b-button>
              <b-button style="margin: 0" block variant="primary" size="lg" @click="nextStep"
                :disabled="currentStep >= 2" v-if="[0].includes(currentStep) || (currentStep === 1 && form.code)">下一步
              </b-button>
              <b-button block variant="primary" size="lg" @click="nextStep" v-else-if="currentStep === 2">创建账号
              </b-button>
            </div>
            <!--            <div class="p-5"></div>-->
          </b-col>
        </b-row>
      </div>
    </b-container>

  </b-container>
</template>

<script>

import formMixin from './form-mixin'
import { setRequest, sendCode } from './api'
import upload from './upload.vue'
import FkSelector from "./fk-selector.vue";
import locationPicker from "@/components/ui/location-picker.vue";
var codeTime = null
export default {
  name: 'register',//机构注册
  components: {
    FkSelector,
    upload,
    locationPicker
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
      if (this.registerType === 1) {
        if (this.currentStep === 1 && Array.isArray(this.fields)) {
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
        } else if (this.currentStep === 2 && Array.isArray(this.step2Fields)) {
          fields = this.step2Fields.map(item => {
            return item
          })
        }
      } else {
        if (this.currentStep === 1) {
          return this.jdFields.step1.map(item => item)
        } else if (this.currentStep === 2) {
          return this.jdFields.step2.map(item => item)
        }
      }
      return fields
    }
  },
  data() {
    return {
      registerType: 0, //0.研学基地（营地）；1.研学机构（旅行社）
      currentStep: 0,
      smsIsSend: false, //短信已发送
      form: {
        "password": "",
        "passwordb": "",
        "checked": [],
        "phone": '',
        "code": ""
      },
      jdFields: {
        step1: [
          {
            "label": "姓名",
            "column": "jdlxr",
            "type": "text",
            "value": null,
            "placeholder": "请填写姓名",
            "rules": [
              {
                "type": "required",
                "trigger": "change",
                "msg": "姓名不能为空"
              }
            ],
            "state": null,
            "msg": "",
            "show": true
          },
          {
            "label": "电话",
            "column": "jdlxrdh",
            "subType": 'phone',
            "type": "text",
            "value": null,
            "placeholder": "请填写电话",
            "rules": [
              {
                "type": "required",
                "trigger": "change",
                "msg": "电话不能为空"
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
        ],
        step2: [
          {
            "label": "基地名称",
            "column": "jdmc",
            "type": "text",
            "value": null,
            "placeholder": "请填写基地名称",
            "rules": [
              {
                "type": "required",
                "trigger": "change",
                "msg": "基地名称不能为空"
              }
            ],
            "state": null,
            "msg": "",
            "show": true
          },
          {
            "label": "基地级别",
            "column": "jdjb",
            "type": "select",
            "value": null,
            "placeholder": "请选择基地级别",
            "options": [
              {
                "text": "国家级",
                "value": "国家级"
              },
              {
                "text": "省级",
                "value": "省级"
              },
              {
                "text": "市级",
                "value": "市级"
              }
            ],
            "rules": [
              {
                "type": "required",
                "trigger": "change",
                "msg": "基地级别不能为空"
              }
            ],
            "state": null,
            "msg": "",
            "show": true
          }, {
            "label": "公布批次",
            "column": "pub_batch",
            "type": "select",
            options: [
              {
                text: '无',
                value: '无'
              }, {
                text: '第一批',
                value: '第一批'
              }, {
                text: '第二批',
                value: '第二批'
              }, {
                text: '第三批',
                value: '第三批'
              }, {
                text: '第四批',
                value: '第四批'
              }, {
                text: '第五批',
                value: '第五批'
              }, {
                text: '第六批',
                value: '第六批'
              }, {
                text: '第七批',
                value: '第七批'
              }
            ],
            "value": null,
            "placeholder": "请填写公布批次",
            "rules": [
              {
                "type": "required",
                "trigger": "change",
                "msg": "公布批次不能为空"
              }
            ],
            "state": null,
            "msg": "",
            "show": true
          }, {
            "label": "是否上目录",
            "column": "up_directory",
            "type": "select",
            options: [
              {
                text: '已上目录',
                value: '已上目录'
              }, {
                text: '未上目录',
                value: '未上目录'
              }
            ],
            "value": null,
            "placeholder": "请填写是否上目录",
            "rules": [
              {
                "type": "required",
                "trigger": "change",
                "msg": "是否上目录不能为空"
              }
            ],
            "state": null,
            "msg": "",
            "show": true
          },

          {
            "label": "主题分类",
            "column": "dwlb",
            "type": "select",
            "options": [
              { text: '优秀传统文化板块', value: '优秀传统文化板块' }, { text: '革命传统教育板块', value: '革命传统教育板块' }, { text: '国情教育板块', value: '国情教育板块' }, { text: '国防科工板块', value: '国防科工板块' }, { text: '自然生态板块', value: '自然生态板块' }
            ],
            "value": null,
            "placeholder": "请填写主题分类",
            "rules": [
              {
                "type": "required",
                "trigger": "change",
                "msg": "主题分类不能为空"
              }
            ],
            "state": null,
            "msg": "",
            "show": true
          },
          {
            "label": "基地坐标",
            "column": "gps_no",
            "type": "location-picker",
            "value": "",
            "placeholder": "请填写基地坐标",
            "rules": [
              {
                "type": "required",
                "trigger": "change",
                "msg": "基地坐标不能为空"
              }
            ],
            "state": null,
            "msg": "",
            "show": true,
            info: {
              srvCol: {
                "service_name": "srvledu_practice_base_reg_add",
                "columns": "gps_no",
                "table_name": "bxledu_practice_base",
                "table_column": "gps_no",
                "table_var": null,
                "bx_col_type": "fk",
                "col_type": "bxsys_obj_type_gps",
                "label": "基地坐标",
                "seq": 3400,
                "in_add": 1,
                "in_list": 2,
                "in_detail": 1,
                "in_update": 1,
                "in_cond": 1,
                "in_cond_def": 0,
                "updatable": 1,
                "col_span": "0.5",
                "required": "否",
                "validators": "ngMaxlength=50",
                "generate_time": "草稿",

                "is_encrypt_col": false,
                "batch_col": false,
                "option_data_type": "remote",
                "option_list_v2": {
                  "refed_col": "gpsno",
                  "allow_input": "下拉选择",
                  "serviceName": "srvsys_obj_type_gps_select",
                  "key_disp_col": "addr_str",
                  "is_tree": false
                }
              }
            }
          },
          {
            label: "详细地址",
            "column": "txdz",
            "type": "text",
            gridColumn:"1/3",
            "value": null,
            "placeholder": "请填写详细地址",
            "rules": [
              {
                "type": "required",
                "trigger": "change",
                "msg": "详细地址不能为空"
              }
            ],
            "state": null,
            "msg": "",
            "show": true
          },
          {
            "label": "基地负责人",
            "column": "jdfzr",
            "type": "text",
            "value": null,
            "placeholder": "请填写基地负责人",
            "rules": [
              {
                "type": "required",
                "trigger": "change",
                "msg": "基地负责人不能为空"
              }
            ],
            "state": null,
            "msg": "",
            "show": true
          }, {
            "label": "负责人电话",
            "column": "jdfzrdh",
            "type": "text",
            "subType": "phone",
            "value": null,
            "placeholder": "请填写负责人电话",
            "rules": [
              {
                "type": "required",
                "trigger": "change",
                "msg": "负责人电话不能为空"
              }, {
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
            "label": "公司名称",
            "column": "dwmc",
            "type": "text",
            "value": null,
            "placeholder": "请填写公司名称",
            "rules": [
              {
                "type": "required",
                "trigger": "change",
                "msg": "公司名称不能为空"
              }
            ],
            "state": null,
            "msg": "",
            "show": true
          },
          {
            "label": "法人",
            "column": "faren",
            "type": "text",
            "value": null,
            "placeholder": "请填写法人",
            "rules": [
              {
                "type": "required",
                "trigger": "change",
                "msg": "法人不能为空"
              }
            ],
            "state": null,
            "msg": "",
            "show": true
          },
          {
            "label": "注册资本",
            "column": "zczb",
            "type": "text",
            "value": null,
            "placeholder": "请填写注册资本",
            "rules": [
              {
                "type": "required",
                "trigger": "change",
                "msg": "注册资本不能为空"
              }
            ],
            "state": null,
            "msg": "",
            "show": true
          }, {
            "label": "所在地",
            "column": "address",
            "type": "fk",
            "value": null,
            "placeholder": "请填写所在地",
            "rules": [
              {
                "type": "required",
                "trigger": "change",
                "msg": "所在地不能为空"
              }
            ],
            "config": {
              "refed_col": "no",
              "service_label": "所在地详情",
              "srv_app": "config",
              "select_type": "下拉选择",
              "serviceName": "srvconfig_area_adj_select",
              "key_disp_col": "name",
              "is_tree": true
            },
            "state": null,
            "msg": "",
            "show": true
          }, {
            "label": "统一社会信用代码",
            "column": "shxydm",
            "type": "text",
            "value": null,
            "placeholder": "请填写统一社会信用代码",
            "rules": [
              {
                "type": "required",
                "trigger": "change",
                "msg": "统一社会信用代码不能为空"
              }
            ],
            "state": null,
            "msg": "",
            "show": true
          }, {
            "label": "营业执照",
            "column": "yyzz",
            "type": "image",
            "initTable": 'bxledu_practice_base',
            "value": null,
            "placeholder": "请上传营业执照",
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
          },
        ]
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
        , {
          "label": "公司名称",
          "column": "gsmc",
          "type": "text",
          "value": null,
          "placeholder": "请填写公司名称",
          "rules": [
            {
              "type": "required",
              "trigger": "change",
              "msg": "公司名称不能为空"
            }
          ],
          "state": null,
          "msg": "",
          "show": true
        }, {
          "label": "法人",
          "column": "faren",
          "type": "text",
          "value": null,
          "placeholder": "请填写法人",
          "rules": [
            {
              "type": "required",
              "trigger": "change",
              "msg": "法人不能为空"
            }
          ],
          "state": null,
          "msg": "",
          "show": true
        }

        ,
        {
          "label": "注册资本",
          "column": "zczb",
          "type": "text",
          "value": null,
          "placeholder": "请填写注册资本",
          "rules": [
            {
              "type": "required",
              "trigger": "change",
              "msg": "注册资本不能为空"
            }
          ],
          "state": null,
          "msg": "",
          "show": true
        },

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
          "label": "所在地",
          "column": "address",
          "type": "fk",
          "value": null,
          "placeholder": "请填写所在地",
          "rules": [
            {
              "type": "required",
              "trigger": "change",
              "msg": "所在地不能为空"
            }
          ],
          "config": {
            "serviceName": "srvconfig_area_adj_select",
            "srv_app": "config",
            "refed_col": "no",
            "key_disp_col": "name",
            "is_tree": true,
            "unlimited": true,
            "show_as_pair": true,
          },
          "state": null,
          "msg": "",
          "show": true
        },
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
        },
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
      if (this.currentStep === 1) {
        // 验证手机号
        if (!this.smsIsSend) {
          // this.$bvModal.msgBoxOk('请先获取验证码')
          this.$message.error('请先获取验证码')
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
      if (this.registerType === 1 && this.currentStep === 2) { //机构注册
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
          const res = await setRequest(req, 'operate', serviceName, app)
          if (res?.state == 'SUCCESS') {
            this.submit = true
            let self = this
            // console.log(this)
            this.$confirm('注册成功:初始密码是注册手机号后六位.', '请确认', {
              confirmButtonText: '前往登录',
              cancelButtonText: '取消',
              type: 'warning'
            }).then(() => {
              if (self.webConfig.manage) {
                window.location.href = self.webConfig.manage
              } else {
                self.toLogin()
              }
            }).catch(() => {
              // this.$message({
              //   type: 'info',
              //   message: '已取消删除'
              // });
            });

          } else {
            this.$message.error(res.resultMessage)
            return
          }
        }
      } else if (this.registerType === 0 && this.currentStep === 2) { //基地注册
        // 提交注册信息
        let values = {}
        let valids = []
        let isValid = true
        for (let field of this.jdFields.step1) {
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

        for (let field of this.jdFields.step2) {
          values[field.column] = field.value
        }
        this.validFeedback()

        if (isValid) {
          let serviceName = 'srvledu_practice_base_reg_add'
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
            this.$confirm('注册成功:初始密码是注册手机号后六位.', '请确认', {
              confirmButtonText: '前往登录',
              cancelButtonText: '取消',
              type: 'warning'
            }).then(() => {
              if (self.webConfig.manage) {
                window.location.href = self.webConfig.manage
              }
            }).catch(() => {
              // this.$message({
              //   type: 'info',
              //   message: '已取消删除'
              // });
            });

          } else {
            this.$message.error(res.resultMessage)
            return
          }
        }
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
            this.$confirm('注册成功:初始密码是注册手机号后六位.', '请确认', {
              confirmButtonText: '前往登录',
              cancelButtonText: '取消',
              type: 'warning'
            }).then(() => {
              if (self.webConfig.manage) {
                window.location.href = self.webConfig.manage
              }
            }).catch(() => {
              // this.$message({
              //   type: 'info',
              //   message: '已取消'
              // });
            });
          } else {
            this.$message.error(res.resultMessage)
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
      sessionStorage.clear()
      let phone = ''
      let self = this
      let values = {}
      let valids = []
      let isValid = true
      for (let field of this.formFields) {
        if (field.column == 'phone_no' || field.column == 'jdlxrdh') {
          phone = field.value
          this.change(field)
        } else if (field.column !== 'code' && field.column !== 'sms_code') {
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
          let bx_auth_ticket = res.response[0].response.bx_auth_ticket
          if (bx_auth_ticket) {
            sessionStorage.setItem('bx_auth_ticket', bx_auth_ticket)
          }
          if (countdown) {
            this.codeState = true
            this.countdown(countdown)
          }
          this.smsIsSend = true

        } else {
          this.$message.error(res.resultMessage)
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
<style lang="scss">
body {
  #maxkb {
    display: none;
  }
}

.select-box {
  display: flex;
  justify-content: center;
  padding-top: 80px;
  column-gap: 40px;

  &-item {
    height: 80px;
    line-height: 80px;
    border: 1px solid #E4E7ED;
    width: 200px;
    text-align: center;
    border-radius: 8px;
    cursor: pointer;

    &.active {
      border-color: #0e77ea;
      color: #0e77ea;
      font-weight: bold;
    }
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

.twoColumn {
  display: grid;
  grid-template-columns: 1fr 1fr;

  @media screen and (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
}

.el-select {
  width: 100%;
}

.form-control .btn.h-auto {
  padding: 0 .3rem;
  height: unset;
  line-height: unset;
}

.form-control .form-control {
  border: none;
  width: auto;
  display: inline-block;
  padding: 0;
  margin: 0;
  height: unset;
}
.grid-column-1-3 .col-form-label{
  max-width: 114px;
}
</style>
