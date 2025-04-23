<template>
  <div v-if="viewMode === '展开子导航'" class="nav-menu-container">
    <div class="nav-menu" :style="{ '--min-height': minHeight + 'px' }">
      <div
        class="nav-menu"
        v-for="(item, key) in subMenu"
        :key="key"
        @click="onTap(item, $event)"
        ref="navMenuItem"
      >
        <div
          class="nav-menu-label"
          :style="[formatStyleData(item.nav_style_json)]"
        >
          {{ item.label }}
        </div>
      </div>
    </div>
    <div
      class="nav-menu-child-wrap"
      v-if="current && currentSubMenu && currentSubMenu.length"
      :class="{ active: current && currentSubMenu && currentSubMenu.length }"
    >
      <div class="child-menu-list">
        <div class="child-menu" v-for="item in currentSubMenu">
          <div
            class="child-menu-label"
            @click.stop.capture="navTo(item.jump_json)"
          >
            <span>{{ item.label }}</span>
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
      v-if="subMenu && subMenu.length"
    >
      <nav-menu-child
        v-for="(item, index) in subMenu"
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
export default {
  name: "NavMenu",
  components: {
    NavMenuChild,
    NavMenu,
    Teleport,
  },
  props: {
    config: Object,
    parentConfig: Object,
    pageConfig: Object,
    parentStyle: Object,
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
    currentSubMenu() {
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
    subMenu() {
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
  },
  mounted() {
    this.setEleSize();
    setTimeout(() => {
      this.setEleSize();
    }, 1000);
  },
  methods: {
    onTap(item, event) {
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
    navTo(jumpConfig) {
      if (typeof jumpConfig === "string") {
        try {
          jumpConfig = JSON.parse(jumpConfig);
        } catch (error) {
          console.error(error);
        }
      }
      if (jumpConfig?.obj_type) {
        switch (jumpConfig.obj_type) {
          case "外部页面":
            if (jumpConfig.outer_url) {
              if (jumpConfig.target_type == "原页面") {
                window.location.href = jumpConfig.outer_url;
              } else {
                window.open(jumpConfig.outer_url);
              }
            }
            break;
          default:
            if (jumpConfig.dest_page_no) {
              this.navToPath(jumpConfig);
            }
            break;
        }
      }
    },
    navToPath(jump_json) {
      let pageNo = jump_json?.dest_page_no;
      let path = "";
      if (jump_json?.tmpl_page_json.file_path) {
        path = jump_json?.tmpl_page_json.file_path.replace(":pageNo", pageNo);
      } else {
        path = `/vpages/index.html#/lowcode-grid/view/${pageNo}?srvApp=config`;
      }
      if (pageNo) {
        if (jump_json.target_type == "原页面") {
          window.location.href = path;
        } else {
          window.open(path);
        }
      }
    },
    setEleSize() {
      const ele = this.$refs.navMenu;
      if (ele) {
        const { top, left, width, height } = ele.getBoundingClientRect();
        this.position.top = top;
        this.position.left = left;
        this.position.width = width;
        this.position.height = height;
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
.nav-menu {
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

    .nav-icon {
      width: 1rem;
      height: 1em;
      display: inline-block;
      color: currentColor;
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
      background-color: #ddd;
    }
  }
}
</style>
