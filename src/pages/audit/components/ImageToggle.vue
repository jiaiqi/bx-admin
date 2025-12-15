<template>
  <div class="image-toggle-section">
    <div
      class="toggle-button"
      :class="{ expanded: expanded }"
      @click="toggle"
    >
      <i :class="expanded ? 'el-icon-caret-top' : 'el-icon-caret-bottom'"></i>
      {{ expanded ? labelOpen : labelClose }}
    </div>
    <div v-if="expanded" class="image-content">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ImageToggle',
  props: {
    labelOpen: { type: String, default: '收起图片' },
    labelClose: { type: String, default: '展开图片' },
    modelValue: { type: Boolean, default: undefined },
    defaultExpanded: { type: Boolean, default: false },
  },
  data() {
    return {
      innerExpanded: this.defaultExpanded,
    }
  },
  computed: {
    expanded() {
      return this.modelValue === undefined ? this.innerExpanded : this.modelValue
    },
  },
  methods: {
    toggle() {
      const next = !this.expanded
      if (this.modelValue === undefined) {
        this.innerExpanded = next
      } else {
        this.$emit('update:modelValue', next)
      }
      this.$emit('toggle', next)
    },
  },
}
</script>

<style scoped>
.image-toggle-section {
  grid-column: 1 / -1;
  margin-top: 10px;
}
.toggle-button {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background-color: #f5f7fa;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #606266;
  font-size: 14px;
  user-select: none;
}
.toggle-button:hover {
  background-color: #ecf5ff;
  border-color: #b3d8ff;
  color: #409eff;
}
.toggle-button.expanded {
  background-color: #ecf5ff;
  border-color: #409eff;
  color: #409eff;
}
.toggle-button i {
  margin-right: 6px;
  font-size: 16px;
}
.image-content {
  margin-top: 10px;
  animation: fadeIn 0.3s ease-in-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>