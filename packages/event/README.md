# `event-utils`

这是一个 js 的方法库，提供了一些基础的 js 方法。
 
| 方法 | 作用 |
| --- | --- |
| fomatFloatNumber | 格式化十进制四舍五入保留小数位 |
| addEvent、removeEvent | 兼容浏览器的 event 事件绑定 |
| matchesSelector | 判断当前元素是否是目标 class |
| matchesSelectorAndParentsTo | 找到从开始元素一直找到结束元素是否有目标 class |

## Usage

```
import {
    fomatFloatNumber,
    addEvent,
    removeEvent,
    isFunction,
    matchesSelector,
    matchesSelectorAndParentsTo
} from "@dpdfe/event-utils";
```
