/* eslint-env node, mocha */
import {strictEqual} from "assert";
import fetch from "node-fetch";

describe("Status", function () {
	it("410 by default", async function () {
		const actual = await fetch("http://fake.local", {redirect: "manual"});
		strictEqual(actual.status, 410);
	});
	it("200", async function () {
		const actual = await fetch("http://status.local/200", {redirect: "manual"});
		strictEqual(actual.status, 200);
		strictEqual(await actual.text(), "Example 200");
	});
	it("204", async function () {
		const actual = await fetch("http://status.local/204", {redirect: "manual"});
		strictEqual(actual.status, 204);
	});
	it("400", async function () {
		const actual = await fetch("http://status.local/400", {redirect: "manual"});
		strictEqual(actual.status, 400);
		strictEqual(await actual.text(), "Example 400");
	});
	it("403", async function () {
		const actual = await fetch("http://status.local/403", {redirect: "manual"});
		strictEqual(actual.status, 403);
		strictEqual(await actual.text(), "Example 403");
	});
	it("404", async function () {
		const actual = await fetch("http://status.local/404", {redirect: "manual"});
		strictEqual(actual.status, 404);
		strictEqual(await actual.text(), "Example 404");
	});
});

describe("Basic Auth", function () {
	it("Absolute path", async function () {
		const url = "http://status.local/password-absolute/hello.txt";
		const actual1 = await fetch(url, {
			redirect: "manual",
			headers: {
				"Authorization": "Basic " + Buffer.from("hello:1234").toString("base64")
			}
		});
		const actual2 = await fetch(url, {
			redirect: "manual",
			headers: {
				"Authorization": "Basic " + Buffer.from("hello:bad").toString("base64")
			}
		});
		const actual3 = await fetch(url, {
			redirect: "manual",
			headers: {
				"Authorization": "Basic " + Buffer.from("bad:bad").toString("base64")
			}
		});
		const actual4 = await fetch(url, {redirect: "manual"});
		strictEqual(actual1.status, 200, "Good credentials");
		strictEqual(actual2.status, 401, "Bad password");
		strictEqual(actual3.status, 401, "Bad username");
		strictEqual(actual4.status, 401, "No credentials");
		strictEqual(await actual1.text(), "Absolute OK\n");
	});
	it("Relative to vhost.conf", async function () {
		const url = "http://status.local/password-relative-vhost/hello.txt";
		const actual1 = await fetch(url, {
			redirect: "manual",
			headers: {
				"Authorization": "Basic " + Buffer.from("hello:1234").toString("base64")
			}
		});
		const actual2 = await fetch(url, {
			redirect: "manual",
			headers: {
				"Authorization": "Basic " + Buffer.from("hello:bad").toString("base64")
			}
		});
		const actual3 = await fetch(url, {
			redirect: "manual",
			headers: {
				"Authorization": "Basic " + Buffer.from("bad:bad").toString("base64")
			}
		});
		const actual4 = await fetch(url, {redirect: "manual"});
		strictEqual(actual1.status, 403, "Good credentials");
		strictEqual(actual2.status, 403, "Bad password");
		strictEqual(actual3.status, 403, "Bad username");
		strictEqual(actual4.status, 401, "No credentials");
	});
	it("Relative to /etc/nginx", async function () {
		const url = "http://status.local/password-relative-etc/hello.txt";
		const actual1 = await fetch(url, {
			redirect: "manual",
			headers: {
				"Authorization": "Basic " + Buffer.from("hello:1234").toString("base64")
			}
		});
		const actual2 = await fetch(url, {
			redirect: "manual",
			headers: {
				"Authorization": "Basic " + Buffer.from("hello:bad").toString("base64")
			}
		});
		const actual3 = await fetch(url, {
			redirect: "manual",
			headers: {
				"Authorization": "Basic " + Buffer.from("bad:bad").toString("base64")
			}
		});
		const actual4 = await fetch(url, {redirect: "manual"});
		strictEqual(actual1.status, 200, "Good credentials")
		strictEqual(actual2.status, 401, "Bad password");
		strictEqual(actual3.status, 401, "Bad username");
		strictEqual(actual4.status, 401, "No credentials");
		strictEqual(await actual1.text(), "Relative Etc OK\n");
	});
	it("Relative to /usr/share/nginx", async function () {
		const url = "http://status.local/password-relative-usr/hello.txt";
		const actual1 = await fetch(url, {
			redirect: "manual",
			headers: {
				"Authorization": "Basic " + Buffer.from("hello:1234").toString("base64")
			}
		});
		const actual2 = await fetch(url, {
			redirect: "manual",
			headers: {
				"Authorization": "Basic " + Buffer.from("hello:bad").toString("base64")
			}
		});
		const actual3 = await fetch(url, {
			redirect: "manual",
			headers: {
				"Authorization": "Basic " + Buffer.from("bad:bad").toString("base64")
			}
		});
		const actual4 = await fetch(url, {redirect: "manual"});
		strictEqual(actual1.status, 200, "Good credentials")
		strictEqual(actual2.status, 401, "Bad password");
		strictEqual(actual3.status, 401, "Bad username");
		strictEqual(actual4.status, 401, "No credentials");
		strictEqual(await actual1.text(), "Relative Usr OK\n");
	});
});
