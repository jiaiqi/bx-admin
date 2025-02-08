<template>
  <div class="list-page-wrap">
    <el-alert
      v-if="moreConfig && moreConfig.hasOwnProperty('pagePrompt')"
      :title="moreConfig.pagePrompt.title ? moreConfig.pagePrompt.title : ''"
      :closable="false"
      :type="
        moreConfig.pagePrompt.type ? moreConfig.pagePrompt.type : 'warning'
      "
    >
      <slot>
        <div v-html="moreConfig.pagePrompt.description">
          {{ moreConfig.pagePrompt.description }}
        </div>
      </slot>
    </el-alert>
    <filterTabs
      :$srvApp="$srvApp"
      ref="filterTabs"
      v-if="tabs.length > 0 && cols.length > 0"
      :tabs="tabs"
      :srv="getService()"
      :cols="cols"
      :default-condition="getDefaultConditions"
      :main-data="listMainFormDatas"
      @on-input-value="onFilterChange"
      @on-change="getTableDatas"
    ></filterTabs>
    <el-row
      :gutter="20"
      v-if="statsData.length > 0"
      style="border: 1px solid #f2f2f2; padding: 5px; margin: 0"
    >
      <div class="stata-data-layout">
        <div
          v-for="(sum, index) in statsData"
          :key="index"
          class="text-center stata-data-item"
        >
          <div
            class="grid-content bg-purple"
            style="font-size: 1.1rem; color: #409eff"
          >
            {{ sum.label }}
            <el-tooltip
              popper-class="retail-poper"
              effect="dark"
              v-if="sum.tip"
              :content="sum.tip"
              placement="right"
            >
              <i class="el-icon-question" style="color: #525252"></i>
            </el-tooltip>
          </div>
          <div class="grid-content bg-purple">
            {{ sum.unit ? sum.unit : "" }}{{ sum.value
            }}{{ sum.suffix ? sum.suffix : "" }}
          </div>
        </div>
      </div>
    </el-row>
    <div class="list-page-content">
      <template>
        <treegrid
          ref="list"
          v-if="routeName === 'treegrid' && isTreeReal && storageType === 'db'"
          :list-type="getListType"
          :storage-type="storageType"
          :service="getService()"
          :default-condition="getDefaultConditions"
          :relationCondition="relationCondition"
          :memInitdatasAdd="memInitdatasAdd"
        >
        </treegrid>
        <list
          ref="list"
          :route-meta="meta"
          :$srvApp="$srvApp"
          :list-type="getListType"
          :storage-type="storageType"
          :service="getService()"
          @more-config-loaded="moreConfigLoaded"
          :default-condition="getDefaultConditions"
          :relationCondition="relationCondition"
          :inplace-edit="inplaceEdit"
          :default-inplace-edit-mode="defaultInplaceEditMode"
          :default-dirty-flags="defaultDirtyFlags"
          :childforeignvalue="childforeignvalue"
          :name="listName"
          :childForeignkey="foreignKey"
          :childforeignkey="foreignKey"
          :listMainFormDatas="listMainFormDatas"
          :mainService="mainService"
          :def-data-para="defDataPara"
          :readOnly="readOnly"
          @stats-data-load="statsLoaded"
          :memInitdatasAdd="memInitdatasAdd"
          @v2-loaded-isDraft="v2LoadedIsDraft($event)"
          @child-loaded="$emit('child-loaded', $event)"
          @list-loaded="$emit('list-loaded', $event)"
          @inline-list-loaded="$emit('inline-list-loaded', $event)"
          @add-form-loaded="$emit('add-form-loaded', $event)"
          @update-form-loaded="$emit('update-form-loaded', $event)"
          @duplicate-form-loaded="$emit('duplicate-form-loaded', $event)"
          @filter-form-loaded="$emit('filter-form-loaded', $event)"
          @list-data-loaded="listDataLoaded"
          @grid-data-changed="$emit('grid-data-changed', $event)"
          @standby-row-added="$emit('standby-row-added', $event)"
          v-else
        >
        </list>
      </template>
    </div>
  </div>
</template>
<script>
import SimpleAdd from "@/components/common/simple-add.vue";
import SimpleUpdate from "@/components/common/simple-update.vue";
// import List from "./components/list.vue";
import List from "@/components/common/list.vue";
import Treegrid from "@/components/common/treegrid.vue";
// 表头的筛选过滤条件 2020 版
import filterTabs from "@/components/common/filter-tabs.vue";
import cloneDeep from "lodash/cloneDeep";
import isEqual from "lodash/isEqual";
/**
 * concepts:
 * row: 一行页面元素，包含多个section;
 * section:  包含多个标签 tab;
 * tab: 标签， 包含标签文字和个数统计；
 */
export default {
  name: "TabList",
  components: {
    Treegrid,
    SimpleUpdate,
    SimpleAdd,
    List,
    filterTabs,
  },

  mixins: [],

  data() {
    return {
      isDraft: false,
      tabs: [],
      cols: [],
      sections: [],
      tabsBuild: false,
      isDefault: null,
      relationCondition: {},
      onInputValue: false, // 是否有查询条件,
      moreConfig: null,
      statsData: [],
      tableData: [],
    };
  },

  props: {
    service: {
      type: String,
    },
    foreignKey: {
      type: Object,
    },
    isTree: {
      type: Boolean,
      default: false,
    },
    defaultCondition: {
      type: Array,
      default: function () {
        return [];
      },
    },
    tabListType: String,
    listName: String,
    childforeignvalue: [String, Number, Object],
    listMainFormDatas: [Array, Object],
    mainService: String,
    readOnly: Boolean,
    searchForm: {
      type: Boolean,
      default: function () {
        return true;
      },
    },

    storageType: {
      type: String,
      default: "db",
    },

    inplaceEdit: {
      type: Boolean,
      default: false,
    },

    defaultInplaceEditMode: {
      type: Boolean,
      default: false,
    },

    defaultDirtyFlags: {
      type: String,
      default: "pristine",
    },
    defDataPara: {
      type: Object,
      default: function () {
        return {};
      },
    },
    memInitdatasAdd: Array,
  },

  computed: {
    meta() {
      return this.$route?.meta;
    },
    routeName() {
      return this.$route?.name;
    },
    isTreeReal: function () {
      if (this.$route.meta?.isTree === true) {
        return true;
      }
      if (this.$route?.path?.indexOf("treegrid") > 0) {
        return true;
      }
      return this.isTree;
    },

    getListType: function () {
      if (this.tabListType) {
        return this.tabListType;
      } else if (this.isTreeReal) {
        return "treelist";
      } else {
        return "list";
      }
    },
    rows: function () {
      let rows = [];
      let activeRow = { sections: [] };
      for (let section of this.sections) {
        let tabsDatab = section.tabs;
        for (let j = 0; j < tabsDatab.length; j++) {
          // section.tabs[j]['isActive'] = false
        }
        if (section.section_newline === "是") {
          if (activeRow.sections.length > 0) {
            rows.push(activeRow);
          }
          activeRow = { sections: [] };
        }

        activeRow.sections.push(section);
      }

      if (activeRow.sections.length > 0) {
        rows.push(activeRow);
      }

      return rows;
    },

    gridData: function () {
      return this.$refs.list.gridData;
    },

    getDefaultConditions: function () {
      let conditions = [];
      for (let section of this.sections) {
        for (let tab of section.tabs) {
          if (tab.isActive && tab.conditions) {
            tab.conditions.forEach((item) => conditions.push(item));
          }
        }
      }
      if (this.defaultCondition?.length) {
        conditions.push(...this.defaultCondition);
      }
      return conditions;
    },
  },

  methods: {
    listDataLoaded(event) {
      this.$emit("list-data-loaded", event);
      console.log("listDataLoaded", event.gridData);
      if (!isEqual(cloneDeep(event.gridData), cloneDeep(this.tableData))) {
        this.$refs.filterTabs?.refreshRelatedTabOptions?.();
      }
      this.tableData = cloneDeep(event.gridData);
    },
    statsLoaded(e) {
      // console.log('statsLoaded',e)
      let stataList = this.$refs.list.buildStatsData(e);
      //  console.log('statsLoaded',stataList)
      this.statsData = stataList;
    },
    onFilterChange(e) {
      this.onInputValue = e;
      if (e) {
        let tabsConds = this.$refs.filterTabs?.buildConditions();
        this.relationCondition = tabsConds;
      }
    },
    moreConfigLoaded(e) {
      // console.log('moreConfigLoaded',e)
      this.moreConfig = e;
    },
    onReset() {
      this.$refs.filterTabs.onReset();
    },
    v2LoadedIsDraft(e) {
      // console.log('v2LoadedIsDraft',e)
      this.isDraft = e.isDraft;
    },
    getTableDatas() {
      let self = this;
      let tabsConds = this.$refs?.filterTabs?.buildConditions();
      this.relationCondition = tabsConds;
      console.log("tabsConds", tabsConds);

      setTimeout(function () {
        self.$refs.list.loadTableData();
      }, 100);
    },
    sectionVisible(section) {
      let dependSectionNames = section.depend_sections;
      if (Array.isArray(dependSectionNames) && dependSectionNames.length > 0) {
        if (section.depend_display === true) {
          return true;
        }

        // if any depend section has be selected, show itself
        return (
          dependSectionNames.filter((dependSectionName) => {
            let tmp = this.sections.filter(
              (section) => section.list_tab_no === dependSectionName
            );
            if (tmp && tmp.length > 0) {
              let dependSection = tmp[0];
              if (dependSection.tabs) {
                let dependHasValue =
                  dependSection.tabs.filter(
                    (tab) => tab.isActive && tab.label !== "不限"
                  ).length > 0;
                return dependHasValue;
              }

              return false;
            } else {
              return false;
            }
          }).length > 0
        );
      } else {
        return true;
      }
    },

    getDisplay: function (index) {
      return index === 1 ? "inline-block" : "block";
    },

    getButtonColor: function (tab, invert) {
      let flag = tab.isActive;
      if (invert) {
        flag = !flag;
      }
      return flag ? "orange" : "#00B0F0";
    },

    isMem: function () {
      let list = this.$refs.list;
      return list.isMem();
    },

    buildExecutors4Edit: function () {
      let list = this.$refs.list;
      return list.buildExecutors4Edit();
    },

    getService: function () {
      return this.service || this.$route.params.service_name;
    },

    onListDataLoaded: function (tab, list) {
      if (!tab.hasOwnProperty("totalCount")) {
        this.$set(tab, "totalCount", list.gridPage.total);
      }
    },

    activateTab: function (section, tab) {
      if (section && section.tabs) {
        section.tabs
          .filter((item) => item !== tab)
          .forEach((item) => this.$set(item, "isActive", false));
      }
      this.$set(tab, "isActive", !tab.isActive);
      let hasSelection = section.tabs.find(
        (item) => item.label !== "不限" && item.isActive
      );
      this.$nextTick((_) => {
        // find affected group sections and rebuild them
        this.sections
          .filter(
            (section2) =>
              section2.section_type === "groupby" &&
              section2.depend_sections &&
              section2.depend_sections.indexOf(section.list_tab_no) >= 0
          )
          .forEach((section2) => {
            if (hasSelection || section2.depend_display === true) {
              this.buildGroupSection(section2);
            } else {
              section2.tabs = [];
            }
          });

        this.$refs.list.loadTableData();
      });
    },

    shouldLoadList: function (tab) {
      return !!this.loadTabs[tab.label];
    },

    getButtonCount: function (tab) {
      if (tab.totalCount && tab.totalCount > 0) {
        return `(${tab.totalCount})`;
      } else {
        return "";
      }
    },

    buildGroupSection: function (section) {
      try {
        let group = eval(section.section_groups);
        let colName = group[0].colName;

        let conditions = [];
        let page = null;
        let orders = null;

        (section.depend_sections || []).forEach((dependSectionName) => {
          let dependSection = this.sections.find(
            (sec) => sec.list_tab_no === dependSectionName
          );
          if (!dependSection) {
            return;
          }

          if (dependSection.section_type === "groupby") {
            let groupByCol = eval(dependSection.section_groups).find(
              (ele) => ele.type === "by"
            ).colName;
            let activeTab = dependSection.tabs.find(
              (tab) => tab.isActive && tab.label !== "不限"
            );
            if (activeTab) {
              let condition = {
                colName: groupByCol,
                ruleType: "eq",
                value: activeTab.label,
              };
              conditions.push(condition);
            }
          } else {
            // TODO: should be concrete
          }
        });

        return this.select(
          this.getService(),
          conditions,
          page,
          orders,
          group
        ).then((response) => {
          section.tabs = [];

          // add unfilter tab,
          let unfilterTab = {
            label: "不限",
            conditions: [],
          };

          this.addTab(section, unfilterTab);

          // add returned group tabs
          let data = response.data.data;
          for (let item of data) {
            if (item.group_count == 0) {
              continue;
            }

            let conditions = [
              {
                colName,
                ruleType: "eq",
                value: item[colName],
              },
            ];

            let tab = {
              label: item[colName],
              default_selected_expr: section.default_selected_expr,
              conditions: conditions,
              totalCount: item.group_count,
              isActive: false,
            };

            this.addTab(section, tab);
          }
        });
      } catch (e) {}
    },

    addTab: function (activeSection, tab) {
      activeSection.tabs.push(tab);
    },

    buildSections: function (tabs) {
      // generate tab.condition, order, depend_sections from json string to js object/array
      const colsMap = this.cols.reduce((res, cur) => {
        res[cur.columns] = { ...cur };
        return res;
      }, {});
      let self = this;
      let tab = {};
      let tabsData = [];
      tabs.forEach((t) => {
        tab = {
          service: null,
          table_name: null,
          orders: null,
          conditions: null,
          seq: null,
          parent: null,
          label: null,
          list_tab_no: null,
          more_config: null,
          inputType: null,
        };
        let mc = JSON.parse(t.more_config);
        tab.more_config = mc;
        tab.service = t.service;
        tab.table_name = t.table_name;
        tab.conditions = t.conditions;
        tab.orders = t.orders;
        tab.default = mc.default;
        tab.seq = t.seq;
        tab.label = t.label;
        tab.list_tab_no = t.list_tab_no;
        tab._data = t;
        tab._options = [];
        tab._type = mc.type || null;
        tab.option_list =
          mc.option_list || colsMap?.[mc.colName]?.option_list_v2 || null;
        tab._colName = mc.colName || null;
        tab.inputType = mc.inputType || null;
        tab.showAllTag = mc.showAllTag || false;
        (tab.default = mc.default || ""),
          (tab.placeholder = mc.placeholder || "请输入...");
        tab.remoteMethod = "";

        if (tab._colName) {
          tab._colName = tab._colName.split(",");
          let cols = tab._colName;
          let srvCols = self.cols;
          tab["_colSrvData"] = [];
          // console.log("tab",tab)
          for (let c = 0; c < cols.length; c++) {
            for (let cs = 0; cs < srvCols.length; cs++) {
              if (cols[c] === srvCols[cs].columns) {
                tab._colSrvData.push(srvCols[cs]);
              }
            }
          }
        }
        if (
          tab.inputType == "fk" &&
          tab.option_list &&
          tab.option_list.serviceName
        ) {
          let cond = [
            {
              colName: tab.option_list.key_disp_col,
              ruleType: "[like]",
              value: "",
            },
          ];
          let options = [];
          self
            .select(
              tab.option_list.serviceName,
              cond,
              null,
              null,
              null,
              null,
              null,
              null,
              null,
              null,
              false
            )
            .then((res) => {
              let resData = res.data.data;
              for (let i = 0; i < resData.length; i++) {
                let item = resData[i];
                let opt = {
                  value: item[tab.option_list.refed_col],
                  label: item[tab.option_list.key_disp_col],
                };
                options.push(opt);
              }

              // self.formModel[e.list_tab_no]['options'] = options
              tab["_options"] = options;
              tab["page"] = res.data.page;
              // return options
              console.log("options", options);
              //  resolve(options)
            });
        }
        tabsData.push(tab);
      });

      if (!self.tabsBuild) {
        self.tabs = tabsData;
        self.tabsBuild = true;
      }

      // tabs.forEach(tab => {
      //   tab.seq = tab.seq || 0
      //   if (tab.conditions) {
      //     try {
      //       tab.conditions = eval(tab.conditions)
      //     } catch (e) {

      //       tab.conditions = [];
      //     }
      //   }
      //   if (tab.orders) {
      //     try {
      //       tab.orders = eval(tab.orders)
      //     } catch (e) {

      //       tab.orders = [];
      //     }
      //   }

      //   if (tab.depend_sections) {
      //     try {
      //       let dependConf = eval("(" + tab.depend_sections + ")");
      //       tab.depend_sections = dependConf.sections;
      //       tab.depend_display = dependConf.display;
      //     } catch (e) {

      //       tab.depend_sections = [];
      //     }
      //   }
      // })

      // create sections in seq order
      // tabs = _.sortBy(tabs, tab => tab.seq)
      // let activeSection = null
      // for (let tab of tabs) {
      //   if (tab.section) {
      //     activeSection = _.clone(tab);
      //     this.sections.push(activeSection)
      //     this.$set(activeSection, "tabs", [])

      //     // add unfilter tab,
      //     let unfilterTab = {
      //       label: "不限",
      //       conditions: [],
      //     }

      //     this.addTab(activeSection, unfilterTab);

      //     if (tab.section_type === "concrete") {
      //       this.addTab(activeSection, tab);
      //     }
      //   } else {
      //     this.addTab(activeSection, tab);
      //   }
      // }

      // // materialize group by sections
      // let promises = this.sections
      //   .filter(section => {
      //     let isGroupBy = section.section_type === "groupby";
      //     let alwaysDisplay = section.depend_display === true;
      //     let hasNoDependSections = !section.depend_sections || section.depend_sections.length == 0;
      //     return (isGroupBy && (alwaysDisplay || hasNoDependSections))
      //   })
      //   .map(section => this.buildGroupSection(section));

      // Promise.all(promises)
      //   .then(() => {
      //     // activate default tabs
      //     this.sections.forEach(section => {
      //       section.tabs.forEach(tab => {
      //         if (tab.label !== "不限" ) {
      //         // if (tab.label !== "不限" && tab.default_selected_expr) {
      //           /**
      //            * 增加默认配置
      //            */
      //           let moreCfg = JSON.parse(section.more_config)
      //           if(section.more_config !== undefined && section.more_config!== null){
      //             if(moreCfg.hasOwnProperty('default') && section.hasOwnProperty('tabs')){

      //               let defaultCondition = moreCfg.default
      //               if(tab.conditions[0].value === defaultCondition.value){
      //                 // tab['isActive'] = true

      //                   this.activateTab(section, tab);
      //               }

      //             }
      //           }
      //         }
      //         if (tab.label !== "不限" && tab.default_selected_expr) {
      //           let isActive = eval(tab.default_selected_expr);
      //           if (isActive === true) {
      //             this.activateTab(section, tab);
      //           }
      //         }
      //       })
      //     });
      //   })
    },
  },

  mounted: function () {
    window.tabs = this;
    let self = this;
    this.loadColsV2(this.getService(), this.getListType).then((response) => {
      if (
        response &&
        response.data &&
        response.data.data &&
        response.data.data.tabs
      ) {
        let tabs = response.data.data.tabs;
        this.cols = response.data.data.srv_cols;
        if (!tabs || tabs.length == 0) {
          return;
        }
        this.buildSections(tabs);
        //
      } else {
      }
    });
  },
  watch: {
    isDefault: {
      deep: true,
      immediate: true,
      handler: function (val, oldVal) {
        if (val) {
        }
      },
    },
  },
};
</script>
<style lang="scss" scoped>
.list-page-wrap {
  display: flex;
  height: 100%;
  max-height: 100vh;
  flex-direction: column;
  .list-page-content {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    ::v-deep .list-comp-wrap {
      height: 100%;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      .table-list-row {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }
    }
  }
}
.stata-data-layout {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-around;

  .stata-data-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    div {
      padding: 0.5rem;
      white-space: nowrap;
    }
  }
}
</style>
