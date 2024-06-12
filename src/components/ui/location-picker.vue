<template>
  <div>
    <el-popover v-model="visible" ref="popover" placement="right" width="400" :disabled="disabled" @show="show"
      @hide="hide">
      <div>
        <iframe id="mapPage" width="375px" height="667px" frameborder="0"
          src="https://mapapi.qq.com/web/mapComponents/locationPicker/v/index.html?search=1&type=1&key=G3VBZ-CKMKB-4CFUZ-JZLSE-676K6-J4FWP&referer=bx-data-v">
        </iframe>
        <div class="header">
          <el-button type="primary" @click="confirm" :disabled="curSelect === null">确定</el-button>
        </div>
      </div>
      <el-input :value="valueDisp" slot="reference" :disabled="disabled" @click="visible = true"
        suffix-icon="el-icon-location"></el-input>
      <!-- <div slot="reference" style="display: flex; align-items: center">
        <div style="flex: 1">
          <el-input :value="valueDisp"  suffix-icon="el-icon-location"></el-input>
        </div>
      </div> -->
    </el-popover>
  </div>
</template>

<script>
import { Message as $message } from 'element-ui';
export default {
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
    mainformDatas: {
      type: Object,
    },
    field: {
      type: Object,
    },
    defaultValues: {
      type: Object,
    },
    currentSelected: {
      type: Object,
    },
  },
  computed: {
    valueDisp() {
      const dispCol = this.optionV2?.key_disp_col || this.optionV2?.refed_col;
      if (dispCol && this.currentSelected && this.currentSelected[dispCol]) {
        return this.currentSelected[dispCol];
      } else {
        return "";
      }
    },
    srvCol() {
      return this.field?.info?.srvCol;
    },
    optionV2() {
      return this.srvCol?.option_list_v2;
    },
    serviceName() {
      return this.optionV2?.serviceName || "";
    },
    srvApp() {
      return (
        this.$srvApp ||
        sessionStorage.getItem("current_app") ||
        top.pathConfig.application
      );
    },
  },
  data() {
    return {
      visible: false,
      value: "",
      mapKey: "G3VBZ-CKMKB-4CFUZ-JZLSE-676K6-J4FWP",
      mapReferer: "bx-data-v",
      curSelect: null,
    };
  },
  methods: {
    show() {
      window.addEventListener("message", this.listenMessage, false);
    },
    hide() {
      window.removeEventListener("message", this.listenMessage);
    },
    confirm() {
      if (this.curSelect) {
        const loc = this.curSelect;
        this.saveLocation({
          address: loc.poiaddress,
          name: loc.poiname,
          latitude: loc.latlng.lat,
          longitude: loc.latlng.lng,
          cityname: loc.cityname,
        });
        this.visible = false;
        this.curSelect = null;
      }
    },
    async getLocationFromSys(gpsId = null) {
      const serviceName = this.optionV2?.serviceName;
      if (!serviceName) {
        return;
      }
      const req = {
        serviceName,
        colNames: ["*"],
        condition: [
          {
            colName: this.optionV2.refed_col,
            ruleType: "eq",
            value: this.value,
          },
        ],
        page: {
          pageNo: 1,
          rownumber: 1,
        },
      };
      if (gpsId) {
        req.condition = [
          {
            colName: 'id',
            ruleType: "eq",
            value: gpsId
          }
        ]
      }
      const url = this.getServiceUrl("select", serviceName, this.srvApp);

      const res = await this.$http.post(url, req);
      if (res?.data?.state === "SUCCESS" && res.data.data.length > 0) {
        return res.data.data[0];
      } else if (res?.data?.state === 'FAILURE' && res.data.resultMessage) {
        $message.error(res.data.resultMessage);
      }
    },
    async saveLocation(e = {}) {
      console.log(e);
      let gno = "";
      if (this.value) {
        let gnoData = await this.getLocationFromSys();
        gno = gnoData[this.optionV2.refed_col];
      }
      const app = this.srvApp;
      let serviceName = this.serviceName.replace("_select", "_add");
      let req = [
        {
          serviceName: serviceName,
          data: [
            {
              addr_str: e.address + e.name,
              gcj_lat: e.latitude,
              gcj_lon: e.longitude,
            },
          ],
        },
      ];
      if (gno) {
        serviceName = this.serviceName.replace("_select", "_update");
        req[0].serviceName = serviceName;
        req[0].condition = [
          {
            colName: this.optionV2.refed_col,
            ruleType: "eq",
            value: gno,
          },
        ];
      }
      const url = this.getServiceUrl("operate", serviceName, this.srvApp);

      const res = await this.$http.post(url, req);
      console.log(res);
      const resData = res?.data?.response?.[0]?.response?.effect_data?.[0];
      if (resData) {
        if (resData?.id && !resData[this.optionV2.refed_col]) {
          let gnoData = await this.getLocationFromSys(resData.id);
          if (gnoData?.id&& gnoData[this.optionV2.refed_col]) {
            console.log('gnoData::', gnoData);
            resData = gnoData
          }
        }
        this.value = resData[this.optionV2.refed_col];
        this.$emit("on-selected", resData);
      } else if (res?.data?.state === 'FAILURE' && res.data.resultMessage) {
        $message.error(res.data.resultMessage);
      }
    },
    listenMessage(event) {
      // 接收位置信息，用户选择确认位置点后选点组件会触发该事件，回传用户的位置信息
      var loc = event.data;
      if (loc && loc.module == "locationPicker") {
        //防止其他应用也会向该页面post信息，需判断module是否为'locationPicker'
        console.log("location", loc);
        this.curSelect = loc;
      }
    },
  },
  mounted() {
    const self = this;
    if (
      this.currentSelected &&
      this.optionV2?.refed_col &&
      this.currentSelected[this.optionV2.refed_col]
    ) {
      this.value = this.currentSelected[this.optionV2.refed_col];
    }
  },
  beforeDestroy() { },
};
</script>

<style lang="scss" scoped>
.header {
  display: flex;
  justify-content: center;

  .disabled {
    cursor: not-allowed;
    filter: grayscale(0.7);
    pointer-events: none;
  }
}
</style>
