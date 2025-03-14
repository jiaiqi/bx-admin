<template>
  <div v-if="viewMode === '展开子导航'" :style="mixNavStyle">
    <div
      class="nav-menu"
      :style="mixNavStyle"
      v-for="(item, key) in subMenu"
      :key="key"
    >
      <nav-menu
        :config="item"
        :parent-style="navStyle"
        :parent-hover-style="mixHoverStyle"
        :pageConfig="pageConfig"
        :parent-config="config"
      ></nav-menu>
    </div>
  </div>
  <div
    class="nav-menu"
    :class="{ isHovered: isHovered }"
    v-else-if="label"
    :style="mixNavStyle"
    @mouseenter="isHovered = true;showChild = true"
    @mouseleave="isHovered = false"
    ref="navMenu"
  >
    <div
      class="nav-menu-label"
      :style="[setLabelStyle]"
      @click.stop.capture="navTo(jumpJson)"
    >
      {{ label }}
    </div>
    <nav-menu-child
      :config="config"
      :parent-config="parentConfig"
      :pageConfig="pageConfig"
      :isHovered="showChild"
      :parent-style="parentStyle"
      @leave="showChild = false"
    ></nav-menu-child>
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

export default {
  name: "NavMenu",
  components: {
    NavMenuChild,
    NavMenu,
  },
  props: {
    config: Object,
    parentConfig: Object,
    pageConfig: Object,
    parentStyle:Object
  },
  data() {
    return {
      isHovered: false,
      showChild:false,
      position: {
        top: 0,
        left: 0,
        width: 0,
        height: 0,
      },
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
      return json;
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
    navTo(jumpConfig) {
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
.nav-menu {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  cursor: pointer;
  z-index: 99;
  .nav-menu-label {
    z-index: 100;
    width: 100%;
    text-align: center;
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
}
</style>
