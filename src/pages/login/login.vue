<template>
  <div class="login-page-wrap">
    <div class="login-page">
      <div class="login-box">
        <div class="right-box login-right-box">
          <div class="login-tips">
            主中心xxxx区
          </div>
          <div class="login-logo">
            <img src="" class="logo" alt="">
          </div>
          <div class="login-title">管理网络身份认证登录系统
          </div>
          <!-- <div class="login-tabs">
            <div class="tab active" data-tab="pwd">用户名登录</div>
            <div class="tab" data-tab="uk">UTS-KEY
            </div>
          </div> -->
          <el-tabs v-model="activeTab" @tab-click="handleClick">
            <el-tab-pane label="用户名登录" name="account">
              <div class="login-form account-login">
                <div class=" form-item">
                  <div class="icon icon-account"></div>
                  <input class="  input" name="user_no" id="user_no" value="" placeholder="请输入账号" lay-verify="required"
                    type="text" autocomplete="off" />
                </div>
                <div class=" form-item">
                  <div class="icon icon-lock"></div>
                  <input class=" input" name="pwd" id="pwd" value="" placeholder="请输入密码" lay-verify="required"
                    :type="pwdVisible ? 'text' : 'password'" autocomplete="off" />
                  <div class="icon icon-eye" id="icon-eye" @click="pwdVisibleChange"></div>
                </div>
                <div class="save-password">
                  <div class="item">
                    <input type="checkbox" id="keepLogin" name="savePwd" v-model="keepLogin" />
                    <label for="keepLogin" class="ml-2">
                      保持登录状态
                    </label>
                  </div>
                </div>
                <div class="button-box">
                  <button class="btn-green" id="loginbtn">登录</button>
                </div>
              </div>
            </el-tab-pane>
            <el-tab-pane label="UTS-KEY" name="ukey">UTS-KEY</el-tab-pane>
          </el-tabs>
          <!-- <div class="login-form account-login">
            <div class=" form-item">
              <div class="icon icon-account"></div>
              <input class="  input" name="user_no" id="user_no" value="" placeholder="请输入账号" lay-verify="required"
                type="text" autocomplete="off" />
            </div>
            <div class=" form-item">
              <div class="icon icon-lock"></div>
              <input class=" input" name="pwd" id="pwd" value="" placeholder="请输入密码" lay-verify="required"
                :type="pwdVisible ? 'text' : 'password'" autocomplete="off" />
              <div class="icon icon-eye" id="icon-eye" @click="pwdVisibleChange"></div>
            </div>
            <div class="save-password">
              <div class="item">
                <input type="checkbox" id="keepLogin" name="savePwd" v-model="keepLogin" />
                <label for="keepLogin" class="ml-2">
                  保持登录状态
                </label>
              </div>
            </div>
            <div class="button-box">
              <button class="btn-green" id="loginbtn">登录</button>
            </div>
          </div> -->
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      pwdVisible: false,
      keepLogin: false,
      activeTab: "account", //account,ukey
    }
  },
  methods: {
    pwdVisibleChange() {
      this.pwdVisible = !this.pwdVisible
    }
  },
}
</script>

<style lang="scss" scoped>


.login-page-wrap {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: linear-gradient(44.8deg, rgba(160, 205, 255, 0) 2.05%, rgba(29, 89, 213, 1) 100.1%);
  --theme-color:#216E26;
}

.login-page {
  width: 100%;
  height: 100%;
  background-image: url('~@/assets/image/login/wj_login.jpg');
  background-size: cover;
  background-repeat: no-repeat;
  z-index: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow-y: auto;
}

.login-box {
  /* width: 1056px; */
  min-height: 660px;
  padding-bottom: 50px;
  line-height: 20px;
  /* border-radius: 15px; */
  background-color: #fff;
  color: #101010;
  font-size: 14px;
  text-align: center;
  display: flex;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, .1);
  border: 1px solid #ebeef5;
}



.right-box {
  box-sizing: border-box;
  width: 590px;
}


.right-box .nav {
  /*padding-left: 20px;*/
  display: flex;
  font-size: 18px;
  cursor: pointer;
}

.right-box .nav:active {
  transform: translate(1px, 1px);
}

.right-box .nav .icon {
  background-image: url("~@/assets/image/login/if-double-left.png");
  width: 20px;
  height: 20px;
  margin-right: 20px;
}

.right-box.bind-right-box .title {
  text-align: left;
  margin: 34px 0;
  font-size: 36px;
  line-height: 40px;
  color: var(--theme-color);
}

.right-box.bind-right-box .sub-title {
  /*height: 25px;*/
  /*line-height: 25px;*/
  /*color: #333333;*/
  /*font-size: 18px;*/
  /*text-align: left;*/
  height: 40px;
  display: flex;
  align-items: center;
  margin-bottom: 30px;
  font-size: 18px;
}



.login-tips {
  text-align: right;
  color: var(--theme-color);
  padding: 20px;
}

.login-logo {
  margin-bottom: 10px;
  text-align: center;
}

.login-logo img {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #ccc;
  display: inline-block;
}

.login-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 20px;
}

.login-tabs {
  margin-top: 30px;
  margin-left: 55px;
  margin-right: 55px;
  display: flex;
  justify-content: center;
  font-size: 18px;
  color: #8e8e93;
  /* font-weight: bold; */
  border-bottom: 0.5px solid #e1e3e6;
  box-sizing: border-box;
}

:deep(.el-tabs) {
  .el-tabs__header {
    width: 80%;
  }

  .el-tabs__nav-scroll {
    display: flex;
    justify-content: center;
  }
  .el-tabs__item.is-active{
    color: var(--theme-color);
  }
  .el-tabs__item:hover{
    color: var(--theme-color);
  }
  .el-tabs__active-bar{
    background-color: var(--theme-color);
    height: 4px;
  }
}

.login-tabs .active {
  color: #216E26;
  position: relative;
}

.login-tabs .active::after {
  content: '';
  display: block;
  width: 100%;
  height: 4px;
  background-color: #216e2600;
  position: absolute;
  bottom: -3px;
  left: 0;
}

.login-tabs .tab {
  padding-bottom: 20px;
  line-height: 40px;
  margin-right: 40px;
  user-select: none;
  cursor: pointer;
}

.login-form {
  padding: 48px 57px 0;
  width: 100%;
  box-sizing: border-box;

}

.login-form.scan-login {
  display: none;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

.login-form .qrcode {
  width: 295px;
  height: 295px;
  background-color: #e2e2e2;
}

.login-form .tips {
  margin-top: 33px;
  font-size: 16px;
}

.login-form .form-item {
  width: 100%;
  height: 57px;
  display: flex;
  align-items: center;
  background-color: #f0f4f9;
  border: 1px solid #f0f4f9;
  margin-bottom: 31px;
  padding: 14px;
  box-sizing: border-box;
  color: #626060;
  border-radius: 8px;
}

.login-form .form-item .input {
  min-width: 120px;
}

.form-item .icon {
  width: 28px;
  height: 28px;
  margin: 0 7px;
  background-size: 100% 100%;
  background-repeat: no-repeat;
}

.form-item .icon.icon-account {
  background-image: url("~@/assets/image/login/md-person_outline.svg");
}

.form-item .icon.icon-lock {
  background-image: url("~@/assets/image/login/md-lock_outline.svg");
}

.form-item .icon.icon-eye {
  background-image: url("~@/assets/image/login/eye-close.svg");
  cursor: pointer;
}

.form-item .icon.icon-eye.open {
  background-image: url("~@/assets/image/login/eye-open.svg");
}


.form-item .input {
  flex: 1;
  outline: none;
  border: none;
  height: 28px;
  background-color: transparent;
  font-size: 18px;
}

.save-password {
  margin-bottom: 35px;
  font-size: 18px;
  display: flex;
  justify-content: space-between;
  padding: 0 5px;
}

.save-password .item {
  line-height: 34px;
  cursor: pointer;
  user-select: none;
  border-bottom: 1px solid transparent;
}

.save-password .item.a:hover {
  border-bottom-color: #333;
}

.save-password .item.a:active {
  transform: translate(1px, 1px);
}

.button-box {
  padding: 0;
}

.button-box .btn-green {
  width: 100%;
  height: 62px;
  line-height: 20px;
  border-radius: 4px;
  background-color: #216E26;
  color: rgba(255, 255, 255, 1);
  font-size: 20px;
  text-align: center;
  font-family: "Microsoft YaHei", serif;
  border: none;
  cursor: pointer;
}

.button-box .btn-green:active {
  transform: translate(1px, 1px);
}

.button-box .btn-green.disabled {
  background-color: #c0d0e2;
  cursor: none;
}

.button-box .btn-green.disabled:active {
  transform: none;
}

@media screen and (max-width: 450px) {

  .login-title,
  .login-logo {
    display: none;
  }

  .login-tips {
    padding: 5px;
  }

  .login-box {
    min-height: 0;
    padding-bottom: 0;
  }

  .login-page-wrap,
  .login-page {
    background-image: none;
    background-color: #fff;
    padding: 10px;
    display: block;
    box-sizing: border-box;
  }

  .login-page {
    padding-top: 0;
  }

  .login-page .login-box {
    width: unset;
    height: unset;
    box-shadow: none;
    border: none;
  }

  .login-tabs {
    font-size: 20px;
    margin: 0 0 20px;
    text-align: center;
    justify-content: center;
    border-bottom: none;

  }

  .login-tabs .tab {
    font-size: 16px;
    margin: 0;
    /*flex: 1;*/
    padding-bottom: 0;
  }

  .login-tabs .tab:first-child {
    margin-right: 50px;
  }

  .login-form {
    padding: 0;
  }

  .right-box {
    width: 100%;
    margin: 0 auto;
  }

  .save-password {
    margin-bottom: 10px;
    font-size: 14px;
  }

  .login-form .form-item {
    padding: 7px;
    margin-bottom: 10px;
    margin-top: 20px;
    height: 45px;
  }

  .icon.icon-account,
  .icon.icon-lock,
  .icon.icon-eye {
    margin-left: 0;
    font-size: 20px;
  }

  .button-box .btn-green {
    height: 40px;
  }
}
</style>