import { createFilter } from '@rollup/pluginutils';
import fs from 'fs';
import { applyTransforms, builtinOutputFormats, builtins, extractEntries, generateImageID, generateTransforms, loadImage, parseURL, resolveConfigs } from 'imagetools-core';
import path from 'path';

let currentConfig;
let currentCommand;

const outputs = new Map();

const imageTools_ = async (imagePath) => {
	const filter = createFilter('**/*.{heic,heif,avif,jpeg,jpg,png,tiff,webp,gif}?*', 'public/**/*');
	// console.log(imagePath);
	if (filter) {
		const transformFactories = builtins;
		const outputFormats = builtinOutputFormats;
		const srcURL = parseURL(imagePath);
		const directives = srcURL.searchParams;
		const parameters = extractEntries(directives);
		// console.log(srcURL, parameters);
		const imageConfigs = resolveConfigs(parameters, outputFormats);
		const src = path.join(currentConfig.root, srcURL.pathname);
		const img = loadImage(decodeURIComponent(src));
		const ids = [];
		const metadatas = [];
		for (const config of imageConfigs) {
			const id = generateImageID(srcURL, config);
			// console.log(id);
			if (!outputs.has(id)) {
				const { transforms } = generateTransforms(config, transformFactories);
				const { image, metadata } = await applyTransforms(transforms, img.clone());
				// console.log('pathname', srcURL.pathname);
				const folderName = path.dirname(imagePath); // path.basename(path.dirname(srcURL.pathname));
				const fileName = `${path.basename(srcURL.pathname, path.extname(srcURL.pathname))}_${metadata.width}x${metadata.height}.${metadata.format}`;
				const filePath = path.join(currentConfig.build.outDir, folderName, fileName);
				const outputFolder = path.join(currentConfig.build.outDir, folderName);
				const outputUrl = currentCommand === 'serve' ? `/@tools:${id}` : path.join(folderName, fileName);
				// console.log(imagePath, path.dirname(imagePath));
				// console.log('fileName', fileName);
				// console.log(srcURL.searchParams);
				metadata.src = outputUrl;
				metadata.image = image;
				metadatas.push(metadata);
				outputs.set(id, {
					id,
					image,
					fileName,
					folderName,
					filePath,
					outputFolder,
					outputUrl,
					metadata,
				});
			}
			ids.push(id);
		}
		/*
		let outputFormat = urlFormat();
		for (const [key, format] of Object.entries(outputFormats)) {
			if (srcURL.searchParams.has(key)) {
				let params = srcURL.searchParams.get(key);
				params = params ? params.split(';').filter((v) => !!v) : null;
				outputFormat = format(params.length ? params : undefined);
				break;
			}
		}
		const output = outputFormat(metadatas);
		console.log('output', output, imagePath);
		*/
		// console.log('ids', ids);
		// console.log('metadatas', metadatas);
		if (ids.length === 1) {
			const id = ids[0];
			const output = outputs.get(id);
			return output.outputUrl;
		} else if (ids.length > 1) {
			const srcset = ids.map(id => {
				const output = outputs.get(id);
				const w = output.metadata.width;
				const src = output.outputUrl;
				return `${src} ${w}w`;
			}).join(', ');
			const sizes = ids.map((id, i) => {
				const output = outputs.get(id);
				const w = output.metadata.width;
				return i < ids.length - 1 ? `(max-width: ${w}px) ${w}px` : `${w}px`;
			}).join(', ');
			const src = ids.reduce((p, id) => {
				const output = outputs.get(id);
				const c = { w: output.metadata.width, src: output.outputUrl };
				return (p === null || p.w > c.w) ? c : p;
			}, null).src;
			return `${srcset}" sizes="${sizes}" src="${src}`;
/* <img
	srcset="src480w.jpg 480w, src800w.jpg 800w"
	sizes="(max-width: 600px) 480px, 800px"
	src="src800w.jpg"
> */
		} else {
			return imagePath;
		}
	} else {
		return imagePath;
	}
}

export const imageTools = (imagePath, callback) => {
	imageTools_(imagePath).then(newPath => {
		// console.log('newPath', newPath);
		callback(null, newPath);
		// callback(null, 'https://via.placeholder.com/1600x800');
	});
}

export const ViteTools = () => ({
	name: 'vite-tools',
	config(config, { command }) {
		// console.log('ViteTools config', config);
		currentConfig = config;
		// console.log('ViteTools command', command);
		currentCommand = command;
		/*
		if (command === 'build') {
			config.root = __dirname
		}
		*/
	},
	closeBundle() {
		if (currentCommand === 'serve') {
			return;
		}
		for (const output of outputs.values()) {
			if (!fs.existsSync(output.outputFolder)) {
				fs.mkdirSync(output.outputFolder, { recursive: true });
			}
			output.image.toFile(output.filePath).then(info => {
				// console.log(info);
			}).catch(err => {
				console.log('ViteTools', err);
			});
		}
	},
	configureServer(server) {
		server.middlewares.use(async (req, res, next) => {
			if (req.url.indexOf('@tools:') !== -1) {
				const id = req.url.split('@tools:').pop();
				if (outputs.has(id)) {
					// console.log('serving generated image', id);
					const output = outputs.get(id);
					// res.setHeader('Content-Type', `image/${getMetadata(output.image, 'format')}`);
					res.setHeader('Content-Type', `image/${output.metadata.format}`);
					res.setHeader('Cache-Control', 'max-age=360000');
					return output.image.clone().pipe(res);
				} else {
					console.log('image not found', id);
				}
			}
			/*
			function resolve(image) {
				if (!image) {
					throw new Error(`vite-imagetools cannot find image with id '${id}' this is likely an internal error`)
				}
				res.setHeader('Content-Type', `image/${getMetadata(image, 'format')}`);
				res.setHeader('Cache-Control', 'max-age=360000');
				return image.clone().pipe(res);
			}
			if (req.url && req.url.indexOf('?') !== -1 && filter(req.url)) {
				return load(req.url).then(image => {
					// const paths = req.url.split('?');
					// const src = paths[0];
					return resolve(image);
				});
				// return await load(req.url).then(image => resolve(image));
			} else if (req.url && req.url.startsWith('/@imagetools/')) {
				const [, id] = req.url.split('/@imagetools/');
				const image = outputs.get(id);
				return resolve(image);
			}
			*/
			next();
		});
	}
});





/*
const imageTools = async (imagePath) => {
	// console.log('imageTools', imagePath);
	imagePath = path.join('./src', imagePath);

	// loadImageFromDisk is a utility function that creates a sharp instances of the specified image
	const image = loadImage(imagePath.split('?')[0]);

	// our image configuration
	const config = {
		width: '1600',
		height: '800',
		format: 'webp'
	}

	// This function takes our config and an array of transformFactories and creates an array of transforms
	// the resulting array of transforms can be cached
	const { transforms, warnings } = generateTransforms(config, builtins);

	// apply the transforms and transform the given image
	const { image: transformedImage, metadata } = await applyTransforms(transforms, image);
	// console.log(transformedImage, metadata);
	return imagePath;
}
*/
