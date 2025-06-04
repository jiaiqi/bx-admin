<template>
  <div class="sta_table">
    <el-dialog title="查询选择" :visible.sync="listVisible" :destroy-on-close="true" :close-on-click-modal="false">
        <div class="st_main">
          <div class="st_info">
            <li class="info_row">
              <span>门架名称：</span>
              <span><el-input style="width:12.5rem" size="mini" clearable v-model="station.doorInfo" placeholder="请输入..."></el-input></span>
            </li>
            <li  class="info_row">
              <span>收费站名称：</span>
              <span><el-input style="width:12.5rem" size="mini" clearable v-model="station.stationInfo" placeholder="请输入..."></el-input></span>
            </li>
            <li style="margin-left:10%">
              <el-button size="mini" icon="el-icon-search" type="primary" round @click="getStationsList">查询</el-button>
              <el-button size="mini" icon="el-icon-refresh-right" type="info" round @click="resetForm">重置</el-button>
            </li>
          </div>
          <div class="st_cot">
            <div class="st_tb">
              <el-table
                  stripe
                  border
                  :data="stationData"
                  @selection-change="handleSelectionChange"
              >
                <el-table-column
                    type="selection"
                    width="55">
                </el-table-column>
                <el-table-column
                    show-overflow-tooltip
                    prop="category"
                    label="类别"
                >
                </el-table-column>
                <el-table-column
                    show-overflow-tooltip
                    prop="grantry_type"
                    label="类型"
                >
                </el-table-column>
                <el-table-column
                    show-overflow-tooltip
                    prop="name"
                    label="门架名称"
                >
                </el-table-column>
                <el-table-column
                    show-overflow-tooltip
                    prop="dept_name"
                    label="收费站名称"
                >
                </el-table-column>
              </el-table>
            </div>
            <div class="st_chose">
              <li>当前已选择{{choseList.length}}条</li>
              <li>  <el-button size="mini" type="primary" round @click="handleChose">确认选择</el-button></li>
            </div>
            <div class="st_page">
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
          </div>
        </div>
    </el-dialog>
  </div>
</template>
<script>
import OrderApi from "@/pages/audit/api/order";
const orderUtil= new OrderApi();
export default {
  name: "stationList",
  data(){
    return{
      choseList:[],
      stationData:[],
      page:{
        currentPage:1,
        total:0,
        pageSize:5,
        sizeMenu:[2,5,10,15,20,50,100]
      },
      station:{
        doorInfo:'',
        stationInfo:'',
      }
    }
  },
  props: {
    stVisible: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    listVisible: {
      get() {
        return this.stVisible;
      },
      set(val) {
        this.$emit('update:stVisible', val);
      }
    }
  },
  watch: {
    stVisible: {
      handler(newVal) {
        if (newVal) {
          // 弹窗打开时，重置查询条件并获取数据
          this.station = {
            doorInfo: '',
            stationInfo: ''
          };
          this.choseList=[]
          this.getStationsList();
        }
      },
      immediate: true
    }
  },
  methods:{
    //条数变化
    handleSizeChange(val){
      this.page.pageSize = val;
      this.getStationsList()
    },
    //页码
    handleCurrentChange(val){
      this.page.currentPage = val;
      this.getStationsList()
    },
    //重置表单
    resetForm() {
      this.station = {
        doorInfo: '',
        stationInfo: ''
      };
      this.getStationsList();
    },
    //组装表单搜索数据
    buildProFormConditions(proForm) {
      const conditions = [];
      for (const key in proForm) {
        const value = proForm[key];
        if (value !== null && value !== undefined && value !== ''&& value.length!==0) {
          conditions.push({
            colName: key==='doorInfo'?'name':'dept_name',
            ruleType:'like',
            value:value
          });
        }
      }
      return conditions;
    },
    /**
     * @Description:获取全量收费站及门架
     * @Author:Eirice
     * @Date: 2025-05-30 17:48:35
     */
    getStationsList (){
      let info={
        page:{
          pageNo:this.page.currentPage,
          rownumber:this.page.pageSize,
        },
        condition:this.buildProFormConditions(this.station),
        relation_condition:{
          relation: "AND",
          data:this.buildProFormConditions(this.station)
        },
      }
      orderUtil.getAllStationByInfo(info).then(res => {
        if(res.data.state !== 'SUCCESS') return;
        this.stationData=res.data.data;
        this.page.total=res.data.page.total;
      }).catch(err => {})
    },
    //列便选择
    handleSelectionChange(val){
      this.choseList=val
    },
    //确认列表选择数据携带
    handleChose(){
      this.$emit('getChoseStations',this.choseList);
      this.listVisible=false;
    }
  }
}
</script>



<style scoped lang="scss">
li{
  list-style: none;
}
.st_info{
  display: flex;
  align-items: center;
  height:5.3125rem;
  .info_row{
    width:35%;
  }
}
.sta_table{
  width: 85%;
}
.st_main{
  width:100%;
  height:31.25rem;
}
.st_cot{
  width: 100%;
  height:calc(100% - 5rem);
  .st_tb{
    width:100%;
    height:80%;
    overflow: auto;
  }
  .st_chose{
    width:100%;
    height:3.4375rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .st_page{
    margin-top:0.5rem;
    display: flex;
    justify-content: center;
  }
}
</style>