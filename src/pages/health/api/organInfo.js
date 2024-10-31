import { $http } from "@/common/http";
const request = $http;
const baseApp = 'hsprl'
export function insert(data) {
    return request({
        url: '/api/server/organInfo/insert',
        method: 'post',
        data: data
    })
}

// 查询机构信息
export function queryByPage(data) {
    console.log(data)
    const service = 'srvjk_organ_info_web_select'
    const req = {
      colNames: ['*'],
      serviceName: service,
      page: data.page,
      condition: data.condition
    }
    return request({
        url: `/${baseApp}/select/${service}`,
        method: 'post',
        data: req
    })
}


export function update(data) {
    return request({
        url: '/api/server/organInfo/update',
        method: 'post',
        data: data
    })
}


export function deleteById(params) {
    return request({
        url: '/api/server/organInfo/deleteById',
        method: 'get',
        params: params
    })
}
