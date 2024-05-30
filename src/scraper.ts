import { mkdir, writeFile, exists, rm } from "node:fs/promises";
import path from "node:path";
import axios, { Axios, AxiosError } from "axios";
import { type HTMLElement, parse } from "node-html-parser";

const BATCHING_REQUESTS = 20;

const baseUrl = "https://books.toscrape.com/";
let urlsToVisit: string[] = [];
const visitedUrls = new Set<string>();

async function savePageContent(url: string, content: string): Promise<void> {
	const parsedUrl = new URL(url);
	let filePath = path.join("scraped_site", parsedUrl.pathname);

	if (parsedUrl.pathname === "/") {
		filePath = path.join("scraped_site", "index.html");
	} else if (filePath.endsWith("/")) {
		filePath = path.join(filePath, "index.html");
	}

	await mkdir(path.dirname(filePath), {
		recursive: true,
	});
	await writeFile(
		filePath.endsWith("/") ? path.join(filePath, "index.html") : filePath,
		content,
	);
}

export async function getPage(url: string): Promise<void> {
	if (visitedUrls.has(url)) return;

	console.log(url);

	const response = await axios.get(url).catch((error) => {
		return Promise.reject(error);
	});
	visitedUrls.add(url);

	const html = parse(response.data);
	const links = extractURLs(html);

	await savePageContent(url, response.data);

	for (const link of links) {
		const newLink = new URL(link, url).toString();

		if (!visitedUrls.has(newLink)) {
			urlsToVisit.push(newLink);
		}
	}
}

function extractURLs(html: HTMLElement): string[] {
	let urls: string[] = [];
	const tags = html.querySelectorAll("a");

	urls = tags
		.map((data) => {
			return data.getAttribute("href");
		})
		.filter((href): href is string => {
			return !!href;
		});

	return urls;
}

export async function scraper() {
	if (await exists("scraped_site")) {
		await rm("scraped_site", {
			recursive: true,
		});
	}
	const startTime = performance.now();
	urlsToVisit.push(baseUrl);

	while (urlsToVisit.length > 0) {
		urlsToVisit = [...new Set(urlsToVisit)];
		const batch = urlsToVisit.splice(0, BATCHING_REQUESTS);

		await Promise.all(
			batch.map(async (link) => {
				await getPage(link).catch((error) => {
					if (axios.isAxiosError(error) && error.response?.status === 404) {
						console.error(`Error 404: Page not found - ${link}`);
					}
				});
			}),
		);
		console.log(`Seached ${visitedUrls.size} of ${urlsToVisit.length}`);
	}
	const endTime = performance.now();
	console.log(`It  took ${endTime - startTime} milliseconds`);
}
