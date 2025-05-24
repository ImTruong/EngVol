import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    proxy: {
      '/admin': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false
      }
      ,
      '/user': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,    
      },
      '/set': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false
      },
      '/word': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false
      },
      '/class': {
        target: 'http://localhost:8080', 
        changeOrigin: true,
        secure: false
      },
      '/notification': {
        target: 'http://localhost:8080', 
        changeOrigin: true,
        secure: false
      },
      '/study': {
        target: 'http://localhost:8080', 
        changeOrigin: true,
        secure: false
      },
      '/set-request': {
        target: 'http://localhost:8080', 
        changeOrigin: true,
        secure: false
      },
      '/api/meaning': {
        target: 'https://api.dictionaryapi.dev',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/meaning/, '/api/v2/entries/en')
      },
    }
  }
})
