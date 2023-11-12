import { readFileSync } from 'fs';
import { defineConfig, type Plugin } from 'vite';


export default defineConfig({
	root:      './src',
	publicDir: '../public',
	appType:   'mpa',
	build:     {
		outDir:        '../dist',
		rollupOptions: {
			input: [
				'./src/index.html',
				'./src/login.html',
			],
		},
	},
	plugins: [ ],
});
