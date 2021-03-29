/* eslint-env node, mocha */
/* eslint-disable prefer-arrow-callback */
"use strict";
const {strictEqual, deepStrictEqual} = require("assert");
const {readdir, readFile} = require("fs/promises");
const {auth, get} = require("./shared");

describe("Logs", function () {
	it("Custom filepaths", async function () {
		const actual = await readdir("/shared");
		deepStrictEqual(actual.sort(), ["custom.access", "custom.error"]);
	});
	it("access_log", async function () {
		const before = await readFile("/shared/custom.access", "utf8");
		/* const response0 = */ await get("http://logs.local/log-root.html");
		/* const response1 = */ await get("http://logs.local/bad.html");
		/* const response2 = */ await get("http://logs.local/200");
		/* const response3 = */ await get("http://logs.local/301");
		/* const response4 = */ await get("http://logs.local/404");
		/* const response5 = */ await get("http://logs.local/500");
		/* const response6 = */ await get("http://logs.local/access-not-logged/log-access.html");
		/* const response7 = */ await get("http://logs.local/access-not-logged/bad.html");
		/* const response8 = */ await get("http://logs.local/error-not-logged/log-error.html");
		/* const response9 = */ await get("http://logs.local/error-not-logged/bad.html");
		/* const response10 =*/ await get("http://logs.local/notfound-not-logged/log-notfound.html");
		/* const response11 =*/ await get("http://logs.local/notfound-not-logged/bad.html");
		const after = await readFile("/shared/custom.access", "utf8");
		const delta = after.substr(before.length);
		strictEqual(delta.includes("GET /200"), true, "Status 200 is logged");
		strictEqual(delta.includes("GET /301"), true, "Status 301 is logged");
		strictEqual(delta.includes("GET /404"), true, "Status 400 is logged");
		strictEqual(delta.includes("GET /500"), true, "Status 500 is logged");
		strictEqual(delta.includes("GET /log-root.html"), true, "(root) File Found is logged");
		strictEqual(delta.includes("GET /bad.html"), true, "(root) File Not Found is logged");
		strictEqual(delta.includes("GET /access-not-logged/log-access.html"), false, "(access_log off) File Found isn't logged");
		strictEqual(delta.includes("GET /access-not-logged/bad.html"), false, "(access_log off) File Not Found isn't logged");
		strictEqual(delta.includes("GET /error-not-logged/log-error.html"), true, "(error_log off) File Found is logged");
		strictEqual(delta.includes("GET /error-not-logged/bad.html"), true, "(error_log off) File Not Found is logged");
		strictEqual(delta.includes("GET /notfound-not-logged/log-notfound.html"), true, "(log_not_found off) File Found is logged");
		strictEqual(delta.includes("GET /notfound-not-logged/bad.html"), true, "(log_not_found off) File Not Found is logged");
	});
	it("error_log", async function () {
		const before = await readFile("/shared/custom.error", "utf8");
		const actual1 = await get("http://logs.local/auth/log-no-credentials.html");
		const actual2 = await auth("http://logs.local/auth/log-bad-username.html", "bad", "bad");
		const actual3 = await auth("http://logs.local/auth/log-bad-password.html", "hello", "bad");
		strictEqual(actual1.statusCode, 401, "No credentials");
		strictEqual(actual2.statusCode, 401, "Bad username");
		strictEqual(actual3.statusCode, 401, "Bad password");
		const after = await readFile("/shared/custom.error", "utf8");
		const delta = after.substr(before.length);
		strictEqual(delta.includes("GET /auth/log-no-credentials.html"), false, "Missing both isn't logged");
		strictEqual(delta.includes("GET /auth/log-bad-username.html"), true, "Wrong username is logged");
		strictEqual(delta.includes(`user "bad" was not found`), true);
		strictEqual(delta.includes("GET /auth/log-bad-password.html"), true, "Missing password is logged");
		strictEqual(delta.includes(`user "hello": password mismatch`), true);
	});
});
