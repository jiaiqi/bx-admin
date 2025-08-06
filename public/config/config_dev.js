
window.APP_CONFIG = {
    appKey:'rFU54XSqtk3FE3Iz4qCtyu3YyDVkvnjj',  //测试环境
    serverUrl:`//api.map.baidu.com/api?type=webgl&v=1.0&ak=rFU54XSqtk3FE3Iz4qCtyu3YyDVkvnjj`,
    API_URL:`//192.168.0.151:180`,
    viRoute:`/baiduApi/direction/v2/driving`,
    RouteAK:`tkSgCpN7B73A76l9M7RExhcdu2ip8FEo`,
    // ROUTE_151:`//api.map.baidu.com/direction/v2/driving` 打包151放开
    splitType:'|',
    // videoInfo:{
    //     host: '113.201.21.178',  // icc 平台ip
    //     port: '9443',  //icc 平台端口 https 默认 443
    //     username: 'admin',  // icc 平台用户名
    //     password: 'Admin123' // icc 平台密码
    // }
    //内网
    videoInfo:{
        host: '10.172.20.2',  // icc 平台ip
        port: '443',  //icc 平台端口 https 默认 443
        username: 'admin',  // icc 平台用户名
        password: 'Admin123' // icc 平台密码
    },
    sock:"wss://www.gxqcxkj.com:9002/im", //在线咨询使用
    chatUrl:'https://www.gxqcxkj.com/im/#/chart-info'
};
