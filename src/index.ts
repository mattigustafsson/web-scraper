import { scraper } from "./scraper";

async function run() {
	await scraper();
}

run().catch(console.error);
