| 颜色 | 作用 |
| --- | --- |
| isHex | 判断是否是hex |
| isRgb | 判断是否是rgb |
| isRbga | 判断是否是rgba |
| isHsl | 判断是否是hsl |
| isHsla | 判断是否是hsla |
| toHex | 转化为hex（支持keyword\rgb\rgba\hex，支持多种空格、分号、斜杠分隔） |
| toRgba | 转化为rgba（支持object、array、string输出格式） |
| toHsl | 转化为Hsla（支持object、array、string输出格式） |
| toRgb\toRgbaByCanvas | 转化为rgb（支持object、array、string输出格式），支持颜色融合 |
| getKeywordColor | 获取关键词配色，比如red: #FF0000 |
| range | 颜色色阶推荐 |
| darken、lighten | 线性颜色百分比取值 |
| getOpacity | 获取透明度，支持transparent |
| getLuminance | 亮度 |
| getGrayLevel | 灰度 |
| opacity | 修改透明度 |
| textColor | 根据灰度情况显示文本颜色 |
| gray | 当前颜色灰度情况 |


## Usage

```
import {
    toHex,
    toRgba,
    darken,
    lighten,
    getOpacity,
    isHex,
    isRgb,
    isRgba,
    getKeywordColor
} from "@dpdfe/event-utils";
```


#### 更多颜色使用方法参考exampe、test测试用例

#### [example](https://github.com/DPDFE/react-layout/blob/main/src/example/event/color/computed.tsx)

#### [test](https://github.com/DPDFE/react-layout/tree/main/packages/event/__tests__)
