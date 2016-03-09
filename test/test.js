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

// This is NOT a real endpoint. Do not try to provide this.
process.env.IRY_REMOTE_ENDPOINT = 'http://localhost/remote-config';
process.env.IRY_REMOTE_ACCESS_TOKEN = 'a1s2d3f4';
process.env.IRY_REMOTE_ENVIRONMENT = 'test';

describe('remote-config-service', function () {
	it('is expected to throw if some connection info is missing', function () {
		
	});
	it('is expected to throw if remote cannot be reached', function () {
		
	});
	it('is expected to throw if remote access is rejected', function () {
		
	});
	it('is expected to merge configuration from remote', function () {
		
	});
	it('is expected to use alternate locators', function () {
		
	});
});