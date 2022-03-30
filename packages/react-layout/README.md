# react-layout

[![npm-image](https://img.shields.io/npm/v/@dpdfe/react-layout.svg?style=flat-square)](https://www.npmjs.com/package/@dpdfe/react-layout)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Feature

- 支持栅栏化布局响应式效果  
- 支持浮动布局效果  
- 支持混合（栅栏化、浮动）布局效果  
- 支持布局嵌套  
- 支持固定宽高和无限画布两种模式  
- 支持固定宽高修改画布大小、缩放  
- 支持画布滚动  
- 支持画布标尺  
- 支持外部拖拽添加  
- 支持布局元素拖动、放大、缩小、选中 
- 支持浮动布局元素键盘事件  
- 支持画布、元素属性效果自定义

## Install

```bash
npm install --save @dpdfe/react-layout
```

## Usage

文档 https://dpdfe.github.io/react-layout/

```tsx
import React, { Component } from "react";

import { ReactLayout, ReactLayoutContext } from "@dpdfe/react-layout";
import "@dpdfe/react-layout/dist/style.css";

class Example extends Component {
    render() {
        return (
            <ReactLayoutContext>
                <ReactLayout></ReactLayout>
            </ReactLayoutContext>
        );
    }
}
```

## License

MIT © [https://github.com/DPDFE/react-layout](https://github.com/DPDFE/react-layout/blob/main/LICENSE)
