const host = window.backendIpAddr || window.pathConfig?.gateway
// import {$axios as $http} from "@/pages/datav/common/http.js";
import { $http } from '@/common/http';
const request = async (params)=>{
  const res = await $http(params)
  if(res.data){
    return res.data
  }
}

export function getV2(data, app) {
  // 查询v2
  return request({
    url: `${host}/${app}/select/srvsys_service_columnex_v2_select`,
    method: 'POST',
    data: data
  })
}


export function setRequest(req, type, srv, app = 'sso') {
  // 返回一个promise对象
  // let app = app
  return request({
    url: `${host}/${app}/${type}/${srv}?${srv}`,
    method: 'POST',
    data: req
  })
}

export function sendCode(data, app) {
  //  获取普通验证码
  let srvApp = app || 'ws'
  sessionStorage.setItem('bx_auth_ticket',null)
  return request({
    url: `${host}/${srvApp}/operate/srvmobile_note_send`,
    method: 'POST',
    data: data
  })
}

export function deleteFile(data, app) {
  let srvApp = app || 'ws'
  //  查询会员信息
  return request({
    url: `${host}/file/delete`,
    method: 'POST',
    data: data
  })
}