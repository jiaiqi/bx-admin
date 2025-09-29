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
          <el-button
            type="primary"
            class="search-btn"
            @click="fetchRoomList()"
          >搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </div>
      </div>
      <div
        class="date-header-center"
        v-if="selectedTimes.length > 0"
      >
        <div class="selected-count">
          已选择 <span class="text-blue">{{ selectedTimes[0].rsvo_name }}</span> 的
          <span class="text-blue">{{ selectedTimes.length }}</span> 个连续时间段
          <el-button
            size="small"
            type="text"
            @click="clearSelectedTimes"
          >清空</el-button>
        </div>
      </div>
      <div class="date-header-right">
        <el-button
          class="history-btn"
          @click="fetchRoomList(false)"
        >
          <i class="history-icon"></i>
          <span>刷新</span>
        </el-button>

        <el-button
          class="history-btn"
          @click="navigateToHistory"
        >
          <i class="history-icon">🕐</i>
          <span>历史记录</span>
        </el-button>
        <el-button
          type="primary"
          class="reserve-btn"
          @click="submitReservation"
          :disabled="selectedTimes.length === 0"
        >
          立即预约
        </el-button>
      </div>
    </div>

    <!-- 会议室时间表格 -->
    <div class="calendar_container">
      <div class="room-schedule">
        <template v-for="item in roomList">
          <div
            class="room-row"
            v-if="item.timeList && item.timeList.length"
          >
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
                      <g
                        fill="none"
                        fill-rule="evenodd"
                      >
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
                <div
                  class="room-intro"
                  v-if="item.rsvo_intro"
                >
                  <el-popover
                    placement="right"
                    width="400"
                    trigger="hover"
                  >
                    <div
                      v-if="item.rsvo_intro"
                      v-html="item.rsvo_intro"
                      style="max-height: 300px; overflow-y: auto"
                    ></div>
                    <span
                      slot="reference"
                      class="cursor-pointer"
                    >介绍<i
                        class="el-icon-info ml-1"
                        style="color: oklch(79.5% 0.184 86.047)"
                      ></i></span>
                  </el-popover>
                  <!-- <span>信息：</span>
                <div class="capacity-number">{{ item.max || "" }}</div> -->
                </div>
              </div>
            </div>

            <!-- 时间段网格 -->
            <div
              class="time-grid"
              v-if="item.timeList"
            >
              <div
                v-for="time in item.timeList"
                :key="time.slot"
                class="time-slot"
                :class="{
                  occupied: isTimeOccupied(time),
                  available: !isTimeOccupied(time) && isTimeSlotBookable(time),
                  selected: isTimeSelected(time),
                  disabled: !isTimeSlotBookable(time) && !isTimeOccupied(time),
                }"
                @click="selectTimeSlot(time)"
              >
                <div class="time-label">{{ time.label }}</div>
                <div class="status-label">
                  {{
                    isTimeOccupied(time) ? "已预约" :
                      !isTimeSlotBookable(time) ? "已过期" : "空闲"
                  }}
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- 底部加载状态 -->
        <div
          class="loading-container"
          v-if="roomList.length > 0"
        >
          <div
            v-if="pageInfo.loading"
            class="loading-spinner"
          >
            <i class="el-icon-loading"></i>
            <span>加载中...</span>
          </div>
          <div
            v-else-if="!pageInfo.hasMore"
            class="no-more-data"
          >
            没有更多数据了
          </div>
          <div
            v-else
            class="load-more-hint"
          >
            滚动加载更多
          </div>
        </div>

        <!-- 无数据提示 -->
        <div
          v-if="roomList.length === 0 && !pageInfo.loading"
          class="empty-data"
        >
          <div class="empty-text">暂无会议室数据</div>
        </div>
      </div>
    </div>

    <!-- 预约表单对话框 -->
    <el-dialog
      title="填写预约信息"
      :visible.sync="dialogVisible"
      width="600px"
      :before-close="handleDialogClose"
      :close-on-click-modal="false"
      :destroy-on-close="true"
    >
      <div
        class="selected-times-list"
        v-if="selectedTimes.length > 0"
      >
        <div class="selected-times-title">已选择的连续时间段：</div>
        <div class="selected-room-info">
          <span class="info-label">会议室：</span>
          <span class="info-value">{{ selectedTimes[0].rsvo_name }}</span>
        </div>
        <div class="selected-time-range">
          <span class="info-label">时间范围：</span>
          <span class="info-value">
            {{ formatTime(selectedTimes[0].start_time) }} - {{
              formatTime(selectedTimes[selectedTimes.length - 1].end_time) }}
            (共{{ selectedTimes.length }}个时段)
          </span>
        </div>
      </div>
      <el-form
        :model="formData"
        ref="reservationForm"
        :rules="formRules"
        label-width="120px"
        class="mt-4"
      >
        <el-form-item
          label="会议/活动名称"
          prop="meeting_name"
        >
          <el-input
            v-model="formData.meeting_name"
            placeholder="请输入会议/活动名称"
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item
          label="联系人"
          prop="contacts"
        >
          <el-input
            v-model="formData.contacts"
            placeholder="请输入联系人姓名"
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item
          label="联系方式"
          prop="mobilephone"
        >
          <el-input
            v-model="formData.mobilephone"
            placeholder="请输入联系方式"
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item
          label="人数"
          prop="count"
          v-if="!hidePersonCount"
        >
          <div class="flex items-center justify-between">
            <el-input-number
              v-model="formData.count"
              :min="1"
              :max="getMaxCapacity()"
            ></el-input-number>
            <span class="ml-2">
              <i class="el-icon-info"></i>
              最大容纳
              <span class="">{{ getMaxCapacity() }}</span>
              人</span>
          </div>
        </el-form-item>
        <el-form-item
          label="备注"
          prop="remark"
        >
          <el-input
            v-model="formData.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          ></el-input>
        </el-form-item>
      </el-form>
      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button
          type="primary"
          @click="submitForm"
        >确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, reactive, computed } from "vue";
import {
  useMessage,
  useMessageBox,
  useHttp,
  useUtils,
  useRouter,
} from "@/common/vueApi";
import dayjs from "dayjs";

const ElMessage = useMessage();
const ElMessageBox = useMessageBox();
const $http = useHttp();
const { addTabByUrl } = useUtils();
const router = useRouter();

// 响应式数据
const searchKey = ref("");
const roomList = ref([]);
const selectedDate = ref(dayjs().format("YYYY-MM-DD"));
const selectedTimes = ref([]); // 改为数组，支持多选
const hidePersonCount = computed(() => {
  if (Array.isArray(selectedTimes.value)) {
    return selectedTimes.value?.length > 0 && selectedTimes.value.every(item => item.div_count === 1)
  }
})
// 分页相关
const pageInfo = reactive({
  pageNo: 1,
  pageSize: 5,
  total: 0,
  hasMore: true,
  loading: false
});

// 对话框相关
const dialogVisible = ref(false);
const reservationForm = ref(null);

// 表单数据
const formData = reactive({
  meeting_name: "", // 会议/活动名称
  contacts: "",
  mobilephone: "",
  count: 1,
  remark: "",
});

// 表单验证规则
const formRules = {
  meeting_name: [{ required: true, message: "请输入会议/活动名称", trigger: "blur" }],
  contacts: [{ required: true, message: "请输入联系人姓名", trigger: "blur" }],
  mobilephone: [{ required: true, message: "请输入联系方式", trigger: "blur" }],
};

const handleDateChange = (date) => {
  selectedDate.value = date;
  selectedTimes.value = []; // 切换日期时清空已选择的时间段
  fetchRoomList(false);
};

// 检查时间段是否可以预约（不能预约当前时间往前推半小时之前的时间段）
const isTimeSlotBookable = (item) => {
  const now = dayjs();
  const selectedDateTime = dayjs(`${selectedDate.value} ${item.start_time}`);
  const halfHourFromNow = now.subtract(30, 'minute');

  // 如果选择的时间段开始时间在当前时间往前推半小时之前，则不能预约
  if (selectedDateTime.isBefore(halfHourFromNow)) {
    return false;
  }

  return true;
};

// 检查是否可以取消指定的时间段（如果超过2个时间段，只能取消首尾）
const canCancelTimeSlot = (item) => {
  // 如果选中的时间段少于等于2个，可以随意取消
  if (selectedTimes.value.length <= 2) {
    return true;
  }

  // 获取当前会议室的所有时间段数据
  const currentRoom = roomList.value.find(room => room.rsvo_no === item.rsvo_no);
  if (!currentRoom || !currentRoom.timeList) return true;

  // 获取该会议室所有时间段的索引映射
  const timeIndexMap = new Map();
  currentRoom.timeList.forEach((time, index) => {
    timeIndexMap.set(time.rsvt_no, index);
  });

  // 获取要取消的时间段在该会议室中的索引位置
  const cancelItemIndex = timeIndexMap.get(item.rsvt_no);
  if (cancelItemIndex === undefined) return true;

  // 获取所有已选时间段在该会议室中的索引位置并排序
  const selectedIndexes = selectedTimes.value
    .map(time => timeIndexMap.get(time.rsvt_no))
    .filter(index => index !== undefined)
    .sort((a, b) => a - b);

  // 检查要取消的时间段是否在首尾位置
  const firstIndex = selectedIndexes[0];
  const lastIndex = selectedIndexes[selectedIndexes.length - 1];

  // 只能取消首尾时间段
  return cancelItemIndex === firstIndex || cancelItemIndex === lastIndex;
};

// 选择时间段（支持同一会议室的连续时间段多选）
const selectTimeSlot = (item) => {
  if (isTimeOccupied(item)) {
    return; // 已被预约的时间段不能选择
  }

  // 检查时间段是否可以预约
  if (!isTimeSlotBookable(item)) {
    // ElMessage.warning("不能预约当前时间往前推半小时之前的时间段");
    ElMessage.warning("已过期,不可预约!");
    return;
  }

  // 检查是否已经选中
  const index = selectedTimes.value.findIndex(
    time => time.rsvo_no === item.rsvo_no && time.rsvt_no === item.rsvt_no
  );

  if (index !== -1) {
    // 如果已选中，则取消选择
    // 检查是否可以取消该时间段（如果超过2个时间段，只能取消首尾）
    if (canCancelTimeSlot(item)) {
      selectedTimes.value.splice(index, 1);
      // 重新排序选中的时间段
      sortSelectedTimes();
    } else {
      ElMessage.warning("已选中超过两个连续时间段，只能从首尾时间段取消选择");
      return;
    }
  } else {
    // 如果当前没有选择，或者选择的是同一个会议室
    if (selectedTimes.value.length === 0 || selectedTimes.value[0].rsvo_no === item.rsvo_no) {
      // 检查是否连续
      if (isTimeSlotContinuous(item)) {
        // 如果未选中，则添加到选中列表
        selectedTimes.value.push({
          rsvt_no: item.rsvt_no, // 预约时段编码
          rsvo_no: item.rsvo_no, // 预约场所编码
          ...item,
        });
        // 按时间排序
        sortSelectedTimes();
      } else {
        ElMessage.warning("只能选择连续的时间段");
      }
    } else {
      ElMessage.warning("只能选择同一个会议室的时间段");
    }
  }
};

// 检查时间段是否在数据顺序上连续
const isTimeSlotContinuous = (newItem) => {
  if (selectedTimes.value.length === 0) return true;

  // 获取当前会议室的所有时间段数据
  const currentRoom = roomList.value.find(room => room.rsvo_no === newItem.rsvo_no);
  if (!currentRoom || !currentRoom.timeList) return false;

  // 获取该会议室所有时间段的索引映射
  const timeIndexMap = new Map();
  currentRoom.timeList.forEach((time, index) => {
    timeIndexMap.set(time.rsvt_no, index);
  });

  // 获取新选择时间段在该会议室中的索引位置
  const newItemIndex = timeIndexMap.get(newItem.rsvt_no);
  if (newItemIndex === undefined) return false;

  // 获取所有已选时间段在该会议室中的索引位置
  const selectedIndexes = selectedTimes.value
    .map(time => timeIndexMap.get(time.rsvt_no))
    .filter(index => index !== undefined)
    .sort((a, b) => a - b);

  // 检查新索引是否与已选索引连续
  // 情况1：新索引在已选索引的最小值前面且连续
  if (newItemIndex === selectedIndexes[0] - 1) {
    return true;
  }

  // 情况2：新索引在已选索引的最大值后面且连续
  if (newItemIndex === selectedIndexes[selectedIndexes.length - 1] + 1) {
    return true;
  }

  // 情况3：新索引填补已选索引中的空隙，使整体保持连续
  // 将新索引插入到已选索引中，检查整体是否连续
  const allIndexes = [...selectedIndexes, newItemIndex].sort((a, b) => a - b);

  // 检查排序后的索引数组是否连续
  for (let i = 1; i < allIndexes.length; i++) {
    if (allIndexes[i] - allIndexes[i - 1] !== 1) {
      return false;
    }
  }

  return true;
};

// 按在会议室时间列表中的顺序排序选中的时间段
const sortSelectedTimes = () => {
  if (selectedTimes.value.length === 0) return;

  // 获取当前会议室的时间段数据
  const currentRoom = roomList.value.find(room => room.rsvo_no === selectedTimes.value[0].rsvo_no);
  if (!currentRoom || !currentRoom.timeList) return;

  // 创建时间段顺序映射
  const timeOrderMap = new Map();
  currentRoom.timeList.forEach((time, index) => {
    timeOrderMap.set(time.rsvt_no, index);
  });

  // 按照在时间列表中的顺序排序
  selectedTimes.value.sort((a, b) => {
    const indexA = timeOrderMap.get(a.rsvt_no) || 0;
    const indexB = timeOrderMap.get(b.rsvt_no) || 0;
    return indexA - indexB;
  });
};

// 清空已选择的时间段
const clearSelectedTimes = () => {
  selectedTimes.value = [];
};

// 从已选择列表中移除指定时间段
const removeSelectedTime = (index) => {
  selectedTimes.value.splice(index, 1);
};

const isTimeOccupied = (item = {}) => {
  return item?.cnty && item.cnty > 0;
};

const isTimeSelected = (item = {}) => {
  return selectedTimes.value.some(
    time => time.rsvo_no === item.rsvo_no && time.rsvt_no === item.rsvt_no
  );
};

// 获取所选时间段中的最小容量作为最大可选人数
const getMaxCapacity = () => {
  if (selectedTimes.value.length === 0) return 100;

  return Math.min(...selectedTimes.value.map(time => time.div_count || 1));
};

const navigateToHistory = () => {
  // 导航到历史记录页面
  router.push("/bookingHistory");
};

const formatTime = (timeStr) => {
  return dayjs(`${selectedDate.value} ${timeStr}`).format("HH:mm");
};

// 重置搜索
const resetSearch = () => {
  searchKey.value = "";
  fetchRoomList(false);
};

const fetchRoomList = async (isLoadMore = false) => {
  try {
    // 如果是加载更多，但已经没有更多数据，则直接返回
    if (isLoadMore && !pageInfo.hasMore) {
      return;
    }

    // 设置加载状态
    pageInfo.loading = true;

    // 如果不是加载更多，则重置列表和分页信息
    if (!isLoadMore) {
      roomList.value = [];
      pageInfo.pageNo = 1;
      pageInfo.hasMore = true;
    }
    // const service = 'srvreserve_obj_select'
    const service = 'srvreserve_obj_reserve_select' //250825-service更换
    const url = `/park/select/${service}`;
    const req = {
      serviceName: service,
      colNames: ["*"],
      condition: [],
      page: {
        pageNo: pageInfo.pageNo,
        rownumber: pageInfo.pageSize,
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
      pageInfo.total = res.data.page?.total || 0;

      if (Array.isArray(res.data.data)) {
        for (var index = 0; index < res.data.data.length; index++) {
          const item = res.data.data[index];
          item.timeList = await getTime(item.rsvo_no);
          list.push(item);
        }

        // 判断是否还有更多数据
        pageInfo.hasMore = list.length > 0 && roomList.value.length + list.length < pageInfo.total;

        // 如果是加载更多，则追加到现有列表，否则替换列表
        if (isLoadMore) {
          roomList.value = [...roomList.value, ...list];
        } else {
          roomList.value = list;
        }

        // 更新页码，为下一次加载做准备
        if (list.length > 0) {
          pageInfo.pageNo++;
        }
      }
    }
  } catch (error) {
    ElMessage.error("获取会议室列表失败: " + error.message);
  } finally {
    pageInfo.loading = false;
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
      item.label =
        formatTime(item.start_time) + " - " + formatTime(item.end_time);
      return item;
    });
  } else {
    if (res.data.resultMessage) {
      ElMessage.error(res.data.resultMessage);
    }
    return [];
  }
}

// 打开预约对话框
const submitReservation = () => {
  if (selectedTimes.value.length === 0) {
    ElMessage.warning("请至少选择一个时间段");
    return;
  }

  // 重置表单数据
  formData.contacts = "";
  formData.mobilephone = "";
  formData.count = 1;
  formData.remark = "";

  // 显示对话框
  dialogVisible.value = true;
};

// 关闭对话框
const handleDialogClose = (done) => {
  if (reservationForm.value) {
    reservationForm.value.resetFields();
  }
  done();
};

// 提交表单
const submitForm = async () => {
  if (!reservationForm.value) return;

  reservationForm.value.validate(async (valid) => {
    if (valid) {
      try {
        // 预约提交
        const url = `/park/operate/srvreserve_record_add`;

        if (selectedTimes.value.length === 0) {
          ElMessage.warning("请至少选择一个时间段");
          return;
        }

        // 构建批量预约请求
        const data = selectedTimes.value[0] || {};
        const startData = selectedTimes.value[0] || {};
        const endData = selectedTimes.value[selectedTimes.value.length - 1] || {};
        const requestsData = {
          rsvo_no: data.rsvo_no,
          rsvr_date: selectedDate.value || data.datey,
          start_time: startData.start_time,
          start_time_split: selectedTimes.value.map((item) => item.start_time).toString(),
          rsvp_no: data.rsvp_no,
          rsvt_no: selectedTimes.value.map((item) => item.rsvt_no).toString(), // 时间段编号
          meeting_name: formData.meeting_name, // 会议/活动名称
          count: formData.count,
          contacts: formData.contacts,
          mobilephone: formData.mobilephone,
          remark: formData.remark, //备注
        }
        if (endData?.end_time) {
          requestsData.end_time = endData.end_time;
        }
        const req = [
          {
            serviceName: "srvreserve_record_add",
            condition: [],
            data: [requestsData],
          },
        ];

        const res = await $http.post(url, req);
        if (res.data?.state === "SUCCESS") {
          dialogVisible.value = false;
          const firstTime = selectedTimes.value[0];
          const lastTime = selectedTimes.value[selectedTimes.value.length - 1];
          // 跳转到预约成功页面，并传递预约信息
          router.push({
            path: "/bookingSuccess",
            query: {
              roomName: data.rsvo_name,
              meetingName: formData.meeting_name,
              timeSlot: `${firstTime.start_time} - ${lastTime.end_time}`,
              count: formData.count,
              date: selectedDate.value,
              contacts: formData.contacts,
              mobilephone: formData.mobilephone,
              remark: formData.remark,
            },
          });
          // 刷新会议室列表
          fetchRoomList();

          // 清空已选择的时间段
          selectedTimes.value = [];
        } else if (res.data?.resultMessage) {
          ElMessage.error(res.data?.resultMessage);
        }
      } catch (error) {
        ElMessage.error("预约失败: " + error.message);
      }
    } else {
      return false;
    }
  });
};

// 滚动加载相关
const handleScroll = () => {
  const container = document.querySelector('.calendar_container');
  if (!container) return;

  // 当滚动到底部时加载更多数据
  const scrollTop = container.scrollTop;
  const scrollHeight = container.scrollHeight;
  const clientHeight = container.clientHeight;

  // 当距离底部100px时开始加载更多
  if (scrollHeight - scrollTop - clientHeight < 100 && !pageInfo.loading && pageInfo.hasMore) {
    fetchRoomList(true);
  }
};

// 生命周期钩子
onMounted(() => {
  fetchRoomList(false);

  // 添加滚动监听
  const container = document.querySelector('.calendar_container');
  if (container) {
    container.addEventListener('scroll', handleScroll);
  }
});

// 组件卸载时移除滚动监听
onUnmounted(() => {
  const container = document.querySelector('.calendar_container');
  if (container) {
    container.removeEventListener('scroll', handleScroll);
  }
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
.date-header-center {
  margin: 10px 0;
  display: flex;
  justify-content: flex-start;
  align-items: center;

  .selected-count {
    font-size: 14px;
    color: #333;
  }

  .text-blue {
    font-size: 16px;
    font-weight: 600;
    color: #007bff;
  }
}

.date-header {
  background: white;
  padding: 16px 20px;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 20px 20px 0 0;
  overflow: hidden;
  flex-wrap: wrap;

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

    .search-input {
      width: 300px;
      margin-right: 12px;
    }

    .search-btn {
      background: #007bff;
      border-color: #007bff;
    }
  }
}

.selected-times-list {
  margin-bottom: 20px;

  .selected-times-title {
    font-size: 16px;
    font-weight: 500;
    margin-bottom: 10px;
  }

  .selected-room-info,
  .selected-time-range {
    margin-bottom: 8px;
    padding: 8px;
    background-color: #f8f9fa;
    border-radius: 4px;

    .info-label {
      font-weight: 500;
      color: #666;
      margin-right: 8px;
    }

    .info-value {
      color: #333;
      font-weight: 600;
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
    background: #fff;
  }
}

// 对话框样式
.el-dialog {
  border-radius: 12px;
  overflow: hidden;

  .el-dialog__header {
    background-color: #f6f8fa;
    padding: 15px 20px;
    margin: 0;
    border-bottom: 1px solid #e9ecef;
  }

  .el-dialog__body {
    padding: 20px;
  }

  .el-dialog__footer {
    padding: 15px 20px;
    border-top: 1px solid #e9ecef;
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }
}

.text-red {
  color: red;
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
            color: #333; // margin-bottom: 4px;
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
      grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
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

        &.disabled {
          background-color: #f5f5f5;
          color: #ccc;
          cursor: not-allowed;
          opacity: 0.6;

          &:hover {
            transform: none;
            background-color: #f5f5f5;
          }
        }
      }
    }
  }
}

// 底部加载状态样式
.loading-container {
  padding: 20px 0;
  text-align: center;
  color: #666;
  font-size: 14px;

  .loading-spinner {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;

    i {
      font-size: 20px;
      color: #007bff;
    }
  }

  .no-more-data,
  .load-more-hint {
    padding: 10px;
    color: #999;
  }
}

// 无数据提示
.empty-data {
  padding: 40px 0;
  text-align: center;
  color: #999;

  .empty-text {
    font-size: 16px;
    margin-bottom: 20px;
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