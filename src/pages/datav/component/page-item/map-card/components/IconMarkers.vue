<template>
  <div class="icon-markers">
    <div
      v-for="(marker, index) in markers"
      :key="index"
      class="icon-marker"
      :style="getItemPosition(marker)"
      @click="$emit('click', marker, $event)"
    >
      <img
        v-if="getItemIcon(marker)"
        :src="getItemIcon(marker)"
        :alt="marker.name || '标记点'"
        class="marker-icon"
      />
      <div
        v-else
        class="default-marker"
      >
        📍
      </div>
      
      <!-- 标记点标签 -->
      <div 
        v-if="cardUnitJson && cardUnitJson.label_col && marker[cardUnitJson.label_col]"
        class="marker-label"
      >
        {{ marker[cardUnitJson.label_col] }}
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * 图标类型标记点组件
 * 用于渲染图标类型的地图标记点
 */

const props = defineProps({
  markers: Array,
  cardUnitJson: Object,
  getItemPosition: Function,
  getItemIcon: Function
})

const emit = defineEmits(['click'])
</script>

<style lang="scss" scoped>
.icon-markers {
  position: relative;
  width: 100%;
  height: 100%;
}

.icon-marker {
  position: absolute;
  cursor: pointer;
  transition: all 0.2s ease;
  transform: translate(-50%, -50%);
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  
  &:hover {
    transform: translate(-50%, -50%) scale(1.1);
    z-index: 20;
  }
  
  &:active {
    transform: translate(-50%, -50%) scale(0.95);
  }
}

.marker-icon {
  width: 24px;
  height: 24px;
  object-fit: contain;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
  transition: filter 0.2s ease;
  
  .icon-marker:hover & {
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
  }
}

.default-marker {
  font-size: 24px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
  transition: filter 0.2s ease;
  
  .icon-marker:hover & {
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
  }
}

.marker-label {
  margin-top: 4px;
  padding: 2px 6px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border-radius: 3px;
  font-size: 11px;
  white-space: nowrap;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
}
</style>