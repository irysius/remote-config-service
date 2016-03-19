'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

/* global process */
var _ = require('lodash');
var HttpRequest = require('request');
var ENDPOINT = 'IRY_REMOTE_ENDPOINT';
var ACCESSTOKEN = 'IRY_REMOTE_ACCESS_TOKEN';
var ENVIRONMENT = 'IRY_REMOTE_ENVIRONMENT';

function defaultInitialLocator() {
	var info = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

	var values = {};
	if (process.env[ENDPOINT]) {
		values.endpoint = process.env[ENDPOINT];
	}
	if (process.env[ACCESSTOKEN]) {
		values.access_token = process.env[ACCESSTOKEN];
	}
	if (process.env[ENVIRONMENT]) {
		values.environment = process.env[ENVIRONMENT];
	}
	return _.assign(info, values);
}
function defaultJitLocator() {
	var info = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
	var config = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

	var values = {};
	if (config.remote_config) {
		var remote_config = config.remote_config;
		if (remote_config.endpoint) {
			values.endpoint = remote_config.endpoint;
		}
		if (remote_config.access_token) {
			values.access_token = remote_config.access_token;
		}
		if (remote_config.environment) {
			values.environment = remote_config.environment;
		}
		if (remote_config.application_key) {
			values.application_key = remote_config.application_key;
		}
	}
	if (config.application_key) {
		values.application_key = config.application_key;
	}
	return _.assign(info, values);
}

function RemoteConfigService() {
	var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

	var _ref$initialLocator = _ref.initialLocator;
	var initialLocator = _ref$initialLocator === undefined ? null : _ref$initialLocator;
	var _ref$jitLocator = _ref.jitLocator;
	var jitLocator = _ref$jitLocator === undefined ? null : _ref$jitLocator;

	var il = _.isFunction(initialLocator) ? initialLocator : defaultInitialLocator;
	var jl = _.isFunction(jitLocator) ? jitLocator : defaultJitLocator;

	var info = {};
	info = il(info);

	function validate(info) {
		return Promise.resolve().then(function () {
			if (!info || !info.endpoint || !info.access_token || !info.environment || !info.application_key) {
				var error = new Error('Missing required info for connecting to remote service.');
				error.value = info;
				throw error;
			} else {
				return info;
			}
		});
	}

	function connect(options) {
		var validStatusCodes = [200, 204];
		// Couple of restrictions.
		// We must reject with an Error, we must return a json.
		return new Promise(function (resolve, reject) {
			HttpRequest(options, function (err, res, body) {
				if (err) {
					reject(err);
				} else if (validStatusCodes.indexOf(res.statusCode) === -1) {
					var error = new Error('Error connecting to remote service.');
					error.statusCode = res.statusCode;
					error.value = forceJson(body);
					reject(error);
				} else {
					var _tryParseJson = tryParseJson(body);

					var _tryParseJson2 = _slicedToArray(_tryParseJson, 2);

					var ok = _tryParseJson2[0];
					var result = _tryParseJson2[1];

					if (ok) {
						resolve(result);
					} else {
						var _error = new Error('Remote service returned with a non-json response.');
						_error.value = body;
						reject(_error);
					}
				}
			});
		});
	}

	function forceJson(value) {
		try {
			var json = JSON.parse(value);
			return json;
		} catch (e) {
			return { message: value };
		}
	}
	function tryParseJson(value) {
		if (_.isString(value)) {
			try {
				var json = JSON.parse(value);
				return [true, json];
			} catch (e) {
				return [false];
			}
		} else {
			return [true, value || {}];
		}
	}

	function transform(config) {
		info = jl(info, config);
		console.log(info);
		return validate(info).then(function (info) {
			var options = {
				url: info.endpoint,
				method: 'POST',
				body: {
					access_token: info.access_token,
					environment: info.environment,
					application_key: info.application_key
				}
			};
			return connect(options);
		}).then(function (content) {
			return _.assign({}, config, content);
		});
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
