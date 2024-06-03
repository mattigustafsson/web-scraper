import { describe, expect, it } from "bun:test";
import { parse } from "node-html-parser";
import { extractURLs } from "../src/helpers";

describe("extractURLs", () => {
	it("should return an empty array when given an empty HTML element", () => {
		const html = document.createElement("div").toString();
		const result = extractURLs(parse(html));
		expect(result).toEqual([]);
	});

	it("should return an array of URLs extracted from anchor tags ('a' elements)", () => {
		const html = document.createElement("div");
		html.innerHTML = `
      <a href="https://example.com">Example 1</a>
      <a href="https://example.com/page2">Example 2</a>
    `;
		const result = extractURLs(parse(html.toString()));
		expect(result).toEqual([
			"https://example.com",
			"https://example.com/page2",
		]);
	});

	it("should return an array of URLs extracted from 'link' elements with 'rel' attribute set to 'stylesheet'", () => {
		const html = document.createElement("div");
		html.innerHTML = `
      <link rel="stylesheet" href="https://example.com/styles.css">
      <link rel="stylesheet" href="https://example.com/other.css">
    `;
		const result = extractURLs(parse(html.toString()));
		expect(result).toEqual([
			"https://example.com/styles.css",
			"https://example.com/other.css",
		]);
	});

	it("should return an array of URLs extracted from 'script' elements", () => {
		const html = document.createElement("div");
		html.innerHTML = `
      <script src="https://example.com/script1.js"></script>
      <script src="https://example.com/script2.js"></script>
    `;
		const result = extractURLs(parse(html.toString()));
		expect(result).toEqual([
			"https://example.com/script1.js",
			"https://example.com/script2.js",
		]);
	});

	it("should return an array of URLs extracted from 'img' elements", () => {
		const html = document.createElement("div");
		html.innerHTML = `
      <img src="https://example.com/image1.jpg">
      <img src="https://example.com/image2.jpg">
    `;
		const result = extractURLs(parse(html.toString()));
		expect(result).toEqual([
			"https://example.com/image1.jpg",
			"https://example.com/image2.jpg",
		]);
	});

	it("should filter out any falsy values and return the resulting array", () => {
		const html = document.createElement("div");
		html.innerHTML = `
      <a href="https://example.com">Example 1</a>
      <a href="https://example.com/page2">Example 2</a>
      <link rel="stylesheet" href="https://example.com/styles.css">
      <link rel="stylesheet" href="https://example.com/other.css">
      <script src="https://example.com/script1.js"></script>
      <script src="https://example.com/script2.js"></script>
      <img src="https://example.com/image1.jpg">
      <img src="https://example.com/image2.jpg">
    `;
		const result = extractURLs(parse(html.toString()));
		expect(result).toEqual([
			"https://example.com",
			"https://example.com/page2",
			"https://example.com/styles.css",
			"https://example.com/other.css",
			"https://example.com/script1.js",
			"https://example.com/script2.js",
			"https://example.com/image1.jpg",
			"https://example.com/image2.jpg",
		]);
	});
});
