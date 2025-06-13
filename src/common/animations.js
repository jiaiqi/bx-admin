/**
 * 数值动画执行器
 * @description 在指定时间内让数值从起始值平滑过渡到目标值，支持线性动画和整数模式
 * @param {Object} config - 动画配置对象
 * @param {number} config.from - 起始数值
 * @param {number} config.to - 目标数值
 * @param {number} config.duration - 动画持续时间（毫秒）
 * @param {Function} [config.onProgress] - 进度回调函数，接收当前数值作为参数
 * @param {boolean} [config.isInteger=false] - 是否只保留整数值
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
 * // 整数模式
 * const stopAnimation = numberAnimationRun({
 *   from: 0,
 *   to: 100,
 *   duration: 2000,
 *   onProgress: (value) => element.textContent = value,
 *   isInteger: true
 * });
 * 
 * // 停止动画
 * stopAnimation();
 * 
 * @since 1.0.0
 */
export const numberAnimationRun = (config) => {
  const { from, to, duration, onProgress, isInteger = false } = config;
  
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
  
  let animationId = null;
  let startTime = null;
  let isStopped = false;
  
  const animate = (currentTime) => {
    if (isStopped) return;
    
    // 记录开始时间
    if (!startTime) startTime = currentTime;
    
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // 使用线性插值计算当前值
    const currentValue = from + (to - from) * progress;
    const finalValue = isInteger ? Math.round(currentValue) : currentValue;
    
    onProgress && onProgress(finalValue);
    
    // 如果动画未完成，继续下一帧
    if (progress < 1) {
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