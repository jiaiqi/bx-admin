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

<script lang="ts">
export default {
name: "order-home",
  data(){
    return{
      tabs:[
        {title:"工单信息",code:1,path:'orderform'},
        {title:"通行信息",code:2,path:'entrance'},
        {title:"路径轨迹",code:3,path:'basemap'}
      ],
      activeIndex:0
    }
  },
  methods:{
    setTab(item,index){
      this.activeIndex = index;
      this.$router.push({name: item.path});
    }
  },
  watch: {
    '$route': {
      immediate: true,
      handler(to) {
        const index = this.tabs.findIndex(tab => tab.path === to.name);
        if (index !== -1) {
          this.activeIndex = index;
        }
      }
    }
  },
  mounted(){
    sessionStorage.setItem("bx_auth_ticket",'xabxdzkj-e87e1e37-be65-411c-a654-495d2313f342');
    // 只在组件首次挂载时执行
    if (!this._isMounted) {
      console.log('123123')
      this._isMounted = true;
    }
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