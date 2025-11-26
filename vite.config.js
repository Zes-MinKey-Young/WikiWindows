import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import injectCSS from "vite-plugin-css-injected-by-js"
import mwLoaderPlugin from './plugins/mw-loader-plugin'

export default defineConfig({
  plugins: [
    vue(),
    injectCSS(),
    mwLoaderPlugin()  // 移除 enforce 设置，使用默认执行顺序
  ],
  define: {
    'process.env.NODE_ENV': JSON.stringify('production')
  },
  build: {
    minify: false,
    lib: {
      entry: './index.ts',
      name: 'WikiWindows',
      formats: ['iife'],
      fileName: 'wikiwindows'
    },
    rollupOptions: {
      external: ['vue', '@wikimedia/codex', 'jquery'],
      output: {
        globals: {
          'vue': 'Vue',
          '@wikimedia/codex': 'Codex',
          'jquery': '$'
        }
      }
    },
    outDir: 'dist'
  }
})