/* global describe, it, before, after, __dirname */
if (typeof Promise === 'undefined') {
	require('babel-polyfill');
	console.info('Using babel-polyfill');	
}

var proxyquire = require('proxyquire');

var expect = require('chai').expect;
var PATH = require('path');
var requestMock = require('./mocks/request');
var RemoteConfigService = proxyquire('./../dist/RemoteConfigService', {
	'request': requestMock
});
var configPath = PATH.resolve(__dirname, './configs');

describe('remote-config-service', function () {
	it('is expected to throw if some connection info is missing', function (done) {
		// This is NOT a real endpoint. Do not try to provide this.
		process.env.IRY_REMOTE_ENDPOINT = 'http://localhost/remote-config';
		process.env.IRY_REMOTE_ACCESS_TOKEN = 'a1s2d3f4';
		process.env.IRY_REMOTE_ENVIRONMENT = 'test';
		
		var remoteConfigService = RemoteConfigService();
		var defaultConfig = { alpha: 'bravo', omega: 'gamma' };
		var error;
		Promise.resolve().then(function () {
			return remoteConfigService.transform(defaultConfig);	
		}).catch(function (err) {
			error = err;
		}).then(function () {
			expect(error).to.exist;
		}).then(function () {
			done();
		}).catch(function (err) {
			done(err);
		});
	});
	it('is expected to throw if remote cannot be reached', function (done) {
		// This is NOT a real endpoint. Do not try to provide this.
		process.env.IRY_REMOTE_ENDPOINT = 'http://tsohlacol/remote-config';
		process.env.IRY_REMOTE_ACCESS_TOKEN = 'a1s2d3f4';
		process.env.IRY_REMOTE_ENVIRONMENT = 'test';
		
		var remoteConfigService = RemoteConfigService();
		var defaultConfig = { alpha: 'bravo', omega: 'gamma', application_key: 'beta' };
		var error;
		Promise.resolve().then(function () {
			return remoteConfigService.transform(defaultConfig);	
		}).catch(function (err) {
			error = err;
		}).then(function () {
			expect(error).to.exist;
			expect(error.code).to.equal('ENOTFOUND');
		}).then(function () {
			done();
		}).catch(function (err) {
			done(err);
		});
	});
	it('is expected to throw if remote access is rejected', function (done) {
		// This is NOT a real endpoint. Do not try to provide this.
		process.env.IRY_REMOTE_ENDPOINT = 'http://localhost/remote-config';
		process.env.IRY_REMOTE_ACCESS_TOKEN = 'f4d3s2a1';
		process.env.IRY_REMOTE_ENVIRONMENT = 'test';
		
		var remoteConfigService = RemoteConfigService();
		var defaultConfig = { alpha: 'bravo', omega: 'gamma', application_key: 'beta' };
		var error;
		Promise.resolve().then(function () {
			return remoteConfigService.transform(defaultConfig);	
		}).catch(function (err) {
			error = err;
		}).then(function () {
			expect(error).to.exist;
		}).then(function () {
			done();
		}).catch(function (err) {
			done(err);
		});
	});
	it('is expected to merge configuration from remote', function (done) {
		// This is NOT a real endpoint. Do not try to provide this.
		process.env.IRY_REMOTE_ENDPOINT = 'http://localhost/remote-config';
		process.env.IRY_REMOTE_ACCESS_TOKEN = 'a1s2d3f4';
		process.env.IRY_REMOTE_ENVIRONMENT = 'sample';
		
		var remoteConfigService = RemoteConfigService();
		var defaultConfig = { alpha: 'bravo', omega: 'gamma', application_key: 'beta' };
		var targetConfig = {
			alpha: 'bravo', omega: 'gamma', application_key: 'beta',
			server: 'remote-config',
			content: '005'
		};
		
		Promise.resolve().then(function () {
			return remoteConfigService.transform(defaultConfig);	
		}).then(function (newConfig) {
			expect(newConfig).to.eql(targetConfig);
		}).then(function () {
			done();
		}).catch(function (err) {
			done(err);
		});
	});
	it('is expected to use alternate locators', function (done) {
		// This is NOT a real endpoint. Do not try to provide this.
		process.env.IRY_REMOTE_ENDPOINT = 'http://localhost/remote-config';
		process.env.IRY_REMOTE_ACCESS_TOKEN = 'f4d3s2a1';
		process.env.IRY_REMOTE_ENVIRONMENT = 'debug';
		
		function initialLocator(info) {
			var newInfo = RemoteConfigService.defaults.initialLocator(info);
			newInfo.endpoint = 'http://localhost/alternate-config';
			return newInfo;
		}
		function jitLocator(info, config) {
			info.application_key = 'charlie';
			info.environment = 'debug';
			return info;
		}
		
		var remoteConfigService = RemoteConfigService({ initialLocator: initialLocator, jitLocator: jitLocator });
		var defaultConfig = { alpha: 'bravo', omega: 'gamma', application_key: 'beta' };
		var targetConfig = {
			alpha: 'bravo', omega: 'gamma', application_key: 'beta',
			server: 'alternate-config',
			content: '009' // debug charlie
		};
		
		Promise.resolve().then(function () {
			return remoteConfigService.transform(defaultConfig);	
		}).then(function (newConfig) {
			expect(newConfig).to.eql(targetConfig);
		}).then(function () {
			done();
		}).catch(function (err) {
			done(err);
		});
	});
});