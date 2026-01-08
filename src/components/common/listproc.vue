  <template v-if="listV2Data">
    <!-- <el-tabs
      v-model="activeName"
      @tab-click="handleClick(activeName)"
      v-if="!procTabs || !procTabs.length"
    >
      <el-tab-pane
        :label="waitNum"
        name="wait"
      >
        <list
          ref="wait"
          list-type="wait"
          name="wait"
          :service="service_name"
          @gridData-change="setTip"
          @list-loaded="timerRefresh"
        > </list>
      </el-tab-pane>


      <el-tab-pane
        :label="ccNum"
        name="cc"
        v-if="showCcTab"
      >
        <list
          ref="cc"
          list-type="cc"
          name="cc"
          :service="service_name"
          @gridData-change="setTip"
          @list-loaded="timerRefresh"
        > </list>
      </el-tab-pane>


      <el-tab-pane
        :label="myallNum"
        name="myall"
      >

        <list
          ref="myall"
          list-type="myall"
          name="myall"
          :service="service_name"
          @gridData-change="setTip"
          @list-loaded="timerRefresh"
        > </list>

      </el-tab-pane>
      <el-tab-pane
        :label="mineNum"
        name="mine"
      >

        <list
          ref="mine"
          list-type="mine"
          name="mine"
          :service="service_name"
          @gridData-change="setTip"
          @list-loaded="timerRefresh"
        > </list>

      </el-tab-pane>
      <el-tab-pane
        :label="processedNum"
        name="processed"
      >

        <list
          ref="processed"
          list-type="processed"
          name="processed"
          :service="service_name"
          @gridData-change="setTip"
          @list-loaded="timerRefresh"
        > </list>

      </el-tab-pane>

      <el-tab-pane
        :label="allNum"
        name="userall"
      >

        <list
          ref="userall"
          list-type="userall"
          name="userall"
          :service="service_name"
          @gridData-change="setTip"
          @list-loaded="timerRefresh"
        > </list>

      </el-tab-pane>

    </el-tabs> -->
    <el-tabs
      v-model="activeName"
      class="list-proc-wrap"
      @tab-click="handleClick(activeName)"
    >
      <template v-for="item in setTabs">
        <el-tab-pane
          :label="item.finallyLabel || item.label"
          :name="item.key"
          :key="item.key"
          v-show="item.show && activeName == item.key"
          v-if="item.hide !== true"
        >
          <list
            :ref="item.key"
            :list-type="item.key"
            :name="item.key"
            :service="service_name"
            :default-condition="defaultCondition"
            @gridData-change="setTip"
            @list-loaded="timerRefresh"
          > </list>
        </el-tab-pane>
      </template>
    </el-tabs>
  </template>

<script>
import list from "./list";

export default {
  components: {
    list
  },
  data() {
    return {
      service_name: null,
      activeName: "wait",
      processedNum: "",
      mineNum: "",
      myallNum: "",
      waitNum: "",
      allNum: "",
      ccNum: '',
      procTabs: [],
      listV2Data: null
    };
  },
  props: {
    service: {
      type: String,
      default: ''
    },
    defaultCondition: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    showCcTab() {
      let config = sessionStorage.getItem('pages_attribute')
      let is = false
      try {
        config = JSON.parse(config)
        if (config.hasOwnProperty('show_cc_tab') !== -1 && config['show_cc_tab'] == '是') {
          is = true
        }
      } catch (error) {

      }
      return is
    },
    setTabs() {
      if (Array.isArray(this.procTabs) && this.procTabs.length) {
        return this.procTabs;
      } else {
        return [
          {
            key: 'wait',
            label: '待我处理',
            finallyLabel: this.waitNum || '待我处理',
            show: true
          },
          {
            key: 'cc',
            label: '抄送给我',
            finallyLabel: this.ccNum || '抄送给我',
            show: this.showCcTab,
            hide: !this.showCcTab
          },
          {
            key: 'myall',
            label: '我的全部',
            finallyLabel: this.myallNum || '我的全部',
            show: true
          },
          {
            key: 'mine',
            label: '我的申请',
            finallyLabel: this.mineNum || '我的申请',
            show: true
          },
          {
            key: 'processed',
            label: '我已处理',
            finallyLabel: this.processedNum || '我已处理',
            show: true
          },
          {
            key: 'userall',
            label: '全部',
            finallyLabel: this.allNum || '全部',
            show: this.allNum && this.allNum > 0 ? true : false,
          }
        ]
      }
    },
  },
  created() {
    if (this.service) {
      this.service_name = this.service;
    } else if (this.$route.params.service_name) {
      this.service_name = this.$route.params.service_name;
    }
    if (this.service_name) {
      this.getServiceV2()
    }
  },
  methods: {
    async getServiceV2() {
      const resp = await this.loadColsV2(this.service_name, 'proclist', null, null, null)
      if (resp?.data?.state === 'SUCCESS') {
        this.listV2Data = resp?.data.data
        // 服务端返回tabs配置
        if (this.listV2Data?.proc_tabs) {
          this.procTabs = this.listV2Data.proc_tabs.map(item => {
            item.show = true
            return item
          })
        }
      } else if (resp?.data?.resultMessage) {
        this.$message.error(resp?.data?.resultMessage)
      } else {
        this.$message.error('获取列表元数据失败！')
      }
    },
    handleClick(activeName) {
      // timerRefresh()
      this.$refs[activeName]?.loadTableData?.()
    },
    timerRefresh(listCom) {
      if (top.pathConfig && top.pathConfig.pages_attribute && top.pathConfig.pages_attribute.proc_page_refresh_time) {
        var timer = parseInt(top.pathConfig.pages_attribute.proc_page_refresh_time)
        setInterval(() => {
          listCom.loadTableData();
        }, timer * 1000);
      }
    },
    setTip(gridData, listProcType) {
      if (gridData.page) {
        if (Array.isArray(this.procTabs) && this.procTabs.length) {
          this.procTabs = this.procTabs.map(item => {
            if (item.key == listProcType) {
              item.finallyLabel = `${item.label}(${gridData.page.total})`
            }
            return item
          })
        }
        if (listProcType == "mine") {
          //this.mineNum = gridData.page.total;
          this.mineNum = "我的申请(" + gridData.page.total + ")";
        } else if (listProcType == "wait") {
          //this.waitNum = gridData.page.total;
          this.waitNum = " 待我处理(" + gridData.page.total + ")";
        } else if (listProcType == "processed") {
          //this.processedNum = gridData.page.total;
          this.processedNum = " 我已处理(" + gridData.page.total + ")";
        } else if (listProcType == "myall") {
          this.myallNum = " 我的全部(" + gridData.page.total + ")";
          //this.myallNum = gridData.page.total;
        } else if (listProcType == "userall") {
          if (gridData.page.total > 0) {
            this.allNum = " 全部(" + gridData.page.total + ")";
          }
          //this.myallNum = gridData.page.total;
        } else if (listProcType == "cc") {
          this.ccNum = "抄送给我(" + gridData.page.total + ")";
          if (gridData.page.total > 0) {
            this.ccNum = " 抄送给我(" + gridData.page.total + ")";
          }
          //this.myallNum = gridData.page.total;
        }
      }

    }
  }
};
</script>
<style scoped lang="scss">
 ::v-deep.list-proc-wrap {
  height: 100%;
  display: flex;
  flex-direction: column;
  &.el-tabs {
      height: 100%;
      .el-tabs__content{
        flex: 1;
        .el-tab-pane{
          height: 100%;
          .list-comp-wrap{
            height: 100%;
            display: flex;
            flex-direction: column;
            .row-bg{
              flex-wrap: wrap;
            }
            .table-list-wrap{
              flex: 1;
            }
          }
        }
      }
    }
  
}
</style>
