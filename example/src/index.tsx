import './index.css';

import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

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
import ScaleLayout from './demo/scale';
import RulerLayout from './demo/ruler';

function Router() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path='/' element={<DefaultLayout />} />

                {/* draggable */}
                <Route
                    path='/draggable/grid-static'
                    element={<DraggableGridStaticLayout />}
                />
                <Route
                    path='/draggable/grid-responsive'
                    element={<DraggableGridResponsiveLayout />}
                />
                <Route
                    path='/draggable/drag-static'
                    element={<DraggableDragStaticLayout />}
                />
                <Route
                    path='/draggable/drag-responsive'
                    element={<DraggableDragResponsiveLayout />}
                />

                {/* resizable */}
                <Route
                    path='/resizable/grid-static'
                    element={<ResizableGridStaticLayout />}
                />
                <Route
                    path='/resizable/grid-responsive'
                    element={<ResizableGridResponsiveLayout />}
                />
                <Route
                    path='/resizable/drag-static'
                    element={<ResizableDragStaticLayout />}
                />
                <Route
                    path='/resizable/drag-responsive'
                    element={<ResizableDragResponsiveLayout />}
                />

                {/* drop */}
                <Route
                    path='/drop/drag-static'
                    element={<DropDragStaticLayout />}
                />
                <Route
                    path='/drop/grid-responsive'
                    element={<DropGridResponsiveLayout />}
                />

                <Route path='nested' element={<NestedGridResponsiveLayout />} />
                <Route path='scale' element={<ScaleLayout />} />
                <Route path='ruler' element={<RulerLayout />} />
            </Routes>
        </BrowserRouter>
    );
}

ReactDOM.render(<Router />, document.getElementById('root'));
