/* eslint-env node, mocha */
/* eslint-disable prefer-arrow-callback */
"use strict";
const {strictEqual} = require("assert");
const fetch = require("node-fetch");

describe("Redirection", function () {
	it("/redirection", async function () {
		const actual = await fetch("http://try_files.local/redirection", {redirect: "manual"});
		strictEqual(actual.status, 301);
		strictEqual(actual.headers.get("location"), "http://try_files.local/redirection/");
	});
	it("/redirection/", async function () {
		const actual = await fetch("http://try_files.local/redirection/", {redirect: "manual"});
		strictEqual(actual.status, 403);
	});
	it("/redirection/hello.txt", async function () {
		const actual = await fetch("http://try_files.local/redirection/hello.txt", {redirect: "manual"});
		strictEqual(actual.status, 200);
	});
	it("/@fallback", async function () {
		const actual = await fetch("http://try_files.local/@fallback", {redirect: "manual"});
		strictEqual(actual.status, 404);
	});
	it("/@fallback/", async function () {
		const actual = await fetch("http://try_files.local/@fallback/", {redirect: "manual"});
		strictEqual(actual.status, 404);
	});
	it("/@another", async function () {
		const actual = await fetch("http://try_files.local/@another", {redirect: "manual"});
		strictEqual(actual.status, 301);
		strictEqual(actual.headers.get("location"), "http://try_files.local/@another/");
	});
	it("/@another/", async function () {
		const actual = await fetch("http://try_files.local/@another/", {redirect: "manual"});
		strictEqual(actual.status, 200);
	});
});

describe("Filenames", function () {
	it("Space: None", async function () {
		const actual = await fetch("http://try_files.local/filenames/helloworld.html", {redirect: "manual"});
		strictEqual(actual.status, 200);
		strictEqual(await actual.text(), "<html><body>helloworld.html</body></html>\n");
	});
	it("Space: Raw", async function () {
		const actual = await fetch("http://try_files.local/filenames/hello world.html", {redirect: "manual"});
		strictEqual(actual.status, 200);
		strictEqual(await actual.text(), "<html><body>hello world.html</body></html>\n");
	});
	it("Space: Encoded", async function () {
		const actual = await fetch("http://try_files.local/filenames/hello%20world.html", {redirect: "manual"});
		strictEqual(actual.status, 200);
		strictEqual(await actual.text(), "<html><body>hello world.html</body></html>\n");
	});
	it("Plus", async function () {
		const actual = await fetch("http://try_files.local/filenames/hello+world.html", {redirect: "manual"});
		strictEqual(actual.status, 200);
		strictEqual(await actual.text(), "<html><body>hello+world.html</body></html>\n");
	});
	it("Dot", async function () {
		const actual = await fetch("http://try_files.local/filenames/hello.world.html", {redirect: "manual"});
		strictEqual(actual.status, 200);
		strictEqual(await actual.text(), "<html><body>hello.world.html</body></html>\n");
	});
	it("Accents", async function () {
		const actual = await fetch(encodeURI("http://try_files.local/filenames/àéèê.html"), {redirect: "manual"});
		strictEqual(actual.status, 200);
		strictEqual(await actual.text(), "<html><body>àéèê.html</body></html>\n");
	});
	it("Emojis", async function () {
		const actual = await fetch(encodeURI("http://try_files.local/filenames/🐳.html"), {redirect: "manual"});
		strictEqual(actual.status, 200);
		strictEqual(await actual.text(), "<html><body>🐳.html</body></html>\n");
	});
});

describe("Mimetypes", function () {
	it("HTML", async function () {
		const actual = await fetch("http://try_files.local/mimetypes/text.html", {redirect: "manual"});
		strictEqual(actual.status, 200);
		strictEqual(actual.headers.get("content-type"), "text/html");
		strictEqual(await actual.text(), "<html><body>text.html</body></html>\n");
	});
	it("TXT", async function () {
		const actual = await fetch("http://try_files.local/mimetypes/text.txt", {redirect: "manual"});
		strictEqual(actual.status, 200);
		strictEqual(actual.headers.get("content-type"), "text/plain");
		strictEqual(await actual.text(), "text.txt\n");
	});
	it("CSS", async function () {
		const actual = await fetch("http://try_files.local/mimetypes/text.css", {redirect: "manual"});
		strictEqual(actual.status, 200);
		strictEqual(actual.headers.get("content-type"), "text/css");
		strictEqual(await actual.text(), "/* text.css */\n");
	});
	it("JS", async function () {
		const actual = await fetch("http://try_files.local/mimetypes/text.js", {redirect: "manual"});
		strictEqual(actual.status, 200);
		strictEqual(actual.headers.get("content-type"), "application/javascript");
		strictEqual(await actual.text(), "/* text.js */\n");
	});
	it("CSS MAP", async function () {
		const actual = await fetch("http://try_files.local/mimetypes/text.css.map", {redirect: "manual"});
		strictEqual(actual.status, 200);
		strictEqual(actual.headers.get("content-type"), "application/json");
		strictEqual(await actual.text(), `{"source": "text.css"}\n`);
	});
	it("JS MAP", async function () {
		const actual = await fetch("http://try_files.local/mimetypes/text.js.map", {redirect: "manual"});
		strictEqual(actual.status, 200);
		strictEqual(actual.headers.get("content-type"), "application/json");
		strictEqual(await actual.text(), `{"source": "text.js"}\n`);
	});
	it("JPEG", async function () {
		const actual = await fetch("http://try_files.local/mimetypes/image.jpg", {redirect: "manual"});
		strictEqual(actual.status, 200);
		strictEqual(actual.headers.get("content-type"), "image/jpeg");
	});
	it("PNG", async function () {
		const actual = await fetch("http://try_files.local/mimetypes/image.png", {redirect: "manual"});
		strictEqual(actual.status, 200);
		strictEqual(actual.headers.get("content-type"), "image/png");
	});
	it("GIF", async function () {
		const actual = await fetch("http://try_files.local/mimetypes/image.gif", {redirect: "manual"});
		strictEqual(actual.status, 200);
		strictEqual(actual.headers.get("content-type"), "image/gif");
	});
	it("SVG", async function () {
		const actual = await fetch("http://try_files.local/mimetypes/image.svg", {redirect: "manual"});
		strictEqual(actual.status, 200);
		strictEqual(actual.headers.get("content-type"), "image/svg+xml");
	});
});
