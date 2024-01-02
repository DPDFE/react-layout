## Feature
| 方法 | 作用 |
| --- | --- |
| formatFloatNumber | 格式化十进制四舍五入保留小数位 |
| addEvent、removeEvent | 兼容浏览器的 event 事件绑定 |
| matchesSelector | 判断当前元素是否是目标 class |
| matchesSelectorAndParentsTo | 找到从开始元素一直找到结束元素是否有目标 class |



## Usage

```
import {
    formatFloatNumber,
    addEvent,
    removeEvent,
    isFunction,
    matchesSelector,
    matchesSelectorAndParentsTo,
} from "@dpdfe/event-utils";
```


#### formatFloatNumber
```
formatFloatNumber(3.3234234234, 2)  //3.32
formatFloatNumber(3, 2) // 3
```


