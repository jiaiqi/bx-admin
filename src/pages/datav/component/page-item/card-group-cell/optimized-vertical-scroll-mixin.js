/**
 * 优化版纵向滚动混入 - 基于BxTable的高性能实现
 * 提供简洁、高效的纵向滚动功能
 */

export default {
  data() {
    return {
      scrollTimer: null,
    };
  },

  beforeDestroy() {
    // 组件销毁前清理所有资源
    this.stopVerticalScroll();
    this.cleanupScrollStyles();
  },

  methods: {
    /**
     * 开始纵向滚动 - 性能优化版本
     * @param {Object} config - 滚动配置
     * @param {string} containerRef - 容器引用名称
     */
    startVerticalScroll(config, containerRef = 'cardInnerContainer') {
      if (!config || !this.$refs[containerRef]) return;
      
      this.stopVerticalScroll();

      const interval = Math.max(
        (config.interval || 3000),
        2000
      );

      this.scrollTimer = setInterval(() => {
        this.performScrollStep(config, containerRef);
      }, interval);
    },

    /**
     * 执行单步滚动 - 使用transform优化性能
     * @param {Object} config - 滚动配置
     * @param {string} containerRef - 容器引用名称
     */
    performScrollStep(config, containerRef = 'cardInnerContainer') {
      const scrollContainer = this.$refs[containerRef];
      if (!scrollContainer || !scrollContainer.children.length) return;

      const rows = Array.from(scrollContainer.children);
      const rowHeight = rows[0]?.offsetHeight || 0;

      if (rowHeight === 0) return;

      // 使用transform实现平滑滚动，避免DOM重排
      const isDownDirection = config.direction === "由上至下";
      const translateY = isDownDirection ? rowHeight : -rowHeight;
      const ANIMATION_DURATION = config.duration || 2000;

      // 添加过渡效果
      scrollContainer.style.transition = `transform ${ANIMATION_DURATION}ms cubic-bezier(0.55, -0.25, 0.5, 1.1)`;
      scrollContainer.style.transform = `translateY(${translateY}px)`;

      // 动画完成后重置位置并调整DOM结构
      setTimeout(() => {
        this.resetScrollPosition(scrollContainer, rows, isDownDirection);
      }, ANIMATION_DURATION);
    },

    /**
     * 重置滚动位置并调整DOM结构
     * @param {HTMLElement} scrollContainer - 滚动容器
     * @param {Array} rows - 行元素数组
     * @param {boolean} isDownDirection - 是否向下滚动
     */
    resetScrollPosition(scrollContainer, rows, isDownDirection) {
      // 移除过渡效果，立即重置transform
      scrollContainer.style.transition = "none";
      scrollContainer.style.transform = "translateY(0)";

      // 使用DocumentFragment批量操作DOM，减少重排
      const fragment = document.createDocumentFragment();

      if (isDownDirection) {
        // 向下滚动：将最后一行移到第一行（显示新的内容）
        const lastRow = rows[rows.length - 1];
        fragment.appendChild(lastRow);
        rows.slice(0, -1).forEach((row) => fragment.appendChild(row));
      } else {
        // 向上滚动：将第一行移到最后（显示之前的内容）
        const firstRow = rows[0];
        rows.slice(1).forEach((row) => fragment.appendChild(row));
        fragment.appendChild(firstRow);
      }

      // 一次性更新DOM
      scrollContainer.innerHTML = "";
      scrollContainer.appendChild(fragment);
    },

    /**
     * 停止纵向滚动
     */
    stopVerticalScroll() {
      if (this.scrollTimer) {
        clearInterval(this.scrollTimer);
        this.scrollTimer = null;
      }
      // 清理滚动相关样式
      this.cleanupScrollStyles();
    },

    /**
     * 清理滚动样式，防止内存泄漏
     * @param {string} containerRef - 容器引用名称
     */
    cleanupScrollStyles(containerRef = 'cardInnerContainer') {
      const scrollContainer = this.$refs[containerRef];
      if (scrollContainer) {
        scrollContainer.style.transition = "";
        scrollContainer.style.transform = "";
        scrollContainer.style.willChange = "auto";
      }
    },

    /**
     * 重启滚动动画（用于响应式更新）
     * @param {Object} config - 滚动配置
     * @param {string} containerRef - 容器引用名称
     */
    restartVerticalScroll(config, containerRef = 'cardInnerContainer') {
      this.stopVerticalScroll();
      this.$nextTick(() => {
        this.startVerticalScroll(config, containerRef);
      });
    }
  },

  watch: {
    // 监听滚动配置变化
    childAnimationType: {
      handler(newVal) {
        if (newVal === '纵向滚动') {
          this.$nextTick(() => {
            this.startVerticalScroll(this.childAnimationConfig, 'cardInnerContainer');
          });
        } else {
          this.stopVerticalScroll();
        }
      },
    },
    
    // 监听数据变化
    cellDataFinal: {
      handler(newVal, oldVal) {
        if (this.childAnimationType === '纵向滚动') {
          this.$nextTick(() => {
            this.restartVerticalScroll(this.childAnimationConfig, 'cardInnerContainer');
          });
        }
      },
    },
  }
};