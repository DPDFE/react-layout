# react-layout

[![NPM](https://www.npmjs.com/package/@dpdfe/react-layout)](https://www.npmjs.com/package/@dpdfe/react-layout) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save @dpdfe/react-layout
```

## Usage

```tsx
import React, { Component } from 'react';

import { ReactLayout, ReactLayoutContext } from '@dpdfe/react-layout';
import '@dpdfe/react-layout/dist/index.css';

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

MIT © [https://github.com/DPDFE/react-layout/blob/main/LICENSE](https://github.com/DPDFE/react-layout/blob/main/LICENSE)
