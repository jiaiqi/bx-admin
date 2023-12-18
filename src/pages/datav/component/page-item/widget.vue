<template>
  <div v-if="widgetType === '文本'" :style="[textWidgetJson]">
    <span v-if="pageItem && pageItem.widget_json">{{
      pageItem.widget_json.init_val || ""
    }}</span>
  </div>
  <div v-else-if="widgetType === 'navigate'" class="text-btn">{{ widgetJson.init_val || '' }}</div>
  <date-time v-else-if="widgetType === '时间日期'" :show-seconds="showSeconds" :parts-set="timeWidgetJson['parts-set']"
    :color="widgetColor"></date-time>
  <div class="full-screen" @click="openFullscreen" v-else-if="widgetType === 'fullscreen'" :style="[textWidgetJson]">
    <span class="el-icon-rank" v-if="isFullScreen" title="退出全屏" style="transform: rotate(45deg);"></span>
    <span class="el-icon-full-screen" v-else title="全屏"></span>
  </div>
</template>

<script setup>
import { computed, ref, defineEmits } from "vue";
import { formatStyleData } from "@/common/common.js";
import dateTime from "../widgets/date-time.vue";
const props = defineProps({
  pageItem: Object,
});

const widgetJson = computed(() => {
  return props.pageItem?.widget_json || {}
})

//文本
const textWidgetJson = computed(() => {
  if (widgetJson.value?.col_text_pub_style_json) {
    return formatStyleData(widgetJson.col_text_pub_style_json);
  }
});

// 按钮
const buttonWidgetJson = computed(() => {
  if (widgetJson.value?.button_cfg_json) {
    return widgetJson.value.button_cfg_json;
  }
});

const navTo = ()=>{
  
}

// 时间日期
const timeWidgetJson = computed(() => {
  if (widgetJson.value?.col_type_time_json) {
    return formatStyleData(widgetJson.value.col_type_time_json);
  }
});


const showSeconds = computed(() => {
  return timeWidgetJson.value &&
    timeWidgetJson.value["parts-set"] &&
    timeWidgetJson.value["parts-set"].indexOf("秒")
    ? true
    : false;
});

const widgetType = computed(() => {
  let type = widgetJson.value?.widget_type;
  if (type === '系统按钮') {
    type = widgetJson.value?.button_cfg_json?.sys_button_type
  }
  return type
});

const widgetColor = computed(() => {
  return widgetJson.value?.col_text_pub_style_json?.color;
});

const isFullScreen = ref(false)
function openFullscreen() {
  isFullScreen.value = !isFullScreen.value;
  toggleFullScreen();
}
function requestFullScreen(element) {
  //进入全屏状态 判断各种浏览器，找到正确的方法
  if (!element) {
    element = document.body;
  }
  var requestMethod =
    element.requestFullScreen || //W3C
    element.webkitRequestFullScreen || //Chrome等
    element.mozRequestFullScreen || //FireFox
    element.msRequestFullScreen; //IE11
  if (requestMethod) {
    requestMethod.call(element);
  } else if (typeof window.ActiveXObject !== "undefined") {
    //for Internet Explorer
    var wscript = new ActiveXObject("WScript.Shell");
    if (wscript !== null) {
      wscript.SendKeys("{F11}");
    }
  }
}
function toggleFullScreen() {
  //切换全屏状态
  if (!document.fullscreenElement) {
    requestFullScreen();
  } else {
    exitFullScreen();
  }
}
function exitFullScreen() {
  // 退出全屏状态 判断各种浏览器，找到正确的方法
  var exitMethod =
    document.exitFullscreen || //W3C
    document.mozCancelFullScreen || //FireFox
    document.webkitExitFullscreen || //Chrome等
    document.webkitExitFullscreen; //IE11
  if (exitMethod && document.fullscreenElement) {
    exitMethod.call(document);
  } else if (typeof window.ActiveXObject !== "undefined") {
    //for Internet Explorer
    var wscript = new ActiveXObject("WScript.Shell");
    if (wscript !== null) {
      wscript.SendKeys("{F11}");
    }
  }
}
const emit = defineEmits(['resize'])
window.addEventListener('resize', () => {
  if (!document.fullscreenElement) {
    isFullScreen.value = false
  } else {
    isFullScreen.value = true
  }
  emit('resize')
})
// window.onresize = () => {
//   if (!document.fullscreenElement) {
//     isFullScreen.value = false
//   } else {
//     isFullScreen.value = true
//   }
//   emit('resize')
// };
</script>

<style lang="scss" scoped>
.full-screen {
  cursor: pointer;
  font-size: 30px;
}

.text-btn {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all .5s ease;
  &:active{
    transform: scale(1.1);
  }
}</style>
