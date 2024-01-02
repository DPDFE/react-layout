## Feature
| LocalStorage | 封装localstorage方法 |
| Events | 订阅发布 |
| genAutoIdInit、genAutoId | 自增涨触发器 |
| genAutoIdString | 获取一个永不重复的字符串 |

## Usage

```
import {
    LocalStorage,
    genAutoId,
} from "@dpdfe/event-utils";
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
