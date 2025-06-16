/**
 * 数值动画执行器
 * @description 在指定时间内让数值从起始值平滑过渡到目标值，支持线性动画、缓动效果和整数模式
 * @param {Object} config - 动画配置对象
 * @param {number} config.from - 起始数值
 * @param {number} config.to - 目标数值
 * @param {number} config.duration - 动画持续时间（毫秒）
 * @param {Function} [config.onProgress] - 进度回调函数，接收当前数值作为参数
 * @param {boolean} [config.isInteger=false] - 是否只保留整数值
 * @param {number} [config.delay=0] - 延迟开始时间（毫秒）
 * @param {string} [config.easing='linear'] - 缓动函数类型：'linear'(线性)、'easeOut'(从快到慢)、'easeOutStrong'(强烈减速)、'easeOutExtreme'(极慢结尾)、'easeIn'(从慢到快)、'easeInOut'(慢-快-慢)
 * @param {boolean} [config.autoStep=false] - 是否根据数值大小自动计算步进值
 * @returns {Function} 返回停止动画的函数
 * @example
 * // 基本用法
 * const stopAnimation = numberAnimationRun({
 *   from: 0,
 *   to: 100,
 *   duration: 1000,
 *   onProgress: (value) => console.log(value)
 * });
 * 
 * @example
 * // 带延迟和缓动效果
 * const stopAnimation = numberAnimationRun({
 *   from: 0,
 *   to: 100,
 *   duration: 2000,
 *   delay: 500,
 *   easing: 'easeOut',
 *   onProgress: (value) => element.textContent = value,
 *   isInteger: true
 * });
 * 
 * @example
 * // 极慢结尾的灵动效果（推荐用于数字轮播）
 * const stopAnimation = numberAnimationRun({
 *   from: 0,
 *   to: 9999,
 *   duration: 3000,
 *   easing: 'easeOutExtreme', // 前80%快速，后20%极慢
 *   autoStep: true,
 *   onProgress: (value) => element.textContent = value.toLocaleString()
 * });
 * 
 * @example
 * // 自动步进模式
 * const stopAnimation = numberAnimationRun({
 *   from: 0,
 *   to: 10000,
 *   duration: 3000,
 *   autoStep: true,
 *   onProgress: (value) => console.log(value)
 * });
 * 
 * // 停止动画
 * stopAnimation();
 * 
 * @since 1.0.0
 */
export const numberAnimationRun = (config) => {
  const { 
    from, 
    to, 
    duration, 
    onProgress, 
    isInteger = false, 
    delay = 0, 
    easing = 'linear', 
    autoStep = true 
  } = config;
  
  // 参数验证
  if (typeof from !== 'number' || typeof to !== 'number' || typeof duration !== 'number') {
    throw new Error('参数 from, to, duration 必须是数字类型');
  }
  
  if (duration <= 0) {
    console.warn('动画持续时间必须大于0，直接执行结束回调');
    onProgress && onProgress(to);
    return () => {}; // 返回空的停止函数
  }
  
  if (from === to) {
    onProgress && onProgress(to);
    return () => {};
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
      stepValue = 5;
    } else if (diff >= 10) {
      stepValue = 1;
    } else {
      stepValue = 0.1;
    }
  }
  
  let animationId = null;
  let startTime = null;
  let delayStartTime = null;
  let isStopped = false;
  let isDelaying = delay > 0;
  
  const animate = (currentTime) => {
    if (isStopped) return;
    
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
    
    // 记录开始时间
    if (!startTime) startTime = currentTime;
    
    const elapsed = currentTime - startTime;
    let progress = Math.min(elapsed / duration, 1);
    
    // 应用缓动函数
    progress = easingFunc(progress);
    
    // 计算当前值
    let currentValue = from + (to - from) * progress;
    
    // 应用自动步进
    if (autoStep && stepValue > 0) {
      currentValue = Math.round(currentValue / stepValue) * stepValue;
    }
    
    // 应用整数模式
    const finalValue = isInteger ? Math.round(currentValue) : currentValue;
    
    onProgress && onProgress(finalValue);
    
    // 如果动画未完成，继续下一帧
    if (elapsed < duration) {
      animationId = requestAnimationFrame(animate);
    }
  };
  
  // 开始动画
  animationId = requestAnimationFrame(animate);
  
  // 返回停止函数
  return () => {
    isStopped = true;
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
  };
};