
  import { $axios } from "../../common/http.js";
export default {
    data(){
        return {
            editType:'add', // add  update select
            loading:false,
            loadtext:'加载中',
            pageInitStatus:false,
            comList:[],
            loadComList:[],
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
                let obj = this.bxDeepClone(item)
                obj['_id'] = this.guid()
                let layout = parts_json.filter(p => p.seq == item.layout_seq)
                if(layout.length == 1){
                    layout = layout[0]
                    obj['gridData'] = {
                        w:layout.row_span,
                        h:layout.col_span,
                        x:layout.pos_x,
                        y:layout.pos_y,
                        z:layout.seq,
                    }
                    obj['_layout'] = this.bxDeepClone(layout)
                }else{
                    obj['gridData'] = {
                        w:200,
                        h:100,
                        x:100,
                        y:100,
                        z:2
                    }
                }
                return obj
                
            })
            this.loading = false
            this.$set(this,'loadComList',loadComList)
        },
          submitForm(formName='pageForm') {
            switch (this.editType) {
              case 'update':
                
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

        
  
    }
  
  };
  