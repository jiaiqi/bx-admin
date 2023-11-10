<template>
  <div v-loading="loading">
    <div class="sub-title">基本信息</div>
    <div class="field-group">
      <el-form ref="form" :model="form" labelPosition="left" label-width="80px" style="display: flex;flex-wrap: wrap;">
        <!-- <el-form-item label="预约学校" style="margin-right: 40px">
          <el-select v-model="form.school" placeholder="请选择学校">
            <el-option label="学校1" value="school1"></el-option>
            <el-option label="学校2" value="school2"></el-option>
            <el-option label="学校3" value="school3"></el-option>
          </el-select>
        </el-form-item> -->
        <el-row style="width: 100%;">
          <el-col :xs="12" :sm="8" :md="6" :lg="6" :xl="4">
            <el-form-item required label="选择场所">
              <el-select v-model="form.rsvo_no" placeholder="请选择场所" @change="placeChange">
                <el-option :label="item.label" :value="item.value" v-for="item in placement"
                  :key="item.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="12" :sm="8" :md="6" :lg="6" :xl="4">
            <el-form-item required label="预约人数">
              <el-input v-model.number="form.number" type="number" :step="1" @change="numberChange"></el-input>
            </el-form-item>
          </el-col>
          <el-col :xs="12" :sm="8" :md="6" :lg="6" :xl="4">
            <el-form-item required label="联系人">
              <el-input v-model="form.contacts"></el-input>
            </el-form-item>
          </el-col>
          <el-col :xs="12" :sm="8" :md="6" :lg="6" :xl="4">
            <el-form-item required label="手机号">
              <el-input v-model="form.mobilephone"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <!-- <el-form-item required label="选择场所" style="margin-right: 40px;width: 50%;">
          <el-select v-model="form.rsvo_no" placeholder="请选择场所" @change="placeChange">
            <el-option :label="item.label" :value="item.value" v-for="item in placement" :key="item.value"></el-option>
          </el-select>
        </el-form-item> -->
        <!-- <el-form-item required label="预约人数">
          <el-input v-model.number="form.number" type="number" :step="1" @change="numberChange"></el-input>
        </el-form-item> -->
        <!-- <el-form-item required label="联系人" style="width: 50%;">
          <el-input
            v-model="form.contacts"
          ></el-input>
        </el-form-item>
        <el-form-item required label="手机号">
          <el-input
            v-model="form.mobilephone"
          ></el-input>
        </el-form-item> -->
      </el-form>
    </div>

    <div class="sub-title" v-if="form.rsvo_no">预约日期</div>
    <el-calendar @input="dateChange" v-if="form.rsvo_no">
      <!-- 这里使用的是 2.5 slot 语法，对于新项目请使用 2.6 slot 语法-->
      <template slot="dateCell" slot-scope="{ date, data }">
        <div class="item" :class="[
          {
            'is-selected': data.day === form.date,
            disabled: disabledDate(data.day),
          },
        ]">
          <div>
            <span class="date">{{ data.day.split("-").slice(1).join("-") }}</span>
            <div v-if=" datesMap[data.day]">{{ datesMap[data.day].cntr }}/{{ datesMap[data.day].cnt_can }}</div>
          </div>
          <span class="bottom"></span>
          <!-- {{ data.isSelected ? "✔️" : "" }} -->
        </div>
      </template>
    </el-calendar>
    <div style="padding: 0 20px" v-if="form.date">选择时段</div>
    <div class="time-range" v-if="form.date">
      <div class="time-range-item"
        :class="{ 'is-selected': item.start_time && item.start_time === form.time, disabled: !showTime(item.start_time) }"
        v-for="item in times" @click="form.time = item.start_time">
        <div class="time">{{ item.start_time }}-{{ item.end_time }}</div>
        <div class="opening">剩余：{{ item.div_count || '0' }}</div>
        <div class="booked">已预约：{{ item.cnty || '0' }}</div>
      </div>
    </div>
    <div style="text-align: center">
      <el-button size="mini" @click="cancel">取消</el-button>
      <el-button type="primary" size="mini" @click="submit"
        :disabled="!form.rsvo_no || !form.number || !form.date || !form.time || !form.contacts || !form.mobilephone">确认</el-button>
    </div>
  </div>
</template>

<script>
import moment from "moment";
export default {
  props: {
    defaultValues: Object
  },
  computed: {
    timesMap() {
      return this.times.reduce((res, cur) => {
        res[cur.start_time] = cur;
        return res;
      }, {});
    },
    datesMap() {
      return this.dates.reduce((res, cur) => {
        res[cur.datey] = cur;
        return res;
      }, {});
    },
  },
  data() {
    return {
      loading: false,
      form: {
        school: null,
        placement: "",
        number: null,
        date: "",
        time: "",
        contacts: '',//人，
        mobilephone: "",//手机号
      },
      placement: [], //可预约场地
      dates: [], //可预约日期
      times: [], //可预约时间段
    };
  },
  methods: {
    cancel(submit) {
      if (submit) {
        this.$emit('refresh', 'submit')
      } else {
        this.$emit('cancel')
      }
      Object.keys(this.form).forEach(key => {
        this.$set(this.form, key, null)
      });
      this.dates = []
      this.times = []
    },
    submit() {
      let url = `${window.backendIpAddr}/ledu/operate/srvreserve_record_add`
      let req = [
        {
          serviceName: "srvreserve_record_add",
          condition: [],
          data: [
            {
              rsvo_no: this.form.rsvo_no,//预约对象
              rsvr_date: this.form.date,
              start_time: this.form.time,
              count: this.form.number,
              rsvp_no: this.timesMap[this.form.time].rsvp_no,//预约日期编码
              rsvt_no: this.timesMap[this.form.time].rsvt_no,//预约时段编码
              contacts: this.form.contacts,//联系人
              mobilephone: this.form.mobilephone,//手机号
            },
          ],
        },
      ];
      this.$http.post(url, req).then(res => {
        if (res?.data?.state === 'SUCCESS') {
          this.$alert('操作成功', '提示', {
            confirmButtonText: '确定',
            callback: action => {
              this.cancel(true)
            }
          });
          // this.$message.success('操作成功')
        } else {
          this.$message(res.data.resultMessage)
        }
      })
    },
    showTime(time) {
      let item = this.timesMap?.[time];
      if (item) {
        return !this.form.number || (
          item &&
          item.div_count &&
          item.div_count - item.cnty >= this.form.number
        );
      } else {
        return false
      }
    },
    disabledDate(day) {
      let item = this.datesMap?.[day];
      return !item;
      if (item) {
        return !(
          item &&
          item.cnt_can &&
          item.cnt_can - item.cntr >= this.form.number
        );
      } else {
        return true;
      }
    },
    numberChange(val) {
      if (val && this.form.time && !this.showTime(this.form.time)) {
        this.form.time = ''
      }
    },
    placeChange(e) {
      console.log(e);
      this.fetchDate();
    },
    dateChange(val) {
      let date = moment(val).format("YYYY-MM-DD");
      if (!this.disabledDate(date)) {
        this.form.date = date;
        this.fetchTime();
      }
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
      this.$http.post(url, req).then((res) => {
        if (res.data.state === "SUCCESS") {
          this.placement = res.data.data.map((item) => {
            item.label = item.rsvo_name;
            item.text = item.rsvo_name;
            item.value = item.rsvo_no;
            return item;
          });
        }
      });
    },
    fetchDate() {
      // 查询可预约日期
      const url = `${window.backendIpAddr}/ledu/select/srvreserve_obj_date_count_select`;
      const req = {
        serviceName: "srvreserve_obj_date_count_select",
        colNames: ["*"],
        condition: [
          {
            colName: "rsvo_no",
            ruleType: "eq",
            value: this.form.rsvo_no,
          },
        ],
        page: { pageNo: 1, rownumber: 100 },
      };
      this.loading = true;
      this.$http.post(url, req).then((res) => {
        this.loading = false
        if (res.data.state === "SUCCESS") {
          this.dates = res.data.data.map((item) => {
            // item.label = item.rsvo_name
            // item.text = item.rsvo_name
            // item.value = item.rsvo_no
            return item;
          });
        }
      });
    },
    fetchTime() {
      // 查询可预约时间段
      const url = `${window.backendIpAddr}/ledu/select/srvreserve_set_time_div_user_obj_date_select`;
      const req = {
        serviceName: "srvreserve_set_time_div_user_obj_date_select",
        colNames: ["*"],
        condition: [
          {
            colName: "rsvo_no",
            ruleType: "eq",
            value: this.form.rsvo_no,
          },
          {
            colName: "datey",
            ruleType: "eq",
            value: this.form.date,
          },
        ],
        page: { pageNo: 1, rownumber: 100 },
      };
      this.loading = true
      this.$http.post(url, req).then((res) => {
        this.loading = false
        this.times = res.data?.data || []
      });
    },
  },
  created() {
    if(this.defaultValues&&Object.keys(this.defaultValues).length){
      Object.keys(this.defaultValues).forEach(key=>{
        if(this.defaultValues[key]){
          this.form[key] = this.defaultValues[key]
          if(key==='rsvo_no'){
            this.fetchDate()
          }
        }
      })
    }
    this.fetchPlace();
  },
};
</script>

<style lang="scss" scoped>
.el-form .el-row {
  border: none;
}

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

    &.disabled {
      cursor: not-allowed;
      pointer-events: none;
      color: #c0c4cc;
    }
  }
}

::v-deep .el-calendar__body {
  th {
    text-align: center;
    padding: 5px 0;
  }
}

::v-deep .el-calendar-table .el-calendar-day {
  height:50px;
  text-align: center;
  padding: 0;

  .item {
    min-height: 50px;
    width: 100%;
    // line-height: 44px;
    
    .date{
      font-size: 16px;
    }
    &.is-selected {
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

    &.disabled {
      cursor: not-allowed;
      pointer-events: none;
      color: #c0c4cc;
    }
  }
}
</style>
