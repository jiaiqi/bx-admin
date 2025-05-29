import {$http} from "@/common/http";

export default class VideoUtil{
    //获取区域视频列表树
    async getVideoListByArea(params){
        let url =  `//192.168.0.28:8104/iot/select/srv_park_park_area_channel_select`
        let req={
            serviceName: "srv_park_park_area_channel_select",
            condition: [{"colName": "area_name", "ruleType": "like", "value": ""}],
            "treeData":true,
            colNames: ["*"],
        }

        return $http.post(url, req)
    }
}