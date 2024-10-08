import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import electron from 'vite-plugin-electron'
import path from 'path'


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    electron([
      {
        entry: 'electron/index.ts',
        vite: {
          build: {
            rollupOptions: {
              external: ['sqlite3'], // 外部模块 sqlite3
            },
          },
        }
      },
      {
        entry: 'electron/preload.ts',
        onstart(options) {
          options.startup()
        },
      }
    ])
  ],
  resolve:{
    alias:{
      "@":path.resolve(__dirname,'./src')
    }
  },
  build: {
    rollupOptions: {
      input: {
        index: path.resolve(__dirname, 'src/views/index/index.html'),
        command: path.resolve(__dirname, 'src/views/command/index.html'),
        list:  path.resolve(__dirname, 'src/views/list/index.html'),
      }
    }
  },
})
