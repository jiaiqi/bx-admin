<template>
  <div
    class="grid-list"
    :style="[setStyle]"
    v-if="config && setList && setList.length"
  >
    <div
      class="grid-item"
      v-for="(item, index) in setList"
      :key="index"
      :class="{
        'cursor-pointer':
          config.matrix_jump_url_col && item[config.matrix_jump_url_col],
      }"
      :style="[setElementStyle, hoverStyle]"
      @mouseenter="isHovered = true"
      @mouseleave="isHovered = false"
      @click="openUrl(item[config.matrix_jump_url_col])"
    >
      <img
        class="grid-item-img"
        :src="item[config.matrix_icon_col]"
        alt=""
        v-if="config.matrix_icon_col"
      />
      <span v-if="config.matrix_label_col">
        {{ item[config.matrix_label_col] }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { formatStyleData } from "@/pages/datav/common/index.js";
const props = defineProps({
  config: Object,
  list: Array,
});

const setList = computed(()=>{
  const layout = props?.config?.layout_json||{};
  if(layout?.rows_max && layout?.cols_num>0){
    return props.list.slice(0, layout.rows_max*layout.cols_num)
  }
  return props.list
})
const setStyle = computed(() => {
  const layout = props?.config?.layout_json||{};
  let style = {};
  style["display"] = "grid";
  let height =
    layout.hasOwnProperty("style_json") &&
    layout.style_json.hasOwnProperty("height")
      ? layout.style_json.height
      : "auto";

  if (layout["rows_max"]) {
    style["grid-template-rows"] = `repeat(${layout["rows_max"]},${height})`;
  }
  style["grid-template-columns"] = `repeat(${layout["cols_num"] || 4}, 1fr)`;
  if (typeof layout["style_json"] === "object") {
    style = { ...style, ...layout["style_json"] };
  }
  if (typeof layout["style_json_diy"] === "object") {
    style = { ...style, ...layout["style_json_diy"] };
  }
  return formatStyleData(style);
});

const setElementStyle = computed(() => {
  const config = props?.config;

  let style = {};
  if (config["element_style_json"]) {
    style = config["element_style_json"];
  }
  return formatStyleData(style);
});

// 鼠标悬浮时的样式
const isHovered = ref(false);
const hoverStyle = computed(() => {
  if (!isHovered.value) {
    return {};
  }
  const config = props?.config;
  let style = {};
  if (config["mouse_hover_style_json"]) {
    style = config["mouse_hover_style_json"];
  }
  return formatStyleData(style);
});
function openUrl(url) {
  if (url) {
    window.open(url);
  }
}
</script>

<style lang="scss" scoped>
.grid-item {
  display: flex;
  flex-direction: column;
}
.grid-item-img {
  width: 100%;
}
.cursor-pointer {
  cursor: pointer;
}
</style>
