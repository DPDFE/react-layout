# react-layout

[![npm-image](https://img.shields.io/npm/v/@dpdfe/react-layout.svg?style=flat-square)](https://www.npmjs.com/package/@dpdfe/react-layout)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Feature

支持栅栏化布局效果
支持浮动布局效果
支持混合（栅栏化、浮动）布局效果
支持响应式效果
支持布局嵌套
支持布局元素拖动、放大、缩小效果
支持外部拖拽添加
支持浮动布局元素键盘事件

## Install

```bash
npm install --save @dpdfe/react-layout
```

## Usage

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
