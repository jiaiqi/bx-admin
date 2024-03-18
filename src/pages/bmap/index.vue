<template>
  <div class="web-layout bg-light">
    <!-- <cMap></cMap> -->
    <BMapJs
      :depts="depts"
      :modeUrl="urlPath"
      :no="no"
      :initCheckPointId="initCheckPointId"
      @setPointList="setPointList"
    ></BMapJs>
    <div class="point-list">
      <div class="title">路径门架列表</div>
      <div class="point-list-wrap">
        <div
          class="point-item"
          :class="{ active: index === activePoint }"
          v-for="(item, index) in mockPointList"
          @click="activePoint = index"
        >
          <div class="left">
            <div class="point" :style="[{ backgroundColor: item.color }]"></div>
          </div>
          <div class="right">
            <div class="top">
              <div class="point-name">
                <div>{{ item.name }}</div>
                <div v-if="index === activePoint"><i class="el-icon-error"></i></div>
              </div>
              <div class="point-time">
                <div class="time">{{ item.time }}</div>
                <div v-if="index === activePoint"><i class="el-icon-edit" style="color: #007aff;"></i></div>
              </div>
            </div>
            <div class="add-btn">+ 添加门架</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// import store from '@/store'

// import { getWebSitePcCarousel,friendLinks,getListData } from '@/api/api.js'

import BMapJs from "./components/bmap-web.vue";

export default {
  name: "b-map-index",
  components: { BMapJs },
  props: {
    msg: String,
  },
  computed: {
    urlParams() {
      let params = this.$route.query;
      return params;
    },
    urlPath() {
      let routePath = this.$route.path;
      let path = "";
      if (routePath.indexOf("/bmap/editor/") !== -1) {
        // 路径可视化
        path = "/bmap/editor/";
      } else if (routePath.indexOf("/bmap/check") !== -1) {
        // 门架校准
        path = "/bmap/check";
      }
      return path;
    },
    no() {
      let params = this.$route.params;
      params = params.no || "";
      return params;
    },
  },
  data() {
    return {
      activePoint: 0,
      depts: [],
      initCheckPointId: "",
      pointList: [],
      mockPointList: [
        {
          name: "宝钛站-宝钛_001车道",
          time: "2023-10-15 10:22:01",
          color: "#3894ff",
        },
        {
          name: "宝钛站-宝钛_001车道",
          time: "2023-10-15 10:22:01",
          color: "#af52de",
        },
        {
          name: "宝钛站-宝钛_001车道",
          time: "2023-10-15 10:22:01",
          color: "#af52de",
        },
        {
          name: "宝钛站-宝钛_001车道",
          time: "2023-10-15 10:22:01",
          color: "#ffc97a",
        },
        {
          name: "宝钛站-宝钛_001车道",
          time: "2023-10-15 10:22:01",
          color: "#7ac756",
        },
        {
          name: "宝钛站-宝钛_001车道",
          time: "2023-10-15 10:22:01",
          color: "#af52de",
        },
        {
          name: "宝钛站-宝钛_001车道",
          time: "2023-10-15 10:22:01",
          color: "#3894ff",
        },
      ],
    };
  },
  created() {},
  mounted() {
    if (this.urlPath.indexOf("/bmap/editor/") !== -1) {
    } else if (this.urlPath.indexOf("/bmap/check") !== -1) {
      this.initCheckPointId = this.$route.query.id;
      this.getAllDepts();
    }
  },
  methods: {
    setPointList(list) {
      this.pointList = list;
    },
    getAllDepts() {
      // 查询所有分公司信息
      // category取值：门架、收费站
      // grantry_type取值：路段门架、虚拟门架、省界门架、收费站
      // company_no：分公司，可通过该字段进行过滤，分公司用户登录时，使用用户的dept_no进行过滤
      let srv = "srvauth_dept_op_select";
      let srvAuth = "auth";
      let conds = [
        {
          colName: "dept_class",
          ruleType: "eq",
          value: "dept_type01",
        },
      ];
      let relationCondition = {};
      let page = null;
      let order = null;
      this.select(
        srv,
        conds,
        page,
        order,
        null,
        null,
        srvAuth,
        null,
        null,
        relationCondition,
        false,
        null
        // srvAuth
      ).then((res) => {
        // console.log('分公司',res.data)
        res = res.data;
        if (res.state == "SUCCESS") {
          // depts
          self.depts = res.data.map((item) => item);
          // console.log('分公司',res.data)
        } else {
          console.log("查询分公司信息 异常", res);
        }
      });
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
.web-layout {
  display: flex;
  .web-layout-content {
    position: relative;
    flex: 1;
  }
  .point-list {
    width: 300px;
    height: 100vh;
    background-color: #fff;
    padding: 10px;
    z-index: 9;
    .point-item {
      display: flex;
      &:last-child .left {
        &::after {
          content: none;
        }
      }
      .top {
        border: 1px solid transparent;
      }
      &.active {
        .right .top {
          border-color: #3b98fd;
          background-color: #ecfaff;
        }
      }
      .left {
        text-align: center;
        width: 30px;
        position: relative;
        padding-top: 5px;
        &::after {
          content: "";
          position: absolute;
          width: 2px;
          background-color: #e0e3ea;
          height: calc(100% - 16px);
          top: 23px;
          left: 14px;
        }

        .point {
          display: inline-block;
          width: 14px;
          height: 14px;
          border-radius: 50%;
        }
      }
      .right {
        flex: 1;
        .top {
          padding: 3px 10px;
          border-radius: 4px;
          .point-name{
            display: flex;
            justify-content: space-between;
          }
          .point-time {
            display: flex;
            justify-content: space-between;
            .time {
              color: #aeaeae;
            }
          }
        }
        .add-btn {
          background-color: #edf5fd;
          text-align: center;
          border: 1px dashed #95c6ff;
          border-radius: 4px;
          margin-top: 5px;
          margin-bottom: 10px;
        }
      }
    }
  }
}
</style>
