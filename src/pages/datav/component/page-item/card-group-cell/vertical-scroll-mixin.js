/**
 * 纵向滚动动画混入 - 用于列表卡片的上下滚动效果
 */

export default {
  data() {
    return {
      // 纵向滚动相关状态
      verticalScrollTimer: null, // 滚动定时器
      verticalScrollDelayTimer: null, // 延迟启动定时器
      verticalScrollIsRunning: false, // 动画运行状态
    };
  },

  beforeDestroy() {
    // 清理定时器和动画
    this.stopVerticalScrollAnimation();
  },

  methods: {
    /**
     * 启动纵向滚动动画
     * @param {Object} config - 动画配置
     * @param {string} containerRef - 容器引用名称
     */
    startVerticalScrollAnimation(config, containerRef = 'cardInnerContainer') {
    
    // 参数检查
    if (!config) {
      return;
    }
    
    // 防止重复执行
    if (this.verticalScrollIsRunning) {
      return;
    }
    
    // 获取滚动元素
    const scrollElement = this.$refs[containerRef];
    
    if (!scrollElement) {
      return;
    }
    
    // 预先设置运行状态为true，确保状态标记正确
    this.verticalScrollIsRunning = true;
    
    // 确保内部容器样式正确
    scrollElement.style.position = 'absolute';
    scrollElement.style.top = '0';
    scrollElement.style.left = '0';
    scrollElement.style.right = '0';
    scrollElement.style.overflow = 'visible';
    scrollElement.style.transform = 'translateY(0)';
    
    // 初始化滚动布局
    this.initVerticalScrollLayout(config, containerRef);
    
    // 确保容器引用存在且有定时器
    const finalScrollElement = this.$refs[containerRef];
    if (finalScrollElement && this.verticalScrollIsRunning) {
      // 尝试重新启动定时器作为备选方案
      this.$nextTick(() => {
        this.initVerticalScrollLayout(config, containerRef);
      });
    }
    
    return this.verticalScrollIsRunning;
  },
  
    // 移除重复的stopVerticalScrollAnimation方法，保留后面带参数的完整实现
    
    
    addEvent(ele) {
      ele.addEventListener('click', (ele) => {
        let jumpJson = ele?.currentTarget?.dataset?.jumpJson
        let itemData = ele?.currentTarget?.dataset?.itemData
        try {
          jumpJson && (jumpJson = JSON.parse(jumpJson))
        } catch (e) {
          // jumpJson格式错误，静默处理
        }
        try {
          itemData && (itemData = JSON.parse(itemData))
        } catch (e) {
          // itemData格式错误，静默处理
        }
        this.jumpAction(jumpJson, itemData);
      })
    },
    
    /**
     * 初始化纵向滚动布局
     * @param {Object} config - 动画配置
     * @param {string} containerRef - 容器引用名称
     */
    initVerticalScrollLayout(config, containerRef = 'cardInnerContainer') {
      // 检查容器样式
      const scrollElement = this.$refs[containerRef];
      
      if (!scrollElement) {
        // 确保状态重置
        this.verticalScrollIsRunning = false;
        return;
      }

      const children = Array.from(scrollElement.children);
      
      if (children.length === 0) {
        // 确保状态重置
        this.verticalScrollIsRunning = false;
        return;
      }

      // 使用父容器(cardRef)的clientHeight作为可视区域高度
      const parentContainer = this.$refs.cardRef;
      const containerHeight = parentContainer ? parentContainer.clientHeight : 0;

      // 计算原始子元素的总高度
      let originalTotalHeight = 0;
      let avgHeight = null;
      // 过滤出非克隆的原始子元素
      const originalChildren = children.filter(child => !child.classList.contains('vertical-scroll-clone'));
      
      if (originalChildren.length > 0) {
        originalTotalHeight = originalChildren.reduce((sum, c) => sum + c.offsetHeight, 0);
        avgHeight = originalTotalHeight / originalChildren.length;
      }
      
      // 优先使用动态计算的平均高度，然后是组件属性，最后才是默认值
      // 这样可以确保在组件初始化阶段也能使用实际计算的高度
      const childHeight1 = avgHeight || this.averageChildHeight || 40;
      
      // 计算子元素总高度和容器高度的关系
    // 只要子元素总高度大于容器高度，就启用滚动
    if (originalTotalHeight <= containerHeight) {
      // 如果子元素总高度略小于容器高度，尝试调整卡片间距或其他方式让内容能滚动
      // 这里添加一个小的差值，确保即使高度接近也能滚动
      const minimalHeightIncrease = 10 // 最小增加高度
      const totalHeightWithPadding = originalTotalHeight + minimalHeightIncrease
      
      if (totalHeightWithPadding <= containerHeight) {
        this.verticalScrollIsRunning = false
        return
      }
    }

      // 确保父容器样式正确
      if (this.$refs.cardRef) {
        this.$refs.cardRef.style.position = 'relative';
        this.$refs.cardRef.style.overflow = 'hidden';
        this.$refs.cardRef.style.height = `${this.displayRowLimit * this.averageChildHeight}px`;
      }
      
      // 确保内部容器样式正确
      scrollElement.style.position = 'absolute';
      scrollElement.style.top = '0';
      scrollElement.style.left = '0';
      scrollElement.style.right = '0';
      scrollElement.style.overflow = 'visible';
      scrollElement.style.transform = 'translateY(0)';

      // 复制子元素以实现无缝滚动效果
      const needClone = !scrollElement._verticalScrollCloned && originalChildren.length > 0;
      
      if (needClone) {
        // 检查滚动方向 - 确保向上滚动
      const isDownDirection = config.direction === '由上至下';
      const isUpDirection = config.direction === '由下至上';
        
        // 为了实现无缝滚动，复制一次子元素就足够了
        originalChildren.forEach((child) => {
          const clone = child.cloneNode(true);
          if (avgHeight) {
            clone.style.height = avgHeight + 'px';
          }
          clone.classList.add('vertical-scroll-clone');
          this.addEvent(clone);
          if (isDownDirection) {
            scrollElement.appendChild(clone);
          } else {
            scrollElement.prepend(clone);
          }
        });
        
        scrollElement._verticalScrollCloned = true;
      }

      // 滚动参数配置 - 确保使用子元素实际高度作为步长
      const childHeight = originalChildren[0]?.offsetHeight || avgHeight || 40; // 使用子元素实际高度
      const step = childHeight; // 步长等于一行子元素高度
      const interval = config.interval || 2000; 
      const duration = config.duration || 1000; 
      const timingFunction = 'ease'; 
      
      // 移除旧定时器
      if (scrollElement._verticalScrollTimer) {
        clearInterval(scrollElement._verticalScrollTimer);
      }
      
      let position = 0;
      // 确保默认是向上滚动，不考虑其他方向
      const isUpDirection = true;
      const isDownDirection = false;
      
      const move = () => {
        // 检查滚动元素是否仍然存在
        if (!scrollElement) {
          clearInterval(scrollElement._verticalScrollTimer);
          this.verticalScrollIsRunning = false;
          return;
        }
        
        // 设置过渡效果
        scrollElement.style.transition = `transform ${duration}ms ${timingFunction}`;
        
        // 向上滚动（强制向上滚动）
        position += step;
          
          // 计算滚动边界
          // 当可见部分末尾超过原始内容末尾时，平滑重置位置
          const visibleEndPosition = position + containerHeight;
          
          if (visibleEndPosition > originalTotalHeight) {
            // 计算精确的重置位置，确保无缝滚动
            const resetPosition = position - originalTotalHeight;
            
            // 临时禁用过渡，实现无缝重置
            scrollElement.style.transition = 'none';
            scrollElement.style.transform = `translateY(-${Math.abs(resetPosition)}px)`;
            position = 0; // 重置为0，确保下一次滚动从正确位置开始
            
            // 强制重绘
            scrollElement.offsetHeight;
            
            // 恢复过渡效果并继续滚动
            setTimeout(() => {
              requestAnimationFrame(() => {
                move(); // 重新执行滚动
              });
            }, 16);
          }
          // 不再使用return，确保滚动动画持续进行
        
        // 应用transform实现滚动（使用负值实现向上滚动）
        const transformValue = `translateY(-${Math.abs(position)}px)`;
        scrollElement.style.transform = transformValue;
      };
      
      // 向上滚动，初始位置为0，显示前displayRowLimit条数据
      position = 0;
      
      // 设置初始transform（使用负值实现向上滚动）
      const initialTransform = `translateY(-${Math.abs(position)}px)`;
      scrollElement.style.transform = initialTransform;
      
      // 强制重绘
      scrollElement.offsetHeight;
      
      // 立即执行一次滚动（不使用setTimeout，确保立即看到效果）
      requestAnimationFrame(move);
      
      // 启动滚动定时器
      try {
        scrollElement._verticalScrollTimer = setInterval(move, interval);
        
        // 立即验证定时器是否成功创建
        setTimeout(() => {
          const verifyScrollElement = this.$refs[containerRef];
          if (!verifyScrollElement || !verifyScrollElement._verticalScrollTimer) {
            this.setupFallbackScrollTimer(verifyScrollElement, config, originalTotalHeight, containerHeight);
          }
        }, 50);
      } catch (error) {
        this.setupFallbackScrollTimer(scrollElement, config, originalTotalHeight, containerHeight);
      }
    },

    /**
     * 停止纵向滚动动画
     * @param {string} containerRef - 容器引用名称
     */
    stopVerticalScrollAnimation(containerRef = 'cardInnerContainer') {
      // 更新运行状态
      this.verticalScrollIsRunning = false;

      // 清理延迟定时器
      if (this.verticalScrollDelayTimer) {
        clearTimeout(this.verticalScrollDelayTimer);
        this.verticalScrollDelayTimer = null;
      }

      // 获取容器元素
      const scrollElement = this.$refs[containerRef];
      if (scrollElement) {
        // 清除滚动定时器
        if (scrollElement._verticalScrollTimer) {
          clearInterval(scrollElement._verticalScrollTimer);
          scrollElement._verticalScrollTimer = null;
        }
        
        // 移除克隆节点
        if (scrollElement._verticalScrollCloned) {
          Array.from(scrollElement.querySelectorAll('.vertical-scroll-clone')).forEach(clone => clone.remove());
          scrollElement._verticalScrollCloned = false;
        }
        
        // 重置样式
        scrollElement.style.transition = '';
        scrollElement.style.transform = '';
      }
    },

    /**
     * 暂停纵向滚动动画
     * @param {string} parentContainerRef - 父容器引用名称
     */
    pauseVerticalScrollAnimation(parentContainerRef = 'cardRef') {
      const parentContainer = this.$refs[parentContainerRef];
      if (!parentContainer) return;
      
      // 获取内部滚动容器
      const scrollElement = this.$refs.cardInnerContainer || parentContainer.querySelector('[ref="cardInnerContainer"]') || parentContainer.firstElementChild;
      
      if (scrollElement && this.verticalScrollIsRunning) {
        // 清除定时器但保留状态
        if (scrollElement._verticalScrollTimer) {
          clearInterval(scrollElement._verticalScrollTimer);
          scrollElement._verticalScrollTimer = null;
        }
      }
    },

    /**
     * 恢复纵向滚动动画
     * @param {Object} config - 动画配置
     * @param {string} parentContainerRef - 父容器引用名称
     */
    resumeVerticalScrollAnimation(config, parentContainerRef = 'cardRef') {
      const parentContainer = this.$refs[parentContainerRef];
      if (!parentContainer) return;
      
      // 获取内部滚动容器
      const scrollElement = this.$refs.cardInnerContainer || parentContainer.querySelector('[ref="cardInnerContainer"]') || parentContainer.firstElementChild;
      
      if (scrollElement && this.verticalScrollIsRunning) {
        // 重新启动定时器
        if (config) {
          this.initVerticalScrollLayout(config, parentContainerRef);
        }
      }
    },

    /**
     * 重新启动纵向滚动动画（响应式处理）
     * @param {Object} config - 动画配置
     * @param {string} parentContainerRef - 父容器引用名称
     */
    restartVerticalScrollAnimation(config, parentContainerRef = 'cardRef') {
      this.stopVerticalScrollAnimation(parentContainerRef);
      this.$nextTick(() => {
        this.startVerticalScrollAnimation(config, parentContainerRef);
      });
    },
    
    /**
     * 设置备用滚动定时器，当主要滚动逻辑失败时使用
     * @param {HTMLElement} parentContainer - 父容器元素（可视区域）
     * @param {Object} config - 配置参数
     * @param {number} originalHeight - 原始内容高度
     * @param {number} containerHeight - 容器高度
     */
    setupFallbackScrollTimer(parentContainer, config, originalHeight, containerHeight) {
      if (!parentContainer) {
        return;
      }
      
      // 获取内部滚动容器
      const scrollElement = parentContainer.querySelector('[ref="cardInnerContainer"]') || parentContainer.firstElementChild;
      if (!scrollElement) {
        return;
      }
      
      // 清除可能存在的定时器
      if (scrollElement._verticalScrollTimer) {
        clearInterval(scrollElement._verticalScrollTimer);
        scrollElement._verticalScrollTimer = null;
      }
      
      // 确保父容器样式正确（可视区域）
      parentContainer.style.position = 'relative';
      parentContainer.style.overflow = 'hidden';
      parentContainer.style.height = `${containerHeight}px`;
      
      // 确保内部容器样式正确（可滚动内容区域）
      scrollElement.style.position = 'absolute';
      scrollElement.style.top = '0';
      scrollElement.style.left = '0';
      scrollElement.style.right = '0';
      scrollElement.style.transition = 'transform 0.3s ease-out';
      scrollElement.style.overflow = 'visible';
      
      // 获取子元素高度作为滚动步长
      const originalChildren = Array.from(scrollElement.children).filter(child => !child.classList.contains('vertical-scroll-clone'));
      const childHeight = originalChildren[0]?.offsetHeight || config.averageChildHeight || 40;
      const step = childHeight; // 使用子元素高度作为步长
      const interval = config.interval || 3000; // 调整间隔时间，更合理的滚动速度
      
      let position = 0;
      const maxScroll = originalHeight - containerHeight; // 最大滚动距离 = 内容高度 - 可视区域高度
      
      // 简单的滚动逻辑 - 确保向上滚动
      try {
        scrollElement._verticalScrollTimer = setInterval(() => {
          // 安全检查
          if (!this.verticalScrollIsRunning || !parentContainer || !document.body.contains(parentContainer) || !scrollElement) {
            if (scrollElement && scrollElement._verticalScrollTimer) {
              clearInterval(scrollElement._verticalScrollTimer);
              scrollElement._verticalScrollTimer = null;
            }
            return;
          }
          
          // 向上滚动一个子元素高度
          position += step;
          
          // 检查是否需要重置
          if (position >= maxScroll) {
            // 无缝滚动重置
            scrollElement.style.transition = 'none';
            position = 0;
            scrollElement.style.transform = `translateY(-${position}px)`;
            
            // 强制重绘
            scrollElement.offsetHeight;
            
            // 恢复过渡
            setTimeout(() => {
              if (scrollElement && document.body.contains(parentContainer)) {
                scrollElement.style.transition = 'transform 0.3s ease-out';
              }
            }, 50);
          } else {
            // 向上滚动：使用负的translateY值
            scrollElement.style.transform = `translateY(-${position}px)`;
          }
        }, interval);
        
        
      } catch (error) {
        // 设置备用定时器失败，静默处理
        this.verticalScrollIsRunning = false;
      }
    }
  }
};