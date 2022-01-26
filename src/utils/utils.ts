import { LayoutType } from '@/interfaces';

export const RULER_GAP = 100; // 标尺间隔大小
export const TOP_RULER_LEFT_MARGIN = 15; //顶部标尺左侧间隔

// 生成从0开始的数组
export const reciprocalNum = (count1: number, count2: number) => {
  const list: any[] = [];
  for (let i = -count1; i <= count2; i++) {
    list.push(i);
  }
  return list;
};

// 获取5的整数倍数值
export const fiveMultipleIntergral = (count: number, approximation = 5) => {
  const max = Math.ceil(count / approximation) * approximation;
  const min = Math.floor(count / approximation) * approximation;
  return max - count >= approximation / 2 ? min : max;
};

// 最大宽高
// 画布+边距 缩放后宽、高度
export const getMaxWidgetsRange = (
  mode: LayoutType,
  canvas_width: number,
  canvas_height: number,
  scale: number
) => {
  const WRAPPER_PADDING = 200; // 边框
  const calc_width =
    mode === LayoutType.edit ? canvas_width + WRAPPER_PADDING : canvas_width;
  const calc_height =
    mode === LayoutType.edit ? canvas_height + WRAPPER_PADDING : canvas_height;
  return {
    wrapper_calc_width: calc_width * scale,
    wrapper_calc_height: calc_height * scale
  };

  // 当有元素被拖出视窗外，延长画布宽高，进行展示
  // let max_left = 0,
  //   max_right = canvas_width,
  //   max_top = 0,
  //   max_bottom = canvas_height;

  // if (widgets) {
  //   widgets.map((w) => {
  //     if (w.x) {
  //       max_left = max_left < w.x ? max_left : w.x; // 最左边最小值
  //       max_right = max_right < w.x + w.w ? w.x + w.w : max_right; // 最大值
  //       max_top = max_top < w.y ? max_top : w.y; // 最上边最小值
  //       max_bottom = max_bottom < w.y + w.h ? w.y + w.h : max_bottom; // 最大值
  //     }
  //   });
  // }

  // /* 因为画位于中间层画布的中心位置，所以添加宽度和高度的时候，需要增加两倍的大小 */
  // const offset_x = max_right - max_left - canvas_width;
  // const offset_y = max_bottom - max_top - canvas_height;

  // return {
  //     calc_width: canvas_width + 2 * offset_x + wrapper_padding,
  //     calc_height: canvas_height + 2 * offset_y + wrapper_padding,
  // };
};
