import DAG from '../src/graph';

test('dag', () => {
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

    /**
     * 1 => 2
     * 2 => 3,4
     * 3 => 1,
     * 4 => 5,6
     */
    console.log(dag.children);

    // true
    console.log(dag.hasCycle());
    // 5, 4, 2, 1, 3
    console.log(dag.findParents(5));
    // 4, 2, 1, 3
    console.log(dag.findParents(5, { include_self: false }));
    // 4, 5, 6
    console.log(dag.findChildren(4));
    // 5, 6
    console.log(dag.findChildren(4, { include_self: false }));
    dag.removeNode(4);
    console.log(dag.children, dag.parents);
});
