"use strict";
const got = require("got");

async function auth(url, username, password, data){
	const response = await got.get(url, {
		username,
		password,
		data,
		retry: 0,
		followRedirect: false,
		throwHttpErrors: false
	});
	return {
		statusCode: response.statusCode,
		headers: response.headers,
		body: response.body
	};
}

async function get(url, data){
	const response = await got.get(url, {
		retry: 0,
		searchParams: data,
		followRedirect: false,
		throwHttpErrors: false
	});
	return {
		statusCode: response.statusCode,
		headers: response.headers,
		body: response.body
	};
}

// form or json
async function post(url, type = "form", data){
	const options = {
		retry: 0,
		followRedirect: false,
		throwHttpErrors: false
	}
	options[type] = data;
	const response = await got.post(url, options);
	return {
		statusCode: response.statusCode,
		headers: response.headers,
		body: response.body
	};
}

module.exports.auth = auth;
module.exports.get = get;
module.exports.post = post;
