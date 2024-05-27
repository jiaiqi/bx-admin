import gantry from '../assets/icon/gantry.png'
import gantryActive from '../assets/icon/gantry-active.png'
import startIcon from '../assets/icon/start.png'
import endIcon from '../assets/icon/end.png'
import toll from '../assets/icon/toll.png'
import tollActive from '../assets/icon/toll-active.png'
import custom from '../assets/icon/custom.png'
import {getpassconv, getpassconvpath} from "../assets/mockData";

let waypointsLen = 20  // 最大途径点 包含起终点数量
export default {
    props: {
        depts: {
          type: Array,
          default: function () {
            return [];
          }
        },
        initCheckPointId:{
            type:String,
            default:function (){
                return ''
            }
        }
    },
    data(){
        return {
            initCheckPoint:null,
            newPoints:[],
            activeNewPoint:null,
            isEditorNews:false,
            isEditor:false,
            activeDeptNo:'',
            activeTollLink:null,
            loadStations:[],
            loadPassconvPath:{},
            tolllinks:[],
            updatePoints:[]

        }
    },
    computed:{
        buildDivCond(){
            let divCond = []
            let entime = this.$route.query.entime || this.$route.params.entime
            let extime = this.$route.query.extime || this.$route.params.extime
            divCond =  [{
                "colName":"entime",
                "ruleType":"in",
                "value":[`${entime}`,`${extime}`]
            }]
            var operate_params = this.getOperateParams();
            if (operate_params) {
              var operate_Object = JSON.parse(operate_params);
              if (operate_Object["divCond"]) {
                divCond.push(operate_Object["divCond"])
              }
            }
            return divCond
        },
        buildCond(){
            let cond = []
            var operate_params = this.getOperateParams();
            if (operate_params) {
              var operate_Object = JSON.parse(operate_params);
              if (operate_Object["condition"]) {
                cond.push(...operate_Object["condition"])
              }
            }
            return cond
        },
        waypointsSeparator(){
            if(sessionStorage.getItem('bMapApi')?.includes('/route/v1/route')){
                // 百度地图专网接口 waypoints使用分号作为分隔符
                return ';'
            }else{
                // 百度地图开放平台 waypoints使用竖线作为分隔符
                // https://lbs.baidu.com/faq/api?title=webapi/webservice-direction/dirve
                return '|'
            }
        },
        initLinks(){
            // 初始化所有路径
            let self = this
            let loadlinks = this.bxDeepClone(this.tolllinks)
            let activeLine = this.activeLine ? this.bxDeepClone(this.activeLine) : null
            let buildLines = []
            let loadStationsDatas = self.bxDeepClone(self.loadStations)
            let drivingPoints = loadStationsDatas.filter(item => item['path_type'] == '行驶路径')
            let drivingPayPoints = loadStationsDatas.filter(item => item['path_type'] == '收费路径')
            let drivingMinPoints = loadStationsDatas.filter(item => item['path_type'] == '最小费额路径')
            let allPointsTypes = [drivingPoints,drivingPayPoints,drivingMinPoints]
            let reslines = []
            // loadlinks = loadlinks.map(item => 
            for(let item of loadlinks){
                let obj = {}
                if(this.modeUrl == '/bmap/editor/' || this.modeUrl == '/bmap/check'){
                    obj = {...item}
                }
                let keyNo = item.id
                switch (self.modeUrl) {
                    case '/bmap/editor/':
                        keyNo = item.passid
                        break;
                
                    default:
                        break;
                }
                obj['type'] = 'line'
                obj['id'] = item['id']
                obj["points"]=[]
                let start = {
                    "id":item.id,
                    "name":'起点',
                    "lat":item['startlat'],
                    "lng":item['startlng'],
                    "_dev_point_type":'start',
                    "type":"point",
                    "_type":"point",
                    "icon":startIcon,
                    "icon_active":startIcon,
                    "icon_size":{
                        w:42,
                        h:42
                    },
                    'icon_anchor':{
                        w:21,
                        h:21
                    }
                }
                let end = {
                    "id":item.id,
                    "name":'终点',
                    "lat":item['endlat'],
                    "lng":item['endlng'],
                    "_dev_point_type":'end',
                    "type":"point",
                    "_type":"point",
                    "icon":endIcon,
                    "icon_active":endIcon,
                    "icon_size":{
                        w:42,
                        h:42
                    },
                    'icon_anchor':{
                        w:21,
                        h:21
                    }
                }
                obj['start'] = start
                obj['end'] = end
                // obj["points"].push(start)
                // obj["points"].push(end)
                obj['params'] = {
                    "origin":"34.181221,108.889033",
                    "destination":"34.404827,108.798106",
                    "waypoints":"",
                    "tactics":4,
                    "waypoints_str":"",
                    "ak":"FC190506b9b4fa8b366db9f78cb5e93e"
                }
                obj['params']['origin'] = `${start.lat},${start.lng}`
                obj['params']['destination'] = `${end.lat},${end.lng}`
                
               
                if(this.modeUrl == '/bmap/check' && self.activeTollLink && item.id == self.activeTollLink.id && Array.isArray(loadStationsDatas) && loadStationsDatas.length > 0){
                    // 门架编辑 
                    let points = self.bxDeepClone(loadStationsDatas)
                    obj["points"] = points.map( p => {
                        let point = {
                            ...p
                        }
                        
                        point['_dev_point_type'] = p['category']
                        switch (point['_dev_point_type']) {
                            case '门架':
                                point['icon'] = gantry
                                point['icon_active'] = gantryActive
                                point["icon_size"]={
                                    w:25,
                                    h:30
                                }
                                point['icon_anchor'] = {
                                    w:12.5,
                                    h:30
                                }
                                break;
                            case '收费站':
                                point['icon'] = toll
                                point['icon_active'] = tollActive
                                point["icon_size"]={
                                    w:30,
                                    h:36
                                }
                                point['icon_anchor'] = {
                                    w:15,
                                    h:36
                                }
                                break;
                        
                            default:
                                
                                break;
                        }

                        // 路径编辑业务 格式处理 都是门架
                        // if(this.modeUrl == '/bmap/editor/' && this.no){
                        //     point['icon'] = gantry
                        //     point['icon_active'] = gantryActive
                        //     point["icon_size"]={
                        //         w:25,
                        //         h:30
                        //     }
                        //     point['icon_anchor'] = {
                        //         w:12.5,
                        //         h:30
                        //     }
                        // }
                         return  this.bxDeepClone(point)
                    })
                }
               
                
                if(self.modeUrl == '/bmap/editor/' && keyNo && self.loadPassconvPath[keyNo]){
                    // 路径可视化
                    loadStationsDatas = self.loadPassconvPath[keyNo].map((item,index) => {
                        item['_type'] = 'point'
                        item['_seq'] = index + 1
                        return item
                    })

                    
                     drivingPoints = loadStationsDatas.filter(item => item['path_type'] == '行驶路径')
                    drivingPoints = drivingPoints.map((item,index) => {
                        item['_seq'] = index + 1
                        return item
                    })
                    
                     drivingPayPoints = loadStationsDatas.filter(item => item['path_type'] == '收费路径')
                     drivingPayPoints = drivingPayPoints.map((item,index) => {
                        item['_seq'] = index + 1
                        return item
                    })
                     drivingMinPoints = loadStationsDatas.filter(item => item['path_type'] == '最小费额路径')
                     drivingMinPoints = drivingMinPoints.map((item,index) => {
                        item['_seq'] = index + 1
                        return item
                    })
                     allPointsTypes = [drivingPoints,drivingPayPoints,drivingMinPoints]
                    // let item['_editor_type'] = 'driving'
                    
                    // 三条路径拆分途径点和拆线
                    if(activeLine && activeLine['_editor_type'] == 'driving_pay'){
                        allPointsTypes = [drivingPoints,drivingMinPoints,drivingPayPoints]
                    }
                    if(activeLine && activeLine['_editor_type'] == 'driving_min'){
                        allPointsTypes = [drivingPoints,drivingPayPoints,drivingMinPoints]
                    }
                    console.log(keyNo,allPointsTypes)
                    for(let subpoints of allPointsTypes){
                        if(Array.isArray(subpoints) && subpoints.length > 0){
                            let lineType = subpoints[0]['path_type']
                            if(Array.isArray(subpoints) && subpoints.length > 0){
                                // 处理合并线 的 路径点
                                obj['name'] = `${item['vehicleid']}-${item['enstationname']}-${item['exstationname']}`  // name  拼接
                                let points = self.bxDeepClone(subpoints).map(item => item)
                                obj["points"] = points.map( p => {
                                    let point = {
                                        ...p
                                    }
                                    point['_dev_point_type'] = p['category'] || '门架'
                                    switch (point['_dev_point_type']) {
                                        case '门架':
                                            point['icon'] = gantry
                                            point['icon_active'] = gantryActive
                                            point["icon_size"]={
                                                w:25,
                                                h:30
                                            }
                                            point['icon_anchor'] = {
                                                w:12.5,
                                                h:30
                                            }
                                            break;
                                        case '收费站':
                                            point['icon'] = toll
                                            point['icon_active'] = tollActive
                                            point["icon_size"]={
                                                w:30,
                                                h:36
                                            }
                                            point['icon_anchor'] = {
                                                w:15,
                                                h:36
                                            }
                                            break;
                                    
                                        default:

                                            break;
                                    }
                                    return  this.bxDeepClone(point)
                                })
                                // obj['all_points'] = this.bxDeepClone(obj.points)
                            }
                            // 处理起终点
                            if(obj.points.length >= 2){
                                start = this.bxDeepClone(obj.points[0])
                                end = this.bxDeepClone(obj.points[obj.points.length - 1])
                                obj["start"] = start
                                obj["end"] = end
        
                                obj['params']['origin'] = `${start.lat},${start.lng}`
                                obj['params']['destination'] = `${end.lat},${end.lng}`
                                obj['params']['waypoints_str'] = ``
                                
                                obj['params']['waypoints_str'] = []
                                obj['params']['waypoints'] = []
                                for(let pIndex in obj['points']){
                                    let p = this.bxDeepClone(obj['points'][pIndex])
                                    if(pIndex != '0' && pIndex != `${obj['points'].length - 1}`){
                                        // 去掉 起终点 剩余为 途径点
                                        let str = `${p.lat},${p.lng}`
                                        obj['params']['waypoints_str'].push(str)
                                        obj['params']['waypoints'].push(this.bxDeepClone(p))
                                    }
                                }
                                if(Array.isArray(obj['params']['waypoints_str'])){
                                    obj['params']['waypoints_str'] = obj['params']['waypoints_str'].join('|')
                                }
                                
                                
                            }
                            
                            switch (lineType) {
                                case '行驶路径':
                                    obj['_editor_type'] = 'driving'
                                    break;
                                case '收费路径':
                                    obj['_editor_type'] = 'driving_pay'
                                    break;
                                case '最小费额路径':
                                    obj['_editor_type'] = 'driving_min'
                                    break;
                            
                                default:
                                    obj['_editor_type'] = 'none'
                                    break;
                            }
                            obj['all_points'] = this.bxDeepClone(obj.points)
                            buildLines.push(this.bxDeepClone(obj))
                        }
                    }
                    // console.log('路径',drivingPoints,drivingPayPoints,drivingMinPoints)
                    
                    
                }else if(this.modeUrl == '/bmap/check'){
                    obj["points"].unshift(start)
                    obj["points"].push(end)
                    obj['all_points'] = this.bxDeepClone(obj.points)
                    buildLines.push(this.bxDeepClone(obj))
                }
                
               
                // return  this.bxDeepClone(obj)

            }
            // )
            console.log('buildlines',buildLines)
            if(this.modeUrl == '/bmap/editor/' && this.no){
                // 拆分线逻辑
                let lines = this.bxDeepClone(buildLines)
                let sliceLines = []
                for(let line of lines){
                    let pLens = []
                    // console.log(line.name,line.points.length)
                    if(line.points.length - 2 > waypointsLen){
                        let pointsLen = []
                        let step = 0
                        let index = 0
                        for(let i in line.points){
                            
                            let p = line.points[i]
                            if(((Number(i)+1) % waypointsLen) == 0){
                                // 当前已到途径点长途，保存后重新截取
                                let l = this.bxDeepClone(line)
                                pointsLen.push(p)
                                // pLens.push(this.bxDeepClone(pointsLen))
                                l['points'] = this.bxDeepClone(pointsLen)
                                l['all_points'] = this.bxDeepClone(line.points)
                                pointsLen = [p]
                                sliceLines.push(this.bxDeepClone(l))
                                // console.log('i',this.bxDeepClone(l))
                            }else if(Number(i) != line.points.length - 1){
                                // 不是最后一个点，也不是截取点时
                                pointsLen.push(p)
                            }else if(Number(i) == line.points.length - 1){
                                // 最后一个点时
                                let l = this.bxDeepClone(line)
                                pointsLen.push(p)
                                l['points'] = this.bxDeepClone(pointsLen)
                                l['all_points'] = this.bxDeepClone(line.points)
                                // pLens.push(this.bxDeepClone(pointsLen))
                                
                                sliceLines.push(this.bxDeepClone(l))
                                // console.log('i',this.bxDeepClone(l))
                            }
                            
                        }
                        // console.log('截取',pLens.length,sliceLines,pLens,pointsLen)
                    }else{
                        sliceLines.push(this.bxDeepClone(line))
                    }

                    
                }
                if(sliceLines.length > buildLines.length ){
                    buildLines = sliceLines.map(nItem => {
                        // 初始化  params
                        if(nItem.points.length >= 2){
                            let start = this.bxDeepClone(nItem.points[0])
                            let end = this.bxDeepClone(nItem.points[nItem.points.length - 1])
                            nItem["start"] = start
                            nItem["end"] = end
                            // 重新设置 起终点
                            nItem['params']['origin'] = `${start.lat},${start.lng}`
                            nItem['params']['destination'] = `${end.lat},${end.lng}`
                            nItem['params']['waypoints_str'] = ``
                            
                            nItem['params']['waypoints_str'] = []
                            nItem['params']['waypoints'] = []
                            for(let pIndex in nItem['points']){
                                // 处理途径点 和 参数
                                let p = this.bxDeepClone(nItem['points'][pIndex])
                                if(pIndex != '0' && pIndex != `${nItem['points'].length - 1}`){
                                    let str = `${p.lat},${p.lng}`
                                    if(p.lat&&p.lng){
                                        nItem['params']['waypoints_str'].push(str)
                                        nItem['params']['waypoints'].push(this.bxDeepClone(p))
                                    }else{
                                        console.log('当前途径点没有经纬度信息：',p)
                                    }
                                    // console.log("obj['params']['waypoints_str']",obj['params']['waypoints_str'],obj['params'].waypoints,obj['params']['waypoints_str'].join('|'))
                                }
                            }
                            // console.log("obj['params']['waypoints_str']",obj['params']['waypoints_str'],obj.waypoints,obj['params']['waypoints_str'].join('|'))
                            if(Array.isArray(nItem['params']['waypoints_str'])){
                                // 途径点参数装字符串
                                nItem['params']['waypoints_str'] = nItem['params']['waypoints_str'].join('|')
                            }
                            
                        }
                        return nItem
                    })
                }


                

            }
            
            reslines = buildLines.map(item => item)
            return reslines
        }
    },
    mounted(){
        let self = this
        this.initMap()
        if(this.modeUrl == '/bmap/check' || this.modeUrl.indexOf('/bmap/check') !== -1){
            this.isEditor = true
            this.getNewPoints()  // 新增门架
            if(self.initCheckPointId){
                self.getPointInfo()
            }
        }else if(this.modeUrl == '/bmap/editor/' && this.no){
            
            this.isEditor = false
            this.getPassconv()
            this.getPassconvpath()
        }
       
       
    },
    methods: {
        getPassconv(){
            // 查询所有分公司下路段
            let self = this
            // category取值：门架、收费站
            // grantry_type取值：路段门架、虚拟门架、省界门架、收费站
            // company_no：分公司，可通过该字段进行过滤，分公司用户登录时，使用用户的dept_no进行过滤
            let srv = 'srvaud_passconv_select';
            let srvAuth = 'aud'
            let conds = [{
                colName:'passid',
                ruleType:'eq',
                value:self.no
            }]
            
            let relationCondition = {}
            let page = null
            let order = null
            let entime = this.$route.query.entime || this.$route.params.entime
            let extime = this.$route.query.extime || this.$route.params.extime
            if(!self.no || !entime || !extime){
                console.log('初始化参数缺少 passid')
                return 
            }
            
            let divCond =  [{
                "colName":"entime",
                "ruleType":"in",
                "value":[`${entime}`,`${extime}`]
            }]
            divCond = this.buildDivCond
            self.select(
                srv,
                conds,
                page,
                order,
                null,
                null,
                srvAuth,
                null,
                null,
                relationCondition,
                false,
                null,
                null,
                null,
                null,
                null,
                divCond
                // srvAuth
              ).then(res => {
            // getpassconv().then(res=>{ //mockData
                // console.log('分公司',res.data)
                res = res.data
                if(res.state == "SUCCESS"){
                    self.tolllinks = res.data.map(item => {
                        item['_editor_type'] = 'driving'
                        return item
                    })
                    // console.log('分公司',res.data)
                }else{
                    this.$message.error(JSON.stringify(res));
                    // console.log('查询收费路段 异常',res)
                }
              })
        },
        async getPassconvpath(){
            // 查询所有门架
            let self = this
            // category取值：门架、收费站
            // grantry_type取值：路段门架、虚拟门架、省界门架、收费站
            // company_no：分公司，可通过该字段进行过滤，分公司用户登录时，使用用户的dept_no进行过滤
            let passid = this.no
            let srv = 'srvaud_passconvpath_select';
            // 使用url传的服务
            let operate_params = this.getOperateParams();
            if (operate_params) {
                let operate_Object = JSON.parse(operate_params);
                if (operate_Object["serviceName"]) {
                    srv = operate_Object.serviceName
                }
            }
            let srvAuth = 'aud'
            let conds = [
                {
                colName:'passid',
                ruleType:'eq',
                value:passid
                }
            ]
            
            let relationCondition = {}
            let page = null
            let order = null
            let entime = this.$route.query.entime || this.$route.params.entime
            let extime = this.$route.query.extime || this.$route.params.extime
            if(!passid || !entime || !extime){
                console.log('初始化参数缺少 passid')
                return 
            }
            let divCond =  [{
                "colName":"transtime",
                "ruleType":"in",
                "value":[`${entime}`,`${extime}`]
            }]
            // divCond = this.buildDivCond
            if(this.buildCond?.length){
               conds = this.buildCond
            }
            let res = {}
            if(this.pathData?.length ){
                res = {
                    state:'SUCCESS',
                    data:this.pathData
                }
            }else{
               const resp = await self.select(
                    srv,
                    conds,
                    page,
                    order,
                    null,
                    null,
                    srvAuth,
                    null,
                    null,
                    relationCondition,
                    false,
                    null,
                    null,
                    null,
                    null,
                    null,
                    divCond
                    // srvAuth
                )
               //  const resp = await getpassconvpath() //mockData
                res = resp.data

            }
            // .then(res => {
                // console.log('分公司',res.data)
                if(res.state == "SUCCESS"){
                    let passconvPaths = res.data.filter((item,index) =>{
                        if(item['grantry_type'] !== '虚拟门架'){
                            item['name'] = item['tollgrantry_name']
                            item['_seq'] = index + 1
                            return item
                        }
                        
                    })
                    self.$set(self.loadPassconvPath,`${passid}`,self.bxDeepClone(passconvPaths))
                    // self.loadPassconvPath[`${passid}`] = passconvPaths.map(item => item)
                    // console.log('分公司',res.data)
                }else{
                    this.$message.error(JSON.stringify(res));
                    console.log('查询门架|收费站等 异常',res)
                }
              // })
        },
        newPointRequestUpdatePoint(e){
            let self = this
            console.log('修改点坐标',e)
            let bxRequests = []
            let request = {
                srvApp:'aud',
                serviceName:'',
                data:[],
                condition:[{
                    colName:'id',
                    ruleType:'eq',
                    value:e.id
                }]
            }
            if(e && e.id){
                switch (e['_dev_point_type']) {
                    case '门架':
                        request['serviceName'] = 'srvaud_tollgrantry_update'
                        request.data.push({
                            lat:`${e.lat}`,
                            lng:`${e.lng}`
                        })
                        break;
                    case '收费站':
                        request['serviceName'] = 'srvaud_tollstation_update'
                        request.data.push({
                            lat:`${e.lat}`,
                            lng:`${e.lng}`
                        })
                        break;
                    case 'end':
                        console.log('起终点修改',e)
                        request['serviceName'] = 'srvaud_tolllink_update'
                        
                        request.data.push({
                            endlat:`${e.lat}`,
                            endlng:`${e.lng}`
                        })
                        break;
                    case 'start':
                        console.log('起终点修改',e)
                        request['serviceName'] = 'srvaud_tolllink_update'
                        
                        request.data.push({
                            startlat:`${e.lat}`,
                            startlng:`${e.lng}`
                        })
                        break;
                
                    default:
                        break;
                }
                bxRequests.push(self.bxDeepClone(request))
            }
            if(Array.isArray(bxRequests) && bxRequests.length > 0){
                self.$alert('保存新门架位置, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    callback: action => {
                        console.log(action)
                        if(action == 'confirm'){
                            self.operate(bxRequests).then(response => {
                                let state = response.body.state;
                                console.log(state,e['_dev_point_type'])
                                if ("SUCCESS" == state) {
                  
                                    self.$message({
                                        type: 'success',
                                        message: '保存成功!'
                                    });
                                    self.getNewPoints()
                                    
                                } else {
                                  this.$message({
                                    type: "error",
                                    message: response.body.resultMessage
                                  });
                                }
                            });
                        }
                        
                    }
                  })
                
                
                
            }
            
        },
        submitUpdatePoints(){
            let self = this
            console.log('修改点坐标',this.updatePoints)
            let bxRequestsPoints = []
            let bxRequestsLines = []
            let request = {
                srvApp:'aud',
                serviceName:'',
                data:[],
                condition:[{
                    colName:'id',
                    ruleType:'eq',
                    value:''
                }]
            }
            let points = self.bxDeepClone(this.updatePoints)
            for(let e of points){
                if(e && e.id){
                    request['condition'][0]['value'] = e.id
                    switch (e['_dev_point_type']) {
                        case '门架':
                            request['serviceName'] = 'srvaud_tollgrantry_update'
                            request.data.push({
                                lat:`${e.lat}`,
                                lng:`${e.lng}`
                            })
                            bxRequestsPoints.push(self.bxDeepClone(request))
                            break;
                        case '收费站':
                            request['serviceName'] = 'srvaud_tollstation_update'
                            request.data.push({
                                lat:`${e.lat}`,
                                lng:`${e.lng}`
                            })
                            bxRequestsPoints.push(self.bxDeepClone(request))
                            break;
                        case 'end':
                            console.log('起终点修改',e)
                            request['serviceName'] = 'srvaud_tolllink_update'
                            
                            request.data.push({
                                endlat:`${e.lat}`,
                                endlng:`${e.lng}`
                            })
                            bxRequestsLines.push(self.bxDeepClone(request))
                            break;
                        case 'start':
                            console.log('起终点修改',e)
                            request['serviceName'] = 'srvaud_tolllink_update'
                            
                            request.data.push({
                                startlat:`${e.lat}`,
                                startlng:`${e.lng}`
                            })
                            
                            bxRequestsLines.push(self.bxDeepClone(request))
                            break;
                    
                        default:
                            break;
                    }
                    
                }
            }
            if((Array.isArray(bxRequestsPoints) && bxRequestsPoints.length > 0) || (Array.isArray(bxRequestsLines) && bxRequestsLines.length > 0)){
                this.$confirm('保存所有位置校准, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                  }).then(() => {
                    self.updatePoints = [].map(item => item)


                    if(Array.isArray(bxRequestsLines) && bxRequestsLines.length > 0){
                        self.operate(bxRequestsLines).then(response => {
                            let state = response.body.state;
                            // console.log(state,e['_dev_point_type'])
                            if ("SUCCESS" == state) {
              
                                self.$message({
                                    type: 'success',
                                    message: '保存成功!'
                                });
                                self.getAllTolllinks()
                            } else {
                              this.$message({
                                type: "error",
                                message: response.body.resultMessage
                              });
                            }
                          });
                    }
                    if(Array.isArray(bxRequestsPoints) && bxRequestsPoints.length > 0){
                        self.operate(bxRequestsPoints).then(response => {
                            let state = response.body.state;
                            // console.log(state,e['_dev_point_type'])
                            if ("SUCCESS" == state) {
              
                                self.$message({
                                    type: 'success',
                                    message: '保存成功!'
                                });
                                
                                if( self.activeLine){
                                    // 重新加载门架
                                    self.getAllStations(self.activeLine.id)
                                }
                            } else {
                              this.$message({
                                type: "error",
                                message: response.body.resultMessage
                              });
                            }
                          });
                    }
                      
                   
                    
                  }).catch(() => {
                    this.$message({
                      type: 'info',
                      message: '已取消保存'
                    });          
                  });
            }

        },
        requestUpdatePoint(e){
            let self = this
            console.log('修改点坐标',e)
            let bxRequests = []
            let request = {
                srvApp:'aud',
                serviceName:'',
                data:[],
                condition:[{
                    colName:'id',
                    ruleType:'eq',
                    value:e.id
                }]
            }
            if(e && e.id){
                switch (e['_dev_point_type']) {
                    case '门架':
                        request['serviceName'] = 'srvaud_tollgrantry_update'
                        request.data.push({
                            lat:`${e.lat}`,
                            lng:`${e.lng}`
                        })
                        break;
                    case '收费站':
                        request['serviceName'] = 'srvaud_tollstation_update'
                        request.data.push({
                            lat:`${e.lat}`,
                            lng:`${e.lng}`
                        })
                        break;
                    case 'end':
                        console.log('起终点修改',e)
                        request['serviceName'] = 'srvaud_tolllink_update'
                        
                        request.data.push({
                            endlat:`${e.lat}`,
                            endlng:`${e.lng}`
                        })
                        break;
                    case 'start':
                        console.log('起终点修改',e)
                        request['serviceName'] = 'srvaud_tolllink_update'
                        
                        request.data.push({
                            startlat:`${e.lat}`,
                            startlng:`${e.lng}`
                        })
                        break;
                
                    default:
                        break;
                }
                bxRequests.push(self.bxDeepClone(request))
            }
            if(Array.isArray(bxRequests) && bxRequests.length > 0){
                self.operate(bxRequests).then(response => {
                    let state = response.body.state;
                    console.log(state,e['_dev_point_type'])
                    if ("SUCCESS" == state) {
      
                        self.$message({
                            type: 'success',
                            message: '保存成功!'
                        });
                        
                        switch(e['_dev_point_type']) {
                            case ('门架'||'收费站'):
                                console.log('加载门架')
                                self.getAllStations(self.activeLine.id)
                                break;
                            case 'end':
                                console.log('加载路段')
                                self.getAllTolllinks()
                                break;
                            case 'start':
                                console.log('加载路段')
                                self.getAllTolllinks()
                                break;
                            default:
                                break;
                        }
                        
                          
                    } else {
                      this.$message({
                        type: "error",
                        message: response.body.resultMessage
                      });
                    }
                  });
                
                
            }
            
        },
        onTollLink(e){
            let self = this
            // 选中路段
            if(e){
                self.$set(self,'activeTollLink',self.bxDeepClone(e))
                // self.$set(self,'activeLine',self.bxDeepClone(e))
            }
            
            self.onLineList(e)
        },
        getNewPoints(){
            // 新增门架点
            // 查询所有分公司下路段
            let self = this
            // category取值：门架、收费站
            // grantry_type取值：路段门架、虚拟门架、省界门架、收费站
            // company_no：分公司，可通过该字段进行过滤，分公司用户登录时，使用用户的dept_no进行过滤
            let srv = 'srvaud_tollgrantry_station_new_select';
            let srvAuth = 'aud'
            let conds = [{
                colName:'company_no',
                ruleType:'eq',
                value:self.activeDeptNo
            }]
            let relationCondition = {}
            let page = null
            let order = null
            if(!self.activeDeptNo && !self.activeLine){
                console.log('未选择分公司')
                return 
            }else if(self.activeLine && self.activeLine.road_no){
                conds.push({
                    colName:'road_no',
                    ruleType:'eq',
                    value:self.activeLine.road_no
                })
            }
            self.select(
                srv,
                conds,
                page,
                order,
                null,
                null,
                srvAuth,
                null,
                null,
                relationCondition,
                false,
                null,
                // srvAuth
              ).then(res => {
                // console.log('分公司',res.data)
                res = res.data
                if(res.state == "SUCCESS"){
                    self.newPoints = res.data.map((item,index) => {
                        let p = self.bxDeepClone(item)
                        p['icon_size'] = p['icon_size'] || {w:25,h:38}
                        p['icon_anchor'] = p['icon_anchor'] || {w:p['icon_size']/2,h:p['icon_size'].h}
                        p['icon'] = custom
                        p['icon_active'] = custom
                        p['_type'] = 'point'
                        p['_editor'] = 'add'
                        p['_dev_point_type'] = p['category']
                        p['_seq'] = index + 1
                        return p
                    })
                    console.log('新增门架',res.data)
                }else{
                    this.$message.error(JSON.stringify(res));
                    // console.log('查询收费路段 异常',res)
                }
              })
        },
        getAllTolllinks(){
            // 查询所有分公司下路段
            let self = this
            // category取值：门架、收费站
            // grantry_type取值：路段门架、虚拟门架、省界门架、收费站
            // company_no：分公司，可通过该字段进行过滤，分公司用户登录时，使用用户的dept_no进行过滤
            let srv = 'srvaud_tolllink_select';
            let srvAuth = 'aud'
            let conds = [{
                colName:'company_no',
                ruleType:'eq',
                value:self.activeDeptNo
            }]
            let relationCondition = {}
            let page = null
            let order = null
            if(!self.activeDeptNo){
                console.log('未选择分公司')
                return 
            }
            self.select(
                srv,
                conds,
                page,
                order,
                null,
                null,
                srvAuth,
                null,
                null,
                relationCondition,
                false,
                null,
                // srvAuth
              ).then(res => {
                // console.log('分公司',res.data)
                res = res.data
                if(res.state == "SUCCESS"){
                    self.tolllinks = res.data.map(item => item)
                    console.log('分公司',res.data)
                }else{
                    this.$message.error(JSON.stringify(res));
                    // console.log('查询收费路段 异常',res)
                }
              })
        },
        getAllStations(road_no){
            // 查询所有门架
            let self = this
            // category取值：门架、收费站
            // grantry_type取值：路段门架、虚拟门架、省界门架、收费站
            // company_no：分公司，可通过该字段进行过滤，分公司用户登录时，使用用户的dept_no进行过滤
            let srv = 'srvaud_tollgrantry_station_select';
            let srvAuth = 'aud'
            let conds = [
                {
                colName:'company_no',
                ruleType:'eq',
                value:this.activeDeptNo
                }
            ]
            if(road_no){
                conds.push({
                    colName:'road_no',
                    ruleType:'[like]',
                    value:road_no
                })
            }
            let relationCondition = {}
            let page = null
            let order = null
            if(!this.activeDeptNo){
                console.log('未选择分公司')
                return 
            }
            self.select(
                srv,
                conds,
                page,
                order,
                null,
                null,
                srvAuth,
                null,
                null,
                relationCondition,
                false,
                null,
                // srvAuth
              ).then(res => {
                // console.log('分公司',res.data)
                res = res.data
                if(res.state == "SUCCESS"){
                    self.loadStations = []
                    self.loadStations = res.data.filter((item,index) => {
                        if(item['grantry_type'] !== '虚拟门架'){
                            switch (item['category']) {
                                case '门架':
                                    
                            item['icon'] = gantry
                            item['icon_active'] = gantryActive
                                    break;
                                case '收费站':
                                        
                                item['icon'] = toll
                                item['icon_active'] = tollActive
                                    break;
                            
                                default:
                                    break;
                            }
                            item['_seq'] = index + 1
                            if(self.initCheckPoint && item.id == self.initCheckPoint.id){
                                // 初始化id 标点选中
                                self.onPointList(item)
                            }
                            return item
                        }
                        
                    })
                    // console.log('分公司',res.data)
                }else{
                    this.$message.error(JSON.stringify(res));
                    console.log('查询门架|收费站等 异常',res)
                }
              })
        },
        getPointInfo(id){
            // initCheckPointId
            console.log('初始化选中门架')
            // 查询所有门架
            let self = this
            // category取值：门架、收费站
            // grantry_type取值：路段门架、虚拟门架、省界门架、收费站
            // company_no：分公司，可通过该字段进行过滤，分公司用户登录时，使用用户的dept_no进行过滤
            let srv = 'srvaud_tollgrantry_station_select';
            let srvAuth = 'aud'
            let conds = [
                {
                colName:'id',
                ruleType:'eq',
                value:this.initCheckPointId
                }
            ]
            let relationCondition = {}
            let page = null
            let order = null
            if(!this.initCheckPointId){
                
                return 
            }else{
                self.select(
                    srv,
                    conds,
                    page,
                    order,
                    null,
                    null,
                    srvAuth,
                    null,
                    null,
                    relationCondition,
                    false,
                    null,
                    // srvAuth
                  ).then(res => {
                    // console.log('分公司',res.data)
                    res = res.data
                    if(res.state == "SUCCESS"){
                        if(Array.isArray(res.data) && res.data.length == 1){
                            self.$set(self,'initCheckPoint',res.data[0])
                            if(self.initCheckPoint['company_no']){
                                console.log('初始化标点查询结果异常',res)
                                self.$set(self,'activeDeptNo',self.initCheckPoint['company_no'])
                                // self.activeDeptNo = self.initCheckPoint['company no']
                            }
                           
                        }else{
                            console.log('初始化标点查询结果异常',res)
                        }
                        
                        // console.log('分公司',res.data)
                    }else{
                        this.$message.error(JSON.stringify(res));
                        console.log('查询门架|收费站等 异常',res)
                    }
                })
            }
           
        }
    },
    watch:{
        "activeDeptNo":{
            deep:true,
            handler:function(nval,oval){
                console.log('切换分公司',nval)
                this.$nextTick(() => {
                    this.$set(this,'activeLine',null)
                    this.$set(this,'activeTollLink',null)
                    this.$set(this,'activePoint',null)
                    
                    this.$set(this,'tolllinks',[])
                    this.$set(this,'loadStations',[])
                    this.getAllTolllinks()
                    this.getNewPoints()
                })
            }
        },
        "tolllinks":{
            deep:true,
            handler:function(nval,oval){
                console.log('路段更新了',nval)
                this.$nextTick(() => {
                    // this.getAllTolllinks()
                    this.getNewPoints()
                    if(Array.isArray(nval)){
                        for(let line of nval){
                            if(this.initCheckPointId && this.activeDeptNo && this.initCheckPoint && line.id == this.initCheckPoint['road_no']){
                                this.$nextTick(() => {

                                    this.onTollLink(line)
                                })
                               
                            }
                        }
                    }
                    
                })
            }
        },
        "activeTollLink":{
            deep:true,
            handler:function(nval,oval){
                console.log('切换选中',nval)
                if(nval){
                    this.$nextTick(() => {

                        this.getAllStations(nval.id)
                    })
                }
                
            }
        },
        "depts":{
            deep:true,
            handler:function(nval,oval){
                console.log('分公司查询',nval)
                if(Array.isArray(nval) && nval.length > 0){
                    let activeDept = nval[0]
                    this.$nextTick(() => {
                        if(!this.initCheckPointId){
                            this.$set(this,'activeDeptNo',activeDept.dept_no)
                        }else{
                            this.getPointInfo()
                        }
                       
                    })
                }
                
            }
        },
        "isEditorNews":{
            deep:true,
            handler:function(nval,oval){
                console.log('新增门架编辑',nval)
                if(nval == true && Array.isArray(this.newPoints) && this.newPoints.length > 0){
                    this.$nextTick(() => {

                       this.addNewPointMarkers(this.newPoints)
                    })
                }else if(nval === false){
                    // this.$nextTick(() => {

                    //     this.getAllTolllinks()
                        
                    //  })
                     this.$nextTick(() => {
                        // this.polylines = []
                        this.getDriving()
                    })
                }
                
            }
        },
        "newPoints":{
            deep:true,
            handler:function(nval,oval){
                console.log('新增门架列表更新',nval)
                if(Array.isArray(nval) && this.isEditorNews){
                    this.$nextTick(() => {
                       this.addNewPointMarkers(nval)
                    })
                }
                
            }
        },
        "activeLine":{
            deep:true,
            handler:function(nval,oval){
                
                
            }
        },
        
        
        
    }
  
  };
  