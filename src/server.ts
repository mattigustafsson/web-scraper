import { join } from "node:path";

const srcPath = join(__dirname, "../scraped_site");

const server = Bun.serve({
	async fetch(request) {
		const requestedPath = new URL(request.url).pathname;
		const filePath = join(srcPath, requestedPath);
		const fileResponse = new Response(Bun.file(filePath));

		if (requestedPath === "/") {
			return new Response(Bun.file(join(srcPath, "index.html")));
		}

		return fileResponse;
	},
});
console.log(`Listening on ${server.url}`);
