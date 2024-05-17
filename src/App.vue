<template>
  <div id="app">
    <router-view v-if="ready"></router-view>
  </div>
</template>

<script>
import momentLib from "moment";
import extjs from "./components/test/extjs.js";
import dummy from "./components/test/spa_mock.js";
import {LoadScript} from './common/common'
export default {
  name: "App",
  data() {
    return {
      ready: false
    };
  },
  created(){
    if(this.$route?.query?.bx_auth_ticket){
      sessionStorage.setItem('bx_auth_ticket',this.$route?.query?.bx_auth_ticket)
      localStorage.setItem('bx_auth_ticket',this.$route?.query?.bx_auth_ticket)
    }
  },
  mounted() {
    const init = () => {
      const AK = 'FC190506b9b4fa8b366db9f78cb5e93e';
      // const bMapSrc = `${location.protocol}//api.map.baidu.com/api?v=2.0&ak=${AK}&s=1&callback=onBMapCallback`
      const bMapSrc = `${location.protocol}//30.61.1.37:8119/dugis-demo-3d/api/api.js`
      const bMapGLSrc = `${location.protocol}//api.map.baidu.com/api?type=webgl&v=2.0&ak=${AK}`
      LoadScript(bMapSrc).then((bmap)=>{
        console.log(bmap)
        this.$store.commit('setBMapLoaded', true)
      })
    }
    init()
  },

  methods: {
    getExtjsCondition() {
      let path = this.$route.path;
      let tokens = path.split("/").filter(i => !!i);
      let pageType = tokens[0];
      let pageParam = tokens[1];
      if (path.startsWith("/procdetail") || path.startsWith("/startproc")) {
        pageType = "proc";
      }

      let pageTypes = ["list", "add", "detail", "update", "proc", "listproc"];
      if (pageTypes.includes(pageType)) {
        return [
          {
            colName: "page_type",
            ruleType: "eq",
            value: pageType
          },
          {
            colName: "page_param",
            ruleType: "eq",
            value: pageParam
          }
        ];
      }

      return null;
    },

    loadExtJs() {
      this.ready = true;

      // let condition = this.getExtjsCondition();
      // if (!condition) {

      //   this.ready = true;
      // } else {
      //   this.select("srvsys_page_extjs_select", condition).then((resp) => {
      //     try {
      //       if (resp.data && resp.data.data && resp.data.data.length > 0) {
      //         let moment = momentLib;
      //         eval(resp.data.data[0].extjs)
      //       }
      //     } finally {
      //       // note: always last statement

      //       this.ready = true;
      //     }
      //   })
      // }
    },

    // 开发调试extjs
    testExtJs() {
      // !!! mock test code !!!!
      new Promise(resolve => setTimeout(resolve, 200)).then(() => {
        extjs.bind(this)();

        // note: always last statement

        this.ready = true;
      });
    }
  },

  beforeMount: function() {
    dummy();
    window.debugExtjs ? this.testExtJs() : this.loadExtJs();
  }
};
</script>

<style>

html{
  height: 100%;
  margin: 0;
  padding: 0;
}
body{
  height: 100%;
  margin: 0;
  padding: 0;
}
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  height: 100%;
  color: #2c3e50;
}
.el-input.is-disabled .el-input__inner {
  color: #303133 !important;
}
.el-textarea.is-disabled .el-textarea__inner {
  color: #303133 !important;
}
.customDialogClass{
  .el-dialog__body {
      padding: 10px 20px!important;
  }
}

</style>
