<template>
  <!-- 地图标记点弹窗组件 -->
  <Teleport
    to="body"
    v-if="!isBuildingView && activeMarker && activeMarker.id"
  >
    <div
      class="popover-content-to-body"
      :style="{
        left: calculatedPosition.x + 'px',
        top: calculatedPosition.y + 'px',
      }"
      v-clickoutside="handleClose"
    >
      <transition name="popover-fade">
        <div
          class="popover-content"
          :class="{ show: activeMarker && activeMarker.id }"
        >
          <card-group-cell
            :page-item="pageItem"
            :cellsLayout="[cardUnitJson]"
            :cell-data="[activeMarker]"
            :key="activeMarker.id"
          ></card-group-cell>
        </div>
      </transition>
    </div>
  </Teleport>
</template>

<script setup>
/**
 * 地图标记点弹窗组件
 * 
 * 功能特性：
 * - 🎯 智能定位：根据标记点元素自动计算最佳显示位置
 * - 🔄 平滑动画：支持淡入淡出和缩放动画效果
 * - 📱 响应式设计：适配不同屏幕尺寸，智能避免边界溢出
 * - 🖱️ 交互友好：支持点击外部关闭
 * - 🎨 自适应布局：根据视口空间自动调整弹窗位置
 * 
 * @example
 * <map-popover
 *   :active-marker="currentMarker"
 *   :marker-element="markerDomElement"
 *   :page-item="pageConfig"
 *   :card-unit-json="cardConfig"
 *   :is-building-view="false"
 *   @close="handlePopoverClose"
 * />
 */

import { ref, watch, nextTick } from 'vue';
import Teleport from "vue2-teleport";
import cardGroupCell from "@/pages/datav/component/page-item/card-group-cell/card-group-cell.vue";

/**
 * 组件配置常量
 */
const CONFIG = {
  UI: {
    POPUP_OFFSET: 10, // 弹窗偏移距离
    VIEWPORT_PADDING: 50, // 距离视口边缘的最小间距
  },
  PERFORMANCE: {
    DEBOUNCE_DELAY: 100, // 防抖延迟时间（毫秒）
  },
  DIMENSIONS: {
    DEFAULT_WIDTH: 300, // 默认弹窗宽度
    DEFAULT_HEIGHT: 200, // 默认弹窗高度
  }
};

/**
 * 组件 Props 定义
 */
const props = defineProps({
  // 当前激活的标记点数据
  activeMarker: {
    type: Object,
    default: () => ({}),
    description: "当前激活的标记点对象，包含标记点的所有数据信息"
  },

  // 标记点DOM元素
  markerElement: {
    type: [HTMLElement, null],
    default: null,
    description: "标记点的DOM元素，用于计算弹窗位置"
  },

  // 页面项配置
  pageItem: {
    type: Object,
    default: () => ({}),
    description: "页面项配置对象，包含地图配置、样式等信息"
  },

  // 卡片单元配置
  cardUnitJson: {
    type: Object,
    default: () => ({}),
    description: "卡片单元JSON配置，用于渲染弹窗内容"
  },

  // 是否为建筑物视图
  isBuildingView: {
    type: Boolean,
    default: false,
    description: "是否为建筑物视图模式，建筑物视图下不显示弹窗"
  }
});

/**
 * 组件事件发射器
 */
const emit = defineEmits([
  'close' // 关闭弹窗事件
]);

/**
 * 响应式数据
 */
const calculatedPosition = ref({ x: 0, y: 0 }); // 计算出的弹窗位置
let debounceTimer = null; // 防抖定时器

/**
 * 获取弹窗实际尺寸
 * @function getPopoverDimensions
 * @returns {Object} 包含width和height的对象
 */
function getPopoverDimensions() {
  const popoverElement = document.querySelector('.popover-content-to-body .popover-content');

  if (popoverElement) {
    const rect = popoverElement.getBoundingClientRect();
    return {
      width: rect.width || CONFIG.DIMENSIONS.DEFAULT_WIDTH,
      height: rect.height || CONFIG.DIMENSIONS.DEFAULT_HEIGHT
    };
  }

  // 如果无法获取实际尺寸，返回默认值
  return {
    width: CONFIG.DIMENSIONS.DEFAULT_WIDTH,
    height: CONFIG.DIMENSIONS.DEFAULT_HEIGHT
  };
}

/**
 * 计算弹窗位置
 * 根据标记点元素的位置计算弹窗的显示位置，智能检测视口边界并调整位置
 *
 * @function calculatePopoverPosition
 * @param {HTMLElement} element - 标记点 DOM 元素
 */
function calculatePopoverPosition(element) {
  if (!element) return; // 检查元素是否存在

  // 获取元素相对于视口的位置
  const elementRect = element.getBoundingClientRect();

  // 获取视口尺寸
  const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

  // 获取弹窗实际尺寸或使用估算值
  const popoverDimensions = getPopoverDimensions();
  const popoverWidth = popoverDimensions.width;
  const popoverHeight = popoverDimensions.height;
  const padding = CONFIG.UI.VIEWPORT_PADDING;

  // 标记点中心位置
  const markerCenterX = elementRect.left + elementRect.width / 2;
  const markerCenterY = elementRect.top + elementRect.height / 2;

  // 计算初始位置（默认在元素上方居中）
  let x = markerCenterX;
  let y = elementRect.top - CONFIG.UI.POPUP_OFFSET;

  // 水平位置调整
  const popoverLeft = x - popoverWidth / 2;
  const popoverRight = x + popoverWidth / 2;

  if (popoverLeft < padding) {
    // 左边界溢出，调整弹窗到左对齐
    x = padding + popoverWidth / 2;
  } else if (popoverRight > viewportWidth - padding) {
    // 右边界溢出，调整弹窗到右对齐
    x = viewportWidth - padding - popoverWidth / 2;
  }

  // 垂直位置调整
  const popoverTop = y - popoverHeight; // 考虑transform: translate(-50%, -100%)
  const popoverBottom = y;

  if (popoverTop < padding) {
    // 上边界溢出，将弹窗显示在元素下方
    y = elementRect.bottom + CONFIG.UI.POPUP_OFFSET + popoverHeight;

    // 检查下方是否也会溢出
    if (y > viewportHeight - padding) {
      // 上下都会溢出，选择空间较大的一侧
      const spaceAbove = elementRect.top;
      const spaceBelow = viewportHeight - elementRect.bottom;

      if (spaceAbove > spaceBelow) {
        // 上方空间更大，显示在上方但调整位置
        y = Math.max(padding + popoverHeight, elementRect.top - CONFIG.UI.POPUP_OFFSET);
      } else {
        // 下方空间更大，显示在下方但调整位置
        y = Math.min(viewportHeight - padding, elementRect.bottom + CONFIG.UI.POPUP_OFFSET + popoverHeight);
      }
    }
  } else if (popoverBottom > viewportHeight - padding) {
    // 下边界溢出（这种情况在默认上方显示时不太可能发生，但为了完整性保留）
    y = viewportHeight - padding;
  }

  // 更新弹窗位置
  calculatedPosition.value = { x, y };

  // 可选：添加调试信息
  console.log('弹窗位置计算:', {
    element: { x: elementRect.left, y: elementRect.top, width: elementRect.width, height: elementRect.height },
    marker: { centerX: markerCenterX, centerY: markerCenterY },
    viewport: { width: viewportWidth, height: viewportHeight },
    popover: { x, y, width: popoverWidth, height: popoverHeight },
    adjustments: {
      horizontalOverflow: popoverLeft < padding || popoverRight > viewportWidth - padding,
      verticalOverflow: popoverTop < padding || popoverBottom > viewportHeight - padding
    }
  });
}

/**
 * 检查元素是否在可视区域内
 *
 * @function isElementInViewport
 * @param {HTMLElement} element - 要检查的DOM元素
 * @returns {boolean} 元素是否在可视区域内
 */
function isElementInViewport(element) {
  if (!element) return false;

  const rect = element.getBoundingClientRect();
  const windowHeight = window.innerHeight || document.documentElement.clientHeight;
  const windowWidth = window.innerWidth || document.documentElement.clientWidth;

  // 检查元素是否完全在视口外
  return (
    rect.top < windowHeight &&
    rect.bottom > 0 &&
    rect.left < windowWidth &&
    rect.right > 0
  );
}

/**
 * 视口变化处理函数（防抖优化版本）
 * 当窗口大小变化或页面滚动时，检查标记点是否在可视区域内
 * 如果在可视区域内则重新计算弹窗位置，否则关闭弹窗
 *
 * @function handleViewportChange
 */
function handleViewportChange() {
  // 清除之前的防抖定时器
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  // 设置新的防抖定时器
  debounceTimer = setTimeout(() => {
    // 检查是否有激活的标记点和对应的DOM元素
    if (props.markerElement && props.activeMarker?.id) {
      // 检查标记点元素是否在可视区域内
      if (isElementInViewport(props.markerElement)) {
        // 在可视区域内，重新计算弹窗位置
        calculatePopoverPosition(props.markerElement);
      } else {
        // 不在可视区域内，关闭弹窗
        emit('close');
      }
    }
  }, CONFIG.PERFORMANCE.DEBOUNCE_DELAY);
}

/**
 * 添加窗口事件监听器
 * 监听窗口大小变化和滚动事件，智能管理弹窗显示状态
 *
 * @function addEventListeners
 */
function addEventListeners() {
  window.addEventListener("resize", handleViewportChange);
  window.addEventListener("scroll", handleViewportChange, true);
}

/**
 * 移除窗口事件监听器
 * 清理事件监听器，防止内存泄漏
 *
 * @function removeEventListeners
 */
function removeEventListeners() {
  window.removeEventListener("resize", handleViewportChange);
  window.removeEventListener("scroll", handleViewportChange, true);
}

/**
 * 监听标记点元素变化，重新计算位置
 */
watch(
  () => props.markerElement,
  (newElement) => {
    if (newElement && props.activeMarker?.id) {
      // 立即计算位置
      nextTick(() => {
        calculatePopoverPosition(newElement);
      });

      // 延迟重新计算位置，确保弹窗内容已渲染
      setTimeout(() => {
        if (newElement && props.activeMarker?.id) {
          calculatePopoverPosition(newElement);
        }
      }, 100);

      // 再次延迟计算，处理可能的异步内容加载
      setTimeout(() => {
        if (newElement && props.activeMarker?.id) {
          calculatePopoverPosition(newElement);
        }
      }, 300);

      // 添加事件监听器
      addEventListeners();
    } else {
      // 移除事件监听器
      removeEventListeners();
    }
  },
  { immediate: true }
);

/**
 * 监听激活标记点变化
 */
watch(
  () => props.activeMarker,
  (newMarker) => {
    if (!newMarker?.id) {
      // 标记点被清空，移除事件监听器
      removeEventListeners();
    }
  }
);

/**
 * 处理弹窗关闭
 * @function handleClose
 */
const handleClose = () => {
  emit('close');
};

/**
 * 组件卸载时清理事件监听器
 */
import { onUnmounted } from 'vue';
onUnmounted(() => {
  removeEventListeners();
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }
});
</script>

<style lang="scss">
/* 弹窗容器样式 */
.popover-content-to-body {
  position: fixed;
  z-index: 1000;
  border-radius: 5px;
  transform: translate(-50%, -100%) scale(1);
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
  opacity: 1;
  width: max-content;
  height: max-content;
  pointer-events: auto;

  /* 弹窗动画效果 */
  &.popover-fade-enter-active,
  &.popover-fade-leave-active {
    transition: all 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55);
  }

  &.popover-fade-enter,
  &.popover-fade-leave-to {
    opacity: 0;
    transform: translate(-50%, -120%) scale(0.8);
  }

  &.popover-fade-enter-to,
  &.popover-fade-leave {
    opacity: 1;
    transform: translate(-50%, -100%) scale(1);
  }
}

/* 弹窗内容样式 */
.popover-content-to-body .popover-content {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.8);
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55);
  background-color: rgba(0, 0, 0, 0.1);
  overflow: hidden;

  &.show {
    opacity: 1;
    transform: translate(0%, 0%) scale(1);
  }
}
</style>