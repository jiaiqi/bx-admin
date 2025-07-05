<template>
  <div 
    class="card-popup-container"
    :style="popupStyle"
    ref="popupContainer"
  >
    <!-- 小三角箭头 -->
    <div 
      class="card-popup-arrow"
      :class="arrowClass"
      :style="arrowStyle"
    ></div>
    
    <card-group-cell
      :page-item="{}"
      :cellsLayout="[cardUnitJson]"
      :cell-data="[data]"
    ></card-group-cell>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import cardGroupCell from "../card-group-cell/card-group-cell.vue";

const props = defineProps({
  cardUnitJson: {
    type: Object,
    default: () => {},
  },
  data: {
    type: Object,
    default: () => {},
  },
  clickedElement: {
    type: [Element, null],
    default: null,
  },
  placement: {
    type: String,
    default: '下',
  },
});

const { cardUnitJson, data, clickedElement, placement } = props;
const popupContainer = ref(null);
const forceUpdate = ref(0);

// 强制重新计算位置
const updatePosition = () => {
  forceUpdate.value++;
};

// 计算箭头的CSS类名
const arrowClass = computed(() => {
  return `arrow-${placement}`;
});

// 计算箭头的样式
const arrowStyle = computed(() => {
  if (!clickedElement) {
    return { display: 'none' };
  }
  
  const baseStyle = {
    position: 'absolute',
    width: '0',
    height: '0',
    borderStyle: 'solid',
  };
  
  // 根据placement设置箭头位置和方向
   switch (placement) {
     case '上':
       return {
         ...baseStyle,
         bottom: '-8px',
         left: '50%',
         transform: 'translateX(-50%)',
         borderWidth: '8px 8px 0 8px',
         borderColor: '#fff transparent transparent transparent',
       };
     case '上左':
       return {
         ...baseStyle,
         bottom: '-8px',
         left: '20px',
         borderWidth: '8px 8px 0 8px',
         borderColor: '#fff transparent transparent transparent',
       };
     case '上右':
       return {
         ...baseStyle,
         bottom: '-8px',
         right: '20px',
         borderWidth: '8px 8px 0 8px',
         borderColor: '#fff transparent transparent transparent',
       };
     case '下':
       return {
         ...baseStyle,
         top: '-8px',
         left: '50%',
         transform: 'translateX(-50%)',
         borderWidth: '0 8px 8px 8px',
         borderColor: 'transparent transparent #fff transparent',
       };
     case '下左':
       return {
         ...baseStyle,
         top: '-8px',
         left: '20px',
         borderWidth: '0 8px 8px 8px',
         borderColor: 'transparent transparent #fff transparent',
       };
     case '下右':
       return {
         ...baseStyle,
         top: '-8px',
         right: '20px',
         borderWidth: '0 8px 8px 8px',
         borderColor: 'transparent transparent #fff transparent',
       };
     case '左':
       return {
         ...baseStyle,
         right: '-8px',
         top: '50%',
         transform: 'translateY(-50%)',
         borderWidth: '8px 0 8px 8px',
         borderColor: 'transparent transparent transparent #fff',
       };
     case '左上':
       return {
         ...baseStyle,
         right: '-8px',
         top: '20px',
         borderWidth: '8px 0 8px 8px',
         borderColor: 'transparent transparent transparent #fff',
       };
     case '左下':
       return {
         ...baseStyle,
         right: '-8px',
         bottom: '20px',
         borderWidth: '8px 0 8px 8px',
         borderColor: 'transparent transparent transparent #fff',
       };
     case '右':
       return {
         ...baseStyle,
         left: '-8px',
         top: '50%',
         transform: 'translateY(-50%)',
         borderWidth: '8px 8px 8px 0',
         borderColor: 'transparent #fff transparent transparent',
       };
     case '右上':
       return {
         ...baseStyle,
         left: '-8px',
         top: '20px',
         borderWidth: '8px 8px 8px 0',
         borderColor: 'transparent #fff transparent transparent',
       };
     case '右下':
       return {
         ...baseStyle,
         left: '-8px',
         bottom: '20px',
         borderWidth: '8px 8px 8px 0',
         borderColor: 'transparent #fff transparent transparent',
       };
     default:
       return {
         ...baseStyle,
         top: '-8px',
         left: '50%',
         transform: 'translateX(-50%)',
         borderWidth: '0 8px 8px 8px',
         borderColor: 'transparent transparent #fff transparent',
       };
   }
});

// 计算弹窗位置
const popupStyle = computed(() => {
  // 触发响应式更新
  forceUpdate.value;
  
  if (!clickedElement) {
    return {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: '#fff',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
      zIndex: 10000,
    };
  }

  const rect = clickedElement.getBoundingClientRect();
  
  let top = 0;
  let left = 0;
  let transform = '';
  
  // 箭头尺寸
  const arrowSize = 8;
  
  // 根据placement计算位置（使用fixed定位，直接使用getBoundingClientRect的值）
  switch (placement) {
    case '上':
      top = rect.top - arrowSize;
      left = rect.left + rect.width / 2;
      transform = 'translate(-50%, -100%)';
      break;
    case '上左':
      top = rect.top - arrowSize;
      left = rect.left;
      transform = 'translate(0, -100%)';
      break;
    case '上右':
      top = rect.top - arrowSize;
      left = rect.right;
      transform = 'translate(-100%, -100%)';
      break;
    case '下':
      top = rect.bottom + arrowSize;
      left = rect.left + rect.width / 2;
      transform = 'translate(-50%, 0)';
      break;
    case '下左':
      top = rect.bottom + arrowSize;
      left = rect.left;
      transform = 'translate(0, 0)';
      break;
    case '下右':
      top = rect.bottom + arrowSize;
      left = rect.right;
      transform = 'translate(-100%, 0)';
      break;
    case '左':
      top = rect.top + rect.height / 2;
      left = rect.left - arrowSize;
      transform = 'translate(-100%, -50%)';
      break;
    case '左上':
      top = rect.top;
      left = rect.left - arrowSize;
      transform = 'translate(-100%, 0)';
      break;
    case '左下':
      top = rect.bottom;
      left = rect.left - arrowSize;
      transform = 'translate(-100%, -100%)';
      break;
    case '右':
      top = rect.top + rect.height / 2;
      left = rect.right + arrowSize;
      transform = 'translate(0, -50%)';
      break;
    case '右上':
      top = rect.top;
      left = rect.right + arrowSize;
      transform = 'translate(0, 0)';
      break;
    case '右下':
      top = rect.bottom;
      left = rect.right + arrowSize;
      transform = 'translate(0, -100%)';
      break;
    default:
      top = rect.bottom + arrowSize;
      left = rect.left + rect.width / 2;
      transform = 'translate(-50%, 0)';
  }
  
  return {
    position: 'fixed',
    top: `${top}px`,
    left: `${left}px`,
    transform,
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    zIndex: 10000,
    maxWidth: '400px',
    minWidth: '200px',
  };
});

// 监听窗口滚动和大小变化
onMounted(() => {
  window.addEventListener('scroll', updatePosition, true);
  window.addEventListener('resize', updatePosition);
});

onUnmounted(() => {
  window.removeEventListener('scroll', updatePosition, true);
  window.removeEventListener('resize', updatePosition);
});
</script>

<style lang="scss" scoped>
.card-popup-container {
  // 基础样式已在computed中定义
  position: relative;
}

.card-popup-arrow {
  z-index: 1;
  
  // 为箭头添加阴影效果
  // &::before {
  //   content: '';
  //   position: absolute;
  //   width: 0;
  //   height: 0;
  //   border-style: solid;
  // }
  
  // // 上方向箭头的阴影
  // &.arrow-上::before,
  // &.arrow-上左::before,
  // &.arrow-上右::before {
  //   bottom: -9px;
  //   left: 50%;
  //   transform: translateX(-50%);
  //   border-width: 9px 9px 0 9px;
  //   border-color: rgba(0, 0, 0, 0.1) transparent transparent transparent;
  //   z-index: -1;
  // }
  
  &.arrow-上左::before {
    left: -1px;
    transform: none;
  }
  
  &.arrow-上右::before {
    left: auto;
    right: -1px;
    transform: none;
  }
  
  // 下方向箭头的阴影
  &.arrow-下::before,
  &.arrow-下左::before,
  &.arrow-下右::before {
    top: -9px;
    left: 50%;
    transform: translateX(-50%);
    border-width: 0 9px 9px 9px;
    border-color: transparent transparent rgba(0, 0, 0, 0.1) transparent;
    z-index: -1;
  }
  
  &.arrow-下左::before {
    left: -1px;
    transform: none;
  }
  
  &.arrow-下右::before {
    left: auto;
    right: -1px;
    transform: none;
  }
  
  // 左方向箭头的阴影
  &.arrow-左::before,
  &.arrow-左上::before,
  &.arrow-左下::before {
    right: -9px;
    top: 50%;
    transform: translateY(-50%);
    border-width: 9px 0 9px 9px;
    border-color: transparent transparent transparent rgba(0, 0, 0, 0.1);
    z-index: -1;
  }
  
  &.arrow-左上::before {
    top: -1px;
    transform: none;
  }
  
  &.arrow-左下::before {
    top: auto;
    bottom: -1px;
    transform: none;
  }
  
  // 右方向箭头的阴影
  &.arrow-右::before,
  &.arrow-右上::before,
  &.arrow-右下::before {
    left: -9px;
    top: 50%;
    transform: translateY(-50%);
    border-width: 9px 9px 9px 0;
    border-color: transparent rgba(0, 0, 0, 0.1) transparent transparent;
    z-index: -1;
  }
  
  &.arrow-右上::before {
    top: -1px;
    transform: none;
  }
  
  &.arrow-右下::before {
    top: auto;
    bottom: -1px;
    transform: none;
  }
}
</style>
