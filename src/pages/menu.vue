<template>
  <div  functional>
  
    
  </div>
</template>

<script>
import Vue from "vue";

Vue.component("testMenu", {
  functional: true,
  injections: true,
  render: function (createElement, context) {
    // 完全透传任何 attribute、事件监听器、子节点等。
    console.log(context, "==context==context");
    return createElement("button", context.data, context.children);
  },
});

export default {
  components: {},

  mixins: [],
  provide: {
    foo: "bar",
  },

  props: {},

  data() {
    return {
      txImage: null,
      loginImage: null,

      menuList: [
        {
          title: "首页",
          icon: 'i class="el-icon-location"></i>',
          disabled: true,

          path: "/",
        },
        {
          title: "物流",
          icon: 'i class="el-icon-location"></i>',
          children: [
            {
              title: "首页",
              icon: 'i class="el-icon-location"></i>',
              path: "/home",
            },
            {
              title: "单车",
              icon: 'i class="el-icon-location"></i>',
              path: "/line",
            },
          ],
        },
      ],
    };
  },

  methods: {
    testNode: function () {
      
    },
    handleOpen() {},
    handleClose() {},
  },

  created: function () {
    this.txImage = require(`@/assets/image/tx2.png`);
    this.loginImage = require(`@/assets/image/login2.png`);
  },

  mounted: function () {
    let h = this.$createElement;
    this.testNode = <div>呵呵呵</div>;
  },
};
</script>

<style scoped>
.menu-title {
  color: white;
  background: #292c35;
  font-size: 15px;
  font-weight: 700;
  font-family: SourceHanSansSC-regular;
  height: 65px;
  width: 100%;
  display: flex;
  align-items: center;
  padding-left: 37px;
  box-sizing: border-box;
}
.ll-container .left .oneBig {
  color: white !important;
}
.ll-container .left /deep/ .el-submenu__title {
  color: white;
  background: rgb(51, 53, 65);
}

.ll-container .left /deep/ .el-menu {
  color: white;
  background: #292c35;
}

.ll-container .left /deep/ .el-menu-item {
  color: #595b62;
}

.ll-container .left /deep/ .el-menu-item.is-active {
  background: #4d5fcc !important;
  color: white;
}

.ll-container .left /deep/ .el-menu-item:hover {
  background: #4d5fcc !important;
  color: white;
}

.ll-container .left /deep/ .el-submenu__title:hover {
  background: #4d5fcc !important;
  color: white;
}
</style>

<style lang="scss" scoped>
.ll-container {
  display: flex;
  height: 100%;

  .left {
    height: 100%;
    width: 190px;
    overflow: hidden;
    background-color: rgba(51, 53, 65, 1);
    color: white;

    .el-menu {
      background-color: rgba(51, 53, 65, 1);
      color: white;
    }
  }
  .right {
    height: 100%;
    display: flex;
    flex-direction: column;
    flex: 1;
    box-sizing: border-box;

    .top {
      height: 68px;
      padding: 0px 39px;
      background: white;
    }

    .bottom {
      flex: 1;
    }
  }
}
</style>
