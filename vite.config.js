// import globalStyle from '@originjs/vite-plugin-global-style';
import glob from 'glob';
import path from 'path';
// import critical from 'rollup-plugin-critical';
import { defineConfig } from 'vite';
import { imagetools } from 'vite-imagetools';
import viteImagemin from 'vite-plugin-imagemin';
import mkcert from 'vite-plugin-mkcert';
import nunjucks from 'vite-plugin-nunjucks';
import { imageTools, ViteTools } from './vite/vite-tools';

const outDir = 'docs';

export default defineConfig(({ command, mode }) => {
	const config = {
		root: path.join(__dirname, 'src'),
		publicDir: path.join(__dirname, 'src/public'),
		base: '/vite-config/',
		build: {
			outDir: path.join(__dirname, outDir),
			emptyOutDir: true,
			rollupOptions: {
				input: glob.sync(path.resolve(__dirname, 'src', '*.html')),
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
					additionalData: `
						@import './src/css/_variables/main-cssvars';
						@import './src/css/_variables/cssvars';
						@import './src/css/_variables/grid';
						@import './src/css/fonts';
						@import './src/css/mixins';
					`
				}
			}
		},
		plugins: [
			mkcert(),
			nunjucks({
				templatesDir: './src/',
				nunjucksEnvironment: {
					filters: {
						imageTools: {
							filter: imageTools,
							async: true,
						},
					},
					// extensions: {someExtension: SomeExtension}
				}
			}),
			// globalStyle(),

			imagetools({ force: true }),

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
			/*
			critical({
				criticalUrl: path.join(__dirname, `${outDir}/`),
				criticalBase: './critical-css',
				criticalPages: [
					{ uri: 'index.html', template: 'index' },
					{ uri: 'contacts.html', template: 'contacts' },
				],
				criticalConfig: {
					base: path.join(__dirname, `${outDir}/css/`),
					inline: true,
					extract: false,
					width: 600,
					height: 900,
					penthouse: {
						blockJSRequests: false
					}
				},
			}),
			*/

			ViteTools(),

			/*
			...VitePluginNode({
				adapter: 'express',
				// adapter: function (app, req, res) {
				//  app(res, res);
				// },
				appPath: './server/main.js'
			})
			*/
		],
		server: {
			https: false
		},
	};
	if (command === 'serve') {
		return config;
	} else {
		// command === 'build'
		return config;
	}
})

// more info on https://vitejs.dev/config/

/*
const { createServer } = require('vite')

;(async () => {
  const server = await createServer({
    // any valid user config options, plus `mode` and `configFile`
    configFile: false,
    root: __dirname,
    server: {
      port: 1337
    }
  })
  await server.listen()
  server.printUrls()
})()
*/
