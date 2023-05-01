<template>
  <div >
    <!-- 批量处理 -->
    <div>
      查询
    </div>
    <div>
      <el-row :gutter="10" v-loading="layoutLoading">
        <el-col :span="4">
          <div class="tree-container flex-1 radius "> 
            <div
              class="text-700 text-center p-10 cursor-pointer radius-bottom"
              @click="clearCondition" :class="this.checkAll ? 'text-blue':''"
            >
              全部分类
            </div>
            <el-tree
              class="filter-tree"
              :data="typeDatas"
              :props="defaultProps"
              :render-after-expand="true"
              :default-expand-all="false"
              :filter-node-method="filterNode"
              :expand-on-click-node="1 == 2"
              highlight-current
              node-key="id"
              :empty-text="'暂无数据'"
              v-loading="treeLoading"
              @node-click="handleNodeClick"
              ref="tree"
              style="overflow-y: scroll;height:330px"
            >
              <span class="custom-tree-node" slot-scope="{ node, data }">
                <span>{{ node.label }}</span>
              </span>
            </el-tree>
          </div>
          
        
        </el-col>
        <el-col :span="20" class="table-list-row">
          <template>
            <el-table
            ref="multipleTable"
              size="mini"
              v-loading="listLoading"
              @selection-change="handleSelectionChange"
              :data="optionalDatas"
              border
              current-row-key="id"
              row-key="id"
              height="360"
              style="width: 100%">
              <el-table-column
                type="selection"
                width="55">
              </el-table-column>
              <el-table-column
                :prop="head.columns"
                :label="head.label"
                v-for="(head,hi) in listHeader">
              </el-table-column>
              
              <!-- width="180" -->
              <el-table-column
              fixed="right"
                :prop="countColNameStr"
                sortable
                width="150"
                label="数量">
                <template slot-scope="scope">
                  <el-input-number size="mini" v-model="scope.row[countColNameStr]" 
                  @change="rowColumnsHandleChange($event,scope.row)" 
                  :min="0" 
                  :max="9999" 
                  :step="1" 
                  :step-strictly="true" 
                  label="数量"></el-input-number>
                </template>
                
              </el-table-column>
            </el-table>
          </template>
          <el-row type="flex" class="row-bg" justify="center">
            <el-pagination
            background
            @current-change="pageCurrentChange"
            :current-page.sync="page.pageNo"
            layout="prev, pager, next"
            :total="page.total">
          </el-pagination>
          </el-row>
        </el-col>
    </el-row>
    </div>
    <div class="radius footer">
      <el-row :gutter="10">
        <el-col :span="6">
          <div>
            <el-popover
               popper-class="batch-selected-layout"
              placement="top-start"
              style="background: aliceblue;"
              width="68%"
              :title="''"
              trigger="click">
              <el-row :gutter="10" v-loading="layoutLoading" justify="space-between">
                  <el-col :span="4" style="text-align: left;line-height: 40px;">
                    已选择:{{ checkedCount }}
                </el-col>
                <el-col :span="20" class="padding" style="text-align: right;">
                  
                    <el-button @click="clearSelectionChange('selection','multipleTable')">批量删除</el-button>
                    <el-button  @click="clearSelectionChange('all','multipleTable')">清空</el-button>
                </el-col>
                <el-col :span="24">
                  <el-table
                ref="selectedTable"
                  size="mini"
                  v-loading="listLoading"
                  @selection-change="selectionChange"
                  :data="selectedDatasRun"
                  border
                  height="300"
                  style="width: 100%">
                  <el-table-column
                    type="selection"
                    width="55">
                  </el-table-column>
                  <el-table-column
                    :prop="head.columns"
                    :label="head.label"
                    v-for="(head,hi) in listHeader">
                  </el-table-column>
                  
                  <!-- width="180" -->
                  <el-table-column
                    fixed="right"
                      :prop="countColNameStr"
                      sortable
                      width="150"
                      label="数量">
                      <template slot-scope="scope">
                        <el-input-number size="mini" v-model="scope.row[countColNameStr]" 
                        @change="selectionRowColumnsHandleChange($event,scope.row)" 
                        :min="0" 
                        :max="9999" 
                        :step="1" 
                        :step-strictly="true" 
                        label="数量"></el-input-number>
                      </template>
                      
                    </el-table-column>
                </el-table>
                </el-col>
              </el-row>
              
              <el-badge :value="checkedCount" :max="999" class="item" slot="reference">
                <el-button icon="el-icon-s-order" class="text-blue"><span >已选</span></el-button>
              </el-badge>
            </el-popover>
            
          </div>
        </el-col>
        <el-col :span="18">
          <el-row type="flex" class="row-bg" justify="end">
            <el-button >取消</el-button>
            <el-button  >清空</el-button>

            <el-button  type="primary">确认</el-button>
          </el-row>
        </el-col>
    </el-row>
    </div>

  </div>
</template>


<script>
import ChildList from "@/components/common/child-list";
export default {
  name:"batch-edit-grid",
  components: {
    ChildList
  },

  props: {
    buttonInfo: {
      type: Object,
      default(){
        return null
      }
    },
    initSelectedDatas:{
      type: [Array,Object],
      default(){
        return null
      }
    }
  },

  data() {
    return {
      /** 基本数据*/
      layoutLoading:false,  //数据加载中
      optionalV2:null,
      typeDatas:null, // 分类列表
      optionalDatas:[], // 可选列表
      selectedDatas:[], // 已选列表
      selectedCondition:[],
      pageConfig:null,  // page_no 获取到的 配置
      treeLoading:false,  //分类 加载状态
      currentData:null,   // 选中树形节点
      checkAll:true,   // 是否选中全部分类
      // listCondition:[],
      page:{rownumber:10,pageNo:1},  // 右侧列表分页
      multipleSelection:[],   // 多选数据
      listLoading:false,    // 列表加载
    };
  },
  created: function () {
    this.getListConfig();
  },
  computed:{
    selectedDatasRun(){
       let mList = this.bxDeepClone(this.selectedDatas)
       return mList
    },
    checkedCount(){
       let list = this.bxDeepClone(this.selectedDatas)
       let count = 0
       if(list.length > 0){
          count = list.reduce((conut, obj) => (conut += obj[this.countColNameStr]), 0)
       }
      
       return count
    },
    checkedIds(){
      let selectedDatas = this.bxDeepClone(this.selectedDatas)
       let ids = selectedDatas.map(item => item.id)
       return ids
    },
    optionalDatasRun(){
       let optionalDatas = this.bxDeepClone(this.optionalDatas)
      //  let multipleSelection = this.bxDeepClone(this.multipleSelection)
      //  let list = []
      //  for(let mItem of multipleSelection){
      //     for(let oItem of optionalDatas){
      //        if(mItem.id == oItem.id && oItem[this.countColNameStr] == 0){
      //          oItem[this.countColNameStr] = 1
      //        }
      //     }
      //  }
      //  list = optionalDatas.map(item => item)
       return list
    },
    countColNameStr(){
      let v2ColName = this.configBuild.batch_select_add_count_col || ''
       let str = `_${v2ColName}`
       return str
    },
    optionalListCondition(){
         let checkAll = this.checkAll
         let condition = []
         let currentData = this.currentData ? this.bxDeepClone(this.currentData) : null
         if(!checkAll && currentData){
          condition = [{
            colName:this.configBuild.listFilterCol,
            ruleType:'like]',
            value:currentData[this.configBuild.listFilterForTreeCol]
          }]
         }

         return condition

    },
    listHeader(){
       let header = this.optionalV2 ? this.optionalV2.srv_cols : []
       header = this.bxDeepClone(header.filter(item => item.in_list == 1))

       return header
    },
    defaultProps(){
       let defaultProps={
        children: "children",
        label:'this.',
      }
      if(this.configBuild){
        defaultProps.label = 'type_name'
      }
      return defaultProps
    },
    configBuild(){
      /**
       * 通过按钮配置和 查询获取的 list配置 获取相关必须的配置字段信息
       */
      let config = this.bxDeepClone(this.buttonInfo)
      let treeConfig = this.pageItem
      try { 
          config = this.buttonInfo.btn_cfg_json
          config = JSON.parse(config)
      }
      catch(err) {
          console.error('没有可用的配置 或 配置错误',err)
          return null
      }
      if(treeConfig){
        config['listForTreeKeyCol'] = treeConfig.tree_filter_list_fk_col
        config['listFilterForTreeCol'] = treeConfig.tree_filter_srv_path_col
        config['listFilterCol'] = treeConfig.tree_filter_path_col
      }
      return config
    },
    pageItem(){
      /**通过按钮 配置的 page no 获取页面配置,遍历获取 列表组件配置 */
       let pageItem = null
       let page = this.bxDeepClone(this.pageConfig)
       let pageItemJsons = null
       if(page && page.hasOwnProperty('component_json')){
        try { 
          pageItemJsons = JSON.parse(page.component_json)
          if(pageItemJsons.length > 0){
              for(let item of pageItemJsons){
                if(item.com_type == 'list' && item.hasOwnProperty('list_json')){
                  // let req = item.srv_req
                  pageItem = item.list_json
                }
              }
          }
          // return config
        }
        catch(err) {
            console.error('没有可用的配置 或 配置错误',err)
            // return null
        }
        
       }
       return pageItem
    },
    treeForListColKey(){
 
       let treeConfig = this.pageItem
       let res = {}
      res['listForTreeKeyCol'] = treeConfig.tree_filter_list_fk_col
      res['listForTreeKeyCol'] = treeConfig.tree_filter_list_fk_col
       return res
    },
    buildTreeReq(){
      /**
       * 树分类的服务和相关配置通过 page_no获取到的列表组件内配置获取
       */

       let treeConfig = this.bxDeepClone(this.pageItem)
       let req = {}
       if(treeConfig){
          req['serviceName'] = treeConfig.tree_filter_srv
          req['srvApp'] = treeConfig.tree_filter_mapp
          req['condition'] = []
          req['treeData'] = true
       }
       return req
    },
    batchAddOptionsV2(){
      /**
       * 通过外键字段的 options_list_v2 获取
       */
      let options = this.bxDeepClone(this.initSelectedDatas.addKeyCol)
       let res = {

       }
       if(options && options.hasOwnProperty('option_list_v2')){
        res['batchAddColName'] = options.columns
        res['batchAddOptionsV2'] = options.option_list_v2
       }
       return res
    },
    buildOptionalReq(){
      /**
       * 通过目标子表的外键col 获取 列表查询配置 在 options 配置里
       */
       let options = this.bxDeepClone(this.batchAddOptionsV2)
       let res = {

       }
       let condition = this.bxDeepClone(this.optionalListCondition)
       if(options && options.hasOwnProperty('batchAddOptionsV2')){
         res['serviceName'] = options.batchAddOptionsV2.serviceName
         res['srvApp'] = options.batchAddOptionsV2.srv_app
         res['condition'] = condition
        //  res['page'] = this.page
       }
       return res
    }
  },
  mounted(){
    if(this.buildTreeReq.hasOwnProperty('serviceName') && !this.typeDatas){
      this.getTreeData()
    }

    if(this.buildOptionalReq.hasOwnProperty('serviceName') && !this.optionalV2){
      this.getListV2Data()
    }
     
  },
  methods: {
    pageCurrentChange(page){
       console.log(page)
       this.$set(this.page,'pageNo',page)
       this.$nextTick(()=>{
          this.getData()
       })
       
    },
    toggleSelection(rows) {
      // 设置备选表格选中
        let optionalIds = this.optionalDatas.map(item => item.id)
        let rowsIds = rows.map(item => item.id) // 当前用户选中的ids
        let ids = this.selectedDatas.filter(item => item.id && optionalIds.indexOf(item.id) !== -1); //当前已选列表中已选的id
        ids = ids.map(item => item.id)
        let clearIds = this.selectedDatas.filter(item => item.id && optionalIds.indexOf(item.id) !== -1 && rowsIds.indexOf(item.id) == -1)
        clearIds = clearIds.map(item => item.id)
        console.log(rowsIds,optionalIds,ids,clearIds)
        let list = this.bxDeepClone(rows)
        this.selectedDatas = this.selectedDatas.filter(item => clearIds.indexOf(item.id) == -1)
        this.$nextTick(()=>{
          if(rows.length > 0){
            for(let row of list){
              if(optionalIds.indexOf(row.id) !== -1){
                if(ids.indexOf(row.id) == -1 && row[this.countColNameStr] !== 0){
                  // 数量不为0,已选择没有的 进行 加选
                  this.selectedDatas.push(row)
                }else{
                  if(row[this.countColNameStr] == 0){
                    // 数量是0的减选
                    this.selectedDatas = this.selectedDatas.filter(item => item.id !== row.id)
                  }else{
                    this.$nextTick(()=>{
                      // 数量改变的更新到已选
                      for(let item of this.selectedDatas){
                        if(item.id == row.id){
                          let val = row[this.countColNameStr]
                          // item[this.countColNameStr] = val
                          this.$set(item,this.countColNameStr,val)
                        }
                      }
                    })
                  }
                  
                }
              }
              
            }
          }else{
            // 取消选择任何数据
            this.selectedDatas = this.selectedDatas.filter(item=> optionalIds.indexOf(item.id) == -1)
          }
        })
        
       
        
        // if (rows) {
        //   rows.forEach(row => {
        //     for(let item of this.optionalDatas){
        //       if(item.id == row.id ){
        //         if(item[this.countColNameStr] == 0){
        //           item[this.countColNameStr] = 1
        //         }
        //         this.$refs.multipleTable.toggleRowSelection(row);
        //       }
        //     }
            
        //   });
        // } else {
        //   this.$refs.multipleTable.clearSelection();
        // }
      },
    rowColumnsHandleChange(val,row){
      this.$nextTick(()=>{
        if(row && row[this.countColNameStr] > 0){
          this.$refs.multipleTable.toggleRowSelection(row,true);
        }else if(row){
          this.$refs.multipleTable.toggleRowSelection(row,false);
        }
      })
      
      
      // this.$set(row,this.countColNameStr,val)
      console.log(val,row)
    },
    selectionRowColumnsHandleChange(val,row){
      this.$nextTick(()=>{
        
        if(row){
          for(let item of this.optionalDatas){
            if(item.id == row.id){
              item[this.countColNameStr] = val
            }
          }
          // this.$refs.multipleTable.toggleRowSelection(row,true);
        }
      })
      
      
      // this.$set(row,this.countColNameStr,val)
      console.log(val,row)
    },
    selectionChange(val){
       console.log(val)
    },
    clearSelectionChange(type,ref){
       if(type == 'all'){
          this.$refs[ref].clearSelection()
          this.selectedDatas = [].map(item => item)
       }else{
         let list = this.$refs.selectedTable.selection
         console.log(list)
         if(list && list.length > 0){
          let ids = list.map(item => item.id)
          this.selectedDatas = this.selectedDatas.filter(item => ids.indexOf(item.id) == -1)
          for(let row of this.optionalDatas){
            if(ids.indexOf(row.id) !== -1){
              this.$refs.multipleTable.toggleRowSelection(row,false);
            }
            
          }
         }
         
       }
       
    },
    handleSelectionChange(val) {
      this.layoutLoading = true
      let list = this.bxDeepClone(val)
      let ids = list.map(item => item.id)
      for(let index  in this.optionalDatas){
          let item = this.optionalDatas[index]
        if(ids.indexOf(item.id) !== -1){
          if(item[this.countColNameStr] == 0){
              this.$set(item,this.countColNameStr,1)
          }
        }else{
          this.$set(item,this.countColNameStr,0)
        }
      }
      // 列表中获取初始化 数量的数据到已选择
      list = this.optionalDatas.filter(item => ids.indexOf(item.id) !== -1)
       this.multipleSelection = list.map(item => item);
       this.$nextTick(()=>{
        // 页面更新后
        this.layoutLoading = false
       })
    },
    getListConfig(){
      let serviceName = 'srvpage_cfg_page_select';
      let pageNo = ''
      if(this.configBuild && this.configBuild.hasOwnProperty('page_no')){
        pageNo = this.configBuild.page_no
      }
      let condition = [{
        colName: "page_no",
        ruleType: "eq",
        value:pageNo
      }];
      this.select(serviceName, condition, null, null, null, null, 'config').then(response => {
            let list = response.body.data;
            console.log(list)
            if(list && list.length > 0 ){
              this.pageConfig = list[0]
            }
            
        })
    },
    getTreeData(){
        //加载树结构数据
        let req = this.buildTreeReq
      this.treeSelect(req.serviceName, req.condition,req.srvApp).then((response) => {
        
        if(response.body.data){
          this.typeDatas = response.body.data;
        }
        if (this.typeDatas.length > 0) {
          // this.currentData = this.treeData[0];
          this.treeLoading = false
          this.showTreeDetail = "1";
        }
      });
    },
    getData(){
      this.listLoading = true
      let listDatas = []
      let req = this.buildOptionalReq
        this.select(
          req.serviceName,req.condition, this.page, null, null, null, req.srvApp
        ).then(response => {
            let data = response.body.data
            if(data){
              listDatas = data
              listDatas = listDatas.map(item => {
                item[`_${this.configBuild.batch_select_add_count_col}`] = 0
                return item
              })
              if(listDatas && listDatas.length > 0){
                this.optionalDatas = this.bxDeepClone(listDatas).map(item => item)

                for(let row of this.optionalDatas){
                  if(this.checkedIds.indexOf(row.id) !== -1){
                     let item = this.selectedDatas.filter(item => item.id == row.id)
                     let val = item[0][this.countColNameStr]
                     this.$nextTick(()=>{
                        this.$set(row,this.countColNameStr,val)
                        
                        this.$refs.multipleTable.toggleRowSelection(row,true);
                     })
                    
                  }
                }
              }
            }
            console.log('response.body.page',response.body.page)
            let page = response.body.page
            if(page){
              this.page = page
              // this.$set(this,'page',response.body.page)
            }
            

            this.listLoading = false
        })

        
    },
    getListV2Data() {
      let req = this.buildOptionalReq
      this.loadColsV2(req.serviceName, "selectlist", req.srvApp).then(response => {
        const resData = response.body.data
        const srv_cols = resData.srv_cols
        this.$set(this,'optionalV2',resData)
        console.log('getListV2Data',resData)
        this.getData()
      });
    },
    handleEdit(index, row) {
      let key = this.moreConfig.check_set_1_col

      if (row[key] === 0) {
        this.$refs.selectFillTable.toggleRowSelection(row, false)
      } else {
        this.$refs.selectFillTable.toggleRowSelection(row, true)
      }
    },
    closeDialog() {
      this.$store.commit("setFrontTableData", {
        service: this.service_name,
        data: this.$refs.selectFillTable.selection,
        params: {
          from: this.serviceObj.refed_col,
          to: this.moreConfig['batch_add_select_fill_grid_srv_option_list_col'],
          cols: this.addCols
        }
      })

      this.$emit('closeDialog')
    },
    filterNode(value, data) {
      if (!value) return true;
      return data[this.defaultProps.label].indexOf(value) !== -1;
    },
    handleNodeClick(data) {
      console.log("handleNodeClick",data)
      this.checkAll = false
      
      if (this.currentData != data) {
        
        this.treeLoading = true
        this.currentData = data;
         this.page.pageNo = 1
        // this.listCondition = this.buildListCondition();
          this.refreshTable();
      }
    },
    buildListCondition(){
       return []
    },
    refreshTable(){
      
      this.treeLoading = false
      console.log('refresh Table')
      this.getData()
    },
    clearCondition() {
      this.currentData = null
      // this.listCondition = [];
      this.checkAll = true
      this.treeLoading = true
      // this.loadTableData(1)
      this.page.pageNo = 1
      this.refreshTable();
    }
  },
  watch:{
    "buildTreeReq":{
      deep:true,
      handler:function(newVal,oldVal){
        if(newVal){
           this.getTreeData()
        }
        //  this.$refs.list.loadTableData()
      }
    },
    "configBuild":{
      deep:true,
      handler:function(newVal,oldVal){
        if(newVal){
           this.treeLoading = true
           this.getTreeData()
        }
        //  this.$refs.list.loadTableData()
      }
    },
    "buildOptionalReq":{
      deep:true,
      handler:function(newVal,oldVal){
        if(newVal){
           this.getListV2Data()
        }
        //  this.$refs.list.loadTableData()
      }
    },
    "optionalDatasRun":{
      deep:true,
      handler:function(newVal,oldVal){
        if(newVal){
          console.log('修改数据后')
          //  this.changeCountToOptionalDatas(newVal)
          //  this.toggleSelection(list)
        }
        //  this.$refs.list.loadTableData()
      }
    },
    "optionalDatas":{
      deep:true,
      handler:function(newVal,oldVal){
        if(newVal){
          console.log('数据更新了 optionalDatas')
          let list = newVal.filter(item => item[this.countColNameStr] > 0)
          //  this.toggleSelection(list)
        }
        //  this.$refs.list.loadTableData()
      }
    },
    "multipleSelection":{
      deep:true,
      handler:function(newVal,oldVal){
        if(newVal){
          console.log('数据更新了 multipleSelection')
          // let list = newVal.filter(item => item[this.countColNameStr] > 0)
           this.toggleSelection(newVal)
        }
        //  this.$refs.list.loadTableData()
      }
    }
  }
};
</script>
<style scoped>
.radius{
  border: 1px solid #EBEEF5;
}
.radius-bottom{
  border-bottom: 1px solid #EBEEF5;
}

.footer{
  padding:20px 5px;
}
.text-blue{
  color: rgb(15, 106, 243);
}
.batch-selected-layout{
  background: aliceblue;
}
</style>
