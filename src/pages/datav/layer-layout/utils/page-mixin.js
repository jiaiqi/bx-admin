
  import { $axios } from "../../common/http.js";
export default {
    data(){
        return {
            editType:'add', // add  update select
            loading:false,
            loadtext:'加载中',
            pageInitStatus:false,
            comList:[],
            oldComList:[], // 原始组件元数据
            loadComList:[],
            oldPageMode:null, // 原始数据修改时候进行对比
            loadPageMode:null,
            pageModel:{
                "page_name":'可视化配置',
                "page_title": "可视化配置页",
            },
            pageLayoutModel:{
                "x":0,
                "y": 0,
                "w": "1920",
                "h": "1080",
            },
            pageLayoutNo:'',
            pageNo:'', //PG2311150002
            pageFieldsRules:{
                "page_name": [
                  { required: true, message: '请输入页面名称', trigger: 'blur' },
                  { min: 1, max: 50, message: '长度在 3 到 5 个字符', trigger: 'blur' }
                ],
                "page_title": [
                    { required: true, message: '请输入页面标题', trigger: 'blur' },
                    { min: 1, max: 50, message: '长度在 3 到 5 个字符', trigger: 'blur' }
                ]
              }
        }
    },
    computed:{
        viewComList(){
            let newList = this.bxDeepClone(this.list2)
            let loadComList = this.bxDeepClone(this.loadComList) || []
            
            let mergeList = []
            
           mergeList = newList.concat(loadComList)
           return mergeList
        },
    },
    methods: {
        // 方法
        async initPage() {
            const url = `/config/select/srvpage_cfg_page_guest_select`;
            const req = {
              serviceName: "srvpage_cfg_page_guest_select",
              colNames: ["*"],
              condition: [
                {
                  colName: "page_no",
                  ruleType: "eq",
                  value: this.pgNo,
                },
              ],
            };
            const res = await $axios.post(url, req);
            if (
              res.data.state === "SUCCESS" &&
              Array.isArray(res.data.data) &&
              res.data.data.length > 0
            ) {
              let data = res.data.data[0];
              Object.keys(data).forEach((key) => {
                if (key && key.indexOf("_json") !== -1) {
                  try {
                    data[`${key}_data`] = JSON.parse(data[key]);
                  } catch (e) {
                    //TODO handle the exception
                  }
                }
              });
              let page_row_json_data = data.page_row_json_data;
      
              this.pageId = data.id;
              this.pageName = page_row_json_data.page_name;
              this.pageTitle = page_row_json_data.page_title;
              this.comJson = page_row_json_data.component_json || [];
              this.styleJson = page_row_json_data.page_style_json;
              this.pageConfg = data;
              if (!this.comJson) return;
              this.comJson.forEach((com, i) => {
                this.comList.forEach((list) => {
                  if (list.com_type === com.com_type) {
                    this.comJson[i].example = list.example;
                  }
                });
              });
              this.parentLayoutNo = data.layout_no;
      
              this.layoutJson = data.layout_json_data;
              console.log(data.layout_json_data);
              this.comJson = this.comJson.sort((a, b) => a.layout_seq - b.layout_seq);
              this.layoutJson.parts_json = this.layoutJson.parts_json.sort(
                (a, b) => a.seq - b.seq
              );
              this.layoutJson.parts_json.forEach((item, index) => {
                // const data = this.comJson.find(e=>);
                const data = this.comJson[index];
                let obj = {
                  x: item.pos_x,
                  y: item.pos_y,
                  w: item.row_span,
                  h: item.col_span,
                  i: item.id || new Date().getTime(), // item.seq - 1
                  // i: index, // item.seq - 1
                  layout_no: item.layout_no,
                  data,
                  isLeftBarItem: false,
                  id: item.id,
                };
      
                this.layout.push(obj);
              });
              this.strLayout = JSON.stringify(this.layout);
            } else {
              this.$message.info("无数据！");
            }
          },
          reviewPage(){
            // 根据页面编号加载页面元数据
            // const url = `/config/select/srvpage_cfg_page_guest_select`;
            // this.loading = true
            const condition = [
                {
                  colName: "page_no",
                  ruleType: "eq",
                  value: this.pageNo,
                },
              ]
            this.select(
                "srvpage_cfg_page_guest_select",
                condition,
                null,
                null,
                null,
                null,
                'config'
              ).then(res => {
                    let page = res.data
                    console.log(page)
                    if (page.state === "SUCCESS" && Array.isArray(page.data) && page.data.length == 1) {
                        let oldPageData = this.bxDeepClone(page.data[0]) 
                        // oldPageData = JSON.parse(oldPageData)
                        switch (this.editType) {
                          case 'update':
                            // 页面为修改模式保存原始数据 用于修改结果比对
                            this.$set(this,'oldPageMode',this.bxDeepClone(oldPageData) )
                            break;
                        
                          default:
                            break;
                        }
                        this.$set(this,'loadPageMode',oldPageData)
                       
                        this.$set(this.pageModel,'page_name',oldPageData['page_name'])
                        this.$set(this.pageModel,'page_title',oldPageData['page_title'])
                        this.buildLoadComList()
                        
                    }
              })
          },
          buildLoadComList(){
            let loadComList = this.loadPageMode && this.loadPageMode.component_json ? JSON.parse(this.loadPageMode.component_json) : []
            let loadLayoutList = this.loadPageMode && this.loadPageMode.layout_json ? JSON.parse(this.loadPageMode.layout_json) : {}
            let parts_json = loadLayoutList.parts_json || []
            loadComList = loadComList.map(item => {
              // 页面组件数据构建
                let obj = this.bxDeepClone(item)
                obj['_id'] = this.guid()
                let layout = parts_json.filter(p => p.seq == item.layout_seq)
                if(layout.length == 1){
                    layout = layout[0]
                    // 如果有布局数据 根据布局数据构建 网格信息
                    obj['gridData'] = {
                        w:layout.row_span,
                        h:layout.col_span,
                        x:layout.pos_x,
                        y:layout.pos_y,
                        z:layout.seq,
                        _dataSource:'db'
                        // 请求获取的组件数据 初始化增加标记 db未持久化存储数据。
                    }
                    obj['_layout'] = this.bxDeepClone(layout)
                }else{
                  
                    // 如果没有布局数据 根据布局数据构建 网格信息
                    obj['gridData'] = {
                        w:200,
                        h:100,
                        x:100,
                        y:100,
                        z:2,
                        _dataSource:'db'
                    }
                }
                return obj
                
            })
            this.loading = false
            switch (this.editType) {
              case 'update':
                // 页面为修改模式保存原始数据 用于修改结果比对
                this.$set(this,'oldComList',this.bxDeepClone(loadComList))
                break;
            
              default:
                break;
            }
            this.$set(this,'loadComList',this.bxDeepClone(loadComList))
           
        },
          submitForm(formName='pageForm') {
            switch (this.editType) {
              case 'update':
                console.log('修改数据')
                
                this.$refs[formName].validate((valid) => {
                  if (valid) {
                    this.$confirm('确认保存?', '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning'
                      }).then(() => {
                        this.loading = true
                        this.pageUpdate().then(plRes=>{
                            console.log('001',plRes)
                            this.loading = false
                            this.layoutComUpdate().then(colUpdateRes => {
                               console.log(colUpdateRes)
                            })
                            // if(plRes){
                            //     this.pageLayoutNo = plRes
                            //     this.layoutComAdd(this.pageLayoutNo).then(clRes => {
                            //         if(clRes){
                                        
                            //         }
    
                            //     })
                            //     this.pageAdd(this.pageLayoutNo).then(paddRes => {
                            //         if(paddRes){
                            //             this.pageNo = paddRes
                            //             this.pageComAdd(this.pageNo).then(caddRes => {
                            //                 if(caddRes){
                                                
                            //                     this.loading = false
                            //                 }else{
                            //                     this.$message({
                            //                         type: 'info',
                            //                         message: '保存信息出错'
                            //                       }); 
                            //                 }
                            //             })
                            //         }
                            //     })
                            // }
                            
    
                        })
                        this.loading = false
                        // this.$message({
                        //   type: 'success',
                        //   message: '保存成功!'
                        // });
                      }).catch(() => {
                        this.$message({
                          type: 'info',
                          message: '已取消'
                        });          
                      });
                  } else {
                    console.log('error submit!!');
                    return false;
                  }
                });
                break;
              case 'add':
                  this.$refs[formName].validate((valid) => {
                    if (valid) {
                      this.$confirm('确认保存?', '提示', {
                          confirmButtonText: '确定',
                          cancelButtonText: '取消',
                          type: 'warning'
                        }).then(() => {
                          this.loading = true
                          this.layoutPageAdd().then(plRes=>{
                              console.log('001',plRes)
                              
                              if(plRes){
                                  this.pageLayoutNo = plRes
                                  this.layoutComAdd(this.pageLayoutNo).then(clRes => {
                                      if(clRes){
                                          
                                      }
      
                                  })
                                  this.pageAdd(this.pageLayoutNo).then(paddRes => {
                                      if(paddRes){
                                          this.pageNo = paddRes
                                          this.pageComAdd(this.pageNo).then(caddRes => {
                                              if(caddRes){
                                                  
                                                  this.loading = false
                                              }else{
                                                  this.$message({
                                                      type: 'info',
                                                      message: '保存信息出错'
                                                    }); 
                                              }
                                          })
                                      }
                                  })
                              }
                              
      
                          })
                          this.loading = false
                          // this.$message({
                          //   type: 'success',
                          //   message: '保存成功!'
                          // });
                        }).catch(() => {
                          this.$message({
                            type: 'info',
                            message: '已取消'
                          });          
                        });
                    } else {
                      console.log('error submit!!');
                      return false;
                    }
                  });
                break;
            
              default:
                break;
            }
           
          },
          resetForm(formName='pageForm') {
            this.$refs[formName].resetFields();
          },
          review(){

          },
          layoutPageAdd(){
            return new Promise((resolve, reject) => {
                
                // http://192.168.0.241:8080/config/operate/srvpage_cfg_layout_add
                const url = `/config/operate/srvpage_cfg_layout_add`;
                let req =    [
                        {
                            "serviceName": "srvpage_cfg_layout_add",
                            "srvApp": "config",
                            "condition": [],
                            "data": [
                                {
                                    "layout_party": "页面",
                                    "layout_name": "可视化配置2023-11-15 11:56:01"
                                }
                            ]
                        }
                    ]
                    this.operate(req).then((response) => {
                        if (response.data.state === "SUCCESS") {
                          if (true) {
                            resolve(response.data.response[0].response.effect_data[0].layout_no);
                          } else {
                            resolve(response.data.response[0].response);
                          }
                          // this.$message.info(response.body.resultCode);
                        } else {
                          // this.$message.error(response.body.resultMessage);
                        }
                      });
            })
          },
          layoutComAdd(no){
            return new Promise((resolve, reject) => {
                
                // http://192.168.0.241:8080/config/operate/srvpage_cfg_layout_add
                const url = `/config/operate/srvpage_cfg_layout_add`;
                let data = this.list2
                if(Array.isArray(data) && data.length > 0 && no){
                    data = data.map(item => {
                        let com = {
                            "layout_party": "组件",
                            "parent_no": no,
                            "layout_name": "可视化配置2023-11-15 11:56:01-1",
                            "seq": item.gridData.z,
                            "pos_x": item.gridData.x,
                            "pos_y": item.gridData.y,
                            "col_span": item.gridData.h,
                            "row_span": item.gridData.w
                        }
                        return com
                    })
                    let req =    [
                        {
                            "serviceName": "srvpage_cfg_layout_add",
                            "srvApp": "config",
                            "condition": [],
                            "data": data
                        }
                    ]
                    this.operate(req).then((response) => {
                        if (response.data.state === "SUCCESS") {
                          if (true) {
                            resolve(response.data.response[0].response.effect_data[0]);
                          } else {
                            resolve(response.data.response[0].response);
                          }
                          // this.$message.info(response.body.resultCode);
                        } else {
                          // this.$message.error(response.body.resultMessage);
                          resolve(false);
                        }
                      });
                }else{
                    this.$message({
                        type: 'info',
                        message: '没有组件可以保存'
                      }); 
                      resolve(false);
                }
                
                    
            })
          },
          layoutComUpdate(no){
            return new Promise((resolve, reject) => {
              // 修改组件布局
                const url = `/config/operate/srvpage_cfg_layout_update`;
                let addData = this.list2
                let updateData = []
                let oldUpdateData = this.oldPageMode.layout_json
                if(oldUpdateData){
                  oldUpdateData = JSON.parse(oldUpdateData)
                  for(let u of this.loadComList){
                    if(u.hasOwnProperty('_layout')){
                      // 根据旧布局数据 获取 修改了的数据
                      let oldLayout = u['_layout']
                      if(u.gridData.x !== oldLayout.pos_x || u.gridData.y !== oldLayout.pos_y  || u.gridData.h !== oldLayout.col_span  || u.gridData.w !== oldLayout.row_span){
                        // 按照请求结构构建数据
                         updateData.push({
                          "serviceName": "srvpage_cfg_layout_update",
                          "srvApp": "config",
                          "condition": [{
                            colName:'id',
                            ruleType:'eq',
                            value:oldLayout.id
                          }],
                          "data": [{
                            col_span:u.gridData.h,
                            row_span:u.gridData.w,
                            pos_x:u.gridData.x,
                            pos_y:u.gridData.y
                           }]
                          })
                      }
                    }
                  }
                }
                if(Array.isArray(updateData) && updateData.length > 0 ){
                    // 如果有修改数据 发送请求
                    let req =   updateData
                    this.operate(req).then((response) => {
                      // 显示请求结果msg
                      this.$message({
                        type: 'info',
                        message: response.data.resultMessage
                      }); 
                        if (response.data.state === "SUCCESS") {
                          if (true) {
                            resolve(response.data.response[0].response.effect_data[0]);
                          } else {
                            resolve(response.data.response[0].response);
                          }
                          // this.$message.info(response.body.resultCode);
                        } else {
                          // this.$message.error(response.body.resultMessage);
                          resolve(false);
                        }
                        
                      });
                }else{
                    this.$message({
                        type: 'info',
                        message: '没有组件可以保存'
                      }); 
                      resolve(false);
                }
                
                    
            })
          },
          pageAdd(no){
            return new Promise((resolve, reject) => {
                
                // http://192.168.0.241:8080/config/operate/srvpage_cfg_layout_add
                const url = `/config/operate/srvpage_cfg_page_add`;
                let data = [
                    this.pageModel
                ]
                if(Array.isArray(data) && data.length > 0 && no){
                    data[0]['layout_no'] = no
                    let req =    [
                        {
                            "serviceName": "srvpage_cfg_page_add",
                            "srvApp": "config",
                            "condition": [],
                            "data": data
                        }
                    ]
                    this.operate(req).then((response) => {
                        if (response.data.state === "SUCCESS") {
                          if (true) {
                            resolve(response.data.response[0].response.effect_data[0].page_no);
                          } else {
                            resolve(response.data.response[0].response);
                          }
                          // this.$message.info(response.body.resultCode);
                        } else {
                            resolve(false);
                        }
                      });
                }else{
                    this.$message({
                        type: 'info',
                        message: '没有页面布局信息，保存失败'
                      }); 
                      resolve(false);
                }
                
                    
            })
          },
          pageUpdate(){
            // 修改页面
            return new Promise((resolve, reject) => {
             let oldModel = this.bxDeepClone(this.oldPageMode)
             let model = {}
             for(let key in this.pageModel){
              let onValue = this.pageModel[key]
              if(oldModel.hasOwnProperty(key) && oldModel[key] !== onValue){
                model[key] = onValue
              }
             }
             let data = [
                model
              ]
              if(this.editType == 'update' && Array.isArray(data) && data.length > 0 && this.pageNo && Object.keys(model).length > 0){
                  // 编辑模式校验，修改数据是否存在校验
                  let req =    [
                      {
                          "serviceName": "srvpage_cfg_page_update",
                          "srvApp": "config",
                          "condition": [{
                            colName:'id',
                            ruleType:'eq',
                            value:oldModel.id
                          }],
                          "data": data
                      }
                  ]
                  this.operate(req).then((response) => {
                    // 修改页面信息请求
                    this.$message({
                      type: 'info',
                      message: response.data.resultMessage
                    }); 
                      if (response.data.state === "SUCCESS") {
                        if (true) {
                          resolve(response.data.response[0].response.effect_data[0].page_no);
                        } else {
                          resolve(response.data.response[0].response);
                        }
                      } else {
                          resolve(false);
                      }
                      
                    });
              }else{
                  this.$message({
                      type: 'info',
                      message: '没有页面布局信息，保存失败'
                    }); 
                    resolve(false);
              }
            })
          },
          pageComAdd(no){
            return new Promise((resolve, reject) => {
                
                // http://192.168.0.241:8080/config/operate/srvpage_cfg_layout_add
                const url = `/config/operate/srvpage_cfg_page_component_add`;
                let data = this.list2
                if(Array.isArray(data) && data.length > 0 && no){
                    data = data.map(item => {
                        let com = {
                            "com_name": item['com_type_name'],
                            "com_preview": item['example'],
                            "page_layout_no": this.pageLayoutNo,
                            "com_type": item['com_type'],
                            "page_no": no,
                            "com_seq": item.gridData.z,
                            "layout_seq": item.gridData.z
                        }
                        return com
                    })
                    let req =    [
                        {
                            "serviceName": "srvpage_cfg_page_component_add",
                            "srvApp": "config",
                            "condition": [],
                            "data": data
                        }
                    ]
                    this.operate(req).then((response) => {
                        if (response.data.state === "SUCCESS") {
                          if (true) {
                            resolve(response.data.response[0].response.effect_data[0]);
                          } else {
                            resolve(response.data.response[0].response);
                          }
                          // this.$message.info(response.body.resultCode);
                        } else {
                            resolve(false);
                          // this.$message.error(response.body.resultMessage);
                        }
                      });
                }else{
                    this.$message({
                        type: 'info',
                        message: '保存信息出错'
                      }); 
                      resolve(false);
                }
                
                    
            })
          },
          pageComUpdate(){
            return new Promise((resolve, reject) => {
                const url = `/config/operate/srvpage_cfg_page_component_update`;
                let data = this.list2
                if(Array.isArray(data) && data.length > 0 && no){
                    data = data.map(item => {
                        let com = {
                            "com_name": item['com_type_name'],
                            "com_preview": item['example'],
                            "page_layout_no": this.pageLayoutNo,
                            "com_type": item['com_type'],
                            "page_no": no,
                            "com_seq": item.gridData.z,
                            "layout_seq": item.gridData.z
                        }
                        return com
                    })
                    let req =    [
                        {
                            "serviceName": "srvpage_cfg_page_component_add",
                            "srvApp": "config",
                            "condition": [],
                            "data": data
                        }
                    ]
                    this.operate(req).then((response) => {
                        if (response.data.state === "SUCCESS") {
                          if (true) {
                            resolve(response.data.response[0].response.effect_data[0]);
                          } else {
                            resolve(response.data.response[0].response);
                          }
                          // this.$message.info(response.body.resultCode);
                        } else {
                            resolve(false);
                          // this.$message.error(response.body.resultMessage);
                        }
                      });
                }else{
                    this.$message({
                        type: 'info',
                        message: '保存信息出错'
                      }); 
                      resolve(false);
                }
                
                    
            })
          }

        
  
    }
  
  };
  