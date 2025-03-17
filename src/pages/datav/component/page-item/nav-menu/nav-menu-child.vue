<template>
  <div
    class="nav-sub-menu"
    v-if="label"
    :style="[navStyle, isHovered ? mixHoverStyle : {}]"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
    ref="navMenu"
  >
    <span class="nav-menu-label" @click.stop.capture="navTo(jumpJson)">
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
    </span>
    <div
      class="nav-menu-child"
      :class="{ active: isHovered }"
      :style="[isHovered ? childPositionStyle : {}]"
      v-if="subMenu && subMenu.length"
    >
      <nav-sub-menu
        v-for="(item, index) in subMenu"
        :key="index"
        :config="item"
        :parent-style="navStyle"
        :parent-hover-style="mixHoverStyle"
        :parent-config="config"
      ></nav-sub-menu>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { formatStyleData } from "@/pages/datav/common/index.js";
// import NavMenuChild from "./nav-menu-child.vue";
import NavSubMenu from "./nav-menu-child.vue";
const props = defineProps({
  config: Object,
  parentStyle: Object,
  parentHoverStyle: Object,
});
const label = computed(() => {
  return props.config.label;
});
const navStyle = computed(() => {
  let style = {};
  if (props.config?.nav_style_json) {
    style = formatStyleData(props.config.nav_style_json);
  }
  if (props.parentStyle) {
    style = { ...props.parentStyle, ...style };
  }
  return style;
});
const subMenu = computed(() => {
  let json = props.config?.sub_json;
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
});
const mixHoverStyle = computed(() => {
  let style = {};
  if (props.config?.seleted_style_json) {
    style = formatStyleData(props.config.seleted_style_json);
  }
  if (props.parentHoverStyle) {
    style = { ...props.parentHoverStyle, ...style };
  }
  return style;
});
const isHovered = ref(false);

const mixNavStyle = computed(() => {
  let style = {};
  if (props.config?.nav_style_json) {
    style = formatStyleData(props.config.nav_style_json);
  }
  if (props.parentStyle) {
    style = { ...props.parentStyle, ...style };
  }
  if (isHovered.value && mixHoverStyle.value) {
    style = { ...style, ...mixHoverStyle.value };
  }
  return style;
});

const position = reactive({
  top: 0,
  left: 0,
  width: 0,
  height: 0,
});

const childPositionStyle = computed(() => {
  return {
    // top: position.top + "px",
    top: 0,
    right: 0,
    width: position.width || 150 + "px",
    // height: "unset",
  };
});

const jumpJson = computed(() => {
  if (props.config.jump_json) {
    try {
      return JSON.parse(props.config.jump_json);
    } catch (error) {
      console.error(error);
    }
  }
});

function navTo(jumpConfig) {
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
          navToPath(jumpConfig);
        }
        break;
    }
  }
}
function navToPath(jump_json) {
  let pageNo = jump_json?.dest_page_no;
  let path = "";
  if (jump_json?.tmpl_page_json.file_path) {
    path = jump_json?.tmpl_page_json.file_path.replace(":pageNo", pageNo);
  } else {
    path = `/vpages/index.html#/lowcode-grid/view/${pageNo}?srvApp=config`;
  }
  if (pageNo) {
    console.log(path);
    if (jump_json.target_type == "原页面") {
      window.location.href = path;
    } else {
      window.open(path);
    }
  }
}

const navMenu = ref("");
function setEleSize() {
  const ele = navMenu.value;
  if (ele) {
    const { top, left, width, height } = ele.getBoundingClientRect();
    position.top = top;
    position.left = left;
    position.width = width;
    position.height = height;
  }
}
onMounted(() => {
  setEleSize();
  setTimeout(() => {
    setEleSize();
  }, 1000);
});
</script>

<style lang="scss" scoped>
.nav-sub-menu {
  display: flex;
  justify-content: center;
  align-items: center;
  // height: 100%;
  cursor: pointer;
  z-index: 99;
  .nav-menu-label {
    z-index: 100;
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
  .nav-menu-child {
    position: absolute;
    width: 100%;
    z-index: -1;
    transition: all 0.3s ease-in-out;
    height: 0;
    transform: translateX(0);
    overflow: hidden;
    &.active {
      height: unset;
      overflow: unset;
      z-index: 99;
      transform: translateX(100%);
    }
  }
}
</style>
