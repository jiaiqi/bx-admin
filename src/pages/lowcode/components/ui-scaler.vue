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
      default: () => {}
    },
    // 保持原尺寸的类名数组
    keepOriginalSizeClasses: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
        width: null,
        height: null,
        containerStyle: {
        },
        dynamicStylesheet: null // 动态样式表
    };
  },
  watch: {
    designSize: {
      handler(newVal, oldVal) {
        const temp = {};
        if(!newVal.width && !newVal.height) {
          temp.width = 1920;
          temp.height = 1080;
        } else {
          if(newVal.width.includes('px') && newVal.height.includes('px')) {
            temp.width = parseFloat(newVal.width);
            temp.height = parseFloat(newVal.height);
          }
        }
        if(temp.width && temp.height) {
          this.width = temp.width
          this.height = temp.height
          this.handleResize();
          if(!this.dynamicStylesheet) {
            // 监听窗口大小变化
            window.addEventListener('resize', this.handleResize);
            // 创建动态样式表
            const style = document.createElement('style');
            style.id = 'ui-scaler-dynamic-styles';
            document.head.appendChild(style);
            this.dynamicStylesheet = style;
          }
        } else {
          this.width = null
          this.height = null
          this.handleResize();
        }
      },
      immediate: true
    }
  },
  beforeDestroy() {
    if (this.dynamicStylesheet) {
      // 移除监听器
      window.removeEventListener('resize', this.handleResize);
      // 移除动态样式表
      document.head.removeChild(this.dynamicStylesheet);
      this.dynamicStylesheet = null;
    }
  },
  methods: {
    
    handleResize() {
      if(this.width && this.height) {
        const scaleX = window.innerWidth / this.width;
        const scaleY = window.innerHeight / this.height;
        
        // 更新容器样式
        this.$set(this, 'containerStyle', {
          transform: `scale(${scaleX}, ${scaleY})`,
          transformOrigin: 'top left',
          width: `${this.width}px`,
          height: `${this.height}px`,
          overflow: 'hidden'
        });
        
        // 更新动态样式表
        this.updateDynamicStylesheet(scaleX, scaleY);
      } else {
        // 更新容器样式
        Object.keys(this.containerStyle).forEach(k => delete this.containerStyle[k])
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
      this.$set(this.containerStyle, '--originalX--', x)
      this.$set(this.containerStyle, '--originalY--', y)
      this.keepOriginalSizeClasses.forEach(className => {
        cssContent += `
          .ui_scaler ${className} {
            transform: scale(${x}, ${y});
          }
        `;
      });
      
      // 添加新内容到样式表
      this.dynamicStylesheet.textContent = cssContent;
    }

  }
};
</script>
