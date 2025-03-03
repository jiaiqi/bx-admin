import axios from "axios";
import store from "../store/index";
import Vue from "vue";
import { Message } from "element-ui";
// import jscookie from 'js-cookie'; //引入cookie操作依赖
import loginDialog from "../components/ui/login-dialog/login-dialog.vue";
import { pathConfigMap } from "./envList";
let _loginDialog = null;
let baseURL = window.backendIpAddr;
let bx_auth_ticket = "";

// const ENV = 'healthDev'
  // const ENV = "gaosu111";
  // const ENV = "dev2";
  // const ENV = "wanxiang";
  // const ENV = "dev";
  const ENV = "saas";
  // const ENV = "gaosu61";

top.env = ENV

if (process.env.NODE_ENV === "development" || !window.top.pathConfig) {
  // const ENV = "dev";
  // const ENV = "wanxiang";
  // const ENV = "audDev";
  // const ENV = "yanxueOpen"; //研学外网
  // const ENV = "yanxueDev";
  // const ENV = "saas";
  // const ENV = "gaosu111";
  // const ENV = "xixiang";
  // const ENV = "244";
  // const ENV = "244";
  // const ENV = 'gaosudev'
  // const ENV = 'yanxueOpen1'
  // const ENV = 'healthProd'

  const pathConfig = pathConfigMap[ENV];
  if (location.href?.includes?.('menuapp=')) {
    let app = location.href.split('menuapp=')[1].split(';')[0]
    if (app) {
      pathConfig.application = app
    }
  }
  baseURL = pathConfig.gateway; // 正式环境
  top.pathConfig = pathConfig;
}

if (top?.pathConfig?.gateway) {
  baseURL = top?.pathConfig?.gateway;
}
let pathConfig = sessionStorage.pathConfig;
if (pathConfig) {
  try {
    pathConfig = JSON.parse(pathConfig);
    if (pathConfig?.gateway) {
      baseURL = pathConfig?.gateway;
    }
  } catch (error) { }
}
window.backendIpAddr = baseURL;
export const backendIpAddr = baseURL;

const getRootWindow = (_window) => {
  _window = _window || window;
  if (_window.top !== _window) {
    return getRootWindow(_window.top);
  } else {
    return _window;
  }
};

const instance = axios.create({
  baseURL: baseURL,
  timeout: 1000 * 60,
  withCredentials: true,
  // headers: {'X-Custom-Header': 'foobar'}
});
instance.interceptors.request.use(
  function (config) {
    // 在发送请求之前做些什么
    bx_auth_ticket = sessionStorage.getItem("bx_auth_ticket");
    if (bx_auth_ticket) {
      config.headers.set("bx_auth_ticket", bx_auth_ticket);
    }
    return config;
  },
  function (error) {
    // 对请求错误做些什么
    return Promise.reject(error);
  }
);
instance.interceptors.response.use(
  function (response) {
    // 2xx 范围内的状态码都会触发该函数。
    // 对响应数据做点什么
    // let _this = window.app; //vue实例
    if (response.hasOwnProperty("status") && response.status === 429) {
      // 当前使用人数过多，请稍后再试
      window.top.limitingTips();
    }
    if (response.data.state == "FAILURE") {
      if (response.data.resultCode == "0011") {
        store && store.commit("clearSrvCols");
        if (process?.env?.NODE_ENV === "development") {
          // 开发环境 调用登录弹窗
          let dialog = null;
          if (!_loginDialog) {
            // create dialog
            let ComponentClass = Vue.extend(loginDialog);
            dialog = new ComponentClass();
            _loginDialog = dialog;
            dialog.$mount();
          } else {
            dialog = _loginDialog;
          }
          dialog?.open((o) => {
            if (sessionStorage.bx_auth_ticket) {
              const isReload = window.confirm("登录票据更新，是否刷新页面？");
              if (isReload) {
                window.location.reload();
                setTimeout(() => {
                  window.user = JSON.parse(
                    sessionStorage.getItem("current_login_user")
                  );
                }, 500);
              }
            }
          });
        } else if (getRootWindow?.()?.layer) {
          var login_page = "/main/login.html";
          try {
            if (top.getLoginAddress) {
              login_page = "/" + top.getLoginAddress();
            }
          } catch (exception) { }
          getRootWindow().layer.open({
            title: false,
            type: 2,
            content: window.location.origin + login_page,
            closeBtn: 0,
            area: ["300px", "350px"],
            shade: 0.9,
          });
        } else {
          // 当vue页面在iframe中时，跳转到登录页面
          if (top !== window) {
            var login_page = "/main/index.html";
            try {
              if (top.getMainAddress) {
                console.info("1");
                login_page = "/" + top.getMainAddress();
              }
            } catch (exception) { }
            window.location.href = window.location.origin + login_page;
          }
        }
      } else if (response.data.resultCode == "0000") {
        if (sessionStorage.getItem("need_login_flag") != "need_login") {
          Message.error(response.data.resultMessage);
        }
      } else {
        if (response.data.resultCode !== "9998") {
          if (response.data.serviceInfo?.includes('sql语句执行异常')) {
            console.error(response.data.serviceInfo)
          } else if (sessionStorage.getItem("need_login_flag") != "need_login") {
            Message.error(response.data.resultMessage);
          }
        }
      }
    }
    if (response.data) {
      response.body = response.data;
    }
    return response;
  },
  function (error) {
    // 超出 2xx 范围的状态码都会触发该函数。
    // 对响应错误做点什么
    return Promise.reject(error);
  }
);

export const $http = instance;
