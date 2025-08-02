<template>
 <div class="regular-box">
    <div class="regular_left_bar">
      <el-form :model="regular" ref="regular" label-width="80px" :rules="rules">
         <el-form-item label="规则名称" prop="name">
          <el-input v-model="regular.name" placeholder="请输入规则名称" size="mini" clearable></el-input>
        </el-form-item>
<!--        <el-form-item label="配置类型" prop="cfg_type">-->
<!--           <el-select v-model="regular.cfg_type" placeholder="请选择配置类型" size="mini" style="width:100%" clearable>-->
<!--            <el-option v-for="item in pageOptions.cfg_type" :key="item.value" :label="item.label" :value="item.value"></el-option>-->
<!--          </el-select>-->
<!--        </el-form-item>-->
<!--        <el-form-item label="值类型" prop="cfg_type">-->
<!--          <el-select v-model="regular.val_type" placeholder="请选择值类型" size="mini" style="width:100%" clearable>-->
<!--            <el-option v-for="item in pageOptions.val_type" :key="item.value" :label="item.label" :value="item.value"></el-option>-->
<!--          </el-select>-->
<!--        </el-form-item>-->
<!--        <el-form-item label="设备类型" prop="equip_type" v-if="pageOptions.equip_type.length>0">-->
<!--          <el-select v-model="regular.equip_type" placeholder="请选择设备类型" size="mini" style="width:100%" clearable @change="handleDeviceType">-->
<!--            <el-option v-for="item in pageOptions.equip_type" :key="item.no" :label="item.name" :value="item.no"></el-option>-->
<!--          </el-select>-->
<!--        </el-form-item>-->
        <el-form-item label="指标" prop="equip_type" v-if="pageOptions.ind.length>0">
          <el-select v-model="regular.ind" placeholder="请选择指标" size="mini" style="width:100%" clearable @change="handleIndType">
            <el-option v-for="item in pageOptions.ind" :key="item.ind_no" :label="item.ind_name" :value="item.ind_no"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="操作符" prop="operator">
          <el-select v-model="regular.operator" placeholder="请选择操作符合" size="mini" style="width:100%" clearable @change="handleOperator">
            <el-option v-for="item in pageOptions.operator" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="逻辑符" prop="logical_operator">
          <el-select v-model="regular.logical_operator" placeholder="请选择逻辑操作符合" size="mini" style="width:100%" clearable @change="handleLogical">
            <el-option v-for="item in pageOptions.logical_operator" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="常量值" prop="constant_val">
           <el-input v-model="regular.constant_val" placeholder="请输入常量值" size="mini" clearable></el-input>
        </el-form-item>
        <el-form-item label="变量值" prop="logical_operator">
          <el-select v-model="regular.val_val" placeholder="请选择变量值" size="mini" style="width:100%" clearable @change="handleDeviceType">
            <el-option v-for="item in pageOptions.val_val" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSetInfo" size="mini">保存</el-button>
          <el-button  @click="handleSetInfo" size="mini">重置</el-button>
        </el-form-item>
      </el-form>
      <div class="group_node" id="group_node"></div>
    </div>
   <div class="regular_right_content" id="reg_box">

   </div>
 </div>
</template>

<script>
import Expression from "@/pages/regularExpression/api";
import { filterListByOption } from "@/pages/audit/workdistribution/workFlow/filterList";
const expressionUtils = new Expression();
import RegularX6 from "@/pages/regularExpression/regularX6";
export default{
  name: "regular-box",
  data(){
    return{
      regular:{
        expr_no:'', //路由携带规则编号
        name:'',
        cfg_type:'条件', //配置类型
        row_json:'', //行json
        constant_val:'', //常量值
        operator:'',  //操作符
        val_type:'常量', //值类型
        val_val:'', //变量值
        logical_operator:'', //逻辑操作符类型
        equip_type:'', //设备类型
        ind:'', //指标
      },
     pageOptions:{
       cfg_type:[], //配置类型
       logical_operator:[], //逻辑操作符类型
       equip_type:[], //设备类型
       ind:[], //指标
       operator:[], //操作符
       val_val:[], //变量值
       val_type:[], //值类型
     },
     rules: {
       name: [
          { required: true, message: "请输入规则名称", trigger: "blur" },
        ],
       cfg_type:[
         {required: true, message: "请选择配置类型", trigger: "change" },
       ]
      },
      regularX6:null
    }
  },
  methods:{

    handleDeviceType(){
      let setText= this.pageOptions.val_val.find(item=>item.value===this.regular.val_val).label
      let obj= {
        value:this.regular.val_val,
        label:setText
      }
      this.regularX6.handleSelectedNodeUpdate('val_val',obj)
    },
    handleIndType(){
      let setText= this.pageOptions.ind.find(item=>item.ind_no===this.regular.ind).ind_name
      let obj= {
        value:this.regular.ind,
        label:setText
      }
      this.regularX6.handleSelectedNodeUpdate('ind',obj)
    },
    handleOperator(){
      let setText= this.pageOptions.operator.find(item=>item.value===this.regular.operator).label
      let obj= {
        value:this.regular.operator,
        label:setText
      }
      this.regularX6.handleSelectedNodeUpdate('op',obj)
    },
    handleLogical(){
      let setText= this.pageOptions.logical_operator.find(item=>item.value===this.regular.logical_operator).label
      let obj= {
        value:this.regular.logical_operator,
        label:setText
      }
      this.regularX6.handleSelectedNodeUpdate('lo',obj)
    },
    handleSetInfo(){
      this.regularX6.getLogicalStructure()
    },
    async getPageOptionConfig(){
      let res = await expressionUtils.getPageOptionConfig()
      if(res.data.state !== "SUCCESS") return
      let ls=res.data.data
      let ops = ls.srv_cols
      this.pageOptions=filterListByOption(ops,this.pageOptions);
      this.handelFilterCfg()

    },
    handelFilterCfg(){
        for (const key in this.pageOptions) {
          if (this.pageOptions.hasOwnProperty(key)) {
            const value = this.pageOptions[key];
            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
              this.handleSetList(value,key)
            }
          }
        }
    },
  async handleSetList(value,key){
       let res = await expressionUtils.getSelectOptionsByColumns(value)
         if(res.data.state !== "SUCCESS") return
         this.pageOptions[key] = res.data.data||[]
    console.log('s0000',this.pageOptions)
    }
  },

  mounted(){
    this.getPageOptionConfig()
    let el =document.getElementById("reg_box");
    let scEl=document.getElementById("group_node");
      this.regularX6 = new RegularX6({container:el,sc:scEl,equip_type:this.pageOptions.equip_type});
      this.regularX6.initGraph()
      this.regularX6.initStencil();
  }
}
</script>



<style scoped lang="scss">
.regular-box{
  width:100%;
  height:100%;
  display: flex;
  justify-content: space-between;
  padding:0.9375rem;
  background: #f6f6f6;
}
.regular_left_bar{
  width:23%;
  padding:0.9375rem;
  height:100%;
  background:#fff;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow: auto;
}
.regular_right_content{
  width:76%;
  height:100%;
  background-color: #f5f5f9;
  background-size: 20px 20px, 20px 20px;
  background-image: linear-gradient(#f5f5f9 19px, transparent 0), linear-gradient(90deg, transparent 19px, #000 0);
}
.group_node{
  width:100%;
  height:calc(100% - 28.125rem);
  border:1px dashed #ccc;
  position: relative;
}
.regular_left_bar .el-form .el-form-item{
  margin-bottom:0.5rem !important;
}
</style>