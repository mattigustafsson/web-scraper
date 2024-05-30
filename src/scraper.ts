import axios, { Axios, AxiosError } from "axios";
import { parse, type HTMLElement } from "node-html-parser";

const baseUrl = "https://books.toscrape.com/";
let urlsToVisit: string[] = [];
const tempUrls = new Set<string>();
const visitedUrls = new Set<string>();

export async function getPage(url: string): Promise<void> {
	if (visitedUrls.has(url)) return;

	console.log(url);

	const response = await axios.get(url).catch((error) => {
		return Promise.reject(error);
	});
	visitedUrls.add(url);

	const html = parse(response.data);
	const links = extractURLs(html);

	for (const link of links) {
		const newLink = new URL(link, url).toString();

		if (!visitedUrls.has(newLink)) {
			tempUrls.add(newLink);
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
	const startTime = performance.now();
	urlsToVisit.push(baseUrl);

	while (urlsToVisit.length > 0) {
		urlsToVisit = [...new Set(urlsToVisit)];
		const batch = urlsToVisit.splice(0, 20);

		await Promise.all(
			batch.map(async (link) => {
				await getPage(link).catch((error) => {
					if (axios.isAxiosError(error) && error.response?.status === 404) {
						console.error(`Error 404: Page not found - ${link}`);
					}
				});
			}),
		);
	}
	const endTime = performance.now();
	console.log(`It  took ${endTime - startTime} milliseconds`);
}
