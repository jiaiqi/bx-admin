<template>
  <div class="work_main">
    <div class="work_content">
      <keep-alive>
        <router-view></router-view>
      </keep-alive>
    </div>
    <div class="work_tab">
      <div class="work_tab_cot">
        <div v-for="(item,index) in tabs" :key="item.code" :class="activeIndex===index?'act_tab_row':'tab_row'" @click="setTab(item,index)">
          {{item.title}}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
name: "order-home",
  data(){
    return{
      tabs:[
        {title:"工单信息",code:1,path:'orderform'},
        {title:"通行信息",code:2,path:'entrance'},
        {title:"路径轨迹",code:3,path:'basemap'}
      ],
      activeIndex:0,
      setPass_id:'',
      baseRouterInfo:{},
      initialRouteInfo: null
    }
  },
  methods:{
    setTab(item,index){
      this.activeIndex = index;
      if(item.code!==1){
        // 记录当前路由信息
        const currentQuery = this.$route.query;
        if (currentQuery && Object.keys(currentQuery).length > 0) {
          this.initialRouteInfo = JSON.parse(JSON.stringify(currentQuery));
          console.log('保存路由信息：', this.initialRouteInfo);
        }
        // 确保 pass_id 不为空
        const passId = this.setPass_id || (currentQuery && currentQuery.pass_id) || '';
        console.log('切换标签时的 pass_id：', passId);
        this.$router.push({
          name: item.path,
          query: {
            pass_id: passId
          }
        });
      }else {
        // 如果是返回工单信息页面，使用初始路由信息
        console.log('当前保存的路由信息：', this.initialRouteInfo);
        if(this.initialRouteInfo && Object.keys(this.initialRouteInfo).length > 0) {
          this.$router.push({name: item.path,query:this.initialRouteInfo});
        } else {
          const storedInfo = sessionStorage.getItem("oderInfo");
          console.log('使用sessionStorage信息：', storedInfo);
          if (storedInfo) {
            try {
              const parsedInfo = JSON.parse(storedInfo);
              this.$router.push({name: item.path,query:{operate_params:storedInfo}});
            } catch (e) {
              console.error('解析sessionStorage数据失败：', e);
              this.$router.push({name: item.path});
            }
          } else {
            this.$router.push({name: item.path});
          }
        }
      }
    },
    getRouterInfo(){
      let operate_params = this.getOperateParams();
      if (operate_params) {
        try {
          sessionStorage.setItem('oderInfo', operate_params);
          const parsedParams = JSON.parse(operate_params);
          if (parsedParams && parsedParams.data) {
            this.setPass_id = parsedParams.data[0]?.pass_id || '';
            console.log('获取到的 pass_id：', this.setPass_id);
            // 保存初始路由信息
            const currentQuery = this.$route.query;
            if (currentQuery && Object.keys(currentQuery).length > 0) {
              this.initialRouteInfo = JSON.parse(JSON.stringify(currentQuery));
              console.log('getRouterInfo中保存的初始路由信息：', this.initialRouteInfo);
            }
          }
        } catch (e) {
          console.error('处理路由信息时出错：', e);
        }
      }
    },
  },
  watch: {
    '$route': {
      immediate: true,
      handler(to) {
        console.log('路由变化：', to.name, to.query);
        const index = this.tabs.findIndex(tab => tab.path === to.name);
        if (index !== -1) {
          this.activeIndex = index;
        }
        // 只在首次加载时获取路由信息
        if (!this._isMounted) {
          this.getRouterInfo();
        }
      }
    }
  },
  mounted(){
     this.$nextTick(()=>{
       sessionStorage.removeItem('bx_auth_ticket');
       sessionStorage.setItem("bx_auth_ticket",'xabxdzkj-7cb48bb4-a770-4e08-9472-fb2c574b1c8d');
     })
    // 移除这里的 getRouterInfo 调用，因为已经在 watch 中处理了
    if (!this._isMounted) {
      this._isMounted = true;
    }
  },
  beforeDestroy(){
  }
}
</script>

<style scoped lang="scss">
.work_main{
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-between;
  background: #fff;
  box-sizing: border-box;
  padding:3px 5px;
  .work_content{
    width:95.5%;
    height:100%;
    overflow: auto;

  }
  .work_tab{
    width:4%;
    height:100%;
    background: #f2f6f6;
    display: flex;
    justify-content: center;
    align-items: center;
    .work_tab_cot{
      width:100%;
      height:40%;

    }
  }
}
.tab_row{
  margin:0.9375rem auto;
  width:90%;
  padding:2px 4px;
  text-align: center;
  font-size:0.875rem;
  color: #5391ef;
  background: #cccccc;
  cursor:pointer;
  border-radius: 0.1875rem;
}
.act_tab_row{
  margin:0.9375rem auto;
  width:90%;
  padding:2px 4px;
  text-align: center;
  font-size:0.875rem;
  color: #fff;
  background:#5391ef;
  cursor:pointer;
  border-radius: 0.1875rem;
}
@media screen and (min-width: 768px) and (max-width: 1800px){
  .tab_row{
    width:50%;
  }
  .act_tab_row{
    width:50%;
  }
}
</style>