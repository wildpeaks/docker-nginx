/* eslint-env node, mocha */
import {strictEqual} from "assert";
import fetch from "node-fetch";

describe("rewrite", function () {
	it("http://rewrite.local/add", async function () {
		const response = await fetch("http://rewrite.local/add", {redirect: "manual"});
		strictEqual(response.status, 302);
		strictEqual(response.headers.get("location"), "http://www.rewrite.local/add");
	});
	it("http://rewrite.local/add/", async function () {
		const response = await fetch("http://rewrite.local/add/", {redirect: "manual"});
		strictEqual(response.status, 302);
		strictEqual(response.headers.get("location"), "http://www.rewrite.local/add/");
	});
	it("http://www.rewrite.local/remove", async function () {
		const response = await fetch("http://www.rewrite.local/remove", {redirect: "manual"});
		strictEqual(response.status, 302);
		strictEqual(response.headers.get("location"), "http://rewrite.local/remove");
	});
	it("http://www.rewrite.local/remove/", async function () {
		const response = await fetch("http://www.rewrite.local/remove/", {redirect: "manual"});
		strictEqual(response.status, 302);
		strictEqual(response.headers.get("location"), "http://rewrite.local/remove/");
	});
});
