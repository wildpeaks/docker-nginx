/* eslint-env node, mocha */
/* eslint-disable prefer-arrow-callback */
"use strict";
const {strictEqual, deepStrictEqual} = require("assert");
const {get, post} = require("./shared");
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
	res.header("custom-header", "Hello World");
	res.json({route: data.method + " " + data.path});
	// next();
}

async function assertGet(requests, requestPath, proxyPath, data){
	const response = await get(`http://proxy_pass.local${requestPath}`, data);
	strictEqual(requests.length, 1, "Number of requests");
	const request = requests[0];

	strictEqual(response.statusCode, 200);
	strictEqual(response.body, `{"route":"GET ${proxyPath}"}`);
	strictEqual(response.headers["custom-header"], "Hello World");
	strictEqual(response.headers["content-type"], "application/json; charset=utf-8");
	strictEqual(typeof response.headers["x-real-ip"], "undefined");
	strictEqual(typeof response.headers["host"], "undefined");

	strictEqual(typeof request.headers["x-real-ip"], "string");
	strictEqual(request.headers["host"], "proxy_pass.local");
	strictEqual(request.method, "GET");
	strictEqual(request.path, proxyPath);
	deepStrictEqual(request.query, data);
}

async function assertPost(requests, type, requestPath, proxyPath, data){
	const response = await post(`http://proxy_pass.local${requestPath}`, type, data);
	strictEqual(requests.length, 1, "Number of requests");
	const request = requests[0];

	strictEqual(response.statusCode, 200);
	strictEqual(response.body, `{"route":"POST ${proxyPath}"}`);
	strictEqual(response.headers["custom-header"], "Hello World");
	strictEqual(response.headers["content-type"], "application/json; charset=utf-8");
	strictEqual(typeof response.headers["x-real-ip"], "undefined");
	strictEqual(typeof response.headers["host"], "undefined");

	strictEqual(typeof request.headers["x-real-ip"], "string");
	strictEqual(request.headers["host"], "proxy_pass.local");
	strictEqual(request.method, "POST");
	strictEqual(request.path, proxyPath);
	deepStrictEqual(request.query, {});
	deepStrictEqual(request.body, data);
}

async function assertGetRedirect(requests, requestPath, proxyPath, data){
	const response = await get(`http://proxy_pass.local${requestPath}`, data);
	strictEqual(requests.length, 0, "Number of requests");
	strictEqual(response.statusCode, 301);
	strictEqual(response.headers["location"], `http://proxy_pass.local${proxyPath}`);
	strictEqual(typeof response.headers["x-real-ip"], "undefined");
	strictEqual(typeof response.headers["host"], "undefined");
}

async function assertPostRedirect(requests, type, requestPath, proxyPath, data){
	const response = await post(`http://proxy_pass.local${requestPath}`, type, data);
	strictEqual(requests.length, 0, "Number of requests");
	strictEqual(response.statusCode, 301);
	strictEqual(response.headers["location"], `http://proxy_pass.local${proxyPath}`);
	strictEqual(typeof response.headers["x-real-ip"], "undefined");
	strictEqual(typeof response.headers["host"], "undefined");
}

describe("local /proxy1, proxy_pass http://test.local:3000", function () {
	describe("GET", function () {
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
		it("/proxy1", async function () {
			await assertGet(requests, "/proxy1", "/proxy1", {});
		});
		it("/proxy1/", async function () {
			await assertGet(requests, "/proxy1/", "/proxy1/", {});
		});
		it("/proxy1/subfolder", async function () {
			await assertGet(requests, "/proxy1/subfolder", "/proxy1/subfolder", {});
		});
		it("/proxy1/subfolder/", async function () {
			await assertGet(requests, "/proxy1/subfolder/", "/proxy1/subfolder/", {});
		});
		it("/proxy1 {hello:'world'}", async function () {
			await assertGet(requests, "/proxy1", "/proxy1", {hello: "world"});
		});
		it("/proxy1/ {hello:'world'}", async function () {
			await assertGet(requests, "/proxy1/", "/proxy1/", {hello: "world"});
		});
		it("/proxy1/subfolder {hello:'world'}", async function () {
			await assertGet(requests, "/proxy1/subfolder", "/proxy1/subfolder", {hello: "world"});
		});
		it("/proxy1/subfolder/ {hello:'world'}", async function () {
			await assertGet(requests, "/proxy1/subfolder/", "/proxy1/subfolder/", {hello: "world"});
		});
	});
	describe("POST (application/x-www-form-urlencoded)", function () {
		let requests = [];
		let server;
		beforeEach("Start express", function(){
			const app = express();
			requests = [];
			app.use(express.urlencoded({ extended: true }));
			app.use(log.bind(null, requests));
			server = app.listen(3000);
		});
		afterEach("Stop express", function(){
			server.close();
			server = undefined;
		});
		it("/proxy1", async function () {
			await assertPost(requests, "form", "/proxy1",  "/proxy1", {});
		});
		it("/proxy1/", async function () {
			await assertPost(requests, "form", "/proxy1/", "/proxy1/", {});
		});
		it("/proxy1/subfolder", async function () {
			await assertPost(requests, "form", "/proxy1/subfolder", "/proxy1/subfolder", {});
		});
		it("/proxy1/subfolder/", async function () {
			await assertPost(requests, "form", "/proxy1/subfolder/", "/proxy1/subfolder/", {});
		});
		it("/proxy1 {hello:'world'}", async function () {
			await assertPost(requests, "form", "/proxy1", "/proxy1", {hello: "world"});
		});
		it("/proxy1/ {hello:'world'}", async function () {
			await assertPost(requests, "form", "/proxy1/", "/proxy1/", {hello: "world"});
		});
		it("/proxy1/subfolder {hello:'world'}", async function () {
			await assertPost(requests, "form", "/proxy1/subfolder", "/proxy1/subfolder", {hello: "world"});
		});
		it("/proxy1/subfolder/ {hello:'world'}", async function () {
			await assertPost(requests, "form", "/proxy1/subfolder/", "/proxy1/subfolder/", {hello: "world"});
		});
	});
	describe("POST (application/json)", function () {
		let requests = [];
		let server;
		beforeEach("Start express", function(){
			const app = express();
			requests = [];
			app.use(express.json()); // application/json
			app.use(log.bind(null, requests));
			server = app.listen(3000);
		});
		afterEach("Stop express", function(){
			server.close();
			server = undefined;
		});
		it("/proxy1", async function () {
			await assertPost(requests, "json", "/proxy1", "/proxy1", {});
		});
		it("/proxy1/", async function () {
			await assertPost(requests, "json", "/proxy1/", "/proxy1/", {});
		});
		it("/proxy1/subfolder", async function () {
			await assertPost(requests, "json", "/proxy1/subfolder", "/proxy1/subfolder", {});
		});
		it("/proxy1/subfolder/", async function () {
			await assertPost(requests, "json", "/proxy1/subfolder/", "/proxy1/subfolder/", {});
		});
		it("/proxy1 {hello:'world'}", async function () {
			await assertPost(requests, "json", "/proxy1", "/proxy1", {hello: "world"});
		});
		it("/proxy1/ {hello:'world'}", async function () {
			await assertPost(requests, "json", "/proxy1/", "/proxy1/", {hello: "world"});
		});
		it("/proxy1/subfolder {hello:'world'}", async function () {
			await assertPost(requests, "json", "/proxy1/subfolder", "/proxy1/subfolder", {hello: "world"});
		});
		it("/proxy1/subfolder/ {hello:'world'}", async function () {
			await assertPost(requests, "json", "/proxy1/subfolder/", "/proxy1/subfolder/", {hello: "world"});
		});
	});
});

describe("local /proxy2/, proxy_pass http://test.local:3000", function () {
	describe("GET", function () {
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
		it("/proxy2", async function () {
			await assertGetRedirect(requests, "/proxy2", "/proxy2/", {});
		});
		it("/proxy2/", async function () {
			await assertGet(requests, "/proxy2/", "/proxy2/", {});
		});
		it("/proxy2/subfolder", async function () {
			await assertGet(requests, "/proxy2/subfolder", "/proxy2/subfolder", {});
		});
		it("/proxy2/subfolder/", async function () {
			await assertGet(requests, "/proxy2/subfolder/", "/proxy2/subfolder/", {});
		});
		it("/proxy2 {hello:'world'}", async function () {
			await assertGetRedirect(requests, "/proxy2", "/proxy2/?hello=world", {hello: "world"});
		});
		it("/proxy2/ {hello:'world'}", async function () {
			await assertGet(requests, "/proxy2/", "/proxy2/", {hello: "world"});
		});
		it("/proxy2/subfolder {hello:'world'}", async function () {
			await assertGet(requests, "/proxy2/subfolder", "/proxy2/subfolder", {hello: "world"});
		});
		it("/proxy2/subfolder/ {hello:'world'}", async function () {
			await assertGet(requests, "/proxy2/subfolder/", "/proxy2/subfolder/", {hello: "world"});
		});
	});
	describe("POST (application/x-www-form-urlencoded)", function () {
		let requests = [];
		let server;
		beforeEach("Start express", function(){
			const app = express();
			requests = [];
			app.use(express.urlencoded({ extended: true }));
			app.use(log.bind(null, requests));
			server = app.listen(3000);
		});
		afterEach("Stop express", function(){
			server.close();
			server = undefined;
		});
		it("/proxy2", async function () {
			await assertPostRedirect(requests, "form", "/proxy2",  "/proxy2/", {});
		});
		it("/proxy2/", async function () {
			await assertPost(requests, "form", "/proxy2/", "/proxy2/", {});
		});
		it("/proxy2/subfolder", async function () {
			await assertPost(requests, "form", "/proxy2/subfolder", "/proxy2/subfolder", {});
		});
		it("/proxy2/subfolder/", async function () {
			await assertPost(requests, "form", "/proxy2/subfolder/", "/proxy2/subfolder/", {});
		});
		it("/proxy2 {hello:'world'}", async function () {
			await assertPostRedirect(requests, "form", "/proxy2", "/proxy2/", {hello: "world"});
		});
		it("/proxy2/ {hello:'world'}", async function () {
			await assertPost(requests, "form", "/proxy2/", "/proxy2/", {hello: "world"});
		});
		it("/proxy2/subfolder {hello:'world'}", async function () {
			await assertPost(requests, "form", "/proxy2/subfolder", "/proxy2/subfolder", {hello: "world"});
		});
		it("/proxy2/subfolder/ {hello:'world'}", async function () {
			await assertPost(requests, "form", "/proxy2/subfolder/", "/proxy2/subfolder/", {hello: "world"});
		});
	});
	describe("POST (application/json)", function () {
		let requests = [];
		let server;
		beforeEach("Start express", function(){
			const app = express();
			requests = [];
			app.use(express.json()); // application/json
			app.use(log.bind(null, requests));
			server = app.listen(3000);
		});
		afterEach("Stop express", function(){
			server.close();
			server = undefined;
		});
		it("/proxy2", async function () {
			await assertPostRedirect(requests, "json", "/proxy2", "/proxy2/", {});
		});
		it("/proxy2/", async function () {
			await assertPost(requests, "json", "/proxy2/", "/proxy2/", {});
		});
		it("/proxy2/subfolder", async function () {
			await assertPost(requests, "json", "/proxy2/subfolder", "/proxy2/subfolder", {});
		});
		it("/proxy2/subfolder/", async function () {
			await assertPost(requests, "json", "/proxy2/subfolder/", "/proxy2/subfolder/", {});
		});
		it("/proxy2 {hello:'world'}", async function () {
			await assertPostRedirect(requests, "json", "/proxy2", "/proxy2/", {hello: "world"});
		});
		it("/proxy2/ {hello:'world'}", async function () {
			await assertPost(requests, "json", "/proxy2/", "/proxy2/", {hello: "world"});
		});
		it("/proxy2/subfolder {hello:'world'}", async function () {
			await assertPost(requests, "json", "/proxy2/subfolder", "/proxy2/subfolder", {hello: "world"});
		});
		it("/proxy2/subfolder/ {hello:'world'}", async function () {
			await assertPost(requests, "json", "/proxy2/subfolder/", "/proxy2/subfolder/", {hello: "world"});
		});
	});
});

describe("local /proxy3, proxy_pass http://test.local:3000/", function () {
	describe("GET", function () {
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
		it("/proxy3", async function () {
			await assertGet(requests, "/proxy3", "/", {});
		});
		it("/proxy3/", async function () {
			await assertGet(requests, "/proxy3/", "//", {});
		});
		it("/proxy3/subfolder", async function () {
			await assertGet(requests, "/proxy3/subfolder", "//subfolder", {});
		});
		it("/proxy3/subfolder/", async function () {
			await assertGet(requests, "/proxy3/subfolder/", "//subfolder/", {});
		});
		it("/proxy3 {hello:'world'}", async function () {
			await assertGet(requests, "/proxy3", "/", {hello: "world"});
		});
		it("/proxy3/ {hello:'world'}", async function () {
			await assertGet(requests, "/proxy3/", "//", {hello: "world"});
		});
		it("/proxy3/subfolder {hello:'world'}", async function () {
			await assertGet(requests, "/proxy3/subfolder", "//subfolder", {hello: "world"});
		});
		it("/proxy3/subfolder/ {hello:'world'}", async function () {
			await assertGet(requests, "/proxy3/subfolder/", "//subfolder/", {hello: "world"});
		});
	});
	describe("POST (application/x-www-form-urlencoded)", function () {
		let requests = [];
		let server;
		beforeEach("Start express", function(){
			const app = express();
			requests = [];
			app.use(express.urlencoded({ extended: true }));
			app.use(log.bind(null, requests));
			server = app.listen(3000);
		});
		afterEach("Stop express", function(){
			server.close();
			server = undefined;
		});
		it("/proxy3", async function () {
			await assertPost(requests, "form", "/proxy3",  "/", {});
		});
		it("/proxy3/", async function () {
			await assertPost(requests, "form", "/proxy3/", "//", {});
		});
		it("/proxy3/subfolder", async function () {
			await assertPost(requests, "form", "/proxy3/subfolder", "//subfolder", {});
		});
		it("/proxy3/subfolder/", async function () {
			await assertPost(requests, "form", "/proxy3/subfolder/", "//subfolder/", {});
		});
		it("/proxy3 {hello:'world'}", async function () {
			await assertPost(requests, "form", "/proxy3", "/", {hello: "world"});
		});
		it("/proxy3/ {hello:'world'}", async function () {
			await assertPost(requests, "form", "/proxy3/", "//", {hello: "world"});
		});
		it("/proxy3/subfolder {hello:'world'}", async function () {
			await assertPost(requests, "form", "/proxy3/subfolder", "//subfolder", {hello: "world"});
		});
		it("/proxy3/subfolder/ {hello:'world'}", async function () {
			await assertPost(requests, "form", "/proxy3/subfolder/", "//subfolder/", {hello: "world"});
		});
	});
	describe("POST (application/json)", function () {
		let requests = [];
		let server;
		beforeEach("Start express", function(){
			const app = express();
			requests = [];
			app.use(express.json()); // application/json
			app.use(log.bind(null, requests));
			server = app.listen(3000);
		});
		afterEach("Stop express", function(){
			server.close();
			server = undefined;
		});
		it("/proxy3", async function () {
			await assertPost(requests, "json", "/proxy3", "/", {});
		});
		it("/proxy3/", async function () {
			await assertPost(requests, "json", "/proxy3/", "//", {});
		});
		it("/proxy3/subfolder", async function () {
			await assertPost(requests, "json", "/proxy3/subfolder", "//subfolder", {});
		});
		it("/proxy3/subfolder/", async function () {
			await assertPost(requests, "json", "/proxy3/subfolder/", "//subfolder/", {});
		});
		it("/proxy3 {hello:'world'}", async function () {
			await assertPost(requests, "json", "/proxy3", "/", {hello: "world"});
		});
		it("/proxy3/ {hello:'world'}", async function () {
			await assertPost(requests, "json", "/proxy3/", "//", {hello: "world"});
		});
		it("/proxy3/subfolder {hello:'world'}", async function () {
			await assertPost(requests, "json", "/proxy3/subfolder", "//subfolder", {hello: "world"});
		});
		it("/proxy3/subfolder/ {hello:'world'}", async function () {
			await assertPost(requests, "json", "/proxy3/subfolder/", "//subfolder/", {hello: "world"});
		});
	});
});

describe("local /proxy4/, proxy_pass http://test.local:3000/", function () {
	describe("GET", function () {
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
		it("/proxy4", async function () {
			await assertGetRedirect(requests, "/proxy4", "/proxy4/", {});
		});
		it("/proxy4/", async function () {
			await assertGet(requests, "/proxy4/", "/", {});
		});
		it("/proxy4/subfolder", async function () {
			await assertGet(requests, "/proxy4/subfolder", "/subfolder", {});
		});
		it("/proxy4/subfolder/", async function () {
			await assertGet(requests, "/proxy4/subfolder/", "/subfolder/", {});
		});
		it("/proxy4 {hello:'world'}", async function () {
			await assertGetRedirect(requests, "/proxy4", "/proxy4/?hello=world", {hello: "world"});
		});
		it("/proxy4/ {hello:'world'}", async function () {
			await assertGet(requests, "/proxy4/", "/", {hello: "world"});
		});
		it("/proxy4/subfolder {hello:'world'}", async function () {
			await assertGet(requests, "/proxy4/subfolder", "/subfolder", {hello: "world"});
		});
		it("/proxy4/subfolder/ {hello:'world'}", async function () {
			await assertGet(requests, "/proxy4/subfolder/", "/subfolder/", {hello: "world"});
		});
	});
	describe("POST (application/x-www-form-urlencoded)", function () {
		let requests = [];
		let server;
		beforeEach("Start express", function(){
			const app = express();
			requests = [];
			app.use(express.urlencoded({ extended: true }));
			app.use(log.bind(null, requests));
			server = app.listen(3000);
		});
		afterEach("Stop express", function(){
			server.close();
			server = undefined;
		});
		it("/proxy4", async function () {
			await assertPostRedirect(requests, "form", "/proxy4",  "/proxy4/", {});
		});
		it("/proxy4/", async function () {
			await assertPost(requests, "form", "/proxy4/", "/", {});
		});
		it("/proxy4/subfolder", async function () {
			await assertPost(requests, "form", "/proxy4/subfolder", "/subfolder", {});
		});
		it("/proxy4/subfolder/", async function () {
			await assertPost(requests, "form", "/proxy4/subfolder/", "/subfolder/", {});
		});
		it("/proxy4 {hello:'world'}", async function () {
			await assertPostRedirect(requests, "form", "/proxy4", "/proxy4/", {hello: "world"});
		});
		it("/proxy4/ {hello:'world'}", async function () {
			await assertPost(requests, "form", "/proxy4/", "/", {hello: "world"});
		});
		it("/proxy4/subfolder {hello:'world'}", async function () {
			await assertPost(requests, "form", "/proxy4/subfolder", "/subfolder", {hello: "world"});
		});
		it("/proxy4/subfolder/ {hello:'world'}", async function () {
			await assertPost(requests, "form", "/proxy4/subfolder/", "/subfolder/", {hello: "world"});
		});
	});
	describe("POST (application/json)", function () {
		let requests = [];
		let server;
		beforeEach("Start express", function(){
			const app = express();
			requests = [];
			app.use(express.json()); // application/json
			app.use(log.bind(null, requests));
			server = app.listen(3000);
		});
		afterEach("Stop express", function(){
			server.close();
			server = undefined;
		});
		it("/proxy4", async function () {
			await assertPostRedirect(requests, "json", "/proxy4", "/proxy4/", {});
		});
		it("/proxy4/", async function () {
			await assertPost(requests, "json", "/proxy4/", "/", {});
		});
		it("/proxy4/subfolder", async function () {
			await assertPost(requests, "json", "/proxy4/subfolder", "/subfolder", {});
		});
		it("/proxy4/subfolder/", async function () {
			await assertPost(requests, "json", "/proxy4/subfolder/", "/subfolder/", {});
		});
		it("/proxy4 {hello:'world'}", async function () {
			await assertPostRedirect(requests, "json", "/proxy4", "/proxy4/", {hello: "world"});
		});
		it("/proxy4/ {hello:'world'}", async function () {
			await assertPost(requests, "json", "/proxy4/", "/", {hello: "world"});
		});
		it("/proxy4/subfolder {hello:'world'}", async function () {
			await assertPost(requests, "json", "/proxy4/subfolder", "/subfolder", {hello: "world"});
		});
		it("/proxy4/subfolder/ {hello:'world'}", async function () {
			await assertPost(requests, "json", "/proxy4/subfolder/", "/subfolder/", {hello: "world"});
		});
	});
});

describe("local /proxy5, proxy_pass http://test.local:3000/upstream", function () {
	describe("GET", function () {
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
		it("/proxy5", async function () {
			await assertGet(requests, "/proxy5", "/upstream", {});
		});
		it("/proxy5/", async function () {
			await assertGet(requests, "/proxy5/", "/upstream/", {});
		});
		it("/proxy5/subfolder", async function () {
			await assertGet(requests, "/proxy5/subfolder", "/upstream/subfolder", {});
		});
		it("/proxy5/subfolder/", async function () {
			await assertGet(requests, "/proxy5/subfolder/", "/upstream/subfolder/", {});
		});
		it("/proxy5 {hello:'world'}", async function () {
			await assertGet(requests, "/proxy5", "/upstream", {hello: "world"});
		});
		it("/proxy5/ {hello:'world'}", async function () {
			await assertGet(requests, "/proxy5/", "/upstream/", {hello: "world"});
		});
		it("/proxy5/subfolder {hello:'world'}", async function () {
			await assertGet(requests, "/proxy5/subfolder", "/upstream/subfolder", {hello: "world"});
		});
		it("/proxy5/subfolder/ {hello:'world'}", async function () {
			await assertGet(requests, "/proxy5/subfolder/", "/upstream/subfolder/", {hello: "world"});
		});
	});
	describe("POST (application/x-www-form-urlencoded)", function () {
		let requests = [];
		let server;
		beforeEach("Start express", function(){
			const app = express();
			requests = [];
			app.use(express.urlencoded({ extended: true }));
			app.use(log.bind(null, requests));
			server = app.listen(3000);
		});
		afterEach("Stop express", function(){
			server.close();
			server = undefined;
		});
		it("/proxy5", async function () {
			await assertPost(requests, "form", "/proxy5",  "/upstream", {});
		});
		it("/proxy5/", async function () {
			await assertPost(requests, "form", "/proxy5/", "/upstream/", {});
		});
		it("/proxy5/subfolder", async function () {
			await assertPost(requests, "form", "/proxy5/subfolder", "/upstream/subfolder", {});
		});
		it("/proxy5/subfolder/", async function () {
			await assertPost(requests, "form", "/proxy5/subfolder/", "/upstream/subfolder/", {});
		});
		it("/proxy5 {hello:'world'}", async function () {
			await assertPost(requests, "form", "/proxy5", "/upstream", {hello: "world"});
		});
		it("/proxy5/ {hello:'world'}", async function () {
			await assertPost(requests, "form", "/proxy5/", "/upstream/", {hello: "world"});
		});
		it("/proxy5/subfolder {hello:'world'}", async function () {
			await assertPost(requests, "form", "/proxy5/subfolder", "/upstream/subfolder", {hello: "world"});
		});
		it("/proxy5/subfolder/ {hello:'world'}", async function () {
			await assertPost(requests, "form", "/proxy5/subfolder/", "/upstream/subfolder/", {hello: "world"});
		});
	});
	describe("POST (application/json)", function () {
		let requests = [];
		let server;
		beforeEach("Start express", function(){
			const app = express();
			requests = [];
			app.use(express.json()); // application/json
			app.use(log.bind(null, requests));
			server = app.listen(3000);
		});
		afterEach("Stop express", function(){
			server.close();
			server = undefined;
		});
		it("/proxy5", async function () {
			await assertPost(requests, "json", "/proxy5", "/upstream", {});
		});
		it("/proxy5/", async function () {
			await assertPost(requests, "json", "/proxy5/", "/upstream/", {});
		});
		it("/proxy5/subfolder", async function () {
			await assertPost(requests, "json", "/proxy5/subfolder", "/upstream/subfolder", {});
		});
		it("/proxy5/subfolder/", async function () {
			await assertPost(requests, "json", "/proxy5/subfolder/", "/upstream/subfolder/", {});
		});
		it("/proxy5 {hello:'world'}", async function () {
			await assertPost(requests, "json", "/proxy5", "/upstream", {hello: "world"});
		});
		it("/proxy5/ {hello:'world'}", async function () {
			await assertPost(requests, "json", "/proxy5/", "/upstream/", {hello: "world"});
		});
		it("/proxy5/subfolder {hello:'world'}", async function () {
			await assertPost(requests, "json", "/proxy5/subfolder", "/upstream/subfolder", {hello: "world"});
		});
		it("/proxy5/subfolder/ {hello:'world'}", async function () {
			await assertPost(requests, "json", "/proxy5/subfolder/", "/upstream/subfolder/", {hello: "world"});
		});
	});
});

describe("local /proxy6/, proxy_pass http://test.local:3000/upstream", function () {
	describe("GET", function () {
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
		it("/proxy6", async function () {
			await assertGetRedirect(requests, "/proxy6", "/proxy6/", {});
		});
		it("/proxy6/", async function () {
			await assertGet(requests, "/proxy6/", "/upstream", {});
		});
		it("/proxy6/subfolder", async function () {
			await assertGet(requests, "/proxy6/subfolder", "/upstreamsubfolder", {});
		});
		it("/proxy6/subfolder/", async function () {
			await assertGet(requests, "/proxy6/subfolder/", "/upstreamsubfolder/", {});
		});
		it("/proxy6 {hello:'world'}", async function () {
			await assertGetRedirect(requests, "/proxy6", "/proxy6/?hello=world", {hello: "world"});
		});
		it("/proxy6/ {hello:'world'}", async function () {
			await assertGet(requests, "/proxy6/", "/upstream", {hello: "world"});
		});
		it("/proxy6/subfolder {hello:'world'}", async function () {
			await assertGet(requests, "/proxy6/subfolder", "/upstreamsubfolder", {hello: "world"});
		});
		it("/proxy6/subfolder/ {hello:'world'}", async function () {
			await assertGet(requests, "/proxy6/subfolder/", "/upstreamsubfolder/", {hello: "world"});
		});
	});
	describe("POST (application/x-www-form-urlencoded)", function () {
		let requests = [];
		let server;
		beforeEach("Start express", function(){
			const app = express();
			requests = [];
			app.use(express.urlencoded({ extended: true }));
			app.use(log.bind(null, requests));
			server = app.listen(3000);
		});
		afterEach("Stop express", function(){
			server.close();
			server = undefined;
		});
		it("/proxy6", async function () {
			await assertPostRedirect(requests, "form", "/proxy6",  "/proxy6/", {});
		});
		it("/proxy6/", async function () {
			await assertPost(requests, "form", "/proxy6/", "/upstream", {});
		});
		it("/proxy6/subfolder", async function () {
			await assertPost(requests, "form", "/proxy6/subfolder", "/upstreamsubfolder", {});
		});
		it("/proxy6/subfolder/", async function () {
			await assertPost(requests, "form", "/proxy6/subfolder/", "/upstreamsubfolder/", {});
		});
		it("/proxy6 {hello:'world'}", async function () {
			await assertPostRedirect(requests, "form", "/proxy6", "/proxy6/", {hello: "world"});
		});
		it("/proxy6/ {hello:'world'}", async function () {
			await assertPost(requests, "form", "/proxy6/", "/upstream", {hello: "world"});
		});
		it("/proxy6/subfolder {hello:'world'}", async function () {
			await assertPost(requests, "form", "/proxy6/subfolder", "/upstreamsubfolder", {hello: "world"});
		});
		it("/proxy6/subfolder/ {hello:'world'}", async function () {
			await assertPost(requests, "form", "/proxy6/subfolder/", "/upstreamsubfolder/", {hello: "world"});
		});
	});
	describe("POST (application/json)", function () {
		let requests = [];
		let server;
		beforeEach("Start express", function(){
			const app = express();
			requests = [];
			app.use(express.json()); // application/json
			app.use(log.bind(null, requests));
			server = app.listen(3000);
		});
		afterEach("Stop express", function(){
			server.close();
			server = undefined;
		});
		it("/proxy6", async function () {
			await assertPostRedirect(requests, "json", "/proxy6", "/proxy6/", {});
		});
		it("/proxy6/", async function () {
			await assertPost(requests, "json", "/proxy6/", "/upstream", {});
		});
		it("/proxy6/subfolder", async function () {
			await assertPost(requests, "json", "/proxy6/subfolder", "/upstreamsubfolder", {});
		});
		it("/proxy6/subfolder/", async function () {
			await assertPost(requests, "json", "/proxy6/subfolder/", "/upstreamsubfolder/", {});
		});
		it("/proxy6 {hello:'world'}", async function () {
			await assertPostRedirect(requests, "json", "/proxy6", "/proxy6/", {hello: "world"});
		});
		it("/proxy6/ {hello:'world'}", async function () {
			await assertPost(requests, "json", "/proxy6/", "/upstream", {hello: "world"});
		});
		it("/proxy6/subfolder {hello:'world'}", async function () {
			await assertPost(requests, "json", "/proxy6/subfolder", "/upstreamsubfolder", {hello: "world"});
		});
		it("/proxy6/subfolder/ {hello:'world'}", async function () {
			await assertPost(requests, "json", "/proxy6/subfolder/", "/upstreamsubfolder/", {hello: "world"});
		});
	});
});

describe("local /proxy7, proxy_pass http://test.local:3000/upstream/", function () {
	describe("GET", function () {
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
		it("/proxy7", async function () {
			await assertGet(requests, "/proxy7", "/upstream/", {});
		});
		it("/proxy7/", async function () {
			await assertGet(requests, "/proxy7/", "/upstream//", {});
		});
		it("/proxy7/subfolder", async function () {
			await assertGet(requests, "/proxy7/subfolder", "/upstream//subfolder", {});
		});
		it("/proxy7/subfolder/", async function () {
			await assertGet(requests, "/proxy7/subfolder/", "/upstream//subfolder/", {});
		});
		it("/proxy7 {hello:'world'}", async function () {
			await assertGet(requests, "/proxy7", "/upstream/", {hello: "world"});
		});
		it("/proxy7/ {hello:'world'}", async function () {
			await assertGet(requests, "/proxy7/", "/upstream//", {hello: "world"});
		});
		it("/proxy7/subfolder {hello:'world'}", async function () {
			await assertGet(requests, "/proxy7/subfolder", "/upstream//subfolder", {hello: "world"});
		});
		it("/proxy7/subfolder/ {hello:'world'}", async function () {
			await assertGet(requests, "/proxy7/subfolder/", "/upstream//subfolder/", {hello: "world"});
		});
	});
	describe("POST (application/x-www-form-urlencoded)", function () {
		let requests = [];
		let server;
		beforeEach("Start express", function(){
			const app = express();
			requests = [];
			app.use(express.urlencoded({ extended: true }));
			app.use(log.bind(null, requests));
			server = app.listen(3000);
		});
		afterEach("Stop express", function(){
			server.close();
			server = undefined;
		});
		it("/proxy7", async function () {
			await assertPost(requests, "form", "/proxy7",  "/upstream/", {});
		});
		it("/proxy7/", async function () {
			await assertPost(requests, "form", "/proxy7/", "/upstream//", {});
		});
		it("/proxy7/subfolder", async function () {
			await assertPost(requests, "form", "/proxy7/subfolder", "/upstream//subfolder", {});
		});
		it("/proxy7/subfolder/", async function () {
			await assertPost(requests, "form", "/proxy7/subfolder/", "/upstream//subfolder/", {});
		});
		it("/proxy7 {hello:'world'}", async function () {
			await assertPost(requests, "form", "/proxy7", "/upstream/", {hello: "world"});
		});
		it("/proxy7/ {hello:'world'}", async function () {
			await assertPost(requests, "form", "/proxy7/", "/upstream//", {hello: "world"});
		});
		it("/proxy7/subfolder {hello:'world'}", async function () {
			await assertPost(requests, "form", "/proxy7/subfolder", "/upstream//subfolder", {hello: "world"});
		});
		it("/proxy7/subfolder/ {hello:'world'}", async function () {
			await assertPost(requests, "form", "/proxy7/subfolder/", "/upstream//subfolder/", {hello: "world"});
		});
	});
	describe("POST (application/json)", function () {
		let requests = [];
		let server;
		beforeEach("Start express", function(){
			const app = express();
			requests = [];
			app.use(express.json()); // application/json
			app.use(log.bind(null, requests));
			server = app.listen(3000);
		});
		afterEach("Stop express", function(){
			server.close();
			server = undefined;
		});
		it("/proxy7", async function () {
			await assertPost(requests, "json", "/proxy7", "/upstream/", {});
		});
		it("/proxy7/", async function () {
			await assertPost(requests, "json", "/proxy7/", "/upstream//", {});
		});
		it("/proxy7/subfolder", async function () {
			await assertPost(requests, "json", "/proxy7/subfolder", "/upstream//subfolder", {});
		});
		it("/proxy7/subfolder/", async function () {
			await assertPost(requests, "json", "/proxy7/subfolder/", "/upstream//subfolder/", {});
		});
		it("/proxy7 {hello:'world'}", async function () {
			await assertPost(requests, "json", "/proxy7", "/upstream/", {hello: "world"});
		});
		it("/proxy7/ {hello:'world'}", async function () {
			await assertPost(requests, "json", "/proxy7/", "/upstream//", {hello: "world"});
		});
		it("/proxy7/subfolder {hello:'world'}", async function () {
			await assertPost(requests, "json", "/proxy7/subfolder", "/upstream//subfolder", {hello: "world"});
		});
		it("/proxy7/subfolder/ {hello:'world'}", async function () {
			await assertPost(requests, "json", "/proxy7/subfolder/", "/upstream//subfolder/", {hello: "world"});
		});
	});
});

describe("local /proxy8/, proxy_pass http://test.local:3000/upstream/", function () {
	describe("GET", function () {
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
		it("/proxy8", async function () {
			await assertGetRedirect(requests, "/proxy8", "/proxy8/", {});
		});
		it("/proxy8/", async function () {
			await assertGet(requests, "/proxy8/", "/upstream/", {});
		});
		it("/proxy8/subfolder", async function () {
			await assertGet(requests, "/proxy8/subfolder", "/upstream/subfolder", {});
		});
		it("/proxy8/subfolder/", async function () {
			await assertGet(requests, "/proxy8/subfolder/", "/upstream/subfolder/", {});
		});
		it("/proxy8 {hello:'world'}", async function () {
			await assertGetRedirect(requests, "/proxy8", "/proxy8/?hello=world", {hello: "world"});
		});
		it("/proxy8/ {hello:'world'}", async function () {
			await assertGet(requests, "/proxy8/", "/upstream/", {hello: "world"});
		});
		it("/proxy8/subfolder {hello:'world'}", async function () {
			await assertGet(requests, "/proxy8/subfolder", "/upstream/subfolder", {hello: "world"});
		});
		it("/proxy8/subfolder/ {hello:'world'}", async function () {
			await assertGet(requests, "/proxy8/subfolder/", "/upstream/subfolder/", {hello: "world"});
		});
	});
	describe("POST (application/x-www-form-urlencoded)", function () {
		let requests = [];
		let server;
		beforeEach("Start express", function(){
			const app = express();
			requests = [];
			app.use(express.urlencoded({ extended: true }));
			app.use(log.bind(null, requests));
			server = app.listen(3000);
		});
		afterEach("Stop express", function(){
			server.close();
			server = undefined;
		});
		it("/proxy8", async function () {
			await assertPostRedirect(requests, "form", "/proxy8",  "/proxy8/", {});
		});
		it("/proxy8/", async function () {
			await assertPost(requests, "form", "/proxy8/", "/upstream/", {});
		});
		it("/proxy8/subfolder", async function () {
			await assertPost(requests, "form", "/proxy8/subfolder", "/upstream/subfolder", {});
		});
		it("/proxy8/subfolder/", async function () {
			await assertPost(requests, "form", "/proxy8/subfolder/", "/upstream/subfolder/", {});
		});
		it("/proxy8 {hello:'world'}", async function () {
			await assertPostRedirect(requests, "form", "/proxy8", "/proxy8/", {hello: "world"});
		});
		it("/proxy8/ {hello:'world'}", async function () {
			await assertPost(requests, "form", "/proxy8/", "/upstream/", {hello: "world"});
		});
		it("/proxy8/subfolder {hello:'world'}", async function () {
			await assertPost(requests, "form", "/proxy8/subfolder", "/upstream/subfolder", {hello: "world"});
		});
		it("/proxy8/subfolder/ {hello:'world'}", async function () {
			await assertPost(requests, "form", "/proxy8/subfolder/", "/upstream/subfolder/", {hello: "world"});
		});
	});
	describe("POST (application/json)", function () {
		let requests = [];
		let server;
		beforeEach("Start express", function(){
			const app = express();
			requests = [];
			app.use(express.json()); // application/json
			app.use(log.bind(null, requests));
			server = app.listen(3000);
		});
		afterEach("Stop express", function(){
			server.close();
			server = undefined;
		});
		it("/proxy8", async function () {
			await assertPostRedirect(requests, "json", "/proxy8", "/proxy8/", {});
		});
		it("/proxy8/", async function () {
			await assertPost(requests, "json", "/proxy8/", "/upstream/", {});
		});
		it("/proxy8/subfolder", async function () {
			await assertPost(requests, "json", "/proxy8/subfolder", "/upstream/subfolder", {});
		});
		it("/proxy8/subfolder/", async function () {
			await assertPost(requests, "json", "/proxy8/subfolder/", "/upstream/subfolder/", {});
		});
		it("/proxy8 {hello:'world'}", async function () {
			await assertPostRedirect(requests, "json", "/proxy8", "/proxy8/", {hello: "world"});
		});
		it("/proxy8/ {hello:'world'}", async function () {
			await assertPost(requests, "json", "/proxy8/", "/upstream/", {hello: "world"});
		});
		it("/proxy8/subfolder {hello:'world'}", async function () {
			await assertPost(requests, "json", "/proxy8/subfolder", "/upstream/subfolder", {hello: "world"});
		});
		it("/proxy8/subfolder/ {hello:'world'}", async function () {
			await assertPost(requests, "json", "/proxy8/subfolder/", "/upstream/subfolder/", {hello: "world"});
		});
	});
});

describe("local /proxy9/subproxy, proxy_pass http://test.local:3000", function () {
	describe("GET", function () {
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
		it("/proxy9/subproxy", async function () {
			await assertGet(requests, "/proxy9/subproxy", "/proxy9/subproxy", {});
		});
		it("/proxy9/subproxy/", async function () {
			await assertGet(requests, "/proxy9/subproxy/", "/proxy9/subproxy/", {});
		});
		it("/proxy9/subproxy/subfolder", async function () {
			await assertGet(requests, "/proxy9/subproxy/subfolder", "/proxy9/subproxy/subfolder", {});
		});
		it("/proxy9/subproxy/subfolder/", async function () {
			await assertGet(requests, "/proxy9/subproxy/subfolder/", "/proxy9/subproxy/subfolder/", {});
		});
		it("/proxy9/subproxy{hello:'world'}", async function () {
			await assertGet(requests, "/proxy9/subproxy", "/proxy9/subproxy", {hello: "world"});
		});
		it("/proxy9/subproxy/ {hello:'world'}", async function () {
			await assertGet(requests, "/proxy9/subproxy/", "/proxy9/subproxy/", {hello: "world"});
		});
		it("/proxy9/subproxy/subfolder {hello:'world'}", async function () {
			await assertGet(requests, "/proxy9/subproxy/subfolder", "/proxy9/subproxy/subfolder", {hello: "world"});
		});
		it("/proxy9/subproxy/subfolder/ {hello:'world'}", async function () {
			await assertGet(requests, "/proxy9/subproxy/subfolder/", "/proxy9/subproxy/subfolder/", {hello: "world"});
		});
	});
	describe("POST (application/x-www-form-urlencoded)", function () {
		let requests = [];
		let server;
		beforeEach("Start express", function(){
			const app = express();
			requests = [];
			app.use(express.urlencoded({ extended: true }));
			app.use(log.bind(null, requests));
			server = app.listen(3000);
		});
		afterEach("Stop express", function(){
			server.close();
			server = undefined;
		});
		it("/proxy9/subproxy", async function () {
			await assertPost(requests, "form", "/proxy9/subproxy",  "/proxy9/subproxy", {});
		});
		it("/proxy9/subproxy/", async function () {
			await assertPost(requests, "form", "/proxy9/subproxy/", "/proxy9/subproxy/", {});
		});
		it("/proxy9/subproxy/subfolder", async function () {
			await assertPost(requests, "form", "/proxy9/subproxy/subfolder", "/proxy9/subproxy/subfolder", {});
		});
		it("/proxy9/subproxy/subfolder/", async function () {
			await assertPost(requests, "form", "/proxy9/subproxy/subfolder/", "/proxy9/subproxy/subfolder/", {});
		});
		it("/proxy9/subproxy {hello:'world'}", async function () {
			await assertPost(requests, "form", "/proxy9/subproxy", "/proxy9/subproxy", {hello: "world"});
		});
		it("/proxy9/subproxy/ {hello:'world'}", async function () {
			await assertPost(requests, "form", "/proxy9/subproxy/", "/proxy9/subproxy/", {hello: "world"});
		});
		it("/proxy9/subproxy/subfolder {hello:'world'}", async function () {
			await assertPost(requests, "form", "/proxy9/subproxy/subfolder", "/proxy9/subproxy/subfolder", {hello: "world"});
		});
		it("/proxy9/subproxy/subfolder/ {hello:'world'}", async function () {
			await assertPost(requests, "form", "/proxy9/subproxy/subfolder/", "/proxy9/subproxy/subfolder/", {hello: "world"});
		});
	});
	describe("POST (application/json)", function () {
		let requests = [];
		let server;
		beforeEach("Start express", function(){
			const app = express();
			requests = [];
			app.use(express.json()); // application/json
			app.use(log.bind(null, requests));
			server = app.listen(3000);
		});
		afterEach("Stop express", function(){
			server.close();
			server = undefined;
		});
		it("/proxy9/subproxy", async function () {
			await assertPost(requests, "json", "/proxy9/subproxy", "/proxy9/subproxy", {});
		});
		it("/proxy9/subproxy/", async function () {
			await assertPost(requests, "json", "/proxy9/subproxy/", "/proxy9/subproxy/", {});
		});
		it("/proxy9/subproxy/subfolder", async function () {
			await assertPost(requests, "json", "/proxy9/subproxy/subfolder", "/proxy9/subproxy/subfolder", {});
		});
		it("/proxy9/subproxy/subfolder/", async function () {
			await assertPost(requests, "json", "/proxy9/subproxy/subfolder/", "/proxy9/subproxy/subfolder/", {});
		});
		it("/proxy9/subproxy {hello:'world'}", async function () {
			await assertPost(requests, "json", "/proxy9/subproxy", "/proxy9/subproxy", {hello: "world"});
		});
		it("/proxy9/subproxy/ {hello:'world'}", async function () {
			await assertPost(requests, "json", "/proxy9/subproxy/", "/proxy9/subproxy/", {hello: "world"});
		});
		it("/proxy9/subproxy/subfolder {hello:'world'}", async function () {
			await assertPost(requests, "json", "/proxy9/subproxy/subfolder", "/proxy9/subproxy/subfolder", {hello: "world"});
		});
		it("/proxy9/subproxy/subfolder/ {hello:'world'}", async function () {
			await assertPost(requests, "json", "/proxy9/subproxy/subfolder/", "/proxy9/subproxy/subfolder/", {hello: "world"});
		});
	});
});

describe("local /proxy10/subproxy/, proxy_pass http://test.local:3000", function () {
	describe("GET", function () {
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
		it("/proxy10", async function () {
			await assertGetRedirect(requests, "/proxy10/subproxy", "/proxy10/subproxy/", {});
		});
		it("/proxy10/", async function () {
			await assertGet(requests, "/proxy10/subproxy/", "/proxy10/subproxy/", {});
		});
		it("/proxy10/subfolder", async function () {
			await assertGet(requests, "/proxy10/subproxy/subfolder", "/proxy10/subproxy/subfolder", {});
		});
		it("/proxy10/subfolder/", async function () {
			await assertGet(requests, "/proxy10/subproxy/subfolder/", "/proxy10/subproxy/subfolder/", {});
		});
		it("/proxy10 {hello:'world'}", async function () {
			await assertGetRedirect(requests, "/proxy10/subproxy", "/proxy10/subproxy/?hello=world", {hello: "world"});
		});
		it("/proxy10/ {hello:'world'}", async function () {
			await assertGet(requests, "/proxy10/subproxy/", "/proxy10/subproxy/", {hello: "world"});
		});
		it("/proxy10/subfolder {hello:'world'}", async function () {
			await assertGet(requests, "/proxy10/subproxy/subfolder", "/proxy10/subproxy/subfolder", {hello: "world"});
		});
		it("/proxy10/subfolder/ {hello:'world'}", async function () {
			await assertGet(requests, "/proxy10/subproxy/subfolder/", "/proxy10/subproxy/subfolder/", {hello: "world"});
		});
	});
	describe("POST (application/x-www-form-urlencoded)", function () {
		let requests = [];
		let server;
		beforeEach("Start express", function(){
			const app = express();
			requests = [];
			app.use(express.urlencoded({ extended: true }));
			app.use(log.bind(null, requests));
			server = app.listen(3000);
		});
		afterEach("Stop express", function(){
			server.close();
			server = undefined;
		});
		it("/proxy10/subproxy", async function () {
			await assertPostRedirect(requests, "form", "/proxy10/subproxy",  "/proxy10/subproxy/", {});
		});
		it("/proxy10/subproxy/", async function () {
			await assertPost(requests, "form", "/proxy10/subproxy/", "/proxy10/subproxy/", {});
		});
		it("/proxy10/subproxy/subfolder", async function () {
			await assertPost(requests, "form", "/proxy10/subproxy/subfolder", "/proxy10/subproxy/subfolder", {});
		});
		it("/proxy10/subproxy/subfolder/", async function () {
			await assertPost(requests, "form", "/proxy10/subproxy/subfolder/", "/proxy10/subproxy/subfolder/", {});
		});
		it("/proxy10/subproxy {hello:'world'}", async function () {
			await assertPostRedirect(requests, "form", "/proxy10/subproxy", "/proxy10/subproxy/", {hello: "world"});
		});
		it("/proxy10/subproxy/ {hello:'world'}", async function () {
			await assertPost(requests, "form", "/proxy10/subproxy/", "/proxy10/subproxy/", {hello: "world"});
		});
		it("/proxy10/subproxy/subfolder {hello:'world'}", async function () {
			await assertPost(requests, "form", "/proxy10/subproxy/subfolder", "/proxy10/subproxy/subfolder", {hello: "world"});
		});
		it("/proxy10/subproxy/subfolder/ {hello:'world'}", async function () {
			await assertPost(requests, "form", "/proxy10/subproxy/subfolder/", "/proxy10/subproxy/subfolder/", {hello: "world"});
		});
	});
	describe("POST (application/json)", function () {
		let requests = [];
		let server;
		beforeEach("Start express", function(){
			const app = express();
			requests = [];
			app.use(express.json()); // application/json
			app.use(log.bind(null, requests));
			server = app.listen(3000);
		});
		afterEach("Stop express", function(){
			server.close();
			server = undefined;
		});
		it("/proxy10/subproxy", async function () {
			await assertPostRedirect(requests, "json", "/proxy10/subproxy", "/proxy10/subproxy/", {});
		});
		it("/proxy10/subproxy/", async function () {
			await assertPost(requests, "json", "/proxy10/subproxy/", "/proxy10/subproxy/", {});
		});
		it("/proxy10/subproxy/subfolder", async function () {
			await assertPost(requests, "json", "/proxy10/subproxy/subfolder", "/proxy10/subproxy/subfolder", {});
		});
		it("/proxy10/subproxy/subfolder/", async function () {
			await assertPost(requests, "json", "/proxy10/subproxy/subfolder/", "/proxy10/subproxy/subfolder/", {});
		});
		it("/proxy10/subproxy {hello:'world'}", async function () {
			await assertPostRedirect(requests, "json", "/proxy10/subproxy", "/proxy10/subproxy/", {hello: "world"});
		});
		it("/proxy10/subproxy/ {hello:'world'}", async function () {
			await assertPost(requests, "json", "/proxy10/subproxy/", "/proxy10/subproxy/", {hello: "world"});
		});
		it("/proxy10/subproxy/subfolder {hello:'world'}", async function () {
			await assertPost(requests, "json", "/proxy10/subproxy/subfolder", "/proxy10/subproxy/subfolder", {hello: "world"});
		});
		it("/proxy10/subproxy/subfolder/ {hello:'world'}", async function () {
			await assertPost(requests, "json", "/proxy10/subproxy/subfolder/", "/proxy10/subproxy/subfolder/", {hello: "world"});
		});
	});
});

describe("local /proxy11/subproxy, proxy_pass http://test.local:3000/", function () {
	describe("GET", function () {
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
		it("/proxy11/subproxy", async function () {
			await assertGet(requests, "/proxy11/subproxy", "/", {});
		});
		it("/proxy11/subproxy/", async function () {
			await assertGet(requests, "/proxy11/subproxy/", "//", {});
		});
		it("/proxy11/subproxy/subfolder", async function () {
			await assertGet(requests, "/proxy11/subproxy/subfolder", "//subfolder", {});
		});
		it("/proxy11/subproxy/subfolder/", async function () {
			await assertGet(requests, "/proxy11/subproxy/subfolder/", "//subfolder/", {});
		});
		it("/proxy11/subproxy {hello:'world'}", async function () {
			await assertGet(requests, "/proxy11/subproxy", "/", {hello: "world"});
		});
		it("/proxy11/subproxy/ {hello:'world'}", async function () {
			await assertGet(requests, "/proxy11/subproxy/", "//", {hello: "world"});
		});
		it("/proxy11/subproxy/subfolder {hello:'world'}", async function () {
			await assertGet(requests, "/proxy11/subproxy/subfolder", "//subfolder", {hello: "world"});
		});
		it("/proxy11/subproxy/subfolder/ {hello:'world'}", async function () {
			await assertGet(requests, "/proxy11/subproxy/subfolder/", "//subfolder/", {hello: "world"});
		});
	});
	describe("POST (application/x-www-form-urlencoded)", function () {
		let requests = [];
		let server;
		beforeEach("Start express", function(){
			const app = express();
			requests = [];
			app.use(express.urlencoded({ extended: true }));
			app.use(log.bind(null, requests));
			server = app.listen(3000);
		});
		afterEach("Stop express", function(){
			server.close();
			server = undefined;
		});
		it("/proxy11/subproxy", async function () {
			await assertPost(requests, "form", "/proxy11/subproxy",  "/", {});
		});
		it("/proxy11/subproxy/", async function () {
			await assertPost(requests, "form", "/proxy11/subproxy/", "//", {});
		});
		it("/proxy11/subproxy/subfolder", async function () {
			await assertPost(requests, "form", "/proxy11/subproxy/subfolder", "//subfolder", {});
		});
		it("/proxy11/subproxy/subfolder/", async function () {
			await assertPost(requests, "form", "/proxy11/subproxy/subfolder/", "//subfolder/", {});
		});
		it("/proxy11/subproxy {hello:'world'}", async function () {
			await assertPost(requests, "form", "/proxy11/subproxy", "/", {hello: "world"});
		});
		it("/proxy11/subproxy/ {hello:'world'}", async function () {
			await assertPost(requests, "form", "/proxy11/subproxy/", "//", {hello: "world"});
		});
		it("/proxy11/subproxy/subfolder {hello:'world'}", async function () {
			await assertPost(requests, "form", "/proxy11/subproxy/subfolder", "//subfolder", {hello: "world"});
		});
		it("/proxy11/subproxy/subfolder/ {hello:'world'}", async function () {
			await assertPost(requests, "form", "/proxy11/subproxy/subfolder/", "//subfolder/", {hello: "world"});
		});
	});
	describe("POST (application/json)", function () {
		let requests = [];
		let server;
		beforeEach("Start express", function(){
			const app = express();
			requests = [];
			app.use(express.json()); // application/json
			app.use(log.bind(null, requests));
			server = app.listen(3000);
		});
		afterEach("Stop express", function(){
			server.close();
			server = undefined;
		});
		it("/proxy11/subproxy", async function () {
			await assertPost(requests, "json", "/proxy11/subproxy", "/", {});
		});
		it("/proxy11/subproxy/", async function () {
			await assertPost(requests, "json", "/proxy11/subproxy/", "//", {});
		});
		it("/proxy11/subproxy/subfolder", async function () {
			await assertPost(requests, "json", "/proxy11/subproxy/subfolder", "//subfolder", {});
		});
		it("/proxy11/subproxy/subfolder/", async function () {
			await assertPost(requests, "json", "/proxy11/subproxy/subfolder/", "//subfolder/", {});
		});
		it("/proxy11/subproxy {hello:'world'}", async function () {
			await assertPost(requests, "json", "/proxy11/subproxy", "/", {hello: "world"});
		});
		it("/proxy11/subproxy/ {hello:'world'}", async function () {
			await assertPost(requests, "json", "/proxy11/subproxy/", "//", {hello: "world"});
		});
		it("/proxy11/subproxy/subfolder {hello:'world'}", async function () {
			await assertPost(requests, "json", "/proxy11/subproxy/subfolder", "//subfolder", {hello: "world"});
		});
		it("/proxy11/subproxy/subfolder/ {hello:'world'}", async function () {
			await assertPost(requests, "json", "/proxy11/subproxy/subfolder/", "//subfolder/", {hello: "world"});
		});
	});
});

describe("local /proxy12/subproxy/, proxy_pass http://test.local:3000/", function () {
	describe("GET", function () {
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
		it("/proxy12/subproxy", async function () {
			await assertGetRedirect(requests, "/proxy12/subproxy", "/proxy12/subproxy/", {});
		});
		it("/proxy12/subproxy/", async function () {
			await assertGet(requests, "/proxy12/subproxy/", "/", {});
		});
		it("/proxy12/subproxy/subfolder", async function () {
			await assertGet(requests, "/proxy12/subproxy/subfolder", "/subfolder", {});
		});
		it("/proxy12/subproxy/subfolder/", async function () {
			await assertGet(requests, "/proxy12/subproxy/subfolder/", "/subfolder/", {});
		});
		it("/proxy12/subproxy {hello:'world'}", async function () {
			await assertGetRedirect(requests, "/proxy12/subproxy", "/proxy12/subproxy/?hello=world", {hello: "world"});
		});
		it("/proxy12/subproxy/ {hello:'world'}", async function () {
			await assertGet(requests, "/proxy12/subproxy/", "/", {hello: "world"});
		});
		it("/proxy12/subproxy/subfolder {hello:'world'}", async function () {
			await assertGet(requests, "/proxy12/subproxy/subfolder", "/subfolder", {hello: "world"});
		});
		it("/proxy12/subproxy/subfolder/ {hello:'world'}", async function () {
			await assertGet(requests, "/proxy12/subproxy/subfolder/", "/subfolder/", {hello: "world"});
		});
	});
	describe("POST (application/x-www-form-urlencoded)", function () {
		let requests = [];
		let server;
		beforeEach("Start express", function(){
			const app = express();
			requests = [];
			app.use(express.urlencoded({ extended: true }));
			app.use(log.bind(null, requests));
			server = app.listen(3000);
		});
		afterEach("Stop express", function(){
			server.close();
			server = undefined;
		});
		it("/proxy12/subproxy", async function () {
			await assertPostRedirect(requests, "form", "/proxy12/subproxy",  "/proxy12/subproxy/", {});
		});
		it("/proxy12/subproxy/", async function () {
			await assertPost(requests, "form", "/proxy12/subproxy/", "/", {});
		});
		it("/proxy12/subproxy/subfolder", async function () {
			await assertPost(requests, "form", "/proxy12/subproxy/subfolder", "/subfolder", {});
		});
		it("/proxy12/subproxy/subfolder/", async function () {
			await assertPost(requests, "form", "/proxy12/subproxy/subfolder/", "/subfolder/", {});
		});
		it("/proxy12/subproxy {hello:'world'}", async function () {
			await assertPostRedirect(requests, "form", "/proxy12/subproxy", "/proxy12/subproxy/", {hello: "world"});
		});
		it("/proxy12/subproxy/ {hello:'world'}", async function () {
			await assertPost(requests, "form", "/proxy12/subproxy/", "/", {hello: "world"});
		});
		it("/proxy12/subproxy/subfolder {hello:'world'}", async function () {
			await assertPost(requests, "form", "/proxy12/subproxy/subfolder", "/subfolder", {hello: "world"});
		});
		it("/proxy12/subproxy/subfolder/ {hello:'world'}", async function () {
			await assertPost(requests, "form", "/proxy12/subproxy/subfolder/", "/subfolder/", {hello: "world"});
		});
	});
	describe("POST (application/json)", function () {
		let requests = [];
		let server;
		beforeEach("Start express", function(){
			const app = express();
			requests = [];
			app.use(express.json()); // application/json
			app.use(log.bind(null, requests));
			server = app.listen(3000);
		});
		afterEach("Stop express", function(){
			server.close();
			server = undefined;
		});
		it("/proxy12/subproxy", async function () {
			await assertPostRedirect(requests, "json", "/proxy12/subproxy", "/proxy12/subproxy/", {});
		});
		it("/proxy12/subproxy/", async function () {
			await assertPost(requests, "json", "/proxy12/subproxy/", "/", {});
		});
		it("/proxy12/subproxy/subfolder", async function () {
			await assertPost(requests, "json", "/proxy12/subproxy/subfolder", "/subfolder", {});
		});
		it("/proxy12/subproxy/subfolder/", async function () {
			await assertPost(requests, "json", "/proxy12/subproxy/subfolder/", "/subfolder/", {});
		});
		it("/proxy12/subproxy {hello:'world'}", async function () {
			await assertPostRedirect(requests, "json", "/proxy12/subproxy", "/proxy12/subproxy/", {hello: "world"});
		});
		it("/proxy12/subproxy/ {hello:'world'}", async function () {
			await assertPost(requests, "json", "/proxy12/subproxy/", "/", {hello: "world"});
		});
		it("/proxy1/subproxy/subfolder {hello:'world'}", async function () {
			await assertPost(requests, "json", "/proxy12/subproxy/subfolder", "/subfolder", {hello: "world"});
		});
		it("/proxy12/subproxy/subfolder/ {hello:'world'}", async function () {
			await assertPost(requests, "json", "/proxy12/subproxy/subfolder/", "/subfolder/", {hello: "world"});
		});
	});
});

describe("local /proxy13/subproxy, proxy_pass http://test.local:3000/upstream", function () {
	describe("GET", function () {
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
		it("/proxy13/subproxy", async function () {
			await assertGet(requests, "/proxy13/subproxy", "/upstream", {});
		});
		it("/proxy13/subproxy/", async function () {
			await assertGet(requests, "/proxy13/subproxy/", "/upstream/", {});
		});
		it("/proxy13/subproxy/subfolder", async function () {
			await assertGet(requests, "/proxy13/subproxy/subfolder", "/upstream/subfolder", {});
		});
		it("/proxy13/subproxy/subfolder/", async function () {
			await assertGet(requests, "/proxy13/subproxy/subfolder/", "/upstream/subfolder/", {});
		});
		it("/proxy13/subproxy {hello:'world'}", async function () {
			await assertGet(requests, "/proxy13/subproxy", "/upstream", {hello: "world"});
		});
		it("/proxy13/subproxy/ {hello:'world'}", async function () {
			await assertGet(requests, "/proxy13/subproxy/", "/upstream/", {hello: "world"});
		});
		it("/proxy13/subproxy/subfolder {hello:'world'}", async function () {
			await assertGet(requests, "/proxy13/subproxy/subfolder", "/upstream/subfolder", {hello: "world"});
		});
		it("/proxy13/subproxy/subfolder/ {hello:'world'}", async function () {
			await assertGet(requests, "/proxy13/subproxy/subfolder/", "/upstream/subfolder/", {hello: "world"});
		});
	});
	describe("POST (application/x-www-form-urlencoded)", function () {
		let requests = [];
		let server;
		beforeEach("Start express", function(){
			const app = express();
			requests = [];
			app.use(express.urlencoded({ extended: true }));
			app.use(log.bind(null, requests));
			server = app.listen(3000);
		});
		afterEach("Stop express", function(){
			server.close();
			server = undefined;
		});
		it("/proxy13/subproxy", async function () {
			await assertPost(requests, "form", "/proxy13/subproxy",  "/upstream", {});
		});
		it("/proxy13/subproxy/", async function () {
			await assertPost(requests, "form", "/proxy13/subproxy/", "/upstream/", {});
		});
		it("/proxy13/subproxy/subfolder", async function () {
			await assertPost(requests, "form", "/proxy13/subproxy/subfolder", "/upstream/subfolder", {});
		});
		it("/proxy13/subproxy/subfolder/", async function () {
			await assertPost(requests, "form", "/proxy13/subproxy/subfolder/", "/upstream/subfolder/", {});
		});
		it("/proxy13/subproxy {hello:'world'}", async function () {
			await assertPost(requests, "form", "/proxy13/subproxy", "/upstream", {hello: "world"});
		});
		it("/proxy13/subproxy/ {hello:'world'}", async function () {
			await assertPost(requests, "form", "/proxy13/subproxy/", "/upstream/", {hello: "world"});
		});
		it("/proxy13/subproxy/subfolder {hello:'world'}", async function () {
			await assertPost(requests, "form", "/proxy13/subproxy/subfolder", "/upstream/subfolder", {hello: "world"});
		});
		it("/proxy13/subproxy/subfolder/ {hello:'world'}", async function () {
			await assertPost(requests, "form", "/proxy13/subproxy/subfolder/", "/upstream/subfolder/", {hello: "world"});
		});
	});
	describe("POST (application/json)", function () {
		let requests = [];
		let server;
		beforeEach("Start express", function(){
			const app = express();
			requests = [];
			app.use(express.json()); // application/json
			app.use(log.bind(null, requests));
			server = app.listen(3000);
		});
		afterEach("Stop express", function(){
			server.close();
			server = undefined;
		});
		it("/proxy13/subproxy", async function () {
			await assertPost(requests, "json", "/proxy13/subproxy", "/upstream", {});
		});
		it("/proxy13/subproxy/", async function () {
			await assertPost(requests, "json", "/proxy13/subproxy/", "/upstream/", {});
		});
		it("/proxy13/subproxy/subfolder", async function () {
			await assertPost(requests, "json", "/proxy13/subproxy/subfolder", "/upstream/subfolder", {});
		});
		it("/proxy13/subproxy/subfolder/", async function () {
			await assertPost(requests, "json", "/proxy13/subproxy/subfolder/", "/upstream/subfolder/", {});
		});
		it("/proxy13/subproxy {hello:'world'}", async function () {
			await assertPost(requests, "json", "/proxy13/subproxy", "/upstream", {hello: "world"});
		});
		it("/proxy13/subproxy/ {hello:'world'}", async function () {
			await assertPost(requests, "json", "/proxy13/subproxy/", "/upstream/", {hello: "world"});
		});
		it("/proxy13/subproxy/subfolder {hello:'world'}", async function () {
			await assertPost(requests, "json", "/proxy13/subproxy/subfolder", "/upstream/subfolder", {hello: "world"});
		});
		it("/proxy13/subproxy/subfolder/ {hello:'world'}", async function () {
			await assertPost(requests, "json", "/proxy13/subproxy/subfolder/", "/upstream/subfolder/", {hello: "world"});
		});
	});
});

describe("local /proxy14/subproxy/, proxy_pass http://test.local:3000/upstream", function () {
	describe("GET", function () {
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
		it("/proxy14/subproxy", async function () {
			await assertGetRedirect(requests, "/proxy14/subproxy", "/proxy14/subproxy/", {});
		});
		it("/proxy14/subproxy/", async function () {
			await assertGet(requests, "/proxy14/subproxy/", "/upstream", {});
		});
		it("/proxy14/subproxy/subfolder", async function () {
			await assertGet(requests, "/proxy14/subproxy/subfolder", "/upstreamsubfolder", {});
		});
		it("/proxy14/subproxy/subfolder/", async function () {
			await assertGet(requests, "/proxy14/subproxy/subfolder/", "/upstreamsubfolder/", {});
		});
		it("/proxy14/subproxy {hello:'world'}", async function () {
			await assertGetRedirect(requests, "/proxy14/subproxy", "/proxy14/subproxy/?hello=world", {hello: "world"});
		});
		it("/proxy14/subproxy/ {hello:'world'}", async function () {
			await assertGet(requests, "/proxy14/subproxy/", "/upstream", {hello: "world"});
		});
		it("/proxy14/subproxy/subfolder {hello:'world'}", async function () {
			await assertGet(requests, "/proxy14/subproxy/subfolder", "/upstreamsubfolder", {hello: "world"});
		});
		it("/proxy14/subproxy/subfolder/ {hello:'world'}", async function () {
			await assertGet(requests, "/proxy14/subproxy/subfolder/", "/upstreamsubfolder/", {hello: "world"});
		});
	});
	describe("POST (application/x-www-form-urlencoded)", function () {
		let requests = [];
		let server;
		beforeEach("Start express", function(){
			const app = express();
			requests = [];
			app.use(express.urlencoded({ extended: true }));
			app.use(log.bind(null, requests));
			server = app.listen(3000);
		});
		afterEach("Stop express", function(){
			server.close();
			server = undefined;
		});
		it("/proxy14/subproxy", async function () {
			await assertPostRedirect(requests, "form", "/proxy14/subproxy",  "/proxy14/subproxy/", {});
		});
		it("/proxy14/subproxy/", async function () {
			await assertPost(requests, "form", "/proxy14/subproxy/", "/upstream", {});
		});
		it("/proxy14/subproxy/subfolder", async function () {
			await assertPost(requests, "form", "/proxy14/subproxy/subfolder", "/upstreamsubfolder", {});
		});
		it("/proxy14/subproxy/subfolder/", async function () {
			await assertPost(requests, "form", "/proxy14/subproxy/subfolder/", "/upstreamsubfolder/", {});
		});
		it("/proxy14/subproxy {hello:'world'}", async function () {
			await assertPostRedirect(requests, "form", "/proxy14/subproxy", "/proxy14/subproxy/", {hello: "world"});
		});
		it("/proxy14/subproxy/ {hello:'world'}", async function () {
			await assertPost(requests, "form", "/proxy14/subproxy/", "/upstream", {hello: "world"});
		});
		it("/proxy14/subproxy/subfolder {hello:'world'}", async function () {
			await assertPost(requests, "form", "/proxy14/subproxy/subfolder", "/upstreamsubfolder", {hello: "world"});
		});
		it("/proxy14/subproxy/subfolder/ {hello:'world'}", async function () {
			await assertPost(requests, "form", "/proxy14/subproxy/subfolder/", "/upstreamsubfolder/", {hello: "world"});
		});
	});
	describe("POST (application/json)", function () {
		let requests = [];
		let server;
		beforeEach("Start express", function(){
			const app = express();
			requests = [];
			app.use(express.json()); // application/json
			app.use(log.bind(null, requests));
			server = app.listen(3000);
		});
		afterEach("Stop express", function(){
			server.close();
			server = undefined;
		});
		it("/proxy14/subproxy", async function () {
			await assertPostRedirect(requests, "json", "/proxy14/subproxy", "/proxy14/subproxy/", {});
		});
		it("/proxy14/subproxy/", async function () {
			await assertPost(requests, "json", "/proxy14/subproxy/", "/upstream", {});
		});
		it("/proxy14/subproxy/subfolder", async function () {
			await assertPost(requests, "json", "/proxy14/subproxy/subfolder", "/upstreamsubfolder", {});
		});
		it("/proxy14/subproxy/subfolder/", async function () {
			await assertPost(requests, "json", "/proxy14/subproxy/subfolder/", "/upstreamsubfolder/", {});
		});
		it("/proxy14/subproxy {hello:'world'}", async function () {
			await assertPostRedirect(requests, "json", "/proxy14/subproxy", "/proxy14/subproxy/", {hello: "world"});
		});
		it("/proxy14/subproxy/ {hello:'world'}", async function () {
			await assertPost(requests, "json", "/proxy14/subproxy/", "/upstream", {hello: "world"});
		});
		it("/proxy14/subproxy/subfolder {hello:'world'}", async function () {
			await assertPost(requests, "json", "/proxy14/subproxy/subfolder", "/upstreamsubfolder", {hello: "world"});
		});
		it("/proxy14/subproxy/subfolder/ {hello:'world'}", async function () {
			await assertPost(requests, "json", "/proxy14/subproxy/subfolder/", "/upstreamsubfolder/", {hello: "world"});
		});
	});
});

describe("local /proxy15/subproxy, proxy_pass http://test.local:3000/upstream/", function () {
	describe("GET", function () {
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
		it("/proxy15/subproxy", async function () {
			await assertGet(requests, "/proxy15/subproxy", "/upstream/", {});
		});
		it("/proxy15/subproxy/", async function () {
			await assertGet(requests, "/proxy15/subproxy/", "/upstream//", {});
		});
		it("/proxy15/subproxy/subfolder", async function () {
			await assertGet(requests, "/proxy15/subproxy/subfolder", "/upstream//subfolder", {});
		});
		it("/proxy15/subproxy/subfolder/", async function () {
			await assertGet(requests, "/proxy15/subproxy/subfolder/", "/upstream//subfolder/", {});
		});
		it("/proxy15/subproxy {hello:'world'}", async function () {
			await assertGet(requests, "/proxy15/subproxy", "/upstream/", {hello: "world"});
		});
		it("/proxy15/subproxy/ {hello:'world'}", async function () {
			await assertGet(requests, "/proxy15/subproxy/", "/upstream//", {hello: "world"});
		});
		it("/proxy15/subproxy/subfolder {hello:'world'}", async function () {
			await assertGet(requests, "/proxy15/subproxy/subfolder", "/upstream//subfolder", {hello: "world"});
		});
		it("/proxy15/subproxy/subfolder/ {hello:'world'}", async function () {
			await assertGet(requests, "/proxy15/subproxy/subfolder/", "/upstream//subfolder/", {hello: "world"});
		});
	});
	describe("POST (application/x-www-form-urlencoded)", function () {
		let requests = [];
		let server;
		beforeEach("Start express", function(){
			const app = express();
			requests = [];
			app.use(express.urlencoded({ extended: true }));
			app.use(log.bind(null, requests));
			server = app.listen(3000);
		});
		afterEach("Stop express", function(){
			server.close();
			server = undefined;
		});
		it("/proxy15/subproxy", async function () {
			await assertPost(requests, "form", "/proxy15/subproxy",  "/upstream/", {});
		});
		it("/proxy15/subproxy/", async function () {
			await assertPost(requests, "form", "/proxy15/subproxy/", "/upstream//", {});
		});
		it("/proxy15/subproxy/subfolder", async function () {
			await assertPost(requests, "form", "/proxy15/subproxy/subfolder", "/upstream//subfolder", {});
		});
		it("/proxy15/subproxy/subfolder/", async function () {
			await assertPost(requests, "form", "/proxy15/subproxy/subfolder/", "/upstream//subfolder/", {});
		});
		it("/proxy15/subproxy {hello:'world'}", async function () {
			await assertPost(requests, "form", "/proxy15/subproxy", "/upstream/", {hello: "world"});
		});
		it("/proxy15/subproxy/ {hello:'world'}", async function () {
			await assertPost(requests, "form", "/proxy15/subproxy/", "/upstream//", {hello: "world"});
		});
		it("/proxy15/subproxy/subfolder {hello:'world'}", async function () {
			await assertPost(requests, "form", "/proxy15/subproxy/subfolder", "/upstream//subfolder", {hello: "world"});
		});
		it("/proxy15/subproxy/subfolder/ {hello:'world'}", async function () {
			await assertPost(requests, "form", "/proxy15/subproxy/subfolder/", "/upstream//subfolder/", {hello: "world"});
		});
	});
	describe("POST (application/json)", function () {
		let requests = [];
		let server;
		beforeEach("Start express", function(){
			const app = express();
			requests = [];
			app.use(express.json()); // application/json
			app.use(log.bind(null, requests));
			server = app.listen(3000);
		});
		afterEach("Stop express", function(){
			server.close();
			server = undefined;
		});
		it("/proxy15/subproxy", async function () {
			await assertPost(requests, "json", "/proxy15/subproxy", "/upstream/", {});
		});
		it("/proxy15/subproxy/", async function () {
			await assertPost(requests, "json", "/proxy15/subproxy/", "/upstream//", {});
		});
		it("/proxy15/subproxy/subfolder", async function () {
			await assertPost(requests, "json", "/proxy15/subproxy/subfolder", "/upstream//subfolder", {});
		});
		it("/proxy15/subproxy/subfolder/", async function () {
			await assertPost(requests, "json", "/proxy15/subproxy/subfolder/", "/upstream//subfolder/", {});
		});
		it("/proxy15/subproxy {hello:'world'}", async function () {
			await assertPost(requests, "json", "/proxy15/subproxy", "/upstream/", {hello: "world"});
		});
		it("/proxy15/subproxy/ {hello:'world'}", async function () {
			await assertPost(requests, "json", "/proxy15/subproxy/", "/upstream//", {hello: "world"});
		});
		it("/proxy15/subproxy/subfolder {hello:'world'}", async function () {
			await assertPost(requests, "json", "/proxy15/subproxy/subfolder", "/upstream//subfolder", {hello: "world"});
		});
		it("/proxy15/subproxy/subfolder/ {hello:'world'}", async function () {
			await assertPost(requests, "json", "/proxy15/subproxy/subfolder/", "/upstream//subfolder/", {hello: "world"});
		});
	});
});

describe("local /proxy16/subproxy/, proxy_pass http://test.local:3000/upstream/", function () {
	describe("GET", function () {
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
		it("/proxy16/subproxy", async function () {
			await assertGetRedirect(requests, "/proxy16/subproxy", "/proxy16/subproxy/", {});
		});
		it("/proxy16/subproxy/", async function () {
			await assertGet(requests, "/proxy16/subproxy/", "/upstream/", {});
		});
		it("/proxy16/subproxy/subfolder", async function () {
			await assertGet(requests, "/proxy16/subproxy/subfolder", "/upstream/subfolder", {});
		});
		it("/proxy16/subproxy/subfolder/", async function () {
			await assertGet(requests, "/proxy16/subproxy/subfolder/", "/upstream/subfolder/", {});
		});
		it("/proxy16/subproxy {hello:'world'}", async function () {
			await assertGetRedirect(requests, "/proxy16/subproxy", "/proxy16/subproxy/?hello=world", {hello: "world"});
		});
		it("/proxy16/subproxy/ {hello:'world'}", async function () {
			await assertGet(requests, "/proxy16/subproxy/", "/upstream/", {hello: "world"});
		});
		it("/proxy16/subproxy/subfolder {hello:'world'}", async function () {
			await assertGet(requests, "/proxy16/subproxy/subfolder", "/upstream/subfolder", {hello: "world"});
		});
		it("/proxy16/subproxy/subfolder/ {hello:'world'}", async function () {
			await assertGet(requests, "/proxy16/subproxy/subfolder/", "/upstream/subfolder/", {hello: "world"});
		});
	});
	describe("POST (application/x-www-form-urlencoded)", function () {
		let requests = [];
		let server;
		beforeEach("Start express", function(){
			const app = express();
			requests = [];
			app.use(express.urlencoded({ extended: true }));
			app.use(log.bind(null, requests));
			server = app.listen(3000);
		});
		afterEach("Stop express", function(){
			server.close();
			server = undefined;
		});
		it("/proxy16/subproxy", async function () {
			await assertPostRedirect(requests, "form", "/proxy16/subproxy",  "/proxy16/subproxy/", {});
		});
		it("/proxy16/subproxy/", async function () {
			await assertPost(requests, "form", "/proxy16/subproxy/", "/upstream/", {});
		});
		it("/proxy16/subproxy/subfolder", async function () {
			await assertPost(requests, "form", "/proxy16/subproxy/subfolder", "/upstream/subfolder", {});
		});
		it("/proxy16/subproxy/subfolder/", async function () {
			await assertPost(requests, "form", "/proxy16/subproxy/subfolder/", "/upstream/subfolder/", {});
		});
		it("/proxy16/subproxy {hello:'world'}", async function () {
			await assertPostRedirect(requests, "form", "/proxy16/subproxy", "/proxy16/subproxy/", {hello: "world"});
		});
		it("/proxy16/subproxy/ {hello:'world'}", async function () {
			await assertPost(requests, "form", "/proxy16/subproxy/", "/upstream/", {hello: "world"});
		});
		it("/proxy16/subproxy/subfolder {hello:'world'}", async function () {
			await assertPost(requests, "form", "/proxy16/subproxy/subfolder", "/upstream/subfolder", {hello: "world"});
		});
		it("/proxy16/subproxy/subfolder/ {hello:'world'}", async function () {
			await assertPost(requests, "form", "/proxy16/subproxy/subfolder/", "/upstream/subfolder/", {hello: "world"});
		});
	});
	describe("POST (application/json)", function () {
		let requests = [];
		let server;
		beforeEach("Start express", function(){
			const app = express();
			requests = [];
			app.use(express.json()); // application/json
			app.use(log.bind(null, requests));
			server = app.listen(3000);
		});
		afterEach("Stop express", function(){
			server.close();
			server = undefined;
		});
		it("/proxy16/subproxy", async function () {
			await assertPostRedirect(requests, "json", "/proxy16/subproxy", "/proxy16/subproxy/", {});
		});
		it("/proxy16/subproxy/", async function () {
			await assertPost(requests, "json", "/proxy16/subproxy/", "/upstream/", {});
		});
		it("/proxy16/subproxy/subfolder", async function () {
			await assertPost(requests, "json", "/proxy16/subproxy/subfolder", "/upstream/subfolder", {});
		});
		it("/proxy16/subproxy/subfolder/", async function () {
			await assertPost(requests, "json", "/proxy16/subproxy/subfolder/", "/upstream/subfolder/", {});
		});
		it("/proxy16/subproxy {hello:'world'}", async function () {
			await assertPostRedirect(requests, "json", "/proxy16/subproxy", "/proxy16/subproxy/", {hello: "world"});
		});
		it("/proxy16/subproxy/ {hello:'world'}", async function () {
			await assertPost(requests, "json", "/proxy16/subproxy/", "/upstream/", {hello: "world"});
		});
		it("/proxy16/subproxy/subfolder {hello:'world'}", async function () {
			await assertPost(requests, "json", "/proxy16/subproxy/subfolder", "/upstream/subfolder", {hello: "world"});
		});
		it("/proxy16/subproxy/subfolder/ {hello:'world'}", async function () {
			await assertPost(requests, "json", "/proxy16/subproxy/subfolder/", "/upstream/subfolder/", {hello: "world"});
		});
	});
});
