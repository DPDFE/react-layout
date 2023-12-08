import DAG from '../src/graph';

test('dag', () => {
    const dag = new DAG({
        nodes: [1, 2, 3, 4, 5],
        links: [
            { parent_id: 1, child_id: 2, name: 111 },
            { parent_id: 2, child_id: 3, name: 222 },
            { parent_id: 2, child_id: 4, name: 222 },
            { parent_id: 3, child_id: 1, name: 333 },
            { parent_id: 4, child_id: 5, name: 444 }
            // { parent_id: 4, child_id: 6, name: 444 }
        ],
        link_key: {
            start: 'parent_id',
            end: 'child_id'
        }
    });

    console.log(dag.children);
    console.log(dag.hasCycle());
    console.log(dag.findParents(5));
    console.log(dag.findParents(5, { include_self: false }));
    console.log(dag.findChildren(4));
    console.log(dag.findChildren(4, { include_self: false }));
    dag.removeNode(4);
    console.log(dag.children, dag.parents);
});
