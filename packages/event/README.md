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
| EventBus | 订阅发布 |
| toHex | 转化为hex（支持keyword\rgb\rgba\hex，支持多种空格、分号、斜杠分隔） |
| toRgba | 转化为rgba（支持object、array、string输出格式） |
| isHex | 判断是否是hex |
| isRgb | 判断是否是rgb |
| isRbga | 判断是否是rgba |
| getKeywordColor | 获取关键词配色，比如red: #FF0000 |
| getOpacity | 获取透明度，支持transparent |
| darken、lighten | 线性颜色百分比取值 |


## Usage

```
import {
    LocalStorage,
    fomatFloatNumber,
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

#### color
```
import { toHex } from '../src/color/tohex';

// keyword
test('red', () => {
    expect(toHex('red')).toBe('#FF0000');
});

// rgb
test('rgb(40 42 54)', () => {
    expect(toHex('rgb(40 42 54)')).toBe('#282a36');
});

// rgb
test('rgb(40  42  54)', () => {
    expect(toHex('rgb(40 42 54)')).toBe('#282a36');
});

// rgb / alpha
test('rgb(40 42 54/0.75)', () => {
    expect(toHex('rgb(40 42 54/0.75)')).toBe('#282a36bf');
});

// rgb / alpha
test('rgb(40 42 54 /     0.75)', () => {
    expect(toHex('rgb(40 42 54 /      0.75)')).toBe('#282a36bf');
});

// rgb / alpha
test('rgb(40 42 54 / 0.75)', () => {
    expect(toHex('rgb(40 42 54 / 0.75)')).toBe('#282a36bf');
});

// number
test('65,131,196', () => {
    expect(toHex(65, 131, 196)).toBe('#4183c4');
});

// alpha
test('65, 131, 196, 0.2', () => {
    expect(toHex(65, 131, 196, 0.2)).toBe('#4183c433');
});

// alpha percent
test('40, 42, 54, 75%', () => {
    expect(toHex(40, 42, 54, '75%')).toBe('#282a36bf');
});

// hex
test('#4183c4', () => {
    expect(toHex('#4183c4')).toBe('#4183c4');
});

// hex alpha
test('#4183c4bf', () => {
    expect(toHex('#4183c4bf')).toBe('#4183c4bf');
});

// rgb
test('rgb(40, 42, 54)', () => {
    expect(toHex('rgb(40, 42, 54)')).toBe('#282a36');
});

// rgb
test('rgb(40,42,54)', () => {
    expect(toHex('rgb(40,42,54)')).toBe('#282a36');
});

// rgba 75%
test('rgba(40,42,54,75%)', () => {
    expect(toHex('rgba(40,42,54,75%)')).toBe('#282a36bf');
});

// rgba 75%
test('rgba(40, 42, 54, 75%)', () => {
    expect(toHex('rgba(40, 42, 54, 75%)')).toBe('#282a36bf');
});

// rgba 0.75
test('rgba(40, 42,   54,   .75)', () => {
    expect(toHex('rgba(40, 42,   54,   .75)')).toBe('#282a36bf');
});

// rgba 0.75
test('rgba(40,42,54,.75)', () => {
    expect(toHex('rgba(40,42,54,.75)')).toBe('#282a36bf');
});

// rgba 0
test('rgba(40, 42, 54, 0)', () => {
    expect(toHex('rgba(40, 42, 54, 0)')).toBe('#282a3600');
});

// rgba 1
test('rgba(40, 42, 54, 1)', () => {
    expect(toHex('rgba(40, 42, 54, 1)')).toBe('#282a36ff');
});

// error
test('rgba(276, 42, 54, 1)', () => {
    expect(() => toHex('rgba(276, 42, 54, 1)')).toThrow(
        'Expected three numbers below 256'
    );
});

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
