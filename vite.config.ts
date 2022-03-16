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
    build: {
        outDir: path.resolve(__dirname, 'dist'),
        minify: true,
        chunkSizeWarningLimit: 500,
        lib: {
            entry: path.resolve(__dirname, 'src/index.tsx'),
            name: 'index',
            fileName: (format) => `index.${format}.js`
        }
    }
});
