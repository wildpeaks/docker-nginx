/* eslint-env node, mocha */
/* eslint-disable prefer-arrow-callback */
"use strict";
const {strictEqual} = require("assert");
const {get} = require("./shared");

describe("index", function () {
	it("Root", async function () {
		this.slow(5000);
		this.timeout(5000);
		const actual1 = await get("http://index.local/");
		const actual2 = await get("http://index.local");
		strictEqual(actual1.statusCode, 200);
		strictEqual(actual2.statusCode, 200);
		strictEqual(actual1.body, "<html><body>index.html</body></html>\n");
		strictEqual(actual2.body, "<html><body>index.html</body></html>\n");
		strictEqual(actual1.headers["content-type"], "text/html");
		strictEqual(actual2.headers["content-type"], "text/html");
	});

	it("Subfolder", async function () {
		this.slow(5000);
		this.timeout(5000);

		const actual1 = await get("http://index.local/subfolder1/");
		strictEqual(actual1.statusCode, 200);
		strictEqual(actual1.body, "<html><body>subfolder/index.html</body></html>\n");
		strictEqual(actual1.headers["content-type"], "text/html");

		const actual2 = await get("http://index.local/subfolder1");
		strictEqual(actual2.statusCode, 301);
		strictEqual(actual2.headers["location"], "http://index.local/subfolder1/");
	});

	it("Per-location override", async function () {
		this.slow(5000);
		this.timeout(5000);
		const actual = await get("http://index.local/subfolder2/");
		strictEqual(actual.statusCode, 200);
		strictEqual(actual.body, "<html><body>subfolder2/override.html</body></html>\n");
		strictEqual(actual.headers["content-type"], "text/html");
	});

	it("Multiple values", async function () {
		this.slow(5000);
		this.timeout(5000);
		const actual = await get("http://index.local/subfolder3/");
		strictEqual(actual.statusCode, 200);
		strictEqual(actual.body, "<html><body>subfolder3/fallback.html</body></html>\n");
		strictEqual(actual.headers["content-type"], "text/html");
	});

	it(`Autoindex on`, async function () {
		this.slow(5000);
		this.timeout(5000);
		const actual = await get("http://index.local/subfolder4/");
		strictEqual(actual.statusCode, 200, "Status code");
		strictEqual(String(actual.body).includes(`<a href="file1.html">`), true, "Links to file1");
		strictEqual(String(actual.body).includes(`<a href="file2.html">`), true, "Links to file2");
		strictEqual(actual.headers["content-type"], "text/html");
	});

	it(`Autoindex off`, async function () {
		this.slow(5000);
		this.timeout(5000);
		const actual = await get("http://index.local/subfolder5/");
		strictEqual(actual.statusCode, 403, "Status code");
	});
});
