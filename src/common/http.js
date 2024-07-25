import axios from "axios";
import store from "../store/index";
// import jscookie from 'js-cookie'; //引入cookie操作依赖

const instance = axios.create({
  baseURL: `${window.backendIpAddr}`,
  timeout: 1000 * 20,
  withCredentials: true,
  // headers: {'X-Custom-Header': 'foobar'}
});
instance.interceptors.request.use(
  function (config) {
    // 在发送请求之前做些什么
    const bx_auth_ticket = sessionStorage.getItem("bx_auth_ticket");
    config.headers.set("bx_auth_ticket", bx_auth_ticket);
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
    let _this = window.app; //vue实例
    if (response.hasOwnProperty("status") && response.status === 429) {
      // 当前使用人数过多，请稍后再试
      window.top.limitingTips();
    }
    if (response.data.state == "FAILURE") {
      if (response.data.resultCode == "0011") {
        store && store.commit("clearSrvCols");
        if (_this.getRootWindow().layer) {
          var login_page = "/main/login.html";
          try {
            if (top.getLoginAddress) {
              login_page = "/" + top.getLoginAddress();
            }
          } catch (exception) {}
          _this.getRootWindow().layer.open({
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
            } catch (exception) {}
            window.location.href = window.location.origin + login_page;
          }
        }
      } else if (response.data.resultCode == "0000") {
        if (sessionStorage.getItem("need_login_flag") != "need_login") {
          alert(response.data.resultMessage);
        }
      } else {
        if (response.data.resultCode !== "9998") {
          if (sessionStorage.getItem("need_login_flag") != "need_login") {
            alert(response.data.resultMessage);
          }
        }
      }
    }
    if(response.data){
      response.body = response.data
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
