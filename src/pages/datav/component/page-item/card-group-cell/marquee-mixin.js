/**
 * 跑马灯动画混入 - 提供可复用的跑马灯功能
 * 解决了原有实现中的性能问题和代码重复问题
 */

export default {
  data() {
    return {
      // 跑马灯相关状态
      marqueeTimer: null, // 跑马灯定时器
      marqueeDelayTimer: null, // 延迟启动定时器
      marqueeOffset: 0, // 当前滚动偏移量
      marqueeChildrenWidths: [], // 子元素宽度数组
      marqueeContainerWidth: 0, // 容器总宽度
      marqueeAnimationId: null, // requestAnimationFrame ID
      marqueeLastTime: 0, // 上次动画时间
      marqueeIsRunning: false, // 动画运行状态
    };
  },

  beforeDestroy() {
    // 清理定时器和动画
    this.stopMarqueeAnimation();
  },

  methods: {
    /**
     * 启动跑马灯动画
     * @param {Object} config - 动画配置
     * @param {string} containerRef - 容器引用名称
     */
    startMarqueeAnimation(config, containerRef = 'cardInnerContainer') {
      if (!config || this.marqueeIsRunning) return;
      
      const marqueeElement = this.$refs[containerRef];
      if (!marqueeElement) return;

      // 缓存容器宽度
      if (!this.marqueeContainerWidth) {
        this.marqueeContainerWidth = marqueeElement.offsetWidth;
      }

      // 延迟启动
      this.marqueeDelayTimer = setTimeout(() => {
        this.initSeamlessLayout(containerRef);
        this.runMarqueeAnimation(config, containerRef);
      }, config.delay || 0);
    },

    /**
     * 执行跑马灯动画 - 使用requestAnimationFrame优化性能
     * @param {Object} config - 动画配置
     * @param {string} containerRef - 容器引用名称
     */
    runMarqueeAnimation(config, containerRef = 'cardInnerContainer') {
      if (!config || this.marqueeIsRunning) return;
      
      this.marqueeIsRunning = true;
      this.marqueeLastTime = performance.now();
      
      const animate = (currentTime) => {
        if (!this.marqueeIsRunning) return;
        
        // 控制动画间隔
        if (currentTime - this.marqueeLastTime >= (config.interval || 1000)) {
          this.moveMarqueeChildren(config, containerRef);
          this.marqueeLastTime = currentTime;
        }
        
        this.marqueeAnimationId = requestAnimationFrame(animate);
      };
      
      this.marqueeAnimationId = requestAnimationFrame(animate);
    },

    /**
     * 移动跑马灯子元素
     * @param {Object} config - 动画配置
     * @param {string} containerRef - 容器引用名称
     */
    moveMarqueeChildren(config, containerRef = 'cardInnerContainer') {
      const marqueeElement = this.$refs[containerRef];
      if (!marqueeElement) return;

      const children = Array.from(marqueeElement.children);
      if (!children || children.length === 0) return;

      const isRightDirection = config.direction === '由左往右';
      const step = parseInt(config.step) || 100;

      // 添加平滑过渡
      if (!marqueeElement.style.transition.includes('transform')) {
        marqueeElement.style.transition = 'transform 0.3s ease-out';
      }

      if (isRightDirection) {
        // 向右滚动：向左移动
        this.marqueeOffset -= step;
        
        // 检查是否需要重置位置
        if (Math.abs(this.marqueeOffset) >= this.marqueeContainerWidth) {
          this.resetMarqueePosition(marqueeElement);
        } else {
          marqueeElement.style.transform = `translateX(${this.marqueeOffset}px)`;
        }
      } else {
        // 向左滚动：向右移动
        this.marqueeOffset += step;
        
        // 检查是否需要重置位置
        if (this.marqueeOffset >= this.marqueeContainerWidth) {
          this.resetMarqueePosition(marqueeElement);
        } else {
          marqueeElement.style.transform = `translateX(${this.marqueeOffset}px)`;
        }
      }
    },

    /**
     * 重置跑马灯位置
     * @param {HTMLElement} marqueeElement - 跑马灯容器元素
     */
    resetMarqueePosition(marqueeElement) {
      // 重置偏移量和位置
      this.marqueeOffset = 0;
      marqueeElement.style.transform = 'translateX(0px)';
    },

    /**
     * 计算并缓存子元素宽度
     * @param {string} containerRef - 容器引用名称
     */
    cacheChildrenWidths(containerRef = 'cardInnerContainer') {
      const marqueeElement = this.$refs[containerRef];
      if (!marqueeElement) return;

      const children = Array.from(marqueeElement.children);
      this.marqueeChildrenWidths = children.map(child => child.offsetWidth);

      // 计算容器总宽度
      this.marqueeContainerWidth = marqueeElement.offsetWidth;
    },

    /**
     * 初始化无缝滚动布局
     * @param {string} containerRef - 容器引用名称
     */
    initSeamlessLayout(containerRef = 'cardInnerContainer') {
      const marqueeElement = this.$refs[containerRef];
      if (!marqueeElement) return;

      const children = marqueeElement.children;
      if (!children || children.length === 0) return;

      // 为容器设置样式以支持无缝滚动
      marqueeElement.style.display = 'flex';
      marqueeElement.style.whiteSpace = 'nowrap';
      marqueeElement.style.transition = 'transform 0.3s ease-out';
      marqueeElement.style.transform = 'translateX(0px)';

      // 保持子元素原有样式，只设置必要的flex属性
      Array.from(children).forEach(child => {
        child.style.flexShrink = '0';
      });

      // 缓存子元素宽度
      this.cacheChildrenWidths(containerRef);
    },

    /**
     * 停止跑马灯动画
     * @param {string} containerRef - 容器引用名称
     */
    stopMarqueeAnimation(containerRef = 'cardInnerContainer') {
      // 停止动画循环
      this.marqueeIsRunning = false;
      
      // 清理定时器
      if (this.marqueeTimer) {
        clearInterval(this.marqueeTimer);
        this.marqueeTimer = null;
      }
      
      if (this.marqueeDelayTimer) {
        clearTimeout(this.marqueeDelayTimer);
        this.marqueeDelayTimer = null;
      }
      
      // 清理requestAnimationFrame
      if (this.marqueeAnimationId) {
        cancelAnimationFrame(this.marqueeAnimationId);
        this.marqueeAnimationId = null;
      }

      // 重置状态
      this.marqueeOffset = 0;
      this.marqueeChildrenWidths = [];
      this.marqueeContainerWidth = 0;
      this.marqueeLastTime = 0;

      // 清除容器的动画样式
      const marqueeElement = this.$refs[containerRef];
      if (marqueeElement) {
        marqueeElement.style.display = '';
        marqueeElement.style.whiteSpace = '';
        marqueeElement.style.transition = '';
        marqueeElement.style.transform = '';

        // 清除子元素的flex样式，保持其他样式不变
        Array.from(marqueeElement.children).forEach(child => {
          child.style.flexShrink = '';
        });
      }
    },

    /**
     * 暂停跑马灯动画
     */
    pauseMarqueeAnimation() {
      this.marqueeIsRunning = false;
      if (this.marqueeAnimationId) {
        cancelAnimationFrame(this.marqueeAnimationId);
        this.marqueeAnimationId = null;
      }
    },

    /**
     * 恢复跑马灯动画
     * @param {Object} config - 动画配置
     * @param {string} containerRef - 容器引用名称
     */
    resumeMarqueeAnimation(config, containerRef = 'cardInnerContainer') {
      if (!this.marqueeIsRunning && config) {
        this.runMarqueeAnimation(config, containerRef);
      }
    },

    /**
     * 重新计算跑马灯尺寸（响应式处理）
     * @param {string} containerRef - 容器引用名称
     */
    recalculateMarqueeSize(containerRef = 'cardInnerContainer') {
      this.cacheChildrenWidths(containerRef);
    }
  }
};