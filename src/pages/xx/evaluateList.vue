<template>
  <div class="evaluate-list">
    <div class="filter-box">
      <el-form ref="form" :model="form" label-width="80px">
        <el-row style="display: flex; align-items: center">
          <el-col :span="6">
            <el-form-item label="学生名称">
              <el-input v-model="form.student_name" clearable></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="学生班级">
              <el-input v-model="form.class_name" clearable></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-button type="primary" @click="search">筛选</el-button>
          </el-col>
        </el-row>
      </el-form>
    </div>
    <div class="list-box">
      <div class="list-box-title">学生列表</div>
      <div class="list-box-main">
        <!-- <template v-for="a in 20"> -->
        <div class="list-box-item" v-for="item in list" :key="item.id">
          <div class="top">
            <div class="avatar">
              <img src="./img/avatar.png" alt="" srcset="" />
            </div>
            <div class="top-center">
              <div class="top-center-top">
                <div class="name">{{ item.student_name }}</div>
                <div class="class">{{ item.class_name }}</div>
              </div>
              <div class="desc">
                {{ item.course_name }}
              </div>
            </div>
            <div class="top-right" v-if="item.number">+{{ item.number }}</div>
          </div>
          <div class="tags">
            <div class="tag" v-for="tag in indexList" :class="{
              active:
                studentsMap &&
                studentsMap[item.student_no] &&
                studentsMap[item.student_no][tag.no] &&
                studentsMap[item.student_no][tag.no].is_index === '是',
            }" @click="changeIndexState(item, tag)">
              {{ tag.index_name }}
            </div>
          </div>
        </div>
        <!-- </template> -->
      </div>
    </div>
    <el-pagination class="page-box" background layout="prev, pager, next" :total="page.total" :page-size="page.rownumber"
      @current-change="loadStudentData" :current-page.sync="page.pageNo">
    </el-pagination>
  </div>
</template>

<script>
export default {
  data() {
    return {
      service: "srvledu_course_eva_record_select",
      form: {
        student_name: null,
        class_name: null,
      },
      page: {
        pageNo: 1,
        total: 0,
        rownumber: 16,
      },
      list: [],
      indexList: [],
      class_record_no: "", //上课记录编号
      studentsMap: {},
    };
  },
  methods: {
    changeIndexState(student, tag) {
      console.log(student, tag);
      if (this.studentsMap?.[student.student_no]?.[tag.no]) {
        // 有这个指标的评价记录
        const loading = this.$loading({
          lock: true,
          text: "加载中",
          spinner: "el-icon-loading",
          background: "rgba(0, 0, 0, 0.7)",
        });
        setTimeout(() => {
          loading.close();
        }, 2000);
        const indexInfo = this.studentsMap[student.student_no][tag.no]
        console.log(indexInfo);
        const url = `${window.backendIpAddr}/ledu/operate/srvledu_course_eva_record_update`;
        const req = [
          {
            serviceName: "srvledu_course_eva_record_update",
            condition: [{ colName: "id", ruleType: "eq", value: indexInfo.id }],
            data: [{ is_index: indexInfo.is_index === '是' ? '否' : '是' }],
          },
        ];
        this.$http.post(url, req).then((res) => {
          loading.close();
          if (res.data.state === 'SUCCESS') {
            this.$message({
              type: "success",
              message: "操作成功",
            });
            this.loadStudentData();
          } else {
            this.$message({
              type: "error",
              message: res.data.resultMessage,
            });
          }
        })
      } else {
        //没有这个指标的评价记录 创建一条记录。。。。。不用创建 触发器会自动创建 有多少个指标 一个学生一堂课程就有多少条记录
        this.$message({
          type: "error",
          message: "当前学生在当前上课记录中没有该指标的评价记录",
        });
      }

    },
    getIndexList() {
      // 查找所有指标
      const url = `${window.backendIpAddr}/ledu/select/srvledu_course_index_select`;
      const req = {
        serviceName: "srvledu_course_index_select",
        colNames: ["*"],
        // condition: [{
        //   colName: 'is_index',
        //   ruleType: 'eq',
        //   value: '是'
        // }],
        page: { pageNo: 1, rownumber: 50 },
      };
      this.$http.post(url, req).then((res) => {
        if (res.data.state == "SUCCESS") {
          this.indexList = res.data.data;
        }
      });
    },
    search() {
      this.page.pageNo = 1;
      this.loadStudentData();
    },
    loadAllData(studentList) {
      const url = `${window.backendIpAddr}/ledu/select/${this.service}`;
      const req = {
        serviceName: this.service,
        colNames: ["*"],
        condition: [
          {
            colName: "class_record_no",
            ruleType: "eq",
            value: this.class_record_no,
          },
          {
            colName: "student_no",
            ruleType: "in",
            value: studentList,
          },
        ],
        page: { pageNo: 1, rownumber: 500 },
        use_type: "list",
        query_source: "list_page",
      };
      this.$http.post(url, req).then((res) => {
        if (res.data.state == "SUCCESS") {
          this.studentsMap = res.data.data.reduce((pre, cur) => {
            if (pre[cur.student_no]) {
              pre[cur.student_no][cur.index_no] = cur;
            } else {
              pre[cur.student_no] = {
                [cur.index_no]: cur,
              };
            }
            return pre;
          }, {});
        }
      });
    },
    loadStudentData() {
      const url = `${window.backendIpAddr}/ledu/select/${this.service}`;
      const req = {
        serviceName: this.service,
        colNames: ["*"],
        condition: [
          {
            colName: "is_index",
            ruleType: "eq",
            value: "是",
          },
        ],
        group: [
          {
            colName: "student_name",
            type: "by",
          },
          {
            colName: "student_no",
            type: "by",
          },
          {
            colName: "course_name",
            type: "by",
          },
          {
            colName: "class_name",
            type: "by",
          },
          {
            colName: "index_no",
            type: "count",
            aliasName: "number",
          },
        ],
        use_type: "list",
        query_source: "list_page",
        page: {
          pageNo: this.page.pageNo,
          rownumber: this.page.rownumber,
        },
      };
      if (this.class_record_no) {
        req.condition.push({
          colName: "class_record_no",
          ruleType: "eq",
          value: this.class_record_no,
        });
      }
      if (this.form.class_name) {
        req.condition.push({
          colName: "class_name",
          ruleType: "like",
          value: this.form.class_name,
        });
      }
      if (this.form.student_name) {
        req.condition.push({
          colName: "student_name",
          ruleType: "like",
          value: this.form.student_name,
        });
      }
      const loading = this.$loading({
        lock: true,
        text: "加载中",
        spinner: "el-icon-loading",
        background: "rgba(0, 0, 0, 0.7)",
      });
      setTimeout(() => {
        loading.close();
      }, 2000);
      this.$http.post(url, req).then((res) => {
        loading.close();

        console.log(res);
        if (res?.data?.state === "SUCCESS") {
          this.list = res.data.data;
          this.page.total = res.data.page.total;
          if (res?.data?.data?.length) {
            this.loadAllData(
              res.data.data.map((item) => item.student_no).toString()
            );
          }
        }
      });
    },
  },
  created() {
    if (this.$route?.query?.class_record_no) {
      this.class_record_no = this.$route.query.class_record_no;
    } else if (this.$route?.params?.class_record_no) {
      this.class_record_no = this.$route.params.class_record_no;
    }
    this.getIndexList();
    this.loadStudentData();
  },
};
</script>

<style lang="scss" scoped>
.evaluate-list {
  display: flex;
  flex-direction: column;
  height: 100vh;

  .list-box {
    flex: 1;
    overflow: auto;
    padding: 20px;
    width: 100vw;

    &-title {
      font-weight: bold;
      margin-bottom: 20px;
    }

    &-main {
      display: flex;
      flex-wrap: wrap;
      // display: grid;
      // width: 1700px;
      widows: 100%;
      overflow-x: auto;
      // grid-template-columns: 25% 25% 25% 25%;
      // grid-template-rows: 33.33% 33.33% 33.33%;
    }

    &-item {
      // width: max(calc(25vw - 20px),400px);
      // flex: 1;
      // max-width:calc(25vw - 20px) ;
      // max-width: 500px;
      width: 370px;
      border: 1px solid #e0e3ea;
      border-radius: 10px;
      margin-right: 10px;
      margin-bottom: 10px;
      padding: 10px;
      font-size: 14px;

      .top {
        display: flex;
        padding-bottom: 5px;

        .avatar {
          width: 48px;
          height: 48px;
          margin-right: 20px;

          img {
            width: 100%;
            height: 100%;
          }
        }

        .top-center {
          flex: 1;

          &-top {
            display: flex;
            font-weight: bold;
            font-size: 14px;

            .name {
              width: 80px;
            }
          }
        }

        .top-right {
          font-size: 16px;
          color: #ff4d4f;
          font-weight: bold;
        }
      }

      .tags {
        display: flex;
        flex-wrap: wrap;

        .tag {
          user-select: none;
          background-color: #f2f2f7;
          border-radius: 50px;
          padding: 5px 10px;
          margin-right: 5px;
          margin-top: 5px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s ease-in-out;

          &:active {
            transform: scale(1.12);
          }

          &.active {
            background-color: #e5f1ff;
            color: #007aff;
          }
        }
      }
    }
  }

  .page-box {
    padding: 40px 20px;
    text-align: center;
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
}
</style>
