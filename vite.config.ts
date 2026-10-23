import adapter from '@sveltejs/adapter-node';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		sveltekit({
			adapter: adapter(),
			csrf: {
				trustedOrigins: ['*']
			}
		})
	],
	server: {
		port: 3001,
		host: true
	}
});
