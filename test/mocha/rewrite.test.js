/* eslint-env node, mocha */
/* eslint-disable prefer-arrow-callback */
"use strict";
const {strictEqual} = require("assert");
const {get} = require("./shared");

describe("rewrite", function () {
	it("http://rewrite.local/add", async function () {
		const response = await get("http://rewrite.local/add");
		strictEqual(response.statusCode, 302);
		strictEqual(response.headers["location"], "http://www.rewrite.local/add");
	});
	it("http://rewrite.local/add/", async function () {
		const response = await get("http://rewrite.local/add/");
		strictEqual(response.statusCode, 302);
		strictEqual(response.headers["location"], "http://www.rewrite.local/add/");
	});
	it("http://www.rewrite.local/remove", async function () {
		const response = await get("http://www.rewrite.local/remove");
		strictEqual(response.statusCode, 302);
		strictEqual(response.headers["location"], "http://rewrite.local/remove");
	});
	it("http://www.rewrite.local/remove/", async function () {
		const response = await get("http://www.rewrite.local/remove/");
		strictEqual(response.statusCode, 302);
		strictEqual(response.headers["location"], "http://rewrite.local/remove/");
	});
});
