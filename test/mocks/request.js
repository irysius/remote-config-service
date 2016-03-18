var URL = require('url');
// For our application, we assume the endpoint is consistently called one way.
// request(options, callback);
var dnsError = new Error('getaddrinfo ENOTFOUND');
dnsError.code = 'ENOTFOUND';
dnsError.errno = 'ENOTFOUND';
dnsError.syscall = 'getaddrinfo';

var _404 = {
	statusCode: 404,
	statusMessage: 'Not Found'
};
var _403 = {
	statusCode: 403,
	statusMessage: 'Forbidden'	
};
var _400 = {
	statusCode: 400,
	statusMessage: 'Bad Request'	
};
var _200 = {
	statusCode: 200,
	statusMessage: 'OK'	
};

function request(options, callback) {
	var temp = matchRequest(options);
	var payload = temp[0];
	var error = temp[1];
	if (error) {
		console.log(error);
		switch (error) {
			case '400':
				callback(null, _400, { error: 'bad request' });
				break;
			case '404':
				callback(null, _404, { error: 'not found' });
				break;
			case '403':
				callback(null, _403, { error: 'forbidden' });
				break;
			case 'DNS':
			default:
				callback(dnsError);
				break;
		}	
	} else {
		callback(null, _200, payload);
	}
}
function matchRequest(options) {
	var payload, error, content;
	if (options.method === 'POST') {
		var url = options.uri || options.url;
		var urlObject = URL.parse(url);
		var hostname = urlObject.hostname;
		var path = urlObject.path;
		
		if (hostname !== 'localhost') {
			error = 'DNS';
		} else if (!options.body || !options.body.environment || 
			!options.body.access_token || !options.body.application_key) 
		{
			error = '400';
		} else {
			switch (hostname + path) {
				case 'localhost/remote-config':
					if (options.body.access_token !== 'a1s2d3f4') {
						error = '403';
					} else {
						content = matchEnvironment(options.body.environment, options.body.application_key);
						if (content) {
							payload = {
								server: 'remote-config',
								content: content	
							};
						} else {
							payload = {};
						}
					}
					break;
				case 'localhost/alternate-config':
					if (options.body.access_token !== 'f4d3s2a1') {
						error = '403';
					} else {
						content = matchEnvironment(options.body.environment, options.body.application_key);
						if (content) {
							payload = {
								server: 'alternate-config',
								content: content	
							};
						} else {
							payload = {};
						}
					}
					break;
				default:
					error = '404';
					break;
			}	
		}
	}
	return [payload, error];
}
function matchEnvironment(env, appKey) {
	/*
		value table:
		env\appKey	alpha	beta	charlie
		test 		001 	002 	003
		sample 		004 	005 	006
		debug 		007 	008 	009
	*/
	env = env.toLowerCase();
	appKey = appKey.toLowerCase();
	switch (env) {
		case 'test':
			return matchAppKey(appKey, ['001', '002', '003']);
		case 'sample':
			return matchAppKey(appKey, ['004', '005', '006']);
		case 'debug':
			return matchAppKey(appKey, ['007', '008', '009']);
	}
	return null;
}
function matchAppKey(appKey, values) {
	switch (appKey) {
		case 'alpha':
			return values[0];
		case 'beta':
			return values[1];
		case 'charlie':
			return values[2];
	}
	return null;
}
module.exports = request;