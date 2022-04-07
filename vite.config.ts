import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
    define: {
        'process.env': process.env
    },
    server: {
        host: true,
        watch: {
            usePolling: true
        }
    },
    css: {
        // css模块化
        modules: {
            generateScopedName: '[name]__[local]___[hash:base64:5]',
            hashPrefix: 'prefix'
        },
        // 预编译支持less
        preprocessorOptions: {
            less: {
                // 支持内联 JavaScript
                javascriptEnabled: true
            }
        }
    },
    plugins: [react()]
});
