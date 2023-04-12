# event-utils

这是一个 js 的方法库，提供了一些基础的 js 方法。

## Feature
| 方法 | 作用 |
| --- | --- |
| formatFloatNumber | 格式化十进制四舍五入保留小数位 |
| addEvent、removeEvent | 兼容浏览器的 event 事件绑定 |
| matchesSelector | 判断当前元素是否是目标 class |
| matchesSelectorAndParentsTo | 找到从开始元素一直找到结束元素是否有目标 class |
| LocalStorage | 封装localstorage方法 |
| Events | 订阅发布 |
| genAutoIdInit、genAutoId | 自增涨触发器 |
| genAutoIdString | 获取一个永不重复的字符串 |

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


## Usage

```
import {
    LocalStorage,
    formatFloatNumber,
    addEvent,
    removeEvent,
    isFunction,
    matchesSelector,
    matchesSelectorAndParentsTo,
    // color
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

#### toHex
```
// keyword
toHex('red') // #FF0000

// rgb 空格
toHex('rgb(40 42 54)') // #282a36

// rgb / alpha
toHex('rgb(40 42 54/0.75)') // #282a36bf

// rgb / alpha
toHex('rgb(40 42 54 /      0.75)') // #282a36bf

// rgb / alpha 反斜杠
toHex('rgb(40 42 54 / 0.75)')  // #282a36bf

// number 分号
toHex(65, 131, 196) // #4183c4

// alpha
toHex(65, 131, 196, 0.2) // #4183c433

// alpha percent 百分号
toHex(40, 42, 54, '75%') // #282a36bf

// hex
toHex('#4183c4') // #4183c4

// hex alpha
toHex('#4183c4bf') // #4183c4bf

// rgb
toHex('rgb(40, 42, 54)') // #282a36

// rgb
toHex('rgb(40,42,54)') // #282a36

// rgba 75%
toHex('rgba(40,42,54,75%)') // #282a36bf

// rgba 75%
toHex('rgba(40, 42, 54, 75%)') // #282a36bf

// rgba 0.75 小数位
toHex('rgba(40, 42,   54,   .75)') // #282a36bf

// rgba 0.75
toHex('rgba(40,42,54,.75)') // #282a36bf

// rgba 0.75
toHex('rgba(40,42,54,0.75)') // #282a36bf

// rgba 0
toHex('rgba(40, 42, 54, 0)') // #282a3600

// rgba 1
toHex('rgba(40, 42, 54, 1)') // #282a36ff

// error
toHex('rgba(276, 42, 54, 1)') // new Error('Expected three numbers below 256')
```

#### toRgba

```
// keyword 关键词
toRgba('red')) // rgba(255, 0, 0, 1)

// hex
toRgba('#3c4') // rgba(51, 204, 68, 1)

// hex
toRgba('#0006') // rgba(0, 0, 0, 0.4)

// hex
toRgba('#4183c4') // rgba(65, 131, 196, 1)

// hex
toRgba('#cd2222cc') // rgba(205, 34, 34, 0.8)

// array
toRgba('#222299', { format: RGBFormatType.Array }) // [34, 34, 153, 1]

// object
toRgba('#222299', { format: RGBFormatType.Object }) // { alpha: 1, blue: 153, green: 34, red: 34}

// alpha
toRgba('#222299', { alpha: 1 }) // rgba(34, 34, 153, 1)

// 透明度覆盖 alpha
toRgba('rgb(40 42 54/0.75)', { alpha: 1 }) // rgba(40, 42, 54, 1)

// rgb / alpha
toRgba('rgb(40 42 54 / 0.75)') // rgba(40, 42, 54, 0.75)
```

#### isHex
```
isHex('#fff') // true
isHex('#fffff') // false
```

#### isRgb

#### isRgba

#### getKeywordColor

#### getOpacity

#### darken、lighten
```
// darken 5%
darken('#2196f3') // rgba(20, 137, 230, 1)

// rgb / alpha percent 10%
darken('#2196f3', { percent: 10 }) // rgba(8, 125, 218, 1)

// rgb / alpha percent 20%
darken('#2196f3', { percent: 20 }) // rgba(0, 99, 192, 1)

// rgb / alpha percent 50%
darken('#2196f3', { percent: 50 }) // rgba(0, 23, 116, 1)

// rgb / alpha percent 100%
darken('#2196f3', { percent: 100 }) // rgba(0, 0, 0, 1)

// lighten
// rgb / alpha percent 5%
lighten('#2196f3') // rgba(46, 163, 255, 0.95)

// rgb / alpha percent 10%
lighten('#2196f3', { percent: 10 }) // rgba(59, 176, 255, 0.9)

// rgb / alpha percent 20%
lighten('#2196f3', { percent: 20 }) // rgba(84, 201, 255, 0.8)

// rgb / alpha percent 50%
lighten('#2196f3', { percent: 50 }) // rgba(161, 255, 255, 0.5)

// rgb / alpha percent 100%
lighten('#2196f3', { percent: 100 }) // rgba(255, 255, 255, 0)
```

#### 更多颜色使用方法参考exampe、test测试用例

#### [example](https://github.com/DPDFE/react-layout/blob/main/src/example/event/color/computed.tsx)

#### [test](https://github.com/DPDFE/react-layout/tree/main/packages/event/__tests__)

#### formatFloatNumber
```
formatFloatNumber(3.3234234234, 2)  //3.32
formatFloatNumber(3, 2) // 3
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

#### EventBus
```
import { Events } from "@dpdfe/event-utils";
export const EventBus = new Events()

const logEvent = (event: string) => {
    console.log(`this is `, event);
}

// 注册事件和回调方法
EventBus.on('aaa', logEvent)

// 只触发一次的事件和回调
EventBus.once('ccc', logEvent)

// 事件触发
EventBus.emit('aaa', 'aaa')
EventBus.emit('bbb', 'bbb')
EventBus.emit('ccc', 'ccc')
EventBus.emit('ccc', 'ccc')

// 事件取消
EventBus.off('aaa', 'xxx')

// 取消所有监听
EventBus.clear()

// 获取当前事件的所有回调方法
EventBus.listeners('aaa')

// 设置事件最大注册数量
EventBus.setMaxListeners(4)
```

#### AutoId
```
// 注册自增涨配置信息、不注册回全局新增默认default队列参数
// key 队列名
// start 迭代初始值
// step 增长步长
genAutoIdInit({ start: 1 });

// 默认分组
genAutoId() // 1
genAutoId() // 2
genAutoId() // 3
genAutoId() // 4

// 分组queue
genAutoId('queue') // 随机值 + 1
genAutoId('queue') // 随机值 + 2
genAutoId('queue') // 随机值 + 3
genAutoId('queue') // 随机值 + 4

// 随机字符串
genAutoIdString() // vfcnmjrv0f
```


