<template>
  <div class="force-login" ref="" v-if="forceLogin">
    <!-- :style="{ backgroundImage: 'url(' + loginBg + ')' }" -->
    <!-- <img :src="loginBg" v-if="loginBg" class="img" /> -->
    <div class="login-bg" :style="{ backgroundImage: 'url(' + loginBg + ')' }"></div>
    <div class="login-box">
      <div>登录后才能查看</div>
      <button class="login-btn" @click="toLogin">登录</button>
    </div>
  </div>
  <component
    :is="component"
    v-else-if="component"
    v-bind="props"
    :page-item="props.data"
    :content-width="contentWidth"
    @click="onTap"
    :currentId="currentId"
    :isPreview="isPreview"
    :isView="isView"
    @add="addComponent"
    @delete="deleteComponent"
    @resize="onResize"
    :class="{ 'preview-mode': isPreview, 'view-mode': isView }"
    style="position: relative; z-index: 1"
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
        @click="onTap"
        @add="addComponent"
        @delete="deleteComponent"
        @resize="onResize"
      ></lc-view>
    </template>
    <slot v-else>
      <template v-if="!isView && !isPreview">
        <template v-if="type === 'content'">
          <span class="" style="color: #999; pointer-events: none">
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
import pageItem from "@/pages/datav/component/page-item/page-item.vue";
import { VueDraggable } from "vue-draggable-plus";

export default {
  name: "lc-view",
  components: {
    lcBlock,
    lcContainer,
    lcContent,
    VueDraggable,
    pageItem,
    lcView: () => import("./view.vue"),
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
    toLogin(){
      const currentUrl = window.location.pathname  + window.location.hash;
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
