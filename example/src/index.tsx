import './index.css';

import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import DefaultLayout from './demo/default';
import DragLayout from './demo/drag';
import DropLayout from './demo/drop';
import GridLayout from './demo/grid';
import MixinLayout from './demo/mixin';
import NestedLayout from './demo/nest';
import ResizeLayout from './demo/resize';
import ScaleLayout from './demo/scale';
import RulerLayout from './demo/ruler';

function Router() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path='/' element={<DefaultLayout />} />
                <Route path='drag' element={<DragLayout />} />
                <Route path='drop' element={<DropLayout />} />
                <Route path='grid' element={<GridLayout />} />
                <Route path='mixin' element={<MixinLayout />} />
                <Route path='nested' element={<NestedLayout />} />
                <Route path='resize' element={<ResizeLayout />} />
                <Route path='scale' element={<ScaleLayout />} />
                <Route path='ruler' element={<RulerLayout />} />
            </Routes>
        </BrowserRouter>
    );
}

ReactDOM.render(<Router />, document.getElementById('root'));
