<template>
  <div>
    <div class="statistic-box" v-if="stasticData.length">
      <div class="statistic-item" v-for="item in stasticData">
        <div class="label">{{ item.label }}</div>
        <div class="value">{{ item.value || '0' }}
          <span v-if="v2Data && v2Data.cfgJson && v2Data.cfgJson.statistics_card_col_unit">{{
            v2Data.cfgJson.statistics_card_col_unit }}</span>
        </div>
      </div>
    </div>

    <!-- 卡片列表 -->
    <div class="bx-card-list" v-if="listType == '卡片'">
      <cardGroupCell :pageParamsModel="pageParamsModel" :queryOptions="queryOptions" v-if="pageItem && listType == '卡片'"
        ref="cardGroupCell" :pageItem="pageItem" :cellsLayout="[cardUnitJson]" :cellData="tableData"
        :comColMap="comColMapJson" :cardLayout="layoutJson" :rowButtons="listV2RowButtons" @on-click-cell="onClickCell"
        @on-click-block="onClickBlock" @on-row-button-click="onRowButtonClick" @on-click-icon="onClickBlock" @setPageParams="setPageParams">
      </cardGroupCell>
    </div>
    <!-- 表格 -->
    <div class="bx-table" v-else>
      <div class="table-head">
        <div class="table-column" v-for="col in tableColumn">
          {{ col.label }}
        </div>
      </div>
      <div class="table-row" v-for="item in tableData" :class="{ stripe: striped }">
        <div class="table-column" v-for="col in tableColumn">
          {{ formatValue(item, col) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { $http } from "@/pages/datav/common/http.js";
import cardGroupCell from "@/pages/datav/component/page-item/card-group-cell/card-group-cell.vue"

export default {
  name: "data-view-list",
  components: {
    cardGroupCell,
  },
  props: {
    pageItem: {
      type: Object,
    },
    queryOptions: {
      type: Object,
    },
    readOnly: {
      type: Boolean,
      default: false,
    },
    pageParamsModel:{
      type: Object,
    }
  },
  data() {
    return {
      stasticData: [],
      v2Data: null,
      tableData: [],
    }
  },
  computed: {
    listConfig() {
      return this.pageItem?.list_json || {}
    },
    listType() {
      return this.listConfig.list_type || '表格'
    },
    listOptions() {
      return this.listConfig.list_options || {}
    },
    tableColumn() {
      let cols = this.v2Data?.srv_cols || [];
      cols = cols.filter((item) => item.in_list === 1);
      return cols.slice(0, 6);
    },
    striped() {
      return this.listConfig?.list_options?.indexOf('斑马纹') != -1
    },
    carousel() {
      return this.listConfig?.list_options?.includes('滚动')
    },
    config() {
      let res = {
        header: [],
        data: []
      }
      if (this.tableColumn?.length) {
        res.header = this.tableColumn.map(item => item.label)
        if (this.tableData?.length) {
          res.data = this.tableData.map(item => {
            let val = []
            this.tableColumn.forEach(col => {
              val.push(item[col.columns])
            })
            return val
          })
        }
      }
      return res
    },
    layoutJson: function () {
      let json = this.listConfig?.layout_json || null
      return json
    },
    cardUnitJson: function () {
      let json = this.listConfig?.card_unit_json || null
      return json
    },
    comColMap: function () {
      let json = this.pageItem?.cols_map_json || null
      console.log('comColMap', this.tableLayoutType, json)
      return json
    },
    comColMapJson: function () {
      let json = this.pageItem?.cols_map_json?.cols_map_json || null
      return json
    },
    listV2RowButtons() {
      let buttons = this.v2Data?.rowButton?.filter(item => item.permission) || []
      if (this.readOnly) {
        //只读列表指控功能按钮
        buttons = []
      }
      return buttons
    },
    listV2GridButtons() {
      let buttons = this.v2Data?.gridButton?.filter(item => item.permission) || []
      if (this.readOnly) {
        //只读列表指控功能按钮
        buttons = []
      }
      return buttons
    },
    colsMapDetailJson(){
      // 组件参数 的map array  接口返回数据格式 无法确定接口时啥样子，小程序 逻辑使用com_para_with_map_json 但没值，改用有值的 page_com_cols_map_json
      let pageComColsMapJson = this.pageItem.page_com_cols_map_json || null
      let colsMapDetailJson = null
      if(pageComColsMapJson){
        // 识别、处理组件到页面参数联动
          if(pageComColsMapJson.cols_map_detail_json && Array.isArray(pageComColsMapJson.cols_map_detail_json)){
            colsMapDetailJson = pageComColsMapJson.cols_map_detail_json
            console.log('colsMapDetailJson',colsMapDetailJson)
          }

      }
      return colsMapDetailJson

    },
  },
  methods: {
    // 透传参数
    setPageParams(key,val){
      // 接受透传参数
      this.$emit('setPageParams', key,val)
    },
    
    async getListData(req) {
      const url = `/${req.mapp}/select/${req.serviceName}`;
      const res = await $http.post(url, req);
      if (res.data.state === "SUCCESS") {
        this.tableData = res.data.data;
      }
    },
    async getV2Data(srvCfg) {
      const url = `/${srvCfg.mapp}/select/srvsys_service_columnex_v2_select?colsel_v2=${srvCfg.serviceName}`;
      const req = {
        serviceName: "srvsys_service_columnex_v2_select",
        colNames: ["*"],
        condition: [
          {
            colName: "service_name",
            ruleType: "eq",
            value: srvCfg.serviceName,
          },
          { colName: "use_type", ruleType: "eq", value: "list" },
        ],
        order: [{ colName: "seq", orderType: "asc" }],
      };
      const res = await $http.post(url, req);
      if (res?.data?.state === "SUCCESS") {
        if (res.data.data?.cfg_json) {
          try {
            res.data.data.cfgJson = JSON.parse(res.data.data.cfg_json)
          } catch (error) {

          }
        }
        this.v2Data = res.data.data;
      }
    },
    async getStatisticData(req) {
      const colName = this.v2Data?.cfgJson?.statistics_card_col
      const col = this.v2Data?.srv_cols.find(item => item.columns === colName)
      if (col && col.col_type === 'Enum') {
        const group = [
          {
            "colName": colName,
            "type": "by"
          },
          {
            "colName": colName,
            "type": "count",
            'aliasName': 'count'
          }
        ]
        req.condition = req.condition || []
        req.condition.push({
          colName,
          ruleType: 'notnull',
          value: null
        })
        const url = `/${req.mapp}/select/${req.serviceName}`;
        req.group = group
        const res = await $http.post(url, req);
        if (res.data.state === "SUCCESS") {
          if (Array.isArray(res.data.data) && res.data.data.length > 0) {
            this.stasticData = []
            res.data.data.forEach(item => {
              item.label = item[colName]
              item.value = item.count
              this.stasticData.push(item)
            })
          }
        }
      }
    },
    formatValue(row, col) {
      let res = row[col.columns]

      return res
    },
    onClickBlock(e){
      console.log(e)
    },
    onRowButtonClick(e){
      console.log(e)
    },
    onClickCell(e){
      console.log(e)
    },
    buildRequestParams(e){
      // console.log('请求参数====>',e)
      let condition = this.bxDeepClone(e.condition) 
      let mapsJonss = this.colsMapDetailJson || []
      
      if(Array.isArray(condition)){
        for(let cond of condition){
          console.log('buildRequestParams',cond.colName, cond.value)
          if(cond.value && cond.value.startsWith("${") && cond.value.endsWith("}")){
            // console.log('2',cond.value)
            let par =  cond.value.replace("${", "");
            
            par = par.replace("}", "");
            let params = this.bxDeepClone(this.pageParamsModel);
            if(params && Object.keys(params).length > 0){

              for(let key in params){
                // console.log('key',key,par)
                if(key === par){
                  let mapsCol = mapsJonss.filter(item => item.col_to === par || item.col_from === par)
                  if(Array.isArray(mapsCol) && mapsCol.length > 0){
                      let value = ''
                      let model = null
                      for(let col of mapsCol){
                         switch (col.from_type) {
                          case '页面':
                            model = this.pageParamsModel
                            switch (col.to_type) {
                              case '组件':
                                // console.log('组件',key,this.pageParamsModel)
                                cond.value = this.pageParamsModel[key].value
                                // this.$set(cond,'value',this.pageParamsModel[key].value)
                                break;
                              case '页面':
                                
                                break;
                            
                              default:
                                break;
                            }
                            break;
                          case '组件':
                            switch (col.to_type) {
                              case '组件':
                                
                                break;
                              case '页面':
                                
                                break;
                            
                              default:
                                break;
                            }
                            break;
                         
                          default:
                            break;
                         }
                      }
                  }
                }
              }
            }
           
          }
        }
      }
      e.condition = this.bxDeepClone(condition) 
      // console.log(e.serviceName,condition)
      return e
    },
    paramsLinkage(){
        let itemReqJson = this.pageItem.srv_req_json ? this.bxDeepClone(this.pageItem.srv_req_json) : null;

          const req =  itemReqJson ? this.buildRequestParams(itemReqJson) : itemReqJson
          // console.log('列表请求',req,req.serviceName)
          let mapsJonss = this.colsMapDetailJson || []
          if(Array.isArray(mapsJonss)){
            for(let p of mapsJonss){
              if(p.from_type === '页面' && p.trigger_time === '联动'){
                this.getListData(req);
              }
            }
          }
          
    }
  },
  mounted() {
    if (this.pageItem?.srv_req_json) {
      let itemReqJson = this.pageItem.srv_req_json ? this.bxDeepClone(this.pageItem.srv_req_json) : null;
      const req =  itemReqJson ? this.buildRequestParams(itemReqJson) : itemReqJson
      console.log('列表请求',req)
      
      this.getListData(req);
      this.getV2Data(req).then(_ => {
        this.getStatisticData(req)
      });
    }
  },
  watch:{
    "pageParamsModel": {
        deep: true,
        immediate: true,
        handler: function(newVal, oldVal) {
          // console.log('componentParamsModelsRun',this.deepClone(newVal).current_value,this.deepClone(oldVal).current_value)
          // 选中数据更新后 进行参数更新输出逻辑
          // let pageParams = this.colsMapDetailJson
           this.paramsLinkage()
        }
      },
  }

}

</script>



<style lang="scss" scoped>
.bx-table {
  .table-head {
    background-color: rgba($color: #fff, $alpha: 0.1);
  }

  .table-head,
  .table-row {
    display: flex;

    &.stripe {
      &:nth-child(2n+1) {
        background-color: rgba($color: #fff, $alpha: 0.1);
      }
    }

    .table-column {
      flex: 1;
      padding: 8px;
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
    }
  }
}

.statistic-box {
  display: flex;
  padding: 10px;

  .statistic-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 10px;
    background-color: #1E2750;
    margin-right: 20px;
    cursor: pointer;
    min-width: calc(20% - 80px/5);

    &:last-child {
      margin: 0;
    }

    .label {
      line-height: 30px;
      color: #6BA1FF;
      text-align: left;
    }

    .value {
      text-align: left;

    }
  }
}
</style>

