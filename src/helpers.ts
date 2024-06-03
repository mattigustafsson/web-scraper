import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { HTMLElement } from "node-html-parser";

/**
 * Extracts URLs from an HTML element.
 *
 * @param {HTMLElement} html - The HTML element to extract URLs from.
 * @return {string[]} An array of URLs extracted from the HTML element.
 */
export function extractURLs(html: HTMLElement): string[] {
	const urls = [];

	// Extract URLs from anchor tags ('a' elements).
	urls.push(
		...html.querySelectorAll("a").map((data) => {
			// Get the 'href' attribute of the 'a' element and push it to the array.
			return data.getAttribute("href");
		}),
	);

	// Extract URLs from 'link' elements with 'rel' attribute set to 'stylesheet'.
	urls.push(
		...html
			.querySelectorAll('link[rel="stylesheet"]')
			.map((link) => link.getAttribute("href")),
	);

	// Extract URLs from 'script' elements.
	urls.push(
		...html
			.querySelectorAll("script")
			.map((script) => script.getAttribute("src")),
	);

	// Extract URLs from 'img' elements.
	urls.push(
		...html.querySelectorAll("img").map((img) => img.getAttribute("src")),
	);

	// Filter out any falsy values (null, undefined, false, 0, '', NaN) and return the resulting array.
	return urls.filter(Boolean) as string[];
}

/**
 * Saves the page content to a file.
 *
 * @param {string} url - The URL of the page.
 * @param {string} content - The content of the page.
 * @return {Promise<void>} A promise that resolves when the content is saved.
 */
export async function savePageContent(
	url: string,
	content: string,
): Promise<void> {
	const parsedUrl = new URL(url);

	// Create the file path by joining the base directory and the pathname.
	// If the pathname is '/' or ends with '/', add 'index.html' to the path.
	let filePath = path.join("scraped_site", parsedUrl.pathname);
	if (parsedUrl.pathname === "/" || filePath.endsWith("/")) {
		filePath = path.join(filePath, "index.html");
	}

	// Create the directory if it doesn't exist.
	await mkdir(path.dirname(filePath), { recursive: true });

	// Write the content to the file.
	await writeFile(filePath, content);
}
