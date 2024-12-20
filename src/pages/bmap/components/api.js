
 
import axios from "axios";
import {getroute, route_v1_route} from "../assets/mockData";

export function getBaiduMapApi (url,params) {
  // 查询轮播
   url = `${url}`
  let keys = Object.keys(params)
  if(keys.length > 0){
    for(let i in keys){
      let key = keys[i]
      if(i == 0 && params[key]){
        url += `?${key}=${params[key]}`
      }else if(params[key]){
        url += `&${key}=${params[key]}`
      }
    }
  }
  // console.log('getBaiduMapApi',url)
  return axios({
    url: `${url}`,
    method: 'GET'
  })
}
export function getBxSrv(srv,type,params) {
  // 查询轮播
  
  // console.log('getBaiduMapApi',url) srvaud_tollgrantry_station_select
  switch (type) {
    case 'select':
      return this.$select({
        url: `${url}`,
        method: 'GET'
      })
      break;
  
    default:
      break;
  }
  
}

export const geoconv = async(pointsStr)=>{
// const result = []
// if(points?.length){
  let url = `http://30.61.1.37:8519/search/v1/geoconv?from=1&to=5&coords=${pointsStr}&ApiAuthorization=USER_AK`
  // url+=points.reduce((pre,cur)=>{
  //   pre+=`${cur.lng},${cur.lat};`
  //   return pre
  // },'')
  const res = await axios({
    url,
    method:'GET'
  })
  if(res?.data?.status===0){
    return res.data.result
    // return points.map((item,index)=>{
    //   item.lat = res.data.data[index]['y']
    //   item.lng = res.data.data[index]['x']
    // })
    // res.data.result
  }
// }
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
		"order": [{"colName":"seq","orderType":"asc"}]
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
