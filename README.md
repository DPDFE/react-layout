# react-layout

[![npm-image](https://img.shields.io/npm/v/@dpdfe/react-layout.svg?style=flat-square)](https://www.npmjs.com/package/@dpdfe/react-layout)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save @dpdfe/react-layout
```

## Usage

```tsx
import React, { Component } from 'react';

import { ReactLayout, ReactLayoutContext } from '@dpdfe/react-layout';
import '@dpdfe/react-layout/dist/style.css';

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
