<template>
  <div class="">
    <div class="filter-box">
      <el-form ref="form" :model="form" label-width="80px">
        <el-row style="display: flex;align-items: center;">
          <el-col :span="6">
            <el-form-item label="劳动主题">
              <el-select v-model="form.theme" placeholder="请选择活动区域" multiple clearable>
                <el-option :label="item.label" :value="item.value" v-for="item in themeOptions"
                  :key="item.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="课程名称">
              <el-input v-model="form.course_name" clearable></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12" style="float: right;">
            <el-button type="primary" @click="search">查询</el-button>
          </el-col>
        </el-row>
      </el-form>
    </div>
    <div class="header">
      <div class="header-item">
        <div class="header-title">课表管理</div>
        <div class="current-date">{{ currentMonth || "" }}</div>
        <el-button-group>
          <el-button size="mini" @click="selectDate('prev-month')">上个月</el-button>
          <el-button size="mini" @click="selectDate('today')">今天</el-button>
          <el-button size="mini" @click="selectDate('next-month')">下个月</el-button>
        </el-button-group>
      </div>
      <div class="header-item">
        <el-button size="mini" class="add-btn" type="primary" @click="openAddDialog">新增排课</el-button>
      </div>
    </div>
    <div class="time-table" v-loading="loading">

      <el-calendar ref="calendar" class="">
        <template v-slot:dateCell="{ date, data }">
          <div class="custom-date-cell" :class="[setClass(date, data)]" @click="toList(date)">
            <div class="top-date">
              {{ data.day.split("-")[2] }}
            </div>
            <div class="card-content" v-if="getTodayInfo(date, data)">
              <div class="card-content-title">{{ getTodayInfo(date).course_name }}</div>
              <div class="card-content-item">
                <div class="card-content-item-label">
                  主题：
                </div>
                <div class="card-content-item-value">
                  {{ getTodayInfo(date).theme }}
                </div>
              </div>
              <div class="card-content-item">
                <div class="card-content-item-label">
                  班级：
                </div>
                <div class="card-content-item-value">
                  {{ getTodayInfo(date).class_name }}
                </div>
              </div>
              <div class="card-content-item">
                <div class="card-content-item-label">
                  时间段：
                </div>
                <div class="card-content-item-value">
                  {{ getTodayInfo(date)._time_slot || '' }}

                </div>
              </div>
              <div class="card-content-item">
                <div class="card-content-item-label">
                  老师：
                </div>
                <div class="card-content-item-value">
                  {{ getTodayInfo(date).teacher_name }}
                </div>
              </div>
              <div class="card-content-item">
                <div class="card-content-item-label">
                  场地：
                </div>
                <div class="card-content-item-value">
                  {{ getTodayInfo(date).place }}
                </div>
              </div>
            </div>
          </div>
        </template>
      </el-calendar>
    </div>
    <el-dialog :visible="activeForm === 'add'" title="新增排课" width="1300px" @close="activeForm = ''">
      <add-com name="list-duplicate" ref="duplicate-form" :pageName="'list-duplicate'"
        service="srvledu_course_schedue_add" parentPageType="list" @action-complete="onAddFormActionComplete($event)"
        v-if="activeForm">
      </add-com>

    </el-dialog>
    <el-dialog :visible="activeForm === 'list'" title="课程详情" width="1300px" @close="activeForm = ''">
      <list-com ref="list" :service="service" :key="service" :showPagination="true" list-type="list"
        :defaultCondition="defaultCondition" :$srvApp="$srvApp" v-if="activeForm">
      </list-com>
    </el-dialog>
  </div>
</template>

<script>
import dayjs from "dayjs";
import AddCom from "@/components/common/add.vue";
import ListCom from '@/components/common/list.vue'
export default {
  components: {
    AddCom,
    ListCom
  },
  props: {
    srv_cols: Array,
  },
  computed: {
    themeOptions() {
      return this.srv_cols?.find(item => item.columns == 'theme')?.option_list_v2 || []
    }
  },
  data() {
    return {
      service: "srvledu_course_schedue_select",
      loading: false,
      currentMonth: dayjs().format("YYYY年MM月"),
      currentDate: new Date(),
      dialogVisible: false,
      activeForm: '',
      dateMap: {},
      form: {
        theme: '', //课程主题
        course_name: ''//课程名称
      },
      defaultCondition: [],
      listLoaded: false,//列表加载完成
    };
  },
  methods: {
    search() {
      const condition = []
      if (this.form.theme) {
        condition.push({
          colName: 'theme',
          ruleType: 'in',
          value: this.form.theme?.toString()
        })
      }
      if (this.form.course_name) {
        condition.push({
          colName: 'course_name',
          ruleType: 'like',
          value: this.form.course_name
        })
      }
      this.loadData(condition)
    },
    onAddFormActionComplete() {
      this.activeForm = null
      this.loadData()
    },
    toList(date) {
      this.defaultCondition = []
      const day = dayjs(date).format("YYYY-MM-DD");
      const data = this.dateMap[day];
      if (data) {
        console.log(data);
        const operate_params = {
          condition: [{
            colName: 'school_no',
            ruleType: 'eq',
            value: data.school_no
          },
          {
            colName: 'class_date',
            ruleType: 'eq',
            value: data.class_date
          }]
        }
        this.defaultCondition = operate_params.condition
        const loading = this.$loading({
          lock: true,
          text: 'Loading',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
        });
        setTimeout(() => {
          loading.close();
        }, 2000);
        this.activeForm = 'list'
        // const url = `/#/list/srvledu_course_schedue_select?menuapp=ledu&operate_params=${JSON.stringify(operate_params)}`
        // window.open(url)
        // const url = `/vpages/index.html#/list/srvledu_course_schedue_select?menuapp=ledu&operate_params=${JSON.stringify(operate_params)}`
        // this.addTabByUrl(url, '课程详情')
      }
    },
    getTodayInfo(date, data) {
      date = dayjs(date).format("YYYY-MM-DD");
      if (data?.type === 'current-month') {
        this.currentMonth = dayjs(date).format("YYYY年MM月");
        if (this.currentDate && dayjs(this.currentDate).format('YYYY年MM月') !== this.currentMonth) {
          this.currentDate = new Date(date);
          this.loadData(null,date)
        }
      }
      const result = this.dateMap[date];
      if (!result) {
        return false
      }
      result._time_slot = result.time_slot?.replaceAll(',课节', '')?.replaceAll('课节', '')
      if (result.lesson) {
        try {
          let lessons = []
          let lesson = `[${result.lesson}]`
          lesson = JSON.parse(lesson)
          if (lesson?.length) {
            lesson.forEach(l => {
              if (l?.length) {
                l.forEach(ll => {
                  lessons.push(ll.lesson_name)
                })
              }
            })
          }
          result._lessons = [...new Set(lessons)]
        } catch (error) {
        }
      }
      if (result._lessons?.length) {
        result._lessons_text = `课节(${result._lessons.join(",")})`
      }
      if (result._time_slot) {
        result._time_slot += `,${result._lessons_text}`
      } else {
        result._time_slot = result._lessons_text
      }
      return result
    },
    setClass(date, data) {
      // date:日期对象
      let classStr = "";
      if ([0, 6].includes(date.getDay())) {
        // 是周末
        classStr = " is-weekend";
      } else {
        // 是工作日
        classStr = " is-workday";
      }
      if (new Date(dayjs(date).format("YYYY-MM-DD")) >= new Date(dayjs().format("YYYY-MM-DD"))) {
        // 是未来
        classStr += " is-future";
      }
      if (this.dateMap[data.day]) {
        classStr += ' hasData'
      }
      return classStr;
    },
    openAddDialog() {
      this.activeForm = 'add'
    },
    selectDate(value) {
      console.log(value);
      let date = dayjs(this.currentDate).format("YYYY-MM-DD");
      if (value === 'next-month') {
        date = dayjs(this.currentDate).add(1, 'month').format("YYYY-MM-DD");
      } else if (value === 'prev-month') {
        date = dayjs(this.currentDate).subtract(1, 'month').format("YYYY-MM-DD");
      } else {
        // today
        date = dayjs().format("YYYY-MM-DD");
      }
      this.currentDate = date
      this.$refs.calendar.selectDate(value);
      this.loadData(null, date);
    },
    async loadData(condition, currentDate) {
      this.loading = true
      this.listLoaded = false
      const url = `${window.backendIpAddr}/ledu/select/srvledu_calendar_select`;
      const req = {
        serviceName: "srvledu_calendar_select",
        colNames: ["*"],
        condition: [{
          colName: "class_date",
          ruleType: "like]",
          value: dayjs().format("YYYY-MM"),
        }],
        page: { pageNo: 1, rownumber: 50 },
        use_type: "list",
        query_source: "list_page",
      };
      if (currentDate) {
        req.condition = [{
          colName: "class_date",
          ruleType: "like",
          value: dayjs(currentDate).format("YYYY-MM")
        }]
      }
      if (condition?.length) {
        req.condition = req.condition.concat(condition)
      }
      const res = await this.$http.post(url, req);
      this.listLoaded = true
      this.loading = false
      console.log(res);
      if (res?.data?.state === 'SUCCESS') {
        this.dateMap = res.data.data.reduce((pre, cur) => {
          pre[cur.class_date] = cur;
          return pre
        }, {})
      }
    },
  },
  created() {
    this.loadData();
  },
};
</script>

<style lang="scss" scoped>
.header {
  padding: 10px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  &-title {
    font-weight: bold;
  }

  &-item {
    display: flex;
    align-items: center;

    .current-date {
      margin: 0 20px;
    }
  }
}

::v-deep .el-calendar__header {
  display: none;
}

::v-deep .el-calendar__body {
  th {
    background-color: #eaecf3;
    text-align: center;
    padding: 5px 0;

    &::before {
      content: "周";
    }
  }

  .el-calendar-day {
    height: auto;
    min-height: 120px;
    font-size: 12px;
    padding: 0;
    cursor: auto;

    .custom-date-cell {
      padding: 10px;
      width: 100%;
      overflow: hidden;

      .top-date {
        text-align: right;
        font-weight: bold;
        font-size: 16px;
        position: relative;
        float: right;
      }

      .card-content {
        width: 100%;

        &-title {
          font-weight: bold;
        }

        &-item {
          width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          display: flex;
        }
      }

      &.is-weekend {
        .top-date {
          color: #ffa39e;
        }
      }

      // .is-workday {
      //   color: #333;
      // }
      &.hasData {
        // background-color: #f2f2f7;
        // color: #333;
        // cursor: pointer;

        // &.is-future {
        //   background-color: #1684fc;
        //   color: #fff;

        //   .top-date {
        //     color: #fff;
        //   }
        // }
      }
    }
  }
}

td.current .el-calendar-day {
  .hasData {
    background-color: #f2f2f7;
    color: #333;
    cursor: pointer;

    &.is-future {
      background-color: #1684fc;
      color: #fff;

      .top-date {
        color: #fff;
      }
    }
  }


}


.time-table {
  // min-width: 1500px;
  width: 100vw;
  overflow-x: auto;

  ::v-deep .el-calendar__body {
    min-width: 1500px;
    padding: 0 20px 20px;
  }
}

.filter-box {
  .el-button {
    min-width: 80px;
  }

  .el-form-item {
    margin-bottom: 0;
  }

  .el-col-12 {
    display: flex;
    justify-content: flex-end;
  }

  .el-select {
    width: 100%;
  }
}
</style>
