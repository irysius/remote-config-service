// For our application, we assume the endpoint is consistently called one way.
function request(options, callback) {
	var temp = matchRequest(options);
	var payload = temp[0];
	var error = temp[1];
	if (error) {
		switch (error) {
			case '404':
				break;
			case '403':
				break;
			case 'DNS':
			default:
				break;
		}	
	} else {
		callback(null, {}, {});
	}
}
function matchRequest(options) {
	var payload, error, content;
	if (options.method === 'POST') {
		var url = options.uri || options.url;
		switch (url) {
			case 'http://localhost/remote-config':
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
			case 'http://localhost/alternate-config|f4d3s2a1':
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
				error = 'DNS';
				break;
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