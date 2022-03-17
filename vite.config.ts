const path = require('path');
const { defineConfig } = require('vite');

module.exports = defineConfig({
    root: path.resolve(__dirname, 'src'),
    base: './',
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src')
        }
    },
    globals: { react: 'react' },
    build: {
        outDir: path.resolve(__dirname, 'dist'),
        chunkSizeWarningLimit: 500,
        lib: {
            entry: path.resolve(__dirname, 'src/index.tsx'),
            name: 'index',
            umdModuleIds: { react: 'react' },
            fileName: (format) => `index.${format}.js`
        },
        rollupOptions: {
            external: ['react', 'react-dom']
        }
    }
});
