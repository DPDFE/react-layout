import DAG from '../src/graph';

test('dag', () => {
    const dag = new DAG({
        nodes: [1, 2, 3, 4, 5, 6],
        links: [
            { parent_id: 1, child_id: 2 },
            { parent_id: 2, child_id: 3 },
            { parent_id: 2, child_id: 4 },
            { parent_id: 3, child_id: 1 },
            { parent_id: 4, child_id: 5 }
        ],
        link_key: {
            start: 'parent_id',
            end: 'child_id'
        }
    });

    console.log(dag.hasCycle());
    console.log(dag.findParents(5));
});
