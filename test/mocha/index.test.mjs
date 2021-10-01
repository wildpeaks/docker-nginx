/* eslint-env node, mocha */
import {strictEqual} from "assert";
import fetch from "node-fetch";

describe("index", function () {
	it("Root", async function () {
		const actual1 = await fetch("http://index.local/", {redirect: "manual"});
		const actual2 = await fetch("http://index.local", {redirect: "manual"});
		strictEqual(actual1.status, 200);
		strictEqual(actual2.status, 200);
		strictEqual(actual1.headers.get("content-type"), "text/html");
		strictEqual(actual2.headers.get("content-type"), "text/html");
		strictEqual(await actual1.text(), "<html><body>index.html</body></html>\n");
		strictEqual(await actual2.text(), "<html><body>index.html</body></html>\n");
	});

	it("Subfolder", async function () {
		const actual1 = await fetch("http://index.local/subfolder1/", {redirect: "manual"});
		strictEqual(actual1.status, 200);
		strictEqual(actual1.headers.get("content-type"), "text/html");
		strictEqual(await actual1.text(), "<html><body>subfolder/index.html</body></html>\n");

		const actual2 = await fetch("http://index.local/subfolder1", {redirect: "manual"});
		strictEqual(actual2.status, 301);
		strictEqual(actual2.headers.get("location"), "http://index.local/subfolder1/");
	});

	it("Per-location override", async function () {
		const actual = await fetch("http://index.local/subfolder2/", {redirect: "manual"});
		strictEqual(actual.status, 200);
		strictEqual(actual.headers.get("content-type"), "text/html");
		strictEqual(await actual.text(), "<html><body>subfolder2/override.html</body></html>\n");
	});

	it("Multiple values", async function () {
		const actual = await fetch("http://index.local/subfolder3/", {redirect: "manual"});
		strictEqual(actual.status, 200);
		strictEqual(actual.headers.get("content-type"), "text/html");
		strictEqual(await actual.text(), "<html><body>subfolder3/fallback.html</body></html>\n");
	});

	it(`Autoindex on`, async function () {
		const actual = await fetch("http://index.local/subfolder4/", {redirect: "manual"});
		strictEqual(actual.status, 200, "Status code");
		strictEqual(actual.headers.get("content-type"), "text/html");
		const body = await actual.text();
		strictEqual(body.includes(`<a href="file1.html">`), true, "Links to file1");
		strictEqual(body.includes(`<a href="file2.html">`), true, "Links to file2");
	});

	it(`Autoindex off`, async function () {
		const actual = await fetch("http://index.local/subfolder5/", {redirect: "manual"});
		strictEqual(actual.status, 403, "Status code");
	});
});
