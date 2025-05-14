<template>
  <div v-if="viewMode === '展开子导航'" class="nav-menu-container">
    <div
      class="nav-menu"
      :class="{ 'follow-theme-color': followThemeColor }"
      :style="{ '--min-height': minHeight + 'px' }"
      ref="navMenu"
    >
      <!-- <div class="nav-menu" v-for="(item, key) in setSubMenu" :key="key" @click="onTap(item, $event)" ref="navMenuItem">
        <div class="nav-menu-label" :style="[formatStyleData(item.nav_style_json)]">
          {{ item.label }}
        </div>
      </div> -->
      <nav-menu-item
        v-for="(item, index) in setSubMenu"
        :key="index"
        :data="item"
        :isActive="isActive(item)"
        :followThemeColor="followThemeColor"
        @change="onMenuChange"
        @on-nav="navTo"
      ></nav-menu-item>
    </div>
    <div
      class="nav-menu-child-wrap"
      v-if="current && setCurrentSubMenu && setCurrentSubMenu.length"
      :class="{
        active: current && setCurrentSubMenu && setCurrentSubMenu.length,
      }"
    >
      <div class="child-menu-list">
        <div class="child-menu" v-for="item in setCurrentSubMenu">
          <div
            class="child-menu-label"
            @click.stop.capture="navTo(item.jump_json, item)"
          >
            <span>{{ item.label || item._label }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div
    class="nav-menu"
    :class="{ isHovered: isHovered }"
    v-else-if="label"
    @mouseenter="
      isHovered = true;
      showChild = true;
    "
    @mouseleave="isHovered = false"
    ref="navMenu"
  >
    <div
      class="nav-menu-label"
      :style="[setLabelStyle, mixNavStyle]"
      @click.stop.capture="navTo(jumpJson)"
    >
      <span>{{ label }}</span>
      <img
        class="nav-icon"
        :src="getImagePath(config.nav_icon_selected)"
        alt=""
        v-if="config.nav_icon_selected && isHovered"
      />
      <img
        class="nav-icon"
        :src="getImagePath(config.nav_icon)"
        alt=""
        v-else-if="config.nav_icon"
      />
    </div>
    <!-- <Teleport to="#content"> -->
    <nav-menu-child
      :config="config"
      :parent-config="parentConfig"
      :pageConfig="pageConfig"
      :isHovered="showChild"
      :parent-style="parentStyle"
      @leave="showChild = false"
    ></nav-menu-child>
    <!-- </Teleport> -->

    <!-- <div
      class="nav-menu-child"
      :class="{ active: isHovered }"
      :style="[isHovered ? childPositionStyle : {}]"
      v-if="setSubMenu && setSubMenu.length"
    >
      <nav-menu-child
        v-for="(item, index) in setSubMenu"
        :key="index"
        :config="item"
        :parent-style="navStyle"
        :parent-hover-style="mixHoverStyle"
      ></nav-menu-child>
    </div> -->
  </div>
</template>

<script>
import { formatStyleData } from "@/pages/datav/common/index.js";
import NavMenuChild from "./nav-menu-list.vue";
import NavMenu from "./nav-menu.vue";
import Teleport from "vue2-teleport";
import NavMenuItem from "./nav-menu-item.vue";
export default {
  name: "NavMenu",
  components: {
    NavMenuChild,
    NavMenu,
    NavMenuItem,
    Teleport,
  },
  props: {
    config: Object,
    parentConfig: Object,
    pageConfig: Object,
    parentStyle: Object,
    followThemeColor: Boolean,
  },
  data() {
    return {
      isHovered: false,
      showChild: false,
      current: null,
      navMenuWidth: 0,
      position: {
        top: 0,
        left: 0,
        width: 0,
        height: 0,
      },
      formatStyleData: formatStyleData,
      minHeight: "20",
      subMenu: [],
      requestSubMenuMap: {},
      menuChildren: [],
      currentSubMenu: null,
    };
  },
  computed: {
    contentWidth() {
      let width = this.pageConfig?.content_area_width;
      if (width) {
        if (!isNaN(Number(width))) {
          return Number(width) + "px";
        } else {
          return width;
        }
      }
    },
    setCurrentSubMenu() {
      if (this.current?.link_type) {
        return this.menuChildren;
      }
      if (
        this.current?.child_source === "接口请求" &&
        this.menuChildren?.length
      ) {
        return this.menuChildren;
      }
      let json = this.current?.sub_json;
      if (typeof json === "string") {
        try {
          json = JSON.parse(json);
        } catch (error) {
          console.error(error);
        }
      }
      if (!Array.isArray(json)) {
        return [];
      }
      return json.filter((item) => item.disp_flag !== "否");
    },
    viewMode() {
      return this.config?.view_mode;
    },
    label() {
      return this.config.label;
    },
    navStyle() {
      let style = {};
      if (this.config?.nav_style_json) {
        style = formatStyleData(this.config.nav_style_json);
      }
      return style;
    },
    setSubMenu() {
      if (this.config?.child_source === "接口请求") {
        return this.subMenu;
      }
      let json = this.config?.sub_json;
      if (json && typeof json === "string") {
        try {
          json = JSON.parse(json);
        } catch (error) {
          console.error(error);
        }
      }
      if (!Array.isArray(json)) {
        return [];
      }
      return json.filter((item) => item.disp_flag !== "否");
    },
    mixHoverStyle() {
      let style = {};
      if (this.config?.seleted_style_json) {
        style = formatStyleData(this.config.seleted_style_json);
      }
      return style;
    },
    mixNavStyle() {
      let style = {};
      if (this.config?.nav_style_json) {
        style = formatStyleData(this.config.nav_style_json);
      }
      if (this.isHovered && this.mixHoverStyle) {
        style = { ...style, ...this.mixHoverStyle };
      }
      return style;
    },
    setLabelStyle() {
      if (typeof this.mixNavStyle === "object") {
        let style = { ...this.mixNavStyle };
        if (style["height"]) {
          delete style["height"];
        }
        return style;
      }
    },
    childPositionStyle() {
      return {
        top: this.position.height + "px",
        left: 0,
        width: this.position.width + "px",
      };
    },
    jumpJson() {
      if (this.config.jump_json) {
        try {
          return JSON.parse(this.config.jump_json);
        } catch (error) {
          console.error(error);
        }
      }
    },
    reqJson() {
      if (this.config.request_json) {
        if (typeof this.config.request_json === "string") {
          try {
            return JSON.parse(this.config.request_json);
          } catch (error) {
            console.error(error);
          }
        } else if (typeof this.config.request_json === "object") {
          return this.config.request_json;
        }
      }
    },
  },
  created() {
    if (this.config?.child_source === "接口请求") {
      this.fetchChildData(this.reqJson).then((res) => {
        console.log("res", res);
        if (res.data?.state === "SUCCESS") {
          console.log("res.data", res.data.data);
          this.subMenu = res.data.data.map((data) => {
            return {
              ...data,
              _label: data[this.config.label_field],
              _url: data[this.config.link_field],
            };
          });
        }
      });
    }
  },
  mounted() {
    // this.setEleSize();
    // setTimeout(() => {
    //   this.setEleSize();
    // }, 1000);
  },
  methods: {
    isActive(item) {
      if (this.current) {
        if (item.nav_no && this.current?.nav_no === item.nav_no) {
          return true;
        } else if (item.id && this.current?.id === item.id) {
          return true;
        }
      }
      return false;
    },
    onMenuChange(data) {
      const { children, current, event } = data;
      const eleRect = this.$refs.navMenu?.getBoundingClientRect?.();
      if (eleRect.height) {
        this.minHeight = eleRect.height;
      }
      debugger;
      console.log("onMenuChange", data);
      if (this.current?.nav_no && this.current?.nav_no === current?.nav_no) {
        this.current = null;
        this.menuChildren = [];
      } else if (this.current?.id && this.current.id === current?.id) {
        this.current = null;
        this.menuChildren = [];
      } else if (children && children.length > 0) {
        this.menuChildren = children;
        this.current = current;
      }
    },
    async fetchChildData(config) {
      let requestJson = config;
      if (typeof config === "string") {
        requestJson = JSON.parse(config);
      }
      if (requestJson?.serviceName) {
        console.log("requestJson", requestJson);
        const req = {
          colNames: requestJson.colNames || ["*"],
          condition: requestJson.condition || [],
          serviceName: requestJson.serviceName,
          page: requestJson.page || { pageNo: 1, rownumber: 100 },
        };
        const url = `${requestJson.mapp}/${requestJson.srv_type || "select"}/${
          req.serviceName
        }`;
        return await this.$http.post(url, req);
      }
    },
    onTap(item, event) {
      console.log("item", item);
      if (item.child_source === "接口请求") {
        this.fetchChildData(item.request_json).then((res) => {
          console.log("res", res);
          if (res.data?.state === "SUCCESS") {
            console.log("res.data", res.data.data);
            this.$set(
              this.requestSubMenuMap,
              item.nav_no,
              res.data.data.map((data) => {
                return {
                  ...data,
                  _label: data[item.label_field],
                  _url: data[item.link_field],
                };
              })
            );
          }
        });
        return;
      }
      if (item?.jump_json) {
        this.navTo(item.jump_json);
        return;
      }
      const ele = event.target.getBoundingClientRect();
      this.minHeight = ele.height;
      if (this.current?.nav_no && this.current?.nav_no === item?.nav_no) {
        this.current = null;
      } else {
        if (item?.sub_json && typeof item.sub_json === "string") {
          item.sub_json = JSON.parse(item.sub_json);
        }
        this.current = item;
      }
      // 获取当前点击的nav-menu宽度
      if (event && event.currentTarget) {
        this.navMenuWidth = event.currentTarget.offsetWidth;
      }
    },
    navTo(jumpJson, data) {
      if (data?._url && !jumpJson) {
        if (data?.jump_option?.includes("先登录")) {
          return this.$confirm(
            "您还未登录,需要登录才能进入,点击确认前往登录",
            "提示",
            {
              confirmButtonText: "确定",
              cancelButtonText: "取消",
              type: "warning",
            }
          ).then(() => {
            const currentUrl = window.location.pathname + window.location.hash;
            sessionStorage.setItem("login_redirect_url", currentUrl);
            const loginUrl = window.location.origin + "/main/login.html";
            window.location.href = loginUrl;
          });
        }
        return window.open(data._url);
      }
      if (typeof jumpJson === "string") {
        try {
          jumpJson = JSON.parse(jumpJson);
        } catch (error) {
          console.error(error);
        }
      }
      if (jumpJson?.obj_type) {
        if (jumpJson?.click_jump_option?.includes("先登录")) {
          if (this.$store.state?.loginInfo?.logined !== true) {
            // 您还未登录,需要登录才能进入,点击确认前往登录
            this.$confirm(
              "您还未登录,需要登录才能进入,点击确认前往登录",
              "提示",
              {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
              }
            ).then(() => {
              const currentUrl =
                window.location.pathname + window.location.hash;
              sessionStorage.setItem("login_redirect_url", currentUrl);
              const loginUrl = window.location.origin + "/main/login.html";
              window.location.href = loginUrl;
            });
            return;
          }
        }
        switch (jumpJson.obj_type) {
          case "外部页面":
            if (jumpJson.outer_url) {
              if (jumpJson.target_type == "原页面") {
                window.location.href = jumpJson.outer_url;
              } else {
                window.open(jumpJson.outer_url);
              }
            }
          case "当前页锚点":
          case "当前页面锚点":
            if (jumpJson.anchor_com_name) {
              if (jumpJson.target_type === "新页面" && jumpJson.dest_page_no) {
                this.navToPath(jumpJson);
              } else {
                let ele = document.getElementById(jumpJson.anchor_com_name);
                if (ele) {
                  ele.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                    inline: "nearest",
                  });
                }
              }
            }
            break;
          default:
            if (jumpJson.dest_page_no) {
              this.navToPath(jumpJson);
            }
            break;
        }
      }
    },
    navToPath(jump_json) {
      let pageNo = jump_json?.dest_page_no;
      if (jump_json?.click_jump_option?.includes("先登录")) {
        if (this.$store.state?.loginInfo?.logined !== true) {
          // 您还未登录,需要登录才能进入,点击确认前往登录
          this.$confirm(
            "您还未登录,需要登录才能进入,点击确认前往登录",
            "提示",
            {
              confirmButtonText: "确定",
              cancelButtonText: "取消",
              type: "warning",
            }
          ).then(() => {
            const currentUrl = window.location.pathname + window.location.hash;
            sessionStorage.setItem("login_redirect_url", currentUrl);
            const loginUrl = window.location.origin + "/main/login.html";
            window.location.href = loginUrl;
          });
          return;
        }
      }
      let path = "";
      if (jump_json?.tmpl_page_json.file_path) {
        path = jump_json?.tmpl_page_json.file_path.replace(":pageNo", pageNo);
      } else {
        path = `/vpages/#/site/${pageNo}?srvApp=config`;
      }
      if (jump_json?.obj_type?.includes("锚点") && jump_json?.anchor_com_name) {
        if (path.includes(`/site/${pageNo}`)) {
          path = path.replace(
            `/site/${pageNo}`,
            `/site/${pageNo}/${jump_json.anchor_com_name}`
          );
        }
      }
      if (pageNo) {
        if (jump_json.target_type == "原页面") {
          if (path.includes("#")) {
            path = path.split("#")[1];
          }
          this.$router.push(path);
        } else {
          window.open(path);
        }
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.nav-menu-container {
  display: grid;
  min-height: 100%;
}

:deep(.nav-menu) {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  min-height: var(--min-height, 30px);
  cursor: pointer;
  z-index: 99;
  flex: 1;

  .nav-menu-label {
    z-index: 100;
    width: 100%;
    height: 100%;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;

    .nav-icon {
      width: 1rem;
      height: 1em;
      display: inline-block;
      color: currentColor;
    }
  }
  &.follow-theme-color {
    .nav-menu-label {
      background-color: var(--menu-bg-color);
      color: var(--menu-text-color);

      &:hover {
        background-color: var(--menu-hover-bg-color);
        color: var(--menu-hover-text-color, inherit);
      }

      &.active {
        background-color: var(--menu-active-bg-color);
        color: var(--menu-hover-active-color, inherit);
      }
    }
    &.active-nav-menu {
      .nav-menu-label {
        background-color: var(--menu-active-bg-color);
        color: var(--menu-active-text-color, inherit);
      }
    }
  }

  .nav-menu-child {
    position: absolute;
    min-width: 100%;
    transition: all 0.3s ease-in-out;
    height: 0;
    overflow: hidden;
    z-index: -1;

    &.active {
      height: auto;
      overflow: unset;
      z-index: 99;
    }
  }

  .nav-menu-child-container {
    position: absolute;
    left: 0;
    top: 100%;
    z-index: 200;
    background: #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    min-width: 100%;
    padding: 0;
  }
}

.nav-menu-child-wrap {
  background-color: #f1f1f1;
  color: #333;
  width: 100%;
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.3s ease-in-out;
  overflow: hidden;

  &.active {
    grid-template-rows: 1fr;
  }

  .child-menu-list {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    padding: 10px;
  }

  .child-menu {
    padding: 2px 10px;
    min-width: 100px;
    text-align: center;
    border-radius: 4px;
    cursor: pointer;

    &:hover {
      background: var(--menu-hover-bg-color, #f1f1f1);
      color: var(--menu-hover-text-color, inherit);
    }
  }
}
</style>
