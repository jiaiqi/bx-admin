<template>
  <el-form :inline="false" :model="formModel" class="demo-form-inline" ref="ruleForm" :rules="rules">
        <el-form-item v-if="!formModel.initSrvPassword">
            <el-input v-model="formModel.srvPassword" show-password placeholder="输入二级密码"></el-input>
        </el-form-item>
        <el-form-item v-if="formModel.initSrvPassword">
            <el-input v-model="formModel.setSrvPassword"  show-password placeholder="输入要设置的二级密码"></el-input>
        </el-form-item>
         <el-form-item>
            <el-checkbox @change="typeChange(formModel.initSrvPassword)" v-model="formModel.initSrvPassword">初次设置</el-checkbox>
        </el-form-item>
        <el-form-item>
            <el-button type="primary" @click="submitForm('ruleForm')">{{actionsName}}</el-button>
        </el-form-item>
</el-form>
</template>

<script>
export default {
    props:{
        serviceName:{
            type:[String],
            default(){
                return ''
            }
        },
        appNo:{
            type:[String],
            default(){
                return ''
            }
        }
    },
  data () {
    return {
      actionsName: '验证密码',
      formModel:{
        srvPassword:"",
        setSrvPassword:"",
        initSrvPassword:false
      },
       rules: {
          srvPassword: [
            { required: true, message: '请输入二级密码', trigger: 'blur' },
            { min: 6, max: 12, message: '长度在 6 到 12 个字符', trigger: 'blur' }
          ],
          setSrvPassword:[
            { required: true, message: '请输入二级密码', trigger: 'blur' },
            { min: 6, max: 12, message: '长度在 6 到 12 个字符', trigger: 'blur' }
          ]
        }
    }
  },
  methods: {
     submitForm(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            // alert('submit!');
            if(this.formModel.initSrvPassword){
                this.srvAuthSet(this.serviceName,this.formModel.setSrvPassword).then((res)=>{
                    console.log(res)
                })
            }else{
                this.srvAuthlogin(this.serviceName,this.formModel.srvPassword).then((res) => {
                        if (res.data.state == "SUCCESS" && res.data.response[0].response.bx_srv_auth_ticket) {
                            sessionStorage.setItem(`bx_srv_auth_ticket-${this.appNo || this.resolveDefaultSrvApp()}-${this.serviceName}`,res.data.response[0].response.bx_srv_auth_ticket)
                            this.$message({
                            showClose: true,
                            message: res.data.resultMessage,
                            type: "success",
                            });
                            
                            this.$emit('srv-auth-success',true)
                        } else {
                            this.$message({
                            showClose: true,
                            message: res.data.resultMessage,
                            type: "error",
                            });
                        }
                    });
            }
          } else {
            console.log('error submit!!');
            // this.$message({
            //     showClose: true,
            //     message: '输入格式不正确',
            //     type: "error",
            // });
            return false;
          }
        });
      },
      typeChange(val){
         if(val){
             this.$set(this,'actionsName','设置密码')
         }else{
            this.$set(this,'actionsName','验证密码')
         }
      }
  },
  mounted () {
  },
}
</script>

<style lang="scss" scoped>
</style>