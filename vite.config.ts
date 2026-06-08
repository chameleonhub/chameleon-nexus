import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig(({mode}) => ({
    build: {
        manifest: true,
        outDir: './frontend/static/frontend',
    },
    base: '/static/frontend',
    plugins: [react()],
    server: {
        proxy: {
            '/nexus-api': {
                target: 'http://localhost:8000/',
                changeOrigin: true,
                secure: false,
                rewrite: path => path.replace(/^\/nexus-api/, '/api'),
            },
            '/api': {
                target: 'http://kf.sharful.me/',
                changeOrigin: true,
                secure: false,
            },
        },
    },
    define: {
        __DEV__: mode === 'development',
    },
}))
