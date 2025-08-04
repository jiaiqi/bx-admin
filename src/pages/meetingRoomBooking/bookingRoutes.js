// 园区预约页面
export const BookingPages = [
  {
    // 会议室预约
    path: "/meetingRoomBooking",
    name: "MeetingRoomBooking",
    component: () => import("@/pages/meetingRoomBooking/meetingRoomBooking.vue")
  },
  {
    // 会议室预约成功页面
    path: "/bookingSuccess",
    name: "BookingSuccess",
    component: () => import("@/pages/meetingRoomBooking/bookingSuccess.vue")
  },
  {
    // 会议室预约记录页面
    path: "/bookingHistory",
    name: "BookingHistory",
    component: () => import("@/pages/meetingRoomBooking/bookingHistory.vue")
  }
]