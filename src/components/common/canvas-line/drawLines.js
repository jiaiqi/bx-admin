/**
 * 在Canvas上绘制航线
 * @param {string} canvasId - Canvas元素的ID
 * @param {Object} startPoint - 起点坐标 {x: number, y: number}
 * @param {Array} endPoints - 终点坐标数组 [{x: number, y: number}, ...]
 * @param {Object} options - 可选配置项
 * @param {string} options.lineColor - 线条颜色，默认 '#1890ff'
 * @param {number} options.lineWidth - 线条宽度，默认 2
 * @param {number} options.animationDuration - 动画持续时间(ms)，默认 1000
 */
export function drawFlightLines(canvasId, startPoint, endPoints, options = {}) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.error('Canvas element not found');
        return;
    }

    // 设置 canvas 尺寸
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    console.log('Canvas dimensions:', canvas.width, canvas.height);
    console.log('Start point:', startPoint);
    console.log('End points:', endPoints);

    const ctx = canvas.getContext('2d');
    const {
        lineColor = '#00ffff', // 基础线条颜色
        lineWidth = 2,
        animationDuration = 1000,
        // 新增颜色配置
        glowColor = 'rgba(0, 255, 255, 0.5)', // 发光效果颜色
        flowColor = 'rgba(255, 255, 255, 0.8)', // 流动光效颜色
        pointColor = '#00ffff', // 点位基础颜色
        pointGlowColor = 'rgba(0, 255, 255, 0.8)', // 点位光晕颜色
        rippleColor = 'rgba(0, 255, 255, 0.2)', // 水波纹颜色
        centerPointColor = '#ffffff' // 中心点颜色
    } = options;

    // 设置线条样式
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // 绘制科技感点位
    function drawTechPoint(x, y, isEndPoint = false) {
        // 绘制外圈光晕
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, 20);
        gradient.addColorStop(0, pointGlowColor);
        gradient.addColorStop(0.5, pointGlowColor.replace('0.8', '0.2'));
        gradient.addColorStop(1, pointGlowColor.replace('0.8', '0'));

        ctx.beginPath();
        ctx.arc(x, y, 20, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // 绘制内圈
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fillStyle = pointColor;
        ctx.fill();

        // 绘制中心点
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = centerPointColor;
        ctx.fill();

        // 如果是终点，添加额外的装饰效果
        if (isEndPoint) {
            // 绘制十字线
            ctx.beginPath();
            ctx.strokeStyle = pointGlowColor.replace('0.8', '0.6');
            ctx.lineWidth = 1;
            ctx.moveTo(x - 12, y);
            ctx.lineTo(x + 12, y);
            ctx.moveTo(x, y - 12);
            ctx.lineTo(x, y + 12);
            ctx.stroke();
        }
    }

    // 创建动画函数
    function animate() {
        let rippleTime = 0;
        let flowTime = 0;
        
        function draw() {
            rippleTime += 0.05; // 控制水波纹速度
            flowTime += 0.02; // 控制流动光效速度

            // 清除画布
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // 绘制起点
            drawTechPoint(startPoint.x, startPoint.y);

            // 为每个终点绘制线条
            endPoints.forEach(endPoint => {
                // 计算控制点（贝塞尔曲线的控制点）
                const dx = endPoint.x - startPoint.x;
                const dy = endPoint.y - startPoint.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // 控制点位置（在起点和终点的中间位置，向上偏移）
                const controlX = startPoint.x + dx * 0.5;
                const controlY = startPoint.y + dy * 0.5 - distance * 0.2;

                // 绘制基础线条
                const gradient = ctx.createLinearGradient(
                    startPoint.x, startPoint.y,
                    endPoint.x, endPoint.y
                );
                
                gradient.addColorStop(0, lineColor.replace(')', ', 0.1)'));
                gradient.addColorStop(0.5, lineColor.replace(')', ', 0.5)'));
                gradient.addColorStop(1, lineColor);

                ctx.shadowColor = glowColor;
                ctx.shadowBlur = 10;
                ctx.strokeStyle = gradient;
                ctx.lineWidth = lineWidth;

                ctx.beginPath();
                ctx.moveTo(startPoint.x, startPoint.y);
                ctx.quadraticCurveTo(controlX, controlY, endPoint.x, endPoint.y);
                ctx.stroke();

                // 绘制流动光效
                const flowGradient = ctx.createLinearGradient(
                    startPoint.x, startPoint.y,
                    endPoint.x, endPoint.y
                );

                // 创建流动的光效
                const flowOffset = (flowTime % 1); // 确保值在 0-1 之间
                const flowWidth = 0.2; // 光效宽度

                // 确保所有值都在 0-1 范围内
                const startStop = Math.max(0, flowOffset - flowWidth);
                const endStop = Math.min(1, flowOffset + flowWidth);

                flowGradient.addColorStop(startStop, 'rgba(0, 255, 255, 0)');
                flowGradient.addColorStop(flowOffset, flowColor);
                flowGradient.addColorStop(endStop, 'rgba(0, 255, 255, 0)');

                ctx.strokeStyle = flowGradient;
                ctx.lineWidth = lineWidth * 1.5;
                ctx.beginPath();
                ctx.moveTo(startPoint.x, startPoint.y);
                ctx.quadraticCurveTo(controlX, controlY, endPoint.x, endPoint.y);
                ctx.stroke();

                // 重置阴影
                ctx.shadowBlur = 0;

                // 绘制终点
                drawTechPoint(endPoint.x, endPoint.y, true);

                // 绘制水波纹效果
                const rippleRadius = 20 + Math.sin(rippleTime) * 10;
                const rippleGradient = ctx.createRadialGradient(
                    endPoint.x, endPoint.y, 0,
                    endPoint.x, endPoint.y, rippleRadius
                );
                rippleGradient.addColorStop(0, rippleColor);
                rippleGradient.addColorStop(1, rippleColor.replace('0.2', '0'));

                ctx.beginPath();
                ctx.arc(endPoint.x, endPoint.y, rippleRadius, 0, Math.PI * 2);
                ctx.fillStyle = rippleGradient;
                ctx.fill();
            });

            // 继续动画
            requestAnimationFrame(draw);
        }

        // 开始动画
        requestAnimationFrame(draw);
    }

    // 启动动画
    animate();
}
