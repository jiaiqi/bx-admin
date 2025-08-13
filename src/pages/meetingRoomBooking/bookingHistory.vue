<template>
  <div class="history-wrapper">
    <div class="history-container">
      <div class="history-header">
        <h1 class="history-title">预约记录</h1>
        <div class="history-actions">
          <el-button
            class="history-btn"
            @click="backToBooking"
          >
            <i class="el-icon-back"></i>
            <span>返回预约页面</span>
          </el-button>
          <el-button
            type="primary"
            @click="refreshList"
          >
            <i class="el-icon-refresh"></i>
            <span>刷新列表</span>
          </el-button>
        </div>
      </div>

      <!-- 搜索筛选区域 -->
      <div class="search-filter">
        <el-form
          :inline="true"
          :model="searchForm"
          class="search-form"
        >
          <el-form-item label="会议室">
            <el-input
              v-model="searchForm.roomName"
              placeholder="会议室名称"
              clearable
            ></el-input>
          </el-form-item>
          <el-form-item label="日期范围">
            <el-date-picker
              v-model="searchForm.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="yyyy-MM-dd"
              format="yyyy年MM月dd日"
            ></el-date-picker>
          </el-form-item>
          <el-form-item label="联系人">
            <el-input
              v-model="searchForm.contacts"
              placeholder="联系人姓名"
              clearable
              style="width: 120px;"
            ></el-input>
          </el-form-item>
          <el-form-item label="预约人">
            <el-input
              v-model="searchForm.createUserDisp"
              placeholder="预约人姓名"
              clearable
              style="width: 120px;"
            ></el-input>
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              class="search-btn"
              @click="searchRecords"
            >搜索</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 预约记录卡片列表 -->
      <div
        class="record-list"
        v-loading="loading"
      >
        <div
          v-if="recordList.length === 0"
          class="empty-data"
        >
          <div class="empty-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="64"
              height="64"
              viewBox="0 0 24 24"
            >
              <path
                fill="#909399"
                d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-2-7h-3v-3c0-.55-.45-1-1-1s-1 .45-1 1v3H9c-.55 0-1 .45-1 1s.45 1 1 1h3v3c0 .55.45 1 1 1s1-.45 1-1v-3h3c.55 0 1-.45 1-1s-.45-1-1-1z"
              />
            </svg>
          </div>
          <p class="empty-text">暂无预约记录</p>
          <el-button
            type="primary"
            class="reserve-btn"
            @click="backToBooking"
          >立即预约</el-button>
        </div>

        <div
          v-else
          class="record-cards"
        >
          <div
            v-for="(record, index) in recordList"
            :key="index"
            class="record-card"
          >
            <div class="card-header">
              <div class="room-name">{{ record.rsvo_name }}</div>
              <el-tag
                size="small"
                :type="getStatusType(record.review_status)"
              >
                {{ getStatusText(record.review_status) }}
              </el-tag>
            </div>

            <div class="card-body">
              <div class="info-row">
                <div class="info-item">
                  <i class="el-icon-date"></i>
                  <span>{{ record.rsvr_date }}</span>
                </div>
                <div class="info-item">
                  <i class="el-icon-time"></i>
                  <span>
                    {{ formatTimeRange(record) }}
                  </span>
                </div>
              </div>

              <div class="info-row">
                <div
                  class="info-item"
                  title="联系人"
                >
                  <i class="el-icon-user"></i>
                  <span>{{ record.contacts }}</span>
                </div>
                <div
                  class="info-item"
                  title="联系电话"
                >
                  <i class="el-icon-mobile-phone"></i>
                  <span>{{ record.mobilephone }}</span>
                </div>
              </div>

              <div
                class="info-row"
                v-if="![1, '1'].includes(record.count)"
              >
                <div class="info-item">
                  <i class="el-icon-user-solid"></i>
                  <span>{{ record.count }}人</span>
                </div>
                <div
                  class="info-item"
                  v-if="record.remark"
                >
                  <i class="el-icon-document"></i>
                  <el-tooltip
                    :content="record.remark"
                    placement="top"
                  >
                    <span class="remark-text">{{ record.remark }}</span>
                  </el-tooltip>
                </div>
              </div>
            </div>

            <div class="card-footer">
              <div class="create-info">
                <span class="create-time">创建时间: {{ formatCreateTime(record.create_time) }}</span>
                <span class="create-time">预约人: {{ record.create_user_disp || record.create_user || '--' }}</span>
              </div>
              <div class="card-actions">
                <el-button
                  type="primary"
                  size="mini"
                  plain
                  @click="viewDetail(record)"
                >查看详情</el-button>
                <!-- <el-button
                  v-if="canCancel(record)"
                  type="danger"
                  size="mini"
                  plain
                  @click="cancelReservation(record)"
                  >取消预约</el-button
                > -->
              </div>
            </div>
          </div>
        </div>

        <!-- 分页 -->
        <div class="pagination-container">
          <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="pagination.pageNo"
            :page-sizes="[10, 20, 50, 100]"
            :page-size="pagination.pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="pagination.total"
          ></el-pagination>
        </div>
      </div>
    </div>

    <!-- 预约详情对话框 -->
    <el-dialog
      title="预约详情"
      :visible.sync="detailDialogVisible"
      width="500px"
      center
    >
      <div
        class="detail-content"
        v-if="selectedRecord"
      >
        <div class="detail-item">
          <span class="detail-label">会议室：</span>
          <span class="detail-value">{{ selectedRecord.rsvo_name }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">预约日期：</span>
          <span class="detail-value">{{ selectedRecord.rsvr_date }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">时间段：</span>
          <span class="detail-value">
            {{ formatTimeRange(selectedRecord) }}
          </span>
        </div>
        <div class="detail-item">
          <span class="detail-label">联系人：</span>
          <span class="detail-value">{{ selectedRecord.contacts }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">联系方式：</span>
          <span class="detail-value">{{ selectedRecord.mobilephone }}</span>
        </div>
        <div
          class="detail-item"
          v-if="![1, '1'].includes(selectedRecord.count)"
        >
          <span class="detail-label">人数：</span>
          <span class="detail-value">{{ selectedRecord.count }}人</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">备注：</span>
          <span class="detail-value">{{ selectedRecord.remark || "无" }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">创建时间：</span>
          <span class="detail-value">{{ selectedRecord.create_time }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">状态：</span>
          <span class="detail-value">
            <el-tag
              size="small"
              :type="getStatusType(selectedRecord.review_status)"
            >
              {{ getStatusText(selectedRecord.review_status) }}
            </el-tag>
          </span>
        </div>
        <div class="detail-item">
          <span class="detail-label">预约人：</span>
          <span class="detail-value">{{ selectedRecord.create_user_disp || selectedRecord.create_user || '--' }}</span>
        </div>
      </div>
      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="detailDialogVisible = false">关闭</el-button>
        <el-button
          v-if="canCancel(selectedRecord)"
          type="danger"
          plain
          @click="cancelReservation(selectedRecord)"
        >取消预约</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from "vue";
import {
  useRouter,
  useRoute,
  useHttp,
  useMessage,
  useMessageBox,
} from "@/common/vueApi";
import dayjs from "dayjs";

const router = useRouter();
const route = useRoute();
const $http = useHttp();
const ElMessage = useMessage();
const ElMessageBox = useMessageBox();

// 响应式数据
const loading = ref(false);
const recordList = ref([]);
const detailDialogVisible = ref(false);
const selectedRecord = ref(null);

// 搜索表单
const searchForm = reactive({
  roomName: "",
  dateRange: [],
  contacts: "",
  createUserDisp: "",
});

// 分页配置
const pagination = reactive({
  pageNo: 1,
  pageSize: 10,
  total: 0,
});

// 返回预约页面
const backToBooking = () => {
  router.push("/meetingRoomBooking");
};

// 刷新列表
const refreshList = () => {
  fetchRecordList();
};

// 搜索记录
const searchRecords = () => {
  pagination.pageNo = 1;
  fetchRecordList();
};

// 重置搜索
const resetSearch = () => {
  searchForm.roomName = "";
  searchForm.dateRange = [];
  searchForm.contacts = "";
  searchForm.createUserDisp = "";

  pagination.pageNo = 1;
  fetchRecordList();
};

// 格式化创建时间
const formatCreateTime = (time) => {
  if (!time) return "";
  // 只保留日期和时间，不显示秒
  const dateTime = time.split(" ");
  if (dateTime.length >= 2) {
    const timePart = dateTime[1].split(":");
    return `${dateTime[0]} ${timePart[0]}:${timePart[1]}`;
  }
  return time;
};

// 获取预约记录列表
const fetchRecordList = async () => {
  loading.value = true;
  try {
    const url = `/park/select/srvreserve_record_select`;
    const req = {
      serviceName: "srvreserve_record_select",
      colNames: ["*"],
      condition: [],
      page: {
        pageNo: pagination.pageNo,
        rownumber: pagination.pageSize,
      },
      query_source: "list_page",
    };

    // 添加搜索条件
    if (searchForm.roomName) {
      req.condition.push({
        colName: "rsvo_name",
        ruleType: "like",
        value: searchForm.roomName,
      });
    }

    if (searchForm.dateRange && searchForm.dateRange.length === 2) {
      req.condition.push({
        colName: "rsvr_date",
        ruleType: "between",
        value: [searchForm.dateRange[0], searchForm.dateRange[1]],
      });
    }

    if (searchForm.contacts) {
      req.condition.push({
        colName: "contacts",
        ruleType: "like",
        value: searchForm.contacts,
      });
    }

    if (searchForm.createUserDisp) {
      req.condition.push({
        colName: "create_user_disp",
        ruleType: "like",
        value: searchForm.createUserDisp,
      });
    }


    const res = await $http.post(url, req);
    if (res?.data?.state === "SUCCESS") {
      recordList.value = res.data.data || [];
      pagination.total = res.data.page?.total || 0;
    } else if (res?.data?.resultMessage) {
      ElMessage.error(res.data.resultMessage);
    }
  } catch (error) {
    ElMessage.error("获取预约记录失败: " + error.message);
  } finally {
    loading.value = false;
  }
};

// 查看详情
const viewDetail = (record) => {
  selectedRecord.value = record;
  detailDialogVisible.value = true;
};

// 取消预约
const cancelReservation = (record) => {
  ElMessageBox.confirm("确定要取消该预约吗？取消后不可恢复。", "取消预约", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      try {
        const url = `/park/operate/srvreserve_record_cancel_update`;
        const req = [
          {
            serviceName: "srvreserve_record_cancel_update",
            condition: [
              {
                colName: "rsvr_no",
                ruleType: "eq",
                value: record.rsvr_no,
              },
            ],
            data: [{ "review_status": "已取消" }],
          },
        ];

        const res = await $http.post(url, req);
        if (res?.data?.state === "SUCCESS") {
          ElMessage.success("预约已取消");
          detailDialogVisible.value = false;
          fetchRecordList();
        } else if (res?.data?.resultMessage) {
          ElMessage.error(res.data.resultMessage);
        }
      } catch (error) {
        ElMessage.error("取消预约失败: " + error.message);
      }
    })
    .catch(() => { });
};

const currentUserNo = computed(() => {
  let userInfo = top.user || sessionStorage.getItem('current_login_user') || sessionStorage.getItem("login_user_info")
  if (userInfo && typeof userInfo === 'string') {
    try {
      userInfo = JSON.parse(userInfo)
    } catch (error) {
      userInfo = {}
    }
  }
  return userInfo?.user_no || ''
})

// 判断是否可以取消预约
const canCancel = (record) => {
  if (!record) return false;
  return currentUserNo.value && record.create_user === currentUserNo.value && record?.review_status === '待审核'
  // 根据状态判断是否可以取消
};

// 获取状态类型
const getStatusType = (status) => {
  switch (status) {
    case "通过":
      return "success";
    case "不通过":
      return "danger";
    case "待审核":
      return "info";
    default:
      return "info";
  }
};

// 获取状态文本
const getStatusText = (status) => {
  switch (status) {
    case 1:
    case "1":
      return "已预约";
    case 2:
    case "2":
      return "已取消";
    case 3:
    case "3":
      return "已完成";
    default:
      return status;
  }
};

// 格式化时间
const formatTime = (timeStr) => {
  if (!timeStr) return "";
  if (typeof timeStr === 'string' && timeStr.includes(',')) {
    let timeArr = timeStr.split(',')
    return timeArr.map(item => dayjs(`2000-01-01 ${item}`).format("HH:mm")).join('、')
    // if (timeArr.length > 1) {
    //   return dayjs(`2000-01-01 ${timeArr[0]}`).format("HH:mm") + ' - ' + dayjs(`2000-01-01 ${timeArr[timeArr.length - 1]}`).format("HH:mm");
    // }
  }
  return dayjs(`2000-01-01 ${timeStr}`).format("HH:mm");
};

const formatTimeRange = (record) => {
  if (!record) return "";
  if (record.start_time && record.end_time) {
    const start_time = record.start_time.split(',')[0]
    return dayjs(`${record.rsvr_date} ${start_time}`).format("HH:mm") + ' - ' + dayjs(`${record.rsvr_date} ${record.end_time}`).format("HH:mm");
  }
  return formatTime(record.start_time)
}

// 分页处理
const handleSizeChange = (size) => {
  pagination.pageSize = size;
  fetchRecordList();
};

const handleCurrentChange = (page) => {
  pagination.pageNo = page;
  fetchRecordList();
};

// 生命周期钩子
onMounted(() => {
  fetchRecordList();
});
</script>

<style scoped lang="scss">
.el-button--primary {
  color: #fff;
  background-color: #007bff;
  border-color: #007bff;
}

.history-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f6f8fa;
  padding: 16px;
}

.history-container {
  width: 100%;
  background-color: white;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0px 8px 10px 0px rgba(183, 215, 247, 0.2);
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  .history-title {
    font-size: 24px;
    color: #333;
    margin: 0;
  }

  .history-actions {
    display: flex;
    gap: 12px;
  }
}

.history-btn {
  display: flex;
  align-items: center;
  gap: 5px;

  i {
    font-size: 16px;
  }
}

.reserve-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  // background-color: #409eff;
  // border-color: #409eff;

  i {
    font-size: 16px;
  }
}

.search-btn {
  // background-color: #409eff;
  // border-color: #409eff;
}

.search-filter {
  background-color: #f9f9f9;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 24px;

  .search-form {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.record-list {
  .empty-data {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 0;

    .empty-icon {
      margin-bottom: 16px;
    }

    .empty-text {
      font-size: 16px;
      color: #909399;
      margin-bottom: 20px;
    }
  }

  .record-cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 20px;
    margin-bottom: 20px;

    .record-card {
      background-color: #fff;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      overflow: hidden;
      transition: transform 0.3s, box-shadow 0.3s;
      border: 1px solid #ebeef5;

      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
      }

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px;
        background-color: #f5f7fa;
        border-bottom: 1px solid #ebeef5;

        .room-name {
          font-size: 18px;
          font-weight: bold;
          color: #303133;
        }
      }

      .card-body {
        padding: 16px;

        .info-row {
          display: flex;
          margin-bottom: 12px;
          // flex-wrap: wrap;

          &:last-child {
            margin-bottom: 0;
          }

          .info-item {
            display: flex;
            align-items: center;
            margin-right: 16px;
            margin-bottom: 8px;

            i {
              color: #409eff;
              margin-right: 8px;
              font-size: 16px;
            }

            span {
              color: #606266;
            }

            .remark-text {
              max-width: 120px;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
          }
        }
      }

      .card-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        border-top: 1px solid #ebeef5;
        background-color: #fafafa;

        .create-info {
          display: flex;
          flex-direction: column;
        }

        .create-time {
          font-size: 12px;
          color: #909399;
        }

        .card-actions {
          display: flex;
          gap: 8px;
        }
      }
    }
  }
}

.detail-content {
  .detail-item {
    display: flex;
    margin-bottom: 16px;
    font-size: 16px;
    line-height: 24px;

    .detail-label {
      width: 100px;
      color: #666;
      text-align: right;
      padding-right: 12px;
    }

    .detail-value {
      flex: 1;
      color: #333;
    }
  }
}

@media screen and (max-width: 768px) {
  .history-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .search-filter .search-form {
    flex-direction: column;
  }

  .record-list {
    .record-cards {
      grid-template-columns: 1fr;
    }

    .record-card {
      .card-body {
        .info-row {
          flex-direction: column;

          .info-item {
            margin-right: 0;
            margin-bottom: 8px;
          }
        }
      }

      .card-footer {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;

        .create-time {
          margin-bottom: 4px;
        }
      }
    }
  }

  .detail-content .detail-item {
    flex-direction: column;

    .detail-label {
      width: 100%;
      text-align: left;
      margin-bottom: 4px;
    }
  }
}
</style>