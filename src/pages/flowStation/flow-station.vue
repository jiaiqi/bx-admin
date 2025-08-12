<template>
<div class="flow_station" :style="[{backgroundImage:'url('+flowInfo.bgImg+')'}]">
  <!-- 导出按钮 -->
<!--  <div class="export-btn" @click="exportToImage">-->
<!--    <i class="el-icon-download"></i>-->
<!--    导出图片-->
<!--  </div>-->
  
  <div class="flow_content" ref="flowContent">
    <div class="flow_station_head">{{flowInfo.title}}</div>
    <div class="flow_station_body">
        <div class="flow_row" v-for="(item,index) in flowList">
          <div class="flow_row_item_bg" v-if="!item.child">
              <span v-if="item.icon">
                      <img :src="getImagePath(item.icon)" alt=""/>
                    </span>
            <span>{{item.title}}</span>
          </div>
               <div class="flow_row_item_index" v-else>
               <div class="line"><img :src="getIconPath('line.png')" alt=""/></div>
               <div class="flow_index">
                 <span v-if="index===1" class="flow_start">开始</span>
                 <span class="flow_step">{{index}}</span>
               </div>
               <div class="flow_row_item_ch">
                  <div class="flow_title_sl">
                    <span v-if="item.icon" class="sl_icon">
                      <img :src="getImagePath(item.icon)" alt=""/>
                    </span>
                    <span class="sl_icon_title">{{item.title}}</span>
                  </div>
                   <div class="flow_line2" v-if="item.child&&item.child.length>1">
                     <img :src="getIconPath('line2.png')" alt=""/>
                   </div>
                   <div class="line" v-if="item.child&&item.child.length===1">
                     <img :src="getIconPath('line.png')" alt=""/>
                   </div>
                  <div class="flow_child_row">
                    <div class="flow_child_item" v-for="(sub,idx) in item.child">
                      {{sub.title}}
                    </div>
                  </div>
                 <div class="flow_line3" v-if="item.child&&item.child.length>1">
                   <img :src="getIconPath('line3.png')" alt=""/>
                 </div>
               </div>
           </div>
                     <div class="flow_end" v-if="index=== flowList.length-1">
             <div class="line">
               <img :src="getIconPath('line.png')" alt=""/>
             </div>
             <span  class="flow_start">结束</span>
           </div>
        </div>
    </div>
  </div>
</div>
</template>

<script>
import { flowStation } from "@/pages/flowStation/flow";
import {$http, getImagePath} from "@/common/http";

export default{
  name: "flow-station",
  data(){
    return{
      flowList:[],
      checklist_no:null,
      flowInfo:{
        bgImg:'',
        title:'',
      }
    }
  },
  created(){
    this.getNoByUrls();
  },
  mounted(){
    this.getFlowListData();
  },
  methods: {
     getNoByUrls(){
      if(this.$route.query && this.$route.query.checklist_no){
        this.checklist_no=this.$route.query.checklist_no;
      }
     },
    //获取流程数据信息
    async getFlowListData(){
      let url = '/park/select/srvpark_checklist_process_image_select';
      let req={
         serviceName: "srvpark_checklist_process_image_select",
         colNames: ["*"],
         condition: [{colName: "checklist_no", ruleType: "eq", value: this.checklist_no?this.checklist_no:"CN202507290001"}]
        }
       let res = await $http.post(url, req);
       if(res.data.state!=='SUCCESS') return;
       let ls =res.data;
       this.flowInfo.title = ls.checklist.checklist_name;
       this.flowInfo.bgImg=getImagePath(ls.checklist.background_image);
       this.flowList=ls.node
      console.log(res);

    },


    // 动态获取图片地址的方法
    getIconPath(iconName) {
      console.log(iconName);
      try {
        // 使用 require 动态导入图片
        return require(`./icon/${iconName}`);
      } catch (error) {
        console.warn(`图片 ${iconName} 不存在，使用默认图片`);
        // 可以返回一个默认图片
        return require('./icon/prd.png');
      }
    },

    async exportToImage() {
      try {
        const html2canvas = await import('html2canvas');
        this.$message.info('正在生成图片，请稍候...');
        
        const element = this.$refs.flowContent;
        
        // 保存原始样式
        const originalStyle = {
          overflow: element.style.overflow,
          height: element.style.height,
          maxHeight: element.style.maxHeight,
          position: element.style.position
        };
        
        // 临时修改样式以确保完整显示
        element.style.overflow = 'visible';
        element.style.height = 'auto';
        element.style.maxHeight = 'none';
        element.style.position = 'relative';
        
        // 等待DOM更新
        await this.$nextTick();
        
        const options = {
          backgroundColor: '#ffffff',
          scale: 2, // 提高图片质量
          useCORS: true,
          allowTaint: true,
          // 不强制设置尺寸，让html2canvas自动计算
          scrollX: 0,
          scrollY: 0,
          // 确保完整渲染
          foreignObjectRendering: false,
          removeContainer: true,
          // 处理图片资源
          imageTimeout: 15000,
          logging: false,
          // 添加一些边距
          x: 0,
          y: 0
        };
        
        const canvas = await html2canvas.default(element, options);
        
        // 恢复原始样式
        element.style.overflow = originalStyle.overflow;
        element.style.height = originalStyle.height;
        element.style.maxHeight = originalStyle.maxHeight;
        element.style.position = originalStyle.position;
        
        canvas.toBlob((blob) => {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.download = `${this.title}_流程图_${new Date().getTime()}.png`;
          link.href = url;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          this.$message.success('图片导出成功！');
        }, 'image/png');
        
      } catch (error) {
        console.error('导出图片失败:', error);
        this.$message.error('导出图片失败，请重试');
      }
    }
  }
}
</script>

<style scoped lang="less">
@import "flow_base.less";


</style>