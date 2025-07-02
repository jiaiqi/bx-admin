<template>
  <div class="calendar_wrapper">
    <!-- 顶部日期选择 -->
    <div class="date-header">
      <div class="date-header-left">
        <div class="date-selector">
          <span class="date-label">日期</span>
          <el-date-picker
            v-model="selectedDate"
            type="date"
            placeholder="选择日期"
            format="yyyy年MM月dd日"
            value-format="yyyy-MM-dd"
            @change="handleDateChange"
            class="date-picker"
          />
        </div>
        <div class="search-section">
          <el-input
            v-model="searchKey"
            placeholder="输入关键词搜索"
            class="search-input"
          />
          <el-button type="primary" class="search-btn">搜索</el-button>
        </div>
      </div>
      <div class="date-header-right">
        <el-button class="history-btn" @click="navigateToHistory">
          <i class="history-icon">🕐</i>
          <span>历史记录</span>
        </el-button>
        <el-button
          type="primary"
          class="reserve-btn"
          @click="submitReservation"
          :disabled="!selectedTime"
        >
          立即预约
        </el-button>
      </div>
    </div>

    <!-- 会议室时间表格 -->
    <div class="calendar_container">
      <div class="room-schedule">
        <div v-for="item in roomList" :key="item.rsvo_no" class="room-row">
          <!-- 会议室信息 -->
          <div class="room-info">
            <div class="room-header">
              <div class="room-header-left">
                <div class="room-icon">📍</div>
                <div class="room-details">
                  <div class="room-name">{{ item.rsvo_name || "" }}</div>
                  <div class="room-location">{{ item.address || "" }}</div>
                </div>
              </div>
              <div class="room-capacity">
                <span>可容纳人数：</span>
                <div class="capacity-number">{{ item.max || "" }}</div>
              </div>
            </div>
          </div>

          <!-- 时间段网格 -->
          <div class="time-grid">
            <div
              v-for="time in timeSlots"
              :key="time.slot"
              class="time-slot"
              :class="{
                occupied: isTimeOccupied(item.rsvo_no, time.slot),
                available: !isTimeOccupied(item.rsvo_no, time.slot),
                selected: isTimeSelected(item.rsvo_no, time.slot),
              }"
              @click="selectTimeSlot(item.rsvo_no, time)"
            >
              <div class="time-label">{{ time.label }}</div>
              <div class="status-label">
                {{
                  isTimeOccupied(item.rsvo_no, time.slot) ? "已预约" : "空闲"
                }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-ui";
import { useMessage,useHttp } from "@/common/vueApi";
import dayjs from "dayjs";

const message = useMessage();
const $http = useHttp()
// 响应式数据
const searchKey = ref("");
const roomList = ref([]);
const selectedDate = ref(dayjs().format("YYYY-MM-DD"));
const selectedTime = ref(null);
const reservationData = ref({});

// 时间段配置
const timeSlots = ref([
  { slot: "09:00", label: "9:00" },
  { slot: "09:30", label: "9:30" },
  { slot: "10:00", label: "10:00" },
  { slot: "10:30", label: "10:30" },
  { slot: "11:00", label: "11:00" },
  { slot: "11:30", label: "11:30" },
  { slot: "12:00", label: "12:00" },
  { slot: "14:00", label: "14:00" },
  { slot: "14:30", label: "14:30" },
  { slot: "15:00", label: "15:00" },
  { slot: "15:30", label: "15:30" },
  { slot: "16:00", label: "16:00" },
  { slot: "16:30", label: "16:30" },
  { slot: "17:00", label: "17:00" },
]);

// 方法定义
const handleDateChange = (date) => {
  selectedDate.value = date;
  fetchRoomList();
};

const selectTimeSlot = (roomNo, time) => {
  if (isTimeOccupied(roomNo, time.slot)) {
    return; // 已被预约的时间段不能选择
  }

  selectedTime.value = {
    roomNo,
    timeSlot: time.slot,
    date: selectedDate.value,
  };
};

const isTimeOccupied = (roomNo, timeSlot) => {
  const key = `${roomNo}_${timeSlot}`;
  return reservationData.value[key] || false;
};

const isTimeSelected = (roomNo, timeSlot) => {
  return (
    selectedTime.value &&
    selectedTime.value.roomNo === roomNo &&
    selectedTime.value.timeSlot === timeSlot
  );
};

const navigateToHistory = () => {
  // 实际项目中替换为路由导航
  console.log("导航到历史记录页面");
};

const formatTime = (timeStr) => {
  return dayjs(`${selectedDate.value} ${timeStr}`).format("HH:mm");
};

const fetchRoomList = async () => {
  try {
    // 模拟 API 调用
    // const res = await mockApiCall();
    const url = `/park/select/srvreserve_obj_select`;
    const req = {
      serviceName: "srvreserve_obj_select",
      colNames: ["*"],
      condition: [],
      page: {
        pageNo: 1,
        rownumber: 100,
      },
      query_source: "list_page",
    };
    const res = await $http.post(url, req);
    const list = [];
    debugger
    if (res?.data?.state === "SUCCESS") {
      console.log(res.data.data);
      if (Array.isArray(res.data.data)) {
        for (var index = 0; index < res.data.data.length; index++) {
          const item = res.data.data[index];
          // if (item.rsvo_no) {
          //   item.timeList = await this.getTime(item.rsvo_no);
          //   if (!item.timeList.length) {
          //     item.timeList = testData.map((data) => {
          //       data.rsvo_no = item.rsvo_no;
          //       return data;
          //     });
          //   }
          // }
          list.push(item);
        }
      }
    }

    roomList.value = list;
    // 初始化预约数据
    initReservationData();
  } catch (error) {
    message.error("获取会议室列表失败: " + error.message);
  }
};

const initReservationData = () => {
  // 模拟一些已预约的时间段
  reservationData.value = {
    // 会议室001
    "RSVO250618140010_09:00": true,
    "RSVO250618140010_12:00": true,
    "RSVO250618140010_14:00": true,
    "RSVO250618140010_14:30": true,
    "RSVO250618140010_15:00": true,
    "RSVO250618140010_16:30": true,
    "RSVO250618140010_17:00": true,

    // 会议室002
    "RSVO250618140011_09:00": true,
    "RSVO250618140011_12:00": true,
    "RSVO250618140011_14:00": true,
    "RSVO250618140011_14:30": true,
    "RSVO250618140011_15:00": true,
    "RSVO250618140011_16:30": true,
    "RSVO250618140011_17:00": true,

    // 会议室003
    "RSVO250618140012_09:00": true,
    "RSVO250618140012_10:00": true,
    "RSVO250618140012_11:00": true,
    "RSVO250618140012_14:00": true,
    "RSVO250618140012_15:30": true,
    "RSVO250618140012_16:00": true,

    // 会议室004
    "RSVO250618140013_09:30": true,
    "RSVO250618140013_10:30": true,
    "RSVO250618140013_11:30": true,
    "RSVO250618140013_14:30": true,
    "RSVO250618140013_15:00": true,
    "RSVO250618140013_17:00": true,

    // 会议室005
    "RSVO250618140014_09:00": true,
    "RSVO250618140014_10:30": true,
    "RSVO250618140014_12:00": true,
    "RSVO250618140014_15:30": true,
    "RSVO250618140014_16:30": true,

    // 会议室006
    "RSVO250618140015_09:30": true,
    "RSVO250618140015_11:00": true,
    "RSVO250618140015_14:00": true,
    "RSVO250618140015_16:00": true,
    "RSVO250618140015_17:00": true,

    // 会议室007
    "RSVO250618140016_10:00": true,
    "RSVO250618140016_11:30": true,
    "RSVO250618140016_12:00": true,
    "RSVO250618140016_14:30": true,
    "RSVO250618140016_15:00": true,
    "RSVO250618140016_16:30": true,

    // 会议室008
    "RSVO250618140017_09:00": true,
    "RSVO250618140017_10:00": true,
    "RSVO250618140017_11:00": true,
    "RSVO250618140017_12:00": true,
    "RSVO250618140017_15:30": true,
    "RSVO250618140017_16:00": true,
    "RSVO250618140017_17:00": true,
  };
};

const submitReservation = async () => {
  if (!selectedTime.value) {
    ElMessage.warning("请选择预约时间段");
    return;
  }

  try {
    // 模拟预约提交
    const result = await mockReservationApi(selectedTime.value);
    ElMessageBox.confirm("预约成功!", "提示", {
      confirmButtonText: "确定",
      type: "success",
      showCancelButton: false,
    }).then(() => {
      // 实际项目中替换为路由导航
      console.log("导航到结果页面", result);
    });
  } catch (error) {
    ElMessage.error("预约失败: " + error.message);
  }
};

// 模拟 API
const mockApiCall = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: [
          {
            rsvo_no: "RSVO250618140010",
            rsvo_name: "会议室001",
            max: 50,
            address: "创新科技产业园一期西区·办公楼B6-204",
          },
          {
            rsvo_no: "RSVO250618140011",
            rsvo_name: "会议室002",
            max: 35,
            address: "创新科技产业园一期西区·办公楼B6-205",
          },
          {
            rsvo_no: "RSVO250618140012",
            rsvo_name: "会议室003",
            max: 30,
            address: "创新科技产业园一期西区·办公楼B6-206",
          },
          {
            rsvo_no: "RSVO250618140013",
            rsvo_name: "会议室004",
            max: 25,
            address: "创新科技产业园一期西区·办公楼B6-207",
          },
          {
            rsvo_no: "RSVO250618140014",
            rsvo_name: "会议室005",
            max: 40,
            address: "创新科技产业园一期西区·办公楼B6-208",
          },
          {
            rsvo_no: "RSVO250618140015",
            rsvo_name: "会议室006",
            max: 20,
            address: "创新科技产业园一期西区·办公楼B6-209",
          },
          {
            rsvo_no: "RSVO250618140016",
            rsvo_name: "会议室007",
            max: 60,
            address: "创新科技产业园一期西区·办公楼B6-210",
          },
          {
            rsvo_no: "RSVO250618140017",
            rsvo_name: "会议室008",
            max: 45,
            address: "创新科技产业园一期西区·办公楼B6-211",
          },
        ],
      });
    }, 500);
  });
};

const mockReservationApi = (timeSlot) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        reservationId: "RES-" + Date.now(),
        timeSlot,
      });
    }, 500);
  });
};

// 生命周期钩子
onMounted(() => {
  fetchRoomList();
});
</script>

<style scoped lang="scss">
.calendar_wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f6f8fa;
  // max-width: 800px;
  margin: 0 auto;
  width: 100%;
  padding: 16px;
  box-shadow: 0px 8px 10px 0px rgba(183, 215, 247, 0.2);
  border-radius: 20px;
  overflow: hidden;
}

// 顶部日期选择区域
.date-header {
  background: white;
  padding: 16px 20px;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 20px 20px 0 0;
  overflow: hidden;
  .date-header-left {
    display: flex;
    gap: 10px;
    align-items: center;
  }
  .date-header-right {
    display: flex;
    align-items: center;
    .el-button--primary {
      color: #fff;
      background-color: #007bff;
      border-color: #007bff;
    }
    .history-icon {
      display: inline-block;
      font-style: normal;
    }
  }

  .date-selector {
    display: flex;
    align-items: center;
    gap: 12px;

    .date-label {
      font-size: 16px;
      font-weight: 500;
      color: #333;
    }

    .date-picker {
      width: 200px;
    }
  }

  .search-section {
    display: flex;
    gap: 12px;

    .search-input {
      width: 300px;
    }

    .search-btn {
      background: #007bff;
      border-color: #007bff;
    }
  }
}

// 主要内容区域
.calendar_container {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  padding-bottom: 100px;
  background: #fefefe;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-radius: 0 0 20px 20px;
  overflow-y: auto;
  &::-webkit-scrollbar-thumb {
    background: transparent;
    border-radius: 4px;
  }
  &::-webkit-scrollbar {
    width: 4px;
    height: 4px;
  }
  &:hover {
    &::-webkit-scrollbar-thumb {
      background: rgba($color: #000, $alpha: 0.3);
      border-radius: 4px;
    }
  }
  &::-webkit-scrollbar-track {
    background: #f0f0f0;
  }
}

// 会议室时间表格
.room-schedule {
  display: grid;
  grid-gap: 16px;
  grid-template-columns: repeat(auto-fit, minmax(700px, 1fr));
  justify-content: center;
  // max-width: 1300px;
  margin: 0 auto;

  .room-row {
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    border: 1px solid rgba(239, 239, 239, 1);
    overflow: hidden;

    .room-info {
      padding: 10px;
      // border-bottom: 1px solid #f0f0f0;

      .room-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        &-left {
          display: flex;
          align-items: center;
        }
        .room-icon {
          font-size: 20px;
          margin-right: 12px;
        }

        .room-details {
          .room-name {
            font-size: 18px;
            font-weight: 600;
            color: #333;
            margin-bottom: 4px;
          }

          .room-location {
            font-size: 14px;
            color: #666;
          }
        }
      }

      .room-capacity {
        display: flex;
        align-items: center;
        font-size: 14px;
        color: #666;

        .capacity-number {
          margin-left: 8px;
          font-weight: 600;
          color: #333;
        }
      }
    }

    .time-grid {
      padding: 10px;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
      gap: 10px;

      .time-slot {
        background: #f2f2f7;
        padding: 12px 8px;
        text-align: center;
        cursor: pointer;
        transition: all 0.2s ease;
        min-height: 60px;
        min-width: 100px;
        border-radius: 10px;
        display: flex;
        flex-direction: column;
        justify-content: center;

        .time-label {
          // font-size: 12px;
          font-weight: 700;
          margin-bottom: 4px;
          white-space: pre-line;
        }

        .status-label {
          font-size: 14px;
          opacity: 0.8;
        }

        &.available {
          // background-color: #f8f9fa;
          color: #333;

          &:hover {
            // background-color: #e3f2fd;
            transform: translateY(-1px);
          }
        }

        &.occupied {
          background-color: #9ef3dd;
          color: #00695c;
          cursor: not-allowed;
        }

        &.selected {
          background-color: #2196f3;
          color: white;
          box-shadow: 0 2px 8px rgba(33, 150, 243, 0.3);
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 800px) {
  .calendar_wrapper {
    margin: 0;
    max-width: none;
  }
}

@media (max-width: 768px) {
  .date-header {
    flex-direction: column;
    gap: 16px;
    padding: 12px 16px;

    .date-selector {
      .date-picker {
        width: 100%;
      }
    }

    .search-section {
      width: 100%;

      .search-input {
        flex: 1;
      }
    }
  }

  .calendar_container {
    padding: 12px;
  }

  .room-schedule {
    .room-row {
      .room-info {
        padding: 16px;

        .room-header {
          .room-details {
            .room-name {
              font-size: 16px;
            }

            .room-location {
              font-size: 12px;
            }
          }
        }
      }
    }
  }

  .time-grid {
    grid-template-columns: repeat(4, 1fr) !important;

    .time-slot {
      min-height: 50px;
      padding: 8px 4px;

      .time-label {
        font-size: 11px;
      }

      .status-label {
        font-size: 9px;
      }
    }
  }
}

@media (max-width: 480px) {
  .time-grid {
    grid-template-columns: repeat(3, 1fr) !important;
  }

  .reserve-btn {
    width: 120px !important;
    font-size: 13px !important;
  }
}
</style>
