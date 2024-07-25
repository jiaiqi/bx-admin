import axios from "axios";
// http://192.168.0.241:8080/lgs/select/srvwuliu_driver_select?srvwuliu_driver_select

import Vue from "vue";
// import jscookie from 'js-cookie'; //引入cookie操作依赖

export default function () {
    // https://login.100xsys.cn:1443/
    const instance = axios.create({
        baseURL: `${window.backendIpAddr}/lgs/`,
        timeout: 1000 * 20,
        withCredentials: true,
        // headers: {'X-Custom-Header': 'foobar'}
    });
    console.log(window.backendIpAddr, "=backendIpAddr=backendIpAddr=")
    instance.interceptors.request.use(function (config) {

        // 在发送请求之前做些什么
        // request.headers.set('bx_auth_ticket', sessionStorage.getItem("bx_auth_ticket"))
        let bx_auth_ticket = sessionStorage.getItem("bx_auth_ticket")
        config.headers.set('bx_auth_ticket', bx_auth_ticket)
        return config;
    }, function (error) {
        // 对请求错误做些什么
        return Promise.reject(error);
    });
    // 添加响应拦截器
    instance.interceptors.response.use(function (response) {
        // 2xx 范围内的状态码都会触发该函数。
        // 对响应数据做点什么

        let filter = (response) => {
            // this.msgTips()
            let _this = window.app;
            if (response.hasOwnProperty('status') && response.status === 429) {
                //layer.msg('当前使用人数过多，请稍后再试', {icon: 12});
                // this.msgTips()
                Vue.prototype.msgTips()
            }


            // console.log("response",response)
            if (response.data.state == "FAILURE") {
                if (response.data.resultCode == '0011') {


                    if (_this.getRootWindow().layer) {


                        var login_page = "/main/login.html"

                        try {
                            if (top.getLoginAddress) {
                                console.info("1");
                                login_page = "/" + top.getLoginAddress();
                            }
                        } catch (exception) { }

                        _this.getRootWindow().layer.open({
                            title: false,
                            type: 2,
                            content: window.location.origin + login_page,
                            closeBtn: 0,
                            area: ['300px', '350px'],
                            shade: 0.9
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


                } else if (response.data.resultCode == '0000') {

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
        };

        filter(response)

        return response;
    }, function (error) {
        // 超出 2xx 范围的状态码都会触发该函数。
        // 对响应错误做点什么
        return Promise.reject(error);
    })
    const instanceYq = axios.create({
        baseURL: `${window.backendIpAddr}/lpark`,
        timeout: 1000 * 20,
        withCredentials: true,
        // headers: {'X-Custom-Header': 'foobar'}
    });
    instanceYq.interceptors.request.use(function (config) {

        // 在发送请求之前做些什么
        // request.headers.set('bx_auth_ticket', sessionStorage.getItem("bx_auth_ticket"))
        let bx_auth_ticket = sessionStorage.getItem("bx_auth_ticket")
        config.headers.set('bx_auth_ticket', bx_auth_ticket)
        return config;
    }, function (error) {
        // 对请求错误做些什么
        return Promise.reject(error);
    });
    // 添加响应拦截器
    instanceYq.interceptors.response.use(function (response) {
        // 2xx 范围内的状态码都会触发该函数。
        // 对响应数据做点什么

        let filter = (response) => {
            // this.msgTips()
            let _this = window.app;
            if (response.hasOwnProperty('status') && response.status === 429) {
                //layer.msg('当前使用人数过多，请稍后再试', {icon: 12});
                // this.msgTips()
                Vue.prototype.msgTips()
            }


            // console.log("response",response)
            if (response.data.state == "FAILURE") {
                if (response.data.resultCode == '0011') {


                    if (_this.getRootWindow().layer) {


                        var login_page = "/main/login.html"

                        try {
                            if (top.getLoginAddress) {
                                console.info("1");
                                login_page = "/" + top.getLoginAddress();
                            }
                        } catch (exception) { }

                        _this.getRootWindow().layer.open({
                            title: false,
                            type: 2,
                            content: window.location.origin + login_page,
                            closeBtn: 0,
                            area: ['300px', '350px'],
                            shade: 0.9
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


                } else if (response.data.resultCode == '0000') {

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
        };

        filter(response)

        return response;
    }, function (error) {
        // 超出 2xx 范围的状态码都会触发该函数。
        // 对响应错误做点什么
        return Promise.reject(error);
    })

    const instance3 = axios.create({
        baseURL: `${window.backendIpAddr}`,
        timeout: 1000 * 20,
        withCredentials: true,
        // headers: {'X-Custom-Header': 'foobar'}
    });
    instance3.interceptors.request.use(function (config) {
        // 在发送请求之前做些什么
        // request.headers.set('bx_auth_ticket', sessionStorage.getItem("bx_auth_ticket"))
        let bx_auth_ticket = sessionStorage.getItem("bx_auth_ticket")
        config.headers.set('bx_auth_ticket', bx_auth_ticket)
        return config;
    }, function (error) {
        // 对请求错误做些什么
        return Promise.reject(error);
    });
    instance3.interceptors.response.use(function (response) {
        // 2xx 范围内的状态码都会触发该函数。
        // 对响应数据做点什么

        let filter = (response) => {
            // this.msgTips()
            let _this = window.app;
            if (response.hasOwnProperty('status') && response.status === 429) {
                //layer.msg('当前使用人数过多，请稍后再试', {icon: 12});
                // this.msgTips()
                Vue.prototype.msgTips()
            }


            // console.log("response",response)
            if (response.data.state == "FAILURE") {
                if (response.data.resultCode == '0011') {


                    if (_this.getRootWindow().layer) {


                        var login_page = "/main/login.html"

                        try {
                            if (top.getLoginAddress) {
                                console.info("1");
                                login_page = "/" + top.getLoginAddress();
                            }
                        } catch (exception) { }

                        _this.getRootWindow().layer.open({
                            title: false,
                            type: 2,
                            content: window.location.origin + login_page,
                            closeBtn: 0,
                            area: ['300px', '350px'],
                            shade: 0.9
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


                } else if (response.data.resultCode == '0000') {

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
        };

        filter(response)

        return response;
    }, function (error) {
        // 超出 2xx 范围的状态码都会触发该函数。
        // 对响应错误做点什么
        return Promise.reject(error);
    })

    Vue.prototype.$http2 = instance;
    Vue.prototype.$axios = instance3;
    Vue.prototype.$httpYq = instanceYq;

}


// console.log(Vue.$http2,"---------------------------------------------------")

