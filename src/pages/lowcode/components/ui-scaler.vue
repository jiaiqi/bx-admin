<template>
  <div class="ui_scaler" :style="containerStyle">
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'UiScaler',
  props: {
    // UI设计尺寸对象 { width: 1920, height: 1080 }
    designSize: {
      type: Object,
      default: null,
      validator: function (value) {
        return !value || (value.width && value.height);
      }
    },
    // 保持原尺寸的类名数组
    keepOriginalSizeClasses: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
        containerStyle: {
          '--originalX--': 1, 
          '--originalY--': 1, 
          transform: 'scale(1,1)',
          transformOrigin: 'top left',
          width: `${this.designSize.width}px`,
          height: `${this.designSize.height}px`,
          overflow: 'hidden'
        },
        dynamicStylesheet: null // 动态样式表
    };
  },
  created() {
    if (this.designSize) {
      // 创建动态样式表
      this.createDynamicStylesheet();
      // 监听窗口大小变化
      this.handleResize();
      window.addEventListener('resize', this.handleResize);
    }
  },
  beforeDestroy() {
    if (this.designSize) {
      // 移除监听器
      window.removeEventListener('resize', this.handleResize);
      // 移除动态样式表
      this.removeDynamicStylesheet();
    }
  },
  methods: {
    // 创建动态样式表
    createDynamicStylesheet() {
      const style = document.createElement('style');
      style.id = 'ui-scaler-dynamic-styles';
      document.head.appendChild(style);
      this.dynamicStylesheet = style;
    },
    
    // 移除动态样式表
    removeDynamicStylesheet() {
      if (this.dynamicStylesheet) {
        document.head.removeChild(this.dynamicStylesheet);
        this.dynamicStylesheet = null;
      }
    },
    
    // 更新动态样式表内容
    updateDynamicStylesheet(scaleX, scaleY) {
      if (!this.dynamicStylesheet) return;
      
      // 清空原有内容
      this.dynamicStylesheet.textContent = '';
      
      // 生成新的样式内容
      let cssContent = '';
      let [x, y] = [1 / scaleX, 1 / scaleY];
      const min = Math.min(scaleX, scaleY);
      [x, y] = [x * min, y * min];
      this.containerStyle['--originalX--'] = x;
      this.containerStyle['--originalY--'] = y;
      this.keepOriginalSizeClasses.forEach(className => {
        cssContent += `
          .ui_scaler ${className} {
            transform: scale(${x}, ${y});
          }
        `;
      });
      
      // 添加新内容到样式表
      this.dynamicStylesheet.textContent = cssContent;
    },
    
    handleResize() {
      const scaleX = window.innerWidth / this.designSize.width;
      const scaleY = window.innerHeight / this.designSize.height;
      
      // 更新容器样式
      this.containerStyle.transform = `scale(${scaleX}, ${scaleY})`
      this.containerStyle.width = `${this.designSize.width}px`
      this.containerStyle.height = `${this.designSize.height}px`
      
      // 更新动态样式表
      this.updateDynamicStylesheet(scaleX, scaleY);
    }
  }
};
</script>
