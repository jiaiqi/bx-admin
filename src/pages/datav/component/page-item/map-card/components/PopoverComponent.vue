<template>
  <Teleport to="body" v-if="activeMarker && activeMarker.id">
    <div
      class="popover-content-to-body"
      :style="{
        left: popoverPosition.left + 'px',
        top: popoverPosition.top + 'px',
      }"
      v-clickoutside="$emit('close')"
    >
      <transition name="popover-fade">
        <div
          class="popover-content"
          :class="{ show: activeMarker && activeMarker.id }"
        >
          <!-- 动态箭头方向和位置 -->
          <div 
            :class="[
              'popover-arrow',
              popoverPosition.arrowDirection || 'bottom'
            ]"
            :style="{
              left: (popoverPosition.arrowDirection === 'top' || popoverPosition.arrowDirection === 'bottom') 
                ? (popoverPosition.arrowPosition || 50) + '%' 
                : undefined,
              top: (popoverPosition.arrowDirection === 'left' || popoverPosition.arrowDirection === 'right') 
                ? (popoverPosition.arrowPosition || 50) + '%' 
                : undefined
            }"
          ></div>
          
          <!-- 使用card-group-cell组件显示内容，与原组件保持一致 -->
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
import { computed } from 'vue'
import Teleport from 'vue2-teleport'
import cardGroupCell from '../../card-group-cell/card-group-cell.vue'

/**
 * 弹窗组件
 * 用于显示标记点的详细信息
 */

const props = defineProps({
  activeMarker: {
    type: Object,
    default: () => ({})
  },
  popoverPosition: {
    type: Object,
    default: () => ({ left: 0, top: 0 })
  },
  pageItem: {
    type: Object,
    default: () => ({})
  },
  cardUnitJson: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['close', 'drill-down'])
</script>

<style lang="scss">
/* 全局样式，与原CustomMapView.vue保持一致 */
:global(.popover-content-to-body) {
  position: fixed;
  z-index: 1000;
  border-radius: 5px;
  transform: translate(-50%, -100%) scale(1);
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
  opacity: 1;
  width: max-content;
  height: max-content;

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

:global(.popover-content-to-body .popover-content) {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.8);
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55);
  background-color: rgba(0, 0, 0, 0.1);
}

:global(.popover-content-to-body .popover-content.show) {
  opacity: 1;
  transform: translate(0%, 0%) scale(1);
}

:global(.popover-content-to-body .popover-arrow) {
  position: absolute;
  width: 0;
  height: 0;
  z-index: 1001;
}

/* 箭头指向下方（弹窗在标记物上方） */
:global(.popover-content-to-body .popover-arrow.bottom) {
  top: 100%;
  transform: translateX(-50%);
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-top: 8px solid #fff;
}

/* 箭头指向上方（弹窗在标记物下方） */
:global(.popover-content-to-body .popover-arrow.top) {
  bottom: 100%;
  transform: translateX(-50%);
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-bottom: 8px solid #fff;
}

/* 箭头指向左侧（弹窗在标记物右侧） */
:global(.popover-content-to-body .popover-arrow.left) {
  right: 100%;
  transform: translateY(-50%);
  border-top: 8px solid transparent;
  border-bottom: 8px solid transparent;
  border-right: 8px solid #fff;
}

/* 箭头指向右侧（弹窗在标记物左侧） */
:global(.popover-content-to-body .popover-arrow.right) {
  left: 100%;
  transform: translateY(-50%);
  border-top: 8px solid transparent;
  border-bottom: 8px solid transparent;
  border-left: 8px solid #fff;
}
</style>