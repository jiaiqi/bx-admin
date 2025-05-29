<template>
 <div class="plugin_main">
     <!--基础配置-->
     <el-row class="sp_row">
       <el-col  :span=24 >
         <span  class="sp_t sp_t_l">样式名称：</span>
         <span><el-input style="width:11.25rem" v-model="styleName" @blur="setStyleName" placeholder="请输入样式名称" size="mini"></el-input></span>
       </el-col>
        <el-col>
          <li class="erro_info" :style="[{opacity:!isShowErr?'0':'1'}]">样式名称不能为空</li>
        </el-col>
     </el-row>
   <el-row class="sp_row">
     <el-col  :span=24  style="display: flex">
       <span  class="sp_t">系统参数：</span>
       <el-checkbox-group v-model="sysPara" style="width: 70%">
         <el-checkbox label="复选框 A"></el-checkbox>
         <el-checkbox label="复选框 B"></el-checkbox>
       </el-checkbox-group>
     </el-col>
   </el-row>
 </div>
</template>

<script setup>
import {ref,recative} from "vue";
const styleName=ref("");
const sysPara=ref([])
const isShowErr=ref(false);
const setStyleName=()=>{
      isShowErr.value=styleName.value.length>0?false:true;
}
</script>


<style scoped>
li{
  list-style: none;
}
.plugin_main{
  width: 100%;
  height: 100%;
  .sp_row{
    width: 100%;
    padding:3px 0.125rem;
    margin:4px 0;
    border-bottom:1px solid #eeeded;
  }
}
.sp_col{
  display: flex;
}
.sp_t{
  font-size:0.875rem;
  display: inline-block;
}
.sp_t_l {
  &&::before {
    content: "*";
    color: #f74b4b;
    margin-right:4px;
  }
}
.erro_info{
  font-size:12px;
  color: #f74b4b;
  text-align: center;
}
</style>