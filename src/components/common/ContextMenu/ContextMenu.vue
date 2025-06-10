<template>
  <div
    v-if="visible"
    class="context-menu"
    :style="{ left: x + 'px', top: y + 'px' }"
    @click.stop
    @contextmenu.prevent
  >
    <div class="context-menu-content">
      <div
        v-for="(item, index) in menuItems"
        :key="index"
        class="context-menu-item"
        :class="{
          'context-menu-item--disabled': item.disabled,
          'context-menu-item--divider': item.divider
        }"
        @click="handleItemClick(item)"
      >
        <template v-if="!item.divider">
          <div class="context-menu-item-icon" v-if="item.icon">
            <Icon :icon="item.icon" />
          </div>
          <div class="context-menu-item-label">{{ item.label }}</div>
          <div class="context-menu-item-shortcut" v-if="item.shortcut">
            {{ item.shortcut }}
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import { Icon } from "@iconify/vue2";

export default {
  name: "ContextMenu",
  components: {
    Icon,
  },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    x: {
      type: Number,
      default: 0,
    },
    y: {
      type: Number,
      default: 0,
    },
    menuItems: {
      type: Array,
      default: () => [],
    },
  },
  methods: {
    handleItemClick(item) {
      if (item.disabled || item.divider) return;
      this.$emit("item-click", item);
      this.$emit("close");
    },
  },
  mounted() {
    // 点击外部关闭菜单
    const handleClickOutside = (e) => {
      if (!this.$el.contains(e.target)) {
        this.$emit("close");
      }
    };
    
    // 按ESC键关闭菜单
    const handleKeydown = (e) => {
      if (e.key === "Escape") {
        this.$emit("close");
      }
    };
    
    document.addEventListener("click", handleClickOutside);
    document.addEventListener("keydown", handleKeydown);
    
    this.$once("hook:beforeDestroy", () => {
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("keydown", handleKeydown);
    });
  },
};
</script>

<style scoped>
.context-menu {
  position: fixed;
  z-index: 9999;
  background: #ffffff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  padding: 4px 0;
  min-width: 160px;
  font-size: 14px;
  backdrop-filter: blur(10px);
  animation: contextMenuFadeIn 0.15s ease-out;
}

@keyframes contextMenuFadeIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-4px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.context-menu-content {
  display: flex;
  flex-direction: column;
}

.context-menu-item {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  color: #303133;
}

.context-menu-item:hover:not(.context-menu-item--disabled):not(.context-menu-item--divider) {
  background: #f5f7fa;
  color: #409eff;
}

.context-menu-item--disabled {
  color: #c0c4cc;
  cursor: not-allowed;
}

.context-menu-item--divider {
  height: 1px;
  background: #e4e7ed;
  margin: 4px 0;
  padding: 0;
  cursor: default;
}

.context-menu-item-icon {
  width: 16px;
  height: 16px;
  margin-right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.context-menu-item-label {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.context-menu-item-shortcut {
  margin-left: 16px;
  color: #909399;
  font-size: 12px;
  flex-shrink: 0;
}

/* 深色模式支持 */
.dark .context-menu {
  background: #2d2d2d;
  border-color: #4c4d4f;
  color: #e4e7ed;
}

.dark .context-menu-item {
  color: #e4e7ed;
}

.dark .context-menu-item:hover:not(.context-menu-item--disabled):not(.context-menu-item--divider) {
  background: #3a3a3a;
  color: #409eff;
}

.dark .context-menu-item--disabled {
  color: #6c6e72;
}

.dark .context-menu-item--divider {
  background: #4c4d4f;
}

.dark .context-menu-item-shortcut {
  color: #909399;
}
</style>