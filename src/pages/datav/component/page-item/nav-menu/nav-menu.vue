<template>
  <div
    class="nav-menu"
    :class="{ isHovered: isHovered }"
    v-if="label"
    :style="mixNavStyle"
    @mouseenter="isHovered = true"
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
    <div
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
    </div>
  </div>
</template>

<script>
export default {
  name: "nav-menu",
};
</script>
<script setup>
import { computed, nextTick, onMounted, reactive, ref } from "vue";
import { formatStyleData } from "@/pages/datav/common/index.js";
import NavMenuChild from "./nav-menu-child.vue";

const props = defineProps({
  config: Object,
  parentConfig: Object,
});
const label = computed(() => {
  return props.config.label;
});
const navStyle = computed(() => {
  let style = {};
  if (props.config?.nav_style_json) {
    style = formatStyleData(props.config.nav_style_json);
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
  return style;
});
const isHovered = ref(false);

const mixNavStyle = computed(() => {
  let style = {};
  if (props.config?.nav_style_json) {
    style = formatStyleData(props.config.nav_style_json);
  }
  console.log("mixHoverStyle:", mixHoverStyle);

  if (isHovered.value && mixHoverStyle.value) {
    style = { ...style, ...mixHoverStyle.value };
  }
  return style;
});

const setLabelStyle = computed(() => {
  if (typeof mixNavStyle.value === "object") {
    let style = { ...mixNavStyle.value };
    if (style["height"]) {
      delete style["height"];
    }
    return style;
  }
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
    top: position.height + "px",
    left: 0,
    width: position.width + "px",
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
    bottom: 0;
    z-index: -1;
    &.active {
      height: auto;
      overflow: unset;
      z-index: 99;
    }
  }
}
</style>
