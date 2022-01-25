import React, { useState } from 'react';
import { Button, Input, Slider } from 'antd';
import { ReactDragLayout, LayoutType } from 'react-drag-layout';
import 'react-drag-layout/dist/index.css';
import 'antd/dist/antd.css';

const App = () => {
  const [width, setWidth] = useState<number | string>(1980);
  const [height, setHeight] = useState<number | string>(2000);
  const [scale, setScale] = useState<number>(1);

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
        <span>高度(px)：</span>
        <Input
          style={{ marginRight: 10, width: 150 }}
          value={height}
          onChange={(e) => {
            setHeight(parseInt(e.target.value));
          }}
        ></Input>
        <span>宽度(px)：</span>
        <Input
          value={width}
          style={{ marginRight: 10, width: 150 }}
          onChange={(e) => {
            setWidth(parseInt(e.target.value));
          }}
        ></Input>
        <span>缩放(100%)：</span>
        <Slider
          value={scale}
          style={{ marginRight: 10, width: 150 }}
          step={0.04}
          min={0}
          max={2}
          onChange={setScale}
        />
      </div>

      <ReactDragLayout
        width={width}
        height={height}
        scale={scale}
        mode={LayoutType.edit}
      ></ReactDragLayout>
    </div>
  );
};

export default App;
