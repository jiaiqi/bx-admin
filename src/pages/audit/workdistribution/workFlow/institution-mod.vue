<template>
  <div class="promoter_mod">
    <el-dialog title="查询选择" :visible.sync="insVisible" :destroy-on-close="true" :close-on-click-modal="false">
      <div class="mod_mian">
        <div class="mod_search" v-if="isShowTab">
          <el-row>
            <el-form :label-position="labelPosition">
              <div class="pr_row">
                <el-col :span="8">
                  <el-form-item label="机构名称" prop="dept_name">
                    <el-input v-model="proForm.dept_name"  style="width:55%" placeholder="请输入..." clearable size="mini"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="机构类型" prop="dept_type">
                    <el-select v-model="proForm.dept_type"
                               placeholder="请选择" size="mini"
                               multiple
                               collapse-tags
                               clearable
                    >
                      <el-option
                          v-for="item in optionsPage.dept_type"
                          :key="item.value"
                          :label="item.label"
                          :value="item.value"
                          collapse-tags
                          clearable
                      >
                      </el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="机构类别" prop="dept_class">
                    <el-select v-model="proForm.dept_class"
                               placeholder="请选择" size="mini"
                               multiple
                               collapse-tags
                               clearable
                    >
                      <el-option
                          v-for="item in optionsPage.dept_class"
                          :key="item.value"
                          :label="item.label"
                          :value="item.value">
                      </el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="删除标示" prop="del_flag">
                    <el-select v-model="proForm.del_flag"
                               placeholder="请选择" size="mini"
                               multiple
                               collapse-tags
                               clearable
                    >
                      <el-option
                          v-for="item in optionsPage.del_flag"
                          :key="item.value"
                          :label="item.label"
                          :value="item.value">
                      </el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
              </div>
              <div class="pr_row">
                  <el-row style="width: 50%;">
                    <el-form-item label="创建时间" prop="create_time">
                      <el-date-picker
                          style="width:78%"
                          v-model="proForm.create_time"
                          type="datetimerange"
                          range-separator="至"
                          start-placeholder="开始日期"
                          end-placeholder="结束日期"
                          size="mini"
                          value-format="yyyy-MM-dd HH:mm:ss"
                      >
                      </el-date-picker>
                    </el-form-item>
                  </el-row>
                 <el-row style="width: 50%">
                   <el-col :span="12">
                     <el-form-item label="创建人" prop="create_user">
                       <el-input v-model="proForm.create_user"  style="width:56%;margin-left:0.8125rem" placeholder="请输入..." clearable size="mini"></el-input>
                     </el-form-item>
                   </el-col>
                   <el-col :span="12">
                     <el-form-item label="创建用户" prop="create_user_disp">
                       <el-input v-model="proForm.create_user_disp"  style="width:56%" placeholder="请输入..." clearable size="mini"></el-input>
                     </el-form-item>
                   </el-col>
                 </el-row>
              </div>
              <div class="pr_row">
                <el-row style="width: 50%">
                  <el-col :span="12">
                    <el-form-item label="修改人" prop="modify_user">
                      <el-input v-model="proForm.modify_user"  style="width:56%;margin-left:0.8125rem" placeholder="请输入..." clearable size="mini"></el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="修改用户" prop="modify_user_disp">
                      <el-input v-model="proForm.modify_user_disp"  style="width:56%" placeholder="请输入..." clearable size="mini"></el-input>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row style="width: 50%;">
                  <el-form-item label="修改时间" prop="modify_time">
                    <el-date-picker
                        style="width:78%"
                        v-model="proForm.modify_time"
                        type="datetimerange"
                        range-separator="至"
                        start-placeholder="开始日期"
                        end-placeholder="结束日期"
                        size="mini"
                        value-format="yyyy-MM-dd HH:mm:ss"
                    >
                    </el-date-picker>
                  </el-form-item>
                </el-row>
              </div>
            </el-form>
          </el-row>
          <el-row style="text-align: center">
            <el-button type="primary" round icon="el-icon-search" size="mini" plain  @click="searchTab('se')">搜索</el-button>
            <el-button type="primary" round icon="el-icon-refresh-right" size="mini" plain @click="searchTab('cl')">重置</el-button>
          </el-row>
        </div>
        <div class="mo_tab">
          <el-row style="text-align: right">
            <el-button type="primary" size="small" @click="searchTab('se')">刷新</el-button>
            <el-button type="success" size="small" @click="isShowTab=!isShowTab">查询</el-button>
          </el-row>
          <div class="table_box">
            <el-table
                stripe
                border
                :data="promoterData"
                @sort-change="handleSortChange"
                @cell-dblclick="setTableRow"
            >
              <el-table-column
                  show-overflow-tooltip
                  prop="dept_name"
                  label="机构名称"
                  sortable="custom"
              >
              </el-table-column>
              <el-table-column
                  show-overflow-tooltip
                  prop="dept_no"
                  label="机构编码"
                  sortable="custom"
              >
              </el-table-column>
              <el-table-column
                  prop="parent_no"
                  label="父机构"
                  sortable="custom"
              >
              </el-table-column>
              <el-table-column
                  prop="_dept_head_disp"
                  label="机构负责人"
                  sortable="custom"
              >
              </el-table-column>
              <el-table-column
                  prop="org_id"
                  label="机构id"
                  sortable="custom"
              >
              </el-table-column>
              <el-table-column
                  prop="org_type"
                  label="机构类型"
                  sortable="custom"
              >
              </el-table-column>
              <el-table-column
                  show-overflow-tooltip
                  prop="org_name"
                  label="机构名称"
                  sortable="custom"
              >
              </el-table-column>
              <el-table-column
                  show-overflow-tooltip
                  prop="org_no"
                  label="机构编号"
                  sortable="custom"
              >
              </el-table-column>
              <el-table-column
                  prop="parent_id"
                  label="机构父节点"
                  sortable="custom"
              >
              </el-table-column>
              <el-table-column
                  show-overflow-tooltip
                  prop="create_time"
                  label="创建时间"
                  sortable="custom"
              >
              </el-table-column>
            </el-table>
          </div>
          <div class="row_page">
            <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="page.currentPage"
                :page-sizes="page.sizeMenu"
                :page-size=page.pageSize
                layout="total, sizes, prev, pager, next, jumper"
                :total=page.total>
            </el-pagination>
          </div>
          <div class="info_des">请双击列表行进行选择</div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import OrderApi from '@/pages/audit/api/order';
import {filterListByOption } from "@/pages/audit/workdistribution/workFlow/filterList";
const OrderUtils = new OrderApi();
export default {
  name: "instituion-mod",
  data() {
    return {
      labelPosition: 'right',
      isShowTab:false,
      page:{
        currentPage:1,
        total:0,
        pageSize:5,
        sizeMenu:[2,5,10,15,20,50,100]
      },
      promoterData:[],
      selectNo:[],
      proForm: {
        dept_name:'', //like
        dept_type:[],  //in
        dept_class:[],  //in
        del_flag:[],   //in
        create_time:[], //between //创建时间
        create_user:'',      //创建人
        create_user_disp:'', //创建用户
        modify_user:"", //修改人
        modify_user_disp:'', //修改用户
        modify_time:[], //修改时间 between
      },
      optionsPage: {
        dept_type:[],
        dept_class:[],
        del_flag:[]
      },
      dept_no: [],
      pageNo:'',
      orderPage:[],
    }
  },
  props: {
    inVisible: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    insVisible: {
      get() {
        if(this.inVisible){
          this.getUserSelection()
        }
        return this.inVisible;
      },
      set(val) {
        this.$emit('update:inVisible', val);
      }
    }
  },
  methods:{
    setCascaderInfo(){
      this.proForm.dept_no=this.selectNo[this.selectNo.length-1];
    },
    //条数变化
    handleSizeChange(val){
      this.page.pageSize = val;
      // console.log(this.page);
      this.getTableList()
    },
    //页码
    handleCurrentChange(val){
      this.page.currentPage = val;
      this.getTableList()
    },
    //获取用户类型数据下拉
    getUserSelection(){
      let _this=this;
      OrderUtils.getInsSelectList().then(res=>{
        if(res.data.state!=='SUCCESS')return
        let  ls =res.data.data;
        _this.pageNo=ls.vpage_no;
        let ops = ls.srv_cols
        _this.optionsPage=filterListByOption(ops,_this.optionsPage)
        console.log(_this.optionsPage)
        _this.getTableList();
        // console.log('---x',_this.optionsPage)
      }).catch(err=>{})
    },
    //表格排序
    handleSortChange({ column, prop, order }){
      this.orderPage=[];
      let obj={colName:prop, orderType:order==='descending'?'desc':'asc'}
      this.orderPage.push(obj);
      this.getTableList()

    },
    //获取表格数据
    getTableList(){
      let obj={
        condition:this.buildProFormConditions(this.proForm),
        vpage_no:this.pageNo,
        relation_condition:{
          relation: "AND",
          data:this.buildProFormConditions(this.proForm)
        },
        order:this.orderPage,
        page:{pageNo:this.page.currentPage, rownumber:this.page.pageSize},
      }
      OrderUtils.getInsTable(obj).then((res)=>{
        if(res.data.state!=='SUCCESS') return
        let ls=res.data.data;
        this.promoterData=ls;
        this.page.total=res.data.page.total;
      }).catch(err=>{})
    },
    //组装表单搜索数据
    buildProFormConditions(proForm) {
      const conditions = [];
      let ins=['dept_type','dept_class','del_flag']
      let between=['create_time','modify_time']
      for (const key in proForm) {
        const value = proForm[key];
        if (value !== null && value !== undefined && value !== ''&& value.length!==0) {
          conditions.push({
            colName: key,
            ruleType: between.includes(key)?'between':ins.includes(key)?'in':'like',
            value:ins.includes(key)?value.join(','):value
          });
        }
      }
      return conditions;
    },
    //重置表单
    handleRestForm(){
      this.selectNo=[]
      this.orderPage=[];
      let ins=['dept_type','dept_class','del_flag']
      let between=['create_time','modify_time']
      for(let key in this.proForm) {
        this.proForm[key]=ins.includes(key)?[]:between.includes(key)?[]:'';
      }
    },
    //手动搜索表格
    searchTab(type){
      if(type==='cl'){
        this.handleRestForm()
      }
      this.getTableList();
    },
    //表格行被双击了
    setTableRow(row, column, cell, event){
      this.$emit('getInsRow', row);
      this.orderPage=[];
      this.insVisible=false;
    },
  },

  mounted() {

  }
}
</script>


<style scoped lang="scss">
.promoter_mod {
  width: 90%;
  margin-top: 15vh;
  overflow: auto;
}

.mod_search {
  border: 1px solid #c2e0ce;
  padding: 5px;
  border-radius: 4px;
}
.pr_row{
  display: flex;
}
.mo_tab{
  margin:0.625rem 0;
}
.row_page{
  margin:0.625rem 0;
  display: flex;
  justify-content: center;
}
.info_des{
  margin:0.3125rem 0;
  width: 100%;
  padding:5px 10px;
  text-align: center;
  font-size:0.875rem;
  color: #ef0c30;
}
</style>
<style>
.promoter_mod .el-dialog{
  width:75% !important;
}
</style>