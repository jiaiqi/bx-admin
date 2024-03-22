<template>
  <div v-if="widgetType === '文本'" :style="[widgetStyleJson]">
    <span v-if="pageItem && pageItem.widget_json">{{
      pageItem.widget_json.init_val || ""
    }}</span>
  </div>
  <div
    class="rich-text"
    v-else-if="widgetType === '富文本'"
    :style="[widgetStyleJson]"
    v-html="initRichText"
  ></div>
  <div
    v-else-if="widgetType === 'navigate'"
    class="text-btn"
    @click="navTo"
    :style="[widgetStyleJson]"
  >
    {{ buttonWidgetJson.btn_label }}
  </div>
  <date-time
    v-else-if="widgetType === '时间日期'"
    :show-seconds="showSeconds"
    :parts-set="timeWidgetJson['parts-set']"
    :color="widgetColor"
  ></date-time>
  <div
    class="full-screen"
    @click="openFullscreen"
    v-else-if="widgetType === 'fullscreen'"
    :style="[widgetStyleJson]"
  >
    <span
      class="el-icon-rank"
      v-if="isFullScreen"
      title="退出全屏"
      style="transform: rotate(45deg)"
    ></span>
    <span class="el-icon-full-screen" v-else title="全屏"></span>
  </div>
</template>

<script setup>
import { computed, ref, defineEmits } from "vue";
import { formatStyleData } from "../../common/index";
import dateTime from "../widgets/date-time.vue";
const props = defineProps({
  pageItem: Object,
  pageNo: String,
});

const widgetJson = computed(() => {
  return props.pageItem?.widget_json || {};
});

//文本
const widgetStyleJson = computed(() => {
  if (widgetJson.value?.col_text_pub_style_json) {
    return formatStyleData(widgetJson.value.col_text_pub_style_json);
  }
});

// 富文本内容
const initRichText = computed(() => {
  return widgetJson.value?.init_mtext || widgetJson.value?.init_val || "";
});

// 按钮
const buttonWidgetJson = computed(() => {
  if (widgetJson.value?.button_cfg_json) {
    return widgetJson.value.button_cfg_json;
  }
});

const addTabByUrl = function (url, tab_title, urlParams, type) {
  url = url || common_page_path[type] + "?data=" + urlParams;
  let page = {
    title: tab_title || "新标页签",
    url,
  };

  if (window.top.tab && window.top.tab.addTab) {
    window.top.tab.addTab(page);
  } else {
    let strWindowFeatures =
      "menubar=yes,location=yes,resizable=yes,scrollbars=yes,status=yes";
    let newWindow = window.open(url, "CNN_WindowName", strWindowFeatures);
    newWindow.document.title = tab_title;
  }
};
const navTo = () => {
  if(widgetJson.value?.jump_json?.jump_no){
    // 使用配置的跳转事件
    const jumpJson = widgetJson.value.jump_json;
    if (jumpJson.obj_type ==='内部页面' && props.pageNo) {
      window.open(
        location.href.replace(props.pageNo, jumpJson.dest_page_no)
      );
    }
  }else if (widgetJson.value?.nav_url) {
    addTabByUrl(widgetJson.value?.nav_url);
  } else if (widgetJson.value.button_cfg_json?.jump_json) {
    const jump_json = widgetJson.value.button_cfg_json.jump_json;
    if (jump_json.dest_page_no && props.pageNo) {
      window.open(location.href.replace(props.pageNo, jump_json.dest_page_no));
    }
  }
};

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
  if (type === "系统按钮") {
    type = widgetJson.value?.button_cfg_json?.sys_button_type;
  }
  return type;
});

const widgetColor = computed(() => {
  return widgetJson.value?.col_text_pub_style_json?.color;
});

const isFullScreen = ref(false);
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
const emit = defineEmits(["resize"]);
window.addEventListener("resize", () => {
  if (!document.fullscreenElement) {
    isFullScreen.value = false;
  } else {
    isFullScreen.value = true;
  }
  emit("resize");
});
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
  transition: all 0.5s ease;
  background-color: #409eff;
  color: #fff;
  border-radius: 8px;
  min-height: 30px;
  &:active {
    transform: scale(1.1);
  }
}
</style>
