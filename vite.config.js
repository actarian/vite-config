// import globalStyle from '@originjs/vite-plugin-global-style';
import glob from "glob";
import path from "path";
import { defineConfig } from 'vite';
import viteImagemin from 'vite-plugin-imagemin';
import mkcert from 'vite-plugin-mkcert';
import nunjucks from 'vite-plugin-nunjucks';

// https://vitejs.dev/config/
export default defineConfig({
  root: path.join(__dirname, "src"),
  base: '/vite-config/',
  build: {
    outDir: path.join(__dirname, "dist"),
    emptyOutDir: true,
    rollupOptions: {
      input: glob.sync(path.resolve(__dirname, "src", "*.html")),
      /*
      input: {
        main: resolve(__dirname, 'src/index.html'),
        contacts: resolve(__dirname, 'src/contacts.html')
      },
      */
      output: {
        entryFileNames: `js/[name].js`,
        chunkFileNames: `js/[name].js`,
        assetFileNames: `assets/[name].[ext]`
      }
    },
    minify: 'esbuild',
    manifest: true,
  },
  css: {
    preprocessorOptions: {
      scss: {
        // additionalData: `@import "./src/css/variables";`
      }
    }
  },
  server: {
    https: true
  },
  plugins: [
    mkcert(),
    nunjucks({
      templatesDir: './src/'
    }),
    // globalStyle(),
    viteImagemin({
      gifsicle: {
        optimizationLevel: 7,
        interlaced: false,
      },
      optipng: {
        optimizationLevel: 7,
      },
      mozjpeg: {
        quality: 20,
      },
      pngquant: {
        quality: [0.8, 0.9],
        speed: 4,
      },
      svgo: {
        plugins: [
          {
            name: 'removeViewBox',
          },
          {
            name: 'removeEmptyAttrs',
            active: false,
          },
        ],
      },
    }),
  ]
})

/*
export default {
    plugins: [
        nunjucks(),
        globalStyle(
        )
    ]
}
*/
