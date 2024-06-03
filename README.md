# Web Scraper and Local Server Project

This project is a web scraper that traverses all pages on `https://books.toscrape.com/`, downloads and saves all files (pages, images, CSS, fonts) to disk while keeping the file structure, and serves the scraped site locally using Bun.

## Project Structure

- `scraper.ts`: Contains the web scraping logic to download pages and resources.
- `server.ts`: Sets up a local server to serve the scraped site.
- `index.ts`: Entry point for running the scraper and server.

## Prerequisites

- [Bun](https://bun.sh/) (Ensure you have Bun installed)
- Node.js (for any additional libraries or tools)

## Installation

1. Clone the repository:
  ```sh
  git clone https://github.com/mattigustafsson/web-scraper.git
  cd web-scraper
  ```
  

2. Install dependencies:
  ```sh
  bun install
  ```

3. Run the web scraper:
  ```sh
  bun run scrape
  ```

4. Start the server:
  ```sh
  bun run server
  ```

5. Open your browser and navigate to http://localhost:3000 to see the scraped site.

## Tests

  To run test:

  ```sh
  bun test
  ```
