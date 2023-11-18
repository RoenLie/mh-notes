import { viteCopy } from '@roenlie/package-toolbox/vite-utils';
import { defineConfig } from 'vite';

export default defineConfig({
	root:      './src',
	publicDir: '../public',
	appType:   'spa',
	build:     {
		outDir:        '../dist',
		rollupOptions: {
			input: [
				'./src/index.html',
				'./src/login.html',
			],
		},
	},
	plugins: [
		//
		viteCopy({
			targets: [
				{
					from: './node_modules/@roenlie/mimic-elements/styles',
					to:   './public/vendor/mimic-elements',
				},
			],
			hook:     'config',
			copyOnce: true,
		}),
	],
});
