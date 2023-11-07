<template>
  <div>
    <div class="sub-title">基本信息</div>
    <div class="field-group">
      <el-form ref="form" :model="form" labelPosition="left" label-width="80px" style="display: flex">
        <!-- <el-form-item label="预约学校" style="margin-right: 40px">
          <el-select v-model="form.school" placeholder="请选择学校">
            <el-option label="学校1" value="school1"></el-option>
            <el-option label="学校2" value="school2"></el-option>
            <el-option label="学校3" value="school3"></el-option>
          </el-select>
        </el-form-item> -->
        <el-form-item label="选择场所" style="margin-right: 40px">
          <el-select v-model="form.placement" placeholder="请选择场所" @change="placeChange">
            <el-option :label="item.label" :value="item.value" v-for="item in placement" :key="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="预约人数">
          <el-input v-model.number="form.number" type="number" :step="1"></el-input>
        </el-form-item>
      </el-form>
    </div>

    <div class="sub-title" v-if="form.placement">预约日期</div>
    <el-calendar @input="dateChange" v-if="form.placement">
      <!-- 这里使用的是 2.5 slot 语法，对于新项目请使用 2.6 slot 语法-->
      <template slot="dateCell" slot-scope="{ date, data }">
        <div :class="data.isSelected ? 'is-selected' : ''">
          {{ data.day.split("-").slice(1).join("-") }}
          <span class="bottom"></span>
          <!-- {{ data.isSelected ? "✔️" : "" }} -->
        </div>
      </template>
    </el-calendar>
    <div style="padding: 0 20px" v-if="form.date">选择时段</div>
    <div class="time-range"  v-if="form.date">
      <div class="time-range-item">
        <div class="time">09:00-10:00</div>
        <div class="opening">剩余：190人</div>
        <div class="booked">已预约：121人</div>
      </div>
      <div class="time-range-item is-selected">
        <div class="time">09:00-10:00</div>
        <div class="opening">剩余：190人</div>
        <div class="booked">已预约：121人</div>
      </div>
      <div class="time-range-item">
        <div class="time">09:00-10:00</div>
        <div class="opening">剩余：190人</div>
        <div class="booked">已预约：121人</div>
      </div>
      <div class="time-range-item">
        <div class="time">09:00-10:00</div>
        <div class="opening">剩余：190人</div>
        <div class="booked">已预约：121人</div>
      </div>
    </div>
  </div>
</template>

<script>
import moment from "moment";
export default {
  data() {
    return {
      form: {
        school: null,
        placement: "",
        number: null,
        date: "",
      },
      placement: [],//可预约场地
      dates:[],//可预约日期
      times:[],//可预约时间段
    };
  },
  methods: {
    placeChange(e){
      console.log(e);
      this.fetchDate()
    },
    dateChange(val) {
      console.log(val);
      this.form.date = moment(val).format("YYYY-MM-DD");
    },
    fetchPlace() {
      // 查询可预约场所
      const url = `${window.backendIpAddr}/ledu/select/srvreserve_obj_select`;
      const req = {
        serviceName: "srvreserve_obj_select",
        colNames: ["*"],
        condition: [],
        page: { pageNo: 1, rownumber: 100 },
      };
      this.$http.post(url, req).then(res => {
        if (res.data.state === 'SUCCESS') {
          this.placement = res.data.data.map(item => {
            item.label = item.rsvo_name
            item.text = item.rsvo_name
            item.value = item.rsvo_no
            return item
          })
        }
      })
    },
    fetchDate() {
      // 查询可预约日期
      const url = `${window.backendIpAddr}/ledu/select/srvreserve_obj_date_count_select`;
      const req = {
        serviceName: "srvreserve_obj_date_count_select",
        colNames: ["*"],
        condition: [{
          colName: 'rsvo_no',
          ruleType: 'eq',
          value: this.form.placement
        }],
        page: { pageNo: 1, rownumber: 100 },
      };
      this.$http.post(url, req).then(res => {
        if (res.data.state === 'SUCCESS') {
          this.placement = res.data.data.map(item => {
            // item.label = item.rsvo_name
            // item.text = item.rsvo_name
            // item.value = item.rsvo_no
            return item
          })
        }
      })
    },
    fetchTime(){
      // 查询可预约时间段
      const url = `${window.backendIpAddr}/ledu/select/srvreserve_obj_date_count_select`;
      const req = {
        serviceName: "srvreserve_obj_date_count_select",
        colNames: ["*"],
        // condition: [{
        //   colName: 'rsvo_no',
        //   ruleType: 'eq',
        //   value: this.form.placement
        // }],
        page: { pageNo: 1, rownumber: 100 },
      };
    },
  },
  created() {
    this.fetchPlace()
  },
};
</script>

<style lang="scss" scoped>
.sub-title {
  font-weight: bold;
}

.time-range {
  display: flex;
  flex-wrap: wrap;
  padding: 20px;

  &-item {
    padding: 10px 20px;
    border-radius: 12px;
    background-color: #f3f4f5;
    border: 1px solid transparent;
    min-width: 180px;
    margin-right: 10px;
    text-align: center;

    &.is-selected {
      background: #f2f8fe;
      border-color: #007aff;
    }
  }
}

::v-deep .el-calendar__body {
  th {
    text-align: center;
    padding: 5px 0;
  }

  td.is-selected {
    background-color: #eef5ff;
    position: relative;

    .bottom {
      position: absolute;
      left: 25%;
      width: 50%;
      height: 3px;
      background: #3b87f1;
      bottom: 0;
    }
  }
}

::v-deep .el-calendar-table .el-calendar-day {
  height: 44px;
  text-align: center;
}
</style>
