
 
// import config from '../../web-config'
// import request from '@/utils/request'
import qs from 'qs'
 
/**
 * 登录接口封装
 */
let config = {}
const host = config.port ? `${config.protocol}://${config.host}:${config.port}` : `${config.protocol}://${config.host}`
const website = `${config.webNo}`  // 站点编号
// const website = 'PCWS202304230001'  // 瓦特
const no = 'yiqipao'
const app = config.app

export function getWebSiteConfig () {
  // 站点信息查询
  let req = {
		"serviceName": "srvdaq_pc_website_cfg_select",
		"colNames": [
			"*"
		],
		"condition": [
			{
				"colName": "website_no",
				"ruleType": "eq",
				// "ruleType": "like",
				"value": website
				// "value": ''
			}
		],
		"page": {
			"pageNo": 1,
			"rownumber": 999
		},
		"order": []
	}
  // console.log(host)
  return request({
    url: `${host}/${app}/select/srvdaq_pc_website_cfg_select`,
    method: 'POST',
    data: req
  })
}

export function getBaiduMapApi (url,params) {
  // 查询轮播
   url = `${url}`
  let keys = Object.keys(params)
  if(keys.length > 0){
    for(let i in keys){
      let key = keys[i]
      if(i == 0){
        url += `?${key}=${params[key]}`
      }else{
        url += `&${key}=${params[key]}`
      }
    }
  }
  console.log('getBaiduMapApi',url)
  return request({
    url: `${url}`,
    method: 'GET'
  })
}










export function getCaseInfo (app,type,srv) {
  // 返回一个promise对象
  // let app = app
  let req = {
		"serviceName": srv,
		"colNames": [
			"*"
		],
		"condition": [
			{
				"colName": "type",
				"ruleType": "eq",
				"value": type
			}
		],
		"page": {
			"pageNo": 1,
			"rownumber": 40
		},
		"order": [{"colName":"modify_time","orderType":"asc"}]
	}
  return request({
    url: `${host}/${app}/select/${srv}/`,
    method: 'POST',
    data: req
  })
}
export function getEventInfo () {
  // 返回一个promise对象
  // let app = app
  let req = {
		"serviceName": 'srvgive_event_mgt_user_select',
		"colNames": [
			"*"
		],
		"condition": [],
		"page": {
			"pageNo": 1,
			"rownumber": 6
		},
		"order": [{"colName":"modify_time","orderType":"asc"}]
	}
  return request({
    url: `${host}/fyzhmd/select/srvgive_event_mgt_user_select/`,
    method: 'POST',
    data: req
  })
}
export function getFileInfo (no) {
  // 返回一个promise对象
  // let app = app
  let req = {
		"serviceName": 'srvfile_attachment_select',
		"colNames": [
			"*"
		],
		"condition": [
      {
        "colName": "file_no",
        "value": no,
        "ruleType": "eq"
      },
      {
        "colName": "is_delete",
        "value": "1",
        "ruleType": "eq"
      }
    ],
		"page": {
			"pageNo": 1,
			"rownumber": 6
		},
		"order": [{"colName":"modify_time","orderType":"asc"}]
	}
  return request({
    url: `${host}/file/select/srvfile_attachment_select?srvfile_attachment_select`,
    method: 'POST',
    data: req
  })
}
export function getPayInfo (req) {
  // 返回一个promise对象
  // let app = app
  
  return request({
    url: `${host}/${app}/select/srvws_member_pay_record_select?srvws_member_pay_record_select`,
    method: 'POST',
    data: req
  })
}
export function setRequest (req,type,srv) {
  // 返回一个promise对象
  // let app = app
  
  return request({
    url: `${host}/sso/${type}/${srv}?${srv}`,
    method: 'POST',
    data: req
  })
}
export function getCmt (contentNo) {
  // 返回一个promise对象
  // let app = app
  let req = {
      "serviceName": "srvdaq_pc_ws_cmt_select",
      "colNames": [
          "*"
      ],
      "condition": [
          {
              "colName": "content_no",
              "ruleType": "eq",
              "value": contentNo
          }
      ]
  }
  return request({
    url: `${host}/${app}/select/srvdaq_pc_ws_cmt_select?srvdaq_pc_ws_cmt_select`,
    method: 'POST',
    data: req
  })
}





