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
            clearable
          />
          <el-button type="primary" class="search-btn" @click="fetchRoomList"
            >搜索</el-button
          >
        </div>
      </div>
      <div
        class="date-header-center"
        v-if="selectedTime && selectedTime.start_time"
      >
        当前选择的是：{{ selectedDate }}
        <span class="text-blue">
          {{ selectedTime.rsvo_name }}
        </span>
        时间段：
        <span>
          {{ formatTime(selectedTime.start_time) }} -
          {{ formatTime(selectedTime.end_time) }}
        </span>
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
        <template v-for="item in roomList">
          <div class="room-row" v-if="item.timeList && item.timeList.length">
            <!-- 会议室信息 -->
            <div class="room-info">
              <div class="room-header">
                <div class="room-header-left">
                  <div class="room-icon">
                    <!-- 📍 -->
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                    >
                      <g fill="none" fill-rule="evenodd">
                        <path
                          d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z"
                        />
                        <path
                          fill="currentColor"
                          d="M16 3.77v16.46a1.5 1.5 0 0 1-1.747 1.479l-8.582-1.43A2 2 0 0 1 4 18.306V5.694a2 2 0 0 1 1.671-1.973l8.582-1.43A1.5 1.5 0 0 1 16 3.771ZM18 5a2 2 0 0 1 1.995 1.85L20 7v10a2 2 0 0 1-1.85 1.995L18 19h-1V5zm-6.5 5.5a1.5 1.5 0 1 0 0 3a1.5 1.5 0 0 0 0-3"
                        />
                      </g>
                    </svg>
                  </div>
                  <div class="room-details">
                    <div class="room-name">{{ item.rsvo_name || "" }}</div>
                    <!-- <div class="room-location">{{ item.address || "" }}</div> -->
                  </div>
                </div>
                <div class="room-intro" v-if="item.rsvo_intro">
                  <el-popover placement="right" width="400" trigger="hover">
                    <div
                      v-if="item.rsvo_intro"
                      v-html="item.rsvo_intro"
                      style="max-height: 300px; overflow-y: auto"
                    ></div>
                    <span slot="reference" class="cursor-pointer"
                      >介绍<i
                        class="el-icon-info ml-1"
                        style="color: oklch(79.5% 0.184 86.047)"
                      ></i
                    ></span>
                  </el-popover>
                  <!-- <span>信息：</span>
                <div class="capacity-number">{{ item.max || "" }}</div> -->
                </div>
              </div>
            </div>

            <!-- 时间段网格 -->
            <div class="time-grid" v-if="item.timeList">
              <div
                v-for="time in item.timeList"
                :key="time.slot"
                class="time-slot"
                :class="{
                  occupied: isTimeOccupied(time),
                  available: !isTimeOccupied(time),
                  selected: isTimeSelected(time),
                }"
                @click="selectTimeSlot(time)"
              >
                <div class="time-label">{{ time.label }}</div>
                <div class="status-label">
                  {{ isTimeOccupied(time) ? "已预约" : "空闲" }}
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- 提交相关 -->
    <div class="submit-container">
      <div class="submit-left">
        <div class="form-item">
          <div class="form-label">
            <span class="text-red">*</span>
            联系人
          </div>
          <el-input
            v-model="contacts"
            placeholder="联系人"
            class="search-input"
            clearable
          />
        </div>
        <div class="form-item">
          <div class="form-label">
            <span class="text-red">*</span>
            联系方式
          </div>
          <el-input
            v-model="mobilephone"
            placeholder="联系方式"
            class="search-input"
            clearable
          />
        </div>
        <div class="form-item">
          <div class="form-label">人数</div>
          <el-input
            v-model="count"
            placeholder="人数"
            class="search-input"
            clearable
            type="number"
          />
        </div>
        <div class="form-item">
          <div class="form-label">备注</div>
          <el-input
            v-model="remark"
            placeholder="备注"
            class="search-input"
            clearable
          />
        </div>
      </div>
      <div class="submit-right">
        <el-button type="primary" @click="submitReservation">
          立即预约
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useMessage, useMessageBox, useHttp, useUtils } from "@/common/vueApi";
import dayjs from "dayjs";

const ElMessage = useMessage();
const ElMessageBox = useMessageBox();
const $http = useHttp();
const { addTabByUrl } = useUtils();

// 响应式数据
const searchKey = ref("");
const contacts = ref("");
const mobilephone = ref("");
const count = ref(1); // 人数
const remark = ref("");

const roomList = ref([]);
const selectedDate = ref(dayjs().format("YYYY-MM-DD"));
const selectedTime = ref(null);

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

const selectTimeSlot = (item) => {
  if (isTimeOccupied(item)) {
    return; // 已被预约的时间段不能选择
  }
  selectedTime.value = {
    rsvt_no: item.rsvt_no, // 预约时段编码
    rsvo_no: item.rsvo_no, // 预约场所编码
    ...item,
  };
};

const isTimeOccupied = (item = {}) => {
  return item?.cnty && item.cnty > 0;
};

const isTimeSelected = (item = {}) => {
  return (
    selectedTime.value &&
    selectedTime.value.rsvo_no === item.rsvo_no &&
    selectedTime.value.rsvt_no === item.rsvt_no
  );
};

const navigateToHistory = () => {
  // 导航到历史记录页面
  const url = `/vpages/index.html#/list/srvreserve_record_select?menuapp=park`;
  addTabByUrl(url, "预约记录");
};

const formatTime = (timeStr) => {
  return dayjs(`${selectedDate.value} ${timeStr}`).format("HH:mm");
};

const fetchRoomList = async () => {
  try {
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
    if (searchKey.value) {
      req.condition.push({
        colName: "rsvo_name",
        ruleType: "like",
        value: searchKey.value,
      });
    }
    if (selectedDate.value) {
      // req.condition.push({
      //   colName: "datey",
      //   ruleType: "eq",
      //   value: selectedDate.value,
      // })
    }
    const res = await $http.post(url, req);
    const list = [];
    if (res?.data?.state === "SUCCESS") {
      console.log(res.data.data);
      if (Array.isArray(res.data.data)) {
        for (var index = 0; index < res.data.data.length; index++) {
          const item = res.data.data[index];
          item.timeList = await getTime(item.rsvo_no);
          list.push(item);
        }
      }
    }

    roomList.value = list;
  } catch (error) {
    ElMessage.error("获取会议室列表失败: " + error.message);
  }
};

async function getTime(rsvo_no) {
  const url = `/park/select/srvreserve_set_time_div_user_obj_date_select`;
  const req = {
    serviceName: "srvreserve_set_time_div_user_obj_date_select",
    colNames: ["*"],
    condition: [
      {
        colName: "rsvo_no",
        ruleType: "eq",
        value: rsvo_no,
      },
      {
        colName: "datey",
        ruleType: "eq",
        value: selectedDate.value || dayjs().format("YYYY-MM-DD"),
      },
    ],
    page: {
      pageNo: 1,
      rownumber: 100,
    },
  };
  const res = await $http.post(url, req);
  if (res?.data?.state === "SUCCESS") {
    return res.data.data.map((item) => {
      item.label = formatTime(item.start_time);
      return item;
    });
  } else {
    if (res.data.resultMessage) {
      ElMessage.error(res.data.resultMessage);
    }
    return [];
  }
}

const submitReservation = async () => {
  if (!selectedTime.value) {
    ElMessage.warning("请选择预约时间段");
    return;
  }

  try {
    // 预约提交
    const url = `/park/operate/srvreserve_record_add`;
    const data = selectedTime.value;
    if (!data) {
      ElMessage.warning("请选择预约时间段");
      return;
    }
    const req = [
      {
        serviceName: "srvreserve_record_add",
        condition: [],
        data: [
          {
            rsvo_no: data.rsvo_no,
            rsvr_date: selectedDate.value || data.datey,
            start_time: data.start_time,
            count: 1, // 人数
            rsvp_no: data.rsvp_no,
            rsvt_no: data.rsvt_no,
            contacts: "aaa",
            mobilephone: "123123",
            remark: "", //备注
          },
        ],
      },
    ];
    const res = await $http.post(url, req);
    if (res.data?.state === "SUCCESS") {
      ElMessageBox.confirm("预约成功!", "提示", {
        confirmButtonText: "确定",
        type: "success",
        showCancelButton: false,
      }).then(() => {
        // 下一步操作
      });
    } else if (res.data?.resultMessage) {
      ElMessage.error(res.data?.resultMessage);
    }
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
.el-button--primary {
  color: #fff;
  background-color: #007bff;
  border-color: #007bff;
}
.history-icon {
  display: inline-block;
  font-style: normal;
}

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
  }

  .date-selector {
    display: flex;
    align-items: center;
    gap: 12px;

    .date-label {
      font-size: 16px;
      font-weight: 500;
      color: #333;
      min-width: 40px;
    }

    .date-picker {
      min-width: 170px;
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

@media screen and (max-width: 950px) {
  .date-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;

    .date-header-left,
    .date-header-right {
      width: 100%;
      display: flex;
      justify-content: center;
    }
    .search-section {
      .search-input {
        min-width: 100px;
      }
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
  // border-radius: 0 0 20px 20px;
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
    background: #fff;
  }
}

// 提交预约区域
.submit-container {
  padding: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  border-radius: 0 0 20px 20px;
  border-top: 1px solid #f0f0f0;
  gap: 20px;
  .submit-left {
    flex: 1;
    display: grid;
    gap: 20px;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    .form-item {
      display: flex;
      flex-direction: column;
      gap: 8px;
      .form-label {
        font-size: 14px;
        color: #333;
        .text-red {
          color: red;
        }
      }
    }
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
        .room-header-left {
          display: flex;
          align-items: center;
        }
        .room-icon {
          width: 28px;
          height: 28px;
          background-color: rgba(0, 122, 255, 1);
          border-radius: 8px;
          display: flex;
          justify-content: center;
          align-items: center;
          color: #fff;
          margin-right: 10px;
        }

        .room-details {
          .room-name {
            font-size: 18px;
            font-weight: 600;
            color: #333;
            // margin-bottom: 4px;
          }

          .room-location {
            font-size: 14px;
            color: #666;
          }
        }
      }

      .room-intro {
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
