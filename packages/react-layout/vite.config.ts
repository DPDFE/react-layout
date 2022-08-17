import { defineConfig } from 'vite';
import * as path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src')
        }
    },
    build: {
        target: 'es2015',
        sourcemap: true,
        cssCodeSplit: true,
        emptyOutDir: false,
        outDir: path.resolve(__dirname, 'dist'),
        lib: {
            entry: path.resolve(__dirname, 'src/index.tsx'),
            name: 'index',
            fileName: (format) => `index.${format}.js`
        },
        rollupOptions: {
            external: ['react', 'react-dom']
        }
    }
});
