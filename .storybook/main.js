const path = require('path');

module.exports = {
    stories: [
        '../src/stories/*.stories.mdx',
        '../src/stories/*.stories.@(js|jsx|ts|tsx)'
    ],
    addons: [
        '@storybook/addon-links',
        '@storybook/addon-essentials',
        '@storybook/addon-interactions',
        'storybook-addon-code-preview'
    ],
    framework: '@storybook/react',
    core: {
        builder: 'storybook-builder-vite'
    },
    async viteFinal(config) {
        return {
            ...config,
            esbuild: {
                ...config.esbuild,
                jsxInject: `import React from 'react'`
            },
            rollupOptions: {
                ...config.rollupOptions,
                // Externalize deps that shouldn't be bundled
                external: ['react', 'react-dom'],
                output: {
                    // Global vars to use in UMD build for externalized deps
                    globals: {
                        react: 'React',
                        'react-dom': 'ReactDOM'
                    }
                }
            }
        };
    }
};
