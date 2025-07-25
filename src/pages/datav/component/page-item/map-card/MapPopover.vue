<template>
  <!-- 地图标记点弹窗组件 -->
  <Teleport
    to="body"
    v-if="!isBuildingView && activeMarker && activeMarker.id"
  >
    <div
      class="popover-content-to-body"
      :style="{
        left: popoverPosition.x + 'px',
        top: popoverPosition.y + 'px',
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
 * - 🎯 智能定位：显示在指定位置
 * - 🔄 平滑动画：支持淡入淡出和缩放动画效果
 * - 📱 响应式设计：适配不同屏幕尺寸
 * - 🖱️ 交互友好：支持点击外部关闭
 * 
 * @example
 * <map-popover
 *   :active-marker="currentMarker"
 *   :popover-position="position"
 *   :page-item="pageConfig"
 *   :card-unit-json="cardConfig"
 *   :is-building-view="false"
 *   @close="handlePopoverClose"
 * />
 */

import Teleport from "vue2-teleport";
import cardGroupCell from "../card-group-cell/card-group-cell.vue";

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

  // 弹窗位置信息
  popoverPosition: {
    type: Object,
    default: () => ({ x: 0, y: 0 }),
    description: "弹窗位置坐标，包含 x, y"
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
 * 处理弹窗关闭
 * @function handleClose
 */
const handleClose = () => {
  emit('close');
};
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
  border-radius: 5px;
  overflow: hidden;

  &.show {
    opacity: 1;
    transform: translate(0%, 0%) scale(1);
  }
}
</style>