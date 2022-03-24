const drawGridLines = (
    container: HTMLCanvasElement,
    width: number,
    height: number
) => {
    if (!container) return;

    // 为了防止字体模糊，获取当前屏幕的像素比，将内容按倍数放大绘制，然后缩放展示
    const getPixelRatio = function (context: any) {
        const backingStore =
            context.backingStorePixelRatio ||
            context.webkitBackingStorePixelRatio ||
            context.mozBackingStorePixelRatio ||
            context.msBackingStorePixelRatio ||
            context.oBackingStorePixelRatio ||
            context.backingStorePixelRatio ||
            1;
        return (window.devicePixelRatio || 1) / backingStore;
    };

    const drawLine = (
        p1: { x: number; y: number },
        p2: { x: number; y: number }
    ) => {
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#ddd';
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
        ctx.closePath();
    };

    const ctx = container.getContext('2d')!;
    const ratio = getPixelRatio(ctx);

    const current_width = width * ratio;
    const current_height = height * ratio;
    const size = 10 * ratio;
    container.width = current_width;
    container.height = current_height;

    let start_y = size,
        start_x = size;

    while (start_y <= current_height) {
        drawLine({ x: 0, y: start_y }, { x: current_width, y: start_y });
        start_y += size;
    }

    while (start_x <= current_width) {
        drawLine({ x: start_x, y: 0 }, { x: start_x, y: current_height });
        start_x += size;
    }
};

export default drawGridLines;
