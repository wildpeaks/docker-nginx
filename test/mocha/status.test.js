/* eslint-env node, mocha */
/* eslint-disable prefer-arrow-callback */
"use strict";
const {strictEqual} = require("assert");
const {auth, get} = require("./shared");

describe("Status", function () {
	it("410 by default", async function () {
		const actual = await get("http://fake.local");
		strictEqual(actual.statusCode, 410);
	});
	it("200", async function () {
		const actual = await get("http://status.local/200");
		strictEqual(actual.statusCode, 200);
		strictEqual(actual.body, "Example 200");
	});
	it("204", async function () {
		const actual = await get("http://status.local/204");
		strictEqual(actual.statusCode, 204);
	});
	it("400", async function () {
		const actual = await get("http://status.local/400");
		strictEqual(actual.statusCode, 400);
		strictEqual(actual.body, "Example 400");
	});
	it("403", async function () {
		const actual = await get("http://status.local/403");
		strictEqual(actual.statusCode, 403);
		strictEqual(actual.body, "Example 403");
	});
	it("404", async function () {
		const actual = await get("http://status.local/404");
		strictEqual(actual.statusCode, 404);
		strictEqual(actual.body, "Example 404");
	});
});


describe("Basic Auth", function () {
	it("Absolute path", async function () {
		const url = "http://status.local/password-absolute/hello.txt";
		const actual1 = await auth(url, "hello", "1234");
		const actual2 = await auth(url, "hello", "bad");
		const actual3 = await auth(url, "bad", "bad");
		const actual4 = await get(url);
		strictEqual(actual1.statusCode, 200, "Good credentials");
		strictEqual(actual2.statusCode, 401, "Bad password");
		strictEqual(actual3.statusCode, 401, "Bad username");
		strictEqual(actual4.statusCode, 401, "No credentials");
		strictEqual(actual1.body, "Absolute OK\n");
	});
	it("Relative to vhost.conf", async function () {
		const url = "http://status.local/password-relative-vhost/hello.txt";
		const actual1 = await auth(url, "hello", "1234");
		const actual2 = await auth(url, "hello", "bad");
		const actual3 = await auth(url, "bad", "bad");
		const actual4 = await get(url);
		strictEqual(actual1.statusCode, 403, "Good credentials");
		strictEqual(actual2.statusCode, 403, "Bad password");
		strictEqual(actual3.statusCode, 403, "Bad username");
		strictEqual(actual4.statusCode, 401, "No credentials");
	});
	it("Relative to /etc/nginx", async function () {
		const url = "http://status.local/password-relative-etc/hello.txt";
		const actual1 = await auth(url, "hello", "1234");
		const actual2 = await auth(url, "hello", "bad");
		const actual3 = await auth(url, "bad", "bad");
		const actual4 = await get(url);
		strictEqual(actual1.statusCode, 200, "Good credentials")
		strictEqual(actual2.statusCode, 401, "Bad password");
		strictEqual(actual3.statusCode, 401, "Bad username");
		strictEqual(actual4.statusCode, 401, "No credentials");
		strictEqual(actual1.body, "Relative Etc OK\n");
	});
	it("Relative to /usr/share/nginx", async function () {
		const url = "http://status.local/password-relative-usr/hello.txt";
		const actual1 = await auth(url, "hello", "1234");
		const actual2 = await auth(url, "hello", "bad");
		const actual3 = await auth(url, "bad", "bad");
		const actual4 = await get(url);
		strictEqual(actual1.statusCode, 200, "Good credentials")
		strictEqual(actual2.statusCode, 401, "Bad password");
		strictEqual(actual3.statusCode, 401, "Bad username");
		strictEqual(actual4.statusCode, 401, "No credentials");
		strictEqual(actual1.body, "Relative Usr OK\n");
	});
});
