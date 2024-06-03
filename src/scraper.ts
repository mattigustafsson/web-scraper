import { exists, mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import axios from "axios";
import { parse } from "node-html-parser";
import { extractURLs, savePageContent } from "./helpers";

const BATCHING_REQUESTS = 10;

const baseUrl = "https://books.toscrape.com/";
let urlsToVisit: string[] = [];
const visitedUrls = new Set<string>();

/**
 * This function is responsible for fetching and processing a webpage.
 * It takes a URL as input, fetches the webpage, parses it, and saves the content of the webpage.
 * It also extracts links from the webpage and adds them to a list of URLs to visit.
 * If the webpage is not HTML, it saves the resource.
 *
 * @param {string} url - The URL of the webpage to fetch and process.
 * @returns {Promise<void>} - A promise that resolves when the webpage has been fetched and processed.
 */
export async function getPage(url: string): Promise<void> {
	// Check if the URL has already been visited. If it has, exit the function.
	if (visitedUrls.has(url)) {
		return;
	}

	// Fetch the webpage.
	const response = await axios
		.get(url, {
			responseType: url.includes("books.toscrape.com/media/")
				? "arraybuffer"
				: undefined,
		})
		.catch((error) => {
			return Promise.reject(error); // If there's an error, reject the promise and throw the error.
		});

	// Mark the URL as visited.
	visitedUrls.add(url);

	// Get the content type of the response.
	const contentType = response.headers["content-type"];

	// If the content type is HTML, parse the response data and save the content.
	if (contentType.startsWith("text/html")) {
		const html = parse(response.data); // Parse the response data into an HTML element.
		const links = extractURLs(html);

		await savePageContent(url, response.data);

		for (const link of links) {
			const newLink = new URL(link, url).toString();

			// If the new URL has not been visited, add it to the list of URLs to visit.
			if (!visitedUrls.has(newLink)) {
				urlsToVisit.push(newLink);
			}
		}
	} else {
		const resourcePath = path.join("scraped_site", new URL(url).pathname); // Create the path for the resource.
		await mkdir(path.dirname(resourcePath), {
			recursive: true,
		}); // Create the directory for the resource.
		await writeFile(resourcePath, response.data); // Save the resource.
	}
}

/**
 * Executes the web scraper.
 *
 * Removes the 'scraped_site' folder if it exists, and adds the base URL to the list of URLs to visit.
 *
 * Then, it enters a loop that continues until there are no more URLs to visit.
 * In each iteration, it removes duplicates from the list of URLs to visit,
 * and executes a batch of requests in parallel.
 *
 * After each batch of requests, it logs the number of URLs that have been searched and the number of URLs that still need to be visited.
 *
 * Finally, it logs the total time it took for the scraper to complete.
 */
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

		// Execute batched requests in parallel.
		await Promise.all(
			batch.map(async (link) => {
				try {
					await getPage(link);
				} catch (error) {
					// Handle 404 errors, may not be necessary any more.
					// Got the errors when I was constructing the URLs wrong.
					if (axios.isAxiosError(error) && error.response?.status === 404) {
						console.error(`Error 404: Page not found - ${link}`);
					}
				}
			}),
		);
		// Log progress
		console.log(
			`Searched: ${visitedUrls.size}\nRemaining: ${urlsToVisit.length}`,
		);
	}
	const endTime = performance.now();
	console.log(`It took ${((endTime - startTime) / 1000).toFixed(2)} seconds`);
}
