import { onMounted, onUnmounted, ref, computed } from "vue";

export function useCtrlDown() {
  // 监听ctrl+鼠标拖拽

  let curScrollElement = null;


  const onCtrlKeyDown = ref(false);
  const cursorValue = computed(() => {
    return onCtrlKeyDown.value ? "cursor:grab;" : "cursor:default;";
  });

  // 设置ctrl键按下状态
  const setKeyDown = (e) => {
    if (e?.ctrlKey) {
      onCtrlKeyDown.value = true;
    } else {
      onCtrlKeyDown.value = false;
    }
  };
  // 拖拽滚动
  const onDrag = (e) => {
    curScrollElement?.scrollBy(-e.movementX, -e.movementY);
  };
  // 鼠标抬起 重置curScrollElement
  const resetCurElement = () => {
    curScrollElement = null;
  };
  onMounted(() => {
    const scrollElement = document.querySelector("#screens");
    scrollElement.addEventListener("mousedown", function (e) {
      if (e.ctrlKey && e.button === 0) {
        e.preventDefault();
        curScrollElement = scrollElement;
      }
    });
    document.addEventListener("keydown", setKeyDown);
    document.addEventListener("keyup", setKeyDown);
    document.addEventListener("mousemove", onDrag);
    document.addEventListener("mouseup", resetCurElement);
  });

  onUnmounted(() => {
    document.removeEventListener("keydown", setKeyDown);
    document.removeEventListener("keyup", setKeyDown);
    document.removeEventListener("mousemove", onDrag);
    document.removeEventListener("mouseup", resetCurElement);
  });

  return {
    onCtrlKeyDown,
    cursorValue,
  };
}
