/* eslint-env node, mocha */
/* eslint-disable prefer-arrow-callback */
"use strict";
const {strictEqual} = require("assert");
const {get} = require("./shared");

describe("Redirection", function () {
	it("/redirection", async function () {
		const actual = await get("http://try_files.local/redirection");
		strictEqual(actual.statusCode, 301);
		strictEqual(actual.headers["location"], "http://try_files.local/redirection/");
	});
	it("/redirection/", async function () {
		const actual = await get("http://try_files.local/redirection/");
		strictEqual(actual.statusCode, 403);
	});
	it("/redirection/hello.txt", async function () {
		const actual = await get("http://try_files.local/redirection/hello.txt");
		strictEqual(actual.statusCode, 200);
	});
	it("/@fallback", async function () {
		const actual = await get("http://try_files.local/@fallback");
		strictEqual(actual.statusCode, 404);
	});
	it("/@fallback/", async function () {
		const actual = await get("http://try_files.local/@fallback/");
		strictEqual(actual.statusCode, 404);
	});
	it("/@another", async function () {
		const actual = await get("http://try_files.local/@another");
		strictEqual(actual.statusCode, 301);
		strictEqual(actual.headers["location"], "http://try_files.local/@another/");
	});
	it("/@another/", async function () {
		const actual = await get("http://try_files.local/@another/");
		strictEqual(actual.statusCode, 200);
	});
});

describe("Filenames", function () {
	it("Space: None", async function () {
		const actual = await get("http://try_files.local/filenames/helloworld.html");
		strictEqual(actual.statusCode, 200);
		strictEqual(actual.body, "<html><body>helloworld.html</body></html>\n");
	});
	it("Space: Raw", async function () {
		const actual = await get("http://try_files.local/filenames/hello world.html");
		strictEqual(actual.statusCode, 200);
		strictEqual(actual.body, "<html><body>hello world.html</body></html>\n");
	});
	it("Space: Encoded", async function () {
		const actual = await get("http://try_files.local/filenames/hello%20world.html");
		strictEqual(actual.statusCode, 200);
		strictEqual(actual.body, "<html><body>hello world.html</body></html>\n");
	});
	it("Plus", async function () {
		const actual = await get("http://try_files.local/filenames/hello+world.html");
		strictEqual(actual.statusCode, 200);
		strictEqual(actual.body, "<html><body>hello+world.html</body></html>\n");
	});
	it("Dot", async function () {
		const actual = await get("http://try_files.local/filenames/hello.world.html");
		strictEqual(actual.statusCode, 200);
		strictEqual(actual.body, "<html><body>hello.world.html</body></html>\n");
	});
	it("Accents", async function () {
		const actual = await get("http://try_files.local/filenames/àéèê.html");
		strictEqual(actual.statusCode, 200);
		strictEqual(actual.body, "<html><body>àéèê.html</body></html>\n");
	});
	it("Emojis", async function () {
		const actual = await get("http://try_files.local/filenames/🐳.html");
		strictEqual(actual.statusCode, 200);
		strictEqual(actual.body, "<html><body>🐳.html</body></html>\n");
	});
});

describe("Mimetypes", function () {
	it("HTML", async function () {
		const actual = await get("http://try_files.local/mimetypes/text.html");
		strictEqual(actual.statusCode, 200);
		strictEqual(actual.body, "<html><body>text.html</body></html>\n");
		strictEqual(actual.headers["content-type"], "text/html");
	});
	it("TXT", async function () {
		const actual = await get("http://try_files.local/mimetypes/text.txt");
		strictEqual(actual.statusCode, 200);
		strictEqual(actual.body, "text.txt\n");
		strictEqual(actual.headers["content-type"], "text/plain");
	});
	it("CSS", async function () {
		const actual = await get("http://try_files.local/mimetypes/text.css");
		strictEqual(actual.statusCode, 200);
		strictEqual(actual.body, "/* text.css */\n");
		strictEqual(actual.headers["content-type"], "text/css");
	});
	it("JS", async function () {
		const actual = await get("http://try_files.local/mimetypes/text.js");
		strictEqual(actual.statusCode, 200);
		strictEqual(actual.body, "/* text.js */\n");
		strictEqual(actual.headers["content-type"], "application/javascript");
	});
	it("CSS MAP", async function () {
		const actual = await get("http://try_files.local/mimetypes/text.css.map");
		strictEqual(actual.statusCode, 200);
		strictEqual(actual.body, `{"source": "text.css"}\n`);
		strictEqual(actual.headers["content-type"], "application/json");
	});
	it("JS MAP", async function () {
		const actual = await get("http://try_files.local/mimetypes/text.js.map");
		strictEqual(actual.statusCode, 200);
		strictEqual(actual.body, `{"source": "text.js"}\n`);
		strictEqual(actual.headers["content-type"], "application/json");
	});
	it("JPEG", async function () {
		const actual = await get("http://try_files.local/mimetypes/image.jpg");
		strictEqual(actual.statusCode, 200);
		strictEqual(actual.headers["content-type"], "image/jpeg");
	});
	it("PNG", async function () {
		const actual = await get("http://try_files.local/mimetypes/image.png");
		strictEqual(actual.statusCode, 200);
		strictEqual(actual.headers["content-type"], "image/png");
	});
	it("GIF", async function () {
		const actual = await get("http://try_files.local/mimetypes/image.gif");
		strictEqual(actual.statusCode, 200);
		strictEqual(actual.headers["content-type"], "image/gif");
	});
	it("SVG", async function () {
		const actual = await get("http://try_files.local/mimetypes/image.svg");
		strictEqual(actual.statusCode, 200);
		strictEqual(actual.headers["content-type"], "image/svg+xml");
	});
});
