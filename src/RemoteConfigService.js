/* global process */
var _ = require('lodash');
var HttpRequest = require('request');
const ENDPOINT = 'IRY_REMOTE_ENDPOINT';
const ACCESSTOKEN = 'IRY_REMOTE_ACCESS_TOKEN';
const ENVIRONMENT = 'IRY_REMOTE_ENVIRONMENT';

function defaultInitialLocator(info = {}) {
	let values = {};
	if (process.env[ENDPOINT]) { values.endpoint = process.env[ENDPOINT]; }
	if (process.env[ACCESSTOKEN]) { values.access_token = process.env[ACCESSTOKEN]; }
	if (process.env[ENVIRONMENT]) { values.environment = process.env[ENVIRONMENT]; }
	return _.assign(info, values);	
}
function defaultJitLocator(config = {}, info = {}) {
	let values = {};
	if (config.remote_config) {
		let remote_config = config.remote_config;
		if (remote_config.endpoint) { values.endpoint = remote_config.endpoint; }
		if (remote_config.access_token) { values.access_token = remote_config.access_token; }
		if (remote_config.environment) { values.environment = remote_config.environment; }
		if (remote_config.application_key) { values.application_key = remote_config.application_key; }
	}
	if (config.application_key) { values.application_key = config.application_key; }
	return _.assign(info, values);
}

function RemoteConfigService({ initialLocator, jitLocator }) {
	let il = _.isFunction(initialLocator) ? initialLocator : defaultInitialLocator;
	let jl = _.isFunction(jitLocator) ? jitLocator : defaultJitLocator;
	
	let info = {};
	info = il(info);
	
	function validate(info) {
		
	}
	
	function connect(options) {
		var validStatusCodes = [200, 204];
		// Couple of restrictions. 
		// We must reject with an Error, we must return a json.
		return new Promise((resolve, reject) => {
			HttpRequest(options, (err, res, body) => {
				if (err) { reject(err); }
				else if (validStatusCodes.indexOf(res.statusCode) === -1) {
					let error = new Error('Error connecting to remote service.');
					error.statusCode = res.statusCode;
					error.value = forceJson(body);
					reject(error);
				} else {
					let [ok, result] = tryParseJson(body);
					if (ok) {
						resolve(result);
					} else {
						let error = new Error('Remote service returned with a non-json response.');
						error.value = body;
						reject(error);
					}
				}
			});
		});
	}
	
	function forceJson(value) {
		try {
			let json = JSON.parse(value);
			return json;
		} catch (e) {
			return { message: value };
		}
	}
	function tryParseJson(value) {
		if (_.isString(value)) {
			try {
				let json = JSON.parse(value);
				return [true, json];
			} catch (e) {
				return [false];
			}
		} else {
			return [true, value || {}];
		}
	}
	
	function transform(config) {
		
	}
	
	return {
		transform: transform	
	};
}

RemoteConfigService.defaults = {
	initialLocator: defaultInitialLocator,
	jitLocator: defaultJitLocator
};

module.exports = RemoteConfigService;