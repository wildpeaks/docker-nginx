/* eslint-env node, mocha */
/* eslint-disable prefer-arrow-callback */
"use strict";
const {strictEqual} = require("assert");
const {get} = require("./shared");
const express = require("express");

function log(requests, req, res, _next){
	const data = {
		method: String(req.method),
		path: String(req.path),
		headers: Object.assign({}, req.headers),
		query: Object.assign({}, req.query)
	};
	if (typeof req.body !== "undefined"){
		data.body = req.body;
	}
	requests.push(data);
	res.redirect(301, "http://old.local/old-subfolder/image.jpg");
}

describe("proxy_redirect", function () {
	let requests = [];
	let server;
	beforeEach("Start express", function(){
		const app = express();
		requests = [];
		app.use(log.bind(null, requests));
		server = app.listen(3000);
	});
	afterEach("Stop express", function(){
		server.close();
		server = undefined;
	});
	it("http://old.local/ http://new.local/", async function () {
		const response = await get("http://proxy_redirect.local/redirect1/");
		strictEqual(response.statusCode, 301);
		strictEqual(response.headers["location"], "http://new.local/old-subfolder/image.jpg");
		strictEqual(typeof response.headers["x-real-ip"], "undefined");
		strictEqual(typeof response.headers["host"], "undefined");
	});
	it("http://old.local/old-subfolder/ http://new.local/", async function () {
		const response = await get("http://proxy_redirect.local/redirect2/");
		strictEqual(response.statusCode, 301);
		strictEqual(response.headers["location"], "http://new.local/image.jpg");
		strictEqual(typeof response.headers["x-real-ip"], "undefined");
		strictEqual(typeof response.headers["host"], "undefined");
	});
	it("http://old.local/ http://new.local/new-subfolder/", async function () {
		const response = await get("http://proxy_redirect.local/redirect3/");
		strictEqual(response.statusCode, 301);
		strictEqual(response.headers["location"], "http://new.local/new-subfolder/old-subfolder/image.jpg");
		strictEqual(typeof response.headers["x-real-ip"], "undefined");
		strictEqual(typeof response.headers["host"], "undefined");
	});
	it("http://old.local/old-subfolder/ http://new.local/new-subfolder/", async function () {
		const response = await get("http://proxy_redirect.local/redirect4/");
		strictEqual(response.statusCode, 301);
		strictEqual(response.headers["location"], "http://new.local/new-subfolder/image.jpg");
		strictEqual(typeof response.headers["x-real-ip"], "undefined");
		strictEqual(typeof response.headers["host"], "undefined");
	});
});
