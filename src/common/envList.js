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
    application: "oa",
    app_path: "https://api.100xsys.cn:443/oa",
  },
  244: {
    //
    gateway_protocol: "http",
    gateway_ip: "192.168.0.244",
    port: "8101",
    gateway: "http://192.168.0.244:8101",
    sso_app: "sso",
    application: "oa",
  },
};
