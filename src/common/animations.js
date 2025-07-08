/**
 * 数值动画执行器
 * @description 在指定时间内让数值从起始值平滑过渡到目标值，支持线性动画、缓动效果和整数模式
 * @param {Object} config - 动画配置对象
 * @param {number} config.from - 起始数值
 * @param {number} config.to - 目标数值
 * @param {number} config.duration - 动画持续时间（毫秒）
 * @param {Function} [config.onProgress] - 进度回调函数，接收当前数值作为参数
 * @param {Function} [config.onStart] - 动画开始回调函数
 * @param {Function} [config.onComplete] - 动画完成回调函数
 * @param {boolean} [config.isInteger=false] - 是否只保留整数值
 * @param {number} [config.delay=0] - 延迟开始时间（毫秒）
 * @param {string} [config.easing='linear'] - 缓动函数类型：'linear'(线性)、'easeOut'(从快到慢)、'easeOutStrong'(强烈减速)、'easeOutExtreme'(极慢结尾)、'easeIn'(从慢到快)、'easeInOut'(慢-快-慢)
 * @param {boolean} [config.autoStep=false] - 是否根据数值大小自动计算步进值
 * @param {number} [config.precision=2] - 小数精度，仅在非整数模式下生效
 * @returns {Object} 返回动画控制对象，包含 stop、pause、resume 方法
 * @example
 * // 基本用法
 * const animation = numberAnimationRun({
 *   from: 0,
 *   to: 100,
 *   duration: 1000,
 *   onProgress: (value) => console.log(value),
 *   onComplete: () => console.log('动画完成')
 * });
 * 
 * @example
 * // 带暂停和恢复功能
 * const animation = numberAnimationRun({
 *   from: 0,
 *   to: 100,
 *   duration: 2000,
 *   onProgress: (value) => element.textContent = value
 * });
 * 
 * // 暂停动画
 * animation.pause();
 * 
 * // 恢复动画
 * animation.resume();
 * 
 * // 停止动画
 * animation.stop();
 * 
 * @since 1.1.0
 */
export const numberAnimationRun = (config) => {
  const {
    from,
    to,
    duration,
    onProgress,
    onStart,
    onComplete,
    isInteger = false,
    delay = 0,
    easing = 'linear',
    autoStep = true,
    precision = 2
  } = config;

  // 参数验证
  if (typeof from !== 'number' || typeof to !== 'number' || typeof duration !== 'number') {
    throw new Error('参数 from, to, duration 必须是数字类型');
  }

  if (duration <= 0) {
    console.warn('动画持续时间必须大于0，直接执行结束回调');
    onProgress && onProgress(to);
    onComplete && onComplete();
    return { stop: () => { }, pause: () => { }, resume: () => { } };
  }

  if (from === to) {
    onProgress && onProgress(to);
    onComplete && onComplete();
    return { stop: () => { }, pause: () => { }, resume: () => { } };
  }

  // 缓动函数
  const easingFunctions = {
    linear: (t) => t,
    easeOut: (t) => 1 - Math.pow(1 - t, 4), // 四次方缓出，更强烈的减速效果
    easeOutStrong: (t) => 1 - Math.pow(1 - t, 5), // 五次方缓出，极强减速
    easeOutExtreme: (t) => {
      // 自定义极慢结尾效果：前70%快速，后30%极慢
      if (t < 0.7) {
        return 0.9 * (t / 0.7); // 前80%时间完成90%进度
      } else {
        // 后30%时间完成最后10%进度，使用指数衰减
        const remaining = (t - 0.7) / 0.3;
        return 0.9 + 0.1 * (1 - Math.exp(-5 * remaining));
      }
    },
    easeIn: (t) => Math.pow(t, 3), // 三次方缓入
    easeInOut: (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2 // 三次方缓入缓出
  };

  const easingFunc = easingFunctions[easing] || easingFunctions.linear;

  // 自动步进计算
  let stepValue = 1;
  if (autoStep) {
    const diff = Math.abs(to - from);
    if (diff >= 10000) {
      stepValue = 100;
    } else if (diff >= 1000) {
      stepValue = 10;
    } else if (diff >= 100) {
      stepValue = 1;
    } else if (diff >= 10) {
      stepValue = 0.1;
    } else {
      stepValue = 0.01;
    }
  }

  let animationId = null;
  let startTime = null;
  let delayStartTime = null;
  let pausedTime = 0;
  let totalPausedTime = 0;
  let isStopped = false;
  let isPaused = false;
  let isDelaying = delay > 0;
  let hasStarted = false;

  const animate = (currentTime) => {
    if (isStopped) return;

    if (isPaused) {
      if (!pausedTime) pausedTime = currentTime;
      animationId = requestAnimationFrame(animate);
      return;
    }

    // 恢复时计算暂停时长
    if (pausedTime) {
      totalPausedTime += currentTime - pausedTime;
      pausedTime = 0;
    }

    // 处理延迟
    if (isDelaying) {
      if (!delayStartTime) delayStartTime = currentTime;

      if (currentTime - delayStartTime < delay) {
        animationId = requestAnimationFrame(animate);
        return;
      }

      isDelaying = false;
      startTime = currentTime; // 延迟结束后重新设置开始时间
    }

    // 记录开始时间并触发开始回调
    if (!startTime) {
      startTime = currentTime;
      if (!hasStarted) {
        hasStarted = true;
        onStart && onStart();
      }
    }

    const elapsed = currentTime - startTime - totalPausedTime;
    let progress = Math.min(elapsed / duration, 1);

    // 应用缓动函数
    progress = easingFunc(progress);

    // 计算当前值
    let currentValue = from + (to - from) * progress;

    // 应用自动步进
    if (autoStep && stepValue > 0) {
      currentValue = Math.round(currentValue / stepValue) * stepValue;
    }

    // 应用整数模式或精度控制
    let finalValue;
    if (isInteger) {
      finalValue = Math.round(currentValue);
    } else {
      finalValue = Number(currentValue.toFixed(precision));
    }

    // 确保动画结束时精确达到目标值
    if (elapsed >= duration) {
      finalValue = to;
      onProgress && onProgress(finalValue);
      onComplete && onComplete();
      return;
    }

    onProgress && onProgress(finalValue);

    // 继续下一帧
    animationId = requestAnimationFrame(animate);
  };

  // 开始动画
  animationId = requestAnimationFrame(animate);

  // 返回动画控制对象
  return {
    // 停止动画
    stop() {
      isStopped = true;
      if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
    },

    // 暂停动画
    pause() {
      if (!isStopped && !isPaused) {
        isPaused = true;
      }
    },

    // 恢复动画
    resume() {
      if (!isStopped && isPaused) {
        isPaused = false;
      }
    },

    // 获取动画状态
    getStatus() {
      if (isStopped) return 'stopped';
      if (isPaused) return 'paused';
      if (isDelaying) return 'delaying';
      return 'running';
    }
  };
};

/**
 * 默认单位转换配置
 */
const DEFAULT_UNIT_CONFIG = [
  { threshold: 1000000000000, unit: '万亿', divisor: 1000000000000, precision: 1 },
  { threshold: 100000000, unit: '亿', divisor: 100000000, precision: 1 },
  { threshold: 10000, unit: '万', divisor: 10000, precision: 1 }
];

/**
 * 数值格式化工具函数
 * @param {number} value - 要格式化的数值
 * @param {Object} options - 格式化选项
 * @param {boolean} [options.thousands=false] - 是否添加千分位分隔符
 * @param {string} [options.currency] - 货币符号
 * @param {string|Object} [options.suffix] - 后缀，可以是字符串或包含text和fontSize的对象
 * @param {string} [options.suffix.text] - 后缀文本
 * @param {number} [options.suffix.fontSize] - 后缀字体大小（em单位）
 * @param {number} [options.precision=2] - 小数位数
 * @param {boolean} [options.autoUnit=false] - 是否自动转换单位（千、万、亿、万亿）
 * @param {boolean} [options.showTitle=false] - 是否显示原始值的title提示
 * @param {Array} [options.customUnits] - 自定义单位配置数组，格式：[{threshold, unit, divisor, precision}]
 * @returns {string} 格式化后的字符串，如果包含特殊配置则返回HTML字符串
 */
export const formatNumber = (value, options = {}) => {
  const { 
    thousands = false, 
    currency, 
    suffix, 
    precision = 2, 
    autoUnit = false,
    showTitle = false,
    customUnits
  } = options;

  const originalValue = value; // 保存原始值
  let number = Number(value);
  let finalSuffix = suffix;
  let finalPrecision = precision;
  let finalThousands = thousands;

  // 使用自定义单位配置或默认配置
  const unitConfig = customUnits || DEFAULT_UNIT_CONFIG;

  // 自动单位转换逻辑
  if (autoUnit && typeof number === 'number' && Math.abs(number) >= 1000) {
    const absNumber = Math.abs(number);
    const isNegative = number < 0;
    
    for (const config of unitConfig) {
      if (absNumber >= config.threshold) {
        finalSuffix = {
          text: config.unit,
          fontSize: 0.4
        };
        finalPrecision = config.precision !== undefined ? config.precision : 1;
        finalThousands = true;
        number = number / config.divisor;
        break;
      }
    }
  }

  let result = Number(number).toFixed(finalPrecision);

  if (finalThousands) {
    result = Number(result).toLocaleString();
  }

  if (currency) {
    result = currency + result;
  }

  if (finalSuffix) {
    if (typeof finalSuffix === 'string') {
      // 简单字符串后缀
      result = result + finalSuffix;
    } else if (typeof finalSuffix === 'object' && finalSuffix.text) {
      // 对象形式的后缀，支持字体大小控制
      const suffixText = finalSuffix.text;
      const fontSize = finalSuffix.fontSize;
      
      if (fontSize && typeof fontSize === 'number') {
        // 返回带样式的HTML字符串
        result = result + `<span style="font-size: ${fontSize}em;">${suffixText}</span>`;
      } else {
        // 没有指定字体大小，直接添加文本
        result = result + suffixText;
      }
    }
  }

  // 如果需要显示title或者使用了自动单位转换，返回HTML格式
  if (showTitle || autoUnit || (finalSuffix && typeof finalSuffix === 'object')) {
    const titleValue = originalValue.toLocaleString();
    return `<span class="cursor-pointer" title="${titleValue}">${result}</span>`;
  }

  return result;
};

/**
 * 创建自定义单位配置的便捷函数
 * @param {string} type - 配置类型：'chinese'(中文)、'english'(英文)、'bytes'(字节)
 * @returns {Array} 单位配置数组
 */
export const createUnitConfig = (type = 'chinese') => {
  const configs = {
    chinese: [
      { threshold: 1000000000000, unit: '万亿', divisor: 1000000000000, precision: 1 },
      { threshold: 100000000, unit: '亿', divisor: 100000000, precision: 1 },
      { threshold: 10000, unit: '万', divisor: 10000, precision: 1 },
      { threshold: 1000, unit: '千', divisor: 1000, precision: 0 }
    ],
    english: [
      { threshold: 1000000000000, unit: 'T', divisor: 1000000000000, precision: 1 },
      { threshold: 1000000000, unit: 'B', divisor: 1000000000, precision: 1 },
      { threshold: 1000000, unit: 'M', divisor: 1000000, precision: 1 },
      { threshold: 1000, unit: 'K', divisor: 1000, precision: 1 }
    ],
    bytes: [
      { threshold: 1099511627776, unit: 'TB', divisor: 1099511627776, precision: 2 },
      { threshold: 1073741824, unit: 'GB', divisor: 1073741824, precision: 2 },
      { threshold: 1048576, unit: 'MB', divisor: 1048576, precision: 2 },
      { threshold: 1024, unit: 'KB', divisor: 1024, precision: 2 }
    ]
  };
  
  return configs[type] || configs.chinese;
};

/**
 * 数值动画与格式化的组合函数
 * @param {Object} config - 配置对象
 * @param {number} config.from - 起始值
 * @param {number} config.to - 目标值
 * @param {number} config.duration - 动画时长
 * @param {HTMLElement} config.element - 目标DOM元素
 * @param {Object} [config.formatOptions] - formatNumber的选项
 * @param {Object} [config.animationOptions] - numberAnimationRun的其他选项
 * @returns {Object} 动画控制对象
 */
export const animateNumberWithFormat = (config) => {
  const { from, to, duration, element, formatOptions = {}, animationOptions = {} } = config;
  
  return numberAnimationRun({
    from,
    to,
    duration,
    onProgress: (value) => {
      if (element) {
        element.innerHTML = formatNumber(value, formatOptions);
      }
    },
    ...animationOptions
  });
};