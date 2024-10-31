import { $http } from "@/common/http";
const request = $http;

export function insert(data) {
    return $http.post('/hsprl/operate/srvjk_expert_reg_add',[{
      "serviceName": "srvjk_expert_reg_add",
      data:[data]
    }])
}

// 查询专家信息
export function queryByPage(data) {
    return request({
        url: '/api/server/expertInfo/queryByPage',
        method: 'post',
        data: data
    })
}

export function deleteById(params) {
    return request({
        url: '/api/server/expertInfo/deleteById',
        method: 'get',
        params: params
    })
}

export function exportPdfById(uid) {
    return request({
        url: '/api/server/expertInfo/exportPdfById',
        method: 'get',
        params: {uid:uid}
    })
}


export function queryById(uid) {
    return request({
        url: '/api/server/expertInfo/queryById',
        method: 'get',
        params: {uid:uid}
    })
}

export function update(data) {
    return request({
        url: '/api/server/expertInfo/update',
        method: 'post',
        data: data
    })
}
export function queryFileInf (data) {
  return request({
    url: '/api/server/fileInfo/queryByPage',
    method: 'post',
    data
  })
}
