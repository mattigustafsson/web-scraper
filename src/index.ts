import { scraper } from "./scraper";

/**
 * Executes the web scraper.
 */
export async function executeScraper(): Promise<void> {
	await scraper();
}

executeScraper().catch(console.error);
