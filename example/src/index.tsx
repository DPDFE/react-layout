import './index.css';

import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
    useNavigate,
    useLocation
} from 'react-router-dom';

import DefaultLayout from './demo/default';
import DraggableGridStaticLayout from './demo/draggable/grid/static';
import DraggableGridResponsiveLayout from './demo/draggable/grid/responsive';
import DraggableDragStaticLayout from './demo/draggable/drag/static';
import DraggableDragResponsiveLayout from './demo/draggable/drag/responsive';

import ResizableGridStaticLayout from './demo/resizable/grid/static';
import ResizableGridResponsiveLayout from './demo/resizable/grid/responsive';
import ResizableDragStaticLayout from './demo/resizable/drag/static';
import ResizableDragResponsiveLayout from './demo/resizable/drag/responsive';

import DropDragStaticLayout from './demo/drop/drag/static';
import DropGridResponsiveLayout from './demo/drop/grid/responsive';

import NestedGridResponsiveLayout from './demo/nested/grid/responsive';
import ChangeDragLayout from './demo/change';
import RulerLayout from './demo/ruler';
import { Menu } from 'antd';

function Router() {
    const { SubMenu } = Menu;
    const history = useNavigate();
    const location = useLocation();
    const [selected_key, setSelectedKey] = useState<string>(location.pathname);

    /* draggable */
    const draggable_lists = [
        {
            name: 'grid static',
            path: '/draggable/grid-static',
            element: <DraggableGridStaticLayout />
        },
        {
            name: 'grid responsive',
            path: '/draggable/grid-responsive',
            element: <DraggableGridResponsiveLayout />
        },
        {
            name: 'drag static',
            path: '/draggable/drag-static',
            element: <DraggableDragStaticLayout />
        },
        {
            name: 'drag responsive',
            path: '/draggable/drag-responsive',
            element: <DraggableDragResponsiveLayout />
        }
    ];

    /* resizable */
    const resizable_lists = [
        {
            name: 'grid static',
            path: '/resizable/grid-static',
            element: <ResizableGridStaticLayout />
        },
        {
            name: 'grid responsive',
            path: '/resizable/grid-responsive',
            element: <ResizableGridResponsiveLayout />
        },
        {
            name: 'drag static',
            path: '/resizable/drag-static',
            element: <ResizableDragStaticLayout />
        },
        {
            name: 'drag responsive',
            path: '/resizable/drag-responsive',
            element: <ResizableDragResponsiveLayout />
        }
    ];

    /* drop */
    const drop_lists = [
        {
            name: 'static',
            path: '/drop/drag-static',
            element: <DropDragStaticLayout />
        },
        {
            name: 'responsive',
            path: '/drop/grid-responsive',
            element: <DropGridResponsiveLayout />
        }
    ];

    const router_lists = [
        {
            name: 'default',
            path: '/',
            element: <DefaultLayout />
        },
        {
            name: 'nested grid responsive',
            path: '/nested',
            element: <NestedGridResponsiveLayout />
        },
        {
            name: 'change',
            path: '/change',
            element: <ChangeDragLayout />
        },
        { name: 'ruler', path: 'ruler', element: <RulerLayout /> }
    ];

    return (
        <div style={{ display: 'flex', width: '100%', height: '100%' }}>
            <Menu
                selectedKeys={[selected_key]}
                onClick={(e) => {
                    setSelectedKey(e.key);
                    history(e.key);
                }}
                mode='inline'
                openKeys={['draggable', 'resizable', 'drop']}
                style={{ width: '220px', overflow: 'auto' }}
            >
                <Menu.Item disabled key='name'>
                    demo menu
                </Menu.Item>
                <SubMenu key='draggable' title='draggable'>
                    {draggable_lists.map((r, i) => {
                        return <Menu.Item key={r.path}>{r.name}</Menu.Item>;
                    })}
                </SubMenu>
                <SubMenu key='resizable' title='resizable'>
                    {resizable_lists.map((r, i) => {
                        return <Menu.Item key={r.path}>{r.name}</Menu.Item>;
                    })}
                </SubMenu>
                <SubMenu key='drop' title='drop'>
                    {drop_lists.map((r, i) => {
                        return <Menu.Item key={r.path}>{r.name}</Menu.Item>;
                    })}
                </SubMenu>
                {router_lists.map((r, i) => {
                    return <Menu.Item key={r.path}>{r.name}</Menu.Item>;
                })}
            </Menu>

            <div style={{ flex: 1, overflow: 'hidden' }}>
                <Routes>
                    {router_lists.map((r) => {
                        return (
                            <Route
                                key={r.name}
                                path={r.path}
                                element={r.element}
                            />
                        );
                    })}
                    <Route path='*' element={<Navigate to='/' />} />
                </Routes>
            </div>
        </div>
    );
}

ReactDOM.render(
    <BrowserRouter>
        <Router />
    </BrowserRouter>,
    document.getElementById('root')
);
