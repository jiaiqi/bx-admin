<template>
  <div class="ll-container">
    <!-- <div class="left">
      <el-row class="tac">
        <el-col :span="24">
          <div class="menu-title">金汇园区管理平台</div>
          <component
            @ll="testNode"
            :menuList="menuList"
            dd="--"
            :is="'testMenu'"
            v-if="testNode"
          />
        </el-col>
      </el-row>
    </div> -->
    <div class="right">
      <!-- <div class="top flex-between">
        <div class="left-son flex">
          <div
            style="
              color: rgba(50, 66, 116, 1);
              font-size: 14px;
              text-align: left;
              font-weight: 700;
              font-family: 方正汉真广标-标准;
              margin-right: 10px;
            "
          >
            你好我是刘晓君
          </div>
          <div
            style="
              color: rgba(50, 66, 116, 1);
              font-weight: 700;
              font-size: 14px;
            "
          >
            2022.07.09
          </div>
        </div>
        <div class="right-son flex">
          <div
            class="flex"
            style="
              color: rgba(16, 16, 16, 1);
              font-size: 14px;
              text-align: left;
              font-family: SourceHanSansSC-regular;
              font-weight: 700;
            "
          >
            赵宇鹏
          </div>
          <img
            class="flex"
            v-if="txImage"
            style="
              margin-right: 10px;
              margin-left: 17px;
              width: 38px;
              height: 35px;
            "
            :src="txImage"
          />
          <img
            class="flex"
            style="width: 24px; height: 24px"
            v-if="loginImage"
            :src="loginImage"
          />
        </div>
      </div> -->
      <div class="bottom">
        <router-view> </router-view>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from "vue";

Vue.component("testMenu", {
  functional: true,
  injections: true,
  render: function (h, context) {
    // 完全透传任何 attribute、事件监听器、子节点等。

    console.dir(Vue, "==Vue==");
    console.log(h, "what is h");
    let { menuList } = context.data.attrs;
    console.log(menuList, "=menuList");
    let itemClick = (path, selectArray) => {
            console.log(context,"==context==")
        let copyArray=[...selectArray];
        let item=findPath(copyArray,menuList);

        context.parent.$router.push({
           path:item.path
        })
        console.log(item,"what is item===")
    };
    let findPath = (selectArray, menuList) => {
       console.log(selectArray,menuList);
      for (let i = 0; i < menuList.length; i++) {
        //  if
        let menuItem = menuList[i];
        if (menuItem.isIndex == selectArray[0] ) {
             let item=menuItem;
             selectArray.splice(0,1);
             if(selectArray.length == 0){
                    return item;
             }else{
              
               return findPath(selectArray,item.children)
             }
             
        }

      }
    };
    let recursionMenu = (item, parent, itemIndex) => {
      let index;

      if (item.isRoot) {
        index = `${item.isIndex}`;
      } else {
        item.isIndex = `${parent.isIndex}-${itemIndex}`;
        index = `${item.isIndex}`;
      }

      if (!item.children) {
        console.log("houhouhou");
        return (
          <el-menu-item class="oneBig" index={index}>
            <i class="el-icon-setting"></i>
            <span slot="title">{item.title}</span>
          </el-menu-item>
        );
      } else {
        let array = [];
        item.children.forEach((itemChildren, itemIndex) => {
          let domVnode = recursionMenu(itemChildren, item, itemIndex + 1);
          array.push(domVnode);
        });
        console.log(array, "==arr324123ay==");
        return (
          <el-submenu index={index}>
            <template slot="title">
              <i class="el-icon-location"></i>
              <span>{item.title}</span>
            </template>
            {array}
          </el-submenu>
        );
      }
    };

    if (!menuList) {
      return <div></div>;
    } else {
      let array = [];

      let str = (
        <el-submenu index="1">
          <template slot="title">
            <i class="el-icon-location"></i>
            <span>2额外企鹅</span>
          </template>
          <el-menu-item class="oneBig" index="1-1">
            <i class="el-icon-setting"></i>
            <span slot="title">导航四</span>
          </el-menu-item>
        </el-submenu>
      );
      console.log(str, "what is str");

      menuList.forEach((item, index) => {
        item.isIndex = index + 1;
        item.isRoot = true;
        let domVnode = recursionMenu(item);
        array.push(domVnode);
      });
      console.log(array, "==array==");
      return (
        <div>
          <el-menu default-active="2" class="el-menu" v-on:select={itemClick}>
            {array}
          </el-menu>
        </div>
      );
    }
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
            {
              title: "所有车路线",
              icon: 'i class="el-icon-location"></i>',
              path: "/allLine",
            },
          ],
        },
         {
          title: "园区",
          icon: 'i class="el-icon-location"></i>',
          children: [
            {
              title: "首页",
              icon: 'i class="el-icon-location"></i>',
              path: "/staffHome",
            },
            {
              title: "仓库态图",
              icon: 'i class="el-icon-location"></i>',
              path: "/storeStatic",
            },
            {
              title: "仓库监控",
              icon: 'i class="el-icon-location"></i>',
              path: "/storeMonitor",
            },
          ],
        },
        {
          title: "商家",
          icon: 'i class="el-icon-location"></i>',
          path: "/business"
        },
      ],
    };
  },

  

  methods: {
    testNode: function () {},
    handleOpen() {},
    jj() {
      console.log("wo cai");
    },
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
