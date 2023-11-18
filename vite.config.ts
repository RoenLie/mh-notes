import { viteCopy } from '@roenlie/package-toolbox/vite-utils';
import { defineConfig } from 'vite';

export default defineConfig({
	base:      '/mh-notes',
	root:      './src',
	publicDir: '../public',
	appType:   'spa',
	define:    {
		VITE_BASE_URL: JSON.stringify('/mh-notes'),
	},
	build: {
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
