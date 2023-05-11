/* */
<template>
    <el-input :placeholder="fieldInfo.placeholder" @change="change" v-model="value">
    <el-button slot="append" @click="sendSMSCode" :disabled="disabled">{{text}}</el-button>
  </el-input>
</template>

<script>
var timerSetInterval = null
            
  export default {
    components: {},
    props: {
      field: Object,
      defaultConditions: Array,
      verifyMobile:String
    },
    data() {
      return {
        text:'发送',
        value:'',
        time:300,
        disabled:false
      }
    },
    mounted(){
        this.field.model = null
        if(!this.field.form.isVerifyMobile){
            console.error('配置不完整',this.field.form.isVerifyMobile)
        }
    },
    computed:{
        fieldInfo(){
            let field = this.field
            let fieldInfo = field.info || null
            return fieldInfo
        },
        isVerifyMobile(){
            let form = this.field.form
            let isVerifyMobile = form.isVerifyMobile || false
            return isVerifyMobile
        },
        phone(){
            let defaultValues = this.field.form.defaultValues || false
            let isVerifyMobile = this.isVerifyMobile
            let phone = ''
            if(isVerifyMobile && defaultValues){
                if(defaultValues.hasOwnProperty(isVerifyMobile.phoneColName)){
                    phone = defaultValues[isVerifyMobile.phoneColName]
                }
            }
            return phone

        }
    },
    methods: {
        sendSMSCode(){
            let phone = this.phone;
            this.field.model = null
            this.value = null
            // this.$emit('change', this.field.model);
            if(phone){
                console.log('发送成功')

                let req = [{
                    "serviceName": "srvmobile_note_send",
                    "data": [{
                        "mobile": phone
                    }]
                }]

                this.operate(req).then(res => {
                    let resultMessage = res.body.resultMessage
                    if(res.body.state == 'FAILURE'){
                        this.$message({
                            type: "error",
                            message: resultMessage
                        });
                    }else{
                        this.$message({
                            type: "success",
                            message: resultMessage
                        });
                        this.timer()
                    }
                   
                })
            }else{
                console.error('无手机号可发送')
            }
        },
        change(newVal){
            this.field.model = newVal
            this.$emit('change', newVal);
        },
        timer(){
            let self = this
            self.disabled = true
            // let time = this.time
            timerSetInterval = setInterval(function() {
					if (self.time == 0) {
						//清除定时器和复原按钮
						clearInterval(timerSetInterval);
						self.disabled = false;
						self.text = '发送';
						self.time = 300; //这个10是重新开始
					} else {
						self.text = (self.time + '秒');
						self.time--;
					}
			}, 1000);

        }
        
    },

    created: function () {
    }
  }
</script>

<style>

</style>