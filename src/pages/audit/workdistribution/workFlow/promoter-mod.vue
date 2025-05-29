<template>
  <div class="promoter_mod">
    <el-dialog title="查询选择" :visible.sync="proVisible" :destroy-on-close="true" :close-on-click-modal="false">
      <div class="mod_mian">
        <div class="mod_search" v-if="isShowTab">
          <el-row>
            <el-form>
              <div class="pr_row">
                <el-col :span="8">
                  <el-form-item label="所属机构" prop="dept_no">
                    <el-cascader
                        v-model="selectNo"
                        @change="setCascaderInfo"
                        size="mini"
                        :options="dept_no"
                        :props="{ checkStrictly: true,label: 'dept_name', value: 'dept_no', children: 'children' }"
                        clearable></el-cascader>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="工号" prop="user_no">
                    <el-input v-model="proForm.user_no"  style="width:70%" placeholder="请输入..." clearable size="mini"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="名称" prop="user_name">
                    <el-input v-model="proForm.user_name"  style="width:70%" placeholder="请输入..." clearable size="mini"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="联系电话" prop="user_tel">
                    <el-input v-model="proForm.user_tel"  style="width:70%" placeholder="请输入..." clearable size="mini"></el-input>
                  </el-form-item>
                </el-col>
              </div>
              <div class="pr_row">
                <el-col :span="8">
                  <el-form-item label="用户类型" prop="user_tel">
                  <el-select v-model="proForm.user_type"
                             placeholder="请选择" size="mini"
                             multiple
                             collapse-tags
                             clearable
                  >
                    <el-option
                        v-for="item in optionsPage.user_type"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value">
                    </el-option>
                  </el-select>
                  </el-form-item>
                </el-col>
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
            border
            stripe
            :data="promoterData"
            @sort-change="handleSortChange"
            @cell-dblclick="setTableRow"
            >
              <el-table-column
                  prop="dept_name"
                  label="所属机构"
                  sortable="custom"
                >
              </el-table-column>
              <el-table-column
                  prop="user_no"
                  label="工号"
                  sortable="custom"
                 >
              </el-table-column>
              <el-table-column
                  prop="user_name"
                  label="名称"
                  sortable="custom"
                 >
              </el-table-column>
              <el-table-column
                  prop="user_tel"
                  label="联系电话"
                  sortable="custom"
                 >
              </el-table-column>
              <el-table-column
                  prop="_user_type_disp"
                  label="用户类型"
                  sortable="custom"
                 >
              </el-table-column>
              <el-table-column
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
  name: "promoter-mod",
  data() {
    return {
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
        dept_no: '',
        user_no:"",
        user_name:'',
        user_tel:'',
        user_type:[]
      },
      optionsPage: {
        user_type:[]
      },
      dept_no: [],
      pageNo:'',
      orderPage:[],
    }
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    proVisible: {
      get() {
        if(this.visible){
          this.getUserSelection()
          this.getCascaderList([])
        }
        return this.visible;
      },
      set(val) {
        this.$emit('update:visible', val);
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
      OrderUtils.getModUserOption().then(res=>{
        if(res.data.state!=='SUCCESS')return
        let  ls =res.data.data;
        _this.pageNo=ls.vpage_no;
        let ops = ls.srv_cols
        _this.optionsPage=filterListByOption(ops,_this.optionsPage)
        _this.getTableList();
        console.log('---x',_this.optionsPage)
      }).catch(err=>{})
    },
    //获取级联数据
    getCascaderList(ca){
      let _this=this;
      OrderUtils.getSelectDepCascader(ca).then((res)=>{
        if(res.data.state!=='SUCCESS') return
        let ls=res.data.data;
        _this.dept_no=ls;
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
       OrderUtils.getPromoterTable(obj).then((res)=>{
         if(res.data.state!=='SUCCESS') return
         let ls=res.data.data;
         this.promoterData=ls;
         this.page.total=res.data.page.total;
       }).catch(err=>{})
    },
    //组装表单搜索数据
    buildProFormConditions(proForm) {
      const conditions = [];
      for (const key in proForm) {
        const value = proForm[key];
        if (value !== null && value !== undefined && value !== ''&& value.length!==0) {
          conditions.push({
            colName: key,
            ruleType: key==='user_type'?'in':'like',
            value: key==='user_type'?value.join(','):value
          });
        }
      }
      return conditions;
    },
    //重置表单
    handleRestForm(){
      this.selectNo=[]
      for(let key in this.proForm) {
        this.proForm[key]=key==='user_type'?[]:'';
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
     this.$emit('getProMoterRow', row);
     this.proVisible=false;
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