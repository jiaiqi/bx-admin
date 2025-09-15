// 预约相关路由
export default [
  // ==================== 会议室预约 ====================
  {
    path: "/meetingRoomBooking",
    name: "MeetingRoomBooking",
    component: () => import(/* webpackChunkName: "booking" */ "@/pages/meetingRoomBooking/meetingRoomBooking.vue")
  },
  {
    path: "/bookingSuccess",
    name: "BookingSuccess",
    component: () => import(/* webpackChunkName: "booking" */ "@/pages/meetingRoomBooking/bookingSuccess.vue")
  },
  {
    path: "/bookingHistory",
    name: "BookingHistory",
    component: () => import(/* webpackChunkName: "booking" */ "@/pages/meetingRoomBooking/bookingHistory.vue")
  }
];