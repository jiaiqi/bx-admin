<template>
  <div
    ref="containerRef"
    class="zoom-drag-container"
    :class="{
      'ctrl-pressed': isCtrlPressed,
      'space-pressed': isSpacePressed && !isDragging,
      'dragging': isDragging,
    }"
    @wheel="handleWheel"
    @mousedown="handleMouseDown"
    @mousemove="handleMouseMove"
    @mouseup="handleMouseUp"
    @mouseleave="handleMouseUp"
    @keydown="handleKeyDown"
    @keyup="handleKeyUp"
    @mouseenter="showTips"
    @focus="showTips"
    tabindex="0"
  >
    <div
      class="content-view"
      :class="{ 'no-transition': isDragging }"
      :style="{
        transform: `translate(${mapPosition.x}px, ${mapPosition.y}px) scale(${zoomScale})`,
        transformOrigin: 'center center',
      }"
    >
      <slot></slot>
    </div>

    <!-- 交互提示 -->
    <transition name="tips-fade">
      <div
        v-if="showInteractionTips"
        class="interaction-tips"
      >
        <div class="tips-item">
          <div class="tips-icon zoom-icon">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                cx="11"
                cy="11"
                r="8"
                stroke="currentColor"
                stroke-width="2"
              />
              <path
                d="m21 21-4.35-4.35"
                stroke="currentColor"
                stroke-width="2"
              />
              <line
                x1="8"
                y1="11"
                x2="14"
                y2="11"
                stroke="currentColor"
                stroke-width="2"
              />
              <line
                x1="11"
                y1="8"
                x2="11"
                y2="14"
                stroke="currentColor"
                stroke-width="2"
              />
            </svg>
          </div>
          <div class="tips-text">
            <kbd>Ctrl</kbd> + 滚轮缩放
          </div>
        </div>
        <div class="tips-item">
          <div class="tips-icon drag-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
            ><!-- Icon from Remix Icon by Remix Design - https://github.com/Remix-Design/RemixIcon/blob/master/License -->
              <path
                fill="currentColor"
                d="m12 22l-4-4h8zm0-20l4 4H8zm0 12a2 2 0 1 1 0-4a2 2 0 0 1 0 4M2 12l4-4v8zm20 0l-4 4V8z"
              />
            </svg>
          </div>
          <div class="tips-text">
            <kbd>Space</kbd> + 拖拽移动
          </div>
        </div>
        <button
          class="tips-close"
          @click="hideTips"
          title="关闭提示"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
          >
            <line
              x1="18"
              y1="6"
              x2="6"
              y2="18"
              stroke="currentColor"
              stroke-width="2"
            />
            <line
              x1="6"
              y1="6"
              x2="18"
              y2="18"
              stroke="currentColor"
              stroke-width="2"
            />
          </svg>
        </button>
      </div>
    </transition>
    <!-- 重置按钮 -->
    <button
      class="reset-btn"
      v-show="!isInitialView"
      @click="resetView"
      title="恢复初始视图"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C9.61305 21 7.3262 19.9289 5.63604 18.364"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
        />
        <path
          d="M3 16L5.636 18.364L8 16"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

// 组件属性
const props = defineProps({
  showTips: {
    type: Boolean,
    default: true
  },
  autoHideTips: {
    type: Boolean,
    default: true
  },
  tipsDelay: {
    type: Number,
    default: 3000
  }
});

// 配置常量
const CONFIG = {
  ZOOM: {
    MIN: 0.1,
    MAX: 5,
    DEFAULT: 1,
    STEP: 0.1
  }
};

const containerRef = ref(null);
const zoomScale = ref(CONFIG.ZOOM.DEFAULT);
const minZoom = CONFIG.ZOOM.MIN;
const maxZoom = CONFIG.ZOOM.MAX;
const mapPosition = ref({ x: 0, y: 0 });
const isDragging = ref(false);
const dragStart = ref({ x: 0, y: 0 });
const isSpacePressed = ref(false);
const isCtrlPressed = ref(false);
const showInteractionTips = ref(false);
let animationFrameId = null;
let tipsTimer = null;

const isInitialView = computed(() => zoomScale.value === 1 && mapPosition.value.x === 0 && mapPosition.value.y === 0);

const scale = computed(() => zoomScale.value);
const position = computed(() => mapPosition.value);

const handleWheel = (event) => {
  if (!isCtrlPressed.value) return;

  event.preventDefault();

  const delta = event.deltaY > 0 ? -CONFIG.ZOOM.STEP : CONFIG.ZOOM.STEP;
  const newScale = Math.max(minZoom, Math.min(maxZoom, zoomScale.value + delta));

  if (newScale !== zoomScale.value) {
    zoomScale.value = newScale;
  }
};

const handleMouseDown = (event) => {
  if (!isSpacePressed.value || event.button !== 0) return;

  event.preventDefault();
  isDragging.value = true;
  dragStart.value = {
    x: event.clientX - mapPosition.value.x,
    y: event.clientY - mapPosition.value.y
  };
};

const handleMouseMove = (event) => {
  if (!isDragging.value || !isSpacePressed.value) return;

  event.preventDefault();

  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }

  animationFrameId = requestAnimationFrame(() => {
    mapPosition.value = {
      x: event.clientX - dragStart.value.x,
      y: event.clientY - dragStart.value.y
    };
  });
};

const handleMouseUp = () => {
  isDragging.value = false;
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
};

const handleKeyDown = (event) => {
  if (event.code === 'Space') {
    event.preventDefault();
    isSpacePressed.value = true;
  } else if (event.code === 'ControlLeft' || event.code === 'ControlRight') {
    isCtrlPressed.value = true;
  }
};

const handleKeyUp = (event) => {
  if (event.code === 'Space') {
    isSpacePressed.value = false;
    isDragging.value = false;
  } else if (event.code === 'ControlLeft' || event.code === 'ControlRight') {
    isCtrlPressed.value = false;
  }
};

const resetView = () => {
  zoomScale.value = CONFIG.ZOOM.DEFAULT;
  mapPosition.value = { x: 0, y: 0 };
};

const showTips = () => {
  if (!props.showTips) return;

  if (tipsTimer) clearTimeout(tipsTimer);
  showInteractionTips.value = true;

  if (props.autoHideTips) {
    tipsTimer = setTimeout(() => {
      showInteractionTips.value = false;
    }, props.tipsDelay);
  }
};

const hideTips = () => {
  if (tipsTimer) clearTimeout(tipsTimer);
  showInteractionTips.value = false;
};

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
  window.removeEventListener('keyup', handleKeyUp);
  if (tipsTimer) clearTimeout(tipsTimer);
});
</script>

<style
  lang="scss"
  scoped
>
.zoom-drag-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
  outline: none;
  user-select: none;
  scrollbar-width: none;

  // 可视化编辑器画布背景 - 点状网格
  background-color: #f8f9fa;
  background-image: radial-gradient(circle at center,
      rgba(0, 0, 0, 0.15) 1px,
      transparent 1px);
  background-size: 20px 20px;
  background-position: 0 0;

  &:focus {
    outline: none;
  }

  // Ctrl键按下时的缩放光标样式
  &.ctrl-pressed {
    cursor: zoom-in !important;

    * {
      cursor: zoom-in !important;
    }
  }

  // 空格键按下时的拖拽光标样式
  &.space-pressed {
    cursor: grab !important;

    * {
      cursor: grab !important;
    }
  }

  // 拖拽中的光标样式
  &.dragging {
    cursor: grabbing !important;

    * {
      cursor: grabbing !important;
    }
  }
}

.content-view {
  width: 100%;
  height: 100%;
  transition: transform 0.2s ease-out;
  background-color: rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  position: relative;

  // 拖拽时禁用过渡动画以提升性能
  &.no-transition {
    transition: none !important;
  }
}

// 交互提示样式
.interaction-tips {
  position: absolute;
  bottom: 20px;
  right: 20px;
  transform: translate(0, -100%);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  padding: 16px 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 200px;

  .tips-item {
    display: flex;
    align-items: center;
    gap: 12px;
    color: #333;
    font-size: 14px;

    .tips-icon {
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #666;
      flex-shrink: 0;
    }

    .tips-text {
      display: flex;
      align-items: center;
      gap: 6px;

      kbd {
        background: #f5f5f5;
        border: 1px solid #ddd;
        border-radius: 4px;
        padding: 2px 6px;
        font-size: 12px;
        font-family: monospace;
        color: #333;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
      }
    }
  }

  .tips-close {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 24px;
    height: 24px;
    border: none;
    background: transparent;
    cursor: pointer;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #999;
    transition: all 0.2s ease;

    &:hover {
      background: rgba(0, 0, 0, 0.05);
      color: #666;
    }
  }
}

// 提示动画
.tips-fade-enter-active,
.tips-fade-leave-active {
  transition: all 0.3s ease;
}

.tips-fade-enter-from {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

.tips-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

// 一键恢复按钮样式
.reset-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  }

  :deep(.reset-icon) {
    font-size: 18px;
    color: #666;
    transition: color 0.2s ease;
  }

  &:hover :deep(.reset-icon) {
    color: #333;
  }
}
</style>