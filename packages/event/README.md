# event-utils

这是一个 js 的方法库，提供了一些基础的 js 方法。

## Feature
| 方法 | 作用 |
| --- | --- |
| fomatFloatNumber | 格式化十进制四舍五入保留小数位 |
| addEvent、removeEvent | 兼容浏览器的 event 事件绑定 |
| matchesSelector | 判断当前元素是否是目标 class |
| matchesSelectorAndParentsTo | 找到从开始元素一直找到结束元素是否有目标 class |
| LocalStorage | 封装localstorage方法 |

## Usage

```
import {
    LocalStorage,
    fomatFloatNumber,
    addEvent,
    removeEvent,
    isFunction,
    matchesSelector,
    matchesSelectorAndParentsTo
} from "@dpdfe/event-utils";
```

#### fomatFloatNumber
```
fomatFloatNumber(3.3234234234, 2)  //3.32
fomatFloatNumber(3, 2) // 3
```

#### LocalStorage
```
import {LocalStorage} from '@dpdfe/event-utils'
const storage = LocalStorage({username: 'zhangsan01'});
// 设置 localstorage
storage.account = {username: 'lisi02'}

// 获取 localstorage
const account = storage.account

// 删除 localstorage
delete storage.account
```
