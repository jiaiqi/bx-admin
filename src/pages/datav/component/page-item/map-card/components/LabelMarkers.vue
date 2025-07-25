<template>
  <div class="label-markers">
    <div
      v-for="(marker, index) in markers"
      :key="index"
      class="label-marker"
      :style="{
        ...getItemPosition(marker),
        ...getLabelStyle(marker)
      }"
      @click="$emit('click', marker, $event)"
    >
      {{ marker[mapJson.label_col] }}
    </div>
  </div>
</template>

<script setup>
/**
 * 标签类型标记点组件
 * 用于渲染标签类型的地图标记点
 */

const props = defineProps({
  markers: Array,
  mapJson: Object,
  labelStyle: Function,
  labelActiveStyle: Function,
  selectedTreeData: Object,
  getItemPosition: Function,
  isActive: Function
})

const emit = defineEmits(['click'])

/**
 * 获取标签样式
 */
function getLabelStyle(marker) {
  if (props.isActive && props.isActive(marker)) {
    return props.labelActiveStyle ? props.labelActiveStyle(marker) : {}
  }
  return props.labelStyle ? props.labelStyle(marker) : {}
}
</script>

<style lang="scss" scoped>
.label-markers {
  position: relative;
  width: 100%;
  height: 100%;
}

.label-marker {
  position: absolute;
  padding: 4px 8px;
  background: rgba(64, 158, 255, 0.9);
  color: white;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s ease;
  transform: translate(-50%, -50%);
  z-index: 10;
  
  &:hover {
    background: rgba(64, 158, 255, 1);
    transform: translate(-50%, -50%) scale(1.05);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }
  
  &:active {
    transform: translate(-50%, -50%) scale(0.95);
  }
}
</style>