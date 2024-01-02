## Feature
| 方法 | 作用 |
| --- | --- |
| hasCycle | 成环检测 |
| findParents | 获取一个节点的所有父元素 |
| findChildren | 获取一个节点的所有子元素 |
| removeNode | 删除一个节点以及它的关联关系 |
| children | 所有节点的子节点的关联关系 |
| parents | 所有节点的父节点的关联关系 |


## Usage

```
    const dag = new DAG({
        nodes: [1, 2, 3, 4, 5, 6],
        links: [
            { parent_id: 1, child_id: 2, type: 'link' },
            { parent_id: 2, child_id: 3, type: 'drill' },
            { parent_id: 2, child_id: 4, type: 'filter' },
            { parent_id: 3, child_id: 1, type: 'filter' },
            { parent_id: 4, child_id: 5, type: 'link' },
            { parent_id: 4, child_id: 6, type: 'filter' }
        ],
        link_key: {
            start: 'parent_id',
            end: 'child_id'
        }
    });
```

#### 使用方法参考test测试用例

#### [test](https://github.com/DPDFE/react-layout/tree/main/packages/event/__tests__/da g.test.ts)
