import { exists, mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import axios from "axios";
import { parse } from "node-html-parser";
import { extractURLs, savePageContent } from "./helpers";

const BATCHING_REQUESTS = 10;

const baseUrl = "https://books.toscrape.com/";
let urlsToVisit: string[] = [];
const visitedUrls = new Set<string>();

export async function getPage(url: string): Promise<void> {
	// Retrurn if url is already visited.
	if (visitedUrls.has(url)) return;

	const response = await axios
		.get(url, {
			responseType: url.includes("books.toscrape.com/media/")
				? "arraybuffer"
				: undefined,
		})
		.catch((error) => {
			return Promise.reject(error);
		});
	visitedUrls.add(url);

	const contentType = response.headers["content-type"];
	if (contentType.startsWith("text/html")) {
		const html = parse(response.data);
		const links = extractURLs(html);

		await savePageContent(url, response.data);

		for (const link of links) {
			const newLink = new URL(link, url).toString();

			if (!visitedUrls.has(newLink)) {
				urlsToVisit.push(newLink);
			}
		}
	} else {
		const resourcePath = path.join("scraped_site", new URL(url).pathname);
		await mkdir(path.dirname(resourcePath), {
			recursive: true,
		});
		await writeFile(resourcePath, response.data);
	}
}

export async function scraper() {
	// Remove scraped_site folder if it exists
	if (await exists("scraped_site")) {
		await rm("scraped_site", {
			recursive: true,
		});
	}
	const startTime = performance.now();
	// Add the base url to the list of urls to visit.
	urlsToVisit.push(baseUrl);

	while (urlsToVisit.length > 0) {
		// Remove duplicates
		urlsToVisit = [...new Set(urlsToVisit)];
		// Batch requests
		const batch = urlsToVisit.splice(0, BATCHING_REQUESTS);

		await Promise.all(
			// Execute batched requests in parallel.
			batch.map(async (link) => {
				await getPage(link).catch((error) => {
					// Handle 404 errors, may not be nescessary any more.
					// Got the errors when I was constructing the URLs wrong.
					if (axios.isAxiosError(error) && error.response?.status === 404) {
						console.error(`Error 404: Page not found - ${link}`);
					}
				});
			}),
		);
		// Log progress
		console.log(
			`Seached: ${visitedUrls.size}\nRemaining: ${urlsToVisit.length}`,
		);
	}
	const endTime = performance.now();
	console.log(`It took ${endTime - startTime} milliseconds`);
}
