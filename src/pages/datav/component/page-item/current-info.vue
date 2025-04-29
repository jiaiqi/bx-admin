<template>
  <div class="welcome-box flex items-center">
    <img class="avatar" :src="avatar" alt="" />
    <div v-if="logined">
      <div class="user-name">{{ loginUser.real_name || "" }}</div>
      <div class="flex items-center handler">
        <span class="text-btn primary" @click="openChangePasswordDialog">修改密码</span>
        <span class="">|</span>
        <span class="text-btn " @click="bindKey">绑定key</span>
      </div>
      <change-password-dialog ref="changePasswordDialog" />
    </div>
  </div>
</template>

<script>
import { formatStyleData } from "@/common/common";
import { mapGetters } from "vuex";
import ChangePasswordDialog from "@/components/ui/change-password-dialog/change-password-dialog.vue";
export default {
  components: {
    ChangePasswordDialog
  },
  props: {
    pageItem: {
      type: Object,
    },
  },
  data() {
    return {};
  },
  computed: {
    ...mapGetters("loginInfo", ["logined", "loginUser"]),
    avatar() {
      return (
        this.loginUser?.photo_url ||
        require("@/assets/image/user-img-default.png")
      );
    },
  },
  mounted() {},
  methods: {
    bindKey() {
      this.$message.info("功能开发中...");
    },
    openChangePasswordDialog() {
      this.$refs.changePasswordDialog.open();
    },
  },
};
</script>

<style lang="scss" scoped>
.welcome-box {
  gap: 16px;
  .avatar {
    width: 90px;
    height: 90px;
    border-radius: 50%;
  }
  .user-name {
    font-size: 20px;
    font-weight: 500;
    color: #303133;
  }
  .handler{
    gap: 8px;
  }
  .text-btn {
    font-size: 14px;
    cursor: pointer;
    &:hover {
      text-decoration: underline;
    }
    &.primary {
      color: var(--primary-color, #409eff);
    }
  }
}
</style>
