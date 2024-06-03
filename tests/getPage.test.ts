import { describe, expect, it } from "bun:test";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";

import { getPage } from "../src/scraper";

const mock = new MockAdapter(axios);

describe("getPage", () => {
	it("should fetch and return page content", async () => {
		const url = "https://example.com";
		const data = "<html><body>Hello, world!</body></html>";

		mock.onGet(url).reply(200, data, { "content-type": "text/html" });

		const result = await getPage(url);
		expect(result).toBe(undefined);
	});

	it("should throw an error if the request fails", async () => {
		const url = "https://example.com/fail";

		mock.onGet(url).reply(400);

		expect(getPage(url)).rejects.toThrow();
	});

	it("should return empty when same url is called twice", async () => {
		const url = "https://example.com";

		mock.onGet(url).reply(200);

		const result = await getPage(url);
		expect(result).toBe(undefined);
	});
});
