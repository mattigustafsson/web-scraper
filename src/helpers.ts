import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { HTMLElement } from "node-html-parser";

export function extractURLs(html: HTMLElement): string[] {
	const urls = [];
	urls.push(
		...html.querySelectorAll("a").map((data) => {
			return data.getAttribute("href");
		}),
	);
	urls.push(
		...html
			.querySelectorAll('link[rel="stylesheet"]')
			.map((link) => link.getAttribute("href")),
	);
	urls.push(
		...html
			.querySelectorAll("script")
			.map((script) => script.getAttribute("src")),
	);
	urls.push(
		...html.querySelectorAll("img").map((img) => img.getAttribute("src")),
	);

	return urls.filter(Boolean) as string[];
}

export async function savePageContent(
	url: string,
	content: string,
): Promise<void> {
	const parsedUrl = new URL(url);
	let filePath = path.join("scraped_site", parsedUrl.pathname);

	if (parsedUrl.pathname === "/" || filePath.endsWith("/")) {
		filePath = path.join(filePath, "index.html");
	}

	await mkdir(path.dirname(filePath), { recursive: true });
	await writeFile(filePath, content);
}
