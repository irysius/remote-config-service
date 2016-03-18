/* global describe, it, before, after */
if (typeof Promise === 'undefined') {
	require('babel-polyfill');
	console.info('Using babel-polyfill');
}
var HttpRequest = require('./mocks/request');
var expect = require('chai').expect;

function HttpRequestAsync(options) {
	return new Promise(function (resolve, reject) {
		HttpRequest(options, function (err, res, body) {
			if (err) { reject(err); }
			else if (res.statusCode !== 200) {
				reject({ statusCode: res.statusCode });
			} else {
				resolve(body);
			}
		});
	});
}

describe('mock-request', function () {
	it("is expected to throw a ENOTFOUND error if the host doesn't exist", function (done) {
		var options = {
			url: 'http://tsohlacol/remote-config',
			method: 'POST'
		};
		HttpRequestAsync(options).catch(function (error) {
				expect(error.code).to.equal('ENOTFOUND');
			}).then(function () {
				done();
			}).catch(function (err) {
				done(err);
			});
	});
	it('is expected to return a 404 if the endpoint is wrong', function (done) {
		var options = {
			url: 'http://localhost/remote-config',
			method: 'POST',
			body: {
				access_token: 'a1s2d3f4',
				environment: 'debug',
				application_key: 'beta'
			}
		};
		HttpRequestAsync(options).catch(function (error) {
				expect(error.statusCode).to.equal(404);
			}).then(function () {
				done();
			}).catch(function (err) {
				done(err);
			});
	});
	it('is expected to return a 403 if the request is not authorized', function (done) {
		var options = {
			url: 'http://localhost/remote-config',
			method: 'POST',
			body: {
				access_token: 'f4d3s2a1',
				environment: 'debug',
				application_key: 'beta'
			}
		};
		HttpRequestAsync(options).catch(function (error) {
				expect(error.statusCode).to.equal(403);
			}).then(function () {
				done();
			}).catch(function (err) {
				done(err);
			});
	});
	it('is expected to return a 400 if the request is missing parameters', function (done) {
		var options = {
			url: 'http://localhost/remote-config',
			method: 'POST',
			body: {
				access_token: 'a1s2d3f4'
			}
		};
		HttpRequestAsync(options).catch(function (error) {
				expect(error.statusCode).to.equal(400);
			}).then(function () {
				done();
			}).catch(function (err) {
				done(err);
			});
	});
	it('is expected to return a code on a valid request', function (done) {
		var options = {
			url: 'http://localhost/remote-config',
			method: 'POST',
			body: {
				access_token: 'a1s2d3f4',
				environment: 'debug',
				application_key: 'beta'
			}
		};
		var expected = {
			server: 'remote-config',
			content: '008'
		};
		HttpRequestAsync(options).then(function (payload) {
				expect(payload).to.eql(expected);
			}).then(function () {
				done();
			}).catch(function (err) {
				done(err);
			});
	});
	it("is expected to return an empty object request that doesn't match", function (done) {
		var options = {
			url: 'http://localhost/remote-config',
			method: 'POST',
			body: {
				access_token: 'a1s2d3f4',
				environment: 'debug',
				application_key: 'delta'
			}
		};
		var expected = {};
		HttpRequestAsync(options).then(function (payload) {
				expect(payload).to.eql(expected);
			}).then(function () {
				done();
			}).catch(function (err) {
				done(err);
			});
	});
});