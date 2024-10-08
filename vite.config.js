import { defineConfig } from "vite";
import postcssNested from "postcss-nested";
import glsl from "vite-plugin-glsl";

export default defineConfig({
	server: {
		port: 3000,
	},
	plugins: [glsl()],
	css: {
		postcss: {
			plugins: [postcssNested],
		},
	},
});
