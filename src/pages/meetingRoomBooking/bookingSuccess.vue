<template>
  <div class="success-wrapper">
    <div class="success-container">
      <div class="success-icon">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="80"
          height="80"
          viewBox="0 0 24 24"
        >
          <path
            fill="#52c41a"
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5l1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
          />
        </svg>
      </div>
      <h1 class="success-title">预约成功</h1>
      <div class="success-info">
        <div class="info-item">
          <span class="label">地点：</span>
          <span class="value">{{ reservationInfo.roomName }}</span>
        </div>
        <div class="info-item">
          <span class="label">日期：</span>
          <span class="value">{{ reservationInfo.date }}</span>
        </div>
        <div class="info-item">
          <span class="label">时间段：</span>
          <span class="value">{{ reservationInfo.timeSlot }}</span>
        </div>
        <div class="info-item">
          <span class="label">联系人：</span>
          <span class="value">{{ reservationInfo.contacts }}</span>
        </div>
        <div class="info-item">
          <span class="label">联系方式：</span>
          <span class="value">{{ reservationInfo.mobilephone }}</span>
        </div>
        <div
          class="info-item"
          v-if="![1, '1'].includes(reservationInfo.count)"
        >
          <span class="label">人数：</span>
          <span class="value">{{ reservationInfo.count }}人</span>
        </div>
        <div
          class="info-item"
          v-if="reservationInfo.remark"
        >
          <span class="label">备注：</span>
          <span class="value">{{ reservationInfo.remark }}</span>
        </div>
      </div>
      <div class="success-actions">
        <el-button
          type="primary"
          @click="backToBooking"
        >返回预约页面</el-button>
        <el-button @click="navigateToHistory">查看历史记录</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter, useRoute, useUtils } from "@/common/vueApi";

const router = useRouter();
const route = useRoute();
const { addTabByUrl } = useUtils();

// 从路由参数中获取预约信息
const reservationInfo = ref({
  roomName: "",
  date: "",
  timeSlot: "",
  contacts: "",
  mobilephone: "",
  count: 0,
  remark: "",
});

onMounted(() => {
  // 从路由参数中获取预约信息
  if (route.query) {
    reservationInfo.value = {
      roomName: route.query.roomName || "",
      date: route.query.date || "",
      timeSlot: route.query.timeSlot || "",
      contacts: route.query.contacts || "",
      mobilephone: route.query.mobilephone || "",
      count: route.query.count || 0,
      remark: route.query.remark || "",
    };
  }
});

// 返回预约页面
const backToBooking = () => {
  router.push("/meetingRoomBooking");
};

// 导航到历史记录
const navigateToHistory = () => {
  // 导航到历史记录页面
  router.push("/bookingHistory");
};
</script>

<style scoped lang="scss">
.success-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f6f8fa;
  padding: 16px;
}

.success-container {
  width: 100%;
  max-width: 600px;
  background-color: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0px 8px 10px 0px rgba(183, 215, 247, 0.2);
  text-align: center;
}

.success-icon {
  margin-bottom: 24px;
  display: flex;
  justify-content: center;
}

.success-title {
  font-size: 28px;
  color: #333;
  margin-bottom: 30px;
}

.success-info {
  text-align: left;
  margin-bottom: 40px;

  .info-item {
    display: flex;
    margin-bottom: 12px;
    font-size: 16px;
    line-height: 24px;

    .label {
      width: 100px;
      color: #666;
      text-align: right;
      padding-right: 12px;
    }

    .value {
      flex: 1;
      color: #333;
      font-weight: 500;
    }
  }
}

.success-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.el-button--primary {
  color: #fff;
  background-color: #007bff;
  border-color: #007bff;
}

@media screen and (max-width: 768px) {
  .success-container {
    padding: 30px 20px;
  }

  .success-title {
    font-size: 24px;
  }

  .success-info .info-item {
    font-size: 14px;

    .label {
      width: 80px;
    }
  }

  .success-actions {
    flex-direction: column;
    gap: 10px;
  }
}
</style>