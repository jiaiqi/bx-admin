/**
 * 跑马灯动画混入 - 使用纯CSS动画实现高性能跑马灯效果
 */

export default {
  data() {
    return {
      // 跑马灯相关状态
      marqueeDelayTimer: null, // 延迟启动定时器
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

      // 延迟启动
      this.marqueeDelayTimer = setTimeout(() => {
        this.initCSSMarqueeLayout(config, containerRef);
        this.marqueeIsRunning = true;
      }, config.delay || 0);
    },

    /**
     * 初始化CSS跑马灯布局
     * @param {Object} config - 动画配置
     * @param {string} containerRef - 容器引用名称
     */
    initCSSMarqueeLayout(config, containerRef = 'cardInnerContainer') {
      const marqueeElement = this.$refs[containerRef];
      if (!marqueeElement) return;

      // 设置容器样式
      marqueeElement.style.display = 'flex';
      marqueeElement.style.whiteSpace = 'nowrap';
      marqueeElement.style.position = 'relative';

      // 设置子元素样式
      // Array.from(marqueeElement.children).forEach(child => {
      // child.style.display = 'inline-block';
      // child.style.padding = '0 10px';
      // });
      const childLength = marqueeElement.children.length;
      // 计算动画参数
      let duration = 1 * childLength; // 转换为秒
      if (config.interval) {
        duration *= config.interval / 1000;
      } else if (config.duration) {
        duration = config.duration / 1000;
      }
      const isRightDirection = config.direction === '由左往右';

      // 设置CSS变量和样式类
      this.setMarqueeCSS(marqueeElement, duration, isRightDirection);
    },

    /**
     * 设置CSS变量和样式类
     * @param {HTMLElement} element - 目标元素
     * @param {number} duration - 动画持续时间（秒）
     * @param {boolean} isRightDirection - 是否从右到左滚动
     */
    setMarqueeCSS(element, duration, isRightDirection = true) {
      if (!element) return;

      // 设置CSS变量
      element.style.setProperty('--marquee-duration', `${duration}s`);
      element.style.setProperty('--marquee-direction', isRightDirection ? 'right-to-left' : 'left-to-right');

      // 添加CSS类
      element.classList.add('marquee-content');

      // 根据方向添加对应的类
      if (isRightDirection) {
        element.classList.add('marquee-right-to-left');
        element.classList.remove('marquee-left-to-right');
      } else {
        element.classList.add('marquee-left-to-right');
        element.classList.remove('marquee-right-to-left');
      }
    },

    /**
     * 移除跑马灯CSS样式
     * @param {HTMLElement} element - 目标元素
     */
    removeMarqueeCSS(element) {
      if (!element) return;

      // 移除CSS变量
      element.style.removeProperty('--marquee-duration');
      element.style.removeProperty('--marquee-direction');

      // 移除CSS类
      element.classList.remove('marquee-content', 'marquee-right-to-left', 'marquee-left-to-right');
    },

    /**
     * 停止跑马灯动画
     * @param {string} containerRef - 容器引用名称
     */
    stopMarqueeAnimation(containerRef = 'cardInnerContainer') {
      // 停止动画循环
      this.marqueeIsRunning = false;

      // 清理定时器
      if (this.marqueeDelayTimer) {
        clearTimeout(this.marqueeDelayTimer);
        this.marqueeDelayTimer = null;
      }

      // 获取容器元素
      const marqueeElement = this.$refs[containerRef];
      if (marqueeElement) {
        // 移除CSS样式和变量
        this.removeMarqueeCSS(marqueeElement);

        // 清除容器的动画样式
        marqueeElement.style.display = '';
        marqueeElement.style.whiteSpace = '';
        marqueeElement.style.position = '';

        // // 清除子元素的样式，保持其他样式不变
        // Array.from(marqueeElement.children).forEach(child => {
        //   child.style.display = '';
        //   child.style.padding = '';
        // });
      }
    },

    /**
     * 暂停跑马灯动画
     * @param {string} containerRef - 容器引用名称
     */
    pauseMarqueeAnimation(containerRef = 'cardInnerContainer') {
      const marqueeElement = this.$refs[containerRef];
      if (marqueeElement) {
        marqueeElement.style.animationPlayState = 'paused';
      }
    },

    /**
     * 恢复跑马灯动画
     * @param {string} containerRef - 容器引用名称
     */
    resumeMarqueeAnimation(containerRef = 'cardInnerContainer') {
      const marqueeElement = this.$refs[containerRef];
      if (marqueeElement) {
        marqueeElement.style.animationPlayState = 'running';
      }
    },

    /**
     * 重新启动跑马灯动画（响应式处理）
     * @param {Object} config - 动画配置
     * @param {string} containerRef - 容器引用名称
     */
    restartMarqueeAnimation(config, containerRef = 'cardInnerContainer') {
      this.stopMarqueeAnimation(containerRef);
      this.$nextTick(() => {
        this.startMarqueeAnimation(config, containerRef);
      });
    }
  }
};