import React, { useState } from 'react';
import { Button, Input, Slider } from 'antd';
import { ReactDragLayout } from 'react-drag-layout';
import 'react-drag-layout/dist/index.css';
import 'antd/dist/antd.css';

const App = () => {
  const [width, setWidth] = useState<number | string>('100%');
  const [height, setHeight] = useState<number | string>('100%');
  const [scale, setScale] = useState<number>(0.5);

  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <div
        style={{
          display: 'flex',
          height: '50px',
          justifyContent: 'center',
          alignItems: 'center',
          background: '#ddd',
          marginBottom: 10
        }}
      >
        <Button type='primary' style={{ marginRight: 10 }}>
          拖拽添加
        </Button>
        <span>高度：</span>
        <Input
          style={{ marginRight: 10, width: 150 }}
          onChange={(e) => {
            setHeight(e.target.value);
          }}
        ></Input>
        <span>宽度：</span>
        <Input
          style={{ marginRight: 10, width: 150 }}
          onChange={(e) => {
            setWidth(e.target.value);
          }}
        ></Input>
        <span>缩放(100%)：</span>
        <Slider
          style={{ marginRight: 10, width: 150 }}
          step={1}
          min={0}
          max={100}
          onChange={setScale}
        />
      </div>

      <ReactDragLayout
        width={width}
        height={height}
        scale={scale}
      ></ReactDragLayout>
    </div>
  );
};

export default App;
