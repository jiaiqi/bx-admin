export const pathConfigMap = {
  dev: {
    // 开发环境
    gateway_protocol: "http",
    gateway_ip: "192.168.0.155",
    port: "8888",
    gateway: "http://192.168.0.155:8888",
    sso_app: "sso",
    application: "dev2",
    app_path: "http://192.168.0.155:8888/dev2",
  },
  saas: {
    //正式环境
    gateway_protocol: "https",
    gateway_ip: "api.100xsys.cn",
    port: "443",
    gateway: "https://api.100xsys.cn:443",
    ws_protocol: "ws",
    ws_ip: "192.168.0.157",
    ws_port: "55555",
    ws_gateway: "ws://192.168.0.157:55555",
    sso_app: "sso",
    application: "config",
    app_path: "https://api.100xsys.cn:443/oa",
  },
  244: {
    //
    gateway_protocol: "http",
    gateway_ip: "192.168.0.244",
    port: "8101",
    gateway: "http://192.168.0.244:8101",
    sso_app: "sso",
    application: "vxfinance",
  },
  wanxiang: {
    //
    gateway_protocol: "http",
    gateway_ip: "vrms.vanxum.com",
    port: "8101",
    gateway: "http://vrms.vanxum.com:8101",
    sso_app: "sso",
    application: "devlop",
  },
  audDev: {
    //
    gateway_protocol: "http",
    gateway_ip: "192.168.0.151:180",
    port: "180",
    gateway: "http://192.168.0.151:180",
    sso_app: "sso",
    application: "aud",
  },
  yanxueDev: {
    // 研学内网
    gateway_protocol: "http",
    gateway_ip: "192.168.0.157",
    port: "8104",
    gateway: "http://192.168.0.157:8104",
    sso_app: "sso",
    application: "config",
  },
  yanxueOpen: {
    // 研学内网
    gateway_protocol: "https",
    gateway_ip: "xxld.100xsys.cn",
    port: "",
    gateway: "https://xxld.100xsys.cn",
    sso_app: "sso",
    application: "config",
  },
  yanxueOpen1: {
    // 研学内网
    gateway_protocol: "http",
    gateway_ip: "139.196.209.46",
    port: "5021",
    gateway: "http://139.196.209.46:5021",
    sso_app: "sso",
    application: "config",
  },
  xixiang: {
    // 西乡
    gateway_protocol: "https",
    gateway_ip: "api.laodongcloud.com",
    port: "",
    gateway: "https://api.laodongcloud.com",
    sso_app: "sso",
    application: "ledu",
  },
   healthDev: {
    // 健康科普资源库
    gateway_protocol: "http",
    gateway_ip: "192.168.0.154",
    port: "8104",
    gateway: "http://192.168.0.154:8104",
    sso_app: "sso",
    application: "hsprl",
  },
  healthProd: {
    // 健康科普资源库
    gateway_protocol: "https",
    gateway_ip: "admin.bxjkw.cn/bxapi",
    port: "",
    gateway: "https://admin.bxjkw.cn/bxapi",
    sso_app: "sso",
    application: "hsprl",
  },
  gaosudev: {
    // 健康科普资源库
    gateway_protocol: "http",
    gateway_ip: "192.168.0.140",
    port: "180",
    gateway: "http://192.168.0.140:180",
    sso_app: "sso",
    application: "idm",
  },
  gaosu111: {
    // 高速收费平台
    gateway_protocol: "http",
    gateway_ip: "192.168.0.111",
    port: "180",
    gateway: "http://192.168.0.111:180",
    sso_app: "sso",
    application: "idm",
  },
};
