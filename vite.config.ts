import { fileURLToPath, URL } from 'node:url'
import path from 'node:path'
import process from 'node:process'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import VueDevTools from 'vite-plugin-vue-devtools'
import MockDevServerPlugin from 'vite-plugin-mock-dev-server'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    vue(),
    VueDevTools(),
    MockDevServerPlugin({
      include: 'mock/**/*.mock.{ts,js,cjs,mjs,json,json5}',
      formidableOptions: {
        uploadDir: path.join(process.cwd(), 'mock/uploads')
      }
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  // define 注入的变量， 在 mock文件中也可以使用
  define: {
    __IS_DEVELOPMENT__: JSON.stringify(mode === 'development')
  },
  server: {
    // 在 proxy 中配置的 代理前缀， mock-dev-server 才会拦截并 mock
    proxy: {
      '^/api': {
        // target: 'http://example.com'
        target: ''
      }
    }
  }
}))
