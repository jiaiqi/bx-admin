<template>
  <div v-if="
    hiddenComponentVisible === false &&
    visible == false &&
    type === 'component'
  ">
    组件已隐藏
  </div>
  <div
    class="force-login"
    ref=""
    v-else-if="
      forceLogin && (visible !== false || hiddenComponentVisible === true)
    "
    :id="com_name"
  >
    <!-- :style="{ backgroundImage: 'url(' + loginBg + ')' }" -->
    <!-- <img :src="loginBg" v-if="loginBg" class="img" /> -->
    <div
      class="login-bg"
      :style="{ backgroundImage: 'url(' + loginBg + ')' }"
    ></div>
    <div class="login-box">
      <div>请在登录后进行查看</div>
      <button
        class="login-btn"
        @click="toLogin"
      >登录</button>
    </div>
  </div>
  <!-- 在线咨询对话框-->
  <div v-else-if="com_name === '咨询入口' && isOpenChat">
    <ChatBox
      :visible.sync="isOpenChat"
      :chatItem="chatItem"
    />
  </div>
  <component
    :is="component"
    v-else-if="
      component && (visible !== false || hiddenComponentVisible === true)
    "
    v-bind="props"
    :page-item="props.data"
    :query-options="queryOptions"
    :page-params-model="pageParamsModel"
    :page-no="pageNo"
    :page-config="pageConfig"
    :content-width="contentWidth"
    @click="onTap"
    :currentId="currentId"
    :isPreview="isPreview"
    :isView="isView"
    :in-edit="inEdit"
    @add="addComponent"
    @delete="deleteComponent"
    @resize="onResize"
    @setOpenChat="setOpenChat"
    @swap-components="$emit('swap-components', $event)"
    @move-component="$emit('move-component', $event)"
    @executor-complete="$emit('executor-complete', $event)"
    :class="{ 'preview-mode': isPreview, 'view-mode': isView }"
    :style="(props.com_option && props.com_option.includes('悬浮可拖动')) ||
        type === '悬浮组件'
        ? ''
        : 'position: relative; z-index: 1'
      "
  >
    <template v-if="childComponents && childComponents.length">
      <lc-view
        v-for="item in childComponents"
        v-bind="item"
        :page-item="item.data"
        :content-width="contentWidth"
        :key="item.id"
        :currentId="currentId"
        :isPreview="isPreview"
        :isView="isView"
        :hidden-component-visible="hiddenComponentVisible"
        :in-edit="inEdit"
        :query-options="queryOptions"
        :page-params-model="pageParamsModel"
        :page-no="pageNo"
        :page-config="pageConfig"
        @click="onTap"
        @add="addComponent"
        @delete="deleteComponent"
        @resize="onResize"
        @setOpenChat="setOpenChat"
        @swap-components="$emit('swap-components', $event)"
        @move-component="$emit('move-component', $event)"
        @executor-complete="$emit('executor-complete', $event)"

      ></lc-view>
    </template>
    <slot v-else>
      <template v-if="!isView && !isPreview">
        <template v-if="type === 'content'">
          <span
            class=""
            style="color: #999; pointer-events: none"
          >
            {{ name || "可放置组件/布局容器" }}
          </span>
        </template>
        <template v-else-if="type === 'component' && props.com_name">
          {{ props.com_name }}
        </template>
        <template v-else>
          {{ name }}
        </template>
      </template>
    </slot>
  </component>
</template>

<script>
import lcBlock from "./block.vue";
import lcContainer from "./container.vue";
import lcContent from "./content-item.vue";
import PageItem from "@/pages/datav/component/page-item/page-item.vue";
import floatComponent from "./float-component.vue";
// import { VueDraggable } from "vue-draggable-plus";
import chatEntrance from "@/pages/datav/component/page-item/chat/chat-entrance.vue";
import ChatBox from "@/pages/datav/component/page-item/chat/chat-box.vue";

export default {
  name: "lc-view",
  components: {
    ChatBox,
    lcBlock,
    lcContainer,
    lcContent,
    // VueDraggable,
    PageItem,
    lcView: () => import("./view.vue"),
    floatComponent,
    chatEntrance
  },
  props: {
    id: {
      type: [String, Number],
      default: "",
    },
    com_no: {
      type: [String, Number],
      default: "",
    },
    currentId: {
      type: [String, Number],
      default: "",
    },
    component: {
      type: String,
      default: "",
    },
    name: {
      type: String,
      default: "",
    },
    children: {
      type: Array,
      default: () => [],
    },
    type: {
      type: String,
      default: "",
    },
    isPreview: {
      type: Boolean,
      default: false,
    },
    contentWidth: {
      type: String,
    },
    pageItem: {
      type: Object,
      default: () => {
        return {};
      },
    },
    com_name: {
      type: String,
      default: "",
    },
    visible: {
      type: Boolean,
      default: true,
    },
    hiddenComponentVisible: {
      type: Boolean,
      default: false,
    },
    inEdit: {
      type: Boolean,
      default: false,
    },
    pageNo: {
      type: String,
      default: "",
    },
    pageConfig: {
      type: Object,
      default: () => {
        return {};
      },
    },
    queryOptions: {
      type: Object,
      default: () => {
        return {};
      },
    },
    pageParamsModel: {
      type: Object,
      default: () => {
        return {};
      },
    },
  },
  computed: {
    props() {
      return { ...this.$props, ...(this.$attrs || {}) };
    },
    isView() {
      return this.$route.meta?.isView === true;
    },
    forceLogin() {
      return this.pageItem?.com_option?.includes("强制登录") && this.needLogin;
    },
    loginBg() {
      let imgs = this.pageItem?.login_bg_img_json;
      if (Array.isArray(imgs) && imgs.length) {
        const img = imgs[0];
        if (img?.file_no) {
          return this.serviceApi().downloadFileNo + img.file_no;
        }
        if (img?.fileurl) {
          return this.serviceApi().downloadFile + img.fileurl;
        }
      }
    },
    needLogin() {
      return this.$store.state.loginInfo.logined !== true;
    },
  },
  data() {
    return {
      childComponents: [],
      chatItem: null,
      isOpenChat: false,
    };
  },
  watch: {
    children: {
      immediate: true,
      deep: true,
      handler(newValue) {
        if (Array.isArray(newValue)) {
          this.childComponents = newValue;
        } else {
          this.childComponents = [];
        }
      },
    },
  },
  methods: {
    //打开指定的在线咨询框
    setOpenChat(item) {
      this.isOpenChat = true;
      this.chatItem = item;
      console.log(this.com_name)
      console.log('这是打开的聊天框', item)
    },
    toLogin() {
      const currentUrl = window.location.pathname + window.location.hash;
      sessionStorage.setItem("login_redirect_url", currentUrl);
      const loginUrl = window.location.origin + "/main/login.html";
      window.location.href = loginUrl;
    },
    openComponentSelector() {
      this.$emit("open", this.props);
    },
    onTap(val) {
      if (!this.isPreview) {
        this.$emit("click", val || this.props); // 触发父组件的click事件，并传递参数val
      }
    },
    addComponent(val) {
      if (!this.isPreview) {
        this.$emit("add", val);
      }
    },
    deleteComponent(val) {
      if (!this.isPreview) {
        this.$emit("delete", val);
      }
    },
    onResize(val) {
      if (!this.isPreview) {
        console.log("resize", val);
        this.$emit("resize", val);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.force-login {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;

  .login-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.1);
    background-image: url("~@/assets/image/login/wj_login.jpg");
    background-repeat: no-repeat;
    background-size: cover;
    filter: blur(10px);
    z-index: -1;
  }

  .login-box {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #fff;
    flex-direction: column;

    .login-btn {
      padding: 10px 20px;
      border-radius: 5px;
      background-color: var(--menu-bg-color, #409eff);
      min-width: 200px;
      text-align: center;
      margin-top: 20px;
    }
  }
}
</style>